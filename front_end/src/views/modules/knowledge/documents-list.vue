<template>
  <div class="documents-list-container">
    <SyCard title="全局文档管理">
      <template #extra>
        <n-space>
          <n-input
            v-model:value="searchKeyword"
            placeholder="按文档名搜索"
            clearable
            style="width: 220px;"
          >
            <template #prefix>
              <n-icon><SearchOutline /></n-icon>
            </template>
          </n-input>
          <n-select
            v-model:value="statusFilter"
            :options="statusOptions"
            placeholder="状态"
            clearable
            style="width: 140px;"
          />
        </n-space>
      </template>

      <n-data-table
        :columns="columns"
        :data="filteredDocuments"
        :loading="loading"
        :bordered="false"
        :single-line="false"
        :pagination="pagination"
        :row-key="(row) => row.id"
      />
    </SyCard>

    <!-- 切片抽屉（复用 documents.vue 的渲染逻辑） -->
    <n-drawer v-model:show="drawerVisible" :width="640" placement="right">
      <n-drawer-content
        :title="`切片预览：${selectedDocTitle}`"
        closable
      >
        <n-skeleton v-if="drawerLoading" :repeat="3" />
        <n-empty v-else-if="chunks.length === 0" description="该文档尚无切片" />
        <div v-else>
          <div
            v-for="(chunk, index) in chunks"
            :key="chunk.id"
            class="chunk-card"
          >
            <div class="chunk-header">
              <n-tag size="small" type="info" round>切片 #{{ index + 1 }}</n-tag>
              <span class="chunk-meta">{{ chunk.content.length }} 字</span>
            </div>
            <div class="chunk-content">{{ chunk.content }}</div>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted, onUnmounted } from 'vue'
import {
  NDataTable,
  NSpace,
  NInput,
  NSelect,
  NButton,
  NIcon,
  NTag,
  NDrawer,
  NDrawerContent,
  NSkeleton,
  NEmpty,
  NPopconfirm,
  useMessage
} from 'naive-ui'
import {
  SearchOutline,
  DocumentTextOutline,
  EyeOutline,
  TrashOutline
} from '@vicons/ionicons5'
import SyCard from '@/components/SyCard/index.vue'
import { listAllDocuments, getDocumentChunks, deleteDocument } from '@/api/knowledge'
import { formatDateTime } from '@/utils'

const message = useMessage()

const loading = ref(false)
const documents = ref([])
const searchKeyword = ref('')
const statusFilter = ref(null)

const statusOptions = [
  { label: '解析中', value: 'parsing' },
  { label: '解析成功', value: 'success' },
  { label: '解析失败', value: 'failed' }
]

const pagination = { pageSize: 20 }

const filteredDocuments = computed(() => {
  return documents.value.filter((d) => {
    if (searchKeyword.value && !d.title.toLowerCase().includes(searchKeyword.value.toLowerCase())) {
      return false
    }
    if (statusFilter.value && d.status !== statusFilter.value) {
      return false
    }
    return true
  })
})

// === 表格列定义 ===
const columns = [
  {
    title: '文档标题',
    key: 'title',
    width: 240,
    render: (row) => h('div', { class: 'doc-title-cell' }, [
      h(NIcon, { size: 18, color: '#3b82f6', style: { marginRight: '8px', verticalAlign: 'middle' } }, { default: () => h(DocumentTextOutline) }),
      h('span', { style: { fontWeight: '600' } }, row.title)
    ])
  },
  {
    title: '所属知识库',
    key: 'baseName',
    width: 180,
    render: (row) => row.base?.name || h('span', { style: { color: '#999' } }, '-')
  },
  {
    title: '类型',
    key: 'type',
    width: 70,
    render: (row) => h(NTag, { size: 'small', bordered: false, type: 'info' }, { default: () => (row.type || '').toUpperCase() })
  },
  {
    title: '大小',
    key: 'size',
    width: 90,
    render: (row) => {
      const bytes = row.size || 0
      if (bytes < 1024) return bytes + ' B'
      return (bytes / 1024).toFixed(1) + ' KB'
    }
  },
  {
    title: '切片数',
    key: 'chunkCount',
    width: 80,
    render: (row) => {
      if (row.status === 'parsing') return h('span', { style: { color: '#f59e0b' } }, '解析中')
      return h(NTag, { size: 'small', round: true, type: row.chunkCount > 0 ? 'success' : 'default' }, { default: () => (row.chunkCount || 0) + ' 片' })
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const map = { parsing: ['warning', '解析中'], success: ['success', '已索引'], failed: ['error', '失败'] }
      const [type, text] = map[row.status] || ['default', '未知']
      return h(NTag, { size: 'small', round: true, type }, { default: () => text })
    }
  },
  {
    title: '导入时间',
    key: 'createdAt',
    width: 150,
    render: (row) => formatDateTime(row.createdAt)
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row) => h(NSpace, null, {
      default: () => [
        h(NButton, {
          size: 'tiny',
          quaternary: true,
          disabled: row.status === 'parsing',
          onClick: () => handleViewChunks(row)
        }, {
          icon: () => h(NIcon, null, { default: () => h(EyeOutline) }),
          default: () => '切片'
        }),
        h(NPopconfirm, {
          onPositiveClick: () => handleDelete(row)
        }, {
          trigger: () => h(NButton, {
            size: 'tiny',
            quaternary: true,
            type: 'error'
          }, {
            icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
            default: () => '删除'
          }),
          default: () => `确认删除 "${row.title}"？所有向量切片也会被清除。`
        })
      ]
    })
  }
]

// === 切片抽屉 ===
const drawerVisible = ref(false)
const drawerLoading = ref(false)
const chunks = ref([])
const selectedDocTitle = ref('')

async function handleViewChunks(row) {
  selectedDocTitle.value = row.title
  chunks.value = []
  drawerVisible.value = true
  drawerLoading.value = true
  try {
    const res = await getDocumentChunks(row.id)
    if (res.success) chunks.value = res.data || []
  } catch (err) {
    message.error('加载切片失败')
  } finally {
    drawerLoading.value = false
  }
}

// === 删除 ===
async function handleDelete(row) {
  try {
    await deleteDocument(row.id)
    message.success('已删除')
    await fetchAll()
  } catch (err) {
    message.error(err.message || '删除失败')
  }
}

// === 数据加载 ===
let pollingTimer = null

async function fetchAll() {
  loading.value = true
  try {
    const res = await listAllDocuments()
    if (res.success) {
      documents.value = res.data || []
    }
  } catch (err) {
    message.error(err.message || '获取文档列表失败')
  } finally {
    loading.value = false
  }
}

function startPolling() {
  stopPolling()
  pollingTimer = setInterval(async () => {
    await fetchAll()
    if (!documents.value.some((d) => d.status === 'parsing')) stopPolling()
  }, 3000)
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

onMounted(async () => {
  await fetchAll()
  if (documents.value.some((d) => d.status === 'parsing')) startPolling()
})

onUnmounted(stopPolling)
</script>

<style scoped>
.documents-list-container { padding: 0; }
.doc-title-cell { display: flex; align-items: center; }
.chunk-card {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  background: #fafafa;
}
.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.chunk-meta { color: #999; font-size: 12px; }
.chunk-content {
  font-size: 13px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
