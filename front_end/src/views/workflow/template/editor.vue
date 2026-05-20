<template>
  <n-modal
    :show="visible"
    @update:show="v => !v && emit('close')"
    :mask-closable="false"
    style="width: calc(100vw - 40px); max-width: 1600px; height: calc(100vh - 40px);"
    preset="card"
    :title="null"
    :header-style="{ display: 'none' }"
    :content-style="{ padding: 0, height: '100%', overflow: 'hidden' }"
    :style="{ '--n-padding': '0' }"
    segmented
  >
    <n-spin :show="loading" description="加载中..." style="height: 100%" content-style="height: 100%">
      <div class="flow-editor">
        <!-- Header -->
      <div class="editor-header">
        <div class="flex items-center gap-4">
          <div>
            <n-input
              v-model:value="formData.name"
              placeholder="流程名称"
              style="width: 240px; font-weight: 600; font-size: 16px"
              :bordered="false"
            />
            <span class="text-xs text-slate-400 ml-1">{{ formData.code || '未命名' }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <n-tag v-if="formData.status === 0" type="info" size="small">草稿</n-tag>
          <n-tag v-else-if="formData.status === 1" type="success" size="small">已发布</n-tag>
          <n-tag v-else type="default" size="small">已停用</n-tag>
          <span class="text-xs text-slate-400">v{{ formData.version || 1 }}</span>
          <n-button-group>
            <n-button size="small" @click="handleSave" :loading="saving">保存草稿</n-button>
            <n-button v-if="formData.status !== 1" size="small" type="primary" @click="handlePublish" :loading="publishing">发布</n-button>
            <n-button v-if="formData.status === 1" size="small" type="warning" @click="handleDeactivate">停用</n-button>
          </n-button-group>
          <n-button text class="ml-2" @click="emit('close')">
            <template #icon><n-icon size="20"><CloseOutline /></n-icon></template>
          </n-button>
        </div>
      </div>

      <!-- Steps -->
      <div class="editor-steps">
        <div class="step-item" :class="{ active: step === 1 }" @click="step = 1">
          <span class="step-num">1</span>
          <span class="step-label">字段定义</span>
        </div>
        <div class="step-line" />
        <div class="step-item" :class="{ active: step === 2 }" @click="step = 2">
          <span class="step-num">2</span>
          <span class="step-label">流程图</span>
        </div>
        <div class="step-line" />
        <div class="step-item" :class="{ active: step === 3 }" @click="step = 3">
          <span class="step-num">3</span>
          <span class="step-label">页面设计</span>
        </div>
      </div>

      <div class="editor-steps-body">
        <!-- Step 1: Fields -->
        <div class="step-panel" :class="{ active: step === 1 }">
          <div class="step1-left">
            <div class="p-3 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-slate-700">基础信息</span>
                <n-button size="tiny" text @click="showBasic = !showBasic">
                  <n-icon size="16"><ChevronDownOutline v-if="showBasic" /><ChevronForwardOutline v-else /></n-icon>
                </n-button>
              </div>
              <div v-show="showBasic">
                <div class="mb-3"><label class="text-xs text-slate-500">流程名称</label><n-input v-model:value="formData.name" size="small" placeholder="请假流程" /></div>
                <div class="mb-3"><label class="text-xs text-slate-500">流程编码</label><n-input v-model:value="formData.code" size="small" placeholder="leave_approval" /></div>
                <div class="mb-3"><label class="text-xs text-slate-500">分类</label><n-select v-model:value="formData.category" size="small" :options="categoryOptions" placeholder="选择分类" clearable /></div>
                <div class="mb-3"><label class="text-xs text-slate-500">流程说明</label><n-input v-model:value="formData.description" size="small" type="textarea" :rows="2" placeholder="流程说明..." /></div>
              </div>
            </div>
          </div>
          <div class="step1-right">
            <div class="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100 sticky top-0">
              <span class="text-sm font-semibold text-slate-700">表单字段（{{ formData.fields.length }}）</span>
              <n-button size="tiny" type="primary" @click="addField">添加字段</n-button>
            </div>
            <div class="fields-grid p-4">
              <div v-for="(field, idx) in formData.fields" :key="idx" class="field-card">
                <div class="field-header">
                  <span class="field-index">{{ idx + 1 }}</span>
                  <span class="field-key-label">{{ field.label || field.key || '新字段' }}</span>
                  <n-tag size="tiny">{{ fieldTypeLabel(field.type) }}</n-tag>
                  <n-switch v-model:value="field.required" size="small"><template #checked>必填</template><template #unchecked>选填</template></n-switch>
                  <n-button size="tiny" text @click="removeField(idx)"><template #icon><n-icon size="14"><CloseOutline /></n-icon></template></n-button>
                </div>
                <div class="field-body">
                  <div class="field-row">
                    <div class="field-col"><label class="field-label">标识</label><n-input v-model:value="field.key" size="small" placeholder="leaveType" /></div>
                    <div class="field-col"><label class="field-label">名称</label><n-input v-model:value="field.label" size="small" placeholder="请假类型" /></div>
                  </div>
                  <div class="field-row">
                    <div class="field-col"><label class="field-label">类型</label><n-select v-model:value="field.type" :options="fieldTypeOptions" size="small" /></div>
                    <div class="field-col"><label class="field-label">占位符</label><n-input v-model:value="field.placeholder" size="small" placeholder="请选择" /></div>
                    <div class="field-col"><label class="field-label">默认值</label><n-input v-model:value="field.defaultValue" size="small" placeholder="可选" /></div>
                  </div>
                  <div v-if="field.type === 'number'" class="field-row">
                    <div class="field-col"><label class="field-label">最小值</label><n-input-number v-model:value="field.min" size="small" style="width:100%" :min="0" /></div>
                    <div class="field-col"><label class="field-label">最大值</label><n-input-number v-model:value="field.max" size="small" style="width:100%" :min="0" /></div>
                  </div>
                  <div v-if="field.type === 'textarea'" class="field-row">
                    <div class="field-col"><label class="field-label">行数</label><n-input-number v-model:value="field.rows" size="small" style="width:100%" :min="2" :max="20" /></div>
                  </div>
                  <div v-if="field.type === 'select' || field.type === 'radio' || field.type === 'checkbox'" class="field-options">
                    <div class="flex items-center justify-between mb-2"><label class="field-label">选项</label><n-button size="tiny" secondary @click="addOption(idx)">添加</n-button></div>
                    <div class="space-y-2">
                      <div v-for="(opt, oi) in field.options" :key="oi" class="flex items-center gap-3">
                        <n-input v-model:value="opt.label" size="small" placeholder="显示名" style="flex:1" />
                        <n-input v-model:value="opt.value" size="small" placeholder="值" style="flex:1" />
                        <n-button size="tiny" text @click="removeOption(idx, oi)"><template #icon><n-icon size="14"><CloseOutline /></n-icon></template></n-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="formData.fields.length === 0" class="col-span-2 text-center text-slate-400 text-xs py-8">暂无字段，点击上方「添加字段」开始定义</div>
            </div>
          </div>
        </div>

        <!-- Step 2: Flow design -->
        <div class="step-panel" :class="{ active: step === 2 }">
          <div class="editor-toolbar card">
            <div class="toolbar-title">节点组件</div>
            <div class="toolbar-items">
              <div class="toolbar-item" draggable="true" @dragstart="e => e.dataTransfer.setData('node-type', 'start')" @click="canvasRef?.addNode('start')"><div class="toolbar-dot start" /><span>发起节点</span></div>
              <div class="toolbar-item" draggable="true" @dragstart="e => e.dataTransfer.setData('node-type', 'approve')" @click="canvasRef?.addNode('approve')"><div class="toolbar-dot approve" /><span>审批节点</span></div>
              <div class="toolbar-item" draggable="true" @dragstart="e => e.dataTransfer.setData('node-type', 'condition')" @click="canvasRef?.addNode('condition')"><div class="toolbar-dot condition" /><span>条件分支</span></div>
              <div class="toolbar-item" draggable="true" @dragstart="e => e.dataTransfer.setData('node-type', 'end')" @click="canvasRef?.addNode('end')"><div class="toolbar-dot end" /><span>结束节点</span></div>
            </div>
          </div>
          <div class="editor-canvas">
            <FlowCanvas ref="canvasRef" @node-select="onNodeSelect" />
          </div>
          <div v-if="selectedNode" class="editor-sidebar">
            <div class="sidebar-section">
              <div class="sidebar-title">节点配置</div>
              <n-form label-placement="top" size="small">
                <n-form-item label="节点名称"><n-input v-model:value="selectedNode.data.name" /></n-form-item>
                <n-form-item v-if="selectedNode.data.nodeType === 'approve'" label="审批人类型"><n-select v-model:value="selectedNode.data.assigneeType" :options="assigneeTypeOptions" /></n-form-item>
                <n-form-item v-if="selectedNode.data.nodeType === 'approve' && selectedNode.data.assigneeType === 'specified_user'" label="选择审批人"><n-select v-model:value="selectedNode.data.assigneeValue" :options="userOptions" filterable clearable placeholder="搜索用户..." /></n-form-item>
                <n-form-item v-if="selectedNode.data.nodeType === 'approve' && selectedNode.data.assigneeType === 'specified_role'" label="选择角色"><n-select v-model:value="selectedNode.data.assigneeValue" :options="roleOptions" placeholder="选择角色" /></n-form-item>
                <n-form-item v-if="selectedNode.data.nodeType === 'approve'" label="审批策略"><n-select v-model:value="selectedNode.data.signType" :options="signTypeOptions" /></n-form-item>
                <n-form-item v-if="selectedNode.data.nodeType === 'approve'" label="驳回策略"><n-select v-model:value="selectedNode.data.rejectStrategy" :options="rejectStrategyOptions" /></n-form-item>
              </n-form>
              <n-button size="small" type="error" block secondary class="mt-3" @click="deleteNode"><template #icon><n-icon size="14"><TrashOutline /></n-icon></template>删除此节点</n-button>
            </div>
            <n-divider />
            <div class="sidebar-section">
              <div class="sidebar-title">字段权限</div>
              <div v-if="formData.fields.length === 0" class="text-slate-400 text-xs">暂无字段，请先到第一步定义字段</div>
              <div v-else class="perm-table">
                <div class="perm-header"><span class="perm-col-field">字段</span><span class="perm-col">可编辑</span><span class="perm-col">只读</span><span class="perm-col">隐藏</span></div>
                <div v-for="field in formData.fields" :key="field.key" class="perm-row" :class="{ 'perm-row-active': getFieldPerm(field.key) === 'editable' }">
                  <span class="perm-col-field">{{ field.label || field.key }}</span>
                  <span class="perm-col" @click="setFieldPerm(field.key, 'editable')"><span class="perm-radio" :class="{ checked: getFieldPerm(field.key) === 'editable' }" /></span>
                  <span class="perm-col" @click="setFieldPerm(field.key, 'readonly')"><span class="perm-radio" :class="{ checked: getFieldPerm(field.key) === 'readonly' }" /></span>
                  <span class="perm-col" @click="setFieldPerm(field.key, 'hidden')"><span class="perm-radio" :class="{ checked: getFieldPerm(field.key) === 'hidden' }" /></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Page design -->
        <div class="step-panel step-panel-col" :class="{ active: step === 3 }">
          <div class="step3-toolbar">
            <span class="text-sm font-semibold text-slate-700">页面设计</span>
            <n-button size="tiny" secondary @click="generateFormFromFields"><template #icon><n-icon size="14"><CodeOutline /></n-icon></template>从字段生成</n-button>
          </div>
          <div class="flex-1 min-h-0">
            <PageDesigner :form-fields="formData.fields" :flow-nodes="flowNodes" :field-permissions="fieldPermissions" :active-node-id="selectedNode?.id" v-model:template-code="designedTemplate" />
          </div>
        </div>
      </div>
    </div>
    </n-spin>
  </n-modal>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { NButton, NButtonGroup, NIcon, NInput, NTag, NDivider, NSelect, NForm, NFormItem, NSwitch, NInputNumber, NModal, NSpin } from 'naive-ui'
import { CloseOutline, TrashOutline, ChevronDownOutline, ChevronForwardOutline, CodeOutline } from '@vicons/ionicons5'
import FlowCanvas from '@/components/workflow/FlowCanvas.vue'
import PageDesigner from '@/components/workflow/PageDesigner.vue'
import { getTemplateDetail, createTemplate, updateTemplate, publishTemplate, deactivateTemplate } from '@/api/workflow/template'
import { getUserList } from '@/api/user'
import { getRoleList } from '@/api/role'

const props = defineProps({
  visible: { type: Boolean, default: false },
  templateId: { type: [String, Number], default: null },
})
const emit = defineEmits(['close', 'saved'])

const canvasRef = ref(null)
const editingId = ref(null)
const step = ref(1)
const showBasic = ref(true)
const saving = ref(false)
const publishing = ref(false)
const loading = ref(false)
const selectedNode = ref(null)
const designedTemplate = ref('')
const savedNodes = ref([])
const savedEdges = ref([])
const committedFieldsKey = ref('')
/* 字段快照，用于检测 step1 字段是否有变动 */
const flowNodes = computed(() => {
  // Always prioritize the current state in the canvas if we are in step 2 or 3
  if (canvasRef.value && (step.value === 2 || step.value === 3)) {
    const data = canvasRef.value.getFlowData()
    if (data.nodes.length > 0) {
      return data.nodes.map(n => ({ id: n.id, name: n.name, type: n.type }))
    }
  }
  // Fallback to saved data
  return (savedNodes.value || []).map(n => ({ id: n.id, name: n.name, type: n.type }))
})
const formData = reactive({
  name: '',
  code: '',
  category: null,
  description: '',
  status: 0,
  version: 1,
  fields: [],
  config: {},
})

const categoryOptions = [
  { label: '行政', value: '行政' }, { label: '财务', value: '财务' },
  { label: '人事', value: '人事' }, { label: '其他', value: '其他' },
]

const fieldTypeOptions = [
  { label: '单行文本', value: 'input' },
  { label: '多行文本', value: 'textarea' },
  { label: '数字', value: 'number' },
  { label: '下拉选择', value: 'select' },
  { label: '日期', value: 'date' },
  { label: '日期时间', value: 'datetime' },
  { label: '单选框', value: 'radio' },
  { label: '多选框', value: 'checkbox' },
  { label: '开关', value: 'switch' },
]

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

function fieldTypeLabel(type) {
  const m = { input: '文本', textarea: '多行', number: '数字', select: '下拉', date: '日期', datetime: '日期时间', radio: '单选', checkbox: '多选', switch: '开关' }
  return m[type] || type
}

function fieldsKey() {
  return JSON.stringify(formData.fields.map(f => `${f.key}:${f.type}:${f.label}:${f.required}`))
}

function hasFieldsChanged() {
  return committedFieldsKey.value !== fieldsKey()
}

function commitFields() {
  committedFieldsKey.value = fieldsKey()
}

function addField() {
  const key = 'field_' + Date.now()
  formData.fields.push({ key, label: '', type: 'input', required: false, placeholder: '', defaultValue: null, options: [], min: null, max: null, rows: 4 })
}

function removeField(idx) {
  formData.fields.splice(idx, 1)
}

function addOption(fieldIdx) {
  formData.fields[fieldIdx]?.options?.push({ label: '', value: '' })
}

function removeOption(fieldIdx, optIdx) {
  const opts = formData.fields[fieldIdx]?.options
  if (opts) opts.splice(optIdx, 1)
}

function getFieldPerm(fieldKey) {
  const nodeId = selectedNode.value?.id
  if (!nodeId) return 'editable'
  return fieldPermissions[nodeId]?.[fieldKey] || 'editable'
}

function setFieldPerm(fieldKey, val) {
  const nodeId = selectedNode.value?.id
  if (!nodeId) return
  if (!fieldPermissions[nodeId]) fieldPermissions[nodeId] = {}
  fieldPermissions[nodeId][fieldKey] = val
}

const fieldPermissions = reactive({})

function onNodeSelect(node) { selectedNode.value = node }
function deleteNode() {
  if (selectedNode.value) {
    canvasRef.value?.deleteSelectedNode?.()
    selectedNode.value = null
  }
}

onMounted(async () => {
  try {
    const users = await getUserList()
    userOptions.value = (users || []).map(u => ({ label: `${u.username} (${u.staff?.staffName || u.realName || ''})`, value: u.username }))
  } catch (e) { /* noop */ }
  try {
    const roles = await getRoleList()
    roleOptions.value = (roles || []).map(r => ({ label: r.roleName, value: r.roleName }))
  } catch (e) { /* noop */   }
})
watch(step, (val, oldVal) => {
  if (oldVal === 2 && canvasRef.value) {
    const data = canvasRef.value.getFlowData()
    savedNodes.value = [...data.nodes]
    savedEdges.value = [...data.edges]
  }
  if (val === 2) {
    nextTick(() => {
      // If canvas is ready but empty, and we have saved data, load it
      if (canvasRef.value) {
        const currentData = canvasRef.value.getFlowData()
        if (currentData.nodes.length === 0 && savedNodes.value.length > 0) {
          canvasRef.value.loadFlowData(savedNodes.value, savedEdges.value)
        }
        setTimeout(() => {
          canvasRef.value?.fitView?.()
        }, 100)
      }
    })
  }
  if (val === 3 && hasFieldsChanged()) {
    // 字段有变动，自动从字段生成覆盖页面
    generateFormFromFields()
    commitFields()
  }
})

watch(() => props.visible, async (val) => {
  if (!val) { resetForm(); return }
  editingId.value = props.templateId
  if (props.templateId) await loadTemplate(props.templateId)
})

async function loadTemplate(id) {
  loading.value = true
  try {
    const detail = await getTemplateDetail(id)
    Object.assign(formData, {
      name: detail.name,
      code: detail.code,
      category: detail.category,
      description: detail.description,
      status: detail.status,
      version: detail.version,
      config: detail.config || {},
    })
    formData.fields = detail.config?.fields || []
    commitFields()

    designedTemplate.value = detail.config?.formTemplate || ''
    const nds = (detail.nodes || []).map(n => ({
      id: n.id, type: n.type, positionX: n.positionX || 0, positionY: n.positionY || 0,
      name: n.name,
      assigneeType: n.assigneeType, assigneeValue: n.assigneeValue, config: n.config,
    }))
    const eds = (detail.edges || []).map(e => ({
      id: e.id, sourceNodeId: e.sourceNodeId, targetNodeId: e.targetNodeId,
      label: e.label || '', condition: e.condition || null,
    }))
    savedNodes.value = nds
    savedEdges.value = eds
    console.log('[Editor] loadTemplate savedNodes:', nds.length, 'canvasRef:', !!canvasRef.value)
    if (canvasRef.value) {
      canvasRef.value.loadFlowData(nds, eds)
    }

    if (detail.nodePermissions) {
      detail.nodePermissions.forEach(p => {
        if (!fieldPermissions[p.nodeId]) fieldPermissions[p.nodeId] = {}
        fieldPermissions[p.nodeId][p.fieldKey] = p.permission
      })
    }
  } catch (e) {
    console.error('加载模板失败', e)
    window.$message?.error('加载模板失败')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(formData, { name: '', code: '', category: null, description: '', status: 0, version: 1, config: {}, fields: [] })
  Object.keys(fieldPermissions).forEach(k => delete fieldPermissions[k])
  selectedNode.value = null
  editingId.value = null
  designedTemplate.value = ''
  step.value = 1
  savedNodes.value = []
  savedEdges.value = []
}

function buildPayload() {
  let nodes = []
  let edges = []

  // If canvas is available and has data, use it.
  // Otherwise use saved data (which is updated when leaving step 2).
  if (canvasRef.value) {
    const flowData = canvasRef.value.getFlowData()
    if (flowData.nodes.length > 0) {
      nodes = flowData.nodes
      edges = flowData.edges
    } else {
      nodes = savedNodes.value
      edges = savedEdges.value
    }
  } else {
    nodes = savedNodes.value
    edges = savedEdges.value
  }

  const payloadNodes = nodes.map(n => ({
    id: n.id, name: n.name || n.data?.name, type: n.type || n.data?.nodeType,
    assigneeType: n.assigneeType || n.data?.assigneeType, 
    assigneeValue: n.assigneeValue || n.data?.assigneeValue,
    positionX: n.positionX ?? n.position?.x, positionY: n.positionY ?? n.position?.y,
    config: n.config || (n.data ? { signType: n.data.signType, rejectStrategy: n.data.rejectStrategy } : undefined),
  }))
  const payloadEdges = edges.map(e => ({
    id: e.id, 
    sourceNodeId: e.sourceNodeId || e.source, 
    targetNodeId: e.targetNodeId || e.target,
    label: e.label || e.data?.label || '', 
    condition: e.condition || e.data?.conditionExpr || null,
  }))

  const nodePermissions = []
  for (const nId of Object.keys(fieldPermissions)) {
    for (const [fieldKey, permission] of Object.entries(fieldPermissions[nId])) {
      nodePermissions.push({ nodeId: nId, fieldKey, permission })
    }
  }

  return {
    name: formData.name || '未命名流程',
    code: formData.code || `draft_${Date.now()}`,
    category: formData.category,
    formDefId: null,
    description: formData.description,
    status: formData.status,
    version: formData.version,
    config: {
      ...formData.config,
      fields: formData.fields,
      formTemplate: designedTemplate.value,
    },
    nodes: payloadNodes,
    edges: payloadEdges,
    nodePermissions,
  }
}

async function handleSave() {
  saving.value = true
  try {
    const payload = buildPayload()
    if (editingId.value) {
      await updateTemplate({ id: editingId.value, ...payload })
    } else {
      const res = await createTemplate(payload)
      editingId.value = res && (res.id || res.templateId)
    }
    commitFields()
    window.$message?.success('保存成功')
    emit('saved')
    return true
  } catch (e) {
    window.$message?.error(e?.response?.data?.message || e?.message || '保存失败')
    return false
  } finally {
    saving.value = false
  }
}

async function handlePublish() {
  if (!editingId.value) { window.$message?.error('发布失败：模板ID为空'); return }
  publishing.value = true
  try {
    await updateTemplate({ id: editingId.value, ...buildPayload() })
    await publishTemplate(editingId.value)
    formData.status = 1
    window.$message?.success('发布成功')
    emit('saved')
  } catch (e) {
    window.$message?.error(e?.response?.data?.message || e?.message || '发布失败')
  } finally {
    publishing.value = false
  }
}

async function handleDeactivate() {
  try {
    await deactivateTemplate(editingId.value)
    formData.status = 2
    emit('saved')
    window.$message?.success('已停用')
  } catch (e) { window.$message?.error('操作失败') }
}

function generateFormFromFields() {
  const fields = formData.fields
  if (!fields || fields.length === 0) {
    window.$message?.warning('请先在第一步定义字段')
    return
  }

  const fieldComponents = fields.map(f => genFieldHtml(f)).join('\n\n')

  const dataProps = fields.map(f => `        ${f.key}: ${genDefaultValue(f)}`).join(',\n')
  const rules = fields.filter(f => f.required).map(f => `        ${f.key}: [{ required: true, message: '${f.placeholder || '请填写' + (f.label || f.key)}', trigger: '${f.type === 'select' || f.type === 'date' || f.type === 'datetime' || f.type === 'radio' ? 'change' : 'blur'}' }]`).join(',\n')
  const optionsData = fields.filter(f => f.type === 'select' || f.type === 'radio' || f.type === 'checkbox').map(f => {
    const opts = (f.options || []).map(o => `        { label: '${o.label}', value: '${o.value}' }`)
    return `      ${f.key}Options: [\n${opts.join(',\n')}\n      ]`
  }).join(',\n')

  const scriptClose = '<' + '/script>'
  designedTemplate.value = `<template>
  <div class="p-6">
    <n-card title="${formData.name || '表单'}" class="shadow-sm rounded-lg">
      <n-form ref="formRef" :model="formData" :rules="formRules" label-placement="left" label-width="auto">
${fieldComponents}
      </n-form>
    </n-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formData: {
${dataProps}
      },
      formRules: {
${rules}
      },
${optionsData}
    }
  },
  methods: {},
  computed: {},
  watch: {},
}
${scriptClose}`
}

function genFieldHtml(f) {
  const common = `label="${f.label || f.key}" path="${f.key}"`
  const ph = f.placeholder ? ` placeholder="${f.placeholder}"` : ''
  const readonlyBind = `:disabled="$workflow?.nodePermissions?.${f.key} === 'readonly'"`
  const hideBind = `v-if="$workflow?.nodePermissions?.${f.key} !== 'hidden'"`

  let input = ''
  switch (f.type) {
    case 'input':
      input = `<n-input v-model:value="formData.${f.key}"${ph} ${readonlyBind} />`
      break
    case 'textarea':
      input = `<n-input v-model:value="formData.${f.key}" type="textarea" :rows="${f.rows || 4}"${ph} ${readonlyBind} />`
      break
    case 'number':
      input = `<n-input-number v-model:value="formData.${f.key}"${f.min ? ' :min="' + f.min + '"' : ''}${f.max ? ' :max="' + f.max + '"' : ''} style="width:100%"${ph} ${readonlyBind} />`
      break
    case 'select':
      input = `<n-select v-model:value="formData.${f.key}" :options="${f.key}Options"${ph} ${readonlyBind} />`
      break
    case 'radio':
      input = `<n-radio-group v-model:value="formData.${f.key}" ${readonlyBind}>\n              <n-space>\n                <n-radio v-for="o in ${f.key}Options" :key="o.value" :value="o.value" :disabled="$workflow?.nodePermissions?.${f.key} === 'readonly'">{{ o.label }}</n-radio>\n              </n-space>\n            </n-radio-group>`
      break
    case 'checkbox':
      input = `<n-checkbox-group v-model:value="formData.${f.key}" ${readonlyBind}>\n              <n-space>\n                <n-checkbox v-for="o in ${f.key}Options" :key="o.value" :value="o.value" :disabled="$workflow?.nodePermissions?.${f.key} === 'readonly'">{{ o.label }}</n-checkbox>\n              </n-space>\n            </n-checkbox-group>`
      break
    case 'date':
      input = `<n-date-picker v-model:value="formData.${f.key}" type="date" style="width:100%"${ph} ${readonlyBind} />`
      break
    case 'datetime':
      input = `<n-date-picker v-model:value="formData.${f.key}" type="datetime" style="width:100%"${ph} ${readonlyBind} />`
      break
    case 'switch':
      input = `<n-switch v-model:value="formData.${f.key}" ${readonlyBind} />`
      break
    default:
      input = `<n-input v-model:value="formData.${f.key}"${ph} ${readonlyBind} />`
  }

  return `        <n-form-item ${common} ${hideBind}>\n          ${input}\n        </n-form-item>`
}

function genDefaultValue(f) {
  if (f.defaultValue !== null && f.defaultValue !== undefined) {
    if (typeof f.defaultValue === 'string') return `'${f.defaultValue}'`
    return f.defaultValue
  }
  if (f.type === 'number') return 'null'
  if (f.type === 'switch') return 'false'
  if (f.type === 'checkbox') return '[]'
  if (f.type === 'date' || f.type === 'datetime') return 'null'
  return "''"
}
</script>

<style scoped>
:deep(.n-spin-content) { height: 100%; display: flex; flex-direction: column; }
.flow-editor { display: flex; flex-direction: column; height: 100%; flex: 1; }

.editor-steps {
  display: flex; align-items: center; gap: 0;
  padding: 8px 24px; background: #f8fafc;
  border-bottom: 1px solid #e8ecf2; flex-shrink: 0;
}
.step-item { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: background 0.15s; user-select: none; }
.step-item:hover { background: #f1f5f9; }
.step-num {
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  background: #e2e8f0; color: #94a3b8;
}
.step-item.active .step-num { background: #3b82f6; color: #fff; }
.step-label { font-size: 12px; font-weight: 500; color: #64748b; }
.step-item.active .step-label { color: #1e293b; font-weight: 600; }
.step-line { width: 32px; height: 1px; background: #d1d5db; margin: 0 8px; }

.editor-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; background: #fff; border-bottom: 1px solid #e8ecf2; flex-shrink: 0;
}

.editor-body { display: flex; flex: 1; gap: 0; overflow: hidden; min-height: 0; }
.editor-steps-body { position: relative; flex: 1; overflow: hidden; }
.step-panel {
  position: absolute; inset: 0; display: flex; gap: 0; overflow: hidden;
  visibility: hidden; z-index: 0; background: #f8fafc;
}
.step-panel.active { visibility: visible; z-index: 1; }
.step-panel-col { flex-direction: column; }
.step3-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; background: #fff; border-bottom: 1px solid #e8ecf2; flex-shrink: 0;
}

.editor-toolbar {
  width: 200px; flex-shrink: 0; overflow-y: auto; padding: 12px;
  background: #fff; border-right: 1px solid #e8ecf2;
}
.toolbar-title { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
.toolbar-items { display: flex; flex-direction: column; gap: 4px; }
.toolbar-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 10px;
  border-radius: 6px; cursor: pointer; transition: all 0.15s;
  font-size: 12px; color: #475569;
  border: 1px solid #f1f5f9; background: #fafbfc;
}
.toolbar-item:hover { background: #f1f5f9; border-color: #e2e8f0; }
.toolbar-dot { width: 8px; height: 8px; border-radius: 50%; }
.toolbar-dot.start { background: #059669; }
.toolbar-dot.approve { background: #3b82f6; }
.toolbar-dot.condition { background: #f59e0b; }
.toolbar-dot.end { background: #ef4444; }

.editor-canvas { flex: 1; min-width: 0; background: #f8fafc; }

.editor-sidebar {
  width: 320px; flex-shrink: 0; overflow-y: auto;
  border-left: 1px solid #e8ecf2; padding: 16px; background: #fff;
}
.step1-left {
  width: 260px; flex-shrink: 0; overflow-y: auto; background: #fff; border-right: 1px solid #e8ecf2;
}
.step1-right {
  flex: 1; overflow-y: auto; background: #f8fafc;
}
.sidebar-title { font-size: 14px; font-weight: 600; color: #334155; }
.sidebar-section { margin-bottom: 12px; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; cursor: pointer; }

.editor-sidebar :deep(.n-form-item) { margin-bottom: 14px; }

.section-header .sidebar-title { margin-bottom: 0; }

.fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.field-card { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #fafbfc; }

.field-header {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 10px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0;
}
.field-index {
  width: 20px; height: 20px; border-radius: 50%; background: #3b82f6; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
}
.field-key-label { flex: 1; font-size: 12px; font-weight: 500; color: #1e293b; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.field-body { padding: 10px; }
.field-row { display: flex; gap: 10px; margin-bottom: 10px; }
.field-row:last-child { margin-bottom: 0; }
.field-col { flex: 1; min-width: 0; }
.field-label { display: block; font-size: 10px; color: #94a3b8; margin-bottom: 4px; }
.field-options { margin-top: 10px; padding-top: 10px; border-top: 1px solid #f1f5f9; }

.perm-table { border: 1px solid #e8ecf2; border-radius: 8px; overflow: hidden; font-size: 12px; }
.perm-header { display: flex; background: #f8f9fc; border-bottom: 1px solid #e8ecf2; padding: 8px 10px; font-weight: 600; color: #64748b; }
.perm-row { display: flex; align-items: center; padding: 8px 10px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.1s; }
.perm-row:last-child { border-bottom: none; }
.perm-row:hover { background: #f8fafc; }
.perm-row-active { background: #f0f9ff; }
.perm-col-field { flex: 1; min-width: 0; color: #334155; }
.perm-col { width: 56px; text-align: center; color: #94a3b8; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.perm-radio { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #d1d5db; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; }
.perm-radio.checked { border-color: #3b82f6; }
.perm-radio.checked::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; }
</style>
