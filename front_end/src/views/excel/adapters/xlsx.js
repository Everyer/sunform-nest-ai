/**
 * xlsx ↔ Univer 双向适配器
 *
 * 能力：
 *  - 单元格值（字符串 / 数字 / 布尔 / 日期）
 *  - 公式
 *  - 样式（字体/字号/颜色/粗斜/下划线/删除线/背景/边框/对齐/换行/数字格式）
 *  - 合并单元格
 *  - 列宽 / 行高
 *  - 多 sheet
 *
 * 用 exceljs 做读写，xlsx-js-style 读回会丢自定义样式，已弃用。
 */

import ExcelJS from 'exceljs'
import * as XLSX from 'xlsx'

// ============================================================
// 通用工具
// ============================================================

const BORDER_STYLE_MAP = {
  thin: 1, hair: 1, medium: 2, thick: 5, dashed: 7, dotted: 8,
  double: 9, dashDot: 11, dashDotDot: 12, slantDashDot: 13
}
const REVERSE_BORDER = Object.fromEntries(
  Object.entries(BORDER_STYLE_MAP).map(([k, v]) => [v, k])
)

const ALIGN_H = { left: 1, center: 2, right: 3, general: 0, fill: 4, justify: 6, centerContinuous: 5 }
const ALIGN_V = { top: 1, middle: 2, bottom: 3 }  // VerticalAlign enum: UNSPECIFIED=0, TOP=1, MIDDLE=2, BOTTOM=3
const REVERSE_ALIGN_H = Object.fromEntries(Object.entries(ALIGN_H).map(([k, v]) => [v, k]))
const REVERSE_ALIGN_V = Object.fromEntries(Object.entries(ALIGN_V).map(([k, v]) => [v, k]))

// Office 主题色 → RGB
// OOXML 规范：0=lt1(白), 1=dk1(黑), 2=lt2(浅灰), 3=dk2(深灰), 4-9=accent1-6
const THEME_RGB = {
  0: '#FFFFFF', 1: '#000000', 2: '#E7E6E6', 3: '#44546A',
  4: '#4472C4', 5: '#ED7D31', 6: '#A5A5A5', 7: '#70AD47',
  8: '#5B9BD5', 9: '#70AD47', 10: '#0563C1', 11: '#954F72'
}
const INDEXED_RGB = {
  8: '#000000', 9: '#FFFFFF', 10: '#FF0000', 11: '#00FF00', 12: '#0000FF',
  13: '#FFFF00', 14: '#FF00FF', 15: '#00FFFF', 64: '#000000'
}

/**
 * 跨平台中文字体名归一化
 * xlsx 里写"仿宋_GB2312"在 macOS Chrome 没装这个字体，会 fallback 到苹方，跟 Windows 真仿宋字形差很多
 * 改成 macOS/Win 双自带字体（华文仿宋 / FangSong），没装时浏览器再走 generic family
 * Univer 的 ff 是单名字符串，所以优先 macOS 自带（开发环境是 mac），Win 用户装了 FangSong 也识别
 */
const FONT_NAME_MAP = {
  '仿宋_GB2312': 'STFangsong',
  '仿宋': 'STFangsong',
  'FangSong_GB2312': 'STFangsong',
  '黑体': 'STHeiti',
  'SimHei': 'STHeiti',
  '微软雅黑': 'PingFang SC',
  'Microsoft YaHei': 'PingFang SC',
  '宋体': 'STSong',
  'SimSun': 'STSong',
  '楷体_GB2312': 'STKaiti',
  '楷体': 'STKaiti',
  'KaiTi_GB2312': 'STKaiti'
}
function normalizeFontFamily (name) {
  if (!name) return name
  return FONT_NAME_MAP[name] || name
}

/**
 * exceljs color → hex rgb
 * 支持 argb / rgb / theme + tint / indexed
 */
function exceljsColorToRgb (color) {
  if (!color) return undefined
  if (color.argb) {
    const rgb = stripAlpha(color.argb)
    if (rgb && rgb !== '00000000') return '#' + rgb
    return undefined
  }
  if (color.theme !== undefined) {
    const base = THEME_RGB[color.theme]
    if (!base) return undefined
    if (color.tint === undefined || color.tint === 0) return base
    return applyTint(base, color.tint)
  }
  if (color.indexed !== undefined) {
    return INDEXED_RGB[color.indexed] || undefined
  }
  return undefined
}

/**
 * Office tint 算法：HSL 空间按比例向 0 或 1 拉亮度
 * tint > 0: L' = L * (1 - tint) + tint
 * tint < 0: L' = L * (1 + tint)
 */
function applyTint (hex, tint) {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  const [h, s, l] = rgbToHsl(r, g, b)
  let nl
  if (tint > 0) nl = l * (1 - tint) + tint
  else nl = l * (1 + tint)
  const [nr, ng, nb] = hslToRgb(h, s, Math.max(0, Math.min(1, nl)))
  return '#' + [nr, ng, nb].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase()
}
function rgbToHsl (r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s; const l = (max + min) / 2
  if (max === min) { h = 0; s = 0 }
  else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return [h, s, l]
}
function hslToRgb (h, s, l) {
  let r, g, b
  if (s === 0) { r = g = b = l }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return [r, g, b]
}

function stripAlpha (argb) {
  if (!argb) return undefined
  const s = String(argb).replace('#', '').toUpperCase()
  // exceljs 颜色格式是 ARGB（如 FFRRGGBB），8 位
  return s.length === 8 ? s.slice(2) : s
}
function withAlpha (rgb) {
  if (!rgb) return undefined
  const s = String(rgb).replace('#', '').toUpperCase()
  // 补 6 位到 8 位 ARGB（加 FF 不透明）
  return s.length === 6 ? 'FF' + s : s
}

// 列宽：exceljs width 单位是"字符数"，Univer 是 px(基于 7px/字符)，wch 也基于字符
function colW (wch) { return Math.round((wch || 8.43) * 7) }
function rowH (hpx) { return hpx || 15 }

// ============================================================
// 样式：exceljs → Univer
// ============================================================

/**
 * exceljs cell.style → Univer IStyleData
 */
function exceljsStyleToUniver (st) {
  if (!st) return null
  // Univer DEFAULT_STYLES.pd 是 {t:0,r:0,b:0,l:0}，单元格无内边距 → 文字贴边（真 Excel 是 t/b:1, l/r:2）
  // vt 默认为 0(UNSPECIFIED) → 行不自动垂直居中
  // 始终注入这些视觉默认，否则跟真 Excel 比起来挤、像缺气
  const out = {
    pd: { t: 1, r: 2, b: 1, l: 2 },
    vt: ALIGN_V.middle
  }

  if (st.font) {
    const f = st.font
    if (f.name) out.ff = normalizeFontFamily(f.name)
    if (f.size) out.fs = Math.round(f.size * 10) / 10
    if (f.bold) out.bl = 1
    if (f.italic) out.it = 1
    if (f.underline && f.underline !== 'none') out.ul = { s: 1 }
    if (f.strike) out.st = { s: 1 }
    if (f.color) {
      const rgb = exceljsColorToRgb(f.color)
      if (rgb) out.cl = { rgb }
    }
  }

  if (st.fill && st.fill.type === 'pattern' && st.fill.pattern === 'solid') {
    const rgb = exceljsColorToRgb(st.fill.fgColor)
    if (rgb) out.bg = { rgb }
  }

  if (st.border) {
    const bd = {}
    for (const side of ['top', 'bottom', 'left', 'right']) {
      const b = st.border[side]
      if (b && b.style && b.style !== 'none') {
        const rgb = exceljsColorToRgb(b.color) || '#000000'
        bd[side[0]] = {
          s: BORDER_STYLE_MAP[b.style] || 1,
          cl: { rgb }
        }
      }
    }
    if (Object.keys(bd).length) out.bd = bd
  }

  if (st.alignment) {
    const a = st.alignment
    if (a.horizontal && ALIGN_H[a.horizontal] !== undefined) out.ht = ALIGN_H[a.horizontal]
    if (a.vertical && ALIGN_V[a.vertical] !== undefined) out.vt = ALIGN_V[a.vertical]
    if (a.wrapText) out.tb = 3  // WrapStrategy.WRAP (0=UNSPECIFIED, 1=OVERFLOW, 2=CLIP, 3=WRAP)
    if (a.textRotation) out.tr = { a: a.textRotation, v: 0 }
  }

  if (st.numFmt) out.n = { pattern: st.numFmt }

  return out
}

// ============================================================
// 富文本：exceljs → Univer cell.p
// exceljs richText: [{ text, font?: { name, size, bold, italic, color: {argb} } }, ...]
// Univer  cell.p:   { id, body: { dataStream, textRuns: [{ st, ed, ts }] }, documentStyle }
// ============================================================

function richTextToCellP (richText, cellFont) {
  if (!Array.isArray(richText) || richText.length === 0) return undefined
  // Univer 段落分隔用 \r（不是 \n）
  // 参考 Univer 自己的 generateParagraphs：
  //   - paragraphs 数组只在 \r 位置建 {startIndex} 标记
  //   - 第一段（位置 0 到第一个 \r 之前）由 dataStream 隐含
  //   - textRuns 不覆盖 \r
  // 末尾追加 \r\n（参考 Univer 默认空 doc），dataStream 形如 "...\r\n"
  const segments = []
  for (const r of richText) {
    const font = r.font || cellFont
    const t = r.text || ''
    const parts = t.split('\n')
    parts.forEach((p, i) => {
      if (i > 0) segments.push({ break: true })
      if (p.length > 0) segments.push({ text: p, font })
    })
  }
  let dataStream = ''
  for (const s of segments) dataStream += s.break ? '\r' : s.text
  dataStream += '\r\n'  // Univer 默认 doc 的结尾
  const textRuns = []
  const paragraphs = []
  let pos = 0
  for (const s of segments) {
    if (s.break) {
      paragraphs.push({ startIndex: pos })
      pos += 1
    } else {
      const len = s.text.length
      if (len > 0) textRuns.push({ st: pos, ed: pos + len, ts: exceljsFontToTextStyle(s.font) })
      pos += len
    }
  }
  // 在 \n 位置加 sectionBreaks（与 Univer 空 doc 一致）
  const sectionBreaks = [{ startIndex: pos + 1 }]  // pos+1 = \n 位置（\r 在 pos）
  return {
    id: 'doc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    body: { dataStream, textRuns, paragraphs, sectionBreaks },
    documentStyle: {}
  }
}

function exceljsFontToTextStyle (f) {
  if (!f) return {}
  const ts = {}
  if (f.name) ts.ff = normalizeFontFamily(f.name)
  if (f.size) ts.fs = f.size
  if (f.bold) ts.bl = 1
  if (f.italic) ts.it = 1
  if (f.underline && f.underline !== 'none') ts.ul = { s: 1 }
  if (f.strike) ts.st = { s: 1 }
  if (f.color) {
    const rgb = exceljsColorToRgb(f.color)
    if (rgb) ts.cl = { rgb }
  }
  return ts
}

// ============================================================
// 富文本：Univer cell.p → exceljs richText
// ============================================================

function cellPToRichText (cell) {
  const body = cell?.p?.body
  if (!body || !body.dataStream) return null
  const dataStream = body.dataStream
  const runs = Array.isArray(body.textRuns) && body.textRuns.length
    ? body.textRuns
    : [{ st: 0, ed: dataStream.length }]
  return runs
    .map(run => {
      const text = dataStream.slice(run.st, run.ed)
      if (!text) return null
      return { text, font: textStyleToExceljsFont(run.ts) }
    })
    .filter(Boolean)
}

function textStyleToExceljsFont (ts) {
  if (!ts) return undefined
  const f = {}
  if (ts.ff) f.name = ts.ff
  if (ts.fs) f.size = ts.fs
  if (ts.bl) f.bold = true
  if (ts.it) f.italic = true
  if (ts.ul?.s) f.underline = true
  if (ts.st?.s) f.strike = true
  if (ts.cl?.rgb) f.color = { argb: withAlpha(ts.cl.rgb) }
  return Object.keys(f).length ? f : undefined
}

// ============================================================
// 样式：Univer → exceljs
// ============================================================

function univerStyleToExceljs (st) {
  if (!st) return undefined
  const s = {}

  if (st.ff || st.fs || st.bl || st.it || st.ul || st.st || st.cl) {
    s.font = {}
    if (st.ff) s.font.name = st.ff
    if (st.fs) s.font.size = st.fs
    if (st.bl) s.font.bold = true
    if (st.it) s.font.italic = true
    if (st.ul?.s) s.font.underline = true
    if (st.st?.s) s.font.strike = true
    if (st.cl?.rgb) s.font.color = { argb: withAlpha(st.cl.rgb) }
  }

  if (st.bg?.rgb) {
    s.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: withAlpha(st.bg.rgb) }
    }
  }

  if (st.bd) {
    s.border = {}
    const nameMap = { t: 'top', b: 'bottom', l: 'left', r: 'right' }
    for (const [k, v] of Object.entries(st.bd)) {
      if (!v) continue
      const side = nameMap[k] || k
      s.border[side] = {
        style: REVERSE_BORDER[v.s] || 'thin',
        color: { argb: withAlpha(v.cl?.rgb || '#000000') }
      }
    }
  }

  const align = {}
  if (st.ht !== undefined && REVERSE_ALIGN_H[st.ht]) align.horizontal = REVERSE_ALIGN_H[st.ht]
  if (st.vt !== undefined && REVERSE_ALIGN_V[st.vt]) align.vertical = REVERSE_ALIGN_V[st.vt]
  if (st.tb === 3) align.wrapText = true  // WrapStrategy.WRAP
  if (st.tr?.a) align.textRotation = st.tr.a
  if (Object.keys(align).length) s.alignment = align

  if (st.n?.pattern) s.numFmt = st.n.pattern

  return Object.keys(s).length ? s : undefined
}

// ============================================================
// xlsx → Univer IWorkbookData
// ============================================================

function isZipFile (buffer) {
  if (!buffer) return false
  const arr = new Uint8Array(buffer.slice(0, 4))
  return arr[0] === 0x50 && arr[1] === 0x4B // 'P' 'K'
}

export async function xlsxToUniverWorkbook (buffer) {
  let excelBuffer = buffer
  if (!isZipFile(buffer)) {
    try {
      const xlsxRead = XLSX.read || XLSX.default?.read
      const xlsxWrite = XLSX.write || XLSX.default?.write
      
      const workbook = xlsxRead(buffer, { type: 'array', cellStyles: true, cellFormulas: true, cellDates: true })
      excelBuffer = xlsxWrite(workbook, { type: 'array', bookType: 'xlsx' })
    } catch (e) {
      console.error('SheetJS 桥接转换 XLS 失败：', e)
      throw new Error('不支持的文件格式，或文件已损坏。若是 .xls 请确保是合法的 Excel 97-2003 工作簿。')
    }
  }

  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(excelBuffer)

  const sheets = {}
  const styleDict = {}
  const styles = {}  // Univer 期望 styles 字典的 key 是 string

  function internStyle (exceljsStyle) {
    const u = exceljsStyleToUniver(exceljsStyle)
    if (!u) return undefined
    const key = JSON.stringify(u)
    if (styleDict[key] !== undefined) return styleDict[key]
    const id = String(Object.keys(styles).length)
    styles[id] = u
    styleDict[key] = id
    return id
  }

  wb.eachSheet((worksheet) => {
    const cellData = {}
    const mergeData = []
    // 收集被合并区域覆盖的非首格，导入时跳过它们
    const coveredCells = new Set()  // key = `${r},${c}`
    let maxRow = 0
    let maxCol = 0

    // 合并单元格：exceljs 的 worksheet.model.merges 是 ['A1:B2', ...]
    if (worksheet.model && Array.isArray(worksheet.model.merges)) {
      worksheet.model.merges.forEach((rangeStr) => {
        // rangeStr 形如 'A1:B2'，两边都是包含的
        const m = rangeStr.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/)
        if (m) {
          const [, c1, r1, c2, r2] = m
          const sr = Number(r1) - 1, er = Number(r2) - 1
          const sc = colLetterToNum(c1), ec = colLetterToNum(c2)
          // Univer 内部把 endRow/endColumn 当作 inclusive（再 +1 做循环），
          // 所以传 sr..er / sc..ec 即可，+1 会让范围多出 1 行/列。
          mergeData.push({
            startRow: sr, endRow: er,
            startColumn: sc, endColumn: ec
          })
          // 标记所有非首格为 covered（用包含区间）
          for (let r = sr; r <= er; r++) {
            for (let c = sc; c <= ec; c++) {
              if (r === sr && c === sc) continue
              coveredCells.add(`${r},${c}`)
            }
          }
        }
      })
    }

    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const r = rowNumber - 1
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const c = colNumber - 1
        // 跳过被合并区域覆盖的非首格
        if (coveredCells.has(`${r},${c}`)) return

        const univerCell = {}

        if (cell.type === ExcelJS.ValueType.Formula) {
          if (cell.formula) univerCell.f = String(cell.formula).replace(/^=/, '')
          if (cell.result !== undefined && cell.result !== null) {
            univerCell.v = cell.result
          }
        } else if (cell.value !== null && cell.value !== undefined) {
          if (typeof cell.value === 'object' && cell.value.richText) {
            // 富文本：v 是纯文本（无 \r，\r 只放在 p.body.dataStream 中）
            // 这样 Univer 排序/筛选/编辑 v 时不会出问题
            const vText = cell.value.richText.map(r => r.text || '').join('').replace(/\r?\n/g, ' ')
            univerCell.v = vText
            const cellP = richTextToCellP(cell.value.richText, cell.font)
            if (cellP) univerCell.p = cellP
          } else {
            univerCell.v = cell.value
          }
        }

        // 类型推断
        if (cell.type === ExcelJS.ValueType.Number) univerCell.t = 2
        else if (cell.type === ExcelJS.ValueType.Boolean) univerCell.t = 3
        else if (cell.type === ExcelJS.ValueType.Date) univerCell.t = 4
        else if (univerCell.v !== undefined) univerCell.t = 1

        // 样式
        const sid = internStyle(cell.style)
        if (sid !== undefined) univerCell.s = sid

        if (univerCell.v !== undefined || univerCell.f) {
          if (!cellData[r]) cellData[r] = {}
          cellData[r][c] = univerCell
        }
        if (r > maxRow) maxRow = r
        if (c > maxCol) maxCol = c
      })
    })

    // 列宽：worksheet.columns 是 [{ width, ... }, ...]
    const columnData = {}
    // exceljs 的 worksheet.columns 永远是 16384 长（MAX_COLUMN_COUNT），
    // 默认 width=9，不区分"未设置"与"显式 9"。只对实际有数据的列写。
    for (let i = 1; i <= worksheet.columnCount; i++) {
      const w = worksheet.getColumn(i).width
      if (w && w !== 9) columnData[i - 1] = { w: colW(w) }
    }
    // 行高：worksheet.getRow(r).height
    const rowData = {}
    for (let r = 1; r <= worksheet.rowCount; r++) {
      const rh = worksheet.getRow(r).height
      if (rh) rowData[r - 1] = { h: rowH(rh) }
    }

    sheets[worksheet.name] = {
      id: worksheet.name,
      name: worksheet.name,
      tabColor: '',
      hidden: 0,         // BooleanNumber.FALSE
      freeze: { xSplit: 0, ySplit: 0, startRow: 0, startColumn: 0 },
      rowCount: Math.max(maxRow + 1, 20),
      columnCount: Math.max(maxCol + 1, 10),
      defaultColumnWidth: 73,
      defaultRowHeight: 20,
      mergeData,
      cellData,
      rowData,
      columnData,
      rowHeader: { width: 46 },
      columnHeader: { height: 20 },
      showGridlines: 1,  // BooleanNumber.TRUE
      rightToLeft: 0,
      zoomRatio: 1,
      scrollTop: 0,
      scrollLeft: 0
    }
  })

  return {
    id: 'workbook-' + Date.now(),
    name: wb.worksheets[0]?.name || '工作簿',
    sheetOrder: wb.worksheets.map(s => s.name),
    sheets,
    styles
  }
}

function colLetterToNum (letters) {
  let n = 0
  for (let i = 0; i < letters.length; i++) {
    n = n * 26 + (letters.charCodeAt(i) - 64)
  }
  return n - 1
}

// ============================================================
// Univer IWorkbookData → xlsx（ArrayBuffer）
// ============================================================

export async function univerToXlsxWorkbook (workbookData) {
  const wb = new ExcelJS.Workbook()
  const styles = workbookData.styles || {}

  workbookData.sheetOrder.forEach((sheetId) => {
    const sheet = workbookData.sheets[sheetId]
    const ws = wb.addWorksheet(sheet.name)

    // 列宽
    if (sheet.columnData && Object.keys(sheet.columnData).length) {
      // 预创建列占位（exceljs 不会自动建列）
      const colCount = Math.max(
        sheet.columnCount || 0,
        ...Object.keys(sheet.columnData).map(Number).map(c => c + 1)
      )
      for (let c = 1; c <= colCount; c++) {
        const colDef = sheet.columnData[c - 1]
        ws.getColumn(c).width = colDef?.w ? colDef.w / 7 : undefined
      }
    }

    // 行高
    if (sheet.rowData && Object.keys(sheet.rowData).length) {
      Object.keys(sheet.rowData).forEach(rKey => {
        const r = Number(rKey) + 1
        const h = sheet.rowData[rKey].h
        if (h) ws.getRow(r).height = h
      })
    }

    // 单元格
    Object.keys(sheet.cellData).forEach((rKey) => {
      const r = Number(rKey) + 1
      const row = sheet.cellData[rKey]
      Object.keys(row).forEach((cKey) => {
        const c = Number(cKey) + 1
        const cell = row[cKey]
        const target = ws.getCell(r, c)

        if (cell.f) {
          // 公式：exceljs 用 { formula, result }
          target.value = { formula: cell.f, result: cell.v ?? 0 }
        } else if (cell.p) {
          // 富文本：cell.p → richText
          const rt = cellPToRichText(cell)
          if (rt && rt.length) target.value = { richText: rt }
          else if (cell.v !== undefined && cell.v !== null) target.value = cell.v
        } else if (cell.v !== undefined && cell.v !== null) {
          if (cell.t === 4 && typeof cell.v === 'string') {
            const d = new Date(cell.v)
            if (!isNaN(d.getTime())) target.value = d
            else target.value = cell.v
          } else {
            target.value = cell.v
          }
        }

        // 样式
        if (cell.s !== undefined && styles[cell.s]) {
          const eStyle = univerStyleToExceljs(styles[cell.s])
          if (eStyle) {
            if (eStyle.font) target.font = eStyle.font
            if (eStyle.fill) target.fill = eStyle.fill
            if (eStyle.border) target.border = eStyle.border
            if (eStyle.alignment) target.alignment = eStyle.alignment
            if (eStyle.numFmt) target.numFmt = eStyle.numFmt
          }
        }
      })
    })

    // 合并
    if (sheet.mergeData?.length) {
      sheet.mergeData.forEach(m => {
        const start = `${colNumToLetter(m.startColumn)}${m.startRow + 1}`
        const end = `${colNumToLetter(m.endColumn)}${m.endRow + 1}`
        try { ws.mergeCells(`${start}:${end}`) } catch (_) {}
      })
    }
  })

  return await wb.xlsx.writeBuffer()
}

function colNumToLetter (n) {
  let s = ''
  n = n + 1
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}
