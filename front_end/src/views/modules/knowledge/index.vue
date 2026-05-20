<template>
  <div class="knowledge-container">
    <SyCard title="智能知识库中心">
      <template #header-extra>
        <n-button type="primary" secondary @click="openCreate">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          新建知识库
        </n-button>
      </template>

      <!-- 骨架屏加载 -->
      <div v-if="loading" style="padding: 24px;">
        <n-grid :cols="24" :x-gutter="20" :y-gutter="20">
          <n-grid-item :span="8" v-for="i in 3" :key="i">
            <n-card>
              <n-skeleton text :repeat="2" />
              <n-skeleton text style="width: 60%" />
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>

      <!-- 空数据状态 -->
      <div v-else-if="bases.length === 0" class="empty-state">
        <n-empty description="当前暂无知识库，立即创建一个吧！">
          <template #extra>
            <n-button type="primary" @click="openCreate">创建第一个知识库</n-button>
          </template>
        </n-empty>
      </div>

      <!-- 知识库卡片列表 -->
      <div v-else class="cards-grid">
        <n-grid :cols="24" :x-gutter="20" :y-gutter="20" item-responsive>
          <n-grid-item 
            :span="24" 
            :m="12" 
            :l="8" 
            v-for="base in bases" 
            :key="base.id"
          >
            <div class="premium-card">
              <div class="card-bg-gradient"></div>
              <div class="card-content">
                <!-- 头部 -->
                <div class="card-header">
                  <div class="icon-wrapper">
                    <n-icon size="26" color="#3b82f6"><BookOutline /></n-icon>
                  </div>
                  <div class="title-section">
                    <h3 class="base-name">{{ base.name }}</h3>
                    <n-tag size="small" :type="base.status === 'active' ? 'success' : 'default'" round>
                      {{ base.status === 'active' ? '启用中' : '已禁用' }}
                    </n-tag>
                  </div>
                </div>

                <!-- 描述 -->
                <p class="base-desc">{{ base.description || '暂无描述信息...' }}</p>

                <!-- 统计指标 (Bento Grid 样式) -->
                <div class="stats-bar">
                  <div class="stat-item">
                    <span class="stat-val">{{ base.documents ? base.documents.length : 0 }}</span>
                    <span class="stat-label">关联文档</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-val">{{ formatTotalChunks(base.documents) }}</span>
                    <span class="stat-label">向量切片</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-val">{{ formatTotalSize(base.documents) }}</span>
                    <span class="stat-label">库大小</span>
                  </div>
                </div>

                <!-- 底部操作区 -->
                <div class="card-actions">
                  <n-button 
                    type="primary" 
                    size="medium" 
                    style="flex: 1;" 
                    @click="manageDocs(base)"
                  >
                    <template #icon>
                      <n-icon><FolderOpenOutline /></n-icon>
                    </template>
                    管理文档 & 搜索
                  </n-button>
                  
                  <n-space :size="8">
                    <n-button circle secondary @click="openEdit(base)">
                      <template #icon>
                        <n-icon><CreateOutline /></n-icon>
                      </template>
                    </n-button>
                    <n-button circle secondary type="error" @click="handleDelete(base)">
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
          <n-input v-model:value="formData.name" placeholder="例如：产品说明书、HR规章制度" />
        </n-form-item>
        <n-form-item label="描述内容" path="description">
          <n-input
            v-model:value="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入知识库的背景、包含文档类别等描述信息"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="modalVisible = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">
            确认创建
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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
  TrashOutline
} from '@vicons/ionicons5'
import SyCard from '@/components/SyCard/index.vue'
import { listBases, createBase, updateBase, deleteBase } from '@/api/knowledge'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const bases = ref([])
const modalVisible = ref(false)
const modalTitle = ref('新建知识库')
const submitting = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const formData = reactive({
  id: '',
  name: '',
  description: ''
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
  // 跳转到文档管理页面，并通过 Query 传参
  router.push({
    path: '/modules/knowledge/documents',
    query: {
      baseId: base.id,
      baseName: base.name
    }
  })
}

// === 统计数值智能处理方法 ===
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
  padding: 4px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 350px;
}

/* 高端精美卡片样式 */
.premium-card {
  position: relative;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  height: 290px;
}

.premium-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.4);
}

.card-bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
}

.card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.base-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.base-desc {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0 0 18px 0;
  height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Bento Grid 统计栏 */
.stats-bar {
  display: grid;
  grid-template-cols: repeat(3, 1fr);
  background: rgba(241, 245, 249, 0.7);
  border-radius: 12px;
  padding: 10px;
  gap: 6px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(226, 232, 240, 0.8);
}

.stat-item:last-child {
  border-right: none;
}

.stat-val {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
}

.card-actions {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 黑暗模式支持适配 */
@media (prefers-color-scheme: dark) {
  .premium-card {
    background: rgba(30, 41, 59, 0.7);
    border-color: rgba(51, 65, 85, 0.8);
  }
  .base-name {
    color: #f8fafc;
  }
  .base-desc {
    color: #94a3b8;
  }
  .stats-bar {
    background: rgba(15, 23, 42, 0.5);
  }
  .stat-val {
    color: #f8fafc;
  }
  .stat-label {
    color: #64748b;
  }
}
</style>
