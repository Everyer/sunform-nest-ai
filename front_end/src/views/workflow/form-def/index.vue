<template>
  <n-card title="表单定义" size="small" :bordered="false">
    <template #header-extra>
      <n-button type="primary" size="small" @click="openCreate">新建表单</n-button>
    </template>

    <n-data-table
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :row-key="(row) => row.id"
      striped
    />

    <!-- Create/Edit modal -->
    <n-modal v-model:show="showForm" :title="editingId ? '编辑表单' : '新建表单'" preset="card" style="width: 720px">
      <n-spin :show="formLoading" description="加载中...">
        <n-tabs v-model:value="formTab" type="line">
          <n-tab-pane name="basic" tab="基本信息">
            <n-form ref="formRef" label-placement="left" label-width="100">
              <n-form-item label="表单名称" required>
                <n-input v-model:value="formModel.name" placeholder="如：请假单" />
              </n-form-item>
              <n-form-item label="表单编码" required>
                <n-input v-model:value="formModel.code" placeholder="如：leave_form" />
              </n-form-item>
              <n-form-item label="关联 Sunform 页面">
                <n-input v-model:value="formModel.sunformPageId" placeholder="Sunform 页面 ID（可选）" />
              </n-form-item>
              <n-form-item label="描述">
                <n-input v-model:value="formModel.description" type="textarea" :rows="2" />
              </n-form-item>
            </n-form>
          </n-tab-pane>
          <n-tab-pane name="fields" tab="表单字段">
            <div class="space-y-2">
              <div v-for="(field, idx) in formModel.fields" :key="idx" class="field-row">
                <n-input v-model:value="field.fieldKey" size="small" placeholder="字段标识" style="width: 120px" />
                <n-input v-model:value="field.fieldLabel" size="small" placeholder="显示名称" style="width: 140px" />
                <n-select
                  v-model:value="field.fieldType"
                  size="small"
                  :options="fieldTypeOptions"
                  placeholder="类型"
                  style="width: 100px"
                />
                <n-checkbox v-model:checked="field.required">必填</n-checkbox>
                <n-button text type="error" size="small" @click="removeField(idx)">
                  <template #icon><n-icon><TrashOutline /></n-icon></template>
                </n-button>
                <n-button text size="small" class="drag-handle">
                  <template #icon><n-icon><ReorderTwoOutline /></n-icon></template>
                </n-button>
              </div>
              <n-button size="tiny" dashed block @click="addField">+ 添加字段</n-button>
            </div>
          </n-tab-pane>
        </n-tabs>
      </n-spin>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showForm = false">取消</n-button>
          <n-button type="primary" :disabled="formLoading" @click="handleSaveForm">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script setup>
import { ref, reactive, h, onMounted } from 'vue'
import { NButton, NSpace, NPopconfirm, NCard, NDataTable, NModal, NTabs, NTabPane, NForm, NFormItem, NInput, NSelect, NCheckbox, NIcon, NSpin } from 'naive-ui'
import { TrashOutline, ReorderTwoOutline } from '@vicons/ionicons5'
import { getFormDefPage, getFormDefDetail, createFormDef, updateFormDef, deleteFormDef } from '@/api/workflow/form-def'

const loading = ref(false)
const formLoading = ref(false)
const tableData = ref([])
const showForm = ref(false)
const editingId = ref(null)
const formTab = ref('basic')

const pagination = reactive({ page: 1, pageSize: 10, itemCount: 0 })
const formModel = reactive({ name: '', code: '', sunformPageId: '', description: '', fields: [] })

const fieldTypeOptions = [
  { label: '文本', value: 'input' },
  { label: '数字', value: 'number' },
  { label: '下拉选择', value: 'select' },
  { label: '单选', value: 'radio' },
  { label: '多选', value: 'checkbox' },
  { label: '日期', value: 'date' },
  { label: '日期时间', value: 'datetime' },
  { label: '文本域', value: 'textarea' },
  { label: '附件', value: 'upload' },
]

const columns = [
  { title: '名称', key: 'name', width: 160 },
  { title: '编码', key: 'code', width: 150 },
  {
    title: '字段数', key: 'fields', width: 70,
    render(row) { return row.fields?.length || 0 },
  },
  { title: '描述', key: 'description', width: 200, ellipsis: { tooltip: true } },
  { title: '创建时间', key: 'createdAt', width: 160 },
  {
    title: '操作', key: 'actions', width: 160,
    render(row) {
      return h(NSpace, { size: 'small' }, () => [
        h(NButton, { size: 'tiny', onClick: () => handleEdit(row.id) }, () => '编辑'),
        h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
          trigger: () => h(NButton, { size: 'tiny', type: 'error' }, () => '删除'),
          default: () => '确定删除？',
        }),
      ])
    },
  },
]

onMounted(() => { loadData() })

async function loadData() {
  loading.value = true
  try {
    const res = await getFormDefPage({ pageindex: pagination.page, pagesize: pagination.pageSize })
    tableData.value = res.list || []
    pagination.itemCount = res.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  formTab.value = 'basic'
  Object.assign(formModel, { name: '', code: '', sunformPageId: '', description: '', fields: [] })
  showForm.value = true
}

async function handleEdit(id) {
  editingId.value = id
  formTab.value = 'basic'
  showForm.value = true
  formLoading.value = true
  try {
    const detail = await getFormDefDetail(id)
    Object.assign(formModel, {
      name: detail.name,
      code: detail.code,
      sunformPageId: detail.sunformPageId || '',
      description: detail.description || '',
      fields: (detail.fields || []).map(f => ({
        fieldKey: f.fieldKey,
        fieldLabel: f.fieldLabel,
        fieldType: f.fieldType || 'input',
        required: !!f.required,
      })),
    })
  } catch (e) {
    window.$message?.error('获取详情失败')
  } finally {
    formLoading.value = false
  }
}

function addField() {
  formModel.fields.push({ fieldKey: '', fieldLabel: '', fieldType: 'input', required: false })
}

function removeField(idx) {
  formModel.fields.splice(idx, 1)
}

async function handleSaveForm() {
  if (!formModel.name || !formModel.code) {
    window.$message?.warning('请填写表单名称和编码')
    return
  }
  try {
    const payload = { ...formModel }
    if (editingId.value) {
      await updateFormDef({ id: editingId.value, ...payload })
    } else {
      await createFormDef(payload)
    }
    window.$message?.success('保存成功')
    showForm.value = false
    editingId.value = null
    loadData()
  } catch (e) {
    window.$message?.error('保存失败')
  }
}

async function handleDelete(id) {
  try {
    await deleteFormDef(id)
    window.$message?.success('删除成功')
    loadData()
  } catch (e) {
    window.$message?.error('删除失败')
  }
}
</script>

<style scoped>
.field-row {
  display: flex; align-items: center; gap: 8px; padding: 6px 8px;
  background: #f8f9fc; border-radius: 6px; border: 1px solid #e8ecf2;
}
.drag-handle { cursor: grab; }
.drag-handge:active { cursor: grabbing; }
</style>
