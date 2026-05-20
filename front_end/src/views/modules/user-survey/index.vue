<template>
  <SyCard title="用户台账">
    <SyTable
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @page-change="handlePageChange"
      @search="fetchData"
      @reset="resetSearch"
      @create="openCreate"
    >
      <template #search>
        <n-form-item label="姓名">
          <n-input v-model:value="searchForm.name" placeholder="姓名" clearable />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="searchForm.mobile" placeholder="手机号码" clearable />
        </n-form-item>
        <n-form-item label="岗位意向">
          <n-input v-model:value="searchForm.postIntention" placeholder="岗位意向" clearable />
        </n-form-item>
      </template>
    </SyTable>

    <SyForm
      :show="formVisible"
      :title="formTitle"
      :fields="formFields"
      :initial-data="formData"
      :loading="submitting"
      @update:show="formVisible = $event"
      @submit="handleSubmit"
      @cancel="formVisible = false"
    />
  </SyCard>
</template>

<script setup>
import { ref, reactive, computed, h, onMounted } from 'vue'
import { NButton, NTag, NSpace, NIcon, useMessage, NFormItem, NInput, NCheckbox } from 'naive-ui'
import { AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import SyCard from '@/components/SyCard/index.vue'
import SyTable from '@/components/SyTable/index.vue'
import SyForm from '@/components/SyForm/index.vue'
import { getUserSurveyPage, getUserSurveyDetail, createUserSurvey, updateUserSurvey, deleteUserSurvey } from '@/api/userSurvey'
import { formatDateTime } from '@/utils'

const message = useMessage()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchForm = reactive({ name: '', mobile: '', postIntention: '' })

const formVisible = ref(false)
const formTitle = ref('新增台账')
const formData = ref({})
const submitting = ref(false)
const isEdit = ref(false)

const formFields = computed(() => [
  { key: 'name', label: '姓名', type: 'input', placeholder: '请输入姓名', rule: { required: true, message: '请输入姓名' } },
  { key: 'gender', label: '性别', type: 'select', placeholder: '请选择性别', options: [{ label: '男', value: '1' }, { label: '女', value: '0' }], rule: { required: true, message: '请选择性别' } },
  { key: 'age', label: '年龄', type: 'input', placeholder: '请输入年龄' },
  { key: 'mobile', label: '手机号码', type: 'input', placeholder: '请输入手机号码', rule: { required: true, message: '请输入手机号码' } },
  { key: 'address', label: '所在城市', type: 'input', placeholder: '请输入所在城市' },
  { key: 'postIntention', label: '岗位意向', type: 'input', placeholder: '请输入岗位意向' },
  { key: 'needAccommodation', label: '提供住宿', type: 'switch' },
  { key: 'needAccommodationAndTransportation', label: '食宿交通补贴', type: 'switch' },
  { key: 'remark', label: '备注', type: 'input', placeholder: '备注信息' }
])

const columns = [
  { title: '姓名', key: 'name', width: 90 },
  {
    title: '性别', key: 'gender', width: 60,
    render: (row) => h(NTag, { size: 'small', bordered: false, color: { color: '#f0f2f6', textColor: '#475569' } }, { default: () => row.gender === '1' ? '男' : row.gender === '0' ? '女' : row.gender })
  },
  { title: '年龄', key: 'age', width: 60 },
  { title: '手机号码', key: 'mobile', width: 120 },
  { title: '所在城市', key: 'address', width: 110 },
  { title: '岗位意向', key: 'postIntention', width: 100 },
  {
    title: '住宿', key: 'needAccommodation', width: 60,
    render: (row) => h(NTag, { size: 'small', bordered: false, color: { color: row.needAccommodation ? '#d1fae5' : '#f0f2f6', textColor: row.needAccommodation ? '#065f46' : '#94a3b8' } }, { default: () => row.needAccommodation ? '是' : '否' })
  },
  { title: '创建人', key: 'creator.username', width: 90 },
  { title: '创建时间', key: 'createdAt', width: 150, render: (row) => formatDateTime(row.createdAt) },
  {
    title: '', key: 'actions', width: 100,
    render: (row) => h(NSpace, null, {
      default: () => [
        h(NButton, { size: 'tiny', quaternary: true, onClick: () => openEdit(row) }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }), default: () => '编辑' }),
        h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(row.id) }, { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }), default: () => '删除' })
      ]
    })
  }
]

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try {
    const res = await getUserSurveyPage({ pageindex: page.value, pagesize: pageSize.value, ...searchForm })
    tableData.value = res.list || []
    total.value = res.total || 0
  } finally { loading.value = false }
}

function handlePageChange(p, ps) { page.value = p; pageSize.value = ps; fetchData() }
function resetSearch() { searchForm.name = ''; searchForm.mobile = ''; searchForm.postIntention = ''; fetchData() }

function openCreate() {
  isEdit.value = false
  formTitle.value = '新增台账'
  formData.value = { needAccommodation: false, needAccommodationAndTransportation: false }
  formVisible.value = true
}

async function openEdit(row) {
  isEdit.value = true
  formTitle.value = '编辑台账'
  const detail = await getUserSurveyDetail(row.id)
  formData.value = { ...detail }
  formVisible.value = true
}

async function handleSubmit(data) {
  submitting.value = true
  try {
    const payload = {
      ...data,
      needAccommodation: Boolean(data.needAccommodation),
      needAccommodationAndTransportation: Boolean(data.needAccommodationAndTransportation)
    }
    if (isEdit.value) {
      await updateUserSurvey({ ...payload, id: formData.value.id })
      message.success('更新成功')
    } else {
      await createUserSurvey(payload)
      message.success('创建成功')
    }
    formVisible.value = false
    fetchData()
  } catch (e) { message.error(e.message || '操作失败') }
  finally { submitting.value = false }
}

async function handleDelete(id) {
  try { await deleteUserSurvey(id); message.success('删除成功'); fetchData() }
  catch (e) { message.error(e.message || '删除失败') }
}
</script>
