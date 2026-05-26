<template>
  <div class="print-preview-overlay">
    <!-- 顶部操作条 (打印时在媒体查询中会自动隐藏) -->
    <div class="preview-actions-bar">
      <div class="actions-left">
        <button class="btn-preview-back" @click="$emit('close')">
          ← 返回设计器
        </button>
        <span class="preview-title">打印预览 & 导出 PDF</span>
      </div>
      <div class="actions-right">
        <button class="btn btn-primary btn-print-trigger" @click="triggerPrint">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right: 4px;">
            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
          </svg>
          立即打印 / 另存为 PDF
        </button>
      </div>
    </div>
    
    <!-- 智能测量 Loading 遮罩层 (毛玻璃质感，0.1秒排版即逝) -->
    <div v-if="isMeasuring" class="preview-measuring-loading" style="position: absolute; top: 56px; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 99999; backdrop-filter: blur(8px);">
      <div class="spinner" style="width: 40px; height: 40px; border: 3px solid rgba(245, 158, 11, 0.2); border-top-color: #f59e0b; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px;"></div>
      <div style="color: #94a3b8; font-size: 13px; font-weight: 500; letter-spacing: 1px;">智能物理高度排版匹配中...</div>
    </div>

    <!-- 预览物理纸张滚动容器 -->
    <div class="preview-scroll-viewport">
      <div class="preview-pages-list">
        <!-- 循环渲染分页后的物理纸张 -->
        <div 
          v-for="(page, index) in finalPages" 
          :key="index"
          class="print-page-container"
          :style="getPageStyle(index)"
        >
          <!-- 边距内容容器 (用于限制打印溢出) -->
          <div class="page-margin-content" :style="getMarginStyle">
            
            <!-- 1. 渲染该页分配的子表格 (表格是流式的独立组件，根据分页切割定位) -->
            <div 
              v-if="page.table" 
              class="print-element"
              :style="getTableContainerStyle(page.table)"
            >
              <table class="real-print-table">
                <colgroup>
                  <col 
                    v-for="(col, index) in page.table.raw.columns" 
                    :key="index"
                    :style="{ width: col.width + 'px' }"
                  />
                </colgroup>
                <thead v-if="page.table.showHeader">
                  <!-- 原生多行表头结构 -->
                  <template v-if="page.table.raw.headerRows">
                    <tr v-for="(hRow, rIdx) in page.table.raw.headerRows" :key="rIdx">
                      <th
                        v-for="(cell, cIdx) in hRow"
                        :key="cIdx"
                        :rowspan="cell.rowspan || 1"
                        :colspan="cell.colspan || 1"
                        :style="{ 
                          textAlign: cell.align || 'center',
                          backgroundColor: cell.backgroundColor || '#f1f5f9',
                          fontWeight: cell.fontWeight || 'bold',
                          color: cell.color || '#000000',
                          fontSize: (cell.fontSize || 10) + 'px',
                          border: '1px solid #94a3b8'
                        }"
                      >
                        {{ interpolate(cell.title, page.pageIndex, renderPages.length) }}
                      </th>
                    </tr>
                  </template>
                  <!-- 默认单行表头 -->
                  <template v-else>
                    <tr>
                      <th 
                        v-for="(col, index) in page.table.raw.columns" 
                        :key="index"
                        :style="{ textAlign: col.align }"
                      >
                        {{ col.title }}
                      </th>
                    </tr>
                  </template>
                </thead>
                <tbody>
                  <tr v-for="(row, rIdx) in page.table.rows" :key="rIdx">
                    <template v-for="(col, cIdx) in page.table.raw.columns" :key="cIdx">
                      <td 
                        v-if="shouldRenderColumn(page.table.raw.columns, cIdx) && getRowSpan(page.table.rows, rIdx, col) > 0"
                        :rowspan="getRowSpan(page.table.rows, rIdx, col)"
                        :colspan="col.colspan || 1"
                        :style="{ 
                          textAlign: col.align,
                          writingMode: col.writingMode || 'horizontal-tb',
                          textOrientation: col.writingMode ? 'upright' : 'mixed',
                          whiteSpace: col.writingMode ? 'nowrap' : 'pre-wrap',
                          letterSpacing: col.writingMode ? '2px' : 'normal',
                          padding: col.writingMode ? '10px 4px' : '5px 4px'
                        }"
                      >
                        {{ getRowValue(row, col.field) }}
                      </td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 2. 渲染该页中的所有绝对定位组件元素 (非表格) -->
            <div 
              v-for="el in page.elements" 
              :key="el.id"
              class="print-element"
              :style="getElementStyle(el)"
            >
              <!-- 文本 -->
              <div 
                v-if="el.type === 'text'" 
                class="el-text-render"
                :style="getTextStyle(el)"
                v-html="interpolate(el.value, page.pageIndex, renderPages.length)"
              >
              </div>
              
              <!-- 页码 -->
              <div 
                v-else-if="el.type === 'page-number'" 
                class="el-text-render"
                :style="getTextStyle(el)"
              >
                {{ interpolate(`第 \${page.pageIndex} 页 / 共 \${renderPages.length} 页`, page.pageIndex, renderPages.length) }}
              </div>
              
              <!-- 图片 -->
              <div v-else-if="el.type === 'image'" class="el-image-render">
                <img :src="el.value" alt="Report Image" />
              </div>
              
              <!-- 横向线条 -->
              <div 
                v-else-if="el.type === 'line-h'" 
                :style="{ borderBottom: (el.borderWidth || 1) + 'px ' + (el.borderStyle || 'solid') + ' ' + (el.fontColor || '#000000'), width: '100%', height: '1px' }"
              ></div>
              
              <!-- 纵向线条 -->
              <div 
                v-else-if="el.type === 'line-v'" 
                :style="{ borderRight: (el.borderWidth || 1) + 'px ' + (el.borderStyle || 'solid') + ' ' + (el.fontColor || '#000000'), height: '100%', width: '1px' }"
              ></div>
              
              <!-- 矩形边框 -->
              <div 
                v-else-if="el.type === 'rect'" 
                :style="{ 
                  border: (el.borderWidth || 1) + 'px ' + (el.borderStyle || 'solid') + ' ' + (el.fontColor || '#000000'),
                  backgroundColor: el.backgroundColor || 'transparent',
                  width: '100%',
                  height: '100%'
                }"
              ></div>

              <!-- 矢量二维码 -->
              <div v-else-if="el.type === 'qrcode'" style="width: 100%; height: 100%;">
                <svg :viewBox="`0 0 ${getQrData(el.value).size} ${getQrData(el.value).size}`" width="100%" height="100%">
                  <path :d="getQrSvgPath(el.value)" fill="#000000" />
                </svg>
              </div>

              <!-- 矢量条形码 -->
              <div v-else-if="el.type === 'barcode'" class="barcode-render-container">
                <svg viewBox="0 0 115 50" width="100%" height="75%" preserveAspectRatio="none">
                  <g fill="#000000">
                    <rect 
                      v-for="(bar, idx) in getBarcodeData(el.value).bars" 
                      :key="idx" 
                      :x="bar.x * (115 / getBarcodeData(el.value).totalWidth)" 
                      :y="0" 
                      :width="bar.width * (115 / getBarcodeData(el.value).totalWidth)" 
                      height="50" 
                    />
                  </g>
                </svg>
                <div v-if="el.showText !== false" class="barcode-label">{{ interpolate(el.value, page.pageIndex, renderPages.length) }}</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- 智能 DOM 真实高度测量容器 (完全对用户隐形，不影响任何视觉交互) -->
    <div v-if="isMeasuring" class="measuring-temp-container" style="position: absolute; left: -9999px; top: -9999px; width: 1000px; visibility: hidden;">
      <table class="real-print-table" ref="measureTableRef" :style="{ width: (tableElement ? tableElement.width : 718) + 'px' }">
        <colgroup>
          <col 
            v-for="(col, index) in (tableElement ? tableElement.columns : [])" 
            :key="index"
            :style="{ width: col.width + 'px' }"
          />
        </colgroup>
        <thead ref="measureTheadRef">
          <!-- 复杂多行表头 -->
          <template v-if="tableElement && tableElement.headerRows">
            <tr v-for="(hRow, rIdx) in tableElement.headerRows" :key="rIdx">
              <th
                v-for="(cell, cIdx) in hRow"
                :key="cIdx"
                :rowspan="cell.rowspan || 1"
                :colspan="cell.colspan || 1"
              >
                {{ cell.title }}
              </th>
            </tr>
          </template>
          <!-- 默认单行表头 -->
          <template v-else-if="tableElement">
            <tr>
              <th v-for="(col, index) in tableElement.columns" :key="index">
                {{ col.title }}
              </th>
            </tr>
          </template>
        </thead>
        <tbody>
          <tr v-for="(row, rIdx) in listData" :key="rIdx" class="measure-row">
            <template v-for="(col, cIdx) in (tableElement ? tableElement.columns : [])" :key="cIdx">
              <td 
                v-if="shouldRenderColumn(tableElement.columns, cIdx)"
                :colspan="col.colspan || 1"
                v-html="getRowValue(row, col.field)"
              >
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { mockData, reportMockData, deliveryMockData, assetMockData } from '../utils/mockData.js';
import { QRCodeAlg } from '../utils/qrcode.js';
import { BarcodeAlg } from '../utils/barcode.js';

const props = defineProps({
  elements: {
    type: Array,
    required: true
  },
  paperWidth: {
    type: Number,
    default: 210
  },
  paperHeight: {
    type: Number,
    default: 297
  },
  pageMargins: {
    type: Object,
    default: () => ({ top: 10, bottom: 10, left: 10, right: 10 })
  },
  isLandscape: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const MM_TO_PX = 3.779527559; // 1mm ≈ 3.78px

// 自动感知选择当前模板适用的 Mock 数据源
const activeMockData = computed(() => {
  // 1. 自动感知是否包含图 3 述职报告模版特殊字段
  const hasReportKeyword = props.elements.some(el => {
    if (typeof el.value === 'string' && (el.value.includes('master.userName') || el.value.includes('master.jobTitle') || el.value.includes('master.year'))) return true;
    if (el.type === 'table' && el.columns && el.columns.some(col => col.field === 'detail.category')) return true;
    return false;
  });
  if (hasReportKeyword) return reportMockData;

  // 2. 自动感知是否包含图 2 复杂功能模块模版特殊字段
  const hasMergeKeyword = props.elements.some(el => {
    if (typeof el.value === 'string' && el.value.includes('master.projectName')) return true;
    if (el.type === 'table' && el.columns && el.columns.some(col => col.field === 'detail.module')) return true;
    return false;
  });
  return hasMergeKeyword ? mergeMockData : mockData;
});

// 智能估计表格行物理高度 (根据文字长度及实际表格拉伸宽度比例进行物理精细推算)
function getEstimatedRowHeight(row, columns, tableWidth = 0) {
  let maxLines = 1;
  
  // 计算列定义总宽度之和
  let sumColWidth = 0;
  columns.forEach(col => {
    sumColWidth += (col.width || 100);
  });
  
  // 计算由于画布拉伸导致实际渲染列宽的放大比例 (如横向打印时，表格会被拉得非常宽)
  const scale = (tableWidth && sumColWidth) ? Math.max(1, tableWidth / sumColWidth) : 1;

  columns.forEach(col => {
    // 如果该列是跨越其它列被合并的列 (字段为空)，或者 colspan 的占位，不参与计算
    if (!col.field) return;
    const val = getRowValue(row, col.field);
    if (val) {
      const text = String(val);
      // 1. 根据换行符计算行数
      const newlineLines = text.split('\n').length;
      
      // 2. 根据比例缩放后的列实际物理宽度估算中文字符折行行数 (字号约为 11px)
      const colWidthPx = (col.width || 100) * scale;
      const approxCharPerLine = Math.max(5, Math.floor(colWidthPx / 11));
      const charLines = Math.ceil(text.length / approxCharPerLine);
      
      const lines = Math.max(newlineLines, charLines);
      if (lines > maxLines) {
        maxLines = lines;
      }
    }
  });
  // 打印字号 11px，line-height 1.2，物理实际行高约 13.5px。上下 padding 各 5px。
  return 12 + maxLines * 13.5;
};

// 智能跨列合并过滤 (跳过被前面列 colspan 覆盖的列渲染)
function shouldRenderColumn(columns, cIdx) {
  for (let i = 0; i < cIdx; i++) {
    const col = columns[i];
    if (col.colspan && i + col.colspan > cIdx) {
      return false;
    }
  }
  return true;
}

// 核心分页排版引擎 (基于动态物理高度累加的流式行切割)
const renderPages = computed(() => {
  const pages = [];
  const listData = activeMockData.value.detail; // 获取从表二维列表数据
  
  // 1. 获取表格组件
  const tableElement = props.elements.find(el => el.type === 'table');
  
  // 2. 过滤出其他普通绝对定位组件
  const commonElements = props.elements.filter(el => el.type !== 'table');
  
  // 纸张的最大可用物理像素高度
  const maxPaperHeight = props.paperHeight * MM_TO_PX;
  const topMarginPx = props.pageMargins.top * MM_TO_PX;
  const bottomMarginPx = props.pageMargins.bottom * MM_TO_PX;
  const maxUsableHeight = maxPaperHeight - topMarginPx - bottomMarginPx;
  
  // 如果没有表格组件，所有元素直接在第1页渲染，无需流式分页
  if (!tableElement) {
    pages.push({
      pageIndex: 1,
      elements: commonElements.filter(el => checkShowStrategy(el, 1, 1))
    });
    return pages;
  }
  
  // 3. 开始执行高级物理高度表格分页算法
  const tableY = tableElement.y; // 表格起点高度 Y 像素
  const headerRowCount = tableElement.headerRows ? tableElement.headerRows.length : 1;
  const headerHeight = headerRowCount * 32; // 表格 thead 物理高度 (每个 headerRow 约 32px)
  
  // 第一页表格可供分配的像素高度：从表格Y坐标到纸张底部边距的富余高度
  // 较矮的横向纸张留出更小空隙（32px）以榨干空间，纵向则留出 40px
  const pageFooterReserve = props.paperHeight < 250 ? 32 : 40;
  const page1MaxTableHeight = maxUsableHeight - tableY - pageFooterReserve;
  
  // 第二页及后续页：表格从页眉下方 (例如Y = 32mm = 120px) 开始，一直到底部边距
  const pageNTableStartY = 120; // px
  const pageNMaxTableHeight = maxUsableHeight - pageNTableStartY - pageFooterReserve;
  
  let currentDataIndex = 0;
  let curPageIndex = 1;
  const segments = []; // 存储切分好后的每页表格行数据
  
  while (currentDataIndex < listData.length) {
    const isFirstPage = curPageIndex === 1;
    const maxTableH = isFirstPage ? page1MaxTableHeight : pageNMaxTableHeight;
    const showHeader = isFirstPage ? true : tableElement.repeatHeader !== false;
    
    // 计算当前页能承载的数据行 (采用物理行高动态累加算法)
    const usedForHeader = showHeader ? headerHeight : 0;
    let currentTableH = usedForHeader;
    const pageRows = [];
    
    while (currentDataIndex < listData.length) {
      const row = listData[currentDataIndex];
      const estimatedH = getEstimatedRowHeight(row, tableElement.columns, tableElement.width);
      
      // 如果加上当前行高度后超出了本页可用高度，且本页已经塞入了至少一行数据，则推到下一页
      if (currentTableH + estimatedH > maxTableH && pageRows.length > 0) {
        break;
      }
      
      currentTableH += estimatedH;
      pageRows.push(row);
      currentDataIndex++;
    }
    
    segments.push({
      pageIndex: curPageIndex,
      showHeader: showHeader,
      rows: pageRows,
      startY: isFirstPage ? tableY : pageNTableStartY,
      height: currentTableH
    });
    
    curPageIndex++;
  }
  
  const totalPages = segments.length;
  
  // 4. 构建包含绝对元素与表格切片的完美多页渲染数据
  for (let i = 0; i < totalPages; i++) {
    const pIdx = i + 1;
    const seg = segments[i];
    
    // 过滤出当前页可以呈现的组件（根据打印分页策略策略）
    const pageEls = commonElements.filter(el => checkShowStrategy(el, pIdx, totalPages));
    
    pages.push({
      pageIndex: pIdx,
      elements: pageEls,
      table: {
        raw: tableElement,
        showHeader: seg.showHeader,
        rows: seg.rows,
        startY: seg.startY
      }
    });
  }
  
  return pages;
});

// ==========================================
// 🚀 核心工业级：物理高度 DOM 动态测量自适应分页引擎 (0 像素误差极限榨干空间)
// ==========================================
const isMeasuring = ref(true);
const finalPages = ref(renderPages.value || []);

const measureTableRef = ref(null);
const measureTheadRef = ref(null);

const listData = computed(() => activeMockData.value.detail || []);
const tableElement = computed(() => props.elements.find(el => el.type === 'table'));

const measureAndPaginate = async () => {
  isMeasuring.value = true;
  await nextTick();
  
  // 给浏览器留出 60ms 的宏任务时间，确保隐藏的测量容器 DOM 已经 100% 渲染且完成了物理布局宽度分配
  setTimeout(() => {
    const tableEl = tableElement.value;
    if (!tableEl) {
      const commonElements = props.elements;
      const maxPaperHeight = props.paperHeight * MM_TO_PX;
      const topMarginPx = props.pageMargins.top * MM_TO_PX;
      const bottomMarginPx = props.pageMargins.bottom * MM_TO_PX;
      const maxUsableHeight = maxPaperHeight - topMarginPx - bottomMarginPx;
      
      finalPages.value = [{
        pageIndex: 1,
        elements: commonElements.filter(el => checkShowStrategy(el, 1, 1))
      }];
      isMeasuring.value = false;
      return;
    }
    
    // 1. 抓取表头真实物理渲染高度 (thead offsetHeight)
    const theadEl = measureTheadRef.value;
    const headerHeight = theadEl ? theadEl.offsetHeight : 32;
    
    // 2. 物理抓取每一行 tr 在浏览器真实渲染后的绝对物理像素高度 (offsetHeight)
    const rowEls = document.querySelectorAll('.measuring-temp-container .measure-row');
    const realHeights = [];
    rowEls.forEach((el) => {
      realHeights.push(el.offsetHeight);
    });
    
    console.log('[DEBUG-MEASURE] Physical Width:', tableEl.width, 'Thead H:', headerHeight, 'Row Heights:', realHeights);
    
    // 3. 执行流式数据行真实物理高度累加切割
    const pages = [];
    const commonElements = props.elements.filter(el => el.type !== 'table');
    
    const maxPaperHeight = props.paperHeight * MM_TO_PX;
    const topMarginPx = props.pageMargins.top * MM_TO_PX;
    const bottomMarginPx = props.pageMargins.bottom * MM_TO_PX;
    const maxUsableHeight = maxPaperHeight - topMarginPx - bottomMarginPx;
    
    const tableY = tableEl.y;
    const pageFooterReserve = props.paperHeight < 250 ? 32 : 40;
    const page1MaxTableHeight = maxUsableHeight - tableY - pageFooterReserve;
    const pageNTableStartY = 120; // px
    const pageNMaxTableHeight = maxUsableHeight - pageNTableStartY - pageFooterReserve;
    
    let currentDataIndex = 0;
    let curPageIndex = 1;
    const segments = [];
    
    while (currentDataIndex < listData.value.length) {
      const isFirstPage = curPageIndex === 1;
      const maxTableH = isFirstPage ? page1MaxTableHeight : pageNMaxTableHeight;
      const showHeader = isFirstPage ? true : tableEl.repeatHeader !== false;
      
      const usedForHeader = showHeader ? headerHeight : 0;
      let currentTableH = usedForHeader;
      const pageRows = [];
      
      while (currentDataIndex < listData.value.length) {
        const row = listData.value[currentDataIndex];
        const realH = realHeights[currentDataIndex] || 30; // 绝对精确的测量高度！
        
        if (currentTableH + realH > maxTableH && pageRows.length > 0) {
          break;
        }
        
        currentTableH += realH;
        pageRows.push(row);
        currentDataIndex++;
      }
      
      segments.push({
        pageIndex: curPageIndex,
        showHeader: showHeader,
        rows: pageRows,
        startY: isFirstPage ? tableY : pageNTableStartY,
        height: currentTableH
      });
      
      curPageIndex++;
    }
    
    const totalPages = segments.length;
    for (let i = 0; i < totalPages; i++) {
      const pIdx = i + 1;
      const seg = segments[i];
      const pageEls = commonElements.filter(el => checkShowStrategy(el, pIdx, totalPages));
      
      pages.push({
        pageIndex: pIdx,
        elements: pageEls,
        table: {
          raw: tableEl,
          showHeader: seg.showHeader,
          rows: seg.rows,
          startY: seg.startY
        }
      });
    }
    
    finalPages.value = pages;
    isMeasuring.value = false; // 完美收官 Loading
    console.log('[DEBUG-MEASURE] Pagination perfect reflow complete! Pages count:', finalPages.value.length);
  }, 60);
};

// 触发钩子
onMounted(() => {
  measureAndPaginate();
});

watch(() => props.elements, () => {
  measureAndPaginate();
}, { deep: true });

watch(() => props.isLandscape, () => {
  measureAndPaginate();
});

watch(() => listData.value, () => {
  measureAndPaginate();
}, { deep: true });

// 打印分页显示策略过滤
function checkShowStrategy(el, curPage, totalPages) {
  const strat = el.showStrategy || 'all';
  if (strat === 'all') return true;
  if (strat === 'first') return curPage === 1;
  if (strat === 'last') return curPage === totalPages;
  if (strat === 'no-first') return curPage !== 1;
  if (strat === 'no-last') return curPage !== totalPages;
  return true;
}

// 数据字段绑定解析引擎 (正则表达式递归替换)
function interpolate(val, curPage, totalPages) {
  if (typeof val !== 'string') return val;
  let res = val.replace(/\$\{master\.(\w+)\}/g, (match, key) => {
    return activeMockData.value.master[key] !== undefined ? activeMockData.value.master[key] : '';
  });
  
  // 页码内置变量解析
  res = res.replace(/\$\{page\.index\}/g, curPage);
  res = res.replace(/\$\{page\.total\}/g, totalPages);
  
  return res;
}

// 获取表格从表行的子字段值 (深度升级：全面支持 detail.xxx, master.xxx 以及任意主从插值)
function getRowValue(row, field) {
  if (!field) return "";
  
  // 1. 支持单元格直接绑定主表字段，如 `master.orderNo`
  if (typeof field === 'string' && field.startsWith('master.')) {
    const key = field.replace('master.', '');
    return activeMockData.value.master[key] !== undefined ? activeMockData.value.master[key] : '';
  }
  
  // 2. 支持单元格带有插值语法，如 `客户: \${master.customerName}`
  if (typeof field === 'string' && field.includes('${master.')) {
    return field.replace(/\$\{master\.(\w+)\}/g, (match, key) => {
      return activeMockData.value.master[key] !== undefined ? activeMockData.value.master[key] : '';
    });
  }
  
  // 3. 默认绑定从表明细属性，如 `detail.goodsName`
  const key = field.replace('detail.', '');
  return row[key] !== undefined ? row[key] : '';
}

// 计算物理跨页切片中的相邻行合并 rowspan 状态 (核心高级合并算法)
function getRowSpan(rows, rIdx, col) {
  if (!col.autoMerge || !rows || rows.length === 0) return 1;
  
  const curVal = getRowValue(rows[rIdx], col.field);
  
  // 1. 如果当前行不是第一行，且与上一行值相同，说明已经被合并了，本行此单元格不渲染 (返回 0)
  if (rIdx > 0) {
    const prevVal = getRowValue(rows[rIdx - 1], col.field);
    if (curVal === prevVal) {
      return 0; 
    }
  }
  
  // 2. 如果是第一行，或者是与上一行值不同的断点，计算向后连续相同的行数
  let spanCount = 1;
  for (let i = rIdx + 1; i < rows.length; i++) {
    const nextVal = getRowValue(rows[i], col.field);
    if (nextVal === curVal) {
      spanCount++;
    } else {
      break;
    }
  }
  
  return spanCount;
};

// 毫米级纸张尺寸像素换算
const getPageStyle = (index) => {
  const w = props.paperWidth * MM_TO_PX;
  const h = props.paperHeight * MM_TO_PX;
  return {
    width: w + 'px',
    height: h + 'px'
  };
};

const getMarginStyle = computed(() => {
  const t = props.pageMargins.top * MM_TO_PX;
  const b = props.pageMargins.bottom * MM_TO_PX;
  const l = props.pageMargins.left * MM_TO_PX;
  const r = props.pageMargins.right * MM_TO_PX;
  return {
    padding: `${t}px ${r}px ${b}px ${l}px`,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    position: 'relative'
  };
});

const getElementStyle = (el) => ({
  position: 'absolute',
  left: el.x + 'px',
  top: el.y + 'px',
  width: el.width + 'px',
  height: el.height + 'px',
  transform: el.rotate ? `rotate(${el.rotate}deg)` : 'none'
});

const getTableContainerStyle = (pageTable) => {
  if (!pageTable) return {};
  return {
    position: 'absolute',
    left: pageTable.raw.x + 'px',
    top: pageTable.startY + 'px', // 完美支持根据分页动态计算起始 Y 坐标！
    width: pageTable.raw.width + 'px'
  };
};

const getTextStyle = (el) => ({
  width: '100%',
  height: '100%',
  fontSize: (el.fontSize || 14) + 'px',
  color: el.fontColor || '#000000',
  fontWeight: el.fontWeight || 'normal',
  fontStyle: el.fontStyle || 'normal',
  textDecoration: el.textDecoration || 'none',
  textAlign: el.align || 'left',
  display: 'flex',
  justifyContent: el.align === 'center' ? 'center' : el.align === 'right' ? 'flex-end' : 'flex-start',
  alignItems: el.valign === 'middle' ? 'center' : el.valign === 'bottom' ? 'flex-end' : 'flex-start',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  lineHeight: 1.3
});

// 条形码与二维码数据缓存计算
const getBarcodeData = (value) => {
  const val = interpolate(value, 1, 1);
  try {
    return BarcodeAlg.getSvgBars(val || "SO-20260524");
  } catch (e) {
    return { totalWidth: 115, bars: [] };
  }
};

const getQrData = (value) => {
  const val = interpolate(value, 1, 1);
  try {
    return QRCodeAlg.generate(val || "SO-20260524");
  } catch (e) {
    return { size: 21, matrix: [] };
  }
};

const getQrSvgPath = (value) => {
  const qr = getQrData(value);
  let path = "";
  for (let r = 0; r < qr.size; r++) {
    for (let c = 0; c < qr.size; c++) {
      if (qr.matrix[r][c]) {
        path += `M${c} ${r}h1v1h-1z`;
      }
    }
  }
  return path;
};

// 调起物理隔离打印 (彻底避开管理系统框架干扰，实现纯净矢量打印)
const triggerPrint = () => {
  // 1. 动态生成一个隔离的隐藏 iframe 并追加至 document.body
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '10px';
  iframe.style.height = '10px';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  
  // 2. 收集当前渲染后的多页纯净 HTML 结构
  const previewDom = document.querySelector('.preview-pages-list');
  const printHtml = previewDom ? previewDom.innerHTML : '';
  
  // 3. 计算物理尺寸用于 iframe 内部的 CSS 样式 (毫米及像素对齐)
  const pageW = props.paperWidth;
  const pageH = props.paperHeight;
  
  const iframeDoc = iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>打印报表</title>
      <style>
        body, html {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
          overflow: hidden !important; /* 物理隔离强阻断任何纸张边缘的溢出！ */
        }
        /* 强制隐藏默认页眉页脚（如时间、网页地址等）并且物理声明具体大小方向 */
        @page {
          size: ${pageW}mm ${pageH}mm;
          margin: 0 !important;
        }
        .preview-pages-list {
          display: block !important;
          overflow: hidden !important; /* 强制裁剪多余微弱高度溢出！ */
        }
        /* 强力抹除除了纸张容器外的任何可能有形/无形的测量容器、调试工具等 DOM 杂质，绝对锁定打印页面数！ */
        body > *:not(.preview-pages-list),
        .preview-pages-list > *:not(.print-page-container),
        .measuring-temp-container {
          display: none !important;
        }
        /* 强制分页控制 */
        .print-page-container {
          box-sizing: border-box !important;
          position: relative !important;
          width: ${pageW}mm !important;
          height: ${pageH}mm !important;
          overflow: hidden !important;
          background-color: #ffffff !important;
          
          page-break-after: always !important;
          break-after: page !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .print-page-container:last-child {
          page-break-after: avoid !important;
          break-after: avoid !important;
          max-height: 99.4vh !important;
        }
        .page-margin-content {
          width: 100% !important;
          height: 100% !important;
          box-sizing: border-box !important;
          position: relative !important;
        }
        /* 绝对定位物理元素 */
        .print-element {
          position: absolute !important;
          box-sizing: border-box !important;
        }
        .el-text-render {
          width: 100% !important;
          height: 100% !important;
          display: flex;
        }
        .el-image-render img {
          width: 100% !important;
          height: 100% !important;
          object-fit: fill !important;
        }
        .barcode-render-container {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .barcode-label {
          font-family: monospace !important;
          font-size: 9px !important;
          text-align: center !important;
          margin-top: 1px !important;
        }
        /* 表格完美样式，支持避开 tr 被切半的经典痛点 */
        .real-print-table {
          width: 100% !important;
          border-collapse: collapse !important;
          font-size: 11px !important;
          line-height: 1.2 !important;
        }
        .real-print-table th {
          background-color: #f1f5f9 !important;
          color: #000000 !important;
          border: 1px solid #94a3b8 !important;
          padding: 5px 4px !important;
          font-weight: bold !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .real-print-table td {
          border: 1px solid #94a3b8 !important;
          padding: 5px 4px !important;
          color: #000000 !important;
          white-space: pre-wrap !important;
          word-break: break-all !important;
        }
        .real-print-table tr {
          /* 强力避开跨页时行内容被劈成两半的痛点！ */
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .preview-debug-indicator {
          display: none !important;
        }
      </style>
    </head>
    <body>
      <div class="preview-pages-list">
        ${printHtml}
      </div>
    </body>
    </html>
  `);
  iframeDoc.close();
  
  // 4. 等待 iframe 中所有矢量图 (条码、二维码) 绘制妥当后，调起 iframe 专属打印
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    // 5. 打印完成或取消后销毁临时 iframe
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1500);
  }, 400);
};
</script>

<style>
/* 预览覆盖视图层 */
.print-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #1e293b;
  display: flex;
  flex-direction: column;
  z-index: 9999;
  overflow: hidden;
}

/* 顶部预览控制台 */
.preview-actions-bar {
  height: 56px;
  background-color: #0c1832;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 10000;
}

.actions-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-preview-back {
  background-color: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-preview-back:hover {
  background-color: rgba(255,255,255,0.18);
}

.preview-title {
  font-size: 15px;
  font-weight: 700;
  color: #f59e0b;
}

.btn-print-trigger {
  padding: 8px 20px;
}

/* 滚动预览视口 */
.preview-scroll-viewport {
  flex: 1;
  overflow-y: auto;
  padding: 40px 0;
  display: flex;
  justify-content: center;
  background-color: #0f172a;
}

.preview-pages-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 物理纸张 A4 容器（高逼真还原） */
.print-page-container {
  background-color: #ffffff;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0; /* 强制锁死物理大小，防止 Flex 高度压缩！ */
}

/* 打印矢量元素 */
.print-element {
  box-sizing: border-box;
}

.el-text-render {
  width: 100%;
  height: 100%;
}

.el-image-render img {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

/* 矢量条码 */
.barcode-render-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.barcode-label {
  font-family: monospace;
  font-size: 9px;
  text-align: center;
  color: #000000;
  margin-top: 1px;
}

/* 物理分割明细表渲染样式 */
.real-print-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  line-height: 1.2;
}

.real-print-table th {
  background-color: #f1f5f9 !important;
  color: #000000;
  border: 1px solid #94a3b8;
  padding: 5px 4px;
  font-weight: bold;
}

.real-print-table td {
  border: 1px solid #94a3b8;
  padding: 5px 4px;
  color: #000000;
  white-space: pre-wrap;
  word-break: break-all;
}

/* ==========================================
   CSS 打印媒介控制核心 (矢量无损打印)
   ========================================== */
@media print {
  /* 隐藏屏幕上的所有非打印 UI，如侧栏、按钮、控制台 */
  .report-designer-app,
  .designer-header,
  .designer-main,
  .preview-actions-bar {
    display: none !important;
  }
  
  body, html {
    background-color: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .print-preview-overlay {
    position: static !important;
    width: auto !important;
    height: auto !important;
    background-color: transparent !important;
    overflow: visible !important;
    display: block !important;
  }
  
  .preview-scroll-viewport {
    background-color: transparent !important;
    padding: 0 !important;
    overflow: visible !important;
    display: block !important;
  }
  
  .preview-pages-list {
    gap: 0 !important;
    display: block !important;
  }
  
  /* 打印物理页面分页机制 */
  .print-page-container {
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
    background-color: #ffffff !important;
    
    /* 强力控制物理分页断点 */
    page-break-after: always !important;
    break-after: page !important;
    
    /* 打印定位 */
    position: relative !important;
    overflow: hidden !important;
  }
  .print-page-container:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }
  
  /* 强制打印背景背景色 */
  th {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
