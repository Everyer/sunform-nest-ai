<template>
  <div
    class="flow-canvas"
    tabindex="0"
    @keydown="onKeyDown"
    @contextmenu.prevent="onCanvasContextMenu"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
    @click="closeContextMenu"
  >
    <VueFlow
      ref="vueFlowRef"
      v-model:nodes="nodes"
      v-model:edges="edges"
      :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      :node-types="nodeTypes"
      :connection-line-style="{ stroke: '#3b82f6', strokeWidth: 2 }"
      :default-edge-options="defaultEdgeOptions"
      :fit-view-on-init="nodes.length > 0"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
      @connect="onConnect"
      @node-click="onNodeClick"
      @pane-click="onPaneClick"
      @edge-click="onEdgeClick"
      @nodes-change="onNodesChange"
      @pane-context-menu="onPaneContextMenu"
    >
      <Background pattern-color="#f1f5f9" :gap="20" />
      <Controls position="bottom-right" />
      <template #node-custom="nodeProps">
        <CustomNode v-bind="nodeProps" />
      </template>
    </VueFlow>

    <!-- Right-click context menu -->
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <div class="ctx-title">添加节点</div>
      <div class="ctx-item" @click="addNodeAtContext('start')">
        <div class="ctx-dot start"></div><span>发起节点</span>
      </div>
      <div class="ctx-item" @click="addNodeAtContext('approve')">
        <div class="ctx-dot approve"></div><span>审批节点</span>
      </div>
      <div class="ctx-item" @click="addNodeAtContext('condition')">
        <div class="ctx-dot condition"></div><span>条件分支</span>
      </div>
      <div class="ctx-item" @click="addNodeAtContext('end')">
        <div class="ctx-dot end"></div><span>结束节点</span>
      </div>
    </div>

    <!-- Edge config modal -->
    <n-modal v-model:show="showEdgeModal" title="连线配置" preset="card" style="width: 680px">
      <n-form label-placement="top" size="small">
        <n-form-item label="连线标签">
          <n-input v-model:value="editingEdge.label" placeholder="如：同意、驳回、>3天" />
        </n-form-item>
        
        <!-- Else / Default Branch Option -->
        <n-form-item v-if="editingEdge.isCondition" label="分支流转模式">
          <n-space vertical>
            <n-switch v-model:value="editingEdge.isDefault" @update:value="onIsDefaultChange">
              <template #checked>默认流转分支 (Else)</template>
              <template #unchecked>普通条件分支</template>
            </n-switch>
            <span class="text-xs text-slate-400">
              当同级所有其他分支条件都不满足时，流程将自动走此默认流转分支。每个节点最多只能设置一个默认分支。
            </span>
          </n-space>
        </n-form-item>

        <!-- Condition Builder -->
        <div v-if="editingEdge.isCondition && !editingEdge.isDefault" class="condition-builder-panel mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-slate-700">条件规则设置</span>
            <n-button-group size="tiny">
              <n-button 
                :type="editingEdge.logicalOp === 'and' ? 'primary' : 'default'"
                @click="editingEdge.logicalOp = 'and'"
                style="font-weight: 500; min-width: 120px"
              >
                满足所有条件 (AND)
              </n-button>
              <n-button 
                :type="editingEdge.logicalOp === 'or' ? 'primary' : 'default'"
                @click="editingEdge.logicalOp = 'or'"
                style="font-weight: 500; min-width: 120px"
              >
                满足任一条件 (OR)
              </n-button>
            </n-button-group>
          </div>

          <!-- Rules List -->
          <div class="space-y-3 max-h-60 overflow-y-auto mb-3">
            <div v-for="(rule, idx) in editingEdge.rules" :key="idx" class="flex items-center gap-2 bg-white p-2 rounded border border-slate-100 shadow-sm">
              <!-- Field Select -->
              <n-select
                v-model:value="rule.field"
                :options="fieldOptions"
                placeholder="选择字段"
                size="small"
                style="width: 230px; flex-shrink: 0"
                @update:value="onFieldChange(rule)"
              />

              <!-- Operator Select -->
              <n-select
                v-model:value="rule.operator"
                :options="getOperatorsForField(rule.field)"
                placeholder="操作符"
                size="small"
                style="width: 110px; flex-shrink: 0"
              />

              <!-- Value Input (depending on field and operator) -->
              <div class="flex-1 min-w-0" v-if="rule.operator !== 'empty' && rule.operator !== 'not_empty'">
                <!-- Number Input -->
                <n-input-number
                  v-if="getFieldType(rule.field) === 'number'"
                  v-model:value="rule.value"
                  size="small"
                  placeholder="数值"
                  style="width: 100%"
                />
                <!-- Switch Select -->
                <n-select
                  v-else-if="getFieldType(rule.field) === 'switch'"
                  v-model:value="rule.value"
                  :options="[{ label: '开启/是', value: 'true' }, { label: '关闭/否', value: 'false' }]"
                  size="small"
                  placeholder="选择值"
                />
                <!-- Select/Radio/Checkbox Dropdown Options -->
                <n-select
                  v-else-if="['select', 'radio', 'checkbox'].includes(getFieldType(rule.field))"
                  v-model:value="rule.value"
                  :options="getFieldOptions(rule.field)"
                  size="small"
                  placeholder="选择选项"
                />
                <!-- Date/Datetime Picker -->
                <n-date-picker
                  v-else-if="['date', 'datetime'].includes(getFieldType(rule.field))"
                  v-model:value="rule.value"
                  :type="getFieldType(rule.field)"
                  size="small"
                  style="width: 100%"
                />
                <!-- Standard Text Input -->
                <n-input
                  v-else
                  v-model:value="rule.value"
                  size="small"
                  placeholder="输入值"
                />
              </div>

              <!-- Delete Rule -->
              <n-button size="small" type="error" text @click="removeRule(idx)">
                <template #icon><n-icon><TrashOutline /></n-icon></template>
              </n-button>
            </div>
            <div v-if="editingEdge.rules.length === 0" class="text-center text-slate-400 text-xs py-4 bg-white rounded border border-dashed border-slate-200">
              暂无条件规则，请点击下方按钮开始设置
            </div>
          </div>

          <n-space justify="center">
            <n-button size="small" type="primary" dashed @click="addRule">
              + 添加条件规则
            </n-button>
          </n-space>
        </div>
        
        <n-alert v-if="editingEdge.isCondition && !editingEdge.isDefault" type="info" size="small" class="mt-3">
          当一个节点有多条出线时，需为每条线设置条件来决定走哪条分支，或者设置其中一条为默认流转分支。
        </n-alert>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button size="small" type="error" quaternary @click="deleteEdge">删除连线</n-button>
          <n-button size="small" type="primary" @click="saveEdge">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, markRaw, nextTick, onMounted, computed } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import {
  NModal, NButton, NInput, NSelect, NForm, NFormItem, NSpace, NAlert,
  NSwitch, NRadioGroup, NRadioButton, NInputNumber, NDatePicker, NIcon,
} from 'naive-ui'
import { TrashOutline } from '@vicons/ionicons5'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import CustomNode from './CustomNode.vue'
import { getUserList } from '@/api/user'
import { getRoleList } from '@/api/role'

const props = defineProps({
  fields: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:nodes', 'update:edges', 'node-select'])

const nodeTypes = { custom: markRaw(CustomNode) }
const vueFlowRef = ref(null)
const { fitView: vueFlowFitView } = useVueFlow()

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { stroke: '#94a3b8', strokeWidth: 2 },
  animated: false,
  labelStyle: { fill: '#475569', fontSize: 11, fontWeight: 500 },
  labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
  labelBgPadding: [6, 4],
  labelBgBorderRadius: 4,
}

const nodes = ref([])
const edges = ref([])

const selectedNode = ref(null)
const showEdgeModal = ref(false)
const editingEdge = ref({
  id: '',
  label: '',
  isCondition: false,
  isDefault: false,
  logicalOp: 'and',
  rules: [],
  conditionExpr: '',
})

const contextMenu = reactive({ show: false, x: 0, y: 0 })
const contextCanvasPos = reactive({ x: 0, y: 0 })

let nodeIdCounter = 1
function genNodeId() { return `n_${Date.now()}_${nodeIdCounter++}` }
function genEdgeId() { return `e_${Date.now()}_${nodeIdCounter++}` }

const assigneeTypeOptions = [
  { label: '发起人上级', value: 'superior' },
  { label: '指定人', value: 'specified_user' },
  { label: '指定角色', value: 'specified_role' },
  { label: '第N级上级', value: 'superior_level' },
  { label: '自定义', value: 'custom' },
]

const signTypeOptions = [
  { label: '单人审批', value: 'single' },
  { label: '会签（全部同意）', value: 'all' },
  { label: '或签（任一同意）', value: 'any' },
]

const rejectStrategyOptions = [
  { label: '退回到发起人', value: 'back_to_start' },
  { label: '退回上一节点', value: 'back_to_prev' },
]

const userOptions = ref([])
const roleOptions = ref([])

onMounted(async () => {
  console.log('[FlowCanvas] mounted, initial nodes:', nodes.value.length)
  try {
    const users = await getUserList()
    userOptions.value = (users || []).map(u => ({ label: `${u.username} (${u.staff?.staffName || u.realName || ''})`, value: u.username }))
  } catch (e) { /* noop */ }
  try {
    const roles = await getRoleList()
    roleOptions.value = (roles || []).map(r => ({ label: r.roleName, value: r.roleName }))
  } catch (e) { /* noop */ }
})

// ==================== Context Menu ====================
function onCanvasContextMenu(e) {
  const flowEl = vueFlowRef.value?.$el
  if (!flowEl) return
  const rect = flowEl.getBoundingClientRect()
  contextMenu.x = e.clientX - rect.left
  contextMenu.y = e.clientY - rect.top
  contextCanvasPos.x = e.clientX - rect.left
  contextCanvasPos.y = e.clientY - rect.top
  contextMenu.show = true
}

function onPaneContextMenu(e) {
  // e is the Vue Flow pane context menu event
  contextMenu.show = true
}

function closeContextMenu() {
  contextMenu.show = false
}

function addNodeAtContext(type) {
  const labels = { start: '发起人', approve: '审批节点', condition: '条件分支', end: '结束' }
  // Convert screen coords to flow coords
  const viewport = vueFlowRef.value?.getViewport?.() || { x: 0, y: 0, zoom: 1 }
  const x = (contextCanvasPos.x - viewport.x) / viewport.zoom
  const y = (contextCanvasPos.y - viewport.y) / viewport.zoom

  const id = genNodeId()
  nodes.value.push({
    id,
    type: 'custom',
    position: { x: Math.round(x / 20) * 20, y: Math.round(y / 20) * 20 },
    data: {
      name: labels[type] || '新节点',
      nodeType: type,
      assigneeType: type === 'approve' ? 'superior' : undefined,
      assigneeValue: undefined,
      signType: 'single',
      rejectStrategy: 'back_to_start',
    },
  })
  contextMenu.show = false
  nextTick(() => emitUpdate())
}

// ==================== Drag from toolbar ====================
function onDragOver(e) {
  e.dataTransfer.dropEffect = 'move'
}

function onDrop(e) {
  const type = e.dataTransfer.getData('node-type')
  if (!type) return

  const flowEl = vueFlowRef.value?.$el
  if (!flowEl) return
  const rect = flowEl.getBoundingClientRect()
  const viewport = vueFlowRef.value?.getViewport?.() || { x: 0, y: 0, zoom: 1 }
  const x = (e.clientX - rect.left - viewport.x) / viewport.zoom
  const y = (e.clientY - rect.top - viewport.y) / viewport.zoom

  const labels = { start: '发起人', approve: '审批节点', condition: '条件分支', end: '结束' }
  const id = genNodeId()
  nodes.value.push({
    id,
    type: 'custom',
    position: { x: Math.round(x / 20) * 20, y: Math.round(y / 20) * 20 },
    data: {
      name: labels[type] || '新节点',
      nodeType: type,
      assigneeType: type === 'approve' ? 'superior' : undefined,
      assigneeValue: undefined,
      signType: 'single',
      rejectStrategy: 'back_to_start',
    },
  })
  nextTick(() => emitUpdate())
}

// ==================== Connections ====================
function onConnect(connection) {
  const newEdge = {
    id: genEdgeId(),
    source: connection.source,
    target: connection.target,
    type: 'smoothstep',
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    label: '',
    data: { label: '', conditionExpr: '', isCondition: false },
  }

  const existing = edges.value.filter(e => e.source === connection.source)
  if (existing.length > 0) {
    existing.forEach(e => { e.data.isCondition = true })
    newEdge.data.isCondition = true
  }

  edges.value.push(newEdge)
  nextTick(() => emitUpdate())
}

function onNodeClick({ node }) {
  selectedNode.value = node
  emit('node-select', node)
}

function onPaneClick() {
  selectedNode.value = null
  emit('node-select', null)
}

function onEdgeClick({ edge }) {
  let cond = edge.data?.condition || edge.condition;
  let isDefault = false;
  let logicalOp = 'and';
  let rules = [];

  if (cond) {
    if (typeof cond === 'string') {
      try {
        cond = JSON.parse(cond);
      } catch (e) {
        if (cond === 'else' || cond === 'other') {
          isDefault = true;
        } else {
          rules = parseLegacyConditionString(cond);
        }
      }
    }
    if (typeof cond === 'object' && cond !== null) {
      isDefault = cond.isDefault || false;
      logicalOp = cond.logicalOp || 'and';
      rules = cond.rules || [];
    }
  }

  // Ensure rules have initial options if they are empty
  if (rules.length === 0 && !isDefault && edge.data?.isCondition) {
    const firstField = props.fields?.[0]?.key || '';
    rules.push({ field: firstField, operator: '==', value: null });
  }

  editingEdge.value = {
    id: edge.id,
    label: edge.label || edge.data?.label || '',
    isCondition: edge.data?.isCondition || false,
    isDefault,
    logicalOp,
    rules: JSON.parse(JSON.stringify(rules)),
    conditionExpr: edge.data?.conditionExpr || '',
  }
  showEdgeModal.value = true
}

function parseLegacyConditionString(str) {
  if (!str) return [];
  const match = str.match(/^\s*([a-zA-Z0-9_]+)\s*([>=<!]+|contains|not_contains)\s*(.+)$/);
  if (match) {
    const val = match[3].trim().replace(/^['"]|['"]$/g, '');
    return [{ field: match[1], operator: match[2], value: val }];
  }
  return [{ field: 'unknown', operator: '==', value: str }];
}

const fieldOptions = computed(() => {
  const options = []
  ;(props.fields || []).forEach(f => {
    if (f.type === 'subtable') {
      options.push({
        label: `${f.label || f.key} (明细总笔数)`,
        value: `${f.key}_count`,
      })
      ;(f.columns || []).forEach(c => {
        if (c.type === 'number' || c.type === 'input') {
          options.push({
            label: `${f.label || f.key} ➔ ${c.label || c.key} (累加和)`,
            value: `${f.key}_sum_${c.key}`,
          })
          options.push({
            label: `${f.label || f.key} ➔ ${c.label || c.key} (单项最大值)`,
            value: `${f.key}_max_${c.key}`,
          })
        }
      })
    } else {
      options.push({
        label: `${f.label || f.key} (${f.key})`,
        value: f.key,
      })
    }
  })
  return options
})

function getFieldType(fieldKey) {
  if (fieldKey.includes('_sum_') || fieldKey.includes('_max_') || fieldKey.endsWith('_count')) {
    return 'number'
  }
  const field = (props.fields || []).find(f => f.key === fieldKey)
  return field ? field.type : 'input'
}

function getFieldOptions(fieldKey) {
  const field = (props.fields || []).find(f => f.key === fieldKey)
  return (field?.options || []).map(o => ({
    label: o.label || o.value,
    value: o.value,
  }))
}

function getOperatorsForField(fieldKey) {
  const type = getFieldType(fieldKey)
  if (type === 'number') {
    return [
      { label: '大于 (>)', value: '>' },
      { label: '大于等于 (>=)', value: '>=' },
      { label: '小于 (<)', value: '<' },
      { label: '小于等于 (<=)', value: '<=' },
      { label: '等于 (==)', value: '==' },
      { label: '不等于 (!=)', value: '!=' },
    ]
  }
  if (['select', 'radio', 'checkbox', 'switch'].includes(type)) {
    return [
      { label: '等于 (==)', value: '==' },
      { label: '不等于 (!=)', value: '!=' },
      { label: '为空', value: 'empty' },
      { label: '不为空', value: 'not_empty' },
    ]
  }
  return [
    { label: '等于 (==)', value: '==' },
    { label: '不等于 (!=)', value: '!=' },
    { label: '大于 (>)', value: '>' },
    { label: '大于等于 (>=)', value: '>=' },
    { label: '小于 (<)', value: '<' },
    { label: '小于等于 (<=)', value: '<=' },
    { label: '包含', value: 'contains' },
    { label: '不包含', value: 'not_contains' },
    { label: '为空', value: 'empty' },
    { label: '不为空', value: 'not_empty' },
  ]
}

function onFieldChange(rule) {
  rule.operator = '=='
  rule.value = null
}

function onIsDefaultChange(val) {
  if (val) {
    editingEdge.value.label = '其他'
  } else {
    editingEdge.value.label = ''
  }
}

function addRule() {
  const firstField = props.fields?.[0]?.key || ''
  editingEdge.value.rules.push({
    field: firstField,
    operator: '==',
    value: null,
  })
}

function removeRule(idx) {
  editingEdge.value.rules.splice(idx, 1)
}

function buildConditionString(logicalOp, rules) {
  if (!rules || rules.length === 0) return ''
  const opText = logicalOp === 'and' ? ' 且 ' : ' 或 '
  return rules.map(r => {
    const fLabel = props.fields?.find(f => f.key === r.field)?.label || r.field
    const opLabel = {
      '==': '=', '!=': '!=', '>': '>', '>=': '>=', '<': '<', '<=': '<=',
      'contains': '包含', 'not_contains': '不包含', 'empty': '为空', 'not_empty': '不为空',
    }[r.operator] || r.operator
    const valText = r.operator === 'empty' || r.operator === 'not_empty' ? '' : ` "${r.value ?? ''}"`
    return `${fLabel}${opLabel}${valText}`
  }).join(opText)
}

function saveEdge() {
  const edge = edges.value.find(e => e.id === editingEdge.value.id)
  if (edge) {
    const label = editingEdge.value.isDefault ? (editingEdge.value.label || '其他') : editingEdge.value.label;
    edge.label = label
    if (!edge.data) edge.data = {}
    edge.data.label = label
    edge.data.isCondition = editingEdge.value.isCondition
    
    const condition = {
      isDefault: editingEdge.value.isDefault,
      logicalOp: editingEdge.value.logicalOp,
      rules: editingEdge.value.rules,
    }
    edge.data.condition = condition
    edge.data.conditionExpr = editingEdge.value.isDefault 
      ? 'else' 
      : buildConditionString(editingEdge.value.logicalOp, editingEdge.value.rules)
  }
  showEdgeModal.value = false
  nextTick(() => emitUpdate())
}

function onKeyDown(e) {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const sel = vueFlowRef.value?.getSelectedNodes?.()
    if (sel?.length) deleteNodeById(sel[0].id)
  }
}

function onNodesChange() { emitUpdate() }

function deleteSelectedNode() {
  if (selectedNode.value) {
    const id = selectedNode.value.id
    selectedNode.value = null
    emit('node-select', null)
    deleteNodeById(id)
  }
}

function deleteNodeById(nodeId) {
  nodes.value = nodes.value.filter(n => n.id !== nodeId)
  edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId)
  selectedNode.value = null
  nextTick(() => emitUpdate())
}

function deleteEdge() {
  edges.value = edges.value.filter(e => e.id !== editingEdge.value.id)
  showEdgeModal.value = false
  nextTick(() => emitUpdate())
}

// ==================== Public API ====================
function addNode(type) {
  addNodeAtContext(type)
}

function getFlowData() {
  return {
    nodes: nodes.value.map(n => ({
      id: n.id,
      name: n.data.name,
      type: n.data.nodeType,
      assigneeType: n.data.assigneeType,
      assigneeValue: n.data.assigneeValue,
      positionX: n.position.x,
      positionY: n.position.y,
      config: { signType: n.data.signType, rejectStrategy: n.data.rejectStrategy },
    })),
    edges: edges.value.map(e => ({
      id: e.id,
      sourceNodeId: e.source,
      targetNodeId: e.target,
      label: e.label || e.data?.label || '',
      condition: e.data?.condition || e.data?.conditionExpr || null,
    })),
  }
}

function loadFlowData(nds, eds) {
  console.log('[FlowCanvas] loadFlowData called with', nds?.length, 'nodes,', eds?.length, 'edges')
  nodes.value = (nds || []).map(n => ({
    id: n.id, type: 'custom',
    position: { x: n.positionX || 0, y: n.positionY || 0 },
    data: {
      name: n.name, nodeType: n.type,
      assigneeType: n.assigneeType, assigneeValue: n.assigneeValue || n.data?.assigneeValue,
      signType: n.config?.signType || n.data?.signType || 'single',
      rejectStrategy: n.config?.rejectStrategy || n.data?.rejectStrategy || 'back_to_start',
    },
  }))
  edges.value = (eds || []).map(e => ({
    id: e.id, source: e.sourceNodeId, target: e.targetNodeId,
    type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 },
    label: e.label || '',
    data: { 
      label: e.label || '', 
      condition: e.condition || null,
      conditionExpr: typeof e.condition === 'string' ? e.condition : (e.condition?.isDefault ? 'else' : ''),
      isCondition: !!e.condition 
    },
  }))
  nextTick(() => {
    setTimeout(() => {
      if (typeof vueFlowFitView === 'function') {
        vueFlowFitView({ padding: 0.2 })
      }
    }, 100)
  })
}

function emitUpdate() {
  emit('update:nodes', [...nodes.value])
  emit('update:edges', [...edges.value])
}

function fitView() {
  if (typeof vueFlowFitView === 'function') {
    vueFlowFitView({ padding: 0.2 })
  }
}

defineExpose({ addNode, getFlowData, loadFlowData, deleteSelectedNode, fitView })
</script>

<style scoped>
.flow-canvas {
  width: 100%; height: 100%; min-height: 600px;
  background: #f8fafc;
  outline: none; overflow: hidden;
  position: relative;
}

/* Context menu */
.context-menu {
  position: absolute; z-index: 100;
  background: #fff; border-radius: 10px;
  box-shadow: 0 4px 24px rgba(15,23,42,0.12), 0 1px 3px rgba(15,23,42,0.08);
  padding: 6px; min-width: 160px;
  border: 1px solid #e8ecf2;
}
.ctx-title { font-size: 11px; color: #94a3b8; padding: 6px 10px 4px; font-weight: 500; }
.ctx-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 6px; cursor: pointer;
  font-size: 13px; color: #334155;
  transition: background 0.1s;
}
.ctx-item:hover { background: #f1f5f9; }
.ctx-dot { width: 8px; height: 8px; border-radius: 50%; }
.ctx-dot.start { background: #059669; }
.ctx-dot.approve { background: #3b82f6; }
.ctx-dot.condition { background: #f59e0b; }
.ctx-dot.end { background: #ef4444; }
</style>
