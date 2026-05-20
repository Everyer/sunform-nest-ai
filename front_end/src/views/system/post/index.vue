<template>
  <SyCard title="岗位管理">
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
        <n-form-item label="岗位名称">
          <n-input
            v-model:value="searchForm.postName"
            placeholder="岗位名称"
            clearable
          />
        </n-form-item>
      </template>
    </SyTable>

    <n-modal
      v-model:show="formVisible"
      :title="formTitle"
      preset="card"
      :style="{ width: '540px' }"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="formData"
        label-placement="left"
        label-width="100"
      >
        <n-row :gutter="16">
          <n-col :span="12">
            <n-form-item
              label="岗位名称"
              path="postName"
              :rule="{ required: true, message: '必填' }"
            >
              <n-input
                v-model:value="formData.postName"
                placeholder="请输入岗位名称"
              />
            </n-form-item>
          </n-col>
          <n-col :span="12">
            <n-form-item
              label="岗位编码"
              path="postCode"
              :rule="{ required: true, message: '必填' }"
            >
              <n-input
                v-model:value="formData.postCode"
                placeholder="唯一编码"
              />
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
              <n-input-number
                v-model:value="formData.sort"
                :min="0"
                placeholder="排序号"
                style="width: 100%"
              />
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
          <n-button
            v-ai="'确定'"
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
            >确定</n-button
          >
        </n-space>
      </template>
    </n-modal>
  </SyCard>
</template>

<script setup>
import { ref, reactive, h, onMounted } from 'vue';
import {
  NButton,
  NTag,
  NSpace,
  NIcon,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSwitch,
  NRow,
  NCol,
  useMessage,
} from 'naive-ui';
import { CreateOutline, TrashOutline } from '@vicons/ionicons5';
import SyCard from '@/components/SyCard/index.vue';
import SyTable from '@/components/SyTable/index.vue';
import {
  getPostPage,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
} from '@/api/post';
import { formatDateTime } from '@/utils';
import { useAiFiller } from '@/hooks/useAiFiller';

const message = useMessage();
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const searchForm = reactive({ postName: '' });

const formRef = ref(null);
const formVisible = ref(false);
const formTitle = ref('新增岗位');
const formData = ref({});
const submitting = ref(false);
const isEdit = ref(false);

const columns = [
  { title: '岗位名称', key: 'postName', width: 150 },
  { title: '编码', key: 'postCode', width: 120 },
  { title: '排序', key: 'sort', width: 60 },
  {
    title: '状态',
    key: 'status',
    width: 70,
    render: (row) =>
      h(
        NTag,
        {
          size: 'small',
          bordered: false,
          color: {
            color: row.status ? '#d1fae5' : '#f0f2f6',
            textColor: row.status ? '#065f46' : '#94a3b8',
          },
        },
        { default: () => (row.status ? '启用' : '禁用') },
      ),
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 150,
    render: (row) => formatDateTime(row.createdAt),
  },
  {
    title: '',
    key: 'actions',
    width: 100,
    render: (row) =>
      h(NSpace, null, {
        default: () => [
          h(
            NButton,
            { size: 'tiny', quaternary: true, onClick: () => openEdit(row) },
            {
              icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
              default: () => '编辑',
            },
          ),
          h(
            NButton,
            {
              size: 'tiny',
              quaternary: true,
              type: 'error',
              onClick: () => handleDelete(row.id),
            },
            {
              icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
              default: () => '删除',
            },
          ),
        ],
      }),
  },
];

onMounted(() => fetchData());

async function fetchData() {
  loading.value = true;
  try {
    const res = await getPostPage({
      pageindex: page.value,
      pagesize: pageSize.value,
      ...searchForm,
    });
    tableData.value = res.list || [];
    total.value = res.total || 0;
  } finally {
    loading.value = false;
  }
}

function handlePageChange(p, ps) {
  page.value = p;
  pageSize.value = ps;
  fetchData();
}
function resetSearch() {
  searchForm.postName = '';
  fetchData();
}

function openCreate() {
  isEdit.value = false;
  formTitle.value = '新增岗位';
  formData.value = {
    postName: '',
    postCode: '',
    status: true,
    sort: 0,
    remark: '',
  };
  formVisible.value = true;
}

async function openEdit(row) {
  isEdit.value = true;
  formTitle.value = '编辑岗位';
  const detail = await getPostDetail(row.id);
  formData.value = { ...detail };
  formVisible.value = true;
}

async function handleSubmit() {
  const errors = await new Promise((resolve) =>
    formRef.value?.validate(resolve),
  );
  if (errors) return;
  submitting.value = true;
  try {
    const payload = {
      ...formData.value,
      sort: Number(formData.value.sort || 0),
    };
    if (isEdit.value) {
      await updatePost({ ...payload, id: formData.value.id });
      message.success('更新成功');
    } else {
      await createPost(payload);
      message.success('创建成功');
    }
    formVisible.value = false;
    fetchData();
  } catch (e) {
    message.error(e.message || '操作失败');
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(id) {
  try {
    await deletePost(id);
    message.success('删除成功');
    fetchData();
  } catch (e) {
    message.error(e.message || '删除失败');
  }
}

// 岗位表单 AI 字典配置
const postSchema = {
  formName: '岗位表单',
  fields: [
    { key: 'postName', label: '岗位名称', type: 'string' },
    { key: 'postCode', label: '岗位编码', type: 'string' },
    { key: 'status', label: '状态', type: 'boolean' },
    { key: 'sort', label: '排序', type: 'number' },
    { key: 'remark', label: '备注', type: 'string' },
  ],
};

// 动态注册 AI 填报：仅当弹窗显示（formVisible.value 为 true）时才激活 AI 填表助手
useAiFiller(
  postSchema,
  (data) => {
    if (data) {
      if (data.postName !== undefined) formData.value.postName = data.postName;
      if (data.postCode !== undefined) formData.value.postCode = data.postCode;
      if (data.status !== undefined) formData.value.status = data.status;
      if (data.sort !== undefined) formData.value.sort = data.sort;
      if (data.remark !== undefined) formData.value.remark = data.remark;
    }
  },
  formVisible,
);
</script>
