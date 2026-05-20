<template>
  <div class="h-full flex flex-col">
    <div class="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="flex items-center gap-2" style="min-width:300px">
          <span class="text-sm text-gray-500 whitespace-nowrap">流程模板</span>
          <n-select
            v-model:value="templateId"
            :options="templateOptions"
            filterable
            placeholder="选择流程模板"
            style="width:200px"
            size="small"
            :disabled="!!editingInstanceId"
            @update:value="onTemplateChange"
          />
        </div>
        <div class="flex items-center gap-2 flex-1" style="min-width:200px">
          <span class="text-sm text-gray-500 whitespace-nowrap">实例标题</span>
          <n-input v-model:value="instanceTitle" placeholder="如：张三的请假申请" size="small" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500 whitespace-nowrap">优先级</span>
          <n-radio-group v-model:value="priority" size="small">
            <n-radio-button :value="0">普通</n-radio-button>
            <n-radio-button :value="1">紧急</n-radio-button>
            <n-radio-button :value="2">特急</n-radio-button>
          </n-radio-group>
        </div>
        <n-button size="small" quaternary @click="goBack">返回</n-button>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <n-spin size="large" />
    </div>
    <div v-else-if="formTemplate" class="flex-1 min-h-0">
      <PageRenderer
        :key="templateId"
        :template="formTemplate"
        mode="start"
        :workflow-context="workflowContext"
        :flow-data="flowData"
        @submit="onSubmitted"
        @cancel="goBack"
      />
    </div>
    <div v-else class="flex-1 flex items-center justify-center">
      <n-empty description="请先选择流程模板" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/store/useAppStore'
import { getTemplateDetail, getTemplateList } from '@/api/workflow/template'
import { getInstanceDetail } from '@/api/workflow/instance'
import PageRenderer from '@/components/workflow/PageRenderer.vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

const templateId = ref(null)
const instanceTitle = ref('')
const priority = ref(0)
const templateOptions = ref([])
const formTemplate = ref('')
const flowData = ref(null)
const loading = ref(false)
const editingInstanceId = ref('')

const workflowContext = reactive({
  templateId: null,
  instanceId: undefined,
  title: '发起流程',
  priority: 0,
  formData: undefined,
  status: undefined,
})

onMounted(async () => {
  try {
    const list = await getTemplateList()
    templateOptions.value = (list || []).map(t => ({ label: t.name, value: t.id }))
  } catch (e) { console.error(e) }

  const draftId = route.query.instanceId
  if (draftId) {
    editingInstanceId.value = draftId
    loading.value = true
    try {
      const detail = await getInstanceDetail(draftId)
      templateId.value = detail.templateId
      instanceTitle.value = detail.title || ''
      priority.value = detail.priority ?? 0
      workflowContext.formData = detail.dataSnapshots?.[0]?.data || {}
      workflowContext.templateId = detail.templateId
      workflowContext.instanceId = draftId
      workflowContext.title = detail.title || '发起流程'
      workflowContext.priority = detail.priority ?? 0
      workflowContext.status = 'draft'

      const tpl = await getTemplateDetail(detail.templateId)
      formTemplate.value = tpl.config?.formTemplate || ''
      flowData.value = {
        nodes: (tpl.nodes || []).map(n => ({ id: n.id, name: n.name, type: n.type })),
        edges: (tpl.edges || []).map(e => ({ source: e.sourceNodeId, target: e.targetNodeId, label: e.label, condition: e.condition })),
      }
      
      const startNode = (tpl.nodes || []).find(n => n.type === 'start')
      const permsMap = {}
      if (startNode && tpl.nodePermissions) {
        tpl.nodePermissions.filter(p => p.nodeId === startNode.id).forEach(p => {
          permsMap[p.fieldKey] = p.permission
        })
      }
      workflowContext.nodePermissions = permsMap
    } catch (e) {
      window.$message?.error('加载草稿失败')
    } finally {
      loading.value = false
    }
    return
  }

  if (route.query.templateId) {
    templateId.value = route.query.templateId
    await loadFormTemplate(route.query.templateId)
  }
})

async function onTemplateChange(val) {
  instanceTitle.value = ''
  formTemplate.value = ''
  if (val) await loadFormTemplate(val)
}

async function loadFormTemplate(id) {
  loading.value = true
  try {
    const detail = await getTemplateDetail(id)
    templateId.value = id
    formTemplate.value = detail.config?.formTemplate || ''
    flowData.value = {
      nodes: (detail.nodes || []).map(n => ({ id: n.id, name: n.name, type: n.type })),
      edges: (detail.edges || []).map(e => ({ source: e.sourceNodeId, target: e.targetNodeId, label: e.label, condition: e.condition })),
    }
    
    const startNode = (detail.nodes || []).find(n => n.type === 'start')
    const permsMap = {}
    if (startNode && detail.nodePermissions) {
      detail.nodePermissions.filter(p => p.nodeId === startNode.id).forEach(p => {
        permsMap[p.fieldKey] = p.permission
      })
    }
    workflowContext.nodePermissions = permsMap
    workflowContext.templateId = id
    if (!instanceTitle.value) {
      instanceTitle.value = `${detail.name || ''}申请`
      workflowContext.title = instanceTitle.value
    }
  } catch (e) {
    window.$message?.error('加载模板失败')
  } finally {
    loading.value = false
  }
}

function onSubmitted() {
  goBack()
}

function goBack() {
  appStore.removeTab('FlowInstanceStart')
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/workflow/instance')
  }
}
</script>
