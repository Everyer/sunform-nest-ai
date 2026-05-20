<template>
  <n-card size="small" :bordered="false">
    <n-tabs v-model:value="activeTab" type="line" @update:value="onTabChange">
      <n-tab-pane name="todo" tab="待办">
        <n-data-table
          :columns="todoColumns"
          :data="todoData"
          :loading="loading"
          :pagination="pagination"
          :row-key="(row) => row.taskId"
          striped
        />
      </n-tab-pane>
      <n-tab-pane name="done" tab="已办">
        <n-data-table
          :columns="doneColumns"
          :data="doneData"
          :loading="loading"
          :pagination="pagination"
          :row-key="(row) => row.taskId"
          striped
        />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup>
import { ref, reactive, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NTag, NSpace, NCard, NTabs, NTabPane, NDataTable } from 'naive-ui'
import { getTodoList, getDoneList } from '@/api/workflow/task'

const router = useRouter()
const activeTab = ref('todo')
const loading = ref(false)
const todoData = ref([])
const doneData = ref([])

const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 })

const todoColumns = [
  { title: '标题', key: 'instance.title', width: 200, render(row) { return row.instance?.title || '-' } },
  { title: '流程', key: 'instance.template.name', width: 140, render(row) { return row.instance?.template?.name || '-' } },
  { title: '当前节点', key: 'nodeName', width: 120 },
  { title: '发起时间', key: 'createdAt', width: 160 },
  {
    title: '操作', key: 'actions', width: 100,
    render(row) {
      return h(NButton, { size: 'tiny', type: 'primary', onClick: () => goApprove(row) }, () => '处理')
    },
  },
]

const doneColumns = [
  { title: '标题', key: 'instance.title', width: 200, render(row) { return row.instance?.title || '-' } },
  { title: '流程', key: 'instance.template.name', width: 140, render(row) { return row.instance?.template?.name || '-' } },
  { title: '节点', key: 'nodeName', width: 120 },
  {
    title: '处理结果', key: 'status', width: 80,
    render(row) {
      const labels = { approved: '通过', rejected: '驳回', transferred: '转交' }
      const types = { approved: 'success', rejected: 'error', transferred: 'info' }
      return h(NTag, { type: types[row.status] || 'default', size: 'small' }, () => labels[row.status] || row.status)
    },
  },
  { title: '处理时间', key: 'finishedAt', width: 160 },
]

onMounted(() => { loadData() })

async function loadData() {
  loading.value = true
  try {
    const params = { pageindex: pagination.page, pagesize: pagination.pageSize }
    if (activeTab.value === 'todo') {
      const res = await getTodoList(params)
      todoData.value = res.list || []
      pagination.itemCount = res.total || 0
    } else {
      const res = await getDoneList(params)
      doneData.value = res.list || []
      pagination.itemCount = res.total || 0
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function onTabChange() {
  pagination.page = 1
  loadData()
}

function goApprove(row) {
  router.push({ path: '/workflow/instance/detail', query: { id: row.instanceId } })
}
</script>
