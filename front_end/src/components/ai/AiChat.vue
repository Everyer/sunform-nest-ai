<template>
  <div class="ai-chat">
    <!-- Messages List -->
    <div class="ai-chat-messages" ref="msgRef">
      <!-- Empty state -->
      <div v-if="messages.length === 0" class="ai-welcome">
        <div class="welcome-card">
          <div class="spark-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #7c3aed)" stroke-width="1.5"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>
          </div>
          <h3>AI 页面智能设计</h3>
          <p>描述你想要的表单布局，我将为您自动生成代码</p>
          
          <div class="ai-empty-fields" v-if="formFields.length">
            <div class="ai-empty-fields-title">可用表单字段：</div>
            <div class="ai-field-tags">
              <span v-for="f in formFields" :key="f.fieldKey || f.key" class="ai-field-tag">
                {{ f.fieldLabel || f.label || f.key }}
                <em class="field-type">{{ f.fieldType || f.type }}</em>
              </span>
            </div>
          </div>

          <div class="ai-empty-suggestions">
            <div class="ai-suggestion-title">试试点击以下建议：</div>
            <div class="suggestion-list">
              <div class="sug-item" @click="fillSuggestion('将请假类型和天数放在第一行，下面放开始时间和结束时间，底部放事由')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sug-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>"第一行并排放置请假类型和天数，之后单独排事由"</span>
              </div>
              <div class="sug-item" @click="fillSuggestion('设计一个精美的两栏表单，包含申请人、部门、日期、以及详细原因说明，带阴影卡片背景')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sug-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>"精美两栏表单卡片，包含基础信息和原因说明"</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div v-for="msg in messages" :key="msg.id" class="msg-wrapper" :class="msg.role">
        <div class="avatar" :class="msg.role">{{ msg.role === 'user' ? 'U' : 'AI' }}</div>
        <div class="msg-body">
          <!-- 等待流式输出 -->
          <div v-if="!msg.blocks?.length && msg.isThinking" class="thinking-loading"><span></span><span></span><span></span></div>

          <!-- 新的 Blocks 渲染 (Text, Thought, ToolCall, Patch, Error) -->
          <template v-for="(block, bIdx) in msg.blocks" :key="bIdx">
            <!-- Text Block -->
            <div v-if="block.type === 'text'" class="msg-bubble" v-html="renderMarkdown(wrapWithMarkdown(block.content))"></div>
            
            <!-- Thought Block -->
            <div v-else-if="block.type === 'thought' && block.content && block.content.trim()" class="thought-wrapper">
              <div class="thought-header" @click="() => { const b = msg.blocks[bIdx]; if (b) b.expanded = !b.expanded }">
                <span class="thought-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.04-2.44V7a2.5 2.5 0 0 1 4-2"/><path d="M14.5 12.5A2.5 2.5 0 0 1 17 10h3a2.5 2.5 0 0 1 0 5h-3a2.5 2.5 0 0 1-2.5-2.5"/></svg>
                </span>
                <span class="thought-title">深度思考</span>
                <span class="thought-arrow" :class="{ expanded: block.expanded }">▼</span>
              </div>
              <div v-show="block.expanded" class="thought-content" v-html="renderMarkdown(block.content)"></div>
            </div>

            <!-- ToolCall Block -->
            <div v-else-if="block.type === 'tool_call'" class="tool-step" :class="block.name === 'Bash' ? 'tool-bash' : 'tool-default'">
              <div class="tool-header" @click="block.expanded = !block.expanded">
                <div class="tool-icon-wrap" :class="block.name === 'Bash' ? 'bash-icon' : 'default-icon'">
                  <span v-html="getToolIcon(block.name)"></span>
                </div>
                <span class="tool-name" :class="block.name === 'Bash' ? 'bash-name' : ''">{{ block.name }}</span>
                <span class="tool-summary">{{ getToolSummary(block) }}</span>
                <span v-if="block.status === 'running'" class="tool-status status-running">
                  <span class="running-dot"></span> 执行中
                </span>
                <span v-else-if="block.status === 'failed'" class="tool-status status-failed">失败</span>
                <span v-else-if="block.status === 'done'" class="tool-status status-done">完成</span>
              </div>
              <!-- Bash 命令输出 -->
              <div v-if="block.expanded && block.name === 'Bash'" class="tool-detail bash-detail">
                <div class="bash-cmd"><span class="bash-prompt">$</span> {{ block.input.command }}</div>
                <div v-if="block.result" class="bash-output"><pre>{{ formatBashResult(block.result) }}</pre></div>
              </div>
              <!-- 其他工具细节 -->
              <div v-if="block.expanded && block.name !== 'Bash'" class="tool-detail">
                <pre class="tool-input">{{ JSON.stringify(block.input, null, 2) }}</pre>
                <div v-if="block.result" class="tool-result"><pre>{{ formatResult(block.result) }}</pre></div>
              </div>
            </div>

            <!-- Patch Block -->
            <div v-else-if="block.type === 'patch'" class="patch-card">
              <div class="patch-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>已自动应用局部代码补丁</span>
              </div>
              <div class="patch-content" v-html="renderMarkdown(block.content)"></div>
            </div>

            <!-- Error Block -->
            <div v-else-if="block.type === 'error'" class="msg-error">
              <div class="error-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              </div>
              <span>{{ block.content }}</span>
              <button class="retry-btn" @click="handleRetry">重试</button>
            </div>
          </template>

          <!-- Stop button during generation -->
          <div v-if="msg === messages[messages.length - 1] && loading" class="ai-stop-bar">
            <button class="ai-stop-button" @click="handleStop">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
              停止生成
            </button>
          </div>

          <!-- 附件预览 -->
          <div v-if="msg.attachments?.length" class="msg-attachments">
            <div v-for="att in msg.attachments" :key="att.path" class="att-preview" @click="previewAttachment(att)">
              <img :src="att.url || '/adminApi/agent/attachments/view?path=' + att.path" />
              <span>{{ att.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading: 仅在没有任何助理消息时显示 -->
      <div v-if="loading && !messages.some(m => m.role === 'assistant')" class="msg-wrapper assistant loading-only">
        <div class="msg-body">
          <div class="thinking-loading"><span></span><span></span><span></span></div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="ai-input-container">
      <!-- 附件预览 -->
      <div v-if="attachments.length" class="attachment-previews">
        <div v-for="(att, idx) in attachments" :key="idx" class="att-chip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          <span>{{ att.name }}</span>
          <span class="remove-chip" @click="attachments.splice(idx, 1)">×</span>
        </div>
      </div>

      <div class="input-row">
        <textarea
          ref="inputRef"
          v-model="inputText"
          class="ai-textarea"
          :placeholder="inputPlaceholder"
          @keydown.enter.exact.prevent="onEnterSend"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
          @paste="handlePaste"
        ></textarea>
        <div class="tool-actions">
          <label class="tool-btn" title="上传附件">
            <input type="file" multiple @change="handleFileSelect" class="hidden-input" />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </label>
          <button class="tool-btn" title="清空会话" @click="handleClear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
          </button>
          <button
            class="send-btn"
            :disabled="(!inputText.trim() && !attachments.length) || loading"
            @click="handleSend"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
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
const isComposing = ref(false)

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

function onEnterSend() {
  if (isComposing.value) return
  handleSend()
}

async function handleSend() {
  const text = inputText.value.trim()
  if ((!text && !attachments.value.length) || loading.value) return

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
  // 获取响应式代理对象，确保 Vue 能监听到对其属性（例如 blocks 数组）的所有流式修改
  const reactiveMsg = messages.value[messages.value.length - 1]

  loading.value = true
  scrollToBottom()

  const sid = props.sessionId || localStorage.getItem(SESSION_KEY)
  if (!sid) {
    reactiveMsg.isThinking = false
    reactiveMsg.blocks.push({ type: 'text', content: '⚠️ **Agent 服务不可用**\n\n请确保后端已启动并配置了 `AI_AGENT_API_KEY` 环境变量。' })
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
              reactiveMsg.blocks.push({ type: 'error', content: errorMsg })
              loading.value = false
            } else if (currentEventType === 'stream' && data.event) {
              handleStreamEvent(data.event, reactiveMsg)
              await new Promise(r => requestAnimationFrame(r))
              await new Promise(r => setTimeout(r, 0))
            }
          } catch {}
        }
      }
    }
  } catch (e) {
    reactiveMsg.isThinking = false
    reactiveMsg.blocks.push({ type: 'error', content: `连接失败: ${e.message}` })
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

  switch (event.type) {
    case 'text': {
      let content = event.content || ''
      const isReasoning = event.isReasoning || false

      if (isReasoning) {
        appendBlock(msg, { type: 'thought', content, expanded: false })
      } else {
        // 检测 <think> 标签（支持跨流式事件）
        if (content.includes('<think>')) {
          msg._insideThink = true
          const parts = content.split('<think>')
          if (parts[0]) appendBlock(msg, { type: 'text', content: parts[0] })
          if (parts[1]) {
            const after = parts[1].split('</think>')
            const thinkContent = after[0]
            const trimmed = thinkContent.replace(/^\n+/, '')
            if (trimmed) appendBlock(msg, { type: 'thought', content: trimmed, expanded: false })
            if (after[1]) {
              appendBlock(msg, { type: 'text', content: after[1] })
              msg._insideThink = false
            }
            if (!after[1]) msg._insideThink = true
          }
        } else if (content.includes('</think>')) {
          msg._insideThink = false
          const parts = content.split('</think>')
          if (parts[0]) {
            const trimmed = parts[0].replace(/^\n+/, '')
            if (trimmed) {
              const last = msg.blocks[msg.blocks.length - 1]
              if (last?.type === 'thought') { last.content += trimmed } else { appendBlock(msg, { type: 'thought', content: trimmed, expanded: false }) }
            }
          }
          if (parts[1]) appendBlock(msg, { type: 'text', content: parts[1] })
        } else if (msg._insideThink) {
          const last = msg.blocks[msg.blocks.length - 1]
          if (last?.type === 'thought') { last.content += content } else { appendBlock(msg, { type: 'thought', content, expanded: false }) }
        } else {
          appendBlock(msg, { type: 'text', content })
        }
      }

      // 流式更新预览
      const combined = msg.blocks.filter(b => b.type === 'text').map(b => b.content).join('')
      if (combined && (combined.includes('<template') || combined.includes('v-model') || combined.includes('n-') || combined.includes('<script') || combined.includes('<style'))) {
        emit('code-generated', combined)
      }
      break
    }
    case 'tool_call':
      msg.isThinking = false
      appendBlock(msg, {
        type: 'tool_call', id: event.toolCall.id, name: event.toolCall.name,
        input: event.toolCall.input, status: 'running', expanded: false, result: null
      })
      
      // Keep the original emit logic for ReplaceCode active and functional!
      if (event.toolCall.name === 'ReplaceCode') {
        const input = event.toolCall.input || {}
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
      break
    case 'tool_result': {
      const block = msg.blocks.find(b => b.type === 'tool_call' && b.id === event.toolCall.id)
      if (block) {
        block.result = event.toolCall.result
        block.status = event.toolCall.result?.success === false ? 'failed' : 'done'
      }
      break
    }
  }
  scrollToBottom()
}

function appendBlock(msg, block) {
  const last = msg.blocks[msg.blocks.length - 1]
  if (block.type === 'text' && last?.type === 'text') {
    last.content += block.content
  } else if (block.type === 'thought' && last?.type === 'thought') {
    last.content += block.content
  } else {
    // 只要是非空字符串（例如新的一行 \n 或空格 \t ），都可以作为首字符存入，不进行 trim() 过滤
    if (block.content !== undefined && block.content !== '') {
      msg.blocks.push(block)
    }
  }
}

// ========== Attachments ==========

async function uploadFile(file) {
  try {
    const fd = new FormData()
    fd.append('file', file, file.name || 'clipboard.png')
    const res = await fetch('/adminApi/agent/attachments/upload', { method: 'POST', body: fd })
    const json = await res.json()
    // 兼容全局 TransformInterceptor 包裹响应
    const data = json.data || json
    if (data.success) {
      attachments.value.push({ name: file.name || '截图.png', path: data.path, url: data.url || '' })
    }
  } catch (e) {
    console.error('Upload failed:', e)
  }
}

const handlePaste = async (e) => {
  const cbd = e.clipboardData
  if (!cbd) return
  for (const item of cbd.items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (file) await uploadFile(file)
    }
  }
}

const handleFileSelect = async (e) => {
  for (const file of e.target.files) {
    await uploadFile(file)
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
    return marked.parse(text)
  } catch {
    return text
  }
}

function getToolIcon(name) {
  const icons = {
    Bash: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 11l2 2-2 2"/><path d="M11 15h4"/></svg>',
    Read: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14.5 2 14.5 7.5 20 7.5"/></svg>',
    Edit: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    Write: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14.5 2 14.5 7.5 20 7.5"/><line x1="16" x2="8" y1="12" y2="12"/><line x1="12" x2="12" y1="16" y2="8"/></svg>',
    Glob: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    Grep: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="8" x2="14" y1="11" y2="11"/></svg>',
    Env: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16"/><path d="M4 20V4"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
  }
  return icons[name] || '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
}

function getToolSummary(block) {
  if (['Read', 'Edit', 'Write'].includes(block.name)) return block.input.file_path?.split('/').pop() || block.input.file_path || ''
  if (block.name === 'Bash') return block.input.command || ''
  return ''
}

function formatResult(res) {
  return typeof res === 'string' ? res : JSON.stringify(res, null, 2)
}

function formatBashResult(res) {
  if (typeof res === 'string') { try { res = JSON.parse(res) } catch { return res } }
  if (res && typeof res === 'object') {
    let out = ''
    if (res.stdout) out += res.stdout
    if (res.stderr) out += '\n' + res.stderr
    return out || JSON.stringify(res, null, 2)
  }
  return String(res)
}

function previewAttachment(att) {
  const url = att.url || '/adminApi/agent/attachments/view?path=' + att.path
  window.open(url, '_blank')
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
  background: radial-gradient(circle at top right, rgba(124, 58, 237, 0.02), transparent 45%);
}
.ai-chat-messages::-webkit-scrollbar {
  width: 5px;
}
.ai-chat-messages::-webkit-scrollbar-track {
  background: transparent;
}
.ai-chat-messages::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.15);
  border-radius: 3px;
}
.ai-chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(124, 58, 237, 0.3);
}

/* ============ Welcome State ============ */
.ai-welcome {
  padding: 10px 0;
}
.welcome-card {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(124, 58, 237, 0.08);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.02);
}
.spark-icon {
  margin-bottom: 12px;
  display: inline-flex;
  justify-content: center;
  animation: float-spark 3s infinite ease-in-out;
}
@keyframes float-spark {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.welcome-card h3 {
  font-size: 15px;
  color: #111827;
  margin: 0 0 6px;
  font-weight: 700;
}
.welcome-card p {
  font-size: 11.5px;
  color: #6b7280;
  margin: 0 0 16px;
}

.ai-empty-fields {
  margin: 16px 0;
  width: 100%;
  text-align: left;
}
.ai-empty-fields-title {
  font-size: 11px;
  color: #8b5cf6;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.ai-field-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.ai-field-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(124, 58, 237, 0.05);
  color: #7c3aed;
  font-size: 11px;
  border: 1px solid rgba(124, 58, 237, 0.15);
  font-weight: 500;
  transition: all 0.2s;
}
.ai-field-tag:hover {
  background: rgba(124, 58, 237, 0.1);
  transform: translateY(-1px);
}
.ai-field-tag em {
  font-style: normal;
  color: #c084fc;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.ai-empty-suggestions {
  margin-top: 16px;
  width: 100%;
  text-align: left;
}
.ai-suggestion-title {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 8px;
}
.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sug-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  padding: 10px 14px;
  background: rgba(249, 250, 251, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 10px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
}
.sug-item:hover {
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
  transform: translateX(4px);
}
.sug-item:active {
  transform: scale(0.97) translateX(2px) !important;
  background: linear-gradient(135deg, #6d28d9, #4f46e5) !important;
  color: #fff !important;
  border-color: transparent !important;
}
.sug-icon {
  color: #a78bfa;
  flex-shrink: 0;
  transition: color 0.2s;
}
.sug-item:hover .sug-icon {
  color: #fff;
}

/* ============ Message Rows ============ */
.msg-wrapper {
  display: flex;
  gap: 10px;
  max-width: 100%;
}
.msg-wrapper.user {
  flex-direction: row-reverse;
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-top: 2px;
}
.avatar.user {
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  color: #fff;
}
.avatar.assistant {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #4b5563;
  border: 1px solid #e5e7eb;
}
.msg-body {
  flex: 1;
  max-width: 86%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.msg-wrapper.user .msg-body {
  align-items: flex-end;
}

/* ============ Bubbles ============ */
.msg-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 12.5px;
  line-height: 1.6;
  word-break: break-word;
}
.msg-wrapper.user .msg-bubble {
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
  color: #fff;
  border-top-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
}
.msg-wrapper.assistant .msg-bubble {
  background: #fff;
  color: #1f2937;
  border-top-left-radius: 4px;
  border: 1px solid rgba(124, 58, 237, 0.06);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.01);
}
.msg-bubble :deep(p) {
  margin: 6px 0;
}
.msg-bubble :deep(pre) {
  background: #18181b;
  color: #f3f4f6;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 11px;
  margin: 8px 0;
  border: 1px solid #27272a;
}
.msg-bubble :deep(code) {
  font-size: 11px;
  font-family: SFMono-Regular, Consolas, Monaco, monospace;
}
.msg-bubble :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 4px 0;
}

/* ===== Thought Panel ===== */
.thought-wrapper {
  border-left: 3px solid #a78bfa;
  padding-left: 10px;
  background: rgba(124, 58, 237, 0.02);
  border-radius: 6px;
  margin: 4px 0;
  transition: all 0.3s ease;
  border: 1px solid rgba(124, 58, 237, 0.05);
  border-left-width: 3px;
}
.thought-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  cursor: pointer;
  user-select: none;
  font-size: 11px;
  color: #6d28d9;
  font-weight: 600;
}
.thought-header:hover {
  background: rgba(124, 58, 237, 0.04);
}
.thought-icon {
  color: #7c3aed;
  display: flex;
  align-items: center;
}
.thought-title {
  flex: 1;
  font-weight: 700;
  font-size: 10.5px;
  letter-spacing: 0.2px;
}
.thought-arrow {
  font-size: 8px;
  transition: transform 0.25s ease;
  color: #a78bfa;
}
.thought-arrow.expanded {
  transform: rotate(180deg);
}
.thought-content {
  padding: 8px 10px;
  font-size: 11px;
  line-height: 1.6;
  color: #4b5563;
  border-top: 1px dashed rgba(124, 58, 237, 0.06);
  background: rgba(255, 255, 255, 0.4);
}

/* ===== Tool Call Step ===== */
.tool-step {
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.01);
  margin: 4px 0;
}
.tool-bash {
  background: #18181b;
  border: 1px solid #27272a;
}
.tool-default {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
}
.tool-icon-wrap {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tool-icon-wrap :deep(svg) {
  width: 12px;
  height: 12px;
}
.bash-icon {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  color: #34d399;
}
.default-icon {
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.15);
  color: #7c3aed;
}
.tool-name {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.bash-name {
  color: #34d399;
}
.tool-default .tool-name {
  color: #7c3aed;
}
.tool-summary {
  flex: 1;
  font-size: 10.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tool-bash .tool-summary {
  color: #a1a1aa;
  font-family: monospace;
}
.tool-default .tool-summary {
  color: #64748b;
}
.tool-status {
  font-size: 9px;
  font-weight: 700;
  margin-left: auto;
  padding: 2px 6px;
  border-radius: 4px;
}
.status-running {
  color: #34d399;
  background: rgba(52, 211, 153, 0.1);
  display: flex;
  align-items: center;
  gap: 4px;
}
.status-failed {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}
.status-done {
  color: #34d399;
  background: rgba(52, 211, 153, 0.1);
}
.running-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #34d399;
  animation: pulse-running 1s infinite;
}
@keyframes pulse-running {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.tool-detail {
  border-top: 1px solid rgba(255,255,255,0.06);
}
.tool-default .tool-detail {
  border-top-color: #e2e8f0;
}
.bash-detail {
  padding: 0;
}
.bash-cmd {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: monospace;
  font-size: 10.5px;
  color: #f4f4f5;
  background: #09090b;
}
.bash-prompt {
  color: #34d399;
  font-weight: 700;
}
.bash-output {
  padding: 8px 12px;
  max-height: 200px;
  overflow-y: auto;
  background: #18181b;
}
.bash-output pre {
  margin: 0;
  font-family: monospace;
  font-size: 10px;
  color: #d4d4d8;
  white-space: pre-wrap;
  line-height: 1.5;
}
.tool-input {
  margin: 0;
  padding: 8px 12px;
  font-family: monospace;
  font-size: 10px;
  color: #64748b;
  background: #f1f5f9;
  white-space: pre-wrap;
}
.tool-result {
  border-top: 1px solid #e2e8f0;
}
.tool-result pre {
  margin: 0;
  padding: 8px 12px;
  font-family: monospace;
  font-size: 10px;
  color: #7c3aed;
  background: rgba(124,58,237,0.02);
  white-space: pre-wrap;
}

/* ===== Patch Card Style ===== */
.patch-card {
  margin: 6px 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #dcfce7;
  background: #f0fdf4;
  color: #14532d;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
}
.patch-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-weight: 700;
  font-size: 11.5px;
  border-bottom: 1px solid #dcfce7;
}
.patch-content {
  padding: 10px 14px;
  font-size: 12px;
  line-height: 1.6;
}
.patch-content :deep(pre) {
  background: #18181b;
  color: #f3f4f6;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 11px;
  margin: 8px 0;
  border: 1px solid #27272a;
}
.patch-content :deep(code) {
  font-size: 11.5px;
  font-family: SFMono-Regular, Consolas, Monaco, monospace;
}

/* ===== Error Box ===== */
.msg-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 10px;
  font-size: 11.5px;
  color: #dc2626;
  min-width: 0;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.03);
}
.msg-error span {
  flex: 1;
  min-width: 0;
  word-break: break-all;
  line-height: 1.5;
}
.error-icon {
  display: flex;
  flex-shrink: 0;
  margin-top: 2px;
}
.retry-btn {
  margin-left: auto;
  padding: 3px 8px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  color: #b91c1c;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.retry-btn:hover {
  background: #fecaca;
  transform: translateY(-0.5px);
}
.retry-btn:active {
  transform: scale(0.93) translateY(0) !important;
  background: #fca5a5 !important;
}

/* ===== Attachments Group ===== */
.msg-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}
.att-preview {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(229, 231, 235, 0.8);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.2s;
}
.att-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.att-preview img {
  max-width: 80px;
  max-height: 60px;
  object-fit: cover;
  display: block;
}
.att-preview span {
  display: none;
}

/* ===== Loading State ===== */
.thinking-loading {
  display: flex;
  gap: 4px;
  padding: 10px 4px;
}
.thinking-loading span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9ca3af;
  animation: think-dots 1.4s infinite alternate;
}
.thinking-loading span:nth-child(2) {
  animation-delay: 0.2s;
}
.thinking-loading span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes think-dots {
  0% { transform: scale(0.6); opacity: 0.4; }
  100% { transform: scale(1.2); opacity: 1; }
}

.ai-stop-bar {
  margin-top: 6px;
}
.ai-stop-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 11px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.15s;
}
.ai-stop-button:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

/* ===== Input Container ===== */
.ai-input-container {
  padding: 12px 14px 14px;
  background: rgba(255, 255, 255, 0.85);
  border-top: 1px solid rgba(124, 58, 237, 0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
  backdrop-filter: blur(8px);
}
.attachment-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.att-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  background: rgba(243, 244, 246, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.8);
  color: #4b5563;
}
.remove-chip {
  cursor: pointer;
  font-weight: bold;
  color: #ef4444;
  margin-left: 4px;
  font-size: 12px;
}
.input-row {
  display: flex;
  flex-direction: column;
  background: rgba(249, 250, 251, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 14px;
  padding: 8px 12px;
  transition: all 0.3s ease;
}
.input-row:focus-within {
  border-color: #7c3aed;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
}
.ai-textarea {
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  width: 100%;
  height: 48px;
  font-size: 12.5px;
  line-height: 1.5;
  color: #1f2937;
  font-family: inherit;
}
.tool-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
  border-top: 1px solid rgba(229, 231, 235, 0.4);
  padding-top: 6px;
}
.tool-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.tool-btn:hover {
  background: rgba(243, 244, 246, 0.8);
  color: #4b5563;
}
.tool-btn:active {
  transform: scale(0.9) !important;
  background: rgba(124, 58, 237, 0.1) !important;
  color: #7c3aed !important;
}
.hidden-input {
  display: none;
}
.send-btn {
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.25);
  margin-left: auto;
  box-shadow: 0 4px 10px rgba(124, 58, 237, 0.2);
}
.send-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}
.send-btn:not(:disabled):hover {
  background: linear-gradient(135deg, #6d28d9, #4f46e5);
  transform: scale(1.1) translateY(-1px);
  box-shadow: 0 6px 14px rgba(124, 58, 237, 0.3);
}
.send-btn:not(:disabled):active {
  transform: scale(0.92) translateY(0) !important;
  background: linear-gradient(135deg, #5b21b6, #3730a3) !important;
  box-shadow: 0 2px 6px rgba(124, 58, 237, 0.2) !important;
}
</style>
