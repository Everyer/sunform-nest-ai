<template>
  <SyCard title="角色管理">
    <SyTable
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @create="openCreate"
      @page-change="handlePageChange"
      @search="fetchData"
      @reset="resetSearch"
    >
      <template #search>
        <n-form-item label="角色名称">
          <n-input v-model:value="searchForm.roleName" placeholder="角色名称" clearable />
        </n-form-item>
      </template>
    </SyTable>

    <n-modal v-model:show="formVisible" :title="formTitle" preset="card" :style="{ width: '600px' }" :mask-closable="false" class="role-modal">
      <n-form ref="formRef" :model="formData" label-placement="left" label-width="100">
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="角色名称" path="roleName" :rule="{ required: true, message: '必填' }">
              <n-input v-model:value="formData.roleName" placeholder="请输入角色名称" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="排序" path="sort">
              <n-input-number v-model:value="formData.sort" :min="0" placeholder="排序号" style="width:100%" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-form-item label="权限字符" path="roleKey">
          <n-input v-model:value="formData.roleKey" placeholder='例如: ["admin"]' />
        </n-form-item>
        <n-form-item label="数据权限" path="dataScope" :rule="{ required: true, message: '必选' }">
          <n-select v-model:value="formData.dataScope" :options="scopeOptions" placeholder="选择数据权限" />
        </n-form-item>
        <n-form-item v-if="formData.dataScope === '3'" label="授权部门" path="departmentIds" :rule="{ required: true, message: '请选择部门' }">
          <n-tree-select
            v-model:value="formData.departmentIds"
            :options="deptTree"
            multiple
            cascade
            check-strategy="all"
            placeholder="选择可访问部门"
            clearable
            key-field="id"
            label-field="departmentName"
            children-field="children"
            :to="false"
            @update:value="formRef.value?.restoreValidation()"
          />
        </n-form-item>
        <n-form-item label="菜单权限" path="menuIds" :rule="{ required: true, message: '至少选择一个菜单', trigger: 'change', validator: () => (formData.menuIds || []).length > 0 }">
          <div class="menu-tree-box">
            <n-tree
              :data="menuTree"
              checkable
              :checked-keys="formData.menuIds || []"
              :default-expand-all="true"
              key-field="id"
              label-field="name"
              children-field="children"
              @update:checked-keys="(keys) => formData.menuIds = keys"
            />
          </div>
        </n-form-item>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="状态" path="status">
              <n-switch v-model:value="formData.status" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="备注" path="remark">
              <n-input v-model:value="formData.remark" placeholder="备注信息" />
            </n-form-item>
          </n-col>
        </n-row>
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
import { NButton, NTag, NSpace, NIcon, NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NSwitch, NTree, NTreeSelect, NRow, NCol, useMessage } from 'naive-ui'
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'
import SyCard from '@/components/SyCard/index.vue'
import SyTable from '@/components/SyTable/index.vue'
import { getRolePage, getRoleDetail, createRole, updateRole, deleteRole } from '@/api/role'
import { getMenuTree } from '@/api/menu'
import { getDepartmentTree } from '@/api/department'
import { formatDateTime } from '@/utils'

const message = useMessage()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchForm = reactive({ roleName: '' })

const formRef = ref(null)
const formVisible = ref(false)
const formTitle = ref('新增角色')
const formData = ref({})
const submitting = ref(false)
const isEdit = ref(false)
const menuTree = ref([])
const deptTree = ref([])

const scopeOptions = [
  { label: '本人', value: '0' },
  { label: '本部门及以下', value: '1' },
  { label: '本部门', value: '2' },
  { label: '自定义', value: '3' },
  { label: '全部', value: '4' }
]

const columns = [
  { title: '角色名称', key: 'roleName', width: 130 },
  {
    title: '权限字符', key: 'roleKey', width: 180,
    render: (row) => {
      const keys = Array.isArray(row.roleKey) ? row.roleKey : (typeof row.roleKey === 'string' ? [row.roleKey] : [])
      return h('div', { style: 'display:flex;gap:4px;flex-wrap:wrap' },
        keys.map(k => h(NTag, { size: 'tiny', bordered: false, color: { color: '#f0f2f6', textColor: '#475569' } }, { default: () => k }))
      )
    }
  },
  {
    title: '数据权限', key: 'dataScope', width: 110,
    render: (row) => {
      const map = { '0': { label: '本人', color: '#f0f2f6', text: '#475569' }, '1': { label: '本部门及以下', color: '#e0e7ff', text: '#4338ca' }, '2': { label: '本部门', color: '#fef3c7', text: '#92400e' }, '3': { label: '自定义', color: '#d1fae5', text: '#065f46' }, '4': { label: '全部', color: '#0c1832', text: '#fff' } }
      const s = map[row.dataScope] || { label: row.dataScope, color: '#f0f2f6', text: '#475569' }
      return h(NTag, { size: 'small', bordered: false, color: { color: s.color, textColor: s.text } }, { default: () => s.label })
    }
  },
  { title: '排序', key: 'sort', width: 60 },
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
    const res = await getRolePage({ pageindex: page.value, pagesize: pageSize.value, ...searchForm })
    tableData.value = res.list || []
    total.value = res.total || 0
  } finally { loading.value = false }
}

function handlePageChange(p, ps) { page.value = p; pageSize.value = ps; fetchData() }
function resetSearch() { searchForm.roleName = ''; fetchData() }

async function openCreate() {
  isEdit.value = false
  formTitle.value = '新增角色'
  formData.value = { status: true, sort: 0, dataScope: '4', menuIds: [], roleKey: '', roleName: '', departmentIds: [] }
  const [menus, depts] = await Promise.all([getMenuTree(), getDepartmentTree()])
  menuTree.value = menus || []
  deptTree.value = depts || []
  formVisible.value = true
}

async function openEdit(row) {
  isEdit.value = true
  formTitle.value = '编辑角色'
  const [detail, menus, depts] = await Promise.all([getRoleDetail(row.id), getMenuTree(), getDepartmentTree()])
  menuTree.value = menus || []
  deptTree.value = depts || []
  formData.value = { ...detail, roleKey: Array.isArray(detail.roleKey) ? detail.roleKey.join(', ') : detail.roleKey, departmentIds: detail.departmentIds || [] }
  formVisible.value = true
}

async function handleSubmit() {
  const errors = await new Promise(resolve => formRef.value?.validate(resolve))
  if (errors) return
  submitting.value = true
  try {
    let roleKey = formData.value.roleKey
    if (typeof roleKey === 'string') {
      try { roleKey = JSON.parse(roleKey) } catch { roleKey = [roleKey] }
    }
    const payload = { ...formData.value, roleKey, sort: Number(formData.value.sort || 0), departmentIds: formData.value.departmentIds || [] }
    if (isEdit.value) {
      await updateRole({ ...payload, id: formData.value.id })
      message.success('更新成功')
    } else {
      await createRole(payload)
      message.success('创建成功')
    }
    formVisible.value = false
    fetchData()
  } catch (e) { message.error(e.message || '操作失败') }
  finally { submitting.value = false }
}

async function handleDelete(id) {
  try { await deleteRole(id); message.success('删除成功'); fetchData() }
  catch (e) { message.error(e.message || '删除失败') }
}
</script>

<style scoped>
.menu-tree-box {
  width: 100%;
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid #e8ecf2;
  border-radius: 8px;
  padding: 8px 4px;
  background: #f8f9fc;
}
</style>
