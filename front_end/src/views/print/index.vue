<template>
  <div class="report-designer-app" :class="{ 'is-preview-mode': isPreview }">
    <!-- 设计模式下的主 UI -->
    <template v-if="!isPreview">
      <!-- 顶部功能工具栏 -->
      <header class="designer-header">
        <div class="header-left">
          <div class="app-logo">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
            </svg>
            <span>打印报表设计器</span>
          </div>
          
          <div class="divider"></div>
          
          <!-- 纸张选择与横纵向 -->
          <div class="tool-group">
            <div class="select-wrapper">
              <select v-model="paperSizePreset" @change="onPaperPresetChange">
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="A3">A3 (297 × 420 mm)</option>
                <option value="A5">A5 (148 × 210 mm)</option>
                <option value="B5">B5 (176 × 250 mm)</option>
                <option value="custom">自定义尺寸</option>
              </select>
            </div>
            
            <button 
              class="icon-btn" 
              :class="{ 'is-active': !isLandscape }"
              title="纵向"
              @click="setLandscape(false)"
            >
              纵向
            </button>
            <button 
              class="icon-btn" 
              :class="{ 'is-active': isLandscape }"
              title="横向"
              @click="setLandscape(true)"
            >
              横向
            </button>
          </div>
          
          <div class="divider"></div>
          
          <!-- 缩放与网格控制 -->
          <div class="tool-group">
            <button class="icon-btn-action" title="缩小" @click="changeZoom(-0.1)">-</button>
            <span class="zoom-value">{{ Math.round(zoom * 100) }}%</span>
            <button class="icon-btn-action" title="放大" @click="changeZoom(0.1)">+</button>
            <button class="icon-btn" :class="{ 'is-active': showGrid }" title="网格线" @click="showGrid = !showGrid">
              网格
            </button>
            <button class="icon-btn" :class="{ 'is-active': snapToGrid }" title="网格吸附" @click="snapToGrid = !snapToGrid">
              吸附
            </button>
          </div>
        </div>
        
        <div class="header-right">
          <!-- 快捷命令 -->
          <button class="btn btn-primary" @click="enterPreview">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right: 4px;">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            预览与打印
          </button>
          <button class="btn btn-accent" @click="saveTemplate">保存模板</button>
          <button class="btn btn-secondary" @click="clearCanvas">清空</button>
          <button class="btn btn-secondary" @click="loadDefaultTemplate">重置模板</button>
        </div>
      </header>

      <!-- 主工作区分流布局 -->
      <main class="designer-main">
        <!-- 左侧：元素托盘 + 数据源面板 (带高级手风琴折叠，解决拥挤问题) -->
        <aside class="sidebar-left" style="display: flex; flex-direction: column; overflow: hidden; height: 100%;">
          <!-- 1. 设计元素区块 -->
          <section class="section-elements" :class="{ 'is-collapsed': elementsCollapse }" style="display: flex; flex-direction: column; flex-shrink: 0;">
            <h3 class="panel-title" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none;" @click="elementsCollapse = !elementsCollapse">
              <span>设计元素</span>
              <span style="font-size: 11px; color: #94a3b8; transition: transform 0.2s;" :style="{ transform: elementsCollapse ? 'rotate(-90deg)' : 'rotate(0deg)' }">▼</span>
            </h3>
            <div class="element-grid" v-show="!elementsCollapse" style="padding: 10px 14px 18px 14px;">
              <div 
                v-for="item in toolboxItems" 
                :key="item.type"
                class="toolbox-card"
                draggable="true"
                @dragstart="onDragStart($event, item)"
              >
                <div class="toolbox-icon" v-html="item.icon"></div>
                <span class="toolbox-label">{{ item.label }}</span>
              </div>
            </div>
          </section>
          
          <!-- 2. JSON 变量树 -->
          <section class="section-datasource" :class="{ 'is-collapsed': datasourceCollapse }" style="display: flex; flex-direction: column; flex: 1; min-height: 0;">
            <h3 class="panel-title" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none;" @click="datasourceCollapse = !datasourceCollapse">
              <span>JSON 变量树</span>
              <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                <span v-if="testDebugData" class="debug-badge-active" style="white-space: nowrap;">真实联调</span>
                <span style="font-size: 11px; color: #94a3b8; transition: transform 0.2s;" :style="{ transform: datasourceCollapse ? 'rotate(-90deg)' : 'rotate(0deg)' }">▼</span>
              </div>
            </h3>
            
            <template v-if="!datasourceCollapse">
              <div class="data-tree" style="padding: 10px 12px; overflow-y: auto; flex: 1; min-height: 0;">
                <div 
                  v-for="(node, index) in treeNodes" 
                  :key="index"
                  class="tree-node"
                  :style="{
                    padding: '5px 8px',
                    borderRadius: '6px',
                    marginBottom: '3px',
                    transition: 'all 0.15s ease',
                    backgroundColor: node.isGroup ? '#f8fafc' : node.isList ? '#eff6ff' : 'transparent',
                    paddingLeft: node.isSub ? '24px' : node.isGroup ? '8px' : '12px',
                    cursor: node.isGroup ? 'default' : 'pointer',
                    wordBreak: 'break-all',
                    overflowWrap: 'break-word'
                  }"
                  :title="node.isGroup ? '对象容器' : '双击自动插入当前选中的文本组件中，单选点击复制变量路径'"
                  @click="!node.isGroup && copyVariable(node.path)"
                  @dblclick="!node.isGroup && insertVariableToActive(node.path)"
                >
                  <div style="display: flex; flex-direction: column; gap: 1px; min-width: 0; width: 100%; word-break: break-all; overflow-wrap: break-word;">
                    <span class="node-key" :style="{ 
                      fontSize: '11px', 
                      fontFamily: 'monospace',
                      color: node.isList ? '#2563eb' : node.isSub ? '#10b981' : node.isGroup ? '#64748b' : '#d97706',
                      fontWeight: node.isGroup || node.isList ? 'bold' : 'normal',
                      wordBreak: 'break-all',
                      whiteSpace: 'normal',
                      display: 'block',
                      overflowWrap: 'break-word'
                    }">
                      {{ node.path }}
                    </span>
                    <span class="node-label" style="font-size: 10px; color: #64748b; margin-top: 1px; word-break: break-all; white-space: normal; display: block; overflow-wrap: break-word;">
                      {{ node.label }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="datasource-tips" style="font-size: 10.5px; line-height: 1.5; color: #64748b; background-color: #f8fafc; border-top: 1px solid #e8ecf2; padding: 10px 14px; flex-shrink: 0;">
                💡 <b>小贴士：</b>单击一键复制变量；双击直接<b>插入到画布文本光标后</b>。
              </div>
            </template>
          </section>

          <!-- 3. 图层大纲 -->
          <section class="section-outline" :class="{ 'is-collapsed': outlineCollapse }" style="display: flex; flex-direction: column; flex-shrink: 0;" :style="{ height: outlineCollapse ? '43px' : '220px' }">
            <h3 class="outline-title-bar" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none;" @click="outlineCollapse = !outlineCollapse">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>图层大纲</span>
                <span class="badge">{{ elements.length }}</span>
              </div>
              <span style="font-size: 11px; color: #94a3b8; transition: transform 0.2s;" :style="{ transform: outlineCollapse ? 'rotate(-90deg)' : 'rotate(0deg)' }">▼</span>
            </h3>
            <div class="outline-list" v-show="!outlineCollapse" style="flex: 1; overflow-y: auto;">
              <div 
                v-for="el in elements.slice().reverse()" 
                :key="el.id"
                class="outline-item"
                :class="{ 
                  'is-active': activeId === el.id,
                  'is-hovered': hoveredId === el.id
                }"
                @click="activeId = el.id"
                @mouseenter="hoveredId = el.id"
                @mouseleave="hoveredId = ''"
              >
                <div class="item-info">
                  <span class="item-icon" v-html="getElementIcon(el.type)"></span>
                  <span class="item-label" :title="getElementLabel(el)">{{ getElementLabel(el) }}</span>
                </div>
                <div class="item-actions">
                  <button class="action-btn" title="上移一层（置顶）" @click.stop="bringToFront(el.id)">▲</button>
                  <button class="action-btn" title="下移一层（置底）" @click.stop="sendToBack(el.id)">▼</button>
                  <button class="action-btn-del" title="删除组件" @click.stop="deleteElement(el.id)">×</button>
                </div>
              </div>
              <div v-if="elements.length === 0" class="outline-empty">
                画布中无任何元素
              </div>
            </div>
          </section>
        </aside>

        <!-- 中间：画布区域，带刻度尺 -->
        <section 
          class="canvas-viewport"
          @scroll="onViewportScroll"
        >
          <div class="canvas-inner" :style="innerStyle">
            <!-- 毫米刻度尺 -->
            <Ruler 
              :zoom="zoom"
              :scroll-left="scrollLeft"
              :scroll-top="scrollTop"
              :paper-width="paperWidth"
              :paper-height="paperHeight"
              :mouse-x="mouseX"
              :mouse-y="mouseY"
              :canvas-margin-left="40"
              :canvas-margin-top="40"
            />
            
            <!-- 可拖动画布 -->
            <DesignCanvas 
              v-model:elements="elements"
              v-model:active-id="activeId"
              :hovered-id="hoveredId"
              :zoom="zoom"
              :paper-width="paperWidth"
              :paper-height="paperHeight"
              :show-grid="showGrid"
              :grid-size="gridSize"
              :snap-to-grid="snapToGrid"
              @mouse-position="onCanvasMouse"
            />
          </div>
        </section>

        <!-- 右侧：属性编辑面板 -->
        <aside class="sidebar-right">
          <!-- 属性面板标签页 -->
          <div class="right-tabs">
            <div 
              class="tab-item" 
              :class="{ 'is-active': activeTab === 'style' }"
              @click="activeTab = 'style'"
            >
              组件属性
            </div>
            <div 
              class="tab-item" 
              :class="{ 'is-active': activeTab === 'page' }"
              @click="activeTab = 'page'"
            >
              页面设置
            </div>
            <div 
              class="tab-item" 
              :class="{ 'is-active': activeTab === 'templates' }"
              @click="activeTab = 'templates'"
            >
              模板库
            </div>
          </div>
          
          <div class="right-panel-body">
            <!-- Tab 1: 组件配置 -->
            <div v-show="activeTab === 'style'" class="tab-panel">
              <div v-if="!activeElement" class="panel-placeholder">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                  <path d="M13 13v8h8v-8h-8zM3 21h8v-8H3v8zM3 3v8h8V3H3zm13.66 2.12L11.78 10l4.88 4.88 4.88-4.88-4.88-4.88z"/>
                </svg>
                <p>请点击或拖入画布中的元素进行属性修改</p>
              </div>
              
              <div v-else class="property-form">
                <div class="prop-section-title">组件基础 [{{ getElementTypeName(activeElement.type) }}]</div>
                
                <!-- 通用高宽坐标 (物理毫米级数值，自动换算) -->
                <div class="form-row-2">
                  <div class="form-item">
                    <label>X 坐标 (mm)</label>
                    <input type="number" :value="pxToMm(activeElement.x)" @input="updateActiveElementMm('x', $event.target.value)" />
                  </div>
                  <div class="form-item">
                    <label>Y 坐标 (mm)</label>
                    <input type="number" :value="pxToMm(activeElement.y)" @input="updateActiveElementMm('y', $event.target.value)" />
                  </div>
                </div>
                <div class="form-row-2">
                  <div class="form-item">
                    <label>宽度 (mm)</label>
                    <input type="number" :value="pxToMm(activeElement.width)" @input="updateActiveElementMm('width', $event.target.value)" />
                  </div>
                  <div class="form-item">
                    <label>高度 (mm)</label>
                    <input type="number" :value="pxToMm(activeElement.height)" @input="updateActiveElementMm('height', $event.target.value)" />
                  </div>
                </div>

                <!-- 动作 -->
                <div class="form-item" style="margin-top: 10px;">
                  <button class="btn-action-delete" @click="deleteActiveElement">删除此元素</button>
                </div>
                
                <div class="prop-divider"></div>

                <!-- 文本/页码组件属性 -->
                <div v-if="['text', 'page-number'].includes(activeElement.type)">
                  <div class="prop-section-title">文本属性</div>
                  <div v-if="activeElement.type === 'text'" class="form-item">
                    <label>文本内容 / 绑定数据</label>
                    <textarea v-model="activeElement.value" rows="3" placeholder="支持纯文本或变量，例如: ${master.customerName}"></textarea>
                  </div>
                  <div class="form-row-2">
                    <div class="form-item">
                      <label>字号 (px)</label>
                      <input type="number" v-model.number="activeElement.fontSize" />
                    </div>
                    <div class="form-item">
                      <label>文字颜色</label>
                      <input type="color" v-model="activeElement.fontColor" />
                    </div>
                  </div>
                  <div class="form-item">
                    <label>字体样式</label>
                    <div class="btn-group-toggle">
                      <button 
                        class="toggle-btn" 
                        :class="{ 'is-active': activeElement.fontWeight === 'bold' }"
                        @click="activeElement.fontWeight = activeElement.fontWeight === 'bold' ? 'normal' : 'bold'"
                      >
                        <b>B</b>
                      </button>
                      <button 
                        class="toggle-btn" 
                        :class="{ 'is-active': activeElement.fontStyle === 'italic' }"
                        @click="activeElement.fontStyle = activeElement.fontStyle === 'italic' ? 'normal' : 'italic'"
                      >
                        <i>I</i>
                      </button>
                      <button 
                        class="toggle-btn" 
                        :class="{ 'is-active': activeElement.textDecoration === 'underline' }"
                        @click="activeElement.textDecoration = activeElement.textDecoration === 'underline' ? 'none' : 'underline'"
                      >
                        <u>U</u>
                      </button>
                    </div>
                  </div>
                  <div class="form-row-2">
                    <div class="form-item">
                      <label>水平对齐</label>
                      <select v-model="activeElement.align">
                        <option value="left">靠左</option>
                        <option value="center">居中</option>
                        <option value="right">靠右</option>
                      </select>
                    </div>
                    <div class="form-item">
                      <label>垂直对齐</label>
                      <select v-model="activeElement.valign">
                        <option value="top">靠顶</option>
                        <option value="middle">居中</option>
                        <option value="bottom">靠底</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- 条形码/二维码属性 -->
                <div v-else-if="['barcode', 'qrcode'].includes(activeElement.type)">
                  <div class="prop-section-title">码元绑定属性</div>
                  <div class="form-item">
                    <label>数据源绑定字段</label>
                    <textarea v-model="activeElement.value" rows="2" placeholder="绑定主表字段，例如: ${master.orderNo}"></textarea>
                  </div>
                  <div v-if="activeElement.type === 'barcode'" class="form-item">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="activeElement.showText" />
                      <span>显示底部可读文本</span>
                    </label>
                  </div>
                </div>

                <!-- 图片属性 -->
                <div v-else-if="activeElement.type === 'image'">
                  <div class="prop-section-title">图片属性</div>
                  <div class="form-item">
                    <label>图片来源链接</label>
                    <textarea v-model="activeElement.value" rows="3" placeholder="http:// 开头的图片地址，或 Base64 编码"></textarea>
                  </div>
                </div>

                <!-- 线条与边框属性 -->
                <div v-else-if="['line-h', 'line-v', 'rect'].includes(activeElement.type)">
                  <div class="prop-section-title">线框样式</div>
                  <div class="form-row-2">
                    <div class="form-item">
                      <label>线宽 (px)</label>
                      <input type="number" v-model.number="activeElement.borderWidth" />
                    </div>
                    <div class="form-item">
                      <label>线条颜色</label>
                      <input type="color" v-model="activeElement.fontColor" />
                    </div>
                  </div>
                  <div class="form-item">
                    <label>线条类型</label>
                    <select v-model="activeElement.borderStyle">
                      <option value="solid">实线 (solid)</option>
                      <option value="dashed">虚线 (dashed)</option>
                      <option value="dotted">点线 (dotted)</option>
                    </select>
                  </div>
                  <div v-if="activeElement.type === 'rect'" class="form-item">
                    <label>填充背景色</label>
                    <input type="color" v-model="activeElement.backgroundColor" />
                  </div>
                </div>

                <!-- 表格属性配置 (重点高阶属性) -->
                <div v-show="activeElement.type === 'table'">
                  <div class="prop-section-title">表格属性与合并网格</div>
                  
                  <div class="form-item" style="margin-top: 8px;">
                    <label>数据源列表路径 (绑定如: detail, data.list, a.b.c)</label>
                    <input type="text" v-model="activeElement.dataSourcePath" placeholder="例如: detail" style="width: 100%; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;" />
                  </div>

                  <div class="form-item">
                    <label class="checkbox-label" style="margin-top: 6px;">
                      <input type="checkbox" v-model="activeElement.repeatHeader" />
                      <span>表格跨页时，每页重复显示表头 (Header Repeat)</span>
                    </label>
                  </div>

                  <!-- 极致画布交互指南提示框 -->
                  <div class="alert-tip-info" style="margin-top: 10px; background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 11px 13px; border-radius: 8px; font-size: 11px; color: #0369a1; line-height: 1.5; box-shadow: 0 2px 6px rgba(3, 105, 161, 0.03);">
                    <strong style="display: flex; align-items: center; gap: 4px; font-size: 11px; margin-bottom: 5px; color: #0284c7;">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                      </svg>
                      画布级“所见即所得”极致编辑说明：
                    </strong>
                    建议直接在<strong>左侧设计画布上</strong>对表格进行极智配置：
                    <ul style="margin: 4px 0 0 16px; padding: 0; list-style-type: disc; gap: 2px; display: flex; flex-direction: column;">
                      <li><strong>Hover 任意表头单元格</strong>：即刻浮现微型控制面板，点击 <b>▲▼ 合并上下</b>、<b>◀▶ 合并左右</b>。</li>
                      <li><strong>直接调整物理列宽</strong>：点击 <b>➖ 和 ➕ 微调列宽</b>，数值实时对齐更新。</li>
                      <li><strong>双击直改文字</strong>：<b>双击</b> 画布任意单元格直接修改文本（支持静态字符或变量 <code>\${master.userName}</code>），回车自动保存。</li>
                      <li><strong>表头上方总控</strong>：选中表格时，上方浮现 <b>➕表头行</b>、<b>➕物理列</b> 全局便捷操作条。</li>
                    </ul>
                  </div>

                  <div class="prop-divider"></div>

                  <!-- 复杂表头网格合并设计面板 (headerRows) -->
                  <div class="complex-header-designer-wrapper">
                    <div class="table-columns-header" style="margin-bottom: 8px;">
                      <span style="font-weight: bold; color: #0f172a; display: flex; align-items: center; gap: 4px;">
                        👑 复杂表头合并设计网格
                      </span>
                      <button 
                        v-if="activeElement.headerRows"
                        class="btn-small" 
                        style="color: #ef4444; border-color: #fca5a5; background-color: #fef2f2;"
                        @click="disableComplexHeader"
                      >
                        禁用复杂表头
                      </button>
                    </div>

                    <!-- 如果开启了复杂表头，以折叠/精细卡片展示表头行及单元格合并 -->
                    <template v-if="activeElement.headerRows">
                      <div class="header-rows-accordion">
                        <div 
                          v-for="(hRow, rIdx) in activeElement.headerRows" 
                          :key="rIdx" 
                          class="header-row-group"
                        >
                          <div class="header-row-group-title">
                            <span>第 {{ rIdx + 1 }} 行表头</span>
                            <div style="display: flex; gap: 4px;">
                              <button class="btn-small text-xs" style="color: #2563eb; background-color: #eff6ff; border-color: #bfdbfe;" @click="addHeaderCell(rIdx)">➕ 加单元格</button>
                              <button class="btn-small text-xs" style="color: #ef4444;" @click="deleteHeaderRow(rIdx)">❌ 删此行</button>
                            </div>
                          </div>
                          
                          <div class="header-cells-grid">
                            <div 
                              v-for="(cell, cIdx) in hRow" 
                              :key="cIdx" 
                              class="cell-config-card"
                            >
                              <div class="cell-card-header">
                                <span>单元格 {{ cIdx + 1 }}</span>
                                <span class="btn-delete-col" style="font-size: 10px;" @click="deleteHeaderCell(rIdx, cIdx)">移除</span>
                              </div>
                              
                              <div class="form-item">
                                <label>表头内容</label>
                                <div style="position: relative; display: flex; align-items: center; width: 100%;">
                                  <span 
                                    v-if="cell.title && cell.title.includes('${')" 
                                    class="binding-indicator-dot" 
                                    title="主表字段动态绑定中"
                                  ></span>
                                  <input 
                                    type="text" 
                                    v-model="cell.title" 
                                    :style="{ paddingLeft: (cell.title && cell.title.includes('${') ? '16px' : '8px'), fontSize: '11px', width: '100%' }" 
                                  />
                                </div>
                              </div>
                              
                              <div class="form-row-2">
                                <div class="form-item">
                                  <label>合并上下 (rowspan)</label>
                                  <input type="number" v-model.number="cell.rowspan" :min="1" />
                                </div>
                                <div class="form-item">
                                  <label>合并左右 (colspan)</label>
                                  <input type="number" v-model.number="cell.colspan" :min="1" />
                                </div>
                              </div>
                              
                              <div class="form-row-2">
                                <div class="form-item">
                                  <label>对齐方式</label>
                                  <select v-model="cell.align">
                                    <option value="left">居左</option>
                                    <option value="center">居中</option>
                                    <option value="right">居右</option>
                                  </select>
                                </div>
                                <div class="form-item">
                                  <label>填充底色</label>
                                  <input type="color" v-model="cell.backgroundColor" />
                                </div>
                              </div>

                              <div style="margin-top: 4px; display: flex; align-items: center;">
                                <label class="checkbox-label" style="font-size: 10px; margin: 0;">
                                  <input type="checkbox" v-model="cell.fontWeight" true-value="bold" false-value="normal" />
                                  <span>加粗字体标示</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button 
                        class="btn-action-primary" 
                        style="width: 100%; font-size: 11px; padding: 6px 12px; border-radius: 6px; margin-top: 8px; border: 1px dashed #bfdbfe; color: #1e40af; background-color: #eff6ff; font-weight: bold; cursor: pointer; transition: all 0.2s;"
                        @click="addHeaderRow"
                      >
                        ➕ 在底部追加一行新表头 Row
                      </button>
                    </template>

                    <!-- 未开启复杂表头，展现引导激活面板 -->
                    <template v-else>
                      <div class="complex-header-lead-card">
                        <div class="lead-icon">📊</div>
                        <div class="lead-title">需要支持双行表头与网格合并？</div>
                        <p class="lead-desc">开启复杂表头后，您能任意自由配置表头的单元格合并（colspan/rowspan）、文字变量绑定、填充底色等，完美支持各类复杂的年度报表！</p>
                        <button class="btn-lead-action" @click="enableComplexHeader">✨ 开启多行复杂表头设计</button>
                      </div>
                    </template>
                  </div>

                  <div class="prop-divider"></div>

                  <!-- 基础物理列及列宽基准管理 (Columns) -->
                  <div class="table-columns-header">
                    <span style="font-weight: bold; color: #0f172a; display: flex; align-items: center; gap: 4px;">
                      📊 数据列与物理列宽基准
                    </span>
                    <button class="btn-small" @click="addTableColumn">添加列</button>
                  </div>
                  
                  <div class="alert-tip-info" style="margin: 6px 0 10px 0; background-color: #fffbeb; border: 1px solid #fef3c7; padding: 8px 10px; border-radius: 6px; font-size: 10px; color: #b45309; line-height: 1.4;">
                    💡 列配置中的 <strong>「宽度 (px)」</strong> 是整个表格在垂直轨道上的<b>排版基准</b>。如果有合并表头，请确保表头各列合并跨度与此处列数对应对齐！
                  </div>

                  <div class="table-cols-list" style="max-height: 280px;">
                    <div 
                      v-for="(col, index) in activeElement.columns" 
                      :key="index"
                      class="col-config-item"
                    >
                      <div class="col-config-header">
                        <span>第 {{ index + 1 }} 列物理字段</span>
                        <span class="btn-delete-col" @click="deleteTableColumn(index)">移除</span>
                      </div>
                      <div class="form-row-2">
                        <div class="form-item">
                          <label>物理列标题</label>
                          <input type="text" v-model="col.title" />
                        </div>
                        <div class="form-item">
                          <label>宽度 (px)</label>
                          <input type="number" v-model.number="col.width" />
                        </div>
                      </div>
                      <div class="form-row-2">
                        <div class="form-item">
                          <label>绑定子字段 (如: name, goodsName, a.b)</label>
                          <input type="text" v-model="col.field" placeholder="例如: goodsName" />
                        </div>
                        <div class="form-item">
                          <label>对齐</label>
                          <select v-model="col.align">
                            <option value="left">居左</option>
                            <option value="center">居中</option>
                            <option value="right">居右</option>
                          </select>
                        </div>
                      </div>
                      <div class="form-row-2" style="margin-top: 4px; align-items: center;">
                        <div class="form-item">
                          <label class="checkbox-label" style="margin-top: 6px;">
                            <input type="checkbox" v-model="col.autoMerge" />
                            <span>合并相邻重复行 (如大类分类)</span>
                          </label>
                        </div>
                        <div class="form-item" v-if="col.writingMode">
                          <label>垂直文字排布</label>
                          <span style="font-size: 10px; color: #10b981; font-weight: bold;">已启用汉字竖排</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 分段属性配置 (每页显示控制，跨页策略) -->
                <div class="prop-divider"></div>
                <div class="prop-section-title">打印分页策略</div>
                <div class="form-item">
                  <label>组件呈现页码策略</label>
                  <select v-model="activeElement.showStrategy">
                    <option value="all">所有物理页面均显示 (All Pages)</option>
                    <option value="first">仅在第一页呈现 (First Page Only)</option>
                    <option value="last">仅在最后一页呈现 (Last Page Only)</option>
                    <option value="no-first">第一页不显示，其余物理页呈现</option>
                    <option value="no-last">最后一页不显示，其余物理页呈现</option>
                  </select>
                  <p class="field-desc-text">决定此元素经过流式分页排版后的显示范围。</p>
                </div>
              </div>
            </div>
            
            <!-- Tab 2: 页面设置 -->
            <div v-show="activeTab === 'page'" class="tab-panel">
              <div class="property-form">
                <div class="prop-section-title">模板基础绑定信息</div>
                <div class="form-item">
                  <label>模板唯一标识 (Template ID)</label>
                  <input type="text" v-model="templateId" placeholder="模板唯一代码，例如 tpl_sales_order" />
                  <p class="field-desc-text">通常用于前端组件或后端接口拉取此模板配置的 Key。</p>
                </div>
                <div class="form-item">
                  <label>模板名称</label>
                  <input type="text" v-model="templateName" placeholder="例如：标准销售订单打印模板" />
                </div>
                <div class="form-item">
                  <label>🔗 关联业务详情/列表接口 (apiPath)</label>
                  <input type="text" v-model="apiPath" placeholder="例如：/api/v1/sales/order/detail" />
                  <p class="field-desc-text">运行时，根据此 apiPath 动态拉取数据。</p>
                </div>

                <!-- 🔍 真实数据接口调试联调面板 (移至页面设置，更宽敞) -->
                <div class="prop-divider"></div>
                <div class="prop-section-title" style="display: flex; align-items: center; justify-content: space-between;">
                  <span>🔗 真实数据接口联调调试</span>
                  <span v-if="testDebugData" class="debug-badge-active" style="font-size: 8.5px;">已连通</span>
                  <span v-else class="debug-badge-inactive" style="font-size: 8.5px;">Demo模式</span>
                </div>
                
                <div class="form-row-2">
                  <div class="form-item">
                    <label>请求方式</label>
                    <select v-model="testMethod" style="height: 34px;">
                      <option value="GET">GET 请求</option>
                      <option value="POST">POST 请求</option>
                    </select>
                  </div>
                  <div class="form-item">
                    <label>测试业务主键 ID (可选)</label>
                    <input type="text" v-model="testBusinessId" placeholder="例如: 12" style="height: 34px;" />
                  </div>
                </div>

                <div class="form-item">
                  <label>高级请求参数 JSON (Query / Body)</label>
                  <textarea 
                    v-model="testParams" 
                    placeholder='例如: {"status": 1, "deptCode": "IT"}' 
                    rows="3" 
                    style="font-family: monospace; font-size: 11px; line-height: 1.3; width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; outline: none; background-color: #fafafa; transition: border 0.15s;"
                    @focus="$event.target.style.borderColor = '#d97706'"
                    @blur="$event.target.style.borderColor = '#cbd5e1'"
                  ></textarea>
                  <p class="field-desc-text">若为 GET，参数会自动序列化为 URL 参数；若为 POST，会自动作为 Request Body 发送。</p>
                </div>

                <div style="display: flex; gap: 8px; margin-top: 4px;">
                  <button 
                    class="btn btn-primary" 
                    style="flex: 1; height: 36px; font-size: 12.5px; border-radius: 6px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 4px;"
                    :disabled="isTestingApi"
                    @click="handleFetchTestData"
                  >
                    <span v-if="isTestingApi">正在反射连通中...</span>
                    <span v-else>开始连通测试</span>
                  </button>
                  <button 
                    v-if="testDebugData"
                    class="btn btn-secondary" 
                    style="height: 36px; font-size: 12.5px; border-radius: 6px; color: #dc2626; background-color: #fef2f2; border: 1px solid #fee2e2;"
                    @click="clearTestData"
                  >
                    重置演示
                  </button>
                </div>

                <div v-if="testDebugData" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 8px 10px; margin-top: 10px; font-size: 11px; color: #16a34a; line-height: 1.4;">
                  ✔ <b>连通成功：</b>已拉取真实 JSON。左侧<b>「万能JSON变量树」</b>已彻底对齐您内网的真实字段，可双击直接绑定！
                </div>

                <div class="prop-divider"></div>
                <div class="prop-section-title">纸张规格属性</div>
                <div class="form-item">
                  <label>纸张预设</label>
                  <select v-model="paperSizePreset" @change="onPaperPresetChange">
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="A3">A3 (297 × 420 mm)</option>
                    <option value="A5">A5 (148 × 210 mm)</option>
                    <option value="B5">B5 (176 × 250 mm)</option>
                    <option value="custom">自定义尺寸</option>
                  </select>
                </div>
                <div class="form-row-2">
                  <div class="form-item">
                    <label>纸张物理宽 (mm)</label>
                    <input type="number" v-model.number="paperWidth" :disabled="paperSizePreset !== 'custom'" />
                  </div>
                  <div class="form-item">
                    <label>纸张物理高 (mm)</label>
                    <input type="number" v-model.number="paperHeight" :disabled="paperSizePreset !== 'custom'" />
                  </div>
                </div>
                
                <div class="prop-divider"></div>
                <div class="prop-section-title">打印边距 (影响分页高度)</div>
                <div class="form-row-2">
                  <div class="form-item">
                    <label>上边距 (mm)</label>
                    <input type="number" v-model.number="pageMargins.top" />
                  </div>
                  <div class="form-item">
                    <label>下边距 (mm)</label>
                    <input type="number" v-model.number="pageMargins.bottom" />
                  </div>
                </div>
                <div class="form-row-2">
                  <div class="form-item">
                    <label>左边距 (mm)</label>
                    <input type="number" v-model.number="pageMargins.left" />
                  </div>
                  <div class="form-item">
                    <label>右边距 (mm)</label>
                    <input type="number" v-model.number="pageMargins.right" />
                  </div>
                </div>
                
                <div class="prop-divider"></div>
                <div class="prop-section-title">设计辅助网格</div>
                <div class="form-item">
                  <label>网格步长大小 (mm)</label>
                  <input type="number" v-model.number="gridSize" />
                </div>
              </div>
            </div>
            
            <!-- Tab 3: 模板库 -->
            <div v-show="activeTab === 'templates'" class="tab-panel">
              <div class="property-form" style="padding: 12px 16px;">
                <div class="prop-section-title" style="margin-bottom: 12px; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                  系统预设常用模板
                </div>
                
                <div class="template-gallery" style="display: flex; flex-direction: column; gap: 14px;">
                  <!-- 模板卡片 1: 销售订单 -->
                  <div class="template-card-item" @click="loadDefaultTemplate" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
                    <div style="font-weight: bold; font-size: 13px; color: #0c1832; display: flex; align-items: center; gap: 6px;">
                      销售订单报表 (纵向)
                    </div>
                    <p style="font-size: 11px; color: #64748b; margin: 6px 0 10px 0; line-height: 1.4;">
                      经典的主从销货清单报表，包含客户信息、明细表格、财务合计、页码和条码二维码，完美适配 A4 纵向打印。
                    </p>
                    <div style="display: flex; gap: 6px;">
                      <span style="font-size: 9px; background-color: #eff6ff; color: #1e40af; padding: 3px 8px; border-radius: 100px; font-weight: bold;">A4 纸张</span>
                      <span style="font-size: 9px; background-color: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 100px; font-weight: bold;">纵向 Portrait</span>
                    </div>
                  </div>

                  <!-- 模板卡片 2: 年度述职报告 -->
                  <div class="template-card-item" @click="loadReportDemoTemplate" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
                    <div style="font-weight: bold; font-size: 13px; color: #0c1832; display: flex; align-items: center; gap: 6px;">
                      年度述职考核报告 (纵向)
                    </div>
                    <p style="font-size: 11px; color: #64748b; margin: 6px 0 10px 0; line-height: 1.4;">
                      配备复杂网格表头的双层合并表头考核表，支持大类自动行合并与汉字竖排，适合精细化工作总结排版。
                    </p>
                    <div style="display: flex; gap: 6px;">
                      <span style="font-size: 9px; background-color: #eff6ff; color: #1e40af; padding: 3px 8px; border-radius: 100px; font-weight: bold;">A4 纸张</span>
                      <span style="font-size: 9px; background-color: #f5f3ff; color: #5b21b6; padding: 3px 8px; border-radius: 100px; font-weight: bold;">复杂多行表头</span>
                    </div>
                  </div>

                  <!-- 模板卡片 3: 商品送货单 (横向) -->
                  <div class="template-card-item" @click="loadLandscapeDeliveryTemplate" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
                    <div style="font-weight: bold; font-size: 13px; color: #0c1832; display: flex; align-items: center; gap: 6px;">
                      客户送货单 (横向 - 宽幅)
                    </div>
                    <p style="font-size: 11px; color: #64748b; margin: 6px 0 10px 0; line-height: 1.4;">
                      经典宽幅横向送货单，完美自适应 A4 Landscape 纸张，大表格宽视野，配备发货凭证、签收印章等细节。
                    </p>
                    <div style="display: flex; gap: 6px;">
                      <span style="font-size: 9px; background-color: #eff6ff; color: #1e40af; padding: 3px 8px; border-radius: 100px; font-weight: bold;">A4 纸张</span>
                      <span style="font-size: 9px; background-color: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 100px; font-weight: bold;">横向 Landscape</span>
                    </div>
                  </div>

                  <!-- 模板卡片 4: 资产点收卡 (小尺寸卡片) -->
                  <div class="template-card-item" @click="loadAssetTagTemplate" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
                    <div style="font-weight: bold; font-size: 13px; color: #0c1832; display: flex; align-items: center; gap: 6px;">
                      固定资产卡片 (A5小尺寸)
                    </div>
                    <p style="font-size: 11px; color: #64748b; margin: 6px 0 10px 0; line-height: 1.4;">
                      专门针对小尺寸 A5 纸张打造的设备点收标签贴，带物理网格线与右侧主扫码枪条形码定位。
                    </p>
                    <div style="display: flex; gap: 6px;">
                      <span style="font-size: 9px; background-color: #ecfdf5; color: #065f46; padding: 3px 8px; border-radius: 100px; font-weight: bold;">A5 小卡</span>
                      <span style="font-size: 9px; background-color: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 100px; font-weight: bold;">扫码绑定</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </template>

    <!-- 预览与打印排版接管视图 -->
    <template v-else>
      <PrintPreview 
        :elements="elements"
        :paper-width="paperWidth"
        :paper-height="paperHeight"
        :page-margins="pageMargins"
        :is-landscape="isLandscape"
        :runtime-data="testDebugData"
        :api-path="apiPath"
        :test-method="testMethod"
        :test-params="testParams"
        :test-business-id="testBusinessId"
        @close="exitPreview"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import Ruler from './components/Ruler.vue';
import DesignCanvas from './components/DesignCanvas.vue';
import PrintPreview from './components/PrintPreview.vue';
import { mockData, reportMockData, deliveryMockData, assetMockData } from './utils/mockData.js';
import { getPrintTemplateDetail, updatePrintTemplate } from '@/api/printTemplate';

const route = useRoute();
const dbRecordId = ref(route.query.id || ''); // 数据库记录主键 ID


defineOptions({ name: "ReportPrintDesigner" });

const MM_TO_PX = 3.779527559; // 1mm ≈ 3.78px

// 核心应用状态
const elements = ref([]);
const activeId = ref('');
const hoveredId = ref('');
const zoom = ref(1);
const scrollLeft = ref(0);
const scrollTop = ref(0);
const mouseX = ref(-1);
const mouseY = ref(-1);

// 纸张设置
const paperSizePreset = ref('A4');
const paperWidth = ref(210); // A4 宽度 mm
const paperHeight = ref(297); // A4 高度 mm
const isLandscape = ref(false); // 横向
const showGrid = ref(true);
const snapToGrid = ref(true);
const gridSize = ref(5); // 网格大小 5mm

// 🔑 模板元数据与通用绑定接口设置
const templateId = ref('tpl_' + Math.random().toString(36).substr(2, 9));
const templateName = ref('未命名打印模板');
const apiPath = ref('/api/v1/business/detail'); // 默认绑定的万能业务详情接口

// 🔍 真实数据接口调试模块
const testBusinessId = ref(''); // 用户输入的接口调试测试 ID
const testMethod = ref('GET');  // 请求方法: GET / POST
const testParams = ref('{}');   // 调试用的 Query 参数或 POST Body JSON 字符串
const testDebugData = ref(null); // 存储接口拉回的真实 JSON 结构，若存在，则直接覆盖 mock 充当大纲数据源
const isTestingApi = ref(false); // 是否在接口测试中

// 🔑 左侧边栏抽屉折叠状态 (默认展开“设计元素”与“JSON 变量树”，大纲默认折叠)
const elementsCollapse = ref(false);
const datasourceCollapse = ref(false);
const outlineCollapse = ref(true);




// 页面边距设置 (单位：毫米)
const pageMargins = reactive({
  top: 10,
  bottom: 10,
  left: 10,
  right: 10
});

// 视图控制
const isPreview = ref(false);
const activeTab = ref('style');

// 🔍 自动聚焦：当有组件被选中激活（activeId 改变且不为空）时，右侧属性面板自动切换至【组件属性】标签页
watch(activeId, (newId) => {
  if (newId) {
    activeTab.value = 'style';
  }
});

// 选中的组件对象
const activeElement = computed(() => {
  return elements.value.find(item => item.id === activeId.value);
});

// 🔑 自动感知当前模板适用的 Mock 数据源 (与 PrintPreview 保持完全同步！)
const activeMockData = computed(() => {
  // 🔍 调试测试优先：如果用户输入 id 进行了接口联调测试拿到了真实 JSON，直接充当大纲及解析源
  if (testDebugData.value) {
    return testDebugData.value;
  }

  const hasReportKeyword = elements.value.some(el => {
    if (typeof el.value === 'string' && (el.value.includes('info.') || el.value.includes('records'))) return true;
    if (el.type === 'table' && el.dataSourcePath === 'records') return true;
    return false;
  });
  if (hasReportKeyword) return reportMockData;

  const hasDeliveryKeyword = elements.value.some(el => {
    if (typeof el.value === 'string' && (el.value.includes('company.') || el.value.includes('deliveryCode') || el.value.includes('items'))) return true;
    if (el.type === 'table' && el.dataSourcePath === 'items') return true;
    return false;
  });
  if (hasDeliveryKeyword) return deliveryMockData;

  const hasAssetKeyword = elements.value.some(el => {
    if (typeof el.value === 'string' && (el.value.includes('assetName') || el.value.includes('keeperDept') || el.value.includes('assetCode'))) return true;
    return false;
  });
  if (hasAssetKeyword) return assetMockData;

  return mockData;
});

// 🔑 通用递归算法：把任何深层嵌套 JSON 扁平化为带层级路径的数据树节点列表，支持用户一键复制！
const treeNodes = computed(() => {
  const nodes = [];
  
  function recurse(obj, parentPath = '') {
    if (!obj || typeof obj !== 'object') return;
    
    // 如果是数组，直接显示为明细表格支持绑定的行字段示例，避免无限递归
    if (Array.isArray(obj)) {
      if (obj.length > 0) {
        // 取数组第一个元素作为字段示例
        const firstItem = obj[0];
        nodes.push({
          path: parentPath,
          label: `[列表数据源] - 共有 ${obj.length} 条记录`,
          isList: true
        });
        // 遍历数组下子字段
        for (const [key, val] of Object.entries(firstItem)) {
          nodes.push({
            path: key, // 明细列只需写字段名相对路径，例如 goodsName
            label: `┗━━ [列属性] 示例值: ${val}`,
            isSub: true
          });
        }
      }
      return;
    }
    
    // 递归对象键值
    for (const [key, val] of Object.entries(obj)) {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        nodes.push({
          path: currentPath,
          label: `📁 [对象] ${key}`,
          isGroup: true
        });
        recurse(val, currentPath);
      } else if (!Array.isArray(val)) {
        nodes.push({
          path: `\${${currentPath}}`, // 插值表达式完整占位符
          label: `📄 [文本值] ${key}: ${val}`,
          isField: true
        });
      } else {
        // 如果是明细列表
        recurse(val, currentPath);
      }
    }
  }
  
  recurse(activeMockData.value);
  return nodes;
});

// 标尺及视口大小计算
const innerStyle = computed(() => ({
  width: (paperWidth.value * MM_TO_PX + 200) + 'px', // 左右各给一定富余
  height: (paperHeight.value * MM_TO_PX + 200) + 'px',
  position: 'relative'
}));

// 左侧工具箱物料列表
const toolboxItems = [
  {
    type: 'text',
    label: '文本组件',
    width: 120,
    height: 35,
    value: '双击修改文本内容',
    fontSize: 14,
    fontColor: '#000000',
    align: 'left',
    valign: 'middle',
    showStrategy: 'all'
  },
  {
    type: 'page-number',
    label: '页码元素',
    width: 100,
    height: 30,
    fontSize: 11,
    fontColor: '#64748b',
    align: 'center',
    valign: 'middle',
    showStrategy: 'all'
  },
  {
    type: 'image',
    label: '图片组件',
    width: 100,
    height: 100,
    value: '', // 空链接，渲染默认占位
    showStrategy: 'all'
  },
  {
    type: 'barcode',
    label: '条形码',
    width: 180,
    height: 60,
    value: '${master.orderNo}', // 绑定主表订单号
    showText: true,
    showStrategy: 'all'
  },
  {
    type: 'qrcode',
    label: '二维码',
    width: 90,
    height: 90,
    value: '${master.orderNo}',
    showStrategy: 'all'
  },
  {
    type: 'table',
    label: '表格组件',
    width: 718, // 适合 A4 宽度
    height: 160,
    repeatHeader: true,
    columns: [
      { title: '序号', field: 'detail.index', width: 50, align: 'center' },
      { title: '商品名称', field: 'detail.goodsName', width: 280, align: 'left' },
      { title: '数量', field: 'detail.quantity', width: 80, align: 'right' },
      { title: '单价', field: 'detail.price', width: 100, align: 'right' },
      { title: '金额', field: 'detail.amount', width: 100, align: 'right' },
      { title: '备注', field: 'detail.remarks', width: 108, align: 'left' }
    ],
    showStrategy: 'all'
  },
  {
    type: 'line-h',
    label: '横向线条',
    width: 200,
    height: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    fontColor: '#334155',
    showStrategy: 'all'
  },
  {
    type: 'line-v',
    label: '纵向线条',
    width: 10,
    height: 150,
    borderWidth: 1,
    borderStyle: 'solid',
    fontColor: '#334155',
    showStrategy: 'all'
  },
  {
    type: 'rect',
    label: '矩形框',
    width: 120,
    height: 80,
    borderWidth: 1,
    borderStyle: 'solid',
    fontColor: '#334155',
    backgroundColor: 'transparent',
    showStrategy: 'all'
  }
];

// 元素图标 SVG，摒弃外部库
toolboxItems.forEach(item => {
  if (item.type === 'text') {
    item.icon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M5 4v3h5.5v12h3V7H19V4H5z"/></svg>`;
  } else if (item.type === 'page-number') {
    item.icon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z"/></svg>`;
  } else if (item.type === 'image') {
    item.icon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
  } else if (item.type === 'barcode') {
    item.icon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 5h2v14H3zm4 0h1v14H7zm3 0h2v14h-2zm4 0h1v14h-1zm3 0h3v14h-3zm5 0h1v14h-1z"/></svg>`;
  } else if (item.type === 'qrcode') {
    item.icon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm-2 16h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zm0 10h2v2h-2zm-6-6h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm2 2h2v2h-2zm4-4h2v4h-2zm-4-4h2v2h-2zm4 0h2v2h-2z"/></svg>`;
  } else if (item.type === 'table') {
    item.icon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M10 10.02h5V21h-5V10.02zM17 21h3c1.1 0 2-.9 2-2v-9h-5v11zm3-18H5c-1.1 0-2 .9-2 2v3h19V5c0-1.1-.9-2-2-2zM3 19c0 1.1.9 2 2 2h3V10H3v9zm14-9h5v9c0 1.1-.9 2-2 2h-3V10zm-7 0h5v11h-5V10z"/></svg>`;
  } else if (item.type === 'line-h') {
    item.icon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>`;
  } else if (item.type === 'line-v') {
    item.icon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11 19V5h2v14h-2z"/></svg>`;
  } else if (item.type === 'rect') {
    item.icon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
  }
});

// 对齐换算 mm / px
const pxToMm = (px) => Math.round(px / MM_TO_PX);
const mmToPx = (mm) => mm * MM_TO_PX;

const updateActiveElementMm = (field, valMm) => {
  if (!activeElement.value) return;
  const pxVal = Number(valMm) * MM_TO_PX;
  activeElement.value[field] = pxVal;
};

// 拖拽开始设置传输对象数据
const onDragStart = (event, item) => {
  event.dataTransfer.setData('report-element', JSON.stringify(item));
};

// 监听画布的鼠标指示红线
const onCanvasMouse = (pos) => {
  mouseX.value = pos.x;
  mouseY.value = pos.y;
};

// 滚动条同步
const onViewportScroll = (e) => {
  scrollLeft.value = e.target.scrollLeft;
  scrollTop.value = e.target.scrollTop;
};

// 纸张预设切换
const onPaperPresetChange = () => {
  const isLandscapeMode = isLandscape.value;
  let w = 210;
  let h = 297;
  
  if (paperSizePreset.value === 'A4') {
    w = 210; h = 297;
  } else if (paperSizePreset.value === 'A3') {
    w = 297; h = 420;
  } else if (paperSizePreset.value === 'A5') {
    w = 148; h = 210;
  } else if (paperSizePreset.value === 'B5') {
    w = 176; h = 250;
  } else {
    return; // 自定义不修改
  }
  
  if (isLandscapeMode) {
    paperWidth.value = h;
    paperHeight.value = w;
  } else {
    paperWidth.value = w;
    paperHeight.value = h;
  }
};

const setLandscape = (landscape) => {
  if (isLandscape.value === landscape) return;
  isLandscape.value = landscape;
  
  // 翻转纸张尺寸数值
  const temp = paperWidth.value;
  paperWidth.value = paperHeight.value;
  paperHeight.value = temp;
};

const changeZoom = (delta) => {
  zoom.value = Math.max(0.2, Math.min(2.5, zoom.value + delta));
};

// 统一辅助方法：强制对活跃表格元素进行深拷贝，并替换 elements 列表中的项，确保 100% 触发 Vue 3 嵌套依赖刷新和预览重绘
const triggerTableDeepUpdate = () => {
  if (!activeId.value) return;
  elements.value = elements.value.map(item => {
    if (item.id === activeId.value) {
      return JSON.parse(JSON.stringify(item));
    }
    return item;
  });
};

// 表格列控制
const addTableColumn = () => {
  if (!activeElement.value || activeElement.value.type !== 'table') return;
  activeElement.value.columns.push({
    title: '新字段',
    field: 'detail.goodsCode',
    width: 100,
    align: 'left',
    autoMerge: false
  });
  if (activeElement.value.headerRows) {
    // 自动为第一行增加一个充满全部表头行跨度的新单元格，防止下层出现悬空空白
    activeElement.value.headerRows[0].push({
      title: '新表头',
      rowspan: activeElement.value.headerRows.length,
      colspan: 1,
      align: 'center',
      backgroundColor: '#eff6ff',
      fontWeight: 'bold'
    });
  }
  triggerTableDeepUpdate();
};

// 物理上移除特定物理列 (使用跨越及Rowspan跳过追踪算法，物理移除该列对应的合并单元格)
const deleteTableColumn = (idx) => {
  if (!activeElement.value || activeElement.value.type !== 'table') return;
  const targetColIdx = idx;
  activeElement.value.columns.splice(idx, 1);

  if (activeElement.value.headerRows) {
    for (let rIdx = 0; rIdx < activeElement.value.headerRows.length; rIdx++) {
      const row = activeElement.value.headerRows[rIdx];
      if (row.length === 0) continue;
      
      // 搜集前几行跨行覆盖到本行的 occupied 列索引
      let occupiedCols = [];
      for (let prevR = 0; prevR < rIdx; prevR++) {
        const prevRow = activeElement.value.headerRows[prevR];
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

    activeElement.value.headerRows = activeElement.value.headerRows.filter(row => row.length > 0);
    if (activeElement.value.headerRows.length === 0) {
      delete activeElement.value.headerRows;
    }
  }
  triggerTableDeepUpdate();
};

// ==========================================
// 复杂多行合并表头 (headerRows) 可视化增删改控制
// ==========================================
const enableComplexHeader = () => {
  if (!activeElement.value || activeElement.value.type !== 'table') return;
  if (activeElement.value.headerRows) return;
  activeElement.value.headerRows = [
    activeElement.value.columns.map(col => ({
      title: col.title || '表头',
      rowspan: 1,
      colspan: 1,
      align: col.align || 'center',
      backgroundColor: '#eff6ff',
      fontWeight: 'bold'
    }))
  ];
  triggerTableDeepUpdate();
};

const disableComplexHeader = () => {
  if (!activeElement.value || activeElement.value.type !== 'table') return;
  if (confirm('确定要禁用多行复杂表头吗？这会清除您配置的多行表头网格！')) {
    delete activeElement.value.headerRows;
    triggerTableDeepUpdate();
  }
};

const addHeaderRow = () => {
  if (!activeElement.value || activeElement.value.type !== 'table' || !activeElement.value.headerRows) return;
  
  const newRowIdx = activeElement.value.headerRows.length;
  const colsCount = activeElement.value.columns ? activeElement.value.columns.length : 7;
  
  // 1. 构建前几行纵向跨行覆盖到新行的 occupied 物理轨道列索引
  let occupiedCols = [];
  for (let prevR = 0; prevR < newRowIdx; prevR++) {
    const prevRow = activeElement.value.headerRows[prevR];
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
  
  activeElement.value.headerRows.push(newRowCells);
  triggerTableDeepUpdate();
};

const deleteHeaderRow = (rIdx) => {
  if (!activeElement.value || activeElement.value.type !== 'table' || !activeElement.value.headerRows) return;
  activeElement.value.headerRows.splice(rIdx, 1);
  if (activeElement.value.headerRows.length === 0) {
    delete activeElement.value.headerRows;
  }
  triggerTableDeepUpdate();
};

const addHeaderCell = (rIdx) => {
  if (!activeElement.value || activeElement.value.type !== 'table' || !activeElement.value.headerRows) return;
  activeElement.value.headerRows[rIdx].push({
    title: '新单元格',
    rowspan: 1,
    colspan: 1,
    align: 'center',
    backgroundColor: '#eff6ff',
    fontWeight: 'bold'
  });
  triggerTableDeepUpdate();
};

const deleteHeaderCell = (rIdx, cIdx) => {
  if (!activeElement.value || activeElement.value.type !== 'table' || !activeElement.value.headerRows) return;
  activeElement.value.headerRows[rIdx].splice(cIdx, 1);
  triggerTableDeepUpdate();
};

// 删除元素
const deleteActiveElement = () => {
  if (!activeId.value) return;
  elements.value = elements.value.filter(item => item.id !== activeId.value);
  activeId.value = '';
};

// ==========================================
// 图层大纲层级控制与辅助函数
// ==========================================
const bringToFront = (id) => {
  const idx = elements.value.findIndex(el => el.id === id);
  if (idx === -1 || idx === elements.value.length - 1) return;
  const el = elements.value.splice(idx, 1)[0];
  elements.value.push(el);
};

const sendToBack = (id) => {
  const idx = elements.value.findIndex(el => el.id === id);
  if (idx === -1 || idx === 0) return;
  const el = elements.value.splice(idx, 1)[0];
  elements.value.unshift(el);
};

const deleteElement = (id) => {
  elements.value = elements.value.filter(el => el.id !== id);
  if (activeId.value === id) {
    activeId.value = '';
  }
};

const getElementIcon = (type) => {
  const match = toolboxItems.find(item => item.type === type);
  return match ? match.icon : '';
};

const getElementLabel = (el) => {
  switch (el.type) {
    case 'text':
      return `文本: ${el.value && el.value.length > 8 ? el.value.substring(0, 8) + '...' : el.value || '空文本'}`;
    case 'table':
      return `表格: ${el.columns ? el.columns.length : 0}列`;
    case 'qrcode':
      return `二维码`;
    case 'barcode':
      return `条形码`;
    case 'image':
      return `图片组件`;
    case 'line-h':
      return `水平分割线`;
    case 'line-v':
      return `垂直分割线`;
    case 'rect':
      return `矩形框组件`;
    case 'page-number':
      return `页码: 第X页/共Y页`;
    default:
      return `未知组件`;
  }
};

// 复制变量到剪贴板
const copyVariable = (str) => {
  navigator.clipboard.writeText(str).then(() => {
    if (window.$message) {
      window.$message.success(`已复制变量: ${str}`);
    } else {
      // 降级使用轻量级悬浮 toast，杜绝阻断式浏览器 alert
      const toast = document.createElement('div');
      toast.innerText = `已复制变量: ${str}`;
      toast.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #1e293b; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-size: 12px; z-index: 99999; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: opacity 0.2s ease;';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 200);
      }, 1500);
    }
  });
};

// 双击数据树字段，直接插入到当前激活的文本组件里
const insertVariableToActive = (str) => {
  if (activeElement.value && activeElement.value.type === 'text') {
    activeElement.value.value += str;
    if (window.$message) {
      window.$message.success(`已插入变量 ${str} 至当前文本组件`);
    }
  } else {
    if (window.$message) {
      window.$message.warning('请先在画布中选中需要插入变量的文本组件！');
    }
  }
};

// 转换组件中文名
const getElementTypeName = (type) => {
  const map = {
    'text': '文本',
    'page-number': '页码',
    'image': '图片',
    'barcode': '条形码',
    'qrcode': '二维码',
    'table': '明细表格',
    'line-h': '横线条',
    'line-v': '竖线条',
    'rect': '矩形框'
  };
  return map[type] || type;
};

// 画布清理
const clearCanvas = () => {
  if (confirm('确定要清空当前所有设计元素吗？')) {
    elements.value = [];
    activeId.value = '';
  }
};

// 预览和打印切换
const enterPreview = async () => {
  if (elements.value.length === 0) {
    alert('画布中还没有任何元素，请先拖入一些元素再预览吧。');
    return;
  }
  
  // 🔍 预览入口：如果配置了接口，在渲染预览组件前重新调一遍接口获取最新真实业务数据
  if (apiPath.value && apiPath.value.trim()) {
    try {
      window.$message?.info('正在静默同步最新测试接口业务数据，请稍候...');
      await handleFetchTestData();
    } catch (err) {
      console.error('[Preview API Refetch Failed]', err);
    }
  }

  activeId.value = ''; // 预览前清除选中
  isPreview.value = true;
};

const exitPreview = () => {
  isPreview.value = false;
};

// 加载图 3 年度述职报告复杂表模板
const loadReportDemoTemplate = () => {
  activeId.value = '';
  // 🔑 重置纸张为 A4 纵向
  paperSizePreset.value = 'A4';
  isLandscape.value = false;
  paperWidth.value = 210;
  paperHeight.value = 297;
  
  elements.value = [
    // 报表大标题
    {
      id: 'el_title_report',
      type: 'text',
      x: mmToPx(10), y: mmToPx(10), width: mmToPx(190), height: mmToPx(10),
      value: '（ ${info.year} ） 年度述职报告',
      fontSize: 20, fontColor: '#0c1832', fontWeight: 'bold', align: 'center', valign: 'middle', showStrategy: 'all'
    },
    {
      id: 'el_subtitle_report',
      type: 'text',
      x: mmToPx(10), y: mmToPx(19), width: mmToPx(190), height: mmToPx(6),
      value: '注：对照年度考核及本岗位工作描述',
      fontSize: 9, fontColor: '#ef4444', fontWeight: 'bold', align: 'center', valign: 'middle', showStrategy: 'all'
    },

    // 物理流式明细数据表格 (集成双行原生合并表头，从 Y = 26mm 处开始渲染)
    {
      id: 'el_report_table',
      type: 'table',
      x: mmToPx(10), y: mmToPx(26), width: mmToPx(190), height: mmToPx(250),
      repeatHeader: true,
      dataSourcePath: 'records', // 🔑 绑定列表数据源到嵌套路径 'records' 上！
      columns: [
        { title: '大类分类', field: 'category', width: 56, align: 'center', autoMerge: true, writingMode: 'vertical-rl' }, // 竖排汉字，自动行合并！
        { title: '序号', field: 'index', width: 45, align: 'center', autoMerge: false },
        { title: '完成事项内容', field: 'content', width: 230, align: 'left', autoMerge: false },
        { title: '亮点/成果', field: 'achievements', width: 95, align: 'left', autoMerge: false, colspan: 3 }, // 亮点成果跨 3 列
        { title: '', field: '', width: 120, align: 'left', autoMerge: false }, // 隐藏列
        { title: '', field: '', width: 95, align: 'left', autoMerge: false },  // 隐藏列
        { title: '完成时间', field: 'finishTime', width: 77, align: 'center', autoMerge: false }
      ],
      headerRows: [
        [
          { title: '个人信息', rowspan: 2, colspan: 1, align: 'center', backgroundColor: '#eff6ff', fontWeight: 'bold' },
          { title: '部门', rowspan: 1, colspan: 1, align: 'center', backgroundColor: '#eff6ff', fontWeight: 'bold' },
          { title: '${info.deptName}', rowspan: 1, colspan: 1, align: 'center' },
          { title: '职务', rowspan: 1, colspan: 1, align: 'center', backgroundColor: '#eff6ff', fontWeight: 'bold' },
          { title: '${info.title}', rowspan: 1, colspan: 1, align: 'center' },
          { title: '姓名', rowspan: 1, colspan: 1, align: 'center', backgroundColor: '#eff6ff', fontWeight: 'bold' },
          { title: '${info.author}', rowspan: 1, colspan: 1, align: 'center' }
        ],
        [
          { title: '序号', rowspan: 1, colspan: 1, align: 'center', backgroundColor: '#eff6ff', fontWeight: 'bold' },
          { title: '完成事项内容', rowspan: 1, colspan: 1, align: 'center', backgroundColor: '#eff6ff', fontWeight: 'bold' },
          { title: '亮点/成果', rowspan: 1, colspan: 3, align: 'center', backgroundColor: '#eff6ff', fontWeight: 'bold' }, // 亮点成果跨 3 列
          { title: '完成时间', rowspan: 1, colspan: 1, align: 'center', backgroundColor: '#eff6ff', fontWeight: 'bold' }
        ]
      ],
      showStrategy: 'all'
    },

    // 每页公共动态页码
    {
      id: 'el_line_footer_report',
      type: 'line-h',
      x: mmToPx(10), y: mmToPx(285), width: mmToPx(190), height: mmToPx(1),
      borderWidth: 0.5, borderStyle: 'solid', fontColor: '#cbd5e1', showStrategy: 'all'
    },
    {
      id: 'el_footer_pagenum_report',
      type: 'page-number',
      x: mmToPx(85), y: mmToPx(287), width: mmToPx(40), height: mmToPx(6),
      fontSize: 9, fontColor: '#94a3b8', align: 'center', valign: 'middle', showStrategy: 'all'
    }
  ];
};

// 加载常用模板 3：商品送货单（宽幅横向 - Landscape 自动转换）
const loadLandscapeDeliveryTemplate = () => {
  activeId.value = '';
  // 1. 切换为 A4
  paperSizePreset.value = 'A4';
  // 2. 强力启用横向
  isLandscape.value = true;
  paperWidth.value = 297;
  paperHeight.value = 210;
  
  elements.value = [
    // 标题区 (横向 297 宽度下，元素可用宽度增加到 277mm)
    {
      id: 'el_title_deliv',
      type: 'text',
      x: mmToPx(10), y: mmToPx(10), width: mmToPx(277), height: mmToPx(12),
      value: '商贸物联送货发货单（三联凭证）',
      fontSize: 22, fontColor: '#1e3a8a', fontWeight: 'bold', align: 'center', valign: 'middle', showStrategy: 'all'
    },
    {
      id: 'el_sub_deliv',
      type: 'text',
      x: mmToPx(10), y: mmToPx(20), width: mmToPx(277), height: mmToPx(6),
      value: '白联: 存根 | 绿联: 客户 | 红联: 财务回单',
      fontSize: 9, fontColor: '#64748b', align: 'center', valign: 'middle', showStrategy: 'all'
    },
    {
      id: 'el_line_top_deliv',
      type: 'line-h',
      x: mmToPx(10), y: mmToPx(25), width: mmToPx(277), height: mmToPx(2),
      borderWidth: 2, borderStyle: 'solid', fontColor: '#1e3a8a', showStrategy: 'all'
    },
    
    // 主表单基本信息列 (横向布局富余，一行放四个属性)
    {
      id: 'el_lbl1_deliv',
      type: 'text',
      x: mmToPx(10), y: mmToPx(29), width: mmToPx(20), height: mmToPx(6),
      value: '送货单位：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_val1_deliv',
      type: 'text',
      x: mmToPx(28), y: mmToPx(29), width: mmToPx(60), height: mmToPx(6),
      value: '${company.clientName}', // 🔑 嵌套路径
      fontSize: 10, fontColor: '#0f172a', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_lbl2_deliv',
      type: 'text',
      x: mmToPx(95), y: mmToPx(29), width: mmToPx(20), height: mmToPx(6),
      value: '送货单号：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_val2_deliv',
      type: 'text',
      x: mmToPx(113), y: mmToPx(29), width: mmToPx(50), height: mmToPx(6),
      value: '${deliveryCode}',
      fontSize: 10, fontColor: '#0f172a', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_lbl3_deliv',
      type: 'text',
      x: mmToPx(170), y: mmToPx(29), width: mmToPx(20), height: mmToPx(6),
      value: '联系电话：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_val3_deliv',
      type: 'text',
      x: mmToPx(188), y: mmToPx(29), width: mmToPx(40), height: mmToPx(6),
      value: '${company.clientPhone}', // 🔑 嵌套路径
      fontSize: 10, fontColor: '#0f172a', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_lbl4_deliv',
      type: 'text',
      x: mmToPx(235), y: mmToPx(15), height: mmToPx(6),
      value: '经手：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_val4_deliv',
      type: 'text',
      x: mmToPx(248), y: mmToPx(29), width: mmToPx(30), height: mmToPx(6),
      value: '${operator}',
      fontSize: 10, fontColor: '#0f172a', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    
    // 中间细分割线
    {
      id: 'el_line_mid_deliv',
      type: 'line-h',
      x: mmToPx(10), y: mmToPx(36), width: mmToPx(277), height: mmToPx(1),
      borderWidth: 1, borderStyle: 'solid', fontColor: '#e2e8f0', showStrategy: 'first'
    },
    
    // 宽表格 (横向 A4 能够给明细表非常宽裕的字段展现空间，高度缩短以保证一页内排版极爽)
    {
      id: 'el_table_deliv',
      type: 'table',
      x: mmToPx(10), y: mmToPx(40), width: mmToPx(277), height: mmToPx(100),
      repeatHeader: true,
      dataSourcePath: 'items', // 🔑 绑定列表数据源到嵌套路径 'items' 上！
      columns: [
        { title: '序号', field: 'index', width: 45, align: 'center' },
        { title: '配送商品及规格说明', field: 'desc', width: 380, align: 'left' },
        { title: '数量', field: 'qty', width: 75, align: 'right' },
        { title: '物理单位', field: 'unit', width: 75, align: 'center' },
        { title: '单价 (元)', field: 'price', width: 105, align: 'right' },
        { title: '发货金额', field: 'amount', width: 120, align: 'right' },
        { title: '配送追踪码', field: 'trackingCode', width: 155, align: 'center' }
      ],
      showStrategy: 'all'
    },
    
    // 送货专用红章 (盖章装饰效果)
    {
      id: 'el_stamp_deliv',
      type: 'text',
      x: mmToPx(210), y: mmToPx(142), width: mmToPx(35), height: mmToPx(35),
      value: '${stampText}',
      fontSize: 18, fontColor: '#ef4444', fontWeight: 'bold', align: 'center', valign: 'middle', showStrategy: 'last'
    },
    
    // 底部文字汇总与回执签名
    {
      id: 'el_sum1_deliv',
      type: 'text',
      x: mmToPx(10), y: mmToPx(148), width: mmToPx(100), height: mmToPx(6),
      value: '价税应收总计： ￥${summary.cashAmount}',
      fontSize: 11, fontColor: '#1e3a8a', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'last'
    },
    {
      id: 'el_sum2_deliv',
      type: 'text',
      x: mmToPx(120), y: mmToPx(148), width: mmToPx(100), height: mmToPx(6),
      value: '收货人签收回执（盖章）： __________________',
      fontSize: 10, fontColor: '#475569', align: 'left', valign: 'middle', showStrategy: 'last'
    },
    
    // 物理页脚
    {
      id: 'el_line_foot_deliv',
      type: 'line-h',
      x: mmToPx(10), y: mmToPx(198), width: mmToPx(277), height: mmToPx(1),
      borderWidth: 0.5, borderStyle: 'solid', fontColor: '#cbd5e1', showStrategy: 'all'
    },
    {
      id: 'el_pagenum_deliv',
      type: 'page-number',
      x: mmToPx(128), y: mmToPx(200), width: mmToPx(40), height: mmToPx(6),
      fontSize: 9, fontColor: '#94a3b8', align: 'center', valign: 'middle', showStrategy: 'all'
    }
  ];
};

// 加载常用模板 4：固定资产标签卡片（A5 紧凑纸张）
const loadAssetTagTemplate = () => {
  activeId.value = '';
  // 1. 切换为 A5
  paperSizePreset.value = 'A5';
  isLandscape.value = false;
  paperWidth.value = 148;
  paperHeight.value = 210;
  
  elements.value = [
    // 标题卡
    {
      id: 'el_title_asset',
      type: 'text',
      x: mmToPx(8), y: mmToPx(8), width: mmToPx(132), height: mmToPx(10),
      value: '固定资产设备管理卡片',
      fontSize: 16, fontColor: '#0f172a', fontWeight: 'bold', align: 'center', valign: 'middle', showStrategy: 'all'
    },
    {
      id: 'el_line_top_asset',
      type: 'line-h',
      x: mmToPx(8), y: mmToPx(19), width: mmToPx(132), height: mmToPx(1.5),
      borderWidth: 1.5, borderStyle: 'solid', fontColor: '#0f172a', showStrategy: 'all'
    },
    
    // 资产属性排版
    {
      id: 'el_lbl1_asset',
      type: 'text',
      x: mmToPx(8), y: mmToPx(24), width: mmToPx(25), height: mmToPx(6),
      value: '设备名称：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'all'
    },
    {
      id: 'el_val1_asset',
      type: 'text',
      x: mmToPx(34), y: mmToPx(24), width: mmToPx(90), height: mmToPx(6),
      value: '${assetName}', // 🔑 绑定打平后的嵌套字段
      fontSize: 10, fontColor: '#0f172a', align: 'left', valign: 'middle', showStrategy: 'all'
    },
    {
      id: 'el_lbl2_asset',
      type: 'text',
      x: mmToPx(8), y: mmToPx(32), width: mmToPx(25), height: mmToPx(6),
      value: '保管部门：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'all'
    },
    {
      id: 'el_val2_asset',
      type: 'text',
      x: mmToPx(34), y: mmToPx(32), width: mmToPx(90), height: mmToPx(6),
      value: '${keeperDept}', // 🔑 绑定打平后的嵌套字段
      fontSize: 10, fontColor: '#0f172a', align: 'left', valign: 'middle', showStrategy: 'all'
    },
    {
      id: 'el_lbl3_asset',
      type: 'text',
      x: mmToPx(8), y: mmToPx(40), width: mmToPx(25), height: mmToPx(6),
      value: '设备编号：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'all'
    },
    {
      id: 'el_val3_asset',
      type: 'text',
      x: mmToPx(34), y: mmToPx(40), width: mmToPx(90), height: mmToPx(6),
      value: '${assetCode}', // 🔑 绑定打平后的嵌套字段
      fontSize: 10, fontColor: '#0c1832', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'all'
    },
    
    // 主体隔离细线
    {
      id: 'el_line_mid_asset',
      type: 'line-h',
      x: mmToPx(8), y: mmToPx(49), width: mmToPx(132), height: mmToPx(1),
      borderWidth: 1, borderStyle: 'solid', fontColor: '#cbd5e1', showStrategy: 'all'
    },
    
    // 条码定位扫码枪读取区 (居中)
    {
      id: 'el_barcode_asset',
      type: 'barcode',
      x: mmToPx(26), y: mmToPx(54), width: mmToPx(96), height: mmToPx(20),
      value: '${assetCode}',
      showText: true,
      showStrategy: 'all'
    },
    
    // 说明语与落款
    {
      id: 'el_desc_asset',
      type: 'text',
      x: mmToPx(8), y: mmToPx(78), width: mmToPx(132), height: mmToPx(10),
      value: '${warnTips}',
      fontSize: 8.5, fontColor: '#ef4444', align: 'center', valign: 'middle', showStrategy: 'all'
    },
    
    // 页脚线
    {
      id: 'el_line_foot_asset',
      type: 'line-h',
      x: mmToPx(8), y: mmToPx(198), width: mmToPx(132), height: mmToPx(1),
      borderWidth: 0.5, borderStyle: 'solid', fontColor: '#cbd5e1', showStrategy: 'all'
    }
  ];
};




// 加载默认模版 (即图片中的精美主从报表)
const loadDefaultTemplate = () => {
  activeId.value = '';
  // 🔑 重置纸张为 A4 纵向
  paperSizePreset.value = 'A4';
  isLandscape.value = false;
  paperWidth.value = 210;
  paperHeight.value = 297;
  
  elements.value = [
    // 报表标题
    {
      id: 'el_title',
      type: 'text',
      x: mmToPx(10), y: mmToPx(10), width: mmToPx(190), height: mmToPx(12),
      value: '销售订单报表',
      fontSize: 22, fontColor: '#0c1832', fontWeight: 'bold', align: 'center', valign: 'middle', showStrategy: 'all'
    },
    {
      id: 'el_subtitle',
      type: 'text',
      x: mmToPx(10), y: mmToPx(20), width: mmToPx(190), height: mmToPx(6),
      value: 'ReportTools 自动分页报表设计演示模版',
      fontSize: 10, fontColor: '#64748b', align: 'center', valign: 'middle', showStrategy: 'all'
    },
    // 粗底线
    {
      id: 'el_line_top',
      type: 'line-h',
      x: mmToPx(10), y: mmToPx(26), width: mmToPx(190), height: mmToPx(2),
      borderWidth: 2, borderStyle: 'solid', fontColor: '#0c1832', showStrategy: 'all'
    },
    
    // 主表数据区 (第一行)
    {
      id: 'el_lbl_cust',
      type: 'text',
      x: mmToPx(10), y: mmToPx(30), width: mmToPx(20), height: mmToPx(6),
      value: '客户名称：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_val_cust',
      type: 'text',
      x: mmToPx(30), y: mmToPx(30), width: mmToPx(80), height: mmToPx(6),
      value: '${customer.name}', // 🔑 嵌套路径
      fontSize: 10, fontColor: '#0f172a', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_lbl_orderno',
      type: 'text',
      x: mmToPx(120), y: mmToPx(30), width: mmToPx(20), height: mmToPx(6),
      value: '订单编号：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_val_orderno',
      type: 'text',
      x: mmToPx(140), y: mmToPx(30), width: mmToPx(50), height: mmToPx(6),
      value: '${orderNo}',
      fontSize: 10, fontColor: '#0f172a', align: 'left', valign: 'middle', showStrategy: 'first'
    },

    // 主表数据区 (第二行)
    {
      id: 'el_lbl_contact',
      type: 'text',
      x: mmToPx(10), y: mmToPx(37), width: mmToPx(20), height: mmToPx(6),
      value: '联系人：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_val_contact',
      type: 'text',
      x: mmToPx(30), y: mmToPx(37), width: mmToPx(80), height: mmToPx(6),
      value: '${customer.contact}', // 🔑 嵌套路径
      fontSize: 10, fontColor: '#0f172a', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_lbl_date',
      type: 'text',
      x: mmToPx(120), y: mmToPx(37), width: mmToPx(20), height: mmToPx(6),
      value: '制单日期：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_val_date',
      type: 'text',
      x: mmToPx(140), y: mmToPx(37), width: mmToPx(50), height: mmToPx(6),
      value: '${createDate}',
      fontSize: 10, fontColor: '#0f172a', align: 'left', valign: 'middle', showStrategy: 'first'
    },

    // 主表数据区 (第三行)
    {
      id: 'el_lbl_phone',
      type: 'text',
      x: mmToPx(10), y: mmToPx(44), width: mmToPx(20), height: mmToPx(6),
      value: '联系电话：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_val_phone',
      type: 'text',
      x: mmToPx(30), y: mmToPx(44), width: mmToPx(80), height: mmToPx(6),
      value: '${customer.phone}', // 🔑 嵌套路径
      fontSize: 10, fontColor: '#0f172a', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_lbl_sales',
      type: 'text',
      x: mmToPx(120), y: mmToPx(44), width: mmToPx(20), height: mmToPx(6),
      value: '业务员：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'left', valign: 'middle', showStrategy: 'first'
    },
    {
      id: 'el_val_sales',
      type: 'text',
      x: mmToPx(140), y: mmToPx(44), width: mmToPx(50), height: mmToPx(6),
      value: '${salesperson}',
      fontSize: 10, fontColor: '#0f172a', align: 'left', valign: 'middle', showStrategy: 'first'
    },

    // 细分割线
    {
      id: 'el_line_mid',
      type: 'line-h',
      x: mmToPx(10), y: mmToPx(52), width: mmToPx(190), height: mmToPx(1),
      borderWidth: 1, borderStyle: 'solid', fontColor: '#cbd5e1', showStrategy: 'first'
    },

    // 核心表格明细表表体区
    {
      id: 'el_main_table',
      type: 'table',
      x: mmToPx(10), y: mmToPx(58), width: mmToPx(190), height: mmToPx(120), // 初始高度
      repeatHeader: true,
      dataSourcePath: 'detail', // 🔑 绑定列表数据源到嵌套路径 'detail' 上！
      columns: [
        { title: '序号', field: 'index', width: 45, align: 'center' },
        { title: '商品名称', field: 'goodsName', width: 280, align: 'left' },
        { title: '数量', field: 'quantity', width: 65, align: 'right' },
        { title: '单价', field: 'price', width: 100, align: 'right' },
        { title: '金额', field: 'amount', width: 110, align: 'right' }
      ],
      showStrategy: 'all'
    },

    // 底部汇总/章区 (仅在最后一页显示)
    {
      id: 'el_lbl_total',
      type: 'text',
      x: mmToPx(130), y: mmToPx(185), width: mmToPx(30), height: mmToPx(6),
      value: '应收合计：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'right', valign: 'middle', showStrategy: 'last'
    },
    {
      id: 'el_val_total',
      type: 'text',
      x: mmToPx(160), y: mmToPx(185), width: mmToPx(40), height: mmToPx(6),
      value: '￥${financial.totalAmount}', // 🔑 嵌套路径
      fontSize: 11, fontColor: '#0c1832', fontWeight: 'bold', align: 'right', valign: 'middle', showStrategy: 'last'
    },
    {
      id: 'el_lbl_tax',
      type: 'text',
      x: mmToPx(130), y: mmToPx(192), width: mmToPx(30), height: mmToPx(6),
      value: '税额：',
      fontSize: 10, fontColor: '#475569', fontWeight: 'bold', align: 'right', valign: 'middle', showStrategy: 'last'
    },
    {
      id: 'el_val_tax',
      type: 'text',
      x: mmToPx(160), y: mmToPx(192), width: mmToPx(40), height: mmToPx(6),
      value: '￥${financial.taxAmount}', // 🔑 嵌套路径
      fontSize: 11, fontColor: '#0c1832', fontWeight: 'bold', align: 'right', valign: 'middle', showStrategy: 'last'
    },
    {
      id: 'el_lbl_grand',
      type: 'text',
      x: mmToPx(130), y: mmToPx(200), width: mmToPx(30), height: mmToPx(7),
      value: '价税合计：',
      fontSize: 11, fontColor: '#475569', fontWeight: 'bold', align: 'right', valign: 'middle', showStrategy: 'last'
    },
    {
      id: 'el_val_grand',
      type: 'text',
      x: mmToPx(160), y: mmToPx(200), width: mmToPx(40), height: mmToPx(7),
      value: '￥${financial.grandTotal}', // 🔑 嵌套路径
      fontSize: 13, fontColor: '#d97706', fontWeight: 'bold', align: 'right', valign: 'middle', showStrategy: 'last'
    },

    // 矢量二维码与条码区 (放在最后一页左下角)
    {
      id: 'el_qrcode_foot',
      type: 'qrcode',
      x: mmToPx(10), y: mmToPx(182), width: mmToPx(24), height: mmToPx(24),
      value: '${orderNo}',
      showStrategy: 'last'
    },
    {
      id: 'el_barcode_foot',
      type: 'barcode',
      x: mmToPx(38), y: mmToPx(185), width: mmToPx(55), height: mmToPx(18),
      value: '${orderNo}',
      showText: true,
      showStrategy: 'last'
    },
    
    // 每页公共页脚分割细线
    {
      id: 'el_line_footer',
      type: 'line-h',
      x: mmToPx(10), y: mmToPx(285), width: mmToPx(190), height: mmToPx(1),
      borderWidth: 0.5, borderStyle: 'solid', fontColor: '#e2e8f0', showStrategy: 'all'
    },
    // 公共页码 (每页底部中央渲染)
    {
      id: 'el_footer_pagenum',
      type: 'page-number',
      x: mmToPx(85), y: mmToPx(287), width: mmToPx(40), height: mmToPx(6),
      fontSize: 9, fontColor: '#94a3b8', align: 'center', valign: 'middle', showStrategy: 'all'
    }
  ];
};

const saveTemplate = async () => {
  try {
    const payload = {
      templateId: templateId.value,
      templateName: templateName.value,
      apiPath: apiPath.value,
      paperSizePreset: paperSizePreset.value,
      paperWidth: paperWidth.value,
      paperHeight: paperHeight.value,
      isLandscape: isLandscape.value,
      gridSize: gridSize.value,
      pageMargins: JSON.stringify(pageMargins),
      elementsJson: JSON.stringify(elements.value),
      appId: 'default',
      remark: '在可视化设计器中更新保存'
    };

    if (dbRecordId.value) {
      // 1. 如果有 Nest 后端物理主键 ID，提交更新到后台数据库表 tb_print_template 中
      await updatePrintTemplate({
        id: dbRecordId.value,
        ...payload
      });
      window.$message?.success(`模板「${templateName.value}」已成功保存至后台数据库中！`);
    } else {
      // 2. 兜底 LocalStorage 本地保存
      const localPayload = {
        ...payload,
        pageMargins,
        elements: elements.value
      };
      localStorage.setItem('report-print-template', JSON.stringify(localPayload, null, 2));
      alert(`模板「${templateName.value}」已成功保存至浏览器本地缓存中！`);
    }
  } catch (e) {
    if (window.$message) {
      window.$message.error('模板保存失败：' + e.message);
    } else {
      alert('模板保存失败：' + e.message);
    }
  }
};

const loadSavedTemplate = async () => {
  if (dbRecordId.value) {
    // 从 NestJS 接口动态获取配置并回填
    try {
      const res = await getPrintTemplateDetail(dbRecordId.value);
      if (res) {
        templateId.value = res.templateId;
        templateName.value = res.templateName;
        apiPath.value = res.apiPath || '/api/v1/business/detail';
        paperSizePreset.value = res.paperSizePreset || 'A4';
        paperWidth.value = res.paperWidth || 210;
        paperHeight.value = res.paperHeight || 297;
        isLandscape.value = typeof res.isLandscape === 'boolean' ? res.isLandscape : false;
        gridSize.value = res.gridSize || 5;
        if (res.pageMargins) {
          try {
            const parsed = JSON.parse(res.pageMargins);
            Object.assign(pageMargins, parsed);
          } catch(e){}
        }
        if (res.elementsJson) {
          try {
            elements.value = JSON.parse(res.elementsJson);
          } catch(e){}
        }
        return true;
      }
    } catch (e) {
      window.$message?.error('从后台加载模板失败：' + e.message);
    }
  }
  
  // 兜底 LocalStorage
  const saved = localStorage.getItem('report-print-template');
  if (saved) {
    try {
      const payload = JSON.parse(saved);
      if (Array.isArray(payload)) {
        elements.value = payload;
      } else {
        templateId.value = payload.templateId || ('tpl_' + Math.random().toString(36).substr(2, 9));
        templateName.value = payload.templateName || '未命名打印模板';
        apiPath.value = payload.apiPath || '/api/v1/business/detail';
        paperSizePreset.value = payload.paperSizePreset || 'A4';
        paperWidth.value = payload.paperWidth || 210;
        paperHeight.value = payload.paperHeight || 297;
        isLandscape.value = typeof payload.isLandscape === 'boolean' ? payload.isLandscape : false;
        gridSize.value = payload.gridSize || 5;
        if (payload.pageMargins) {
          Object.assign(pageMargins, payload.pageMargins);
        }
        elements.value = payload.elements || [];
      }
      return true;
    } catch(e) {}
  }
  return false;
};

// 键盘快捷键监听：选中元素后按 Delete 删除
const handleKeyDown = (e) => {
  if (isPreview.value) return;
  if ((e.key === 'Delete' || e.key === 'Backspace') && activeId.value) {
    // 只有当焦点不在输入框/textarea上时才执行删除
    const tag = document.activeElement.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
      deleteActiveElement();
    }
  }
};

// 🔍 请求真实接口测试数据
import service from '@/api/index';

const handleFetchTestData = async () => {
  if (!apiPath.value.trim()) {
    window.$message?.warning('请先在【页面设置】面板配置当前模板绑定的详情/列表数据源接口 apiPath！');
    return;
  }

  isTestingApi.value = true;
  try {
    const rawPath = apiPath.value.trim();
    
    // 解析用户输入的参数 JSON 字符串
    let customParams = {};
    if (testParams.value && testParams.value.trim()) {
      try {
        customParams = JSON.parse(testParams.value.trim());
      } catch(e) {
        window.$message?.warning('高级参数 JSON 格式不正确，请确保为标准的键值对 JSON 字符串！');
        isTestingApi.value = false;
        return;
      }
    }

    // 智能将用户输入的“业务记录 ID”注入到参数池或 URL 中
    if (testBusinessId.value.trim()) {
      customParams.id = testBusinessId.value.trim();
      customParams.businessId = testBusinessId.value.trim();
    }

    let finalUrl = rawPath;
    let res = null;

    if (testMethod.value === 'POST') {
      window.$message?.info(`[POST] 正在请求真实业务数据：${finalUrl} ...`);
      res = await service.post(finalUrl, customParams);
    } else {
      // GET 请求：把所有参数序列化拼接为 Query string
      // 智能感知 URL 占位符如 /api/detail/{id}
      if (testBusinessId.value.trim() && finalUrl.includes('{id}')) {
        finalUrl = finalUrl.replace('{id}', testBusinessId.value.trim());
      }
      
      const queryParts = [];
      for (const [key, val] of Object.entries(customParams)) {
        // 如果是占位符形式，已经在 URL 里替换了，query 中就不重复拼接
        if (rawPath.includes('{id}') && (key === 'id' || key === 'businessId')) {
          continue;
        }
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
      }
      
      if (queryParts.length > 0) {
        finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}${queryParts.join('&')}`;
      }
      
      window.$message?.info(`[GET] 正在请求真实业务数据：${finalUrl} ...`);
      res = await service.get(finalUrl);
    }
    
    if (res) {
      testDebugData.value = res; // 灌入测试数据
      window.$message?.success('🎉 真实业务数据源拉取并匹配成功！左侧变量树已无缝切换为真实数据，双击直接设计绑定！');
    } else {
      window.$message?.warning('接口未返回有效数据，请检查传入的参数或 ID 是否真实存在。');
    }
  } catch (err) {
    console.error('接口测试失败:', err);
    window.$message?.error(`接口联调失败: ${err.message || '请核实该接口是否在公司内网运行或检查控制台跨域限制。'}`);
  } finally {
    isTestingApi.value = false;
  }
};

const clearTestData = () => {
  testDebugData.value = null;
  testBusinessId.value = '';
  testParams.value = '{}';
  window.$message?.info('已恢复为设计器默认 Mock 演示数据源。');
};

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown);
  
  // 智能挂载：如果有 query.id 则从 Nest 动态获取，否则加载默认示例
  const loaded = await loadSavedTemplate();
  if (!loaded) {
    loadDefaultTemplate();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style>
/* 全局页面美化，应用富视觉设计 */
.report-designer-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: #f3f4f8;
  color: #0f172a;
  font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
  user-select: none;
}

.debug-badge-active {
  font-size: 9.5px;
  background-color: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.debug-badge-inactive {
  font-size: 9.5px;
  background-color: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

/* 顶部操作工具栏 */
.designer-header {
  height: 56px;
  background-color: #0c1832; /* 深色曜石蓝 */
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 4px 16px rgba(12, 24, 50, 0.15);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #f59e0b; /* 琥珀金点缀 */
}

.divider {
  width: 1px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.15);
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* 手写的高颜值 Select */
.select-wrapper {
  position: relative;
}
.select-wrapper select {
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  padding: 6px 28px 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}
.select-wrapper select:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}
.select-wrapper::after {
  content: '';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

/* 按钮样式组 */
.icon-btn {
  background: transparent;
  border: 1px solid transparent;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.icon-btn:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.08);
}
.icon-btn.is-active {
  background-color: #f59e0b;
  color: #0c1832;
  font-weight: 600;
}

.icon-btn-action {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.icon-btn-action:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.zoom-value {
  font-size: 13px;
  width: 45px;
  text-align: center;
  font-family: monospace;
}

/* 头部操作动作按钮 */
.btn {
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}
.btn-primary {
  background-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.btn-primary:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}
.btn-accent {
  background-color: #f59e0b;
  color: #0c1832;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}
.btn-accent:hover {
  background-color: #d97706;
  transform: translateY(-1px);
}
.btn-secondary {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

/* 主工作区布局 */
.designer-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧物料与数据源侧栏 */
.sidebar-left {
  width: 260px;
  background-color: #ffffff;
  border-right: 1px solid #e8ecf2;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-title {
  margin: 0;
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #0c1832;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f0f2f6;
}

.section-elements {
  height: auto;
  max-height: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e8ecf2;
  transition: all 0.2s ease;
}

.section-elements.is-collapsed {
  height: auto;
  max-height: 43px;
  overflow: hidden;
}

.section-datasource.is-collapsed {
  flex: none !important;
  height: 43px !important;
  overflow: hidden;
}

.section-outline.is-collapsed {
  height: 43px !important;
  overflow: hidden;
}

.element-grid {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* 拖拽元素卡片 */
.toolbox-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.toolbox-card:hover {
  border-color: #d97706;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.08);
  transform: translateY(-1px);
}
.toolbox-card:active {
  cursor: grabbing;
}
.toolbox-icon {
  color: #475569;
  transition: color 0.2s ease;
}
.toolbox-card:hover .toolbox-icon {
  color: #d97706;
}
.toolbox-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

/* 数据源模块 */
.section-datasource {
  flex: 1;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-bottom: 1px solid #e8ecf2;
}

/* 图层大纲模块 */
.section-outline {
  height: 240px;
  flex: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fcfdfe;
}

.outline-title-bar {
  margin: 0;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #0c1832;
  border-bottom: 1px solid #f0f2f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
}

.outline-title-bar .badge {
  background-color: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.outline-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.outline-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.outline-item:hover {
  border-color: #3b82f6; /* 蔚蓝色 */
  background-color: #f0f7ff;
}

.outline-item.is-active {
  border-color: #d97706; /* 橘金色 */
  background-color: #fffbeb;
}

.outline-item.is-hovered:not(.is-active) {
  border-color: #3b82f6;
  background-color: #f0f7ff;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  flex-shrink: 0;
}

.item-icon svg {
  width: 14px;
  height: 14px;
}

.outline-item:hover .item-icon {
  color: #3b82f6;
}

.outline-item.is-active .item-icon {
  color: #d97706;
}

.item-label {
  font-size: 11px;
  font-weight: 500;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.outline-item.is-active .item-label {
  color: #b45309;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0; /* 默认隐藏，hover时呈现 */
  transition: opacity 0.2s ease;
  flex-shrink: 0;
  margin-left: 8px;
}

.outline-item:hover .item-actions {
  opacity: 1;
}

.outline-item.is-active .item-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 10px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.action-btn-del {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 4px;
  line-height: 1;
}

.action-btn-del:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.outline-empty {
  text-align: center;
  padding: 40px 0;
  font-size: 11px;
  color: #94a3b8;
  font-style: italic;
}

.data-tree {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.tree-group {
  margin-bottom: 14px;
}

.tree-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}

.tree-children {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 12px;
  border-left: 1px dashed #cbd5e1;
  margin-left: 6px;
}

/* 数据树节点 */
.tree-node {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.tree-node:hover {
  background-color: #f1f5f9;
}
.node-key {
  font-family: monospace;
  color: #d97706;
  font-weight: 600;
}
.node-label {
  color: #64748b;
  margin-top: 1px;
}

.datasource-tips {
  font-size: 10px;
  color: #94a3b8;
  padding: 10px 16px;
  line-height: 1.4;
  border-top: 1px solid #f0f2f6;
  background-color: #fafbfc;
}

/* 中间主画布视口 */
.canvas-viewport {
  flex: 1;
  overflow: auto;
  position: relative;
  background-color: #f1f5f9;
  outline: none;
}

.canvas-inner {
  margin: 0 auto;
}

/* 右侧属性侧栏 */
.sidebar-right {
  width: 320px;
  flex-shrink: 0;
  background-color: #ffffff;
  border-left: 1px solid #e8ecf2;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.right-tabs {
  display: flex;
  border-bottom: 1px solid #f0f2f6;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}
.tab-item:hover {
  color: #0c1832;
}
.tab-item.is-active {
  color: #d97706;
  border-bottom-color: #d97706;
  background-color: rgba(217, 119, 6, 0.01);
}

.right-panel-body {
  flex: 1;
  overflow-y: auto;
}

.tab-panel {
  padding: 16px;
}

.panel-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #94a3b8;
  margin-top: 80px;
  padding: 0 20px;
}
.panel-placeholder svg {
  margin-bottom: 12px;
}
.panel-placeholder p {
  font-size: 12px;
  line-height: 1.5;
}

/* 精致手写属性表单样式 */
.property-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prop-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #0c1832;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.prop-divider {
  height: 1px;
  background-color: #f0f2f6;
  margin: 8px 0;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.form-item label {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}
.form-item input[type="text"],
.form-item input[type="number"],
.form-item select,
.form-item textarea {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #1e293b;
  outline: none;
  background-color: #ffffff;
  transition: all 0.2s ease;
}
.form-item input[type="text"]:focus,
.form-item input[type="number"]:focus,
.form-item select:focus,
.form-item textarea:focus {
  border-color: #d97706;
  box-shadow: 0 0 6px rgba(217, 119, 6, 0.12);
}

.form-item input[type="color"] {
  box-sizing: border-box;
  appearance: none;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  width: 100%;
  height: 28px;
  padding: 2px;
  cursor: pointer;
}

.form-row-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.field-desc-text {
  font-size: 10px;
  color: #94a3b8;
  margin: 2px 0 0 0;
}

/* 高颜值 Toggle 开关 */
.btn-group-toggle {
  display: flex;
  gap: 4px;
}
.toggle-btn {
  flex: 1;
  padding: 6px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: #ffffff;
  color: #475569;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}
.toggle-btn:hover {
  background-color: #f8fafc;
}
.toggle-btn.is-active {
  background-color: #d97706;
  color: #ffffff;
  border-color: #d97706;
  font-weight: bold;
}

.checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.checkbox-label input {
  cursor: pointer;
}

/* 高级表格列管理样式 */
.table-columns-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #0c1832;
  margin-top: 6px;
}
.btn-small {
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-small:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.table-cols-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #f0f2f6;
  border-radius: 6px;
  padding: 8px;
  background-color: #fafbfc;
}

.col-config-item {
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.col-config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: bold;
  color: #64748b;
}

.btn-delete-col {
  color: #ef4444;
  cursor: pointer;
}
.btn-delete-col:hover {
  text-decoration: underline;
}

.btn-action-delete {
  background-color: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
  border-radius: 6px;
  padding: 8px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-action-delete:hover {
  background-color: #fee2e2;
}

/* 全局打印预览模式覆盖设计器界面，从而完全专注 */
.is-preview-mode {
  background-color: #1e293b;
}

/* ==========================================
   右侧复杂表头网格合并与可视化配置样式
   ========================================== */

.complex-header-designer-wrapper {
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.header-rows-accordion {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-row-group {
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background-color: #fafbfc;
  padding: 10px;
}

.header-row-group-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #e2e8f0;
}

.header-cells-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cell-config-card {
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  border-radius: 6px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  transition: border-color 0.15s ease;
}

.cell-config-card:hover {
  border-color: #bfdbfe;
}

.cell-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  font-weight: bold;
  color: #64748b;
  padding-bottom: 4px;
}

.binding-indicator-dot {
  position: absolute;
  left: 6px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #3b82f6;
  box-shadow: 0 0 8px #3b82f6;
  animation: pulse-blue 2s infinite ease-in-out;
  display: inline-block;
  z-index: 10;
}

@keyframes pulse-blue {
  0% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.6; }
}

/* 引导开启复杂表头的推广卡片 */
.complex-header-lead-card {
  border: 1.5px dashed #bfdbfe;
  background-color: #f0f7ff;
  border-radius: 10px;
  padding: 18px 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.complex-header-lead-card:hover {
  background-color: #eff6ff;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.lead-icon {
  font-size: 24px;
  animation: bounce-slow 4s infinite ease-in-out;
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.lead-title {
  font-size: 12.5px;
  font-weight: bold;
  color: #1e40af;
}

.lead-desc {
  font-size: 11px;
  color: #475569;
  line-height: 1.5;
  margin: 0;
}

.btn-lead-action {
  width: 100%;
  font-size: 11px;
  padding: 7px 14px;
  border-radius: 6px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.18);
  transition: all 0.15s ease;
  margin-top: 4px;
}

.btn-lead-action:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  transform: translateY(-0.5px);
}
</style>