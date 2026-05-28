<template>
  <n-button size="small" quaternary @click="handleOpen" :loading="loading">
    <template #icon>
      <n-icon>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
        </svg>
      </n-icon>
    </template>
    打印
  </n-button>

  <!-- 全屏打印预览遮罩层，直接复用设计器的 PrintPreview 组件 -->
  <div v-if="showPreview" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999;">
    <PrintPreview
      :elements="templateElements"
      :paper-width="templateConfig.paperWidth"
      :paper-height="templateConfig.paperHeight"
      :page-margins="templateConfig.pageMargins"
      :is-landscape="templateConfig.isLandscape"
      :api-path="templateConfig.apiPath"
      :test-method="templateConfig.testMethod"
      :test-params="templateConfig.testParams"
      :test-business-id="businessId"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import PrintPreview from '@/views/print/components/PrintPreview.vue'
import { getPrintTemplateByCode } from '@/api/printTemplate'

const props = defineProps({
  templateCode: { type: String, required: true },
  appId: { type: String, default: '' },
  businessId: { type: String, default: '' },
})

const loading = ref(false)
const showPreview = ref(false)
const templateElements = ref([])
const templateConfig = reactive({
  paperWidth: 210,
  paperHeight: 297,
  pageMargins: { top: 10, bottom: 10, left: 10, right: 10 },
  isLandscape: false,
  apiPath: '',
  testMethod: 'GET',
  testParams: '{}',
})

async function handleOpen() {
  loading.value = true
  try {
    const res = await getPrintTemplateByCode(props.templateCode, props.appId || undefined)
    if (!res) {
      window.$message?.error('未找到打印模板')
      return
    }
    templateElements.value = JSON.parse(res.elementsJson || '[]')
    templateConfig.paperWidth = res.paperWidth || 210
    templateConfig.paperHeight = res.paperHeight || 297
    templateConfig.isLandscape = res.isLandscape || false
    templateConfig.apiPath = res.apiPath || ''
    templateConfig.testMethod = res.testMethod || 'GET'
    templateConfig.testParams = res.testParams || '{}'
    if (res.pageMargins) {
      try { Object.assign(templateConfig.pageMargins, JSON.parse(res.pageMargins)) } catch {}
    }
    showPreview.value = true
  } catch (e) {
    window.$message?.error('加载打印模板失败: ' + (e.message || e))
  } finally {
    loading.value = false
  }
}
</script>
