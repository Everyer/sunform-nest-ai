<template>
  <SyCard title="入职管理">
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
        <n-form-item label="联系电话">
          <n-input v-model:value="searchForm.mobile" placeholder="联系电话" clearable />
        </n-form-item>
        <n-form-item label="入职地点">
          <n-input v-model:value="searchForm.location" placeholder="入职地点" clearable />
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
import { NButton, NTag, NSpace, NIcon, useMessage, NFormItem, NInput } from 'naive-ui'
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'
import SyCard from '@/components/SyCard/index.vue'
import SyTable from '@/components/SyTable/index.vue'
import SyForm from '@/components/SyForm/index.vue'
import { getOnboardingPage, getOnboardingDetail, createOnboarding, updateOnboarding, deleteOnboarding } from '@/api/onboarding'
import { getStaffList } from '@/api/staff'
import { formatDateTime } from '@/utils'

const message = useMessage()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchForm = reactive({ mobile: '', location: '' })

const formVisible = ref(false)
const formTitle = ref('新增入职')
const formData = ref({})
const submitting = ref(false)
const isEdit = ref(false)
const staffOptions = ref([])

const formFields = computed(() => [
  { key: 'userSurveyId', label: '台账ID', type: 'input', placeholder: '请选择台账记录', rule: { required: true, message: '请输入台账ID' } },
  { key: 'onboardingDate', label: '入职日期', type: 'input', placeholder: '例: 2024-01-01', rule: { required: true, message: '请输入入职日期' } },
  { key: 'mobile', label: '联系电话', type: 'input', placeholder: '请输入联系电话', rule: { required: true, message: '请输入联系电话' } },
  { key: 'hrStaffId', label: '人资对接人', type: 'select', placeholder: '请选择人资对接人', options: staffOptions.value, rule: { required: true, message: '请选择人资对接人' } },
  { key: 'source', label: '信息来源', type: 'input', placeholder: '请输入信息来源' },
  { key: 'location', label: '入职地点', type: 'input', placeholder: '请输入入职地点', rule: { required: true, message: '请输入入职地点' } },
  { key: 'rentalStatus', label: '租赁状态', type: 'input', placeholder: '请输入租赁状态', rule: { required: true, message: '请输入租赁状态' } },
  { key: 'rentWithBattery', label: '租金+电池', type: 'input', placeholder: '请输入租金+电池' },
  { key: 'rentWithVehicle', label: '租金+车', type: 'input', placeholder: '请输入租金+车' },
  { key: 'rentalStaffId', label: '租车对接人', type: 'select', placeholder: '请选择租车对接人', options: staffOptions.value, rule: { required: true, message: '请选择租车对接人' } },
  { key: 'hasPhoneCard', label: '办电话卡', type: 'switch' },
  { key: 'paymentMethod', label: '收款方式', type: 'input', placeholder: '请输入收款方式', rule: { required: true, message: '请输入收款方式' } },
  { key: 'remark', label: '备注', type: 'input', placeholder: '备注信息' }
])

const columns = [
  { title: '姓名', key: 'userSurvey.name', width: 80 },
  { title: '入职日期', key: 'onboardingDate', width: 100 },
  { title: '联系电话', key: 'mobile', width: 120 },
  { title: '入职地点', key: 'location', width: 100 },
  {
    title: '租赁状态', key: 'rentalStatusName', width: 90,
    render: (row) => h(NTag, { size: 'small', bordered: false, color: { color: '#fef3c7', textColor: '#92400e' } }, { default: () => row.rentalStatusName || row.rentalStatus })
  },
  { title: '人资对接人', key: 'hrStaff.staffName', width: 90 },
  { title: '租车对接人', key: 'rentalStaff.staffName', width: 90 },
  {
    title: '电话卡', key: 'hasPhoneCard', width: 60,
    render: (row) => h(NTag, { size: 'small', bordered: false, color: { color: row.hasPhoneCard ? '#d1fae5' : '#f0f2f6', textColor: row.hasPhoneCard ? '#065f46' : '#94a3b8' } }, { default: () => row.hasPhoneCard ? '是' : '否' })
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
    const res = await getOnboardingPage({ pageindex: page.value, pagesize: pageSize.value, ...searchForm })
    tableData.value = res.list || []
    total.value = res.total || 0
  } finally { loading.value = false }
}

function handlePageChange(p, ps) { page.value = p; pageSize.value = ps; fetchData() }
function resetSearch() { searchForm.mobile = ''; searchForm.location = ''; fetchData() }

function openCreate() {
  isEdit.value = false
  formTitle.value = '新增入职'
  formData.value = { hasPhoneCard: false }
  formVisible.value = true
}

async function loadStaffOptions() {
  const staff = await getStaffList()
  staffOptions.value = (staff || []).map(s => ({ label: s.staffName, value: s.id }))
}

async function openEdit(row) {
  isEdit.value = true
  formTitle.value = '编辑入职'
  await loadStaffOptions()
  const detail = await getOnboardingDetail(row.id)
  formData.value = { ...detail, hasPhoneCard: !!detail.hasPhoneCard }
  formVisible.value = true
}

async function handleSubmit(data) {
  submitting.value = true
  try {
    const payload = { ...data, hasPhoneCard: Boolean(data.hasPhoneCard) }
    if (isEdit.value) {
      await updateOnboarding({ ...payload, id: formData.value.id })
      message.success('更新成功')
    } else {
      await createOnboarding(payload)
      message.success('创建成功')
    }
    formVisible.value = false
    fetchData()
  } catch (e) { message.error(e.message || '操作失败') }
  finally { submitting.value = false }
}

async function handleDelete(id) {
  try { await deleteOnboarding(id); message.success('删除成功'); fetchData() }
  catch (e) { message.error(e.message || '删除失败') }
}
</script>
