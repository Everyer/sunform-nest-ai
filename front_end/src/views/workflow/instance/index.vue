<template>
  <n-card title="我发起的" size="small" :bordered="false">
    <template #header-extra>
      <n-button type="primary" size="small" @click="goStart">发起流程</n-button>
    </template>

    <n-data-table
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :row-key="(row) => row.id"
      striped
    />
  </n-card>
</template>

<script setup>
import { ref, reactive, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NTag, NSpace } from 'naive-ui'
import { getInstancePage, withdrawInstance } from '@/api/workflow/instance'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])

const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 })

const statusColors = { draft: 'default', running: 'info', approved: 'success', rejected: 'error', cancelled: 'warning' }

const columns = [
  { title: '标题', key: 'title', width: 220 },
  {
    title: '流程模板', key: 'template', width: 140,
    render(row) { return row.template?.name || '-' },
  },
  {
    title: '状态', key: 'status', width: 80,
    render(row) {
      const labels = { draft: '草稿', running: '审批中', approved: '已通过', rejected: '已驳回', cancelled: '已撤回' }
      return h(NTag, { type: statusColors[row.status] || 'default', size: 'small' }, () => labels[row.status] || row.status)
    },
  },
  { title: '发起时间', key: 'createdAt', width: 160 },
  {
    title: '操作', key: 'actions', width: 200,
    render(row) {
      const btns = []
      if (row.status === 'draft') {
        btns.push(h(NButton, { size: 'tiny', type: 'primary', onClick: () => goEdit(row.id) }, () => '编辑'))
      } else {
        btns.push(h(NButton, { size: 'tiny', onClick: () => goDetail(row.id) }, () => '查看'))
      }
      if (row.status === 'running') {
        btns.push(h(NButton, { size: 'tiny', type: 'warning', onClick: () => handleWithdraw(row.id) }, () => '撤回'))
      }
      return h(NSpace, { size: 'small' }, () => btns)
    },
  },
]

onMounted(() => { loadData() })

function goStart() {
  router.push('/workflow/instance/start')
}

async function loadData() {
  loading.value = true
  try {
    const res = await getInstancePage({ pageindex: pagination.page, pagesize: pagination.pageSize })
    tableData.value = res.list || []
    pagination.itemCount = res.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function goDetail(id) { router.push({ path: '/workflow/instance/detail', query: { id } }) }
function goEdit(id) { router.push({ path: '/workflow/instance/start', query: { instanceId: id } }) }

async function handleWithdraw(id) {
  try {
    await withdrawInstance(id)
    window.$message?.success('已撤回')
    loadData()
  } catch (e) {
    window.$message?.error('撤回失败')
  }
}
</script>
