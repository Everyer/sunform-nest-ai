<template>
  <div 
    class="design-canvas-wrapper" 
    :style="wrapperStyle"
    @dragover.prevent="onDragOver"
    @drop="onDrop"
    @click="deselectAll"
  >
    <!-- 纸张容器 -->
    <div 
      ref="paperRef"
      class="paper-canvas" 
      :style="paperStyle"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
    >
      <!-- 背景物理网格线 -->
      <div v-if="showGrid" class="grid-layer" :style="gridStyle"></div>

      <!-- 拖拽水平/垂直对齐辅助线 -->
      <div v-if="activeAlignLine.h.show" class="align-line align-line-h" :style="{ top: activeAlignLine.h.y + 'px' }"></div>
      <div v-if="activeAlignLine.v.show" class="align-line align-line-v" :style="{ left: activeAlignLine.v.x + 'px' }"></div>

      <!-- 渲染组件元素列表 -->
      <div 
        v-for="el in elements" 
        :key="el.id"
        class="canvas-element"
        :class="{ 
          'is-active': activeId === el.id,
          'is-dragging': draggingId === el.id,
          'is-hovered': hoveredId === el.id
        }"
        :style="getElementStyle(el)"
        @mousedown.stop="startDrag($event, el, 'move')"
        @click.stop="selectElement(el)"
      >
        <!-- 文本元素 -->
        <div 
          v-if="el.type === 'text'" 
          class="el-content el-text"
          :style="getTextStyle(el)"
        >
          {{ el.value }}
        </div>

        <!-- 页码元素 -->
        <div 
          v-else-if="el.type === 'page-number'" 
          class="el-content el-text"
          :style="getTextStyle(el)"
        >
          <span class="page-num-placeholder">第 X 页 / 共 Y 页</span>
        </div>

        <!-- 图片元素 -->
        <div v-else-if="el.type === 'image'" class="el-content el-image">
          <img :src="el.value || 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect width=%22100%22 height=%22100%22 fill=%22%23e2e8f0%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2212%22 text-anchor=%22middle%22 fill=%22%2394a3b8%22>图片占位</text></svg>'" alt="Image" />
        </div>

        <!-- 横向分割线 -->
        <div v-else-if="el.type === 'line-h'" class="el-content el-line-h" :style="{ borderBottom: (el.borderWidth || 1) + 'px ' + (el.borderStyle || 'solid') + ' ' + (el.fontColor || '#000000') }"></div>
        
        <!-- 纵向分割线 -->
        <div v-else-if="el.type === 'line-v'" class="el-content el-line-v" :style="{ borderRight: (el.borderWidth || 1) + 'px ' + (el.borderStyle || 'solid') + ' ' + (el.fontColor || '#000000') }"></div>

        <!-- 矩形边框框 -->
        <div 
          v-else-if="el.type === 'rect'" 
          class="el-content el-rect"
          :style="{ 
            border: (el.borderWidth || 1) + 'px ' + (el.borderStyle || 'solid') + ' ' + (el.fontColor || '#000000'),
            backgroundColor: el.backgroundColor || 'transparent'
          }"
        ></div>

        <!-- 二维码组件 -->
        <div v-else-if="el.type === 'qrcode'" class="el-content el-qrcode">
          <svg :viewBox="`0 0 ${getQrData(el.value).size} ${getQrData(el.value).size}`" width="100%" height="100%">
            <path :d="getQrSvgPath(el.value)" fill="#000000" />
          </svg>
        </div>

        <!-- 条形码组件 -->
        <div v-else-if="el.type === 'barcode'" class="el-content el-barcode">
          <svg viewBox="0 0 115 50" width="100%" height="100%" preserveAspectRatio="none">
            <g fill="#000000">
              <rect 
                v-for="(bar, idx) in getBarcodeData(el.value).bars" 
                :key="idx" 
                :x="bar.x * (115 / getBarcodeData(el.value).totalWidth)" 
                :y="0" 
                :width="bar.width * (115 / getBarcodeData(el.value).totalWidth)" 
                height="40" 
              />
            </g>
          </svg>
          <div v-if="el.showText !== false" class="barcode-text">{{ el.value }}</div>
        </div>

        <!-- 表格明细元素 -->
        <div v-else-if="el.type === 'table'" class="el-content el-table">
          <!-- 画布级表格顶部浮动总控栏 (仅在激活选中时显示) -->
          <div class="table-canvas-actions" v-if="activeId === el.id" @click.stop>
            <button class="canvas-action-btn btn-primary" title="在表头底部添加一个新行" @click="addHeaderRow(el)">➕ 表头行</button>
            <button class="canvas-action-btn btn-primary" title="在明细表格最右侧追加一个物理列" @click="addTableColumnOnCanvas(el)">➕ 物理列</button>
            <button class="canvas-action-btn btn-danger" title="移除明细表格最右侧的那一列" @click="popLastTableColumn(el)">❌ 删物理列</button>
            <button class="canvas-action-btn" v-if="!el.headerRows" @click="enableComplexHeader(el)">✨ 开启多行合并表头</button>
            <button class="canvas-action-btn" v-else @click="disableComplexHeader(el)">❌ 禁用复杂表头</button>
          </div>

          <table class="design-table">
            <colgroup>
              <col 
                v-for="(col, index) in el.columns" 
                :key="index"
                :style="{ width: col.width + 'px' }"
              />
            </colgroup>
            <thead>
              <!-- 原生多行表头结构 -->
              <template v-if="el.headerRows">
                <tr v-for="(hRow, rIdx) in el.headerRows" :key="rIdx">
                  <th
                    v-for="(cell, cIdx) in hRow"
                    :key="cIdx"
                    :rowspan="cell.rowspan || 1"
                    :colspan="cell.colspan || 1"
                    :style="{ 
                      textAlign: cell.align || 'center',
                      backgroundColor: cell.backgroundColor || '#f8fafc',
                      fontWeight: cell.fontWeight || 'bold',
                      color: cell.color || '#334155',
                      fontSize: (cell.fontSize || 10) + 'px',
                      borderRight: '1px solid #cbd5e1',
                      borderBottom: '1px solid #cbd5e1',
                      padding: '6px 4px',
                      position: 'relative'
                    }"
                    title="双击修改文字 | Hover显示网格合并/列宽微型工具栏"
                    @dblclick.stop="startEditHeaderCell(el.id, rIdx, cIdx)"
                  >
                    <template v-if="editingCell && editingCell.elId === el.id && editingCell.type === 'headerRow' && editingCell.rIdx === rIdx && editingCell.cIdx === cIdx">
                      <input 
                        type="text" 
                        v-model="cell.title" 
                        @blur="stopEditing" 
                        @keyup.enter="stopEditing" 
                        @keyup.esc="cancelEditing"
                        class="inline-cell-editor"
                        v-focus
                        @click.stop
                        @mousedown.stop
                      />
                    </template>
                    <template v-else>
                      {{ cell.title }}
                    </template>

                    <!-- 画布级合并表头单元格微型 Hover 工具栏 (仅在激活状态且未在编辑文字时显示) -->
                    <div v-if="activeId === el.id && !editingCell" class="canvas-cell-toolbar" @click.stop @mousedown.stop @dblclick.stop>
                      <button class="cell-tool-btn" title="合并上下(增加跨行)" @click.stop="adjustCellSpan(el, 'rowspan', rIdx, cIdx, 1)">▲</button>
                      <span class="cell-tool-label">行:{{ cell.rowspan || 1 }}</span>
                      <button class="cell-tool-btn" title="合并上下(减少跨行)" @click.stop="adjustCellSpan(el, 'rowspan', rIdx, cIdx, -1)">▼</button>
                      
                      <span class="cell-tool-divider">|</span>
                      
                      <button class="cell-tool-btn" title="合并左右(减少跨列)" @click.stop="adjustCellSpan(el, 'colspan', rIdx, cIdx, -1)">◀</button>
                      <span class="cell-tool-label">列:{{ cell.colspan || 1 }}</span>
                      <button class="cell-tool-btn" title="合并左右(增加跨列)" @click.stop="adjustCellSpan(el, 'colspan', rIdx, cIdx, 1)">▶</button>
                      
                      <span class="cell-tool-divider">|</span>
                      
                      <button class="cell-tool-btn" title="缩窄列宽" @click.stop="adjustColumnWidthFromCell(el, rIdx, cIdx, -10)">➖</button>
                      <span class="cell-tool-label" style="font-size: 8px; color: #38bdf8;">{{ getCellWidthLabel(el, rIdx, cIdx) }}</span>
                      <button class="cell-tool-btn" title="增宽列宽" @click.stop="adjustColumnWidthFromCell(el, rIdx, cIdx, 10)">➕</button>
                      
                      <span class="cell-tool-divider">|</span>
                      
                      <button class="cell-tool-btn tool-btn-add" title="在此单元格右侧新增表头单元格" @click.stop="addHeaderCellAfter(el, rIdx, cIdx)">➕</button>
                      <span class="cell-tool-divider">|</span>
                      <button class="cell-tool-btn tool-btn-del" style="background-color: rgba(239, 68, 68, 0.15) !important; border: 1px solid rgba(239, 68, 68, 0.3) !important; color: #f87171 !important; padding: 2px 6px !important; font-size: 9px !important; width: auto !important; height: 18px !important; border-radius: 4px !important; line-height: 1 !important; display: inline-flex !important; align-items: center !important;" title="仅移除当前表头格子单元格 (不删除整列数据)" @click.stop="deleteHeaderCell(el, rIdx, cIdx)">❌单元</button>
                      <button class="cell-tool-btn tool-btn-del" style="background-color: rgba(239, 68, 68, 0.3) !important; border: 1px solid rgba(239, 68, 68, 0.5) !important; color: #fca5a5 !important; font-weight: bold !important; padding: 2px 6px !important; font-size: 9px !important; width: auto !important; height: 18px !important; border-radius: 4px !important; line-height: 1 !important; display: inline-flex !important; align-items: center !important;" title="删除当前格子所在的整条物理列" @click.stop="deleteTableColumnFromCell(el, rIdx, cIdx)">❌列</button>
                    </div>
                  </th>
                </tr>
              </template>
              <!-- 默认单行表头 -->
              <template v-else>
                <tr>
                  <th 
                    v-for="(col, index) in el.columns" 
                    :key="index"
                    :style="{ textAlign: col.align, position: 'relative' }"
                    title="双击修改列标题 | Hover显示物理列管理工具栏"
                    @dblclick.stop="startEditColumnHeader(el.id, index)"
                  >
                    <template v-if="editingCell && editingCell.elId === el.id && editingCell.type === 'column' && editingCell.cIdx === index">
                      <input 
                        type="text" 
                        v-model="col.title" 
                        @blur="stopEditing" 
                        @keyup.enter="stopEditing" 
                        @keyup.esc="cancelEditing"
                        class="inline-cell-editor"
                        v-focus
                        @click.stop
                        @mousedown.stop
                      />
                    </template>
                    <template v-else>
                      {{ col.title }}
                    </template>

                    <!-- 画布级单行常规表头单元格微型 Hover 工具栏 -->
                    <div v-if="activeId === el.id && !editingCell" class="canvas-cell-toolbar" @click.stop @mousedown.stop @dblclick.stop>
                      <button class="cell-tool-btn" title="物理列缩窄" @click.stop="adjustColumnWidthFromCell(el, 0, index, -10)">➖</button>
                      <span class="cell-tool-label" style="font-size: 8px; color: #38bdf8;">{{ col.width }}px</span>
                      <button class="cell-tool-btn" title="物理列增宽" @click.stop="adjustColumnWidthFromCell(el, 0, index, 10)">➕</button>
                      
                      <span class="cell-tool-divider">|</span>
                      
                      <button class="cell-tool-btn tool-btn-add" title="在此列右侧插入新列" @click.stop="addTableColumnOnCanvasAfter(el, index)">➕</button>
                      <button class="cell-tool-btn tool-btn-del" title="删除当前物理列" @click.stop="deleteTableColumnOnCanvas(el, index)">❌</button>
                    </div>
                  </th>
                </tr>
              </template>
            </thead>
            <tbody>
              <!-- 示意行数据 -->
              <tr v-for="rowIdx in [1, 2]" :key="rowIdx">
                <template v-for="(col, cIdx) in el.columns" :key="cIdx">
                  <td 
                    v-if="shouldRenderColumn(el.columns, cIdx)"
                    :colspan="col.colspan || 1"
                    :style="{ 
                      textAlign: col.align,
                      writingMode: col.writingMode || 'horizontal-tb',
                      textOrientation: col.writingMode ? 'upright' : 'mixed',
                      whiteSpace: col.writingMode ? 'nowrap' : 'normal',
                      padding: col.writingMode ? '10px 4px' : '6px 4px'
                    }"
                  >
                    <span class="placeholder-td">数据明细字段</span>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 8方向调整拉伸把手 -->
        <template v-if="activeId === el.id">
          <div 
            v-for="handle in dragHandles" 
            :key="handle"
            class="drag-handle"
            :class="`handle-${handle}`"
            @mousedown.stop="startDrag($event, el, handle)"
          ></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { QRCodeAlg } from '../utils/qrcode.js';
import { BarcodeAlg } from '../utils/barcode.js';

const props = defineProps({
  elements: {
    type: Array,
    required: true
  },
  activeId: {
    type: String,
    default: ''
  },
  hoveredId: {
    type: String,
    default: ''
  },
  zoom: {
    type: Number,
    default: 1
  },
  paperWidth: {
    type: Number,
    default: 210 // mm
  },
  paperHeight: {
    type: Number,
    default: 297 // mm
  },
  showGrid: {
    type: Boolean,
    default: true
  },
  gridSize: {
    type: Number,
    default: 5 // 网格大小 mm，默认 5mm
  },
  snapToGrid: {
    type: Boolean,
    default: true
  }
});

// 智能跨列合并过滤 (跳过被前面列 colspan 覆盖的列渲染)
const shouldRenderColumn = (columns, cIdx) => {
  for (let i = 0; i < cIdx; i++) {
    const col = columns[i];
    if (col.colspan && i + col.colspan > cIdx) {
      return false;
    }
  }
  return true;
};

// ==========================================
// 表格单元格画布直接双击编辑逻辑
// ==========================================
const editingCell = ref(null); // { elId, type: 'headerRow' | 'column', rIdx, cIdx }
const originalCellTitle = ref(''); // 用于备份双击编辑前的初始内容，在Esc按下时完美复原

const startEditHeaderCell = (elId, rIdx, cIdx) => {
  editingCell.value = { elId, type: 'headerRow', rIdx, cIdx };
  
  // 深度备份原初始值，以便按下 Esc 时完美撤销
  const table = props.elements.find(item => item.id === elId);
  if (table && table.headerRows && table.headerRows[rIdx] && table.headerRows[rIdx][cIdx]) {
    originalCellTitle.value = table.headerRows[rIdx][cIdx].title || '';
  }
};

const startEditColumnHeader = (elId, cIdx) => {
  editingCell.value = { elId, type: 'column', cIdx };
  
  // 深度备份原初始值，以便按下 Esc 时完美撤销
  const table = props.elements.find(item => item.id === elId);
  if (table && table.columns && table.columns[cIdx]) {
    originalCellTitle.value = table.columns[cIdx].title || '';
  }
};

const stopEditing = () => {
  if (editingCell.value) {
    const el = props.elements.find(item => item.id === editingCell.value.elId);
    if (el) {
      triggerElementsUpdate(JSON.parse(JSON.stringify(el))); // 退出时保存并强制深拷贝广播刷新，同步预览
    }
  }
  editingCell.value = null;
};

const cancelEditing = () => {
  if (editingCell.value) {
    const el = props.elements.find(item => item.id === editingCell.value.elId);
    if (el) {
      // 还原文本为备份前的初始内容，撤销误输入
      if (editingCell.value.type === 'headerRow') {
        el.headerRows[editingCell.value.rIdx][editingCell.value.cIdx].title = originalCellTitle.value;
      } else if (editingCell.value.type === 'column') {
        el.columns[editingCell.value.cIdx].title = originalCellTitle.value;
      }
      triggerElementsUpdate(JSON.parse(JSON.stringify(el))); // 还原物理指针广播刷新
    }
  }
  editingCell.value = null;
};

// ==========================================
// 画布级交互式表格网格合并与物理列宽调整方法
// ==========================================

// 获取单元格对应的起始物理列索引 (高级物理轨对齐追踪算法，完美解决 rowspan/colspan 混合多行表头定位偏移，让黑悬浮窗微调对准列道)
const getStartColIndex = (el, rIdx, cIdx) => {
  if (!el.headerRows) return cIdx;
  
  const rowsCount = el.headerRows.length;
  const colsCount = el.columns ? el.columns.length : 50;
  
  // grid[r][c] = true 表示该物理格已被上层 rowspan 覆盖占领
  const grid = Array.from({ length: rowsCount }, () => Array(colsCount).fill(false));
  
  // 填充网格
  for (let r = 0; r < rowsCount; r++) {
    const row = el.headerRows[r];
    let currentPhysicalCol = 0;
    
    for (let c = 0; c < row.length; c++) {
      // 找到当前行 r 在 currentPhysicalCol 开始后第一个未被上层 rowspan 覆盖的空闲轨
      while (currentPhysicalCol < colsCount && grid[r][currentPhysicalCol]) {
        currentPhysicalCol++;
      }
      
      const cell = row[c];
      const rowspan = cell.rowspan || 1;
      const colspan = cell.colspan || 1;
      
      // 标记该 cell 占用的所有网格为 true
      for (let h = 0; h < rowspan; h++) {
        for (let w = 0; w < colspan; w++) {
          if (r + h < rowsCount && currentPhysicalCol + w < colsCount) {
            grid[r + h][currentPhysicalCol + w] = true;
          }
        }
      }
      
      // 如果正好是我们要寻找的目标单元格，直接返回它的物理起始轨道
      if (r === rIdx && c === cIdx) {
        return currentPhysicalCol;
      }
      
      currentPhysicalCol += colspan;
    }
  }
  
  return cIdx; // 回退安全保护
};

// 获取单元格占用的总物理宽度标签
const getCellWidthLabel = (el, rIdx, cIdx) => {
  let colIdx = getStartColIndex(el, rIdx, cIdx);
  if (el.columns && el.columns[colIdx]) {
    if (el.headerRows) {
      const cell = el.headerRows[rIdx][cIdx];
      const span = cell.colspan || 1;
      let totalWidth = 0;
      for (let i = 0; i < span; i++) {
        if (el.columns[colIdx + i]) {
          totalWidth += el.columns[colIdx + i].width || 50;
        }
      }
      return totalWidth + 'px';
    } else {
      return el.columns[colIdx].width + 'px';
    }
  }
  return '50px';
};

// 辅助更新机制：生成被改动元素的克隆引用，从而 100% 唤起 Vue 3 的深层依赖收集与重绘，彻底解决列表错位与冗余空白列
const triggerElementsUpdate = (clonedEl) => {
  const newElements = props.elements.map(item => {
    if (item.id === clonedEl.id) {
      return clonedEl; // 直接替换为深拷贝副本，彻底切断所有原对象引用！
    }
    return item;
  });
  emit('update:elements', newElements);
};

// 画布直接微调物理列宽
const adjustColumnWidthFromCell = (el, rIdx, cIdx, delta) => {
  const cloned = JSON.parse(JSON.stringify(el));
  let colIdx = getStartColIndex(cloned, rIdx, cIdx);
  if (cloned.columns && cloned.columns[colIdx]) {
    cloned.columns[colIdx].width = Math.max(20, (cloned.columns[colIdx].width || 50) + delta);
    triggerElementsUpdate(cloned);
  }
};

// 画布直接微调单元格跨度
const adjustCellSpan = (el, type, rIdx, cIdx, delta) => {
  const cloned = JSON.parse(JSON.stringify(el));
  if (!cloned.headerRows) return;
  const cell = cloned.headerRows[rIdx][cIdx];
  if (type === 'colspan') {
    cell.colspan = Math.max(1, (cell.colspan || 1) + delta);
  } else if (type === 'rowspan') {
    cell.rowspan = Math.max(1, (cell.rowspan || 1) + delta);
  }
  triggerElementsUpdate(cloned);
};

// 在特定单元格右侧新增表头单元格
const addHeaderCellAfter = (el, rIdx, cIdx) => {
  const cloned = JSON.parse(JSON.stringify(el));
  if (!cloned.headerRows) return;
  cloned.headerRows[rIdx].splice(cIdx + 1, 0, {
    title: '新单元格',
    rowspan: 1,
    colspan: 1,
    align: 'center',
    backgroundColor: '#eff6ff',
    fontWeight: 'bold'
  });
  triggerElementsUpdate(cloned);
};

// 直接删除表头单元格 (智能过滤全空行以完美退回上级表头数)
const deleteHeaderCell = (el, rIdx, cIdx) => {
  const cloned = JSON.parse(JSON.stringify(el));
  if (!cloned.headerRows) return;
  cloned.headerRows[rIdx].splice(cIdx, 1);
  
  const filtered = cloned.headerRows.filter(row => row.length > 0);
  cloned.headerRows = filtered;
  if (cloned.headerRows.length === 0) {
    delete cloned.headerRows;
  }
  
  triggerElementsUpdate(cloned);
};

// 一键在表头最下方添加行 (高维智能物理轨对齐铺满算法，完美攻克右侧大面积悬空空白、彻底释放多行内容新增自由)
const addHeaderRow = (el) => {
  const cloned = JSON.parse(JSON.stringify(el));
  if (!cloned.headerRows) {
    enableComplexHeader(el);
    return;
  }
  
  const newRowIdx = cloned.headerRows.length;
  const colsCount = cloned.columns ? cloned.columns.length : 7;
  
  // 1. 构建前几行纵向跨行覆盖到新行的 occupied 物理轨道列索引
  let occupiedCols = [];
  for (let prevR = 0; prevR < newRowIdx; prevR++) {
    const prevRow = cloned.headerRows[prevR];
    let prevColTrack = 0;
    for (let cell of prevRow) {
      const cellRowspan = cell.rowspan || 1;
      const cellColspan = cell.colspan || 1;
      if (prevR + cellRowspan > newRowIdx) {
        for (let c = 0; c < cellColspan; c++) {
          occupiedCols.push(prevColTrack + c);
        }
      }
      prevColTrack += cellColspan;
    }
  }
  
  // 2. 为每一个未被上层纵向跨行占用的空闲物理轨道列分配一个独立的 colspan=1 的新单元格
  const newRowCells = [];
  for (let c = 0; c < colsCount; c++) {
    if (!occupiedCols.includes(c)) {
      newRowCells.push({
        title: '新单元格',
        rowspan: 1,
        colspan: 1,
        align: 'center',
        backgroundColor: '#eff6ff',
        fontWeight: 'bold'
      });
    }
  }
  
  // 保底容错
  if (newRowCells.length === 0) {
    newRowCells.push({
      title: '新表头单元格',
      rowspan: 1,
      colspan: 1,
      align: 'center',
      backgroundColor: '#eff6ff',
      fontWeight: 'bold'
    });
  }
  
  cloned.headerRows.push(newRowCells);
  triggerElementsUpdate(cloned);
};

// 直接删除特定表头行
const deleteHeaderRow = (el, rIdx) => {
  const cloned = JSON.parse(JSON.stringify(el));
  if (!cloned.headerRows) return;
  cloned.headerRows.splice(rIdx, 1);
  if (cloned.headerRows.length === 0) {
    delete cloned.headerRows;
  }
  triggerElementsUpdate(cloned);
};

// 一键在表格末尾添加物理数据列
const addTableColumnOnCanvas = (el) => {
  const cloned = JSON.parse(JSON.stringify(el));
  if (!cloned.columns) cloned.columns = [];
  cloned.columns.push({
    title: '新列',
    field: 'detail.goodsCode',
    width: 100,
    align: 'center',
    autoMerge: false
  });
  if (cloned.headerRows) {
    cloned.headerRows[0].push({
      title: '新表头',
      rowspan: cloned.headerRows.length,
      colspan: 1,
      align: 'center',
      backgroundColor: '#eff6ff',
      fontWeight: 'bold'
    });
  }
  triggerElementsUpdate(cloned);
};

// 在指定物理列后插入新物理列
const addTableColumnOnCanvasAfter = (el, index) => {
  const cloned = JSON.parse(JSON.stringify(el));
  if (!cloned.columns) cloned.columns = [];
  cloned.columns.splice(index + 1, 0, {
    title: '新列',
    field: 'detail.goodsCode',
    width: 100,
    align: 'center',
    autoMerge: false
  });
  if (cloned.headerRows && cloned.headerRows[0]) {
    const row = cloned.headerRows[0];
    let colTrack = 0;
    let targetCellIdx = -1;
    for (let cIdx = 0; cIdx < row.length; cIdx++) {
      const cell = row[cIdx];
      const span = cell.colspan || 1;
      if (colTrack <= index && colTrack + span > index) {
        targetCellIdx = cIdx;
        break;
      }
      colTrack += span;
    }
    
    if (targetCellIdx !== -1) {
      row.splice(targetCellIdx + 1, 0, {
        title: '新表头',
        rowspan: cloned.headerRows.length,
        colspan: 1,
        align: 'center',
        backgroundColor: '#eff6ff',
        fontWeight: 'bold'
      });
    } else {
      row.push({
        title: '新表头',
        rowspan: cloned.headerRows.length,
        colspan: 1,
        align: 'center',
        backgroundColor: '#eff6ff',
        fontWeight: 'bold'
      });
    }
  }
  triggerElementsUpdate(cloned);
};

// 从特定单元格物理定位并删除当前这一整列 (高阶映射绑定，完美回应用户关于“我要删哪列就点哪列❌”的诉求)
const deleteTableColumnFromCell = (el, rIdx, cIdx) => {
  const colIdx = getStartColIndex(el, rIdx, cIdx);
  console.log('[DEBUG-CANVAS] deleteTableColumnFromCell mapped colIdx:', colIdx);
  deleteTableColumnOnCanvas(el, colIdx);
};

// 删除特定物理列 (使用跨越及Rowspan跳过追踪算法，物理移除该列对应的合并单元格)
const deleteTableColumnOnCanvas = (el, index) => {
  const cloned = JSON.parse(JSON.stringify(el));
  if (!cloned.columns || cloned.columns.length === 0) return;
  const targetColIdx = index;
  console.log('[DEBUG-CANVAS] deleteTableColumnOnCanvas targetColIdx:', targetColIdx);
  console.log('[DEBUG-CANVAS] columns before:', JSON.stringify(cloned.columns.map(c => ({ title: c.title, width: c.width }))));
  
  cloned.columns.splice(index, 1);
  console.log('[DEBUG-CANVAS] columns after:', JSON.stringify(cloned.columns.map(c => ({ title: c.title, width: c.width }))));

  if (cloned.headerRows) {
    console.log('[DEBUG-CANVAS] headerRows before:', JSON.stringify(cloned.headerRows));
    for (let rIdx = 0; rIdx < cloned.headerRows.length; rIdx++) {
      const row = cloned.headerRows[rIdx];
      if (row.length === 0) continue;
      
      let occupiedCols = [];
      for (let prevR = 0; prevR < rIdx; prevR++) {
        const prevRow = cloned.headerRows[prevR];
        let prevColTrack = 0;
        for (let cell of prevRow) {
          const cellRowspan = cell.rowspan || 1;
          const cellColspan = cell.colspan || 1;
          if (prevR + cellRowspan > rIdx) {
            for (let c = 0; c < cellColspan; c++) {
              occupiedCols.push(prevColTrack + c);
            }
          }
          prevColTrack += cellColspan;
        }
      }

      let colTrack = 0;
      let cellIndexForTargetCol = -1;
      
      for (let cIdx = 0; cIdx < row.length; cIdx++) {
        while (occupiedCols.includes(colTrack)) {
          colTrack++;
        }
        
        const cell = row[cIdx];
        const span = cell.colspan || 1;
        
        if (colTrack <= targetColIdx && colTrack + span > targetColIdx) {
          cellIndexForTargetCol = cIdx;
          break;
        }
        colTrack += span;
      }

      if (cellIndexForTargetCol !== -1) {
        const cell = row[cellIndexForTargetCol];
        if ((cell.colspan || 1) > 1) {
          cell.colspan = (cell.colspan || 1) - 1;
        } else {
          row.splice(cellIndexForTargetCol, 1);
        }
      }
    }

    const clonedRowsFilter = cloned.headerRows.filter(row => row.length > 0);
    cloned.headerRows = clonedRowsFilter;
    if (cloned.headerRows.length === 0) {
      delete cloned.headerRows;
    }
    console.log('[DEBUG-CANVAS] headerRows after:', JSON.stringify(cloned.headerRows));
  }
  triggerElementsUpdate(cloned);
};

// 物理上移除末尾列 (完美同步多维合并表头的 Rowspan 与 Colspan 关系)
const popLastTableColumn = (el) => {
  if (!el.columns || el.columns.length === 0) return;
  const targetColIdx = el.columns.length - 1;
  deleteTableColumnOnCanvas(el, targetColIdx);
};

// 开启多行复杂表头，将现有单行 columns 转化为第一行表头
const enableComplexHeader = (el) => {
  const cloned = JSON.parse(JSON.stringify(el));
  if (cloned.headerRows) return;
  cloned.headerRows = [
    cloned.columns.map(col => ({
      title: col.title || '表头',
      rowspan: 1,
      colspan: 1,
      align: col.align || 'center',
      backgroundColor: '#eff6ff',
      fontWeight: 'bold'
    }))
  ];
  triggerElementsUpdate(cloned);
};

// 禁用多行复杂表头
const disableComplexHeader = (el) => {
  if (confirm('确定要禁用多行复杂表头吗？这会清除您配置的多行表头网格！')) {
    const cloned = JSON.parse(JSON.stringify(el));
    delete cloned.headerRows;
    triggerElementsUpdate(cloned);
  }
};

// 自动聚焦指令
const vFocus = {
  mounted: (el) => el.focus()
};

const emit = defineEmits(['update:elements', 'update:activeId', 'mouse-position']);

const paperRef = ref(null);
const draggingId = ref('');
const MM_TO_PX = 3.779527559; // 1mm ≈ 3.78px

// 8方向拉伸把手
const dragHandles = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'];

// 拖拽对齐辅助线
const activeAlignLine = ref({
  h: { show: false, y: 0 },
  v: { show: false, x: 0 }
});

// 计算像素级纸张尺寸
const paperPxWidth = computed(() => props.paperWidth * MM_TO_PX);
const paperPxHeight = computed(() => props.paperHeight * MM_TO_PX);

const wrapperStyle = computed(() => ({
  transform: `scale(${props.zoom})`,
  transformOrigin: 'top center',
  padding: '40px 0' // 对应 Ruler 的 canvasMarginTop/Left 逻辑外边距
}));

const paperStyle = computed(() => ({
  width: paperPxWidth.value + 'px',
  height: paperPxHeight.value + 'px',
  position: 'relative',
  backgroundColor: '#ffffff',
  boxShadow: '0 8px 32px rgba(12, 24, 50, 0.08)',
  border: '1px solid #e8ecf2',
  overflow: 'visible' /* 允许微型工具栏、悬浮总控等绝对定位元素越过纸张边界完整显示，不被裁剪 */
}));

// 网格层背景图
const gridStyle = computed(() => {
  const size = props.gridSize * MM_TO_PX;
  return {
    backgroundSize: `${size}px ${size}px`,
    backgroundImage: `
      linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
    `
  };
});

// 生成条形码渲染结构
const getBarcodeData = (value) => {
  try {
    return BarcodeAlg.getSvgBars(value || "SO-20260524");
  } catch (e) {
    return { totalWidth: 115, bars: [] };
  }
};

// 生成二维码点阵
const getQrData = (value) => {
  try {
    return QRCodeAlg.generate(value || "SO-20260524");
  } catch (e) {
    return { size: 21, matrix: [] };
  }
};

// 将二维码 0/1 点阵绘制为 SVG 路径字符串，提高大渲染效率
const getQrSvgPath = (value) => {
  const qr = getQrData(value);
  let path = "";
  for (let r = 0; r < qr.size; r++) {
    for (let c = 0; c < qr.size; c++) {
      if (qr.matrix[r][c]) {
        path += `M${c} ${r}h1v1h-1z`; // 绘制一个像素块
      }
    }
  }
  return path;
};

// 组件元素样式
const getElementStyle = (el) => ({
  left: el.x + 'px',
  top: el.y + 'px',
  width: el.width + 'px',
  height: el.height + 'px',
  zIndex: el.zIndex || 10,
  transform: el.rotate ? `rotate(${el.rotate}deg)` : 'none'
});

const getTextStyle = (el) => ({
  fontSize: (el.fontSize || 14) + 'px',
  color: el.fontColor || '#000000',
  fontWeight: el.fontWeight || 'normal',
  fontStyle: el.fontStyle || 'normal',
  textDecoration: el.textDecoration || 'none',
  textAlign: el.align || 'left',
  justifyContent: el.align === 'center' ? 'center' : el.align === 'right' ? 'flex-end' : 'flex-start',
  alignItems: el.valign === 'middle' ? 'center' : el.valign === 'bottom' ? 'flex-end' : 'flex-start'
});

// 鼠标位置监听，通知刻度尺红色细线
const onMouseMove = (e) => {
  if (!paperRef.value) return;
  const rect = paperRef.value.getBoundingClientRect();
  // 考虑到 zoom 缩放后的绝对坐标映射
  const x = (e.clientX - rect.left) / props.zoom;
  const y = (e.clientY - rect.top) / props.zoom;
  emit('mouse-position', { x, y });
};

const onMouseLeave = () => {
  emit('mouse-position', { x: -1, y: -1 });
};

// 拖放新建元素
const onDragOver = (e) => {};

const onDrop = (e) => {
  if (!paperRef.value) return;
  const rect = paperRef.value.getBoundingClientRect();
  const elDataStr = e.dataTransfer.getData('report-element');
  if (!elDataStr) return;
  
  const rawElement = JSON.parse(elDataStr);
  const pxX = (e.clientX - rect.left) / props.zoom - (rawElement.width || 120) / 2;
  const pxY = (e.clientY - rect.top) / props.zoom - (rawElement.height || 35) / 2;
  
  // 对齐网格
  let finalX = Math.max(0, pxX);
  let finalY = Math.max(0, pxY);
  
  if (props.snapToGrid) {
    const step = props.gridSize * MM_TO_PX;
    finalX = Math.round(finalX / step) * step;
    finalY = Math.round(finalY / step) * step;
  }
  
  const newElement = {
    ...rawElement,
    id: 'el_' + Date.now() + Math.random().toString(36).substr(2, 5),
    x: finalX,
    y: finalY,
    zIndex: props.elements.length + 10
  };
  
  const updated = [...props.elements, newElement];
  emit('update:elements', updated);
  emit('update:activeId', newElement.id);
};

// 选中与取消选中
const selectElement = (el) => {
  emit('update:activeId', el.id);
  stopEditing();
};

const deselectAll = () => {
  emit('update:activeId', '');
  stopEditing();
};

// 拖拽与拉伸引擎 (核心核心)
const startDrag = (event, el, handle) => {
  event.preventDefault();
  draggingId.value = el.id;
  emit('update:activeId', el.id);
  stopEditing();
  
  const startX = event.clientX;
  const startY = event.clientY;
  
  const initialX = el.x;
  const initialY = el.y;
  const initialWidth = el.width;
  const initialHeight = el.height;
  
  const onMouseMoveDrag = (e) => {
    // 扣除缩放系数 zoom
    const dx = (e.clientX - startX) / props.zoom;
    const dy = (e.clientY - startY) / props.zoom;
    
    let newX = initialX;
    let newY = initialY;
    let newW = initialWidth;
    let newH = initialHeight;
    
    const step = props.gridSize * MM_TO_PX;
    
    if (handle === 'move') {
      newX = initialX + dx;
      newY = initialY + dy;
      
      // 网格吸附
      if (props.snapToGrid) {
        newX = Math.round(newX / step) * step;
        newY = Math.round(newY / step) * step;
      }
      
      // 边界限制
      newX = Math.max(0, Math.min(paperPxWidth.value - el.width, newX));
      newY = Math.max(0, Math.min(paperPxHeight.value - el.height, newY));
      
      // 智能边缘吸附辅助线 (与其它元素对齐)
      let alignH = { show: false, y: 0 };
      let alignV = { show: false, x: 0 };
      
      const threshold = 5; // 吸附像素阈值
      
      for (const target of props.elements) {
        if (target.id === el.id) continue;
        
        // 横向对齐 (顶对顶，中对中，底对底)
        if (Math.abs(newY - target.y) < threshold) {
          newY = target.y;
          alignH = { show: true, y: target.y };
        } else if (Math.abs((newY + newH / 2) - (target.y + target.height / 2)) < threshold) {
          newY = target.y + target.height / 2 - newH / 2;
          alignH = { show: true, y: target.y + target.height / 2 };
        } else if (Math.abs((newY + newH) - (target.y + target.height)) < threshold) {
          newY = target.y + target.height - newH;
          alignH = { show: true, y: target.y + target.height };
        }
        
        // 纵向对齐 (左对左，中对中，右对右)
        if (Math.abs(newX - target.x) < threshold) {
          newX = target.x;
          alignV = { show: true, x: target.x };
        } else if (Math.abs((newX + newW / 2) - (target.x + target.width / 2)) < threshold) {
          newX = target.x + target.width / 2 - newW / 2;
          alignV = { show: true, x: target.x + target.width / 2 };
        } else if (Math.abs((newX + newW) - (target.x + target.width)) < threshold) {
          newX = target.x + target.width - newW;
          alignV = { show: true, x: target.x + target.width };
        }
      }
      
      activeAlignLine.value.h = alignH;
      activeAlignLine.value.v = alignV;
      
    } else {
      // 8 方向缩放拉伸
      // 含有 'e' (东): 拉伸宽
      if (handle.includes('e')) {
        newW = Math.max(10, initialWidth + dx);
        if (props.snapToGrid) newW = Math.round(newW / step) * step;
      }
      // 含有 's' (南): 拉伸高
      if (handle.includes('s')) {
        newH = Math.max(5, initialHeight + dy);
        if (props.snapToGrid) newH = Math.round(newH / step) * step;
      }
      // 含有 'w' (西): 向左拉伸 (宽增加且 X 坐标变小)
      if (handle.includes('w')) {
        const potentialW = initialWidth - dx;
        if (potentialW > 10) {
          newX = initialX + dx;
          newW = potentialW;
          if (props.snapToGrid) {
            const roundedX = Math.round(newX / step) * step;
            newW += (newX - roundedX);
            newX = roundedX;
          }
        }
      }
      // 含有 'n' (北): 向上拉伸 (高增加且 Y 坐标变小)
      if (handle.includes('n')) {
        const potentialH = initialHeight - dy;
        if (potentialH > 5) {
          newY = initialY + dy;
          newH = potentialH;
          if (props.snapToGrid) {
            const roundedY = Math.round(newY / step) * step;
            newH += (newY - roundedY);
            newY = roundedY;
          }
        }
      }
    }
    
    // 批量同步状态
    const updated = props.elements.map(item => {
      if (item.id === el.id) {
        return { ...item, x: newX, y: newY, width: newW, height: newH };
      }
      return item;
    });
    emit('update:elements', updated);
  };
  
  const onMouseUpDrag = () => {
    draggingId.value = '';
    activeAlignLine.value.h.show = false;
    activeAlignLine.value.v.show = false;
    document.removeEventListener('mousemove', onMouseMoveDrag);
    document.removeEventListener('mouseup', onMouseUpDrag);
  };
  
  document.addEventListener('mousemove', onMouseMoveDrag);
  document.addEventListener('mouseup', onMouseUpDrag);
};
</script>

<style scoped>
.design-canvas-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  user-select: none;
}

.paper-canvas {
  transition: box-shadow 0.2s ease;
}

/* 虚线网格层 */
.grid-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* 对齐辅助线 */
.align-line {
  position: absolute;
  background-color: transparent;
  border: 0.5px dashed #ff9900;
  pointer-events: none;
  z-index: 99;
}
.align-line-h {
  left: 0;
  width: 100%;
  height: 0;
}
.align-line-v {
  top: 0;
  width: 0;
  height: 100%;
}

/* 元素容器 */
.canvas-element {
  position: absolute;
  cursor: move;
  box-sizing: border-box;
  border: 1px dashed transparent;
}
.canvas-element:hover {
  border-color: rgba(12, 24, 50, 0.3);
  background-color: rgba(12, 24, 50, 0.01);
}
.canvas-element.is-active {
  border-color: #d97706; /* 橘金色 */
  background-color: rgba(217, 119, 6, 0.02);
  box-shadow: 0 0 8px rgba(217, 119, 6, 0.1);
  z-index: 90 !important;
}
.canvas-element.is-dragging {
  opacity: 0.85;
}
.canvas-element.is-hovered {
  border-color: #3b82f6; /* 蔚蓝色 */
  background-color: rgba(59, 130, 246, 0.02);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.15);
  z-index: 85 !important;
}

/* 单元格双击行内编辑器 */
.inline-cell-editor {
  position: absolute;
  top: 1px;
  left: 1px;
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  border: 1.5px solid #3b82f6; /* 蔚蓝色激活框 */
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: inherit;
  box-sizing: border-box;
  z-index: 100;
  outline: none;
  background-color: #ffffff;
  color: #0f172a;
  text-align: inherit;
}

/* 元素内容布局 */
.el-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  overflow: hidden;
}

.el-text {
  word-break: break-all;
  white-space: pre-wrap;
  line-height: 1.3;
}

.page-num-placeholder {
  font-size: 11px;
  color: #64748b;
  font-style: italic;
}

.el-image img {
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.el-line-h {
  width: 100%;
  height: 1px;
}
.el-line-v {
  width: 1px;
  height: 100%;
}

.el-rect {
  width: 100%;
  height: 100%;
}

/* 矢量条码/二维码 */
.el-qrcode, .el-barcode {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4px;
}
.el-barcode svg {
  flex: 1;
}
.barcode-text {
  font-family: monospace;
  font-size: 10px;
  text-align: center;
  margin-top: 2px;
}

/* 表格组件在设计态的渲染 */
.el-table {
  flex-direction: column;
  position: relative;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  overflow: visible !important; /* 关键：不允许裁剪，以便在画布边缘和外部完整显示顶部浮动总控栏与单元格微型Hover工具栏！ */
}
.design-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.design-table th {
  background-color: #f8fafc;
  color: #334155;
  border-bottom: 1px solid #cbd5e1;
  border-right: 1px solid #cbd5e1;
  padding: 6px 4px;
  font-weight: 600;
}
.design-table td {
  border-bottom: 1px solid #e2e8f0;
  border-right: 1px solid #cbd5e1;
  padding: 6px 4px;
  color: #94a3b8;
}
.placeholder-td {
  font-size: 11px;
  color: #94a3b8;
  font-style: italic;
}
.table-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(12, 24, 50, 0.7);
  color: #ffffff;
  font-size: 10px;
  text-align: center;
  padding: 2px 0;
}

/* 8方向调整拉伸点 */
.drag-handle {
  position: absolute;
  width: 7px;
  height: 7px;
  background-color: #ffffff;
  border: 1.5px solid #d97706;
  border-radius: 50%;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.handle-nw { top: -4px; left: -4px; cursor: nwse-resize; }
.handle-ne { top: -4px; right: -4px; cursor: nesw-resize; }
.handle-sw { bottom: -4px; left: -4px; cursor: nesw-resize; }
.handle-se { bottom: -4px; right: -4px; cursor: nwse-resize; }
.handle-n  { top: -4px; left: calc(50% - 4px); cursor: ns-resize; }
.handle-s  { bottom: -4px; left: calc(50% - 4px); cursor: ns-resize; }
.handle-w  { top: calc(50% - 4px); left: -4px; cursor: ew-resize; }
.handle-e  { top: calc(50% - 4px); right: -4px; cursor: ew-resize; }

/* ==========================================
   画布级交互式表格网格合并与物理列宽调整样式
   ========================================== */

/* 画布内表格顶部浮动控制面板 */
.table-canvas-actions {
  position: absolute;
  top: -38px;
  left: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(15, 23, 42, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.6);
  z-index: 999;
  pointer-events: auto;
}
.canvas-action-btn {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 2px;
}
.canvas-action-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.canvas-action-btn.btn-primary {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #bfdbfe;
  color: #1e40af;
}
.canvas-action-btn.btn-primary:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}
.canvas-action-btn.btn-danger {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fecaca;
  color: #b91c1c;
}
.canvas-action-btn.btn-danger:hover {
  background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%);
}

/* 单元格微型浮动 Hover 工具栏 */
.canvas-cell-toolbar {
  position: absolute;
  bottom: -24px; /* 缩减物理间隙，使其贴合 th 底边缘 */
  left: 50%;
  transform: translateX(-50%) scale(0.95);
  background: rgba(15, 23, 42, 0.96);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 3px 6px;
  display: none; /* 默认隐藏 */
  align-items: center;
  gap: 4px;
  z-index: 1000;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  opacity: 0;
  transition: opacity 0.15s ease, transform 0.15s ease;
  white-space: nowrap;
}
/* 鼠标悬浮桥接区：向上覆盖工具栏与 th 底部的 12px 空隙，防止 Hover 丢失 */
.canvas-cell-toolbar::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 0;
  right: 0;
  height: 12px;
  background: transparent;
}
/* 处于激活状态的表格, 其 th 被 hover 时显示工具栏 */
.is-active .design-table th:hover .canvas-cell-toolbar {
  display: flex;
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.cell-tool-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 8px;
  transition: all 0.1s ease;
}
.cell-tool-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: scale(1.08);
}
.cell-tool-label {
  font-size: 9px;
  color: #94a3b8;
  padding: 0 2px;
  font-weight: 500;
}
.cell-tool-divider {
  color: rgba(255, 255, 255, 0.2);
  font-size: 9px;
  user-select: none;
}
.cell-tool-btn.tool-btn-add {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.3);
  color: #4ade80;
  font-size: 9px;
}
.cell-tool-btn.tool-btn-add:hover {
  background: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}
.cell-tool-btn.tool-btn-del {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
  font-size: 9px;
}
.cell-tool-btn.tool-btn-del:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
</style>
