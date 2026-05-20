<template>
  <SyCard title="员工管理">
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
        <n-form-item label="员工姓名">
          <n-input v-model:value="searchForm.staffName" placeholder="姓名" clearable />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="searchForm.mobile" placeholder="手机号" clearable />
        </n-form-item>
      </template>
    </SyTable>

    <n-modal v-model:show="formVisible" :title="formTitle" preset="card" :style="{ width: '640px' }" :mask-closable="false">
      <n-form ref="formRef" :model="formData" label-placement="left" label-width="100">
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="员工姓名" path="staffName" :rule="{ required: true, message: '必填' }">
              <n-input v-model:value="formData.staffName" placeholder="请输入" maxlength="50" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="员工编码" path="staffCode" :rule="{ required: true, message: '必填' }">
              <n-input v-model:value="formData.staffCode" placeholder="唯一编码" maxlength="50" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="所属部门" path="deptId" :rule="{ required: true, message: '必选' }">
              <n-tree-select v-model:value="formData.deptId" :options="deptTree" placeholder="选择部门" clearable key-field="id" label-field="departmentName" children-field="children" :to="false" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="岗位" path="postId" :rule="{ required: true, message: '必选' }">
              <n-select v-model:value="formData.postId" :options="postList" placeholder="选择岗位" clearable />
            </n-form-item>
          </n-col>
        </n-row>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="手机号" path="mobile" :rule="{ required: true, message: '必填' }">
              <n-input v-model:value="formData.mobile" placeholder="手机号" maxlength="20" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="邮箱" path="email" :rule="{ required: true, message: '必填' }">
              <n-input v-model:value="formData.email" placeholder="邮箱" maxlength="100" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="性别" path="gender" :rule="{ required: true, message: '必选' }">
              <n-select v-model:value="formData.gender" :options="genderOptions" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="身份证" path="idCard" :rule="[{ required: true, message: '必填' }, { max: 18, message: '最多18位' }]">
              <n-input v-model:value="formData.idCard" placeholder="身份证号" maxlength="18" />
            </n-form-item>
          </n-col>
        </n-row>
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
import { ref, reactive, h, onMounted } from 'vue'
import { NButton, NTag, NSpace, NIcon, NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NSwitch, NTreeSelect, NRow, NCol, useMessage } from 'naive-ui'
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'
import SyCard from '@/components/SyCard/index.vue'
import SyTable from '@/components/SyTable/index.vue'
import { getStaffPage, getStaffDetail, createStaff, updateStaff, deleteStaff } from '@/api/staff'
import { getDepartmentTree } from '@/api/department'
import { getPostList } from '@/api/post'
import { formatDateTime } from '@/utils'

const message = useMessage()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchForm = reactive({ staffName: '', mobile: '' })

const formRef = ref(null)
const formVisible = ref(false)
const formTitle = ref('新增员工')
const formData = ref({})
const submitting = ref(false)
const isEdit = ref(false)
const deptTree = ref([])
const postList = ref([])

const genderOptions = [{ label: '男', value: '1' }, { label: '女', value: '0' }]

const columns = [
  { title: '姓名', key: 'staffName', width: 90 },
  { title: '编码', key: 'staffCode', width: 100 },
  { title: '部门', key: 'department.departmentName', width: 110 },
  { title: '岗位', key: 'post.postName', width: 100 },
  { title: '手机号', key: 'mobile', width: 120 },
  { title: '邮箱', key: 'email', width: 160 },
  {
    title: '性别', key: 'gender', width: 60,
    render: (row) => h(NTag, { size: 'tiny', bordered: false, color: { color: row.gender === '1' ? '#e0e7ff' : '#fce7f3', textColor: row.gender === '1' ? '#4338ca' : '#be185d' } }, { default: () => row.gender === '1' ? '男' : '女' })
  },
  {
    title: '状态', key: 'status', width: 70,
    render: (row) => h(NTag, { size: 'small', bordered: false, color: { color: row.status ? '#d1fae5' : '#f0f2f6', textColor: row.status ? '#065f46' : '#94a3b8' } }, { default: () => row.status ? '启用' : '禁用' })
  },
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
    const res = await getStaffPage({ pageindex: page.value, pagesize: pageSize.value, ...searchForm })
    tableData.value = res.list || []
    total.value = res.total || 0
  } finally { loading.value = false }
}

function handlePageChange(p, ps) { page.value = p; pageSize.value = ps; fetchData() }
function resetSearch() { searchForm.staffName = ''; searchForm.mobile = ''; fetchData() }

async function openCreate() {
  isEdit.value = false
  formTitle.value = '新增员工'
  formData.value = { staffName: '', staffCode: '', deptId: null, postId: null, mobile: '', email: '', gender: '1', idCard: '', status: true, sort: 0, remark: '' }
  const [tree, posts] = await Promise.all([getDepartmentTree(), getPostList()])
  deptTree.value = tree || []
  postList.value = (posts || []).map(p => ({ label: p.postName, value: p.id }))
  formVisible.value = true
}

async function openEdit(row) {
  isEdit.value = true
  formTitle.value = '编辑员工'
  const [tree, posts, detail] = await Promise.all([getDepartmentTree(), getPostList(), getStaffDetail(row.id)])
  deptTree.value = tree || []
  postList.value = (posts || []).map(p => ({ label: p.postName, value: p.id }))
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
      await updateStaff({ ...payload, id: formData.value.id })
      message.success('更新成功')
    } else {
      await createStaff(payload)
      message.success('创建成功')
    }
    formVisible.value = false
    fetchData()
  } catch (e) { message.error(e.message || '操作失败') }
  finally { submitting.value = false }
}

async function handleDelete(id) {
  try { await deleteStaff(id); message.success('删除成功'); fetchData() }
  catch (e) { message.error(e.message || '删除失败') }
}
</script>
