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
            <div class="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
              <span class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                表单字段（{{ formData.fields.length }}）
                <n-button
                  v-if="formData.fields.length > 0"
                  size="tiny"
                  type="warning"
                  secondary
                  :loading="translating"
                  @click="batchTranslateAllKeysWithAi"
                  class="ml-2 hover:scale-[1.02] transition-transform duration-200"
                >
                  <template #icon>
                    <span class="text-xs">⚡</span>
                  </template>
                  AI 一键命名所有标识
                </n-button>
              </span>
              <n-button size="tiny" type="primary" @click="addField">添加字段</n-button>
            </div>
            <div class="fields-grid p-4">
              <div 
                v-for="(field, idx) in formData.fields" 
                :key="idx" 
                class="field-card"
                draggable="true"
                @dragstart="handleDragStart($event, idx)"
                @dragover="handleDragOver($event, idx)"
                @dragleave="handleDragLeave($event, idx)"
                @drop="handleDrop($event, idx)"
                @dragend="handleDragEnd"
                :class="{ 'drag-active': dragIndex === idx, 'drag-over': dragOverIndex === idx && dragIndex !== idx }"
              >
                <div class="field-header">
                  <div class="drag-handle mr-1 cursor-move">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M8.5 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7-12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                    </svg>
                  </div>
                  <span class="field-index">{{ idx + 1 }}</span>
                  <span class="field-key-label">{{ field.label || field.key || '新字段' }}</span>
                  <n-tag size="tiny">{{ fieldTypeLabel(field.type) }}</n-tag>
                  <n-switch v-model:value="field.required" size="small"><template #checked>必填</template><template #unchecked>选填</template></n-switch>
                  <n-button size="tiny" text @click="removeField(idx)"><template #icon><n-icon size="14"><CloseOutline /></n-icon></template></n-button>
                </div>
                <div class="field-body">
                  <div class="field-row">
                    <div class="field-col">
                      <label class="field-label flex items-center justify-between">
                        <span>标识</span>
                        <n-button size="tiny" type="primary" quaternary class="text-[10px] h-4 py-0 px-1 font-normal" style="line-height: 1" @click="translateKeyWithAi(field)">
                          ⚡ AI 命名
                        </n-button>
                      </label>
                      <n-input v-model:value="field.key" size="small" placeholder="leaveType" />
                    </div>
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
                        <n-input v-model:value="opt.label" @input="opt.value = opt.label" size="small" placeholder="显示名" style="flex:1" />
                        <n-input v-model:value="opt.value" size="small" placeholder="值" style="flex:1" />
                        <n-button size="tiny" text @click="removeOption(idx, oi)"><template #icon><n-icon size="14"><CloseOutline /></n-icon></template></n-button>
                      </div>
                    </div>
                  </div>
                  <div v-if="field.type === 'subtable'" class="field-options">
                    <div class="flex items-center justify-between mb-2">
                      <label class="field-label font-bold text-slate-700">明细表格列（{{ field.columns?.length || 0 }}）</label>
                      <n-button size="tiny" type="primary" secondary @click="addSubColumn(idx)">添加列</n-button>
                    </div>
                    <div class="space-y-3 p-2 bg-slate-50 border border-slate-200 rounded">
                      <div v-for="(col, ci) in field.columns" :key="ci" class="flex items-center gap-2.5 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm w-full">
                        <div class="flex items-center gap-1 flex-[1.4] min-w-[170px]">
                          <n-input v-model:value="col.key" size="tiny" placeholder="列标识" style="flex: 1" />
                          <n-button size="tiny" type="primary" quaternary class="text-[10px] h-6 px-1.5 font-normal hover:bg-blue-50 transition-colors flex-shrink-0" @click="translateColKeyWithAi(col)">⚡ AI</n-button>
                        </div>
                        <n-input v-model:value="col.label" size="tiny" placeholder="列名称(label)" class="flex-1 min-w-[100px]" />
                        <n-select v-model:value="col.type" :options="subColumnTypeOptions" size="tiny" placeholder="类型" class="w-[110px] flex-shrink-0" />
                        <div v-if="col.type === 'select'" class="flex-[1.5] min-w-[120px]">
                          <n-input v-model:value="col.optionsText" size="tiny" placeholder="选项(用/隔开)" />
                        </div>
                        <n-button size="tiny" type="error" text @click="removeSubColumn(idx, ci)" class="flex-shrink-0">
                          <template #icon><n-icon size="14"><CloseOutline /></n-icon></template>
                        </n-button>
                      </div>
                      <div v-if="!field.columns || field.columns.length === 0" class="text-center text-slate-400 text-[10px] py-2">
                        暂无列定义，点击上方「添加列」进行设置
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
            <FlowCanvas ref="canvasRef" :fields="formData.fields" @node-select="onNodeSelect" />
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
              <div class="sidebar-title flex items-center justify-between mb-2">
                <span>字段权限</span>
                <div v-if="formData.fields.length > 0" class="flex items-center gap-1">
                  <n-button size="tiny" quaternary type="primary" class="text-[10px] px-1 h-5" @click="batchSetAllPerms('editable')">全编辑</n-button>
                  <n-button size="tiny" quaternary type="warning" class="text-[10px] px-1 h-5" @click="batchSetAllPerms('readonly')">全只读</n-button>
                  <n-button size="tiny" quaternary type="default" class="text-[10px] px-1 h-5" @click="batchSetAllPerms('hidden')">全隐藏</n-button>
                </div>
              </div>
              <div v-if="formData.fields.length === 0" class="text-slate-400 text-xs">暂无字段，请先到第一步定义字段</div>
              <div v-else class="perm-table">
                <div class="perm-header">
                  <span class="perm-col-field">字段</span>
                  <span class="perm-col cursor-pointer hover:text-blue-500 transition-colors" @click="batchSetAllPerms('editable')">可编辑</span>
                  <span class="perm-col cursor-pointer hover:text-amber-500 transition-colors" @click="batchSetAllPerms('readonly')">只读</span>
                  <span class="perm-col cursor-pointer hover:text-slate-500 transition-colors" @click="batchSetAllPerms('hidden')">隐藏</span>
                </div>
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
import request from '@/api/index'
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
const translating = ref(false)
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
  { label: '人员选择', value: 'user' },
  { label: '附件上传', value: 'upload' },
  { label: '明细子表 (SubTable)', value: 'subtable' },
]

const subColumnTypeOptions = [
  { label: '单行文本', value: 'input' },
  { label: '多行文本', value: 'textarea' },
  { label: '数字', value: 'number' },
  { label: '下拉选择', value: 'select' },
  { label: '日期', value: 'date' },
  { label: '日期时间', value: 'datetime' },
  { label: '单选框', value: 'radio' },
  { label: '多选框', value: 'checkbox' },
  { label: '开关', value: 'switch' },
  { label: '人员选择', value: 'user' },
  { label: '附件上传', value: 'upload' },
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

// Generate 4-character short unique ID for keys to avoid extremely long field and col IDs
function generateShortId() {
  return Math.random().toString(36).substring(2, 6)
}

// Drag & drop sort states & handlers
const dragIndex = ref(null)
const dragOverIndex = ref(null)

function handleDragStart(e, idx) {
  dragIndex.value = idx
  e.dataTransfer.effectAllowed = 'move'
}

function handleDragOver(e, idx) {
  e.preventDefault()
  if (dragIndex.value !== null && dragIndex.value !== idx) {
    dragOverIndex.value = idx
  }
}

function handleDragLeave(e, idx) {
  if (dragOverIndex.value === idx) {
    dragOverIndex.value = null
  }
}

function handleDrop(e, idx) {
  e.preventDefault()
  if (dragIndex.value === null || dragIndex.value === idx) {
    dragOverIndex.value = null
    return
  }
  const list = [...formData.fields]
  const draggedItem = list[dragIndex.value]
  list.splice(dragIndex.value, 1)
  list.splice(idx, 0, draggedItem)
  formData.fields = list
  
  dragIndex.value = null
  dragOverIndex.value = null
}

function handleDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

async function translateKeyWithAi(field) {
  if (!field.label) {
    window.$message?.warning('请先输入“名称”（例如：报销单号）')
    return
  }
  const label = field.label
  const loadingMsg = window.$message?.loading('AI 正在语义识别命名...', { duration: 0 })
  try {
    const prompt = `你是一个代码变量命名助手。将中文的业务表单字段名称翻译并转换为规范的小驼峰（camelCase）英文变量标识。仅输出翻译后的英文变量标识，绝对不要有任何解释、标点、Markdown标记或多余的换行符。\n输入：请假天数\n输出：leaveDays\n输入：报销金额\n输出：reimbursementAmount\n输入：${label}\n输出：`
    
    const res = await request.post('/ai/completions', {
      ruleType: 'programming',
      messages: [
        { role: 'user', content: prompt }
      ]
    })
    
    loadingMsg?.destroy()
    if (res && res.choices && res.choices[0] && res.choices[0].message) {
      let key = res.choices[0].message.content.trim()
      key = key.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
      key = key.replace(/[^a-zA-Z0-9_]/g, '')
      if (key) {
        field.key = 'field_' + key
        window.$message?.success(`AI 语义命名成功: field_${key}`)
      } else {
        window.$message?.error('AI 返回格式有误，请重试')
      }
    } else {
      window.$message?.error('AI 服务无响应，请重试')
    }
  } catch (e) {
    loadingMsg?.destroy()
    console.error('AI Translate failed:', e)
    window.$message?.error('AI 命名服务暂时不可用')
  }
}

async function translateColKeyWithAi(col) {
  if (!col.label) {
    window.$message?.warning('请先输入“列名称”')
    return
  }
  const label = col.label
  const loadingMsg = window.$message?.loading('AI 正在语义识别命名...', { duration: 0 })
  try {
    const prompt = `你是一个代码变量命名助手。将中文的业务表单字段名称翻译并转换为规范的小驼峰（camelCase）英文变量标识。仅输出翻译后的英文变量标识，绝对不要有任何解释、标点、Markdown标记或多余的换行符。\n输入：费用类别\n输出：expenseType\n输入：报销金额\n输出：amount\n输入：${label}\n输出：`
    
    const res = await request.post('/ai/completions', {
      ruleType: 'programming',
      messages: [
        { role: 'user', content: prompt }
      ]
    })
    
    loadingMsg?.destroy()
    if (res && res.choices && res.choices[0] && res.choices[0].message) {
      let key = res.choices[0].message.content.trim()
      key = key.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
      key = key.replace(/[^a-zA-Z0-9_]/g, '')
      if (key) {
        col.key = 'col_' + key
        window.$message?.success(`AI 语义命名成功: col_${key}`)
      } else {
        window.$message?.error('AI 返回格式有误，请重试')
      }
    } else {
      window.$message?.error('AI 服务无响应，请重试')
    }
  } catch (e) {
    loadingMsg?.destroy()
    console.error('AI Translate failed:', e)
    window.$message?.error('AI 命名服务暂时不可用')
  }
}

async function batchTranslateAllKeysWithAi() {
  if (formData.fields.length === 0) {
    window.$message?.warning('请先添加表单字段')
    return
  }

  // 检查是否所有字段都有 Label
  const missingLabel = formData.fields.some(f => !f.label)
  if (missingLabel) {
    window.$message?.warning('请先为所有字段填写“名称”（包括子表的“列名称”），以便 AI 进行语义识别')
    return
  }

  // 检查明细表的列是否都填了 Label
  for (const f of formData.fields) {
    if (f.type === 'subtable') {
      if (!f.columns || f.columns.length === 0) continue
      if (f.columns.some(c => !c.label)) {
        window.$message?.warning('请先填写子表明细列的“列名称”')
        return
      }
    }
  }

  const loadingMsg = window.$message?.loading('AI 正在一键批量智能命名 Key...', { duration: 0 })
  translating.value = true

  try {
    // 构造发送给 AI 的数据
    const inputData = formData.fields.map(f => {
      const item = { type: 'field', label: f.label }
      if (f.type === 'subtable' && f.columns && f.columns.length > 0) {
        item.columns = f.columns.map(c => c.label)
      }
      return item
    })

    const prompt = `你是一个代码变量命名助手。将中文的表单字段名称翻译并转换为规范的小驼峰（camelCase）英文变量标识。
输入是一个包含字段名称（label）和特定属性的JSON数组。
你需要根据名称和上下文，生成合理、地道、简短的英文小驼峰标识。
对于主表字段，生成的键名请加上 'field_' 前缀（例如'field_leaveDays'）。
对于明细子表列，生成的键名请加上 'col_' 前缀（例如'col_amount'）。

输入数据：
${JSON.stringify(inputData, null, 2)}

请精确返回相同结构的JSON数组，并在其中补充生成好的键名 \`key\`，以及子表列的键名映射 \`columns\` 属性。
请不要返回任何非JSON格式的解释或聊天内容，直接返回JSON格式即可。

返回格式示例：
[
  { "type": "field", "label": "请假人", "key": "field_applicant" },
  { "type": "field", "label": "报销金额", "key": "field_reimbursementAmount" },
  { "type": "field", "label": "报销明细", "key": "field_reimbursementDetails", "columns": { "明细名称": "col_itemName", "明细金额": "col_amount" } }
]`

    const res = await request.post('/ai/completions', {
      ruleType: 'programming',
      messages: [
        { role: 'user', content: prompt }
      ]
    })

    loadingMsg?.destroy()

    if (res && res.choices && res.choices[0] && res.choices[0].message) {
      let content = res.choices[0].message.content.trim()
      // 移除 <think>...</think> 思考块
      content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
      // 清理 Markdown 代码块
      if (content.startsWith('```json')) {
        content = content.replace(/^```json/, '').replace(/```$/, '').trim()
      } else if (content.startsWith('```')) {
        content = content.replace(/^```/, '').replace(/```$/, '').trim()
      }

      const responseData = JSON.parse(content)
      if (Array.isArray(responseData)) {
        // 开始批量替换
        responseData.forEach((item, index) => {
          const field = formData.fields[index]
          if (field && field.label === item.label) {
            if (item.key) {
              let cleanKey = item.key.trim()
              cleanKey = cleanKey.replace(/^(field_|col_)/i, '')
              cleanKey = cleanKey.replace(/[^a-zA-Z0-9_]/g, '')
              if (cleanKey) {
                field.key = 'field_' + cleanKey
              }
            }
            if (field.type === 'subtable' && field.columns && item.columns) {
              field.columns.forEach(col => {
                const targetColKey = item.columns[col.label]
                if (targetColKey) {
                  let cleanColKey = targetColKey.trim()
                  cleanColKey = cleanColKey.replace(/^(field_|col_)/i, '')
                  cleanColKey = cleanColKey.replace(/[^a-zA-Z0-9_]/g, '')
                  if (cleanColKey) {
                    col.key = 'col_' + cleanColKey
                  }
                }
              })
            }
          }
        })
        window.$message?.success('AI 批量命名成功，已自动同步更新所有标识 Key！')
      } else {
        window.$message?.error('AI 返回数据格式解析失败，请重试')
      }
    } else {
      window.$message?.error('AI 服务无响应，请重试')
    }
  } catch (e) {
    loadingMsg?.destroy()
    console.error('Batch AI translation failed:', e)
    const errText = e.response?.data?.message || e.message || 'AI 命名服务暂时不可用'
    window.$message?.error(`AI 批量一键命名失败: \${errText}`)
  } finally {
    translating.value = false
  }
}

function fieldTypeLabel(type) {
  const m = { input: '文本', textarea: '多行', number: '数字', select: '下拉', date: '日期', datetime: '日期时间', radio: '单选', checkbox: '多选', switch: '开关', user: '人员选择', upload: '附件上传', subtable: '明细子表' }
  return m[type] || type
}

function addSubColumn(fieldIdx) {
  const f = formData.fields[fieldIdx];
  if (!f.columns) f.columns = [];
  const colKey = 'col_' + generateShortId();
  f.columns.push({
    key: colKey,
    label: '',
    type: 'input',
    optionsText: ''
  });
}

function removeSubColumn(fieldIdx, colIdx) {
  formData.fields[fieldIdx]?.columns?.splice(colIdx, 1);
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
  const key = 'field_' + generateShortId()
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
  
  if (fieldPermissions[nodeId] && fieldPermissions[nodeId][fieldKey]) {
    return fieldPermissions[nodeId][fieldKey]
  }
  
  // Fallback to default by node type
  const nodeType = selectedNode.value?.type || selectedNode.value?.data?.nodeType
  if (nodeType === 'approve' || nodeType === 'end') {
    return 'readonly'
  }
  
  return 'editable'
}

function setFieldPerm(fieldKey, val) {
  const nodeId = selectedNode.value?.id
  if (!nodeId) return
  if (!fieldPermissions[nodeId]) fieldPermissions[nodeId] = {}
  fieldPermissions[nodeId][fieldKey] = val
}

function batchSetAllPerms(val) {
  const nodeId = selectedNode.value?.id
  if (!nodeId) return
  if (!fieldPermissions[nodeId]) {
    fieldPermissions[nodeId] = {}
  }
  formData.fields.forEach(field => {
    fieldPermissions[nodeId][field.key] = val
  })
  window.$message?.success(`已一键将所有字段权限设为：${val === 'editable' ? '可编辑' : val === 'readonly' ? '只读' : '隐藏'}`)
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
    condition: e.data?.condition || e.condition || e.data?.conditionExpr || null,
  }))

  const nodePermissions = []
  payloadNodes.forEach(node => {
    formData.fields.forEach(field => {
      let perm = 'editable'
      if (fieldPermissions[node.id] && fieldPermissions[node.id][field.key]) {
        perm = fieldPermissions[node.id][field.key]
      } else {
        // Enforce defaults based on node type
        if (node.type === 'approve' || node.type === 'end') {
          perm = 'readonly'
        }
      }
      nodePermissions.push({ nodeId: node.id, fieldKey: field.key, permission: perm })
    })
  })

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

  // Generate basic data variables
  const dataPropList = fields.map(f => `        ${f.key}: ${genDefaultValue(f)}`);
  
  // Inject sub-table derived virtual aggregation properties to formData
  fields.filter(f => f.type === 'subtable').forEach(f => {
    dataPropList.push(`        ${f.key}_count: 0`);
    (f.columns || []).forEach(c => {
      if (c.type === 'number' || c.type === 'input') {
        dataPropList.push(`        ${f.key}_sum_${c.key}: 0`);
        dataPropList.push(`        ${f.key}_max_${c.key}: 0`);
      }
    });
  });

  const dataProps = dataPropList.join(',\n')

  const rules = fields.filter(f => f.required).map(f => `        ${f.key}: [{ required: true, message: '${f.placeholder || '请填写' + (f.label || f.key)}', trigger: '${f.type === 'select' || f.type === 'date' || f.type === 'datetime' || f.type === 'radio' ? 'change' : 'blur'}' }]`).join(',\n')
  
  const optionsList = fields.filter(f => f.type === 'select' || f.type === 'radio' || f.type === 'checkbox').map(f => {
    const opts = (f.options || []).map(o => `        { label: '${o.label}', value: '${o.value}' }`)
    return `      ${f.key}Options: [\n${opts.join(',\n')}\n      ]`
  })

  fields.filter(f => f.type === 'subtable').forEach(f => {
    const cols = (f.columns || []).map(c => `        { key: '${c.key}', label: '${c.label || c.key}', type: '${c.type || 'input'}', optionsText: '${c.optionsText || ''}' }`)
    optionsList.push(`      ${f.key}Columns: [\n${cols.join(',\n')}\n      ]`)
  })

  const optionsData = optionsList.join(',\n')

  // Generate watchers for subtable aggregates
  const watchersList = [];
  fields.filter(f => f.type === 'subtable').forEach(f => {
    const calcLines = [];
    calcLines.push(`      const list = val || [];`);
    calcLines.push(`      this.formData.${f.key}_count = list.length;`);
    (f.columns || []).forEach(c => {
      if (c.type === 'number' || c.type === 'input') {
        calcLines.push(`      this.formData.${f.key}_sum_${c.key} = list.reduce((sum, item) => sum + (Number(item.${c.key}) || 0), 0);`);
        calcLines.push(`      this.formData.${f.key}_max_${c.key} = list.length ? Math.max(...list.map(item => Number(item.${c.key}) || 0)) : 0;`);
      }
    });

    watchersList.push(`    'formData.${f.key}': {
      handler(val) {
${calcLines.join('\n')}
      },
      deep: true,
      immediate: true
    }`);
  });

  const watchers = watchersList.join(',\n')

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
  watch: {
${watchers}
  },
}
${scriptClose}`
}

function genFieldHtml(f) {
  let attrs = []
  attrs.push(`label="${f.label || f.key}"`)
  attrs.push(`path="${f.key}"`)
  attrs.push(`type="${f.type || 'input'}"`)
  attrs.push(`v-model:value="formData.${f.key}"`)
  
  if (f.placeholder) {
    attrs.push(`placeholder="${f.placeholder}"`)
  }
  if (f.rows) {
    attrs.push(`:rows="${f.rows}"`)
  }
  if (f.min !== undefined && f.min !== null) {
    attrs.push(`:min="${f.min}"`)
  }
  if (f.max !== undefined && f.max !== null) {
    attrs.push(`:max="${f.max}"`)
  }
  if (f.type === 'select' || f.type === 'radio' || f.type === 'checkbox') {
    attrs.push(`:options="${f.key}Options"`)
  }
  if (f.type === 'subtable') {
    attrs.push(`:columns="${f.key}Columns"`)
  }
  
  return `        <wf-field ${attrs.join(' ')} />`
}

function genDefaultValue(f) {
  if (f.defaultValue !== null && f.defaultValue !== undefined) {
    if (typeof f.defaultValue === 'string') return `'${f.defaultValue}'`
    return f.defaultValue
  }
  if (f.type === 'subtable') return '[]'
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

.field-card { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #fafbfc; transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s; }
.field-card.drag-active {
  opacity: 0.4;
  border-color: #3b82f6;
  border-style: dashed;
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
}
.field-card.drag-over {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
}
.drag-handle {
  display: flex;
  align-items: center;
  color: #94a3b8;
  transition: color 0.15s;
}
.drag-handle:hover {
  color: #475569;
}

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
