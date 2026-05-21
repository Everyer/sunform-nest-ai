<template>
  <div class="documents-container">
    <div v-if="!isModal" class="header-action-bar">
      <n-button secondary @click="goBack">
        <template #icon>
          <n-icon><ArrowBackOutline /></n-icon>
        </template>
        返回知识库中心
      </n-button>
      <div class="base-info-title">
        <n-icon size="20" color="#3b82f6" style="margin-right: 8px;"><BookOutline /></n-icon>
        <span>知识库：<strong>{{ baseName || '管理中心' }}</strong></span>
      </div>
    </div>

    <n-tabs type="line" animated size="large">
      <!-- TAB 1: 文档资源管理 -->
      <n-tab-pane name="docs" tab="📂 文档资源列表">
        <SyCard title="文档资源">
          <template #extra>
            <n-button type="primary" @click="openUpload">
              <template #icon>
                <n-icon><CloudUploadOutline /></n-icon>
              </template>
              导入新文档
            </n-button>
          </template>

          <n-data-table
            :columns="columns"
            :data="documents"
            :loading="loading"
            :bordered="false"
            :single-line="false"
          />
        </SyCard>
      </n-tab-pane>

      <!-- TAB 2: 🚀 向量语义检索测试 -->
      <n-tab-pane name="search" tab="🚀 向量语义匹配测试 (AI Playground)">
        <div class="search-layout" :class="{ 'in-modal': isModal }">
          <!-- 左侧：搜索输入区 -->
          <div class="search-panel-card">
            <h3 class="panel-title">向量语义检索</h3>
            <p class="panel-subtitle">
              使用 <strong>MiniMax embo-01</strong> 向量模型进行 <strong>1536 维</strong>语义编码，
              通过 PostgreSQL <strong>pgvector</strong> 余弦相似度在知识库中精准召回最相关切片。
            </p>

            <n-form label-placement="top">
              <n-form-item label="请输入匹配问题 / 搜索短语">
                <n-input
                  v-model:value="searchQuery.queryText"
                  type="textarea"
                  :rows="5"
                  placeholder="例如：员工迟到了怎么处理？"
                  clearable
                />
              </n-form-item>
              <n-form-item label="召回切片数量 (Top-K)">
                <div class="slider-wrapper">
                  <n-slider
                    v-model:value="searchQuery.limit"
                    :min="1"
                    :max="10"
                    :step="1"
                    style="flex: 1;"
                  />
                  <span class="slider-val">{{ searchQuery.limit }} 片</span>
                </div>
              </n-form-item>
              <n-button
                type="primary"
                block
                size="large"
                :loading="searching"
                :disabled="!searchQuery.queryText.trim()"
                @click="handleSemanticSearch"
              >
                <template #icon>
                  <n-icon><SearchOutline /></n-icon>
                </template>
                开始语义检索
              </n-button>
            </n-form>
          </div>

          <!-- 右侧：检索结果区 -->
          <div class="search-results-section">
            <h3 class="panel-title">
              检索结果
              <span v-if="searchResults.length > 0" class="result-count-badge">
                召回 {{ searchResults.length }} 片
              </span>
            </h3>

            <div v-if="searchResults.length === 0" class="no-results-box">
              <n-empty description="在左侧输入问题，点击「开始语义检索」获取最相关知识片段" />
            </div>

            <div v-else class="results-list">
              <div
                v-for="(chunk, index) in searchResults"
                :key="chunk.id"
                class="chunk-result-card"
              >
                <div class="chunk-header">
                  <div class="chunk-badge">Rank #{{ index + 1 }}</div>
                  <div class="source-tag">
                    <n-icon size="14" style="margin-right: 4px;"><DocumentTextOutline /></n-icon>
                    {{ chunk.documentTitle }}
                  </div>
                </div>

                <div class="chunk-body-text">
                  {{ chunk.content }}
                </div>

                <div class="chunk-footer-metric">
                  <span class="metric-label">语义匹配度:</span>
                  <span class="metric-val">{{ formatSimilarityScore(chunk.cosDistance) }}%</span>
                </div>
                <n-progress
                  type="line"
                  status="success"
                  :percentage="parseFloat(formatSimilarityScore(chunk.cosDistance))"
                  :show-indicator="false"
                  processing
                  height="6"
                  style="margin-top: 6px;"
                />
              </div>
            </div>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 导入新文档弹窗 -->
    <n-modal
      v-model:show="uploadModalVisible"
      title="导入新文档数据 (支持文本切片 & 向量生成)"
      preset="card"
      style="width: 680px;"
      :mask-closable="false"
    >
      <n-form
        ref="uploadFormRef"
        :model="uploadData"
        label-placement="top"
      >
        <n-row :gutter="16">
          <n-col :span="16">
            <n-form-item
              label="文档标题"
              path="title"
              :rule="{ required: true, message: '请输入文档标题', trigger: 'blur' }"
            >
              <n-input v-model:value="uploadData.title" placeholder="例如：产品知识库常见问题解答.txt" />
            </n-form-item>
          </n-col>
          <n-col :span="8">
            <n-form-item label="文档类型" path="type">
              <n-select
                v-model:value="uploadData.type"
                :options="[
                  { label: 'Plain Text (.txt)', value: 'txt' },
                  { label: 'Markdown (.md)', value: 'md' }
                ]"
              />
            </n-form-item>
          </n-col>
        </n-row>

        <n-form-item
          label="文档核心正文内容 (支持直接粘贴大文本，系统将自动按350字窗口滚动切片并构建多维嵌入向量)"
          path="content"
          :rule="{ required: true, message: '请输入文档正文内容', trigger: 'blur' }"
        >
          <n-input
            v-model:value="uploadData.content"
            type="textarea"
            :rows="12"
            placeholder="在此粘贴文档的完整文本内容..."
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="uploadModalVisible = false">取消</n-button>
          <n-button type="primary" :loading="uploading" @click="handleUploadSubmit">
            开始导入并启动 AI 向量切片解析
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 查看切片详情侧边抽屉 -->
    <n-drawer v-model:show="drawerVisible" :width="560" placement="right">
      <n-drawer-content :title="`文档切片详情：${selectedDocTitle}`" closable>
        <div v-if="drawerLoading" style="padding: 20px;">
          <n-skeleton text :repeat="6" />
        </div>
        <div v-else-if="chunks.length === 0" style="padding: 20px; text-align: center;">
          <n-empty description="当前暂无切片" />
        </div>
        <div v-else class="drawer-chunks-list">
          <div 
            v-for="(chunk, idx) in chunks" 
            :key="chunk.id" 
            class="drawer-chunk-card"
          >
            <div class="drawer-chunk-header">
              <span class="chunk-index">切片 #{{ idx + 1 }}</span>
              <span class="chunk-time">创建于 {{ formatTime(chunk.createdAt) }}</span>
            </div>
            <div class="drawer-chunk-body">
              {{ chunk.content }}
            </div>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NIcon,
  NTabs,
  NTabPane,
  NDataTable,
  NTag,
  NSpace,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NRow,
  NCol,
  NGrid,
  NGridItem,
  NSlider,
  NProgress,
  NDrawer,
  NDrawerContent,
  NSkeleton,
  NEmpty,
  useMessage,
  useDialog
} from 'naive-ui'
import {
  ArrowBackOutline,
  BookOutline,
  CloudUploadOutline,
  SearchOutline,
  DocumentTextOutline,
  TrashOutline,
  EyeOutline
} from '@vicons/ionicons5'
import SyCard from '@/components/SyCard/index.vue'
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
  getDocumentChunks,
  searchSimilarChunks
} from '@/api/knowledge'
import { formatDateTime } from '@/utils'

const props = defineProps({
  baseId: {
    type: String,
    default: ''
  },
  baseName: {
    type: String,
    default: ''
  },
  isModal: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const baseId = computed(() => props.baseId || route.query.baseId || '')
const baseName = computed(() => props.baseName || route.query.baseName || '')

const loading = ref(false)
const documents = ref([])

// 语义检索
const searching = ref(false)
const searchResults = ref([])
const searchQuery = reactive({
  queryText: '',
  limit: 4
})

// 文档上传
const uploadModalVisible = ref(false)
const uploading = ref(false)
const uploadFormRef = ref(null)
const uploadData = reactive({
  title: '',
  type: 'txt',
  content: ''
})

// 查看切片抽屉
const drawerVisible = ref(false)
const drawerLoading = ref(false)
const chunks = ref([])
const selectedDocTitle = ref('')

const columns = [
  {
    title: '文档标题',
    key: 'title',
    width: 200,
    render: (row) => h('div', { class: 'doc-title-cell' }, [
      h(NIcon, { size: 18, color: '#3b82f6', style: { marginRight: '8px', verticalAlign: 'middle' } }, { default: () => h(DocumentTextOutline) }),
      h('span', { style: { fontWeight: '600' } }, row.title)
    ])
  },
  {
    title: '类型',
    key: 'type',
    width: 70,
    render: (row) => h(NTag, { size: 'small', bordered: false, type: 'info' }, { default: () => row.type.toUpperCase() })
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
    title: '字符数',
    key: 'charCount',
    width: 90,
    render: (row) => row.charCount || 0
  },
  {
    title: '向量分片',
    key: 'chunkCount',
    width: 90,
    render: (row) => {
      if (row.status === 'parsing') return h('span', { style: { color: '#f59e0b' } }, '正在分词中...')
      return h(NTag, { size: 'small', round: true, type: row.chunkCount > 0 ? 'success' : 'default' }, { default: () => row.chunkCount + ' 片' })
    }
  },
  {
    title: '解析状态',
    key: 'status',
    width: 100,
    render: (row) => {
      let type = 'default'
      let text = '未知'
      if (row.status === 'parsing') {
        type = 'warning'
        text = '解析中'
      } else if (row.status === 'success') {
        type = 'success'
        text = '解析成功'
      } else if (row.status === 'failed') {
        type = 'error'
        text = '解析失败'
      }
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
    width: 150,
    render: (row) => h(NSpace, null, {
      default: () => [
        h(
          NButton,
          { 
            size: 'tiny', 
            quaternary: true, 
            disabled: row.status === 'parsing', 
            onClick: () => handleViewChunks(row) 
          },
          { 
            icon: () => h(NIcon, null, { default: () => h(EyeOutline) }),
            default: () => '查看切片' 
          }
        ),
        h(
          NButton,
          { 
            size: 'tiny', 
            quaternary: true, 
            type: 'error', 
            onClick: () => handleDeleteDoc(row) 
          },
          { 
            icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
            default: () => '删除' 
          }
        )
      ]
    })
  }
]

// 持续轮询定时器
let pollingTimer = null

onMounted(async () => {
  if (baseId.value) {
    await fetchDocuments()
    // 页面加载时如果有文档正在解析，自动启动轮询
    const hasParsing = documents.value.some(d => d.status === 'parsing')
    if (hasParsing) startPolling()
  } else if (!props.isModal) {
    message.error('无效的知识库参数')
    goBack()
  }
})

onUnmounted(() => {
  stopPolling()
})

// 监听 baseId，在 Modal 模式下如果 baseId 动态变化，能够自动刷新数据
watch(() => baseId.value, async (newVal) => {
  if (newVal) {
    await fetchDocuments()
    const hasParsing = documents.value.some(d => d.status === 'parsing')
    if (hasParsing) startPolling()
    else stopPolling()
  }
})

// 启动轮询：每 3 秒检查一次，直到无 parsing 状态文档为止
function startPolling() {
  stopPolling()
  pollingTimer = setInterval(async () => {
    await fetchDocuments()
    const hasParsing = documents.value.some(d => d.status === 'parsing')
    if (!hasParsing) {
      stopPolling()
    }
  }, 3000)
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

async function fetchDocuments() {
  loading.value = true
  try {
    const res = await listDocuments(baseId.value)
    if (res.success) {
      documents.value = res.data || []
    }
  } catch (err) {
    message.error(err.message || '获取文档列表失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/modules/knowledge')
}

// === 上传导入 ===
function openUpload() {
  uploadData.title = ''
  uploadData.type = 'txt'
  uploadData.content = ''
  uploadModalVisible.value = true
}

async function handleUploadSubmit() {
  uploadFormRef.value?.validate(async (errors) => {
    if (errors) return
    uploading.value = true
    try {
      const res = await uploadDocument({
        baseId: baseId.value,
        title: uploadData.title,
        type: uploadData.type,
        content: uploadData.content
      })
      if (res.success) {
        message.success('文档已开始异步解析，AI 正在构建语义向量切片，请稍候...')
        uploadModalVisible.value = false
        fetchDocuments()
        // 启动持续轮询，直到解析完成自动停止
        startPolling()
      }
    } catch (err) {
      message.error(err.message || '文档导入失败')
    } finally {
      uploading.value = false
    }
  })
}

// === 删除文档 ===
function handleDeleteDoc(row) {
  dialog.warning({
    title: '危险警示',
    content: `确定要永久删除文档 "${row.title}" 吗？此操作将立即在 PostgreSQL 向量数据库中抹除其所有切片，不可恢复！`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteDocument(row.id)
        message.success('文档及其所有向量切片已彻底抹除')
        fetchDocuments()
      } catch (err) {
        message.error(err.message || '删除失败')
      }
    }
  })
}

// === 查看切片 ===
async function handleViewChunks(row) {
  selectedDocTitle.value = row.title
  chunks.value = []
  drawerVisible.value = true
  drawerLoading.value = true
  try {
    const res = await getDocumentChunks(row.id)
    if (res.success) {
      chunks.value = res.data || []
    }
  } catch (err) {
    message.error('加载切片数据失败')
  } finally {
    drawerLoading.value = false
  }
}

// === 语义检索 ===
async function handleSemanticSearch() {
  searching.value = true
  searchResults.value = []
  try {
    const res = await searchSimilarChunks({
      baseId: baseId.value,
      queryText: searchQuery.queryText,
      limit: searchQuery.limit
    })
    if (res.success) {
      searchResults.value = res.data || []
      if (searchResults.value.length === 0) {
        message.warning('未匹配到任何高相似度切片，请确认是否有已成功解析的文档。')
      } else {
        message.success(`成功召回 ${searchResults.value.length} 个最佳匹配语义切片！`)
      }
    }
  } catch (err) {
    message.error(err.message || '语义匹配计算失败')
  } finally {
    searching.value = false
  }
}

// === 相似度得分格式化 ===
function formatSimilarityScore(cosDistance) {
  if (cosDistance === undefined || cosDistance === null) return '0.0'
  // cosDistance 在 pgvector 中为 [0, 2]，其中 0 代表完全相似，2 代表完全相反。
  // 我们做一个友好的比例分数，如: 1 - distance，再乘100。
  // 如果距离小于0，分数为100；如果距离大于1，分数为低值。
  const score = Math.max(0, 1 - cosDistance) * 100
  return score.toFixed(1)
}

function formatTime(val) {
  return formatDateTime(val)
}
</script>

<style scoped>
.documents-container {
  padding: 4px;
}

.header-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  background: white;
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.base-info-title {
  display: flex;
  align-items: center;
  font-size: 1.05rem;
  color: #334155;
}

.base-info-title strong {
  color: #1e293b;
}

.doc-title-cell {
  display: flex;
  align-items: center;
}

/* AI Playground 固定左右布局 */
.search-layout {
  display: flex;
  gap: 20px;
  align-items: stretch;        /* 左右等高 */
  height: calc(100vh - 240px); /* 动态计算高度，自适应撑满屏幕剩余空间 */
  min-height: 600px;           /* 保证最小高度，避免在矮屏幕上内容溢出 */
}

/* Modal 内展示时的布局高度适配 */
.search-layout.in-modal {
  height: 520px;
  min-height: auto;
}

/* AI Playground 面板样式 */
.search-panel-card {
  flex: 0 0 360px;
  width: 360px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-title {
  margin: 0 0 10px 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.panel-subtitle {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24px;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.slider-val {
  font-size: 0.85rem;
  font-weight: 600;
  color: #3b82f6;
  min-width: 60px;
}

/* 匹配排序 */
.search-results-section {
  flex: 1;
  min-width: 0;
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-count-badge {
  font-size: 0.72rem;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  padding: 3px 10px;
  border-radius: 20px;
}

.panel-subtitle {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.slider-val {
  font-size: 0.85rem;
  font-weight: 600;
  color: #3b82f6;
  min-width: 60px;
}

/* 匹配排序 */
.search-results-section {
  flex: 1;
  min-width: 0;
  min-height: 0;               /* 关键：允许 flex 子元素收缩 */
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  overflow: hidden;            /* 防止卡片被内容撑开 */
}

.no-results-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  margin-top: 16px;
}

.results-list {
  flex: 1;                     /* 占满右侧卡片剩余高度 */
  min-height: 0;               /* 关键：没有这个 flex 子元素不会收缩 */
  overflow-y: auto;            /* 超出内容可滚动 */
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 16px;
  padding-right: 6px;
}

/* 自定义滚动条样式，使其更精致 premium */
.results-list::-webkit-scrollbar,
.chunk-body-text::-webkit-scrollbar {
  width: 6px;
}
.results-list::-webkit-scrollbar-track,
.chunk-body-text::-webkit-scrollbar-track {
  background: transparent;
}
.results-list::-webkit-scrollbar-thumb,
.chunk-body-text::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}
.results-list::-webkit-scrollbar-thumb:hover,
.chunk-body-text::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* 玻璃态高亮匹配卡片 */
.chunk-result-card {
  position: relative;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  padding: 18px;
  transition: all 0.3s ease;
}

.chunk-result-card:hover {
  transform: translateY(-2px);
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.08);
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chunk-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
}

.source-tag {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  color: #64748b;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chunk-body-text {
  font-size: 0.88rem;
  color: #334155;
  line-height: 1.6;
  white-space: pre-wrap;
  background: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(241, 245, 249, 1);
  max-height: 250px;
  overflow-y: auto;
}

.chunk-footer-metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
}

.metric-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.metric-val {
  font-size: 0.85rem;
  font-weight: 700;
  color: #10b981;
}

/* 抽屉切片样式 */
.drawer-chunks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-chunk-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
}

.drawer-chunk-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.chunk-index {
  font-weight: 700;
  color: #3b82f6;
}

.drawer-chunk-body {
  font-size: 0.85rem;
  color: #334155;
  line-height: 1.5;
  white-space: pre-wrap;
}

/* 黑暗模式支持适配 */
@media (prefers-color-scheme: dark) {
  .header-action-bar,
  .search-panel-card,
  .search-results-section {
    background: #1e293b;
    border-color: #334155;
  }
  .base-info-title,
  .panel-title {
    color: #f8fafc;
  }
  .panel-subtitle {
    color: #94a3b8;
  }
  .no-results-box {
    border-color: #334155;
  }
  .chunk-result-card {
    background: rgba(30, 41, 59, 0.5);
    border-color: #334155;
  }
  .chunk-body-text {
    background: #0f172a;
    border-color: #1e293b;
    color: #cbd5e1;
  }
  .drawer-chunk-card {
    background: #1e293b;
    border-color: #334155;
  }
  .drawer-chunk-body {
    color: #cbd5e1;
  }
}
</style>
