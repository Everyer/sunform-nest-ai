<template>
  <div class="knowledge-container">
    <SyCard title="智能知识库中心">
      <!-- 顶部操作与筛选栏 -->
      <div class="toolbar-section">
        <div class="search-box">
          <n-input
            v-model:value="searchKeyword"
            placeholder="输入知识库名称或描述进行搜索..."
            clearable
            style="width: 320px;"
          >
            <template #prefix>
              <n-icon><SearchOutline /></n-icon>
            </template>
          </n-input>
        </div>
        <n-button type="primary" @click="openCreate">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          创建新知识库
        </n-button>
      </div>

      <!-- 骨架屏加载 -->
      <div v-if="loading" style="padding: 24px 0;">
        <n-grid cols="1 s:2 m:3 l:4" responsive="screen" :x-gutter="16" :y-gutter="16">
          <n-grid-item v-for="i in 4" :key="i">
            <n-card>
              <n-skeleton text :repeat="2" />
              <n-skeleton text style="width: 60%" />
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>

      <!-- 空数据状态 -->
      <div v-else-if="filteredBases.length === 0" class="empty-state">
        <n-empty :description="searchKeyword ? '未找到符合搜索条件的知识库' : '当前暂无知识库，立即创建一个吧！'">
          <template #extra>
            <n-button v-if="!searchKeyword" type="primary" @click="openCreate">创建第一个知识库</n-button>
            <n-button v-else secondary @click="searchKeyword = ''">清空搜索条件</n-button>
          </template>
        </n-empty>
      </div>

      <!-- 知识库卡片列表 -->
      <div v-else class="cards-grid">
        <n-grid cols="1 s:2 m:3 l:3 xl:4" responsive="screen" :x-gutter="20" :y-gutter="20">
          <n-grid-item 
            v-for="base in filteredBases" 
            :key="base.id"
          >
            <div class="base-card">
              <!-- 彩色渐变顶部条 -->
              <div class="card-accent-bar"></div>
              
              <div class="card-body">
                <!-- 头部：图标 + 标题 + 状态 -->
                <div class="card-head">
                  <div class="icon-box">
                    <n-icon size="24" color="#2563eb"><BookOutline /></n-icon>
                  </div>
                  <div class="title-box">
                    <h3 class="base-title" :title="base.name">{{ base.name }}</h3>
                    <div class="status-row">
                      <n-tag size="small" :type="base.status === 'active' ? 'success' : 'warning'" :bordered="false" round>
                        {{ base.status === 'active' ? '已启用' : '已禁用' }}
                      </n-tag>
                    </div>
                  </div>
                </div>

                <!-- 描述内容 -->
                <div class="card-desc">
                  {{ base.description || '无描述。点击下方管理文档按钮以导入文本或进行语义向量匹配测试。' }}
                </div>

                <!-- 统计面板 (Bento Box 样式) -->
                <div class="card-stats">
                  <div class="stat-block">
                    <div class="stat-num">{{ base.documents ? base.documents.length : 0 }}</div>
                    <div class="stat-lbl">关联文档</div>
                  </div>
                  <div class="stat-block">
                    <div class="stat-num">{{ formatTotalChunks(base.documents) }}</div>
                    <div class="stat-lbl">向量切片</div>
                  </div>
                  <div class="stat-block">
                    <div class="stat-num">{{ formatTotalSize(base.documents) }}</div>
                    <div class="stat-lbl">数据大小</div>
                  </div>
                </div>

                <!-- 底部操作区 (彻底暴露，绝无溢出隐藏问题) -->
                <div class="card-footer">
                  <n-button 
                    type="primary" 
                    secondary
                    style="flex: 1; font-weight: 600;" 
                    @click="manageDocs(base)"
                  >
                    <template #icon>
                      <n-icon><FolderOpenOutline /></n-icon>
                    </template>
                    管理文档 & 检索
                  </n-button>
                  
                  <n-space :size="8">
                    <n-button 
                      quaternary 
                      circle 
                      type="info"
                      title="编辑知识库"
                      @click="openEdit(base)"
                    >
                      <template #icon>
                        <n-icon><CreateOutline /></n-icon>
                      </template>
                    </n-button>
                    <n-button 
                      quaternary 
                      circle 
                      type="error"
                      title="删除知识库"
                      @click="handleDelete(base)"
                    >
                      <template #icon>
                        <n-icon><TrashOutline /></n-icon>
                      </template>
                    </n-button>
                  </n-space>
                </div>
              </div>
            </div>
          </n-grid-item>
        </n-grid>
      </div>
    </SyCard>

    <!-- 新增 / 编辑弹窗 -->
    <n-modal
      v-model:show="modalVisible"
      :title="modalTitle"
      preset="card"
      style="width: 500px;"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="formData"
        label-placement="left"
        label-width="100"
      >
        <n-form-item
          label="知识库名称"
          path="name"
          :rule="{ required: true, message: '请输入知识库名称', trigger: 'blur' }"
        >
          <n-input v-model:value="formData.name" placeholder="请输入知识库名称，例如：产品FAQ手册" />
        </n-form-item>
        <n-form-item label="描述介绍" path="description">
          <n-input
            v-model:value="formData.description"
            type="textarea"
            :rows="3"
            placeholder="简单描述一下这个知识库的用途、背景等"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="modalVisible = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">
            确定
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 文档管理与语义检索大弹窗 -->
    <n-modal
      v-model:show="docModalVisible"
      preset="card"
      style="width: 1300px; max-width: 96vw; --n-body-padding: 0 24px 24px 24px;"
      :title="`知识库文档管理 & 检索 - ${selectedBaseName}`"
      :mask-closable="false"
      @after-leave="fetchBases"
    >
      <DocumentsView
        v-if="docModalVisible"
        :base-id="selectedBaseId"
        :base-name="selectedBaseName"
        :is-modal="true"
      />
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NGrid,
  NGridItem,
  NCard,
  NButton,
  NIcon,
  NTag,
  NSpace,
  NEmpty,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSkeleton,
  useMessage,
  useDialog
} from 'naive-ui'
import {
  AddOutline,
  BookOutline,
  FolderOpenOutline,
  CreateOutline,
  TrashOutline,
  SearchOutline
} from '@vicons/ionicons5'
import SyCard from '@/components/SyCard/index.vue'
import { listBases, createBase, updateBase, deleteBase } from '@/api/knowledge'
import DocumentsView from './documents.vue'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const bases = ref([])
const searchKeyword = ref('')
const modalVisible = ref(false)
const modalTitle = ref('新建知识库')
const submitting = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const docModalVisible = ref(false)
const selectedBaseId = ref('')
const selectedBaseName = ref('')

const formData = reactive({
  id: '',
  name: '',
  description: ''
})

// 根据搜索关键词过滤知识库
const filteredBases = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return bases.value
  return bases.value.filter(
    b => 
      b.name.toLowerCase().includes(keyword) || 
      (b.description && b.description.toLowerCase().includes(keyword))
  )
})

onMounted(() => {
  fetchBases()
})

async function fetchBases() {
  loading.value = true
  try {
    const res = await listBases()
    if (res.success) {
      bases.value = res.data || []
    }
  } catch (err) {
    message.error(err.message || '获取知识库列表失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  isEdit.value = false
  modalTitle.value = '新建知识库'
  formData.id = ''
  formData.name = ''
  formData.description = ''
  modalVisible.value = true
}

function openEdit(base) {
  isEdit.value = true
  modalTitle.value = '编辑知识库'
  formData.id = base.id
  formData.name = base.name
  formData.description = base.description
  modalVisible.value = true
}

async function handleSubmit() {
  formRef.value?.validate(async (errors) => {
    if (errors) return
    submitting.value = true
    try {
      if (isEdit.value) {
        await updateBase({
          id: formData.id,
          name: formData.name,
          description: formData.description
        })
        message.success('知识库更新成功')
      } else {
        await createBase({
          name: formData.name,
          description: formData.description
        })
        message.success('知识库创建成功')
      }
      modalVisible.value = false
      fetchBases()
    } catch (err) {
      message.error(err.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

function handleDelete(base) {
  dialog.warning({
    title: '危险警示',
    content: `确定要永久删除知识库 "${base.name}" 吗？此操作将一并销毁其下全部文档及其AI分词向量，不可恢复！`,
    positiveText: '狠心删除',
    negativeText: '手下留情',
    onPositiveClick: async () => {
      try {
        await deleteBase(base.id)
        message.success('知识库及关联数据已彻底清除')
        fetchBases()
      } catch (err) {
        message.error(err.message || '删除失败')
      }
    }
  })
}

function manageDocs(base) {
  selectedBaseId.value = base.id
  selectedBaseName.value = base.name
  docModalVisible.value = true
}

function formatTotalChunks(documents) {
  if (!documents || documents.length === 0) return 0
  return documents.reduce((acc, doc) => acc + (doc.chunkCount || 0), 0)
}

function formatTotalSize(documents) {
  if (!documents || documents.length === 0) return '0 KB'
  const bytes = documents.reduce((acc, doc) => acc + (doc.size || 0), 0)
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.knowledge-container {
  padding: 8px;
}

.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 350px;
}

/* 高保真优雅知识库卡片 */
.base-card {
  position: relative;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.base-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.3);
}

.card-accent-bar {
  height: 4px;
  width: 100%;
  background: linear-gradient(90deg, #2563eb, #8b5cf6);
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.title-box {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.base-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-row {
  display: flex;
  align-items: center;
}

.card-desc {
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 16px 0;
  min-height: 48px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 优雅的数据面板统计 (横向平铺) */
.card-stats {
  display: flex;
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 6px;
  gap: 4px;
  margin-bottom: 18px;
  border: 1px solid #f1f5f9;
}

.stat-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e2e8f0;
}

.stat-block:last-child {
  border-right: none;
}

.stat-num {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-lbl {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 2px;
}

/* 按钮操作区：完全暴露在底部，没有被遮挡问题 */
.card-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto; /* 保证底部对齐 */
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
}

/* 黑暗模式自适应 */
@media (prefers-color-scheme: dark) {
  .toolbar-section {
    background: #1e293b;
    border-color: #334155;
  }
  .base-card {
    background: #1e293b;
    border-color: #334155;
  }
  .base-card:hover {
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
    border-color: rgba(37, 99, 235, 0.5);
  }
  .base-title {
    color: #f8fafc;
  }
  .card-desc {
    color: #94a3b8;
  }
  .card-stats {
    background: #0f172a;
    border-color: #1e293b;
  }
  .stat-num {
    color: #f8fafc;
  }
  .stat-lbl {
    color: #64748b;
  }
  .card-footer {
    border-top-color: #334155;
  }
}
</style>
