<template>
  <div>
    <n-card title="流程模板" size="small" :bordered="false">
    <template #header-extra>
      <n-button type="primary" size="small" @click="goCreate">新建模板</n-button>
    </template>

    <n-space vertical :size="16">
      <!-- Filters -->
      <n-space>
        <n-input v-model:value="searchName" placeholder="搜索名称..." style="width: 200px" size="small" clearable @change="loadData" />
        <n-select v-model:value="searchCategory" :options="categoryOptions" placeholder="分类" size="small" style="width: 120px" clearable @update:value="loadData" />
        <n-select v-model:value="searchStatus" :options="statusOptions" placeholder="状态" size="small" style="width: 110px" clearable @update:value="loadData" />
        <n-button size="small" @click="loadData">刷新</n-button>
      </n-space>

      <!-- Table -->
      <n-data-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row) => row.id"
        striped
      />
    </n-space>
  </n-card>

  <TemplateEditor
    :visible="showEditor"
    :template-id="editingId"
    @close="closeEditor"
    @saved="onSaved"
  />
</div>
</template>

<script setup>
import { ref, reactive, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NTag, NSpace, NPopconfirm, NCard, NDataTable, NInput, NSelect } from 'naive-ui'
import { getTemplatePage, deleteTemplate, publishTemplate, deactivateTemplate } from '@/api/workflow/template'
import TemplateEditor from './editor.vue'

const router = useRouter()
const showEditor = ref(false)
const editingId = ref(null)

const searchName = ref('')
const searchCategory = ref(null)
const searchStatus = ref(null)
const loading = ref(false)
const tableData = ref([])

const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 })

const statusMap = { 0: { label: '草稿', type: 'info' }, 1: { label: '已发布', type: 'success' }, 2: { label: '已停用', type: 'default' } }
const categoryOptions = [{ label: '行政', value: '行政' }, { label: '财务', value: '财务' }, { label: '人事', value: '人事' }, { label: '其他', value: '其他' }]
const statusOptions = [{ label: '草稿', value: 0 }, { label: '已发布', value: 1 }, { label: '已停用', value: 2 }]

const columns = [
  { title: '名称', key: 'name', width: 200 },
  { title: '编码', key: 'code', width: 150 },
  { title: '分类', key: 'category', width: 80 },
  {
    title: '状态', key: 'status', width: 80,
    render(row) {
      const s = statusMap[row.status] || statusMap[0]
      return h(NTag, { type: s.type, size: 'small' }, () => s.label)
    },
  },
  { title: '版本', key: 'version', width: 60 },
  { title: '创建时间', key: 'createdAt', width: 160 },
  {
    title: '操作', key: 'actions', width: 240,
    render(row) {
      return h(NSpace, { size: 'small' }, () => [
        h(NButton, { size: 'tiny', onClick: () => goEdit(row.id) }, () => '编辑'),
        row.status === 1 && h(NButton, { size: 'tiny', type: 'primary', onClick: () => goStart(row.id) }, () => '发起'),
        (row.status === 0 || row.status === 2) && h(NButton, { size: 'tiny', onClick: () => handlePublish(row) }, () => '发布'),
        row.status === 1 && h(NButton, { size: 'tiny', type: 'warning', onClick: () => handleDeactivate(row) }, () => '停用'),
        h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
          trigger: () => h(NButton, { size: 'tiny', type: 'error' }, () => '删除'),
          default: () => '确定删除此模板？',
        }),
      ])
    },
  },
]

onMounted(() => { loadData() })

async function loadData() {
  loading.value = true
  try {
    const res = await getTemplatePage({
      pageindex: pagination.page,
      pagesize: pagination.pageSize,
      name: searchName.value || undefined,
      category: searchCategory.value || undefined,
      status: searchStatus.value !== null ? searchStatus.value : undefined,
    })
    tableData.value = res.list || []
    pagination.itemCount = res.total || 0
  } catch (e) {
    console.error('加载模板列表失败', e)
  } finally {
    loading.value = false
  }
}

function goCreate() {
  editingId.value = null
  showEditor.value = true
}
function goEdit(id) {
  editingId.value = id
  showEditor.value = true
}
function closeEditor() {
  showEditor.value = false
  editingId.value = null
}
function onSaved() {
  showEditor.value = false
  editingId.value = null
  loadData()
}
function goStart(id) {
  router.push({ path: '/workflow/instance/start', query: { templateId: id } })
}

async function handlePublish(row) {
  try {
    await publishTemplate(row.id)
    row.status = 1
    row.version += 1
    window.$message?.success('发布成功')
  } catch (e) {
    window.$message?.error('发布失败')
  }
}

async function handleDeactivate(row) {
  try {
    await deactivateTemplate(row.id)
    row.status = 2
    window.$message?.success('已停用')
  } catch (e) {
    window.$message?.error('操作失败')
  }
}

async function handleDelete(id) {
  try {
    await deleteTemplate(id)
    window.$message?.success('删除成功')
    loadData()
  } catch (e) {
    window.$message?.error('删除失败')
  }
}
</script>
