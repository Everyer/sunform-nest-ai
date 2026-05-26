<template>
  <div class="print-template-manager" style="padding: 24px; background-color: #f8fafc; min-height: 100vh;">
    <!-- 顶部卡片：美观大气头部 -->
    <div style="background: linear-gradient(135deg, #0c1832 0%, #1e293b 100%); border-radius: 16px; padding: 24px; color: #ffffff; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(12, 24, 50, 0.15); display: flex; align-items: center; justify-content: space-between; position: relative; overflow: hidden;">
      <div style="position: relative; z-index: 2;">
        <h1 style="font-size: 24px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
          🖨️ 打印报表模板中台
        </h1>
        <p style="font-size: 13px; opacity: 0.8; margin: 0;">提供低代码可视化设计与多系统分类 (appId)、多端反射 (apiPath) 的万能解耦中台服务。</p>
      </div>
      <div style="position: relative; z-index: 2;">
        <button class="btn-create" @click="openDialog">
          + 新建打印模板
        </button>
      </div>
      <!-- 炫酷背景光晕 -->
      <div style="position: absolute; right: -50px; top: -50px; width: 200px; height: 200px; background: rgba(217, 119, 6, 0.15); filter: blur(50px); border-radius: 50%;"></div>
    </div>

    <!-- 过滤与搜索过滤栏 -->
    <div class="filter-card">
      <div class="search-inputs">
        <div class="input-group">
          <label>模板检索</label>
          <input type="text" v-model="searchQuery" placeholder="输入模板ID或名称进行检索..." @keyup.enter="loadData" />
        </div>
        <div class="input-group">
          <label>所属应用分类 (App ID)</label>
          <input type="text" v-model="appIdFilter" placeholder="如 app_erp_prod 筛选..." @keyup.enter="loadData" />
        </div>
        <div class="action-buttons">
          <button class="btn btn-primary" @click="loadData">查询</button>
          <button class="btn btn-secondary" @click="resetFilters">重置</button>
        </div>
      </div>
    </div>

    <!-- 列表数据表格 -->
    <div class="table-card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>模板名称</th>
              <th>唯一代码 (Template ID)</th>
              <th>关联数据源 (apiPath)</th>
              <th>所属应用分类 (App ID)</th>
              <th>纸张预设</th>
              <th>创建人</th>
              <th>更新时间</th>
              <th style="text-align: center;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.id">
              <td>
                <div style="font-weight: bold; color: #0c1832; font-size: 13.5px;">{{ item.templateName }}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">{{ item.remark || '暂无备注' }}</div>
              </td>
              <td>
                <code class="code-badge">{{ item.templateId }}</code>
              </td>
              <td>
                <span v-if="item.apiPath" class="path-badge" :title="item.apiPath">{{ item.apiPath }}</span>
                <span v-else style="color: #cbd5e1; font-size: 12px;">未关联接口</span>
              </td>
              <td>
                <span class="app-badge">{{ item.appId || '默认租户' }}</span>
              </td>
              <td>
                <span style="font-size: 12.5px; font-weight: 500; color: #334155;">
                  {{ item.paperSizePreset }} ({{ item.isLandscape ? '横向' : '纵向' }})
                </span>
              </td>
              <td>
                <span style="font-size: 12.5px; color: #475569;">
                  {{ item.createUser?.staff?.staffName || item.createUser?.username || '系统管理员' }}
                </span>
              </td>
              <td>
                <span style="font-size: 12px; color: #64748b;">{{ formatDate(item.updatedAt) }}</span>
              </td>
              <td style="text-align: center;">
                <div style="display: flex; gap: 8px; justify-content: center;">
                  <button class="action-link-btn edit" @click="handleDesign(item.id)">
                    ✏️ 设计排版
                  </button>
                  <button class="action-link-btn delete" @click="handleDelete(item.id)">
                    🗑️ 删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="list.length === 0 && !loading">
              <td colspan="8" style="text-align: center; padding: 48px 0; color: #64748b;">
                📭 暂未匹配到任何打印模板，点击右上角【新建打印模板】开启第一款高阶模板设计吧！
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页控制 -->
      <div class="pagination-area" v-if="total > 0">
        <span style="font-size: 13px; color: #64748b;">共 {{ total }} 条记录</span>
        <div style="display: flex; gap: 6px;">
          <button 
            class="page-btn" 
            :disabled="pageIndex === 1"
            @click="pageIndex--; loadData()"
          >
            上一页
          </button>
          <span style="align-self: center; font-size: 13px; padding: 0 12px; font-weight: bold; color: #0c1832;">
            {{ pageIndex }} / {{ Math.ceil(total / pageSize) }}
          </span>
          <button 
            class="page-btn" 
            :disabled="pageIndex >= Math.ceil(total / pageSize)"
            @click="pageIndex++; loadData()"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 🔑 纯手工精雕细琢高颜值「玻璃态毛玻璃遮罩 新建模板弹窗表单」 -->
    <div v-if="dialogVisible" class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-area">
            <span class="modal-icon">📄</span>
            <div>
              <h3>创建全新打印报表</h3>
              <p>可视化排版中台 · 自由绑定详情/从表数据源</p>
            </div>
          </div>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="required-field">模板名称</label>
            <input type="text" v-model="form.templateName" placeholder="例如：新版标准销货送货单" />
            <p class="form-tip">便于在后台列表中辨识此打印单据的中文名称描述。</p>
          </div>
          
          <div class="form-group">
            <label class="required-field">唯一标识代码 (Template ID)</label>
            <input type="text" v-model="form.templateId" placeholder="例如：tpl_sales_invoice" />
            <p class="form-tip">英文标识代码，用于其他子项目调用接口时直接做反射匹配检索。</p>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>所属应用分类 (App ID)</label>
              <input type="text" v-model="form.appId" placeholder="例如：app_erp_prod" />
            </div>
            <div class="form-group">
              <label>纸张预设规格</label>
              <select v-model="form.paperSizePreset" @change="onPaperPresetChange">
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="A3">A3 (297 × 420 mm)</option>
                <option value="A5">A5 (148 × 210 mm)</option>
                <option value="B5">B5 (176 × 250 mm)</option>
                <option value="custom">自定义规格</option>
              </select>
            </div>
          </div>

          <div class="form-row" v-if="form.paperSizePreset === 'custom'">
            <div class="form-group">
              <label>纸张宽度 (mm)</label>
              <input type="number" v-model.number="form.paperWidth" />
            </div>
            <div class="form-group">
              <label>纸张高度 (mm)</label>
              <input type="number" v-model.number="form.paperHeight" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>排版摆放方向</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input type="radio" :value="false" v-model="form.isLandscape" />
                  <span>纵向 (Portrait)</span>
                </label>
                <label class="radio-label">
                  <input type="radio" :value="true" v-model="form.isLandscape" />
                  <span>横向 (Landscape)</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>🔗 关联的远程数据源接口 (apiPath)</label>
            <input type="text" v-model="form.apiPath" placeholder="例如：/api/v1/sales/order/detail" />
            <p class="form-tip">绑定后，预览大弹窗会自动用当前 Token 加载该接口返回的万能嵌套 JSON 属性。</p>
          </div>

          <div class="form-group">
            <label>备注描述</label>
            <textarea v-model="form.remark" placeholder="录入此打印报表模板的一些辅助配置背景说明..." rows="2"></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" style="height: 40px; padding: 0 20px;" @click="closeDialog">取消</button>
          <button class="btn btn-primary" style="height: 40px; padding: 0 24px; box-shadow: 0 4px 10px rgba(217, 119, 6, 0.25);" @click="submitCreate">确认创建并设计</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPrintTemplatePage, deletePrintTemplate, createPrintTemplate } from '@/api/printTemplate'

const router = useRouter()

const list = ref([])
const total = ref(0)
const pageIndex = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const appIdFilter = ref('')
const loading = ref(false)

// 弹窗表单状态
const dialogVisible = ref(false)
const form = reactive({
  templateName: '',
  templateId: '',
  appId: 'default',
  apiPath: '/api/v1/business/detail',
  paperSizePreset: 'A4',
  paperWidth: 210,
  paperHeight: 297,
  isLandscape: false,
  remark: ''
})

const openDialog = () => {
  form.templateName = ''
  form.templateId = 'tpl_business_' + Math.random().toString(36).substr(2, 6)
  form.appId = 'default'
  form.apiPath = '/api/v1/business/detail'
  form.paperSizePreset = 'A4'
  form.paperWidth = 210
  form.paperHeight = 297
  form.isLandscape = false
  form.remark = ''
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
}

const onPaperPresetChange = () => {
  const preset = form.paperSizePreset
  if (preset === 'A4') {
    form.paperWidth = 210
    form.paperHeight = 297
  } else if (preset === 'A3') {
    form.paperWidth = 297
    form.paperHeight = 420
  } else if (preset === 'A5') {
    form.paperWidth = 148
    form.paperHeight = 210
  } else if (preset === 'B5') {
    form.paperWidth = 176
    form.paperHeight = 250
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPrintTemplatePage({
      pageindex: pageIndex.value,
      pagesize: pageSize.value,
      searchKey: searchQuery.value,
      appId: appIdFilter.value
    })
    list.value = res.list || []
    total.value = res.total || 0
  } catch (err) {
    window.$message?.error(err.message || '加载模板列表失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  appIdFilter.value = ''
  pageIndex.value = 1
  loadData()
}

// 提交创建模板
const submitCreate = async () => {
  if (!form.templateName.trim()) {
    window.$message?.warning('请输入模板中文名称！')
    return
  }
  if (!form.templateId.trim()) {
    window.$message?.warning('请输入模板唯一标识 ID 代码！')
    return
  }

  try {
    const defaultPayload = {
      templateId: form.templateId.trim(),
      templateName: form.templateName.trim(),
      apiPath: form.apiPath.trim(),
      paperSizePreset: form.paperSizePreset,
      paperWidth: form.paperWidth,
      paperHeight: form.paperHeight,
      isLandscape: form.isLandscape,
      gridSize: 5,
      pageMargins: JSON.stringify({ top: 10, bottom: 10, left: 10, right: 10 }),
      elementsJson: JSON.stringify([
        {
          id: 'el_title_' + Date.now(),
          type: 'text',
          x: 37, y: 37, width: 718, height: 45,
          value: form.templateName.trim(),
          fontSize: 22, fontColor: '#0c1832', fontWeight: 'bold', align: 'center', valign: 'middle', showStrategy: 'all'
        }
      ]),
      appId: form.appId.trim(),
      remark: form.remark.trim() || '中台表单快捷初始化'
    }
    const created = await createPrintTemplate(defaultPayload)
    window.$message?.success('打印模板创建成功！')
    closeDialog()
    
    // 跳转去设计师页面配置
    handleDesign(created.id)
  } catch (err) {
    window.$message?.error(err.message || '创建打印模板失败')
  }
}

const handleDesign = (id) => {
  router.push({
    path: '/print/designer',
    query: { id }
  })
}

const handleDelete = async (id) => {
  if (!window.confirm('您确定要彻底删除该打印模板吗？一旦删除，关联的外部项目打印渲染将被断开。')) return
  try {
    await deletePrintTemplate(id)
    window.$message?.success('删除成功！')
    loadData()
  } catch (err) {
    window.$message?.error(err.message || '删除失败')
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.filter-card, .table-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -1px rgba(0,0,0,0.02);
  border: 1px solid #e2e8f0;
}

.search-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 240px;
  flex: 1;
}

.input-group label {
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
}

.input-group input {
  height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13.5px;
  outline: none;
  transition: all 0.2s;
  color: #0f172a;
}

.input-group input:focus {
  border-color: #d97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn {
  height: 38px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #d97706;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #b45309;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

.btn-create {
  background-color: #d97706;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 13.5px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(217, 119, 6, 0.2);
}

.btn-create:hover {
  background-color: #ffffff;
  color: #0c1832;
  box-shadow: 0 6px 12px rgba(255,255,255,0.15);
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th {
  background-color: #f8fafc;
  padding: 12px 16px;
  font-size: 12.5px;
  font-weight: 700;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
}

td {
  padding: 14px 16px;
  border-bottom: 1px solid #edf2f7;
  font-size: 13px;
  color: #334155;
  vertical-align: middle;
}

tr:hover td {
  background-color: #f8fafc;
}

.code-badge {
  background-color: #eff6ff;
  color: #2563eb;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-weight: bold;
  font-size: 11.5px;
}

.path-badge {
  background-color: #f0fdf4;
  color: #16a34a;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  font-family: monospace;
  max-width: 180px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-badge {
  background-color: #fff7ed;
  color: #ea580c;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: bold;
}

.action-link-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: bold;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;
}

.action-link-btn.edit {
  color: #2563eb;
  background-color: #eff6ff;
}

.action-link-btn.edit:hover {
  background-color: #dbeafe;
}

.action-link-btn.delete {
  color: #dc2626;
  background-color: #fef2f2;
}

.action-link-btn.delete:hover {
  background-color: #fee2e2;
}

.pagination-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid #edf2f7;
}

.page-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
}

.page-btn:hover:not(:disabled) {
  border-color: #d97706;
  color: #d97706;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==========================================
   🔑 弹窗表单核心高级毛玻璃 CSS 样式体系
   ========================================== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

.modal-card {
  width: 580px;
  max-width: 90vw;
  max-height: 85vh;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 24px;
  background: rgba(217, 119, 6, 0.12);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid rgba(217, 119, 6, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 16.5px;
  font-weight: 800;
  color: #0f172a;
}

.modal-header p {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: #64748b;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.15s;
  line-height: 1;
}

.btn-close:hover {
  color: #0f172a;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  font-size: 12.5px;
  font-weight: 700;
  color: #334155;
}

.required-field::after {
  content: ' *';
  color: #dc2626;
}

.form-group input,
.form-group select,
.form-group textarea {
  height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  transition: all 0.15s;
  background-color: #ffffff;
}

.form-group select {
  cursor: pointer;
}

.form-group textarea {
  height: auto;
  padding: 8px 12px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #d97706;
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12);
}

.form-tip {
  font-size: 10.5px;
  color: #64748b;
  margin: 0;
}

.radio-group {
  display: flex;
  gap: 16px;
  height: 38px;
  align-items: center;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
}

.radio-label input {
  cursor: pointer;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #f8fafc;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
