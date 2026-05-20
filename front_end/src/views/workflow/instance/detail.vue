<template>
  <div class="h-full flex flex-col" v-if="!loading">
    <div class="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden">
      <div class="w-[420px] flex-shrink-0 overflow-y-auto bg-white rounded-lg p-4 border border-gray-200">
        <div class="text-sm font-semibold text-slate-700 mb-4">审批进度</div>
        <div class="approval-timeline">
          <div v-for="(node, idx) in instance?.nodes || []" :key="node.id" class="timeline-item">
            <div class="timeline-dot" :class="nodeStatusClass(node.status)">
              <n-icon v-if="node.status === 'approved'" size="14"><CheckmarkOutline /></n-icon>
              <n-icon v-else-if="node.status === 'rejected'" size="14"><CloseOutline /></n-icon>
              <n-icon v-else-if="node.status === 'pending'" size="14"><TimeOutline /></n-icon>
              <n-icon v-else size="14"><EllipseOutline /></n-icon>
            </div>
            <div class="timeline-content">
              <div class="font-medium text-sm">{{ node.nodeName }}</div>
              <div class="text-xs text-slate-400">{{ node.assigneeName || node.assignee || '待分配' }}</div>
              <div v-if="node.comment" class="text-xs text-slate-500 mt-1 bg-slate-50 p-1.5 rounded">{{ node.comment }}</div>
              <div v-if="node.finishedAt" class="text-xs text-slate-400 mt-1">{{ node.finishedAt }} · {{ durationText(node.durationSeconds) }}</div>
            </div>
            <div v-if="idx < (instance?.nodes?.length || 0) - 1" class="timeline-line" />
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-white rounded-lg border border-gray-200">
        <div class="flex-shrink-0 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="font-semibold text-sm">{{ instance?.title }}</span>
            <n-tag size="small" :type="statusColors[instance?.status]">{{ statusLabels[instance?.status] }}</n-tag>
          </div>
          <n-button size="tiny" quaternary @click="goBack">返回</n-button>
        </div>

        <div class="flex-shrink-0 grid grid-cols-3 gap-3 px-4 py-2.5 text-xs text-slate-400 bg-slate-50 border-b border-gray-100">
          <span>模板：{{ instance?.template?.name }}</span>
          <span>发起人：{{ instance?.initiator }}</span>
          <span>发起时间：{{ instance?.createdAt }}</span>
        </div>

        <div v-if="mode === 'view'" class="flex-1 min-h-0 overflow-auto p-4">
          <div class="text-sm font-semibold text-slate-700 mb-3">表单数据</div>
          <PageRenderer
            :key="'view-' + instance?.id"
            :template="formTemplate"
            mode="view"
            :workflow-context="viewContext"
            :flow-data="flowData"
            :history-list="historyList"
          />
        </div>

        <div v-else class="flex-1 min-h-0 overflow-auto">
          <PageRenderer
            :key="'approve-' + instance?.id"
            :template="formTemplate"
            mode="approve"
            :workflow-context="approveContext"
            :flow-data="flowData"
            :history-list="historyList"
            @submit="onApproved"
            @cancel="goBack"
          />
        </div>
      </div>
    </div>
  </div>
  <div v-else class="h-full flex items-center justify-center">
    <n-spin size="large" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store/useAppStore'
import { CheckmarkOutline, CloseOutline, TimeOutline, EllipseOutline } from '@vicons/ionicons5'
import { getInstanceDetail } from '@/api/workflow/instance'
import PageRenderer from '@/components/workflow/PageRenderer.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const instance = ref(null)
const loading = ref(false)
const formTemplate = ref('')

const mode = computed(() => instance.value?.status === 'running' ? 'approve' : 'view')

const statusColors = { draft: 'default', running: 'info', approved: 'success', rejected: 'error', cancelled: 'warning' }
const statusLabels = { draft: '草稿', running: '审批中', approved: '已通过', rejected: '已驳回', cancelled: '已撤回' }

const latestData = computed(() => {
  const snapshots = instance.value?.dataSnapshots || []
  return snapshots[0]?.data || {}
})

const flowData = computed(() => {
  const tpl = instance.value?.template
  if (!tpl?.nodes?.length) return null
  return {
    nodes: tpl.nodes.map(n => ({ id: n.id, name: n.name, type: n.type })),
    edges: (tpl.edges || []).map(e => ({ source: e.sourceNodeId, target: e.targetNodeId, label: e.label })),
  }
})

const historyList = computed(() => {
  return (instance.value?.nodes || [])
    .filter(n => n.status !== 'pending')
    .map(n => ({
      type: n.status === 'approved' ? 'success' : n.status === 'rejected' ? 'error' : 'info',
      time: n.finishedAt || n.updatedAt || n.createdAt,
      action: `${n.nodeName} - ${statusLabels[n.status] || n.status}`,
      comment: n.comment || '',
    }))
})

const nodePermMap = computed(() => {
  const perms = instance.value?.nodePermissions || []
  const inst = instance.value
  const pendingNode = (inst?.nodes || []).find(n => n.status === 'pending')
  
  if (pendingNode) {
    const map = {}
    perms.filter(p => p.nodeId === pendingNode.templateNodeId).forEach(p => {
      map[p.fieldKey] = p.permission
    })
    return map
  } else {
    return new Proxy({}, {
      get(target, prop) {
        if (typeof prop === 'symbol' || prop === '__v_isRef' || prop === '__v_isReactive') {
          return Reflect.get(target, prop)
        }
        return 'readonly'
      }
    })
  }
})

const viewContext = computed(() => {
  const inst = instance.value
  if (!inst) return {}
  return {
    title: inst.title,
    formData: latestData.value,
    templateName: inst.template?.name,
    createTime: inst.createdAt,
    nodePermissions: nodePermMap.value,
  }
})

const approveContext = computed(() => {
  const inst = instance.value
  if (!inst) return {}
  const pendingNode = (inst.nodes || []).find(n => n.status === 'pending')
  return {
    instanceId: inst.id,
    nodeId: pendingNode?.id || '',
    title: inst.title,
    formData: latestData.value,
    templateName: inst.template?.name,
    nodeName: pendingNode?.nodeName || '',
    assignee: pendingNode?.assignee || '',
    createTime: inst.createdAt,
    nodePermissions: nodePermMap.value,
    formFields: inst.template?.config?.fields || [],
  }
})

function durationText(seconds) {
  if (!seconds && seconds !== 0) return ''
  if (seconds < 60) return `${seconds}秒`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
  return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`
}

function nodeStatusClass(status) {
  return {
    pending: 'dot-pending',
    processing: 'dot-processing',
    approved: 'dot-approved',
    rejected: 'dot-rejected',
    transferred: 'dot-transferred',
    cancelled: 'dot-cancelled',
  }[status] || 'dot-pending'
}

function goBack() {
  appStore.removeTab('FlowInstanceDetail')
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/workflow/instance')
  }
}

function onApproved() {
  goBack()
}

onMounted(async () => {
  const id = route.query.id
  if (!id) return
  loading.value = true
  try {
    const res = await getInstanceDetail(id)
    instance.value = res
    formTemplate.value = res.formTemplate || ''
  } catch (e) {
    console.error(e)
    window.$message?.error('加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.approval-timeline { position: relative; padding-left: 24px; }
.timeline-item { position: relative; padding-bottom: 20px; }
.timeline-dot {
  position: absolute; left: -24px; top: 2px;
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #d1d5db; background: #fff; color: #9ca3af;
}
.timeline-dot.dot-approved { border-color: #059669; background: #ecfdf5; color: #059669; }
.timeline-dot.dot-rejected { border-color: #ef4444; background: #fef2f2; color: #ef4444; }
.timeline-dot.dot-pending { border-color: #3b82f6; background: #eff6ff; color: #3b82f6; }
.timeline-line {
  position: absolute; left: -13px; top: 26px; bottom: 0;
  width: 2px; background: #e5e7eb;
}
</style>
