<template>
  <SyCard title="字典管理">
    <SyTable
      :columns="columns"
      :data="treeData"
      :loading="loading"
      :row-key="rowKey"
      :tree="true"
      :show-create="true"
      @create="openCreate()"
    />

    <n-modal v-model:show="formVisible" :title="formTitle" preset="card" :style="{ width: '540px' }" :mask-closable="false">
      <n-form ref="formRef" :model="formData" label-placement="left" label-width="100">
        <n-form-item label="上级字典" path="pid">
          <n-tree-select v-model:value="formData.pid" :options="treeOptions" placeholder="留空为顶级" clearable key-field="id" label-field="label" children-field="children" />
        </n-form-item>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="字典名称" path="label" :rule="{ required: true, message: '必填' }">
              <n-input v-model:value="formData.label" placeholder="请输入字典名称" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="字典值" path="value" :rule="{ required: true, message: '必填' }">
              <n-input v-model:value="formData.value" placeholder="唯一编码" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-form-item label="颜色" path="color">
          <n-input v-model:value="formData.color" placeholder="如 #1890ff" />
        </n-form-item>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="状态" path="status">
              <n-switch v-model:value="formData.status" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="排序" path="sort">
              <n-input-number v-model:value="formData.sort" :min="0" placeholder="排序号" style="width:100%" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-form-item label="备注" path="remark">
          <n-input v-model:value="formData.remark" placeholder="备注" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="formVisible = false">取消</n-button>
          <n-button type="primary" :loading="submitting" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </SyCard>
</template>

<script setup>
import { ref, h, onMounted, computed } from 'vue'
import { NButton, NTag, NSpace, NIcon, NModal, NForm, NFormItem, NInput, NInputNumber, NSwitch, NTreeSelect, NRow, NCol, useMessage } from 'naive-ui'
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'
import SyCard from '@/components/SyCard/index.vue'
import SyTable from '@/components/SyTable/index.vue'
import { getDictTree, getDictDetail, createDict, updateDict, deleteDict } from '@/api/dict'
import { formatDateTime } from '@/utils'

const message = useMessage()
const loading = ref(false)
const treeData = ref([])
const formRef = ref(null)
const formVisible = ref(false)
const formTitle = ref('新增字典')
const formData = ref({})
const submitting = ref(false)
const isEdit = ref(false)

const rowKey = (row) => row.id
const treeOptions = computed(() => treeData.value)

const columns = [
  { title: '字典名称', key: 'label', width: 180 },
  { title: '字典值', key: 'value', width: 120 },
  { title: '排序', key: 'sort', width: 60 },
  {
    title: '状态', key: 'status', width: 70,
    render: (row) => h(NTag, { size: 'small', bordered: false, color: { color: row.status ? '#d1fae5' : '#f0f2f6', textColor: row.status ? '#065f46' : '#94a3b8' } }, { default: () => row.status ? '启用' : '禁用' })
  },
  { title: '创建时间', key: 'createdAt', width: 150, render: (row) => formatDateTime(row.createdAt) },
  {
    title: '', key: 'actions', width: 180,
    render: (row) => h(NSpace, null, {
      default: () => [
        h(NButton, { size: 'tiny', quaternary: true, onClick: () => openCreate(row) }, { default: () => '添加子级' }),
        h(NButton, { size: 'tiny', quaternary: true, onClick: () => openEdit(row) }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }), default: () => '编辑' }),
        h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(row.id) }, { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }), default: () => '删除' })
      ]
    })
  }
]

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try { treeData.value = await getDictTree() } finally { loading.value = false }
}

function openCreate(parent) {
  isEdit.value = false
  formTitle.value = parent ? `新增子字典（父：${parent.label}）` : '新增字典'
  formData.value = { pid: parent?.id || null, label: '', value: '', color: '', status: true, sort: 0, remark: '' }
  formVisible.value = true
}

async function openEdit(row) {
  isEdit.value = true
  formTitle.value = '编辑字典'
  const [detail, tree] = await Promise.all([getDictDetail(row.id), getDictTree()])
  treeData.value = tree || []
  formData.value = { ...detail }
  formVisible.value = true
}

async function handleSubmit() {
  const errors = await new Promise(resolve => formRef.value?.validate(resolve))
  if (errors) return
  submitting.value = true
  try {
    const payload = { ...formData.value, sort: Number(formData.value.sort || 0) }
    if (isEdit.value) {
      await updateDict({ ...payload, id: formData.value.id })
      message.success('更新成功')
    } else {
      await createDict(payload)
      message.success('创建成功')
    }
    formVisible.value = false
    fetchData()
  } catch (e) { message.error(e.message || '操作失败') }
  finally { submitting.value = false }
}

async function handleDelete(id) {
  try { await deleteDict(id); message.success('删除成功'); fetchData() }
  catch (e) { message.error(e.message || '删除失败') }
}
</script>
