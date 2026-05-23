<template>
  <div class="page-renderer">
    <!-- Top toolbar -->
    <div class="pr-toolbar">
      <div class="pr-toolbar-left">
        <span class="pr-title">{{ resolvedTitle }}</span>
        <n-tag v-if="mode === 'approve'" size="small" :type="statusTagType">{{ statusLabel }}</n-tag>
        <n-tag v-else-if="mode === 'view'" size="small" :type="statusTagType">{{ statusLabel }}</n-tag>
      </div>
      <div class="pr-toolbar-right">
        <n-button size="small" quaternary @click="showFlowChart = true">
          <template #icon><n-icon><GitNetworkOutline /></n-icon></template>
          流程图
        </n-button>
        <n-button size="small" quaternary @click="showHistory = true">
          <template #icon><n-icon><ListOutline /></n-icon></template>
          流转记录
        </n-button>
        <n-divider vertical />
        <n-button size="small" @click="handleSave" :disabled="submitting || mode === 'view'">保存草稿</n-button>
        <n-button v-if="mode === 'start'" type="primary" size="small" @click="handleSubmit" :loading="submitting">提 交</n-button>
        <n-button v-if="mode === 'approve'" type="success" size="small" @click="handleApprove('agree')" :loading="submitting">同 意</n-button>
        <n-button v-if="mode === 'approve'" type="warning" size="small" @click="handleApprove('reject')" :loading="submitting">驳 回</n-button>
        <n-button v-if="mode === 'start' && workflowContext?.instanceId && workflowContext?.status !== 'draft'" size="small" @click="handleWithdraw" :loading="submitting">撤回</n-button>
        <n-button quaternary size="small" @click="handleCancel">取消</n-button>
      </div>
    </div>

    <!-- Dynamic form area -->
    <div class="pr-body" :class="{ 'pr-body-loading': loading, 'pr-body-viewonly': mode === 'view' }">
      <n-spin :show="loading">
        <div v-if="error" class="pr-error">
          <n-result status="error" title="渲染失败" :description="error">
            <template #footer>
              <n-button @click="reload">重新加载</n-button>
            </template>
          </n-result>
        </div>
        <div v-else ref="mountRef" class="pr-mount" />
      </n-spin>
    </div>

    <!-- Bottom info bar -->
    <div v-if="hasFooterInfo" class="pr-footer">
      <span v-if="workflowContext?.templateName">流程模板：{{ workflowContext.templateName }}</span>
      <span v-if="workflowContext?.nodeName">当前节点：{{ workflowContext.nodeName }}</span>
      <span v-if="workflowContext?.assignee">处理人：{{ workflowContext.assignee }}</span>
      <span v-if="workflowContext?.createTime">发起时间：{{ workflowContext.createTime }}</span>
    </div>

    <!-- Flow chart modal -->
    <n-modal v-model:show="showFlowChart" title="流程图" preset="card" style="width: 720px; max-width: 95vw;">
      <div v-if="treeData" class="flow-chart-view overflow-x-auto p-4 flex justify-center">
        <FlowChartTree :node="treeData" />
      </div>
      <n-empty v-else description="暂无流程数据" />
    </n-modal>

    <!-- History modal -->
    <n-modal v-model:show="showHistory" title="流转记录" preset="card" style="width: 600px; max-width: 90vw;">
      <n-timeline v-if="props.historyList.length">
        <n-timeline-item v-for="(item, i) in props.historyList" :key="i" :type="item.type" :time="item.time" :title="item.action" :content="item.comment" />
      </n-timeline>
      <n-empty v-else description="暂无流转记录" />
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, shallowRef, createApp } from 'vue'
import naive, { zhCN, dateZhCN } from 'naive-ui'

import { GitNetworkOutline, ListOutline } from '@vicons/ionicons5'
import { startInstance, approveInstance, withdrawInstance } from '@/api/workflow/instance'
import { getTaskDetail } from '@/api/workflow/task'
import FlowChartTree from './FlowChartTree.vue'
import WfField from './WfField.vue'

// ============ Props ============

const props = defineProps({
  template: { type: String, default: '' },
  mode: { type: String, default: 'start' },
  workflowContext: { type: Object, default: () => ({}) },
  /* workflowContext:
    templateId, instanceId, taskId, nodeId
    title, formData, options: { fieldKey: optionList }
    templateName, nodeName, assignee, createTime
  */
  flowData: { type: Object, default: null },
  /* flowData:
    { nodes: [{ id, name, type }], edges: [{ source, target, label }] }
  */
  initialFormData: { type: Object, default: null },
  /* 外部传入的初始表单数据，优先级高于 workflowContext.formData */
  historyList: { type: Array, default: () => [] },
  /* 外部传入的流转记录 */
})

const emit = defineEmits(['submit', 'cancel', 'saved'])

// ============ State ============

const mountRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const showFlowChart = ref(false)
const showHistory = ref(false)
const formVm = shallowRef(null)

// ============ Computed ============

const hasFooterInfo = computed(() => {
  return !!(props.workflowContext?.templateName || 
            props.workflowContext?.nodeName || 
            props.workflowContext?.assignee || 
            props.workflowContext?.createTime)
})

const resolvedTitle = computed(() => {
  if (props.workflowContext?.title) return props.workflowContext.title
  if (props.mode === 'start') return '发起流程'
  if (props.mode === 'approve') return '审批处理'
  return '表单详情'
})

const statusLabel = computed(() => {
  if (props.mode === 'view') return '已办结'
  if (props.mode === 'approve') return '待审批'
  return ''
})

const statusTagType = computed(() => {
  if (props.mode === 'view') return 'success'
  if (props.mode === 'approve') return 'warning'
  return 'default'
})

const treeData = computed(() => {
  const data = props.flowData
  if (!data?.nodes?.length) return null

  const nodeMap = {}
  data.nodes.forEach(n => {
    nodeMap[n.id] = {
      id: n.id,
      name: n.name,
      type: n.type,
      children: [],
    }
  })

  const edgeKey = data.edges?.[0]?.sourceNodeId ? 'sourceNodeId' : 'source'
  const targetKey = data.edges?.[0]?.targetNodeId ? 'targetNodeId' : 'target'

  const outgoingMap = {}
  ;(data.edges || []).forEach(e => {
    const src = e[edgeKey]
    if (!outgoingMap[src]) outgoingMap[src] = []
    outgoingMap[src].push(e)
  })

  const startNode = data.nodes.find(n => n.type === 'start' || !data.edges?.some(e => e[targetKey] === n.id))
  if (!startNode) return null

  const visited = new Set()

  function buildSubtree(nodeId, edgeLabel = '') {
    if (visited.has(nodeId)) {
      const node = nodeMap[nodeId]
      return {
        id: nodeId + '_ref',
        name: (node?.name || '') + ' (循环)',
        type: node?.type || 'end',
        edgeLabel,
        children: [],
      }
    }

    visited.add(nodeId)
    const nodeObj = { ...nodeMap[nodeId], edgeLabel }

    const outEdges = outgoingMap[nodeId] || []
    nodeObj.children = outEdges.map(edge => {
      const targetId = edge[targetKey]
      let label = edge.label || edge.condition || ''
      if (typeof label === 'object' && label !== null) {
        label = label.isDefault ? '其他' : (label.rules ? '条件分支' : '')
      }
      return buildSubtree(targetId, label)
    }).filter(child => child !== null)

    visited.delete(nodeId)
    return nodeObj
  }

  return buildSubtree(startNode.id)
})

// ============ Lifecycle ============

onMounted(() => { mountForm() })
onBeforeUnmount(() => { unmountForm() })
watch(() => props.template, () => { nextTick(() => mountForm()) })
watch(() => props.workflowContext, () => { updateFormData() }, { deep: true })
watch(() => props.initialFormData, (val) => {
  if (val && Object.keys(val).length > 0) {
    nextTick(() => { mountForm() })
  }
}, { deep: true })

// ============ Form Mount/Unmount ============

let formApp = null
let injectedStyleEl = null

function extractTemplate(code) {
  return code
    .replace(/<template[^>]*>/g, '')
    .replace(/<\/template>/g, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
    .trim()
}

function extractScript(code) {
  const match = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!match) return null
  return match[1].trim()
}

function extractStyle(code) {
  const match = code.match(/<style[^>]*>([\s\S]*?)<\/style>/)
  return match ? match[1].trim() : ''
}

function parseScriptOptions(content) {
  if (!content) return {}
  try {
    let clean = content.replace(/^export\s+default\s+/, '')
    clean = clean.replace(/;+\s*$/, '')
    const fn = new Function(`return (${clean})`)
    return fn()
  } catch (e) {
    console.warn('[PageRenderer] Script options parse error:', e)
    return {}
  }
}

function buildOptions() {
  const options = {}
  if (props.workflowContext?.options) {
    for (const [key, list] of Object.entries(props.workflowContext.options)) {
      options[key] = list
    }
  }
  return options
}

function injectStyle(cssText) {
  removeInjectedStyle()
  if (!cssText) return
  injectedStyleEl = document.createElement('style')
  injectedStyleEl.setAttribute('data-page-renderer', 'true')
  injectedStyleEl.textContent = cssText
  document.head.appendChild(injectedStyleEl)
}

function removeInjectedStyle() {
  if (injectedStyleEl) {
    injectedStyleEl.remove()
    injectedStyleEl = null
  }
}

function initTailwindRuntime() {
  if (window.tailwind) return Promise.resolve()
  return new Promise((resolve) => {
    window.tailwind = {
      corePlugins: { preflight: false },
      theme: {
        extend: {
          boxShadow: {
            premium: "0 10px 40px -10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.03)",
            massive: "0 20px 60px -15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)"
          }
        }
      }
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.tailwindcss.com'
    script.onload = () => resolve()
    script.onerror = () => {
      console.warn('[PageRenderer] Failed to load Tailwind CSS CDN.')
      resolve()
    }
    document.head.appendChild(script)
  })
}

async function mountForm() {
  unmountForm()
  loading.value = true
  error.value = ''

  if (!mountRef.value) {
    loading.value = false
    return
  }

  await initTailwindRuntime()

  let templateText = props.template || ''
  // Hot patch: seamless backward compatibility with legacy multi-line formatted non-compilable if statement in @click, turning it into a valid Vue 3 expression
  templateText = templateText.replace(
    /@click="\s*if\s*\(\s*!formData\.([a-zA-Z0-9_]+)\s*\)\s*(?:\{\s*)?formData\.\1\s*=\s*\[\];?\s*(?:\}\s*)?formData\.\1\.push\(([\s\S]*?)\);?\s*"/g,
    '@click="(formData.$1 = formData.$1 || []).push($2)"'
  )

  const innerHtml = extractTemplate(templateText)
  if (!innerHtml) {
    loading.value = false
    return
  }

  try {
    const initialData = props.initialFormData || props.workflowContext?.formData || {}

    // Extract and inject style block from generated code
    const styleContent = extractStyle(props.template)
    injectStyle(styleContent)

    // Support user script block — merge Options API into dynamic Vue app
    const scriptContent_ = extractScript(props.template)
    const scriptOptions_ = parseScriptOptions(scriptContent_)
    const scriptData = scriptOptions_.data ? scriptOptions_.data() : {}
    const scriptMethods = scriptOptions_.methods || {}
    const scriptComputed = scriptOptions_.computed || {}
    const scriptWatch = scriptOptions_.watch || {}

    formApp = createApp({
      data() {
        return {
          ...scriptData,
          formData: {
            ...(scriptData.formData || {}),
            ...JSON.parse(JSON.stringify(initialData)),
          },
          formRules: scriptData.formRules || {},
          locale: zhCN,
          dateLocale: dateZhCN,
          ...buildOptions(),
        }
      },
      methods: scriptMethods,
      computed: scriptComputed,
      watch: {
        formData: {
          handler(val) { this.$emit('update:formData', val) },
          deep: true,
        },
        ...scriptWatch,
      },
      emits: ['update:formData'],
      template: `<n-config-provider :locale="locale" :date-locale="dateLocale"><div class="pr-form-body">${innerHtml}</div></n-config-provider>`,
    })

    // Register naive-ui globally for the dynamic app
    formApp.use(naive)

    // Register WfField globally for the dynamic app
    formApp.component('WfField', WfField)

    // Inject workflow context
    formApp.config.globalProperties.$workflow = { ...props.workflowContext }

    // Mount
    nextTick(() => {
      try {
        formVm.value = formApp.mount(mountRef.value)
        loading.value = false
        applyPermissions()
      } catch (e) {
        error.value = e.message
        loading.value = false
      }
    })
  } catch (e) {
    error.value = e.message
    loading.value = false
  }
}

function applyPermissions() {
  const perms = props.workflowContext?.nodePermissions
  const fields = props.workflowContext?.formFields || []
  if (!perms || Object.keys(perms).length === 0) return
  if (!mountRef.value) return

  // Map from field label → permission
  const labelPerms = {}
  fields.forEach(f => {
    if (perms[f.key]) labelPerms[f.label || f.key] = perms[f.key]
  })

  mountRef.value.querySelectorAll('.n-form-item').forEach(el => {
    const labelEl = el.querySelector('.n-form-item-label')
    if (!labelEl) return
    const label = labelEl.textContent?.trim()
    if (!label) return
    const perm = labelPerms[label]
    if (!perm || perm === 'editable') return

    if (perm === 'hidden') {
      el.style.display = 'none'
    } else {
      el.style.opacity = '0.55'
      el.style.pointerEvents = 'none'
    }
  })
}

function unmountForm() {
  if (formApp) {
    formApp.unmount()
    formApp = null
    formVm.value = null
  }
  removeInjectedStyle()
}

function reload() {
  error.value = ''
  mountForm()
}

// ============ Form Data Sync ============

function updateFormData() {
  if (!formVm.value || !props.workflowContext?.formData) return
  const newData = JSON.parse(JSON.stringify(props.workflowContext.formData))
  
  // Safely merge properties to avoid destroying reactive arrays or introducing undefined states
  Object.keys(formVm.value.formData).forEach(key => {
    if (newData[key] !== undefined && newData[key] !== null) {
      formVm.value.formData[key] = newData[key]
    } else {
      if (Array.isArray(formVm.value.formData[key])) {
        formVm.value.formData[key] = []
      }
    }
  })
}

// ============ Workflow Operations ============

async function validateForm() {
  if (!formVm.value?.$refs?.formRef) return true
  try {
    await formVm.value.$refs.formRef.validate()
    return true
  } catch (errors) {
    console.warn('[PageRenderer] Form validation errors:', errors)
    return false
  }
}

function collectFormData() {
  return formVm.value?.formData || {}
}

async function handleSubmit() {
  submitting.value = true
  try {
    const valid = await validateForm()
    if (!valid) {
      window.$message?.warning('请完善表单信息')
      submitting.value = false
      return
    }

    const formData = collectFormData()
    const data = {
      templateId: props.workflowContext.templateId,
      instanceId: props.workflowContext.instanceId,
      title: resolvedTitle.value,
      priority: props.workflowContext.priority ?? 0,
      formData,
    }

    await startInstance(data)
    window.$message?.success('提交成功')
    emit('submit', { action: 'submit', ...data })
  } catch (e) {
    window.$message?.error(e.message || '提交失败')
  }
  submitting.value = false
}

async function handleApprove(action) {
  if (action === 'reject' && !window.confirm('确定要驳回该流程吗？')) {
    return
  }

  submitting.value = true
  try {
    const valid = await validateForm()
    if (!valid) {
      window.$message?.warning('请完善表单信息')
      submitting.value = false
      return
    }

    const formData = collectFormData()
    await approveInstance({
      instanceId: props.workflowContext.instanceId,
      nodeId: props.workflowContext.nodeId,
      action,
      formData,
    })
    window.$message?.success(action === 'agree' ? '已同意' : '已驳回')
    emit('submit', { action, formData })
  } catch (e) {
    window.$message?.error(e.message || '操作失败')
  }
  submitting.value = false
}

async function handleSave() {
  submitting.value = true
  try {
    const formData = collectFormData()
    await startInstance({
      templateId: props.workflowContext.templateId,
      instanceId: props.workflowContext.instanceId,
      title: resolvedTitle.value || '草稿',
      priority: props.workflowContext.priority ?? 0,
      formData,
      draft: true,
    })
    window.$message?.success('草稿已保存')
    emit('saved', { formData })
  } catch (e) {
    window.$message?.error(e.message || '保存失败')
  }
  submitting.value = false
}

async function handleWithdraw() {
  submitting.value = true
  try {
    await withdrawInstance(props.workflowContext.instanceId)
    window.$message?.success('已撤回')
    emit('submit', { action: 'withdraw' })
  } catch (e) {
    window.$message?.error(e.message || '撤回失败')
  }
  submitting.value = false
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.page-renderer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f7fa;
}

/* Toolbar */
.pr-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #fff;
  border-bottom: 1px solid #e5e9ef;
  flex-shrink: 0;
}
.pr-toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pr-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.pr-toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Body */
.pr-body {
  flex: 1;
  overflow: auto;
  padding: 0;
  min-height: 0;
}
.pr-body-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}
.pr-mount {
  min-height: 200px;
}
.pr-form-body {
  width: 100%;
}
.pr-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
.pr-body-viewonly .pr-form-body {
  pointer-events: none;
  opacity: 0.85;
}

/* Flow chart */
.flow-chart-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
}
.fc-node-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.fc-node {
  width: 180px;
  padding: 12px 20px;
  border-radius: 8px;
  text-align: center;
  border: 2px solid;
  background: #fff;
}
.fc-node.fc-start { border-color: #059669; }
.fc-node.fc-approve { border-color: #3b82f6; }
.fc-node.fc-condition { border-color: #f59e0b; }
.fc-node.fc-end { border-color: #ef4444; }
.fc-node-type { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.fc-node.fc-start .fc-node-type { color: #059669; }
.fc-node.fc-approve .fc-node-type { color: #3b82f6; }
.fc-node.fc-condition .fc-node-type { color: #f59e0b; }
.fc-node.fc-end .fc-node-type { color: #ef4444; }
.fc-node-name { font-size: 14px; font-weight: 500; color: #1e293b; }
.fc-arrow { display: flex; flex-direction: column; align-items: center; padding: 4px 0; }
.fc-edge-label { font-size: 11px; color: #94a3b8; margin-top: -2px; }

/* Footer */
.pr-footer {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 8px 24px;
  background: #f8fafc;
  border-top: 1px solid #e5e9ef;
  font-size: 11px;
  color: #94a3b8;
  flex-shrink: 0;
}
</style>
