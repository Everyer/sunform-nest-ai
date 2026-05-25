<template>
  <div class="page-designer">
    <!-- Left: AI Chat -->
    <div class="pd-ai-panel">
      <div class="pd-ai-header">
        <div class="pd-ai-title">AI 页面设计</div>
        <div class="pd-ai-hint">描述你想要的表单布局，AI 将生成页面源码</div>
      </div>
      <AiChat
        :form-fields="formFields"
        :flow-nodes="flowNodes"
        :field-permissions="fieldPermissions"
        :session-id="sessionId"
        :source-code="templateCode"
        skill="workflow"
        @update:session-id="sessionId = $event"
        @code-generated="onCodeGenerated"
      />
    </div>

    <!-- Right: Code / Preview -->
    <div class="pd-code-panel">
      <div class="pd-code-tabs">
        <div style="display: flex; align-items: center; flex: 1;">
          <div class="pd-code-tab" :class="{ active: codeTab === 'preview' }" @click="codeTab = 'preview'">预览</div>
          <div class="pd-code-tab" :class="{ active: codeTab === 'source' }" @click="codeTab = 'source'">源码</div>
        </div>
        <div v-if="codeTab === 'preview' && flowNodes.length > 0" style="display: flex; align-items: center; padding-right: 16px;">
          <span style="font-size: 12px; color: #64748b; margin-right: 8px;">模拟节点权限:</span>
          <n-select v-model:value="previewNodeId" :options="nodeOptions" size="tiny" style="width: 140px;" />
        </div>
      </div>

      <div class="pd-code-body">
        <!-- Source code view -->
        <div v-show="codeTab === 'source'" class="pd-source-editor">
          <MonacoEditor v-model="templateCode" language="html" />
        </div>

        <!-- Preview -->
        <div v-show="codeTab === 'preview'" class="pd-preview">
          <div v-if="!templateCode" class="pd-preview-empty">请先生成或编写源码</div>
          <iframe v-else :srcdoc="previewHtml" class="pd-preview-iframe" sandbox="allow-scripts" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { NSelect } from 'naive-ui'
import MonacoEditor from '@/components/workflow/MonacoEditor.vue'
import AiChat from '@/components/ai/AiChat.vue'
import { buildPreviewHtml } from './previewHtml.js'

const props = defineProps({
  formFields: { type: Array, default: () => [] },
  templateCode: { type: String, default: '' },
  flowNodes: { type: Array, default: () => [] },
  fieldPermissions: { type: Object, default: () => ({}) },
  activeNodeId: { type: String, default: null },
})

const emit = defineEmits(['update:templateCode', 'code-generated'])

const sessionId = ref(null)
const codeTab = ref('preview')
const templateCode = ref(props.templateCode)
const previewNodeId = ref(null)

const nodeOptions = computed(() => {
  return props.flowNodes.map(n => ({ label: n.name || n.type, value: n.id }))
})

watch(() => props.flowNodes, (nodes) => {
  if (nodes.length > 0 && !previewNodeId.value) {
    previewNodeId.value = nodes[0].id
  }
}, { immediate: true })

watch(() => props.activeNodeId, (val) => {
  if (val) {
    previewNodeId.value = val
  }
}, { immediate: true })

const activePermissions = computed(() => {
  if (previewNodeId.value && props.fieldPermissions[previewNodeId.value]) {
    return props.fieldPermissions[previewNodeId.value]
  }
  return {}
})

const previewHtml = computed(() => buildPreviewHtml(templateCode.value, extractTemplate, extractScript, activePermissions.value))

function extractTemplate(code) {
  return code
    .replace(/<template[^>]*>/g, '')
    .replace(/<\/template>/g, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/g, '')
    .trim()
}

function extractScript(code) {
  const match = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!match) return null
  return match[1].trim()
}

function findActualString(fileContent, searchString) {
  if (!fileContent || !searchString) return null
  if (fileContent.includes(searchString)) return searchString

  const normalizeQuotes = str => str.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
  const normalizedSearch = normalizeQuotes(searchString)
  const normalizedFile = normalizeQuotes(fileContent)
  const quoteIndex = normalizedFile.indexOf(normalizedSearch)
  if (quoteIndex !== -1) {
    return fileContent.substring(quoteIndex, quoteIndex + searchString.length)
  }

  const escaped = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regexSource = escaped.replace(/\s+/g, '\\s*')
  try {
    const regex = new RegExp(regexSource, 'm')
    const match = fileContent.match(regex)
    if (match) return match[0]
  } catch (e) {}

  return null
}

function applyPatch(content) {
  let patches = []
  try {
    // 优先匹配 ```json 代码块
    const jsonBlocks = content.match(/```(?:json)?\n([\s\S]*?)\n```/i)
    let jsonStr = ''
    if (jsonBlocks) {
      jsonStr = jsonBlocks[1]
    } else {
      // 否则寻找大括号
      const start = content.indexOf('{')
      const end = content.lastIndexOf('}')
      if (start !== -1 && end !== -1 && end > start) {
        jsonStr = content.substring(start, end + 1)
      }
    }

    const parsed = JSON.parse(jsonStr)
    if (parsed && Array.isArray(parsed.patches)) {
      patches = parsed.patches
    } else if (parsed && parsed.old && parsed.new) {
      patches = [parsed]
    }
  } catch {}

  if (patches.length) {
    let cur = templateCode.value
    let patched = false
    patches.forEach(p => {
      if (p.old && p.new) {
        // 使用高级模糊匹配，忽略空格、换行差异
        const actualOld = findActualString(cur, p.old)
        if (actualOld) {
          cur = cur.replace(actualOld, p.new)
          patched = true
        }
      }
    })
    if (patched) {
      templateCode.value = cur
      emit('update:templateCode', cur)
      emit('code-generated', cur)
      return true
    }
  }

  return false
}

function extractCodeFromMarkdown(text) {
  // 提取所有代码块
  const blocks = []
  const regex = /```[a-z]*\s*([\s\S]*?)(?:```|$)/gi
  let m;
  while ((m = regex.exec(text)) !== null) {
    blocks.push(m[1].trim())
  }
  
  if (blocks.length > 0) {
    // 优先返回包含组件标签的代码块
    for (const b of blocks) {
      if (/<(template|script|style)/i.test(b)) return b
    }
    // 如果都没有，返回最后一个代码块（通常是正在生成的）
    return blocks[blocks.length - 1]
  }

  // 没有代码块标记时，直接匹配裸标签
  const firstTag = text.search(/<(template|script|style)/i)
  if (firstTag !== -1) {
    return text.substring(firstTag).trim()
  }
  return null
}

function onCodeGenerated(content) {
  // 1. 如果能成功解析并应用局部修改补丁，则直接返回
  if (applyPatch(content)) return

  // 2. 防火墙：识别当前流式生成是否为局部补丁（含 patches 结构特征字）
  // 只要包含 patches 等局部微调特征，而 applyPatch 又未成功（说明大模型尚未吐完，JSON 还不完整，或外面包裹了错误标签）
  // 此时必须静默拦截，绝对不能当作全量页面模板去解析，坚决防止流式打字期间破坏原有页面！
  const isPatchFlow = /"patches"\s*:/i.test(content) || 
                      /patches\s*"\s*:/i.test(content) || 
                      (content.includes('"old"') && content.includes('"new"'));
  if (isPatchFlow) {
    return
  }

  const extractedCode = extractCodeFromMarkdown(content)
  if (!extractedCode) return

  // 如果提取的代码以 <template 开头，说明是完整的组件或以模板为主的代码
  // 直接覆盖，以实现流式打字机效果，并且避免内部 <template> 嵌套导致的截断问题
  if (/^\s*<template/i.test(extractedCode)) {
    templateCode.value = extractedCode
  } 
  // 如果仅单独更新了 <style>
  else if (/^\s*<style/i.test(extractedCode)) {
    let cur = templateCode.value
    const oldStyleRegex = /<style[^>]*>[\s\S]*?(?:<\/style>|$)/i
    if (oldStyleRegex.test(cur)) {
      cur = cur.replace(oldStyleRegex, extractedCode)
    } else {
      cur = cur + '\n' + extractedCode
    }
    templateCode.value = cur
  } 
  // 如果仅单独更新了 <script>
  else if (/^\s*<script/i.test(extractedCode)) {
    let cur = templateCode.value
    const oldScrRegex = /<script[^>]*>[\s\S]*?(?:<\/script>|$)/i
    if (oldScrRegex.test(cur)) {
      cur = cur.replace(oldScrRegex, extractedCode)
    } else {
      cur = cur + '\n' + extractedCode
    }
    templateCode.value = cur
  } 
  // 兜底：处理仅仅输出配置的情况
  else if (content.includes('formData') || content.includes('export default')) {
    const scrOpen = '<' + 'script>'
    const scrClose = '<' + '/script>'
    const cur = templateCode.value
    const oldScrRegex = /<script[^>]*>[\s\S]*?(?:<\/script>|$)/i
    if (oldScrRegex.test(cur)) {
      templateCode.value = cur.replace(oldScrRegex, scrOpen + '\n' + content.trim() + '\n' + scrClose)
    }
  }

  emit('update:templateCode', templateCode.value)
  emit('code-generated', templateCode.value)
}

watch(templateCode, (val) => {
  emit('update:templateCode', val)
})

watch(() => props.templateCode, (val) => {
  if (val !== templateCode.value) {
    templateCode.value = val
  }
})
</script>

<style scoped>
.page-designer {
  display: flex; flex: 1; min-height: 0; height: 100%;
}

/* Left AI panel */
.pd-ai-panel {
  width: 340px; flex-shrink: 0;
  display: flex; flex-direction: column;
  height: 100%; min-height: 0;
  border-right: 1px solid #e8ecf2;
  background: #fff;
}
.pd-ai-header {
  padding: 14px 16px; border-bottom: 1px solid #e8ecf2;
}
.pd-ai-title { font-size: 14px; font-weight: 600; color: #1e293b; }
.pd-ai-hint { font-size: 11px; color: #94a3b8; margin-top: 4px; }

/* Right code panel */
.pd-code-panel {
  flex: 1; display: flex; flex-direction: column; min-width: 0;
}
.pd-code-tabs {
  display: flex; border-bottom: 1px solid #e8ecf2; background: #f8fafc;
  flex-shrink: 0;
}
.pd-code-tab {
  padding: 8px 20px; font-size: 12px; cursor: pointer;
  color: #64748b; border-bottom: 2px solid transparent;
  transition: all 0.15s;
}
.pd-code-tab:hover { color: #334155; }
.pd-code-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }
.pd-code-body { flex: 1; min-height: 0; }
.pd-source-editor { height: 100%; overflow: hidden; }
.pd-preview { height: 100%; display: flex; align-items: center; justify-content: center; background: #f8fafc; overflow: auto; }
.pd-preview-empty { color: #94a3b8; font-size: 13px; }
.pd-preview-iframe { width: 100%; height: 100%; border: none; }
</style>
