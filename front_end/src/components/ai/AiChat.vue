<template>
  <div class="ai-chat">
    <!-- Messages List -->
    <div class="ai-chat-messages" ref="msgRef">
      <!-- Empty state -->
      <div v-if="messages.length === 0" class="ai-empty">
        <div class="ai-empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/>
          </svg>
        </div>
        <div class="ai-empty-text">描述你想要的页面布局</div>
        <div class="ai-empty-hint">AI 将根据你的描述生成页面源码</div>
        <div class="ai-empty-fields" v-if="formFields.length">
          <div class="ai-empty-fields-title">可用字段：</div>
          <div class="ai-field-tags">
            <span v-for="f in formFields" :key="f.fieldKey" class="ai-field-tag">{{ f.fieldLabel }}<em>{{ f.fieldType }}</em></span>
          </div>
        </div>
        <div class="ai-empty-suggestions">
          <div class="ai-suggestion-title">试试这样说：</div>
          <div class="ai-suggestion-item" @click="fillSuggestion('将请假类型和天数放在第一行，下面放开始时间和结束时间，底部放事由')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            请假单布局
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div v-for="msg in messages" :key="msg.id" class="ai-msg" :class="msg.role">
        <!-- User Message -->
        <div v-if="msg.role === 'user'" class="ai-msg-user">
          <div class="ai-msg-avatar user-avatar">U</div>
          <div class="ai-msg-content">
            <div class="ai-msg-bubble user-bubble" v-html="renderMarkdown(msg.displayContent || msg.content)"></div>
            <div v-if="msg.attachments?.length" class="ai-msg-attachments">
              <div v-for="file in msg.attachments" :key="file.path" class="ai-attach-file">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                {{ file.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Assistant Message -->
        <div v-else class="ai-msg-assistant">
          <div class="ai-msg-avatar ai-avatar">AI</div>
          <div class="ai-msg-content">
            <!-- Thinking state -->
            <div v-if="msg.isThinking && !msg.blocks.length" class="ai-thinking">
              <div class="ai-thinking-dots"><span></span><span></span><span></span></div>
            </div>

            <!-- Blocks -->
            <template v-for="(block, bIdx) in msg.blocks" :key="bIdx">
              <div v-if="block.type === 'text'" class="ai-text-block" v-html="renderMarkdown(wrapWithMarkdown(block.content))"></div>
              <div v-else-if="block.type === 'patch'" class="ai-text-block ai-patch-block" v-html="renderMarkdown(block.content)"></div>
              <div v-else-if="block.type === 'error'" class="ai-error-card">
                <div class="ai-error-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  请求错误
                </div>
                <pre class="ai-error-body">{{ block.content }}</pre>
                <div v-if="msg === messages[messages.length - 1]" class="mt-3 text-right">
                  <button class="ai-retry-btn" @click="handleRetry">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    重新生成
                  </button>
                </div>
              </div>
            </template>

            <!-- Stop button during generation -->
            <div v-if="msg === messages[messages.length - 1] && loading" class="ai-stop-bar">
              <button class="ai-stop-button" @click="handleStop">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                停止生成
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="ai-input-area">
      <div v-if="attachments.length" class="ai-attach-bar">
        <div v-for="(att, idx) in attachments" :key="idx" class="ai-attach-chip">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          {{ att.name }}
          <span class="ai-chip-remove" @click="attachments.splice(idx, 1)">×</span>
        </div>
      </div>
      <div class="ai-input-wrap">
        <textarea
          ref="inputRef"
          v-model="inputText"
          class="ai-textarea"
          :placeholder="inputPlaceholder"
          @keydown.enter.exact.prevent="handleSend"
          @keydown.enter.shift.stop=""
          @paste="handlePaste"
        ></textarea>
        <div class="ai-input-tools">
          <label class="ai-tool-btn" title="上传附件">
            <input type="file" multiple @change="handleFileSelect" class="ai-file-input" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l8.57-8.57A4 4 0 1118 8.84l-8.59 8.51a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
          </label>
          <button class="ai-tool-btn" title="清空对话" @click="handleClear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
          </button>
          <div class="ai-input-right">
            <span class="ai-char-count">{{ inputText.length }}</span>
            <button
              class="ai-btn-send"
              :class="{ disabled: !inputText.trim() || loading }"
              :disabled="!inputText.trim() || loading"
              @click="handleSend"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  formFields: { type: Array, default: () => [] },
  sessionId: { type: String, default: null },
  sourceCode: { type: String, default: '' },
  inputPlaceholder: { type: String, default: '描述你想要的布局...' },
  skill: { type: String, default: '' },
  flowNodes: { type: Array, default: () => [] },
  fieldPermissions: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:sessionId', 'code-generated'])

const inputText = ref('')
const loading = ref(false)
const messages = ref([])
const attachments = ref([])
const msgRef = ref(null)
const inputRef = ref(null)
const readerRef = ref(null)

const SESSION_KEY = 'agent_session_id'

onMounted(() => { initSession() })

watch(() => props.sessionId, (val) => {
  if (val) localStorage.setItem(SESSION_KEY, val)
})

// Configure marked for safe rendering
marked.setOptions({
  breaks: true,
  gfm: true,
})

// ========== Session ==========

async function initSession(forceCreate = false) {
  if (forceCreate) localStorage.removeItem(SESSION_KEY)
  try {
    const res = await fetch('/adminApi/agent/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
    if (!res.ok) {
      console.warn('Agent API not available, using mock mode')
      return
    }
    const json = await res.json()
    const data = json.success !== undefined ? json.data : json
    emit('update:sessionId', data.sessionId)
    localStorage.setItem(SESSION_KEY, data.sessionId)
  } catch (e) {
    console.warn('Agent service unavailable, chat will be disabled:', e.message)
  }
}

// ========== Clear Chat ==========

async function handleClear() {
  messages.value = []
  attachments.value = []
  inputText.value = ''
  await initSession(true)
}

// ========== Fill Suggestion ==========

function fillSuggestion(text) {
  inputText.value = text
  inputRef.value?.focus()
}

// ========== Send / Stop ==========

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  inputText.value = ''

  const userMsg = { id: 'u-' + Date.now(), role: 'user', content: text, attachments: [...attachments.value], displayContent: text }
  messages.value.push(userMsg)
  attachments.value = []

  await executeAgentRequest(userMsg)
}

async function handleRetry() {
  if (loading.value) return
  const len = messages.value.length
  if (len < 2) return
  const lastMsg = messages.value[len - 1]
  const userMsg = messages.value[len - 2]
  if (lastMsg.role !== 'assistant' || userMsg.role !== 'user') return

  // 移除失败的助理消息
  messages.value.pop()
  await executeAgentRequest(userMsg)
}

async function executeAgentRequest(userMsg) {
  const assistantMsg = { id: 'a-' + Date.now(), role: 'assistant', isThinking: true, blocks: [] }
  messages.value.push(assistantMsg)

  loading.value = true
  scrollToBottom()

  const sid = props.sessionId || localStorage.getItem(SESSION_KEY)
  if (!sid) {
    assistantMsg.isThinking = false
    assistantMsg.blocks.push({ type: 'text', content: '⚠️ **Agent 服务不可用**\n\n请确保后端已启动并配置了 `AI_AGENT_API_KEY` 环境变量。' })
    loading.value = false
    return
  }

  try {
    const response = await fetch('/adminApi/agent/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sid,
        content: userMsg.content,
        skill: props.skill || undefined,
        sourceCode: props.sourceCode || undefined,
        formFields: props.formFields?.length ? props.formFields : undefined,
        flowNodes: props.flowNodes?.length ? props.flowNodes : undefined,
        fieldPermissions: Object.keys(props.fieldPermissions).length ? props.fieldPermissions : undefined,
        attachments: userMsg.attachments?.map(a => ({ name: a.name, path: a.path })) || [],
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    readerRef.value = response.body.getReader()
    const reader = readerRef.value
    const decoder = new TextDecoder()
    let buffer = ''
    let currentEventType = 'stream'

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('event: ')) {
          currentEventType = trimmed.slice(7).trim()
        } else if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6))
            if (currentEventType === 'error') {
              const errorMsg = data.error || '未知错误'
              assistantMsg.blocks.push({ type: 'error', content: errorMsg })
              loading.value = false
            } else if (currentEventType === 'stream' && data.event) {
              handleStreamEvent(data.event, assistantMsg)
            }
          } catch {}
        }
      }
    }
  } catch (e) {
    assistantMsg.isThinking = false
    assistantMsg.blocks.push({ type: 'error', content: `连接失败: ${e.message}` })
  }

  // 流结束后，emit 完整代码（style 在最后才传完，覆盖之前的流式预览）
  const lastMsg = messages.value.filter(m => m.role === 'assistant').slice(-1)[0]
  if (lastMsg) {
    const finalCode = lastMsg.blocks.filter(b => b.type === 'text').map(b => b.content).join('')
    if (finalCode && (finalCode.includes('<template') || finalCode.includes('<script') || finalCode.includes('<style') || finalCode.includes('</template>'))) {
      emit('code-generated', finalCode)
    }
  }

  loading.value = false
  scrollToBottom()
}

function handleStop() {
  loading.value = false
  if (readerRef.value) {
    readerRef.value.cancel().catch(() => {})
    readerRef.value = null
  }
  fetch('/adminApi/agent/abort', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: props.sessionId }),
  }).catch(() => {})
}

// ========== Stream Events ==========

function handleStreamEvent(event, msg) {
  msg.isThinking = false
  if (event.type === 'text') {
    appendText(msg, event.content || '')
  } else if (event.type === 'tool_call') {
    const tc = event.toolCall
    if (tc && tc.name === 'ReplaceCode') {
      const input = tc.input || {}
      // 这里的 blocks 不再仅仅是文本，而是一个包含代码差异的特殊块
      msg.blocks.push({
        type: 'patch',
        content: `\n\n> ✨ **已应用局部代码补丁**\n\n\`\`\`javascript\n// 替换为：\n${input.new_string || ''}\n\`\`\``
      })
      if (input.old_string && input.new_string) {
        const payload = JSON.stringify({
          patches: [
            { old: input.old_string, new: input.new_string }
          ]
        })
        emit('code-generated', payload)
      }
    }
  }
  scrollToBottom()
}

function appendText(msg, content) {
  const last = msg.blocks[msg.blocks.length - 1]
  if (last?.type === 'text') {
    last.content += content
  } else {
    msg.blocks.push({ type: 'text', content })
  }
  // 流式更新预览
  const combined = msg.blocks.filter(b => b.type === 'text').map(b => b.content).join('')
  if (combined && (combined.includes('<template') || combined.includes('v-model') || combined.includes('n-') || combined.includes('<script') || combined.includes('<style'))) {
    emit('code-generated', combined)
  }
}

// ========== Attachments ==========

async function handleFileSelect(e) {
  const files = e.target.files
  if (!files?.length) return
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/adminApi/agent/attachments/upload', { method: 'POST', body: formData })
      const json = await res.json()
      const data = json.success !== undefined ? json.data : json
      if (data.success) {
        attachments.value.push({ name: data.name, path: data.path, url: data.url || '' })
      }
    } catch (e) {
      console.error('Upload failed', e)
    }
  }
}

async function handlePaste(e) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (!file) continue
      try {
        const formData = new FormData()
        formData.append('file', file, 'clipboard.png')
        const res = await fetch('/adminApi/agent/attachments/upload', { method: 'POST', body: formData })
        const json = await res.json()
        const data = json.data || json
        if (data.success) {
          attachments.value.push({ name: '截图.png', path: data.path, url: data.url || '' })
        }
      } catch (e) { console.error('Paste failed', e) }
    }
  }
}

// ========== Utilities ==========

function wrapWithMarkdown(text) {
  if (!text) return ''
  if (text.includes('```')) return text
  if (text.includes('<template') || text.includes('<script') || text.includes('<style')) {
    return '```vue\n' + text + '\n```'
  }
  return text
}

function renderMarkdown(text) {
  if (!text) return ''
  try {
    let processed = text;
    // 抽离 think 标签，转为折叠面板
    processed = processed.replace(/<think>/gi, '<details class="ai-think-box"><summary>思考过程</summary><div class="ai-think-content">');
    processed = processed.replace(/<\/think>/gi, '</div></details>');
    return marked.parse(processed)
  } catch {
    return text
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (msgRef.value) {
      msgRef.value.scrollTop = msgRef.value.scrollHeight
    }
  })
}
</script>

<style scoped>
/* ============ Layout ============ */
.ai-chat {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: #ffffff;
}
.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  scroll-behavior: smooth;
}

/* ============ Empty State ============ */
.ai-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}
.ai-empty-icon {
  width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  background: #f1f5f9;
  border-radius: 14px;
  margin-bottom: 12px;
}
.ai-empty-text { font-size: 14px; font-weight: 600; color: #334155; }
.ai-empty-hint { font-size: 11px; color: #94a3b8; margin-top: 4px; }
.ai-empty-fields { margin-top: 20px; width: 100%; }
.ai-empty-fields-title { font-size: 11px; color: #94a3b8; font-weight: 500; margin-bottom: 8px; }
.ai-field-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.ai-field-tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 4px;
  background: #f0f4ff; color: #3b82f6; font-size: 11px;
  border: 1px solid #dbeafe;
}
.ai-field-tag em { font-style: normal; color: #60a5fa; font-size: 10px; }
.ai-empty-suggestions { margin-top: 24px; width: 100%; }
.ai-suggestion-title { font-size: 11px; color: #94a3b8; font-weight: 500; margin-bottom: 8px; }
.ai-suggestion-item {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; border-radius: 8px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  font-size: 12px; color: #64748b; cursor: pointer;
  transition: all 0.15s;
}
.ai-suggestion-item:hover { background: #f1f5f9; border-color: #cbd5e1; color: #334155; }
.ai-suggestion-item svg { color: #94a3b8; flex-shrink: 0; }

/* ============ Message Layout ============ */
.ai-msg { margin-bottom: 20px; }
.ai-msg-user { display: flex; gap: 10px; align-items: flex-start; }
.ai-msg-assistant { display: flex; gap: 10px; align-items: flex-start; }
.ai-msg-avatar {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}
.user-avatar { background: #3b82f6; color: #fff; }
.ai-avatar { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
.ai-msg-content {
  flex: 1;
  min-width: 0;
}

/* ============ User Bubble ============ */
.user-bubble {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 12px 12px 4px 12px;
  background: #3b82f6;
  color: #fff;
  font-size: 12px;
  line-height: 1.6;
  max-width: 100%;
  word-break: break-word;
}
.user-bubble :deep(code) {
  background: rgba(255,255,255,0.15);
  padding: 1px 4px; border-radius: 3px;
  font-size: 11px;
}
.user-bubble :deep(pre) {
  background: rgba(0,0,0,0.15);
  padding: 8px; border-radius: 6px;
  overflow-x: auto; font-size: 11px;
  margin: 6px 0;
}
.ai-msg-attachments { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px; }
.ai-attach-file {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 6px;
  background: rgba(255,255,255,0.15);
  font-size: 10px; color: rgba(255,255,255,0.85);
}

/* ============ Thinking Dots ============ */
.ai-thinking {
  padding: 12px 4px;
}
.ai-thinking-dots {
  display: flex; gap: 4px; align-items: center;
}
.ai-thinking-dots span {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #94a3b8;
  animation: thinking-bounce 1.4s ease-in-out infinite;
}
.ai-thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
.ai-thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes thinking-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ============ Text Block ============ */
.ai-text-block {
  font-size: 13px;
  line-height: 1.7;
  color: #334155;
  margin: 2px 0;
}
.ai-text-block :deep(p) { margin: 6px 0; }
.ai-text-block :deep(ul), .ai-text-block :deep(ol) { margin: 4px 0; padding-left: 20px; }
.ai-text-block :deep(li) { margin: 2px 0; }
.ai-text-block :deep(code) {
  font-size: 11px;
  background: #eef2ff;
  color: #4f46e5;
  padding: 1px 5px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}
.ai-text-block :deep(pre) {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 8px;
  padding: 14px 16px;
  overflow-x: auto;
  font-size: 11px;
  line-height: 1.6;
  margin: 10px 0;
  border: 1px solid #1e293b;
  max-height: 400px;
  overflow-y: auto;
}
.ai-text-block :deep(.ai-think-box) {
  margin: 8px 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  overflow: hidden;
}
.ai-text-block :deep(.ai-think-box summary) {
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  outline: none;
  background: #f1f5f9;
}
.ai-text-block :deep(.ai-think-box summary::-webkit-details-marker) {
  display: none;
}
.ai-text-block :deep(.ai-think-box summary::before) {
  content: '▶';
  display: inline-block;
  margin-right: 6px;
  font-size: 9px;
  transition: transform 0.2s;
}
.ai-text-block :deep(.ai-think-box[open] summary::before) {
  transform: rotate(90deg);
}
.ai-text-block :deep(.ai-think-content) {
  padding: 10px 12px;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.5;
  white-space: pre-wrap;
}
.ai-text-block :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
  font-size: inherit;
}
.ai-text-block :deep(h1), .ai-text-block :deep(h2), .ai-text-block :deep(h3) {
  margin: 12px 0 6px;
  color: #1e293b;
}
.ai-text-block :deep(h1) { font-size: 15px; }
.ai-text-block :deep(h2) { font-size: 14px; }
.ai-text-block :deep(h3) { font-size: 13px; }
.ai-text-block :deep(a) { color: #3b82f6; text-decoration: underline; }
.ai-text-block :deep(strong) { color: #1e293b; }
.ai-text-block :deep(blockquote) {
  border-left: 3px solid #e2e8f0;
  padding-left: 12px;
  color: #64748b;
  margin: 8px 0;
}

/* ============ Thought Block ============ */
.ai-thought-block {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px 0;
  margin: 4px 0;
}
.ai-thought-icon {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
  margin-top: 2px;
}
.ai-thought-text {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
  line-height: 1.5;
}

/* ============ Tool Card ============ */
.ai-tool-card {
  margin: 6px 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #fafbfc;
  transition: box-shadow 0.15s;
}
.ai-tool-card:hover { box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.ai-tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
}
.ai-tool-icon {
  width: 24px; height: 24px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  border: 1px solid;
}
.bash-icon { background: #1e293b; border-color: #334155; color: #34d399; }
.edit-icon { background: #eef2ff; border-color: #e0e7ff; color: #6366f1; }
.search-icon { background: #f0f9ff; border-color: #e0f2fe; color: #0ea5e9; }
.default-icon { background: #f8fafc; border-color: #e2e8f0; color: #64748b; }
.ai-tool-name {
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #475569;
}
.ai-tool-desc {
  flex: 1;
  color: #94a3b8;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ai-tool-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}
.ai-tool-badge.running { background: #f1f5f9; color: #64748b; }
.ai-tool-badge.failed { background: #fef2f2; color: #ef4444; }
.ai-tool-badge.done { background: #f0fdf4; color: #16a34a; }
.ai-chevron { color: #94a3b8; transition: transform 0.2s; flex-shrink: 0; }
.ai-chevron.rotated { transform: rotate(180deg); }
.ai-tool-body { border-top: 1px solid #e2e8f0; padding: 12px; background: #fff; }
.ai-tool-section { margin-bottom: 10px; }
.ai-tool-section:last-child { margin-bottom: 0; }
.ai-tool-label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
.ai-tool-body pre {
  font-size: 10px;
  color: #475569;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
  background: #f8fafc;
  padding: 8px;
  border-radius: 6px;
  overflow-x: auto;
}
.ai-result-text { color: #6366f1 !important; }

/* ============ Error Card ============ */
.ai-error-card {
  margin: 8px 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #fecaca;
  background: #fef2f2;
}
.ai-error-header {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px;
  font-size: 11px; font-weight: 600;
  color: #dc2626;
  border-bottom: 1px solid #fecaca;
}
.ai-error-body {
  padding: 10px 12px;
  font-size: 11px;
  color: #991b1b;
  white-space: pre-wrap;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}
.ai-retry-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 12px; border-radius: 6px;
  background: #fef2f2; color: #dc2626;
  border: 1px solid #fca5a5;
  font-size: 11px; font-weight: 500; cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 12px;
  margin-bottom: 12px;
}
.ai-retry-btn:hover { background: #fee2e2; border-color: #ef4444; }

/* ============ Stop Button ============ */
.ai-stop-bar { margin-top: 8px; }
.ai-stop-button {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 11px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.15s;
}
.ai-stop-button:hover { background: #fef2f2; border-color: #fecaca; }

/* ============ Input Area ============ */
.ai-input-area {
  border-top: 1px solid #e2e8f0;
  padding: 12px 14px 14px;
  background: #fafbfc;
  flex-shrink: 0;
}
.ai-attach-bar {
  display: flex; flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}
.ai-attach-chip {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 10px;
  background: #eef2ff; border: 1px solid #e0e7ff;
  border-radius: 6px;
  font-size: 10px; color: #4f46e5;
}
.ai-chip-remove {
  cursor: pointer; font-size: 14px;
  line-height: 1; opacity: 0.6;
}
.ai-chip-remove:hover { opacity: 1; }
.ai-input-wrap {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: border-color 0.15s, box-shadow 0.15s;
  overflow: hidden;
}
.ai-input-wrap:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
}
.ai-textarea {
  width: 100%;
  border: none;
  padding: 10px 14px;
  font-size: 12px;
  font-family: inherit;
  resize: none;
  outline: none;
  line-height: 1.5;
  min-height: 40px;
  max-height: 120px;
  color: #1e293b;
}
.ai-textarea::placeholder { color: #94a3b8; }
.ai-input-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 6px 8px;
}
.ai-tool-btn {
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  color: #94a3b8;
  display: flex;
  transition: all 0.15s;
}
.ai-tool-btn:hover { background: #f1f5f9; color: #64748b; }
.ai-file-input { display: none; }
.ai-input-right { display: flex; align-items: center; gap: 8px; }
.ai-char-count { font-size: 10px; color: #cbd5e1; font-variant-numeric: tabular-nums; }
.ai-btn-send {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.ai-btn-send:hover:not(.disabled) { background: #2563eb; }
.ai-btn-send.disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; }

/* ============ Scrollbar ============ */
.ai-chat-messages::-webkit-scrollbar { width: 4px; }
.ai-chat-messages::-webkit-scrollbar-track { background: transparent; }
.ai-chat-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
.ai-chat-messages::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
</style>
