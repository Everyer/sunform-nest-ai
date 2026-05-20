<template>
  <SyCard title="用户管理">
    <SyTable
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :show-create="false"
      @page-change="handlePageChange"
      @search="fetchData"
      @reset="resetSearch"
    >
      <template #search>
        <n-form-item label="用户名">
          <n-input v-model:value="searchForm.username" placeholder="用户名" clearable />
        </n-form-item>
      </template>
      <template #toolbar>
        <n-button type="primary" size="small" @click="openCreate">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          新增用户
        </n-button>
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
import { AddOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import md5 from 'js-md5'
import SyCard from '@/components/SyCard/index.vue'
import SyTable from '@/components/SyTable/index.vue'
import SyForm from '@/components/SyForm/index.vue'
import { getUserPage, getUserDetail, createUser, updateUser, deleteUser } from '@/api/user'
import { getRoleList } from '@/api/role'
import { getStaffList } from '@/api/staff'
import { formatDateTime } from '@/utils'
import { useUserStore } from '@/store/useUserStore'

const message = useMessage()
const userStore = useUserStore()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchForm = reactive({ username: '' })

const formVisible = ref(false)
const formTitle = ref('新增用户')
const formData = ref({})
const submitting = ref(false)
const roleOptions = ref([])
const staffOptions = ref([])
const isEdit = ref(false)

const formFields = computed(() => [
  { key: 'staffId', label: '员工', type: 'select', placeholder: '选择员工', options: staffOptions.value, rule: { required: true, message: '请选择员工' } },
  { key: 'username', label: '用户名', type: 'input', placeholder: '请输入用户名', rule: { required: true, message: '请输入用户名' } },
  { key: 'password', label: '密码', type: 'input', placeholder: '请输入密码', rule: { required: true, message: '请输入密码' } },
  { key: 'roleIds', label: '角色', type: 'select', placeholder: '选择角色', options: roleOptions.value, multiple: true, rule: { required: true, message: '请至少选择一个角色' } },
  { key: 'status', label: '状态', type: 'switch' },
  { key: 'sort', label: '排序', type: 'number', placeholder: '排序号' },
  { key: 'remark', label: '备注', type: 'input', placeholder: '备注信息' }
])

const columns = [
  { title: '用户名', key: 'username', width: 120 },
  { title: '员工', key: 'staff.staffName', width: 100 },
  { title: '部门', key: 'department.departmentName', width: 100 },
  {
    title: '角色', key: 'roles', width: 200,
    render: (row) => h('div', { style: 'display:flex;gap:4px;flex-wrap:wrap' },
      (row.roles || []).map(r => h(NTag, { size: 'tiny', bordered: false, color: { color: '#fef3c7', textColor: '#92400e' } }, { default: () => r.roleName }))
    )
  },
  {
    title: '状态', key: 'status', width: 70,
    render: (row) => h(NTag, { size: 'small', bordered: false, color: { color: row.status ? '#d1fae5' : '#f0f2f6', textColor: row.status ? '#065f46' : '#94a3b8' } }, { default: () => row.status ? '启用' : '禁用' })
  },
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
    const res = await getUserPage({ pageindex: page.value, pagesize: pageSize.value, ...searchForm })
    tableData.value = res.list || []
    total.value = res.total || 0
  } finally { loading.value = false }
}

function handlePageChange(p, ps) { page.value = p; pageSize.value = ps; fetchData() }
function resetSearch() { searchForm.username = ''; fetchData() }

async function loadUserOptions() {
  const [roles, staff] = await Promise.all([getRoleList(), getStaffList()])
  roleOptions.value = (roles || []).map(r => ({ label: r.roleName, value: r.id }))
  staffOptions.value = (staff || []).map(s => ({ label: s.staffName, value: s.id }))
}

async function openCreate() {
  isEdit.value = false
  formTitle.value = '新增用户'
  formData.value = { status: true, sort: 0 }
  await loadUserOptions()
  formVisible.value = true
}

async function openEdit(row) {
  isEdit.value = true
  formTitle.value = '编辑用户'
  await loadUserOptions()
  const detail = await getUserDetail(row.id)
  formData.value = { ...detail, roleIds: detail.roleIds || [] }
  formVisible.value = true
}

async function handleSubmit(data) {
  submitting.value = true
  try {
    const rawPwd = data.password || ''
    const pwdHashed = /^[a-f0-9]{32}$/.test(rawPwd) ? rawPwd : md5(rawPwd)
    const payload = {
      ...data,
      roleIds: data.roleIds || [],
      sort: Number(data.sort || 0),
      password: pwdHashed
    }
    if (isEdit.value) {
      await updateUser({ ...payload, id: formData.value.id })
      message.success('更新成功')
    } else {
      await createUser(payload)
      message.success('创建成功')
    }
    formVisible.value = false
    fetchData()
  } catch (e) { message.error(e.message || '操作失败') }
  finally { submitting.value = false }
}

async function handleDelete(id) {
  try { await deleteUser(id); message.success('删除成功'); fetchData() }
  catch (e) { message.error(e.message || '删除失败') }
}
</script>
