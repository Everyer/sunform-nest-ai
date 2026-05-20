<template>
  <SyCard title="菜单管理">
    <template #extra>
      <n-button type="primary" size="small" @click="openCreate(null)">
        <template #icon><n-icon><AddOutline /></n-icon></template>
        新增菜单
      </n-button>
    </template>

    <SyTable
      :columns="columns"
      :data="treeTableData"
      :loading="loading"
      :row-key="rowKey"
      :tree="true"
      :show-create="false"
    />

    <n-modal v-model:show="formVisible" :title="formTitle" preset="card" :style="{ width: '600px' }" :mask-closable="false">
      <n-form ref="formRef" :model="formData" label-placement="left" label-width="100">
        <n-form-item label="上级菜单" path="pid">
          <n-tree-select
            v-model:value="formData.pid"
            :options="menuTreeOptions"
            placeholder="留空为顶级菜单"
            clearable
            key-field="id"
            label-field="name"
            children-field="children"
          />
        </n-form-item>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="菜单名称" path="name" :rule="{ required: true, message: '必填' }">
              <n-input v-model:value="formData.name" placeholder="请输入菜单名称" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="菜单编码" path="code" :rule="{ required: true, message: '必填' }">
              <n-input v-model:value="formData.code" placeholder="唯一编码" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="菜单类型" path="type" :rule="{ required: true, message: '必选' }">
              <n-select v-model:value="formData.type" :options="typeOptions" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="排序" path="sort">
              <n-input-number v-model:value="formData.sort" :min="0" placeholder="排序号" style="width:100%" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-form-item label="路由路径" path="path" :rule="{ required: true, message: '必填' }">
          <n-input v-model:value="formData.path" placeholder="如 /system/user" />
        </n-form-item>
        <n-form-item label="组件路径" path="component">
          <n-input v-model:value="formData.component" placeholder="如 system/user/index" />
        </n-form-item>
        <n-form-item label="图标" path="icon">
          <div class="icon-select-row">
            <n-input v-model:value="formData.icon" placeholder="点击右侧按钮选择图标" readonly />
            <n-button @click="iconPickerVisible = true">
              <template #icon>
                <n-icon v-if="formData.icon && allIcons[formData.icon]" :component="allIcons[formData.icon]" />
                <n-icon v-else><ImageOutline /></n-icon>
              </template>
            </n-button>
          </div>
        </n-form-item>
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item label="导航菜单" path="isNav">
              <n-switch v-model:value="formData.isNav" />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item label="状态" path="status">
              <n-switch v-model:value="formData.status" />
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

    <n-modal v-model:show="iconPickerVisible" title="选择图标" preset="card" :style="{ width: '660px' }" :mask-closable="false">
      <div class="icon-picker">
        <n-input v-model:value="iconSearch" placeholder="搜索图标..." clearable class="icon-search" />
        <div class="icon-grid">
          <div v-for="name in filteredIcons" :key="name" class="icon-item" :class="{ active: formData.icon === name }" @click="selectIcon(name)">
            <n-icon :component="allIcons[name]" :size="18" />
            <span class="icon-name">{{ name }}</span>
          </div>
          <div v-if="filteredIcons.length === 0" class="icon-empty">无匹配图标</div>
        </div>
      </div>
    </n-modal>
  </SyCard>
</template>

<script setup>
import { ref, h, onMounted, computed } from 'vue'
import { NButton, NTag, NSpace, NIcon, NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NSwitch, NTreeSelect, NRow, NCol, useMessage } from 'naive-ui'
import { AddOutline, CreateOutline, TrashOutline, ImageOutline } from '@vicons/ionicons5'
import * as allIcons from '@vicons/ionicons5'
import SyCard from '@/components/SyCard/index.vue'
import SyTable from '@/components/SyTable/index.vue'
import { getMenuTree, getMenuDetail, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import { formatDateTime } from '@/utils'

const message = useMessage()
const loading = ref(false)
const menuTree = ref([])
const formRef = ref(null)
const formVisible = ref(false)
const formTitle = ref('新增菜单')
const formData = ref({})
const submitting = ref(false)
const isEdit = ref(false)

const typeOptions = [
  { label: '菜单', value: 'menu' },
  { label: '组件/按钮', value: 'comp' }
]

const iconPickerVisible = ref(false)
const iconSearch = ref('')
const iconList = computed(() => Object.keys(allIcons).filter(k => k.endsWith('Outline')).sort())
const filteredIcons = computed(() => {
  const q = iconSearch.value.toLowerCase()
  return q ? iconList.value.filter(n => n.toLowerCase().includes(q)) : iconList.value
})
function selectIcon(name) {
  formData.value.icon = name
  iconPickerVisible.value = false
  iconSearch.value = ''
}

const rowKey = (row) => row.id
const menuTreeOptions = computed(() => menuTree.value.map(item => ({ ...item, disabled: false })))
const treeTableData = computed(() => menuTree.value || [])

const columns = [
  { title: '菜单名称', key: 'name', width: 220 },
  { title: '编码', key: 'code', width: 120 },
  {
    title: '类型', key: 'type', width: 70,
    render: (row) => h(NTag, { size: 'tiny', bordered: false, color: { color: row.type === 'menu' ? '#e0e7ff' : '#fef3c7', textColor: row.type === 'menu' ? '#4338ca' : '#92400e' } }, { default: () => row.type === 'menu' ? '菜单' : '组件' })
  },
  { title: '路由路径', key: 'path', width: 150 },
  {
    title: '图标', key: 'icon', width: 60,
    render: (row) => row.icon ? h(NIcon, { size: '15', color: '#94a3b8' }, { default: () => h(allIcons[row.icon] || allIcons.GridOutline) }) : ''
  },
  { title: '排序', key: 'sort', width: 60 },
  {
    title: '状态', key: 'status', width: 70,
    render: (row) => h(NTag, { size: 'small', bordered: false, color: { color: row.status ? '#d1fae5' : '#f0f2f6', textColor: row.status ? '#065f46' : '#94a3b8' } }, { default: () => row.status ? '启用' : '禁用' })
  },
  { title: '创建时间', key: 'createdAt', width: 150, render: (row) => formatDateTime(row.createdAt) },
  {
    title: '', key: 'actions', width: 200,
    render: (row) => h(NSpace, null, {
      default: () => [
        h(NButton, { size: 'tiny', quaternary: true, onClick: () => openCreate(row) }, { default: () => '添加子菜单' }),
        h(NButton, { size: 'tiny', quaternary: true, onClick: () => openEdit(row) }, { icon: () => h(NIcon, null, { default: () => h(CreateOutline) }), default: () => '编辑' }),
        h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => handleDelete(row.id) }, { icon: () => h(NIcon, null, { default: () => h(TrashOutline) }), default: () => '删除' })
      ]
    })
  }
]

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try { menuTree.value = await getMenuTree() } finally { loading.value = false }
}

async function openCreate(parent) {
  isEdit.value = false
  formTitle.value = parent ? `新增子菜单（父：${parent.name}）` : '新增菜单'
  formData.value = { pid: parent?.id || null, name: '', code: '', isNav: true, status: true, type: 'menu', path: '', sort: 0, icon: '' }
  const menus = await getMenuTree()
  menuTree.value = menus || []
  formVisible.value = true
}

async function openEdit(row) {
  isEdit.value = true
  formTitle.value = '编辑菜单'
  const [detail, menus] = await Promise.all([getMenuDetail(row.id), getMenuTree()])
  menuTree.value = menus || []
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
      await updateMenu({ ...payload, id: formData.value.id })
      message.success('更新成功')
    } else {
      await createMenu(payload)
      message.success('创建成功')
    }
    formVisible.value = false
    fetchData()
  } catch (e) { message.error(e.message || '操作失败') }
  finally { submitting.value = false }
}

async function handleDelete(id) {
  try { await deleteMenu(id); message.success('删除成功'); fetchData() }
  catch (e) { message.error(e.message || '删除失败') }
}
</script>

<style scoped>
.icon-select-row {
  display: flex;
  gap: 8px;
  width: 100%;
}
.icon-select-row .n-input { flex: 1; }

.icon-picker {
  max-height: 460px;
  display: flex;
  flex-direction: column;
}
.icon-search { margin-bottom: 14px; }
.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  overflow-y: auto;
  flex: 1;
  align-content: flex-start;
}
.icon-item {
  width: 85px;
  height: 66px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid #e8ecf2;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}
.icon-item:hover {
  border-color: #d97706;
  color: #d97706;
  background: rgba(217,119,6,0.04);
}
.icon-item.active {
  border-color: #d97706;
  background: rgba(217,119,6,0.08);
  color: #d97706;
}
.icon-name {
  font-size: 9px;
  text-align: center;
  line-height: 1.2;
  word-break: break-all;
  max-width: 75px;
  color: #94a3b8;
}
.icon-item:hover .icon-name { color: #d97706; }
.icon-empty {
  width: 100%;
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
}
</style>
