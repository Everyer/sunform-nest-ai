<template>
  <div class="excel-page">
    <!-- 顶部工具栏（自定义按钮区，Univer 内部还自带一套 ribbon 工具栏） -->
    <div class="excel-toolbar">
      <div class="brand">
        <span class="dot" />
        <span>知筑 · 在线 Excel</span>
      </div>
      <div class="actions">
        <n-button size="small" @click="loadDemo">📊 加载示例</n-button>
        <n-button size="small" @click="newWorkbook">🆕 新建空白</n-button>
        <n-divider vertical />
        <n-upload :show-file-list="false" :custom-request="onImportXlsx" accept=".xlsx,.xls">
          <n-button size="small" type="primary" ghost>📥 导入 xlsx</n-button>
        </n-upload>
        <n-button size="small" @click="onExportXlsx">📤 导出 xlsx</n-button>
        <n-divider vertical />
        <n-button size="small" @click="onInsertChart">📈 插入图表</n-button>
        <n-button size="small" @click="onShowAbout">ℹ️</n-button>
      </div>
    </div>

    <!-- Univer 容器 -->
    <div ref="univerRef" class="univer-container" />

    <!-- 图表抽屉（ECharts 浮动层） -->
    <n-drawer v-model:show="chartDrawerShow" :width="640" placement="right">
      <n-drawer-content title="插入图表（ECharts）" closable>
        <n-form label-placement="left" label-width="80" size="small">
          <n-form-item label="图表类型">
            <n-select v-model:value="chartForm.type" :options="chartTypeOptions" />
          </n-form-item>
          <n-form-item label="数据范围">
            <n-input
              v-model:value="chartForm.range"
              placeholder="例如 A1:D5，多个 sheet 写 Sheet1!A1:D5"
            />
          </n-form-item>
          <n-form-item label="图表标题">
            <n-input v-model:value="chartForm.title" placeholder="可选" />
          </n-form-item>
        </n-form>
        <div ref="chartRef" class="chart-canvas" />
        <template #footer>
          <n-space justify="end">
            <n-button @click="chartDrawerShow = false">取消</n-button>
            <n-button type="primary" @click="onConfirmChart">插入到表格</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>

    <!-- 关于 -->
    <n-modal v-model:show="aboutShow" preset="card" title="关于本组件" style="max-width: 560px">
      <ul class="about-list">
        <li>引擎：Univer {{ univerVersion }}（Apache-2.0）</li>
        <li>已启用 preset：core / 条件格式 / 数据验证 / 筛选 / 排序 / 查找替换 / 绘图 / 批注 / 超链接 / 表格</li>
        <li>xlsx 适配：SheetJS (xlsx@0.18.5)</li>
        <li>图表：ECharts 5.x（自绘浮动层，绕开 Univer Pro 商业授权）</li>
        <li>协同：暂未启用（Univer Pro / Yjs）</li>
      </ul>
    </n-modal>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  NButton, NDivider, NDrawer, NDrawerContent, NForm, NFormItem, NInput,
  NModal, NSelect, NSpace, NUpload, useMessage
} from 'naive-ui'
import { xlsxToUniverWorkbook, univerToXlsxWorkbook } from './adapters/xlsx.js'
import * as echarts from 'echarts'

// ====== Univer 0.25.0 Preset 模式导入 ======
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import UniverPresetSheetsConditionalFormattingZhCN from '@univerjs/preset-sheets-conditional-formatting/locales/zh-CN'
import UniverPresetSheetsDataValidationZhCN from '@univerjs/preset-sheets-data-validation/locales/zh-CN'
import UniverPresetSheetsFilterZhCN from '@univerjs/preset-sheets-filter/locales/zh-CN'
import UniverPresetSheetsSortZhCN from '@univerjs/preset-sheets-sort/locales/zh-CN'
import UniverPresetSheetsFindReplaceZhCN from '@univerjs/preset-sheets-find-replace/locales/zh-CN'
import UniverPresetSheetsDrawingZhCN from '@univerjs/preset-sheets-drawing/locales/zh-CN'
import UniverPresetSheetsNoteZhCN from '@univerjs/preset-sheets-note/locales/zh-CN'
import UniverPresetSheetsHyperLinkZhCN from '@univerjs/preset-sheets-hyper-link/locales/zh-CN'
import UniverPresetSheetsTableZhCN from '@univerjs/preset-sheets-table/locales/zh-CN'
// 数字格式 tooltip（"以文本形式存储的数字"等）— 不在 preset 里，
// 但 preset 内部的 sheets-ui 会覆盖 numfmt-ui 的 sheets-ui.info.* key
// 所以必须放在 preset 之后，让 numfmt 覆盖回去
import UniverSheetsNumfmtUiZhCN from '@univerjs/sheets-numfmt-ui/locale/zh-CN'
// 兜底补丁：Univer 内部 numfmt-ui 代码里写的是 "sheets-numfmt-ui.info.error"，
// 但实际 tooltip 展示的 namespace 是 "sheets-ui"（Univer 内部 i18n 重写导致），
// 所以手动把这两个 key 也补到 sheets-ui.info 下，确保险种情况下都能命中
const NumfmtTooltipPatch = {
  'sheets-ui': {
    info: {
      error: '错误',
      forceStringInfo: '以文本形式存储的数字'
    }
  }
}
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter'
import { UniverSheetsSortPreset } from '@univerjs/preset-sheets-sort'
import { UniverSheetsFindReplacePreset } from '@univerjs/preset-sheets-find-replace'
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing'
import { UniverSheetsNotePreset } from '@univerjs/preset-sheets-note'
import { UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link'
import { UniverSheetsTablePreset } from '@univerjs/preset-sheets-table'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-conditional-formatting/lib/index.css'
import '@univerjs/preset-sheets-data-validation/lib/index.css'
import '@univerjs/preset-sheets-filter/lib/index.css'
import '@univerjs/preset-sheets-sort/lib/index.css'
import '@univerjs/find-replace/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs/sheets-note-ui/lib/index.css'
import '@univerjs/sheets-hyper-link-ui/lib/index.css'
import '@univerjs/sheets-table-ui/lib/index.css'

import { demoWorkbookData } from './exampleData.js'

defineOptions({ name: 'ExcelSheet' })

const message = useMessage()
const univerRef = ref(null)
const chartRef = ref(null)
const univerVersion = '0.25.0'
let univer = null
let univerAPI = null
let chartInstance = null

// ====== 图表弹窗 ======
const chartDrawerShow = ref(false)
const chartForm = reactive({
  type: 'bar',
  range: 'A1:B6',
  title: '示例图表'
})
const chartTypeOptions = [
  { label: '柱状图', value: 'bar' },
  { label: '折线图', value: 'line' },
  { label: '饼图', value: 'pie' },
  { label: '散点图', value: 'scatter' }
]
const aboutShow = ref(false)

// ============================================================
// 初始化 Univer
// ============================================================
function bootstrapUniver () {
  // 给容器一个 id（Univer 内部用 getElementById 找）
  univerRef.value.id = 'univer-app'

  const result = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: (() => {
        const fix = (l) => l?.default || l
        const m = mergeLocales(
          fix(UniverPresetSheetsCoreZhCN),
          fix(UniverPresetSheetsConditionalFormattingZhCN),
          fix(UniverPresetSheetsDataValidationZhCN),
          fix(UniverPresetSheetsFilterZhCN),
          fix(UniverPresetSheetsSortZhCN),
          fix(UniverPresetSheetsFindReplaceZhCN),
          fix(UniverPresetSheetsDrawingZhCN),
          fix(UniverPresetSheetsNoteZhCN),
          fix(UniverPresetSheetsHyperLinkZhCN),
          fix(UniverPresetSheetsTableZhCN),
          fix(UniverSheetsNumfmtUiZhCN)
        )

        // 深度合并自定义补丁，防止 mergeLocales 浅拷贝把整个 sheets-ui 命名空间覆盖掉
        const deepMerge = (target, source) => {
          for (const key in source) {
            if (source[key] && typeof source[key] === 'object') {
              if (!target[key]) target[key] = {}
              deepMerge(target[key], source[key])
            } else {
              target[key] = source[key]
            }
          }
          return target
        }
        deepMerge(m, NumfmtTooltipPatch)
        return m
      })()
    },
    presets: [
      UniverSheetsCorePreset({
        container: 'univer-app',
        // 关闭"以文本形式存储的数字"提示 alert（exceljs 导入日期会被当字符串，
        // 默认会弹红框，Univer 0.25 把这个 alert 容器放在了 sheets-ui 组件下导致 i18n namespace 错位）
        disableTextFormatAlert: true,
        // 关闭数字单元格左上角绿三角（视觉噪音）
        disableTextFormatMark: true,
        // 关闭 force-string 相关的 sheets-ui alert（兜底）
        disableForceStringAlert: true,
        disableForceStringMark: true
      }),
      UniverSheetsConditionalFormattingPreset(),
      UniverSheetsDataValidationPreset(),
      UniverSheetsFilterPreset(),
      UniverSheetsSortPreset(),
      UniverSheetsFindReplacePreset(),
      UniverSheetsDrawingPreset(),
      UniverSheetsNotePreset(),
      UniverSheetsHyperLinkPreset(),
      UniverSheetsTablePreset()
    ]
  })
  univer = result.univer
  univerAPI = result.univerAPI

  // 默认建一个空白工作簿
  univerAPI.createWorkbook({ name: '未命名工作簿' })
}

// ============================================================
// 示例数据（接近你截图里那张"知筑"测试表的形态）
// ============================================================
function loadDemo () {
  if (!univerAPI) return
  univerAPI.createWorkbook(demoWorkbookData, { makeCurrent: true })
  message.success('已加载示例数据')
}

function newWorkbook () {
  if (!univerAPI) return
  univerAPI.createWorkbook({ name: '未命名工作簿' })
  message.success('已新建空白工作簿')
}

// ============================================================
// xlsx 导入 / 导出（SheetJS）
// ============================================================
async function onImportXlsx ({ file, onFinish, onError }) {
  try {
    // Naive UI UploadFileInfo 包装对象的原始 File 在 file.file
    const rawFile = file.file || file
    if (!rawFile || typeof rawFile.arrayBuffer !== 'function') {
      throw new Error('当前浏览器不支持 File.arrayBuffer，请升级到现代浏览器')
    }
    const buf = await rawFile.arrayBuffer()
    const data = await xlsxToUniverWorkbook(buf)
    univerAPI.createWorkbook(data, { makeCurrent: true })
    message.success(`已导入：${file.name}（${data.sheetOrder.length} 个 Sheet，含样式/公式/合并）`)
    onFinish()
  } catch (e) {
    console.error(e)
    message.error(`导入失败：${e.message || e}`)
    onError()
  }
}

async function onExportXlsx () {
  try {
    const fWorkbook = univerAPI.getActiveWorkbook()
    const workbookData = fWorkbook.save()
    const out = await univerToXlsxWorkbook(workbookData)
    const blob = new Blob([out], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workbookData.name || '工作簿'}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    message.success('已导出 xlsx（含样式/公式/合并）')
  } catch (e) {
    console.error(e)
    message.error(`导出失败：${e.message || e}`)
  }
}

/**
 * xlsx ↔ Univer 双向转换已抽到 ./adapters/xlsx.js：
 *   xlsxToUniverWorkbook / univerToXlsxWorkbook
 * 支持：值、公式、样式、合并、列宽行高、多 sheet
 */

// ============================================================
// 图表：把选区数据传给 ECharts，渲染后再以浮动图片方式贴回 Univer
// ============================================================
function onInsertChart () {
  chartDrawerShow.value = true
  // 等抽屉 DOM 渲染后再初始化 ECharts
  setTimeout(() => {
    if (!chartRef.value) return
    if (!chartInstance) chartInstance = echarts.init(chartRef.value)
    renderPreview()
  }, 50)
}

function readRange (rangeStr) {
  // 支持多 sheet：'Sheet1!A1:D5'，或当前 sheet 的 'A1:D5'
  const [sheetName, range] = rangeStr.includes('!') ? rangeStr.split('!') : [null, rangeStr]
  const wb = univerAPI.getActiveWorkbook()
  const targetSheet = sheetName
    ? wb.getSheetByName(sheetName)
    : wb.getActiveSheet()
  if (!targetSheet) return null

  const m = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/)
  if (!m) return null
  const [, c1, r1, c2, r2] = m
  const startCol = colLetterToNum(c1)
  const endCol = colLetterToNum(c2)
  const startRow = Number(r1) - 1
  const endRow = Number(r2) - 1
  const numRows = endRow - startRow + 1
  const numCols = endCol - startCol + 1
  // 一次性拿 2D 值数组
  const values = targetSheet.getRange(startRow, startCol, numRows, numCols).getValues()
  // 把 null/undefined 替换成 ''，方便 ECharts 处理
  return values.map(row => row.map(v => (v === null || v === undefined ? '' : v)))
}

function renderPreview () {
  const rows = readRange(chartForm.range)
  if (!rows || rows.length === 0) {
    message.warning('范围无效或为空')
    return
  }
  const header = rows[0]
  const data = rows.slice(1)
  const xData = data.map(r => r[0])
  const series = header.slice(1).map((name, i) => ({
    name,
    type: chartForm.type === 'scatter' ? 'scatter' : chartForm.type,
    data: data.map(r => r[i + 1])
  }))
  const option = {
    title: { text: chartForm.title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: chartForm.type === 'pie' ? undefined : { type: 'category', data: xData },
    yAxis: chartForm.type === 'pie' ? undefined : { type: 'value' },
    series: chartForm.type === 'pie'
      ? [{ type: 'pie', radius: '60%', data: xData.map((n, i) => ({ name: n, value: data[i][1] })) }]
      : series
  }
  chartInstance.setOption(option, true)
}

function onConfirmChart () {
  if (!chartInstance) return
  // 导出 ECharts 为 base64 PNG，提供下载；用户也可手动从 Univer 工具栏的"插入图片"粘贴
  const dataUrl = chartInstance.getDataURL({ pixelRatio: 2, backgroundColor: '#fff' })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${chartForm.title || 'chart'}.png`
  a.click()
  message.success('图表已下载 PNG，可通过 Univer 工具栏"插入图片"贴回表格（Drawing preset 已启用）')
  chartDrawerShow.value = false
}

// ============================================================
// 工具：列字母转数字
// ============================================================
function colLetterToNum (letters) {
  let n = 0
  for (let i = 0; i < letters.length; i++) {
    n = n * 26 + (letters.charCodeAt(i) - 64)
  }
  return n - 1
}

// ============================================================
// 生命周期
// ============================================================
onMounted(() => {
  bootstrapUniver()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  if (univer) {
    univer.dispose()
    univer = null
    univerAPI = null
  }
})

function onShowAbout () { aboutShow.value = true }
</script>

<style scoped>
.excel-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
}

.excel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #e6e8eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  z-index: 2;
}

.brand {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #1f2329;
}

.brand .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #18a058;
  margin-right: 8px;
  box-shadow: 0 0 6px rgba(24, 160, 88, 0.6);
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.univer-container {
  flex: 1;
  width: 100%;
  min-height: 600px;
  background: #fff;
}

.chart-canvas {
  width: 100%;
  height: 360px;
  margin-top: 12px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.about-list {
  list-style: none;
  padding: 0;
  margin: 0;
  line-height: 1.9;
  color: #555;
}

.about-list li::before {
  content: '✓ ';
  color: #18a058;
  font-weight: bold;
}
</style>
