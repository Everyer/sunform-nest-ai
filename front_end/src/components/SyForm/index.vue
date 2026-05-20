<template>
  <n-modal
    v-model:show="visible"
    :title="title"
    preset="card"
    :style="{ width: '560px' }"
    :mask-closable="false"
  >
    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="left"
      label-width="100"
      require-mark-placement="right-hanging"
    >
      <n-form-item
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :path="field.key"
        :rule="field.rule"
      >
        <n-input
          v-if="field.type === 'input'"
          v-model:value="formData[field.key]"
          :placeholder="field.placeholder"
        />
        <n-input-number
          v-else-if="field.type === 'number'"
          v-model:value="formData[field.key]"
          :placeholder="field.placeholder"
          :min="0"
          style="width:100%"
        />
        <n-switch
          v-else-if="field.type === 'switch'"
          v-model:value="formData[field.key]"
        />
        <n-tree-select
          v-else-if="field.type === 'treeSelect'"
          v-model:value="formData[field.key]"
          :options="field.options"
          :placeholder="field.placeholder"
          clearable
          check-strategy="child"
        />
        <n-select
          v-else-if="field.type === 'select'"
          v-model:value="formData[field.key]"
          :options="field.options"
          :placeholder="field.placeholder"
          :multiple="field.multiple"
          clearable
        />
        <n-checkbox-group
          v-else-if="field.type === 'checkbox'"
          v-model:value="formData[field.key]"
        >
          <n-checkbox
            v-for="opt in field.options"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </n-checkbox>
        </n-checkbox-group>
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" :loading="loading" @click="handleSubmit">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  NModal, NForm, NFormItem, NInput, NInputNumber, NSwitch, NTreeSelect,
  NSelect, NCheckboxGroup, NCheckbox, NButton, NSpace, useMessage
} from 'naive-ui'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '新增' },
  fields: { type: Array, default: () => [] },
  initialData: { type: Object, default: () => ({}) },
  rules: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'submit', 'cancel'])
const message = useMessage()

const visible = ref(false)
const formRef = ref(null)
const formData = ref({})

watch(() => props.show, (val) => {
  visible.value = val
  if (val) {
    formData.value = { ...props.initialData }
  }
})

watch(visible, (val) => {
  if (!val) emit('update:show', false)
})

async function handleSubmit() {
  const errors = await new Promise(resolve => formRef.value?.validate(resolve))
  if (errors) return
  emit('submit', { ...formData.value })
}

function handleCancel() {
  visible.value = false
  emit('cancel')
}
</script>
