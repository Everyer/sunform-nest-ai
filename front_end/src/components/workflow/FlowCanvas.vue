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
    <n-modal v-model:show="showEdgeModal" title="连线配置" preset="card" style="width: 480px">
      <n-form label-placement="top" size="small">
        <n-form-item label="连线标签">
          <n-input v-model:value="editingEdge.label" placeholder="如：同意、驳回、>3天" />
        </n-form-item>
        <n-form-item v-if="editingEdge.isCondition" label="条件表达式">
          <n-input v-model:value="editingEdge.conditionExpr" placeholder="如：days > 3" />
        </n-form-item>
        <n-alert v-if="editingEdge.isCondition" type="info" size="small">
          当一个节点有多条出线时，需为每条线设置条件来决定走哪条分支
        </n-alert>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button size="small" type="error" quaternary @click="deleteEdge">删除连线</n-button>
          <n-button size="small" type="primary" @click="showEdgeModal = false">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, markRaw, nextTick, onMounted } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import {
  NModal, NButton, NInput, NSelect, NForm, NFormItem, NSpace, NAlert,
} from 'naive-ui'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import CustomNode from './CustomNode.vue'
import { getUserList } from '@/api/user'
import { getRoleList } from '@/api/role'

const props = defineProps({})

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
const editingEdge = ref({ id: '', label: '', conditionExpr: '', isCondition: false })

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
  editingEdge.value = {
    id: edge.id,
    label: edge.label || edge.data?.label || '',
    conditionExpr: edge.data?.conditionExpr || '',
    isCondition: edge.data?.isCondition || false,
  }
  showEdgeModal.value = true
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
      condition: e.data?.conditionExpr || null,
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
    data: { label: e.label || '', conditionExpr: e.condition || '', isCondition: !!e.condition },
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
