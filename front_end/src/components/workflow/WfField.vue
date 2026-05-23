<template>
  <div v-if="permission !== 'hidden'" class="wf-field-container mb-4">
    <!-- Subtable has its own special rendering as it spans the full width and handles label differently -->
    <div v-if="type === 'subtable'" class="w-full">
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <span class="w-1 h-3.5 bg-blue-500 rounded-full"></span>
          {{ label }}
        </label>
        <span class="text-xs text-slate-400 font-medium">共 {{ (val || []).length }} 项</span>
      </div>
      
      <div class="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
        <n-table :bordered="false" size="small" class="w-full">
          <thead>
            <tr>
              <th 
                v-for="c in columns" 
                :key="c.key" 
                class="text-left py-2.5 px-4 text-xs font-semibold text-slate-600 border-b border-slate-200 bg-slate-50/70"
                :style="{ width: 90 / columns.length + '%' }"
              >
                {{ c.label || c.key }}
              </th>
              <th v-if="permission !== 'readonly'" class="text-center py-2.5 px-4 text-xs font-semibold text-slate-600 border-b border-slate-200 bg-slate-50/70" style="width: 70px">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in val" :key="idx" class="hover:bg-slate-50/60 transition-colors">
              <td v-for="c in columns" :key="c.key" class="py-2 px-4 border-b border-slate-100 align-middle">
                <!-- Subtable Column Control Switcher -->
                <n-input-number 
                  v-if="c.type === 'number'" 
                  v-model:value="row[c.key]" 
                  size="small" 
                  placeholder="数值" 
                  style="width: 100%" 
                  :disabled="permission === 'readonly'" 
                />
                <n-select 
                  v-else-if="c.type === 'select'" 
                  v-model:value="row[c.key]" 
                  :options="parseSelectOptions(c.optionsText)" 
                  size="small" 
                  placeholder="选择" 
                  :disabled="permission === 'readonly'" 
                />
                <n-date-picker 
                  v-else-if="c.type === 'date'" 
                  :value="row[c.key] ? Number(row[c.key]) : null" 
                  @update:value="v => row[c.key] = v"
                  type="date" 
                  size="small" 
                  style="width: 100%" 
                  :disabled="permission === 'readonly'" 
                />
                <n-date-picker 
                  v-else-if="c.type === 'datetime'" 
                  :value="row[c.key] ? Number(row[c.key]) : null" 
                  @update:value="v => row[c.key] = v"
                  type="datetime" 
                  size="small" 
                  style="width: 100%" 
                  :disabled="permission === 'readonly'" 
                />
                <n-input 
                  v-else-if="c.type === 'textarea'" 
                  v-model:value="row[c.key]" 
                  type="textarea" 
                  :rows="2" 
                  size="small" 
                  placeholder="多行" 
                  :disabled="permission === 'readonly'" 
                />
                <n-radio-group 
                  v-else-if="c.type === 'radio'" 
                  v-model:value="row[c.key]" 
                  :disabled="permission === 'readonly'"
                >
                  <n-space>
                    <n-radio v-for="o in parseSelectOptions(c.optionsText)" :key="o.value" :value="o.value">
                      {{ o.label }}
                    </n-radio>
                  </n-space>
                </n-radio-group>
                <n-checkbox-group 
                  v-else-if="c.type === 'checkbox'" 
                  v-model:value="row[c.key]" 
                  :disabled="permission === 'readonly'"
                >
                  <n-space>
                    <n-checkbox v-for="o in parseSelectOptions(c.optionsText)" :key="o.value" :value="o.value">
                      {{ o.label }}
                    </n-checkbox>
                  </n-space>
                </n-checkbox-group>
                <n-switch 
                  v-else-if="c.type === 'switch'" 
                  v-model:value="row[c.key]" 
                  :disabled="permission === 'readonly'" 
                />
                <!-- Subtable Custom User Picker -->
                <div 
                  v-else-if="c.type === 'user'" 
                  class="flex items-center justify-between border border-slate-200 rounded p-1 px-2 bg-slate-50/50 cursor-pointer"
                  @click="permission !== 'readonly' && triggerUserPickerSub(row, c.key)"
                >
                  <span class="text-xs text-slate-700">👤 {{ row[c.key] || '选择人员...' }}</span>
                </div>
                <!-- Subtable Custom File Uploader -->
                <div 
                  v-else-if="c.type === 'upload'" 
                  class="flex items-center justify-between border border-slate-200 border-dashed rounded p-1 px-2 bg-slate-50/30 cursor-pointer hover:border-blue-400 transition-colors"
                  @click="permission !== 'readonly' && triggerUploadSub(row, c.key)"
                >
                  <span class="text-xs text-slate-500">📤 {{ (row[c.key] || []).length ? '📎 已传 ' + row[c.key].length + ' 文件' : '上传附件...' }}</span>
                </div>
                <!-- Default input -->
                <n-input 
                  v-else 
                  v-model:value="row[c.key]" 
                  size="small" 
                  placeholder="输入" 
                  :disabled="permission === 'readonly'" 
                />
              </td>
              <td v-if="permission !== 'readonly'" class="py-2 px-4 border-b border-slate-100 text-center align-middle">
                <n-button size="tiny" type="error" text @click="removeSubtableRow(idx)">
                  <template #icon>
                    <n-icon><svg viewBox="0 0 512 512" fill="currentColor"><path d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.6 0 30.1-13.51 32-32l20-320H112zm80 248c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16v168zm80 0c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16v168zm80 0c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16v168zM432 80h-82.41l-34-56.7A48 48 0 0 0 274.41 0H237.6a48 48 0 0 0-41.16 23.3L162.41 80H80a16 16 0 0 0 0 32h352a16 16 0 0 0 0-32z"/></svg></n-icon>
                  </template>
                </n-button>
              </td>
            </tr>
            <tr v-if="!val || val.length === 0">
              <td :colspan="columns.length + (permission !== 'readonly' ? 1 : 0)" class="text-center py-8 text-xs text-slate-400 border-b border-slate-100 bg-slate-50/20">
                <div class="flex flex-col items-center justify-center gap-1.5 py-2">
                  <span class="text-lg">📋</span>
                  <span>暂无明细项，请点击下方「添加明细」</span>
                </div>
              </td>
            </tr>
          </tbody>
        </n-table>
        <div v-if="permission !== 'readonly'" class="p-2.5 bg-slate-50/60 border-t border-slate-150 text-center">
          <n-button size="small" type="primary" dashed block @click="addSubtableRow">
            + 添加明细项
          </n-button>
        </div>
      </div>
    </div>

    <!-- Standard Form Field Component -->
    <n-form-item v-else :label="label" :path="path" class="w-full">
      <!-- Readonly visual enhancement -->
      <div v-if="permission === 'readonly' && isCustomType(type)" class="w-full">
        <!-- Render read-only views for custom picker elements beautifully instead of plain disabled boxes -->
        <div v-if="type === 'user'" class="flex items-center gap-2 border border-slate-100 bg-slate-50/60 rounded-lg p-2 text-slate-700">
          <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
            {{ (val || '用')?.[0] }}
          </div>
          <span class="text-sm font-medium">{{ val || '未选择人员' }}</span>
        </div>
        <div v-else-if="type === 'upload'" class="wf-upload-readonly-list flex flex-col gap-1.5">
          <div v-if="!val || val.length === 0" class="text-xs text-slate-400 italic">无附件</div>
          <div v-else v-for="(file, fidx) in val" :key="fidx" class="flex items-center justify-between border border-slate-100 bg-slate-50/60 rounded-lg p-2">
            <span class="text-sm text-slate-600 flex items-center gap-1.5">📂 {{ file.name || file }}</span>
            <n-button size="tiny" type="primary" text>下载</n-button>
          </div>
        </div>
      </div>

      <!-- Main Input Control Flow -->
      <template v-else>
        <!-- Standard Input -->
        <n-input 
          v-if="type === 'input'" 
          v-model:value="val" 
          :placeholder="placeholder || '请输入' + label" 
          :disabled="permission === 'readonly'" 
          clearable
        />
        
        <!-- Textarea -->
        <n-input 
          v-else-if="type === 'textarea'" 
          v-model:value="val" 
          type="textarea" 
          :rows="rows || 4" 
          :placeholder="placeholder || '请输入' + label" 
          :disabled="permission === 'readonly'" 
          clearable
        />
        
        <!-- Number -->
        <n-input-number 
          v-else-if="type === 'number'" 
          v-model:value="val" 
          :min="min" 
          :max="max" 
          style="width: 100%" 
          :placeholder="placeholder || '请输入数值'" 
          :disabled="permission === 'readonly'" 
          clearable
        />
        
        <!-- Select -->
        <n-select 
          v-else-if="type === 'select'" 
          v-model:value="val" 
          :options="options" 
          :placeholder="placeholder || '请选择' + label" 
          :disabled="permission === 'readonly'" 
          clearable
        />
        
        <!-- Radio Group -->
        <n-radio-group v-else-if="type === 'radio'" v-model:value="val" :disabled="permission === 'readonly'">
          <n-space>
            <n-radio v-for="o in options" :key="o.value" :value="o.value">
              {{ o.label }}
            </n-radio>
          </n-space>
        </n-radio-group>
        
        <!-- Checkbox Group -->
        <n-checkbox-group v-else-if="type === 'checkbox'" v-model:value="val" :disabled="permission === 'readonly'">
          <n-space>
            <n-checkbox v-for="o in options" :key="o.value" :value="o.value">
              {{ o.label }}
            </n-checkbox>
          </n-space>
        </n-checkbox-group>
        
        <!-- Date Picker -->
        <n-date-picker 
          v-else-if="type === 'date'" 
          :value="val ? Number(val) : null" 
          @update:value="v => val = v"
          type="date" 
          style="width: 100%" 
          :placeholder="placeholder || '选择日期'" 
          :disabled="permission === 'readonly'" 
          clearable
        />
        
        <!-- Datetime Picker -->
        <n-date-picker 
          v-else-if="type === 'datetime'" 
          :value="val ? Number(val) : null" 
          @update:value="v => val = v"
          type="datetime" 
          style="width: 100%" 
          :placeholder="placeholder || '选择日期时间'" 
          :disabled="permission === 'readonly'" 
          clearable
        />
        
        <!-- Switch -->
        <n-switch 
          v-else-if="type === 'switch'" 
          v-model:value="val" 
          :disabled="permission === 'readonly'" 
        />
        
        <!-- Custom UI Picker: User Selector Mock/Real -->
        <div v-else-if="type === 'user'" class="w-full flex flex-col gap-2">
          <div 
            class="flex items-center justify-between border border-slate-200 hover:border-blue-400 rounded-lg p-2 bg-slate-50/30 transition-all cursor-pointer"
            @click="triggerUserPicker"
          >
            <div class="flex items-center gap-2">
              <span class="text-slate-400">👤</span>
              <span :class="val ? 'text-slate-800 font-medium' : 'text-slate-400 text-sm'">
                {{ val || '点击选择系统人员...' }}
              </span>
            </div>
            <n-button v-if="val && permission !== 'readonly'" size="tiny" type="error" text @click.stop="val = ''">清除</n-button>
          </div>
        </div>
        
        <!-- Custom UI Picker: File Uploader Mock/Real -->
        <div v-else-if="type === 'upload'" class="w-full flex flex-col gap-2">
          <div v-if="!val || val.length === 0" class="flex flex-col items-center justify-center border border-dashed border-slate-300 hover:border-blue-400 rounded-lg p-5 bg-slate-50/20 hover:bg-slate-50/40 cursor-pointer transition-all" @click="triggerFileUpload">
            <span class="text-xl mb-1 text-slate-400">📤</span>
            <span class="text-xs text-slate-500 font-medium">点击选择或拖拽附件上传</span>
          </div>
          <div v-else class="flex flex-col gap-2">
            <div v-for="(file, fidx) in val" :key="fidx" class="flex items-center justify-between border border-slate-200 bg-slate-50/40 rounded-lg p-2 px-3 hover:shadow-sm transition-all">
              <span class="text-sm text-slate-600 flex items-center gap-1.5">📂 {{ file.name || file }}</span>
              <n-button size="tiny" type="error" text @click="removeFile(fidx)">删除</n-button>
            </div>
            <n-button size="small" type="primary" dashed @click="triggerFileUpload">+ 继续添加文件</n-button>
          </div>
        </div>
        
        <!-- Fallback to standard input -->
        <n-input 
          v-else 
          v-model:value="val" 
          :placeholder="placeholder || '请输入'" 
          :disabled="permission === 'readonly'" 
        />
      </template>
    </n-form-item>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'
import {
  NFormItem, NInput, NInputNumber, NSelect, NRadioGroup, NRadio,
  NCheckboxGroup, NCheckbox, NDatePicker, NSwitch, NButton, NSpace, NTable, NIcon
} from 'naive-ui'

const props = defineProps({
  label: { type: String, default: '' },
  path: { type: String, default: '' },
  type: { type: String, default: 'input' },
  modelValue: { type: null, default: undefined },
  value: { type: null, default: undefined }, // For compatibility with older Vue code/v-model:value
  placeholder: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  rows: { type: Number, default: 4 },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined }
})

const emit = defineEmits(['update:modelValue', 'update:value'])

// Two-way value binding wrapper that seamlessly supports both v-model and v-model:value
const val = computed({
  get() {
    return props.modelValue !== undefined ? props.modelValue : props.value
  },
  set(newValue) {
    emit('update:modelValue', newValue)
    emit('update:value', newValue)
  }
})

// Extract current global workflow contexts dynamically
const instance = getCurrentInstance()
const permission = computed(() => {
  const workflow = instance?.appContext?.config?.globalProperties?.$workflow || window.$workflow
  const perms = workflow?.nodePermissions
  if (!perms || !props.path) return 'editable'
  return perms[props.path] || 'editable'
})

// Subtable helpers
function parseSelectOptions(optionsText) {
  if (!optionsText) return []
  return optionsText
    .split('/')
    .filter(Boolean)
    .map(o => ({ label: o.trim(), value: o.trim() }))
}

function addSubtableRow() {
  if (!Array.isArray(val.value)) {
    val.value = []
  }
  const initialRowObj = props.columns.reduce((acc, c) => {
    acc[c.key] = c.type === 'number' ? null : (c.type === 'date' ? null : '')
    return acc
  }, {})
  val.value.push(initialRowObj)
}

function removeSubtableRow(idx) {
  if (Array.isArray(val.value)) {
    val.value.splice(idx, 1)
  }
}

// Custom types helper
function isCustomType(t) {
  return ['user', 'upload'].includes(t)
}

// Interactive user picker mock action
function triggerUserPicker() {
  if (permission.value === 'readonly') return
  const mockNames = ['李明', '王华', '张伟', '陈静', '赵敏']
  const randomName = mockNames[Math.floor(Math.random() * mockNames.length)]
  val.value = randomName
}

// Interactive file upload mock action
function triggerFileUpload() {
  if (permission.value === 'readonly') return
  if (!Array.isArray(val.value)) {
    val.value = []
  }
  const mockFiles = ['发票.pdf', '差旅明细.xlsx', '凭证图片.png', '合同附件.docx']
  const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)]
  val.value.push({ name: randomFile, size: '256KB' })
}

function removeFile(fidx) {
  if (Array.isArray(val.value)) {
    val.value.splice(fidx, 1)
  }
}

function triggerUserPickerSub(row, colKey) {
  const mockNames = ['李明', '王华', '张伟', '陈静', '赵敏']
  const randomName = mockNames[Math.floor(Math.random() * mockNames.length)]
  row[colKey] = randomName
}

function triggerUploadSub(row, colKey) {
  if (!Array.isArray(row[colKey])) {
    row[colKey] = []
  }
  const mockFiles = ['发票.pdf', '明细.xlsx', '图片.png']
  const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)]
  row[colKey].push({ name: randomFile, size: '128KB' })
}
</script>

<style scoped>
.wf-field-container :deep(.n-form-item-blank) {
  width: 100%;
}
</style>
