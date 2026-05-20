<template>
  <div class="global-ai-container">
    <!-- FAB 按钮 -->
    <div
      class="ai-fab"
      :class="{ 'has-form': store.activeSchema, 'chat-open': isOpen }"
      @click="toggleChat"
      title="AI 智能助手"
    >
      <div class="ai-fab-glow"></div>
      <div class="ai-fab-icon">
        <svg v-if="!isOpen" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" fill="currentColor" class="pulsing-core" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
      <span v-if="store.activeSchema" class="active-badge-dot"></span>
    </div>

    <!-- 全局 AI 智能面板 -->
    <transition name="panel-slide">
      <div v-if="isOpen" class="ai-panel">
        <!-- 面板头部 -->
        <div class="ai-panel-header">
          <div class="header-info">
            <span class="ai-title">AI 智能助手</span>
            <span class="ai-subtitle">智能填报与页面操控</span>
          </div>
          <div v-if="store.activeSchema" class="status-tag active">
            <span class="pulse-green"></span>
            表单已就绪
          </div>
          <div v-else class="status-tag">
            监听中
          </div>
        </div>

        <!-- 快捷动作条 -->
        <div v-if="hasActions" class="ai-actions-bar">
          <div class="action-tags">
            <span v-for="action in Object.keys(store.availableActions)" :key="action" class="action-tag" @click="triggerAction(action)">{{ action }}</span>
          </div>
        </div>

        <!-- 消息列表 -->
        <div ref="msgBoxRef" class="ai-messages">
          <!-- 空状态 -->
          <div v-if="messages.length === 0" class="ai-welcome">
            <div class="welcome-card">
              <div class="spark-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary, #7c3aed)" stroke-width="1.5"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>
              </div>
              <h3>您好，我是系统 AI 助手</h3>
              <p>可以通过我操控页面、填报表单</p>
              <div class="suggestion-list">
                <div v-for="(sug, idx) in suggestions" :key="idx" class="sug-item" @click="fillSuggestion(sug)">"{{ sug }}"</div>
              </div>
            </div>
          </div>

          <!-- 消息列表 -->
          <div v-for="msg in messages" :key="msg.id" class="msg-wrapper" :class="msg.role">
            <div class="avatar" :class="msg.role">{{ msg.role === 'user' ? 'U' : 'AI' }}</div>
            <div class="msg-body">
              <!-- 传统 Type 消息（兼容旧版） -->
              <div v-if="msg.type === 'action_execution'" class="execution-card action">
                <div class="exec-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div class="exec-text">已点击按钮：<strong>「{{ msg.metadata.action }}」</strong></div>
              </div>
              <div v-else-if="msg.type === 'fill_execution'" class="execution-card fill">
                <div class="exec-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                <div class="exec-text">已自动填充表单：</div>
                <pre class="exec-json">{{ JSON.stringify(msg.metadata.data, null, 2) }}</pre>
              </div>
              <div v-else-if="msg.type === 'plan_execution'" class="execution-card plan">
                <div class="exec-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <div class="exec-text">连锁计划：</div>
                <ul class="plan-steps">
                  <li v-for="(step, sIdx) in msg.metadata.steps" :key="sIdx" :class="{ done: sIdx < msg.metadata.currentStep }">
                    <span class="step-num">{{ sIdx + 1 }}</span>
                    <span class="step-desc">{{ step.type === 'action' ? `点击「${step.name}」` : step.intent || step.task || '自动任务' }}</span>
                  </li>
                </ul>
              </div>

              <!-- 等待流式输出 -->
              <div v-if="!msg.blocks?.length && msg.isThinking" class="thinking-loading"><span></span><span></span><span></span></div>

              <!-- 新的 Blocks 渲染 (Text, Thought, ToolCall, Error) -->
              <template v-for="(block, bIdx) in msg.blocks" :key="bIdx">
                <!-- Text Block -->
                <div v-if="block.type === 'text'" class="msg-bubble" v-html="renderMarkdown(block.content)"></div>
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
                <!-- Error Block -->
                <div v-else-if="block.type === 'error'" class="msg-error">
                  <div class="error-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  </div>
                  <span>{{ block.content }}</span>
                  <button class="retry-btn" @click="retryLastMessage">重试</button>
                </div>
              </template>

              <!-- 兼容旧版：纯文本 content 回退 -->
              <div v-if="!msg.blocks?.length && msg.content && !msg.type" class="msg-bubble" v-html="renderMarkdown(msg.displayContent || msg.content)"></div>

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

        <!-- 输入区域 -->
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
            <textarea ref="textRef" v-model="inputText" class="ai-textarea" placeholder="输入指令，支持粘贴图片/文件..."
              @keydown.enter.exact.prevent="onEnterSend"
              @compositionstart="isComposing = true"
              @compositionend="isComposing = false"
              @paste="handlePaste"></textarea>
            <div class="tool-actions">
              <label class="tool-btn" title="上传图片">
                <input type="file" accept="image/*" multiple @change="handleFileSelect" class="hidden-input" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </label>
              <button class="tool-btn" title="清空会话" @click="handleClear">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
              </button>
              <button class="send-btn" :disabled="(!inputText.trim() && !attachments.length) || loading" @click="handleSend">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useAiFillerStore } from '../../store/useAiFillerStore'
import { marked } from 'marked'

const store = useAiFillerStore()
const isOpen = ref(false)
const inputText = ref('')
const loading = ref(false)
const messages = ref([])
const attachments = ref([])
const textRef = ref(null)
const msgBoxRef = ref(null)
const reader = ref(null)

const SESSION_KEY = 'global_ai_session_id'
const sessionId = ref(null)
const lastUserQuery = ref('')
const isComposing = ref(false)

// 建议
const suggestions = computed(() => {
  const list = []
  if (store.activeSchema) list.push('帮我分析当前表单并填入测试数据')
  const actions = Object.keys(store.availableActions)
  if (actions.length) list.push(`点击「${actions[0]}」`)
  if (list.length === 0) {
    list.push('这个页面都有哪些字段？')
    list.push('帮我写一个简短的工作周报')
  }
  return list
})

const hasActions = computed(() => Object.keys(store.availableActions).length > 0)




onMounted(() => initSession(true))

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) nextTick(() => { textRef.value?.focus(); scrollToBottom() })
}

// ===== 会话管理 =====
async function initSession(force = false) {
  if (force) localStorage.removeItem(SESSION_KEY)
  const cached = localStorage.getItem(SESSION_KEY)
  if (cached && !force) { sessionId.value = cached; return }
  try {
    const res = await fetch('/adminApi/agent/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    if (res.ok) {
      const json = await res.json()
      const sid = json.sessionId || json.data?.sessionId
      sessionId.value = sid
      localStorage.setItem(SESSION_KEY, sid)
    }
  } catch (e) { console.error('Session init failed:', e) }
}

function fillSuggestion(text) { inputText.value = text; textRef.value?.focus() }

// ===== 发送（过滤 IME 输入法回车） =====
function onEnterSend() {
  if (isComposing.value) return
  handleSend()
}

// ===== 发送 =====
async function handleSend() {
  const text = inputText.value.trim()
  if (!text && !attachments.value.length) return
  if (loading.value) return
  inputText.value = ''
  lastUserQuery.value = text

  const userMsg = { id: 'u-' + Date.now(), role: 'user', content: text, attachments: [...attachments.value] }
  messages.value.push(userMsg)
  attachments.value = []
  loading.value = true
  scrollToBottom()
  await runAgentWithBlocks(userMsg)
}

// ===== 触发动作 =====
function triggerAction(actionName) {
  messages.value.push({ id: 'u-act-' + Date.now(), role: 'user', content: `触发动作：${actionName}` })
  messages.value.push({ id: 'sys-act-' + Date.now(), role: 'assistant', type: 'action_execution', metadata: { action: actionName } })
  store.executeAction(actionName)
  scrollToBottom()
}

// ===== 主 Agent 流程（Blocks 模式） =====
async function runAgentWithBlocks(userMsg) {
  let sid = sessionId.value || localStorage.getItem(SESSION_KEY)
  if (!sid) { await initSession(); sid = sessionId.value }

  messages.value.push({ id: 'a-' + Date.now(), role: 'assistant', blocks: [], isThinking: true })
  // 必须从响应式数组中取，否则 Vue 无法追踪对 blocks 的修改
  const reactiveMsg = messages.value[messages.value.length - 1]

  try {
    const response = await fetch('/adminApi/agent/message', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sid,
        content: userMsg.content,
        skill: 'aiFiller',
        formFields: store.activeSchema?.fields || undefined,
        availableActions: Object.keys(store.availableActions),
        attachments: userMsg.attachments?.map(a => ({ name: a.name, path: a.path })) || []
      })
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    reader.value = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let eventType = 'stream'

    while (true) {
      const { done, value } = await reader.value.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const t = line.trim()
        if (t.startsWith('event: ')) { eventType = t.slice(7).trim(); continue }
        if (!t.startsWith('data: ')) continue

        try {
          const data = JSON.parse(t.slice(6))
          if (eventType === 'done') { /* complete */ }
          else if (eventType === 'error') {
            const errContent = data.error || '未知错误'
            reactiveMsg.blocks.push({ type: 'error', content: errContent })
            loading.value = false
            if (errContent.includes('SESSION_NOT_FOUND:')) {
              const newSid = errContent.split('SESSION_NOT_FOUND:')[1]
              if (newSid) {
                sessionId.value = newSid
                localStorage.setItem(SESSION_KEY, newSid)
                messages.value.pop()
                messages.value.pop()
                await new Promise(r => setTimeout(r, 100))
                return runAgentWithBlocks(userMsg)
              }
            }
            if (errContent.includes('CONTEXT_TOO_LONG')) {
              localStorage.removeItem(SESSION_KEY)
              sessionId.value = null
              await initSession(true)
            }
          } else if (eventType === 'stream' && data.event) {
            handleStreamEvent(data.event, reactiveMsg)
            await new Promise(r => requestAnimationFrame(r))
            await new Promise(r => setTimeout(r, 0))
          }
        } catch {}
      }
    }
  } catch (e) {
    reactiveMsg.blocks.push({ type: 'text', content: `**错误**: ${e.message}` })
  }

  loading.value = false

  // 解析流式结果中的 JSON 执行指令 (兼容旧版 aiFiller)
  // 查找包含 JSON 执行指令的 text block（遍历所有 text block 以防中途有 tool_call 导致分割）
  let jsonSource = ''
  for (const b of reactiveMsg.blocks) {
    if (b.type === 'text' && b.content) {
      if (b.content.includes('"type"') && (b.content.includes('"plan"') || b.content.includes('"fill"') || b.content.includes('"action"'))) {
        jsonSource = b.content
        break
      }
    }
  }

  // 回退：如果没找到精准的，寻找包含 JSON 结构的任何 text block
  if (!jsonSource) {
    for (const b of reactiveMsg.blocks) {
      if (b.type === 'text' && b.content && b.content.includes('{') && b.content.includes('}')) {
        jsonSource = b.content
        break
      }
    }
  }

  // 还是没有，就查 Bash/工具执行结果（AI 可能用 echo 输出 JSON）
  if (!jsonSource) {
    for (const b of reactiveMsg.blocks) {
      if (b.type === 'tool_call' && b.result) {
        const r = typeof b.result === 'string' ? b.result : JSON.stringify(b.result)
        if (r.includes('"type"') && (r.includes('"plan"') || r.includes('"fill"') || r.includes('"action"'))) {
          jsonSource = r
          break
        }
      }
    }
  }
  if (jsonSource) {
    await parseFillJson(jsonSource, reactiveMsg)
  }

  scrollToBottom()
}

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
            // 去掉开头的换行
            const trimmed = thinkContent.replace(/^\n+/, '')
            if (trimmed) appendBlock(msg, { type: 'thought', content: trimmed, expanded: false })
            if (after[1]) {
              appendBlock(msg, { type: 'text', content: after[1] })
              msg._insideThink = false
            }
            // after[1] 存在说明 </think> 闭合了，否则还在 think 中
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
      break
    }
    case 'tool_call':
      msg.isThinking = false
      appendBlock(msg, {
        type: 'tool_call', id: event.toolCall.id, name: event.toolCall.name,
        input: event.toolCall.input, status: 'running', expanded: false, result: null
      })
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
  } else if ((block.type === 'text' || block.type === 'thought') && !(block.content && block.content.trim())) {
    // 跳过纯空白内容的 text/thought block（如单独的 \n 或空格）
  } else {
    msg.blocks.push(block)
  }
}

// ===== 兼容旧版 JSON 指令解析（事件驱动，可靠填入） =====
async function parseFillJson(text, msg) {
  if (!text) return
  let clean = text.replace(/```(?:json)?([\s\S]*?)```/g, '$1').trim()
  let parsed = null

  // 1. 尝试直接解析整个文本为 JSON
  try { parsed = JSON.parse(clean) } catch {}

  // 2. 提取所有顶级 JSON 对象，逐个检查 type 字段
  if (!parsed?.type) {
    const matches = clean.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g) || []
    for (const m of matches) {
      try {
        const obj = JSON.parse(m)
        if (obj.type) { parsed = obj; break }
      } catch {}
    }
  }

  if (!parsed?.type) return

  if (parsed.type === 'action') {
    messages.value.push({ id: 'exec-' + Date.now(), role: 'assistant', type: 'action_execution', metadata: { action: parsed.name } })
    store.executeAction(parsed.name)

    // 安全网：如果 AI 只返回了 action，但用户的原始意图包含填入/提交等关键词
    // 自动检测弹窗打开后的表单，继续执行填表流程
    const userIntent = lastUserQuery.value || ''
    const wantsFill = /填|数据|提交|保存|添加|图片|测试|submit|fill/i.test(userIntent)

    if (wantsFill) {
      await new Promise(r => setTimeout(r, 600)) // 等弹窗渲染
      try {
        const { schema } = await store.waitForFormReady(3000)

        // 从 AI 回复的所有内容中提取数据（思考 + 文本 + 工具返回结果）
        const allText = collectAllText(msg)
        const extractedData = parseIntentToFillData(allText, schema)
        const fieldCount = schema.fields?.length || 999
        const extractedCount = extractedData ? Object.keys(extractedData).length : 0

        if (extractedCount > 0 && extractedCount >= Math.ceil(fieldCount * 0.5)) {
          // 提取到足够多的字段，直接填入（快速路径）
          const shouldSubmit = /提交|确定|保存|submit/i.test(userIntent)
          messages.value.push({ id: 'sys-' + Date.now(), role: 'assistant', blocks: [{ type: 'text', content: `✅ 正在填入数据（提取到 ${extractedCount}/${fieldCount} 个字段）...` }] })
          scrollToBottom()
          await store.fillFormData(extractedData, shouldSubmit)
        } else {
          // 提取不到或不够完整，降级到 LLM 生成
          messages.value.push({ id: 'sys-' + Date.now(), role: 'assistant', blocks: [{ type: 'text', content: `🔄 **表单已就绪**：正在通过 AI 生成填入数据...` }] })
          scrollToBottom()
          loading.value = true
          await executeFillWorkflow(userIntent, schema)
        }
      } catch {
        // 没有弹出表单（可能 action 不是打开弹窗的操作），静默忽略
      }
    }

  } else if (parsed.type === 'fill') {
    messages.value.push({ id: 'exec-' + Date.now(), role: 'assistant', type: 'fill_execution', metadata: { data: parsed.data } })
    const ok = await store.fillFormData(parsed.data, !!parsed.submit)
    if (!ok) {
      messages.value.push({ id: 'warn-' + Date.now(), role: 'assistant', blocks: [{ type: 'text', content: '⚠️ 未检测到活跃的表单，数据填入失败。请先打开需要填写的表单。' }] })
    }

  } else if (parsed.type === 'plan') {
    const planMsg = { id: 'exec-' + Date.now(), role: 'assistant', type: 'plan_execution', metadata: { steps: parsed.steps, currentStep: 0 } }
    messages.value.push(planMsg)

    // 按顺序执行所有 steps
    for (let i = 0; i < parsed.steps.length; i++) {
      const step = parsed.steps[i]
      planMsg.metadata.currentStep = i + 1
      scrollToBottom()

      if (step.type === 'action') {
        // 执行按钮动作（如"新增"）
        store.executeAction(step.name)
        // 给弹窗/路由切换一点时间
        await new Promise(r => setTimeout(r, 600))

      } else if (step.type === 'fill' && step.data) {
        // 直接填入数据（等待表单就绪后自动填入）
        const ok = await store.fillFormData(step.data, !!step.submit)
        if (!ok) {
          messages.value.push({ id: 'warn-' + Date.now(), role: 'assistant', blocks: [{ type: 'text', content: `⚠️ 步骤 ${i + 1} 填入失败：未检测到活跃的表单` }] })
        }

      } else if (step.type === 'pending' || step.intent || step.task) {
        // intent 文本里通常已经包含了数据（如："岗位名称=采购员，岗位代码=cg0012"）
        // 优先本地解析，避免发起第二次慢速 LLM 请求
        const task = step.intent || step.task || ''
        const shouldSubmit = /提交|确定|保存|submit/i.test(task)

        try {
          const { schema } = await store.waitForFormReady(5000)

          // 尝试从 intent 文本直接提取键值对
          const extractedData = parseIntentToFillData(task, schema)

          if (extractedData && Object.keys(extractedData).length > 0) {
            // 本地提取成功，直接填入（快速路径）
            messages.value.push({ id: 'sys-' + Date.now(), role: 'assistant', blocks: [{ type: 'text', content: `✅ 正在填入数据...` }] })
            scrollToBottom()
            const ok = await store.fillFormData(extractedData, shouldSubmit)
            if (!ok) {
              messages.value.push({ id: 'warn-' + Date.now(), role: 'assistant', blocks: [{ type: 'text', content: `⚠️ 数据填入失败` }] })
            }
          } else {
            // 本地提取失败，降级到 LLM 生成
            messages.value.push({ id: 'sys-' + Date.now(), role: 'assistant', blocks: [{ type: 'text', content: `🔄 **表单已就绪**：正在通过 AI 处理「${task}」...` }] })
            scrollToBottom()
            loading.value = true
            await executeFillWorkflow(task, schema)
          }
        } catch (e) {
          messages.value.push({ id: 'warn-' + Date.now(), role: 'assistant', blocks: [{ type: 'text', content: `⚠️ ${e.message}` }] })
        }
      }
    }
  }
}

/**
 * 从所有 blocks 中收集文本内容（思考 + 正文 + 工具调用结果）
 */
function collectAllText(msg) {
  if (!msg?.blocks) return ''
  const parts = []
  for (const b of msg.blocks) {
    if (b.type === 'text' || b.type === 'thought') {
      parts.push(b.content || '')
    } else if (b.type === 'tool_call' && b.result) {
      const r = typeof b.result === 'string' ? b.result : JSON.stringify(b.result)
      parts.push(r)
    }
  }
  return parts.join('\n')
}

/**
 * 从 intent 文本中提取键值对，映射为表单字段数据
 * 策略：按 schema 字段的 label/key 精准搜索，避免通用正则被前缀文字干扰
 * 例如 "在弹出的岗位表单中填入数据：岗位名称=采购员，岗位编码=cg0012"
 *   → 直接查找 "岗位名称" 后面的值，不会被 "数据：" 干扰
 */
function parseIntentToFillData(intent, schema) {
  if (!intent || !schema?.fields?.length) return null

  const fields = schema.fields
  const result = {}
  let matched = 0

  // 策略1：按 schema 字段的 label 和 key 精准搜索
  for (const f of fields) {
    if (f.key in result) continue

    const names = [f.label, f.key].filter(Boolean)
    for (const name of names) {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // 匹配 label=value / label:value / label：value / label是value / label为value
      const re = new RegExp(escapedName + '\\s*(?:[=:：]|(?:应该|应)?[是为])\\s*([^,，;；、\\n]+)', 'i')
      const m = intent.match(re)
      if (m) {
        let value = m[1].trim()
        // 去掉末尾标点和"然后/并"等连接词
        value = value.replace(/[。.]+$/, '').replace(/(?:然后|并|，).*/s, '').trim()
        if (value) {
          result[f.key] = castValue(value, f.type)
          matched++
          break
        }
      }
    }
  }

  // 策略2：如果策略1没匹配到足够字段，用模糊匹配补充
  if (matched < fields.length) {
    // 提取文本中所有 "短词=值" 对（限制 key 长度 2-8 字符，避免长前缀干扰）
    const kvRegex = /([\u4e00-\u9fa5a-zA-Z_]{2,8})\s*(?:[=:：]|(?:应该|应)?[是为])\s*([^,，;；、\n=:：]+)/g
    let match
    while ((match = kvRegex.exec(intent)) !== null) {
      const name = match[1].trim()
      let value = match[2].trim()
      value = value.replace(/[。.]+$/, '').replace(/(?:然后|并).*/s, '').trim()
      if (!value || name.length < 2) continue

      const field = findBestMatchField(name, fields)
      if (field && !(field.key in result)) {
        result[field.key] = castValue(value, field.type)
        matched++
      }
    }
  }

  console.log('[AI Filler] 从文本提取到数据:', result, `(${matched}/${fields.length})`)
  return matched > 0 ? result : null
}

/**
 * 模糊匹配字段：精确 > 包含 > 子串
 * 例如 "岗位代码" 能匹配到 label "岗位编码"（共享 "岗位" + "码"）
 */
function findBestMatchField(name, fields) {
  const lower = name.toLowerCase()

  // 1. 精确匹配 label 或 key
  for (const f of fields) {
    if (f.label === name || f.key.toLowerCase() === lower) return f
  }

  // 2. 包含匹配：label 包含 name 或 name 包含 label
  for (const f of fields) {
    if (f.label.includes(name) || name.includes(f.label)) return f
    if (f.key.toLowerCase().includes(lower) || lower.includes(f.key.toLowerCase())) return f
  }

  // 3. 字符重叠度匹配（至少 50% 字符相同）
  let bestField = null, bestScore = 0
  for (const f of fields) {
    const score = charOverlap(name, f.label)
    if (score > bestScore && score >= 0.5) {
      bestScore = score
      bestField = f
    }
  }

  return bestField
}

/**
 * 计算两个字符串的字符重叠度 (0~1)
 */
function charOverlap(a, b) {
  if (!a || !b) return 0
  const setA = new Set(a)
  const setB = new Set(b)
  let common = 0
  for (const c of setA) { if (setB.has(c)) common++ }
  return common / Math.max(setA.size, setB.size)
}

/**
 * 根据目标类型转换字符串值
 */
function castValue(raw, type) {
  if (!raw) return raw
  switch (type) {
    case 'number':
      const n = Number(raw)
      return isNaN(n) ? 0 : n
    case 'boolean':
      return /^(true|1|是|启用|开|yes|on)$/i.test(raw)
    default:
      return raw
  }
}

// ===== 表单填报流程 =====
async function executeFillWorkflow(task, schema) {
  let sid = sessionId.value || localStorage.getItem(SESSION_KEY)
  let enhancedTask = task
  if (lastUserQuery.value) {
    if (/模拟|随机|测试|mock/i.test(lastUserQuery.value) && !/随机|测试|mock/i.test(enhancedTask)) enhancedTask += '，生成随机测试数据'
    if (/提交|保存|确定|发布/i.test(lastUserQuery.value) && !/提交|保存|确定|发布|submit/i.test(enhancedTask)) enhancedTask += '并自动提交'
  }
  try {
    const res = await fetch('/adminApi/agent/message', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, content: `填表任务：${enhancedTask}`, skill: 'aiFiller', formFields: schema.fields })
    })
    const msg = { id: 'a-fill-' + Date.now(), role: 'assistant', blocks: [] }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = '', full = '', evType = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      for (const line of buf.split('\n')) {
        const t = line.trim()
        if (t.startsWith('event: ')) evType = t.slice(7).trim()
        else if (t.startsWith('data: ')) {
          try {
            const d = JSON.parse(t.slice(6))
            if (evType === 'stream' && d.event?.type === 'text' && !d.event.isReasoning) full += d.event.content
          } catch {}
        }
      }
      buf = buf.split('\n').pop() || ''
    }
    if (full) {
      msg.blocks.push({ type: 'text', content: full })
      messages.value.push(msg)
      await parseFillJson(full, msg)
    }
  } catch (e) {
    messages.value.push({ id: 'err-' + Date.now(), role: 'assistant', blocks: [{ type: 'error', content: e.message }] })
  }
  loading.value = false
  scrollToBottom()
}

// ===== 上传附件 =====
async function uploadFile(file) {
  try {
    const fd = new FormData()
    fd.append('file', file, file.name || 'clipboard.png')
    const res = await fetch('/adminApi/agent/attachments/upload', { method: 'POST', body: fd })
    const json = await res.json()
    // 兼容全局 TransformInterceptor 包裹响应: json.success 为外层 wrapper, json.data 为内层实际数据
    const data = json.data || json
    if (data.success) attachments.value.push({ name: file.name || '截图.png', path: data.path, url: data.url || '' })
  } catch (e) { console.error('Upload failed:', e) }
}

const handlePaste = async (e) => {
  const cbd = e.clipboardData
  if (!cbd) return
  for (const item of cbd.items) {
    if (item.type.startsWith('image/')) { e.preventDefault(); const file = item.getAsFile(); if (file) await uploadFile(file) }
  }
}

const handleFileSelect = async (e) => {
  for (const file of e.target.files) await uploadFile(file)
}

const handleClear = () => {
  messages.value = []
  attachments.value = []
  inputText.value = ''
  initSession(true)
}

function retryLastMessage() {
  const userMsgs = messages.value.filter(m => m.role === 'user')
  const last = userMsgs[userMsgs.length - 1]
  if (last) {
    if (messages.value[messages.value.length - 1]?.role === 'assistant') messages.value.pop()
    messages.value = messages.value.filter(m => m.id !== last.id)
    inputText.value = last.content
  }
}

// ===== 工具辅助 =====
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

// ===== Markdown =====
function renderMarkdown(text) {
  if (!text) return ''
  try { return marked.parse(text) } catch { return text }
}

function scrollToBottom() {
  nextTick(() => { if (msgBoxRef.value) msgBoxRef.value.scrollTop = msgBoxRef.value.scrollHeight })
}
</script>

<style scoped>
/* ===== Container & FAB ===== */
.global-ai-container {
  position: fixed; right: 24px; bottom: 24px; z-index: 999999;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.ai-fab {
  position: relative; width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg, hsl(260,85%,60%), hsl(295,85%,55%));
  color: #fff; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 24px rgba(124,58,237,0.35), inset 0 2px 4px rgba(255,255,255,0.2);
  cursor: pointer; transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
  user-select: none;
}
.ai-fab:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 12px 32px rgba(124,58,237,0.45); }
.ai-fab.chat-open { transform: scale(0.95); background: #f43f5e; }
.ai-fab-glow {
  position: absolute; inset: 0; border-radius: 50%; background: inherit;
  filter: blur(8px); opacity: 0.5; z-index: -1; transition: all 0.3s;
}
.ai-fab:hover .ai-fab-glow { opacity: 0.8; filter: blur(12px); }
.pulsing-core { transform-origin: center; animation: pulse-svg 3s infinite alternate; }
@keyframes pulse-svg {
  0% { transform: scale(0.95); opacity: 0.8; }
  100% { transform: scale(1.1); opacity: 1; }
}
.ai-fab.has-form::before {
  content: ''; position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px;
  border-radius: 50%; border: 2px solid #10b981; animation: fab-border-pulse 2s infinite; pointer-events: none;
}
@keyframes fab-border-pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}
.active-badge-dot {
  position: absolute; top: 2px; right: 2px; width: 12px; height: 12px;
  border-radius: 50%; background: #10b981; border: 2px solid #fff;
}

/* ===== Panel ===== */
.ai-panel {
  position: absolute; right: 0; bottom: 72px; width: 400px; height: 600px;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(226,232,240,0.8); border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.02);
  display: flex; flex-direction: column; overflow: hidden;
}

/* ===== Header ===== */
.ai-panel-header {
  padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(229,231,235,0.6);
  background: linear-gradient(to right, rgba(243,244,246,0.5), rgba(255,255,255,0.8));
}
.header-info { display: flex; flex-direction: column; }
.ai-title { font-size: 14px; font-weight: 700; color: #1f2937; letter-spacing: -0.2px; }
.ai-subtitle { font-size: 10px; color: #9ca3af; margin-top: 1px; }
.status-tag { font-size: 10px; padding: 3px 9px; border-radius: 20px; background: #f3f4f6; color: #6b7280; display: flex; align-items: center; gap: 5px; font-weight: 600; }
.status-tag.active { background: #e6f4ea; color: #137333; }
.pulse-green { width: 6px; height: 6px; border-radius: 50%; background: #10b981; animation: pulse-green 1.5s infinite; }
@keyframes pulse-green {
  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }
  70% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}

/* ===== Actions Bar ===== */
.ai-actions-bar {
  padding: 8px 14px; background: #f9fafb; border-bottom: 1px solid rgba(229,231,235,0.6);
}
.action-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.action-tag {
  font-size: 10px; padding: 2px 8px; background: #fff; border: 1px solid #e5e7eb;
  border-radius: 5px; color: #4b5563; cursor: pointer; transition: all 0.2s;
}
.action-tag:hover { background: #7c3aed; color: #fff; border-color: #7c3aed; }

/* ===== Messages ===== */
.ai-messages {
  flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column;
  gap: 14px; scroll-behavior: smooth;
}
.ai-welcome { margin: auto 0; padding: 12px 0; }
.welcome-card { background: #fff; border: 1px solid #f3f4f6; border-radius: 14px; padding: 20px; text-align: center; }
.spark-icon { margin-bottom: 10px; }
.welcome-card h3 { font-size: 14px; color: #111827; margin: 0 0 4px; font-weight: 600; }
.welcome-card p { font-size: 11px; color: #6b7280; margin: 0 0 14px; }
.suggestion-list { display: flex; flex-direction: column; gap: 6px; }
.sug-item {
  font-size: 11px; padding: 8px 12px; background: #f9fafb; border: 1px solid #f3f4f6;
  border-radius: 8px; color: #4b5563; cursor: pointer; text-align: left; transition: all 0.2s;
}
.sug-item:hover { background: #7c3aed; color: #fff; border-color: #7c3aed; }

/* ===== Message Row ===== */
.msg-wrapper { display: flex; gap: 10px; max-width: 100%; }
.msg-wrapper.user { flex-direction: row-reverse; }
.avatar {
  width: 26px; height: 26px; border-radius: 50%; display: flex;
  align-items: center; justify-content: center; font-size: 9px; font-weight: 700; flex-shrink: 0;
}
.avatar.user { background: #7c3aed; color: #fff; }
.avatar.assistant { background: #e5e7eb; color: #4b5563; border: 1px solid #d1d5db; }
.msg-body { flex: 1; max-width: 80%; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.msg-wrapper.user .msg-body { align-items: flex-end; }

/* ===== Text Bubble ===== */
.msg-bubble {
  padding: 8px 12px; border-radius: 12px; font-size: 12.5px; line-height: 1.6; word-break: break-word;
}
.msg-wrapper.user .msg-bubble { background: #7c3aed; color: #fff; border-top-right-radius: 3px; }
.msg-wrapper.assistant .msg-bubble {
  background: #fff; color: #1f2937; border-top-left-radius: 3px;
  border: 1px solid #f3f4f6; box-shadow: 0 1px 2px rgba(0,0,0,0.01);
}
.msg-bubble :deep(p) { margin: 4px 0; }
.msg-bubble :deep(pre) {
  background: #1f2937; color: #f3f4f6; padding: 8px; border-radius: 6px;
  overflow-x: auto; font-size: 10.5px; margin: 4px 0;
}
.msg-bubble :deep(code) { font-size: 11px; }
.msg-bubble :deep(img) { max-width: 100%; border-radius: 6px; }

/* ===== Thought ===== */
.thought-wrapper {
  border-left: 2px solid #7c3aed; padding-left: 8px;
  background: rgba(124,58,237,0.03); border-radius: 3px;
  overflow: hidden; word-break: break-all;
}
.thought-header {
  display: flex; align-items: center; gap: 5px; padding: 4px 6px;
  cursor: pointer; user-select: none; font-size: 11px; color: #6b7280;
  border-radius: 3px; transition: background 0.2s;
}
.thought-header:hover { background: rgba(124,58,237,0.06); }
.thought-icon { display: flex; }
.thought-title { flex: 1; font-weight: 600; font-size: 10.5px; }
.thought-arrow { font-size: 8px; transition: transform 0.2s; }
.thought-arrow.expanded { transform: rotate(180deg); }
.thought-content {
  padding: 6px 6px 6px 8px; font-size: 11px; line-height: 1.6; color: #4b5563;
  border-top: 1px dashed rgba(124,58,237,0.12);
  word-break: break-all; overflow-wrap: break-word; min-width: 0;
}

/* ===== Tool Call ===== */
.tool-step {
  border-radius: 10px; overflow: hidden; transition: all 0.2s;
}
.tool-bash { background: #1e1e1e; border: 1px solid #333; }
.tool-default { background: #f8fafc; border: 1px solid #e2e8f0; }
.tool-header {
  display: flex; align-items: center; gap: 8px; padding: 8px 10px;
  cursor: pointer; user-select: none;
}
.tool-icon-wrap {
  width: 24px; height: 24px; border-radius: 6px; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0;
}
.tool-icon-wrap :deep(svg) { width: 13px; height: 13px; }
.bash-icon { background: #2d2d2d; border: 1px solid #444; color: #34d399; }
.default-icon { background: #fff; border: 1px solid #e2e8f0; color: #7c3aed; }
.tool-name { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.bash-name { color: #34d399; }
.tool-default .tool-name { color: #7c3aed; }
.tool-summary {
  flex: 1; font-size: 10.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.tool-bash .tool-summary { color: #94a3b8; font-family: monospace; max-width: 130px; }
.tool-default .tool-summary { color: #64748b; max-width: 100px; }
.tool-status { font-size: 9px; font-weight: 700; margin-left: auto; white-space: nowrap; }
.status-running { color: #34d399; display: flex; align-items: center; gap: 4px; }
.status-failed { color: #ef4444; }
.status-done { color: #10b981; }
.running-dot { width: 5px; height: 5px; border-radius: 50%; background: #34d399; animation: pulse-running 1s infinite; }
@keyframes pulse-running {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.tool-detail { border-top: 1px solid rgba(255,255,255,0.08); }
.tool-default .tool-detail { border-top-color: #e2e8f0; }
.bash-detail { padding: 0; }
.bash-cmd {
  padding: 8px 10px; display: flex; align-items: center; gap: 6px;
  font-family: monospace; font-size: 10.5px; color: #e2e8f0;
}
.bash-prompt { color: #34d399; font-weight: 700; }
.bash-output {
  padding: 0 10px 8px; max-height: 200px; overflow-y: auto;
}
.bash-output pre {
  margin: 0; font-family: monospace; font-size: 10px; color: #94a3b8;
  white-space: pre-wrap; line-height: 1.5;
}
.tool-input {
  margin: 0; padding: 8px 10px; font-family: monospace; font-size: 10px;
  color: #64748b; background: #f1f5f9; white-space: pre-wrap;
}
.tool-result { border-top: 1px solid #e2e8f0; }
.tool-result pre {
  margin: 0; padding: 8px 10px; font-family: monospace; font-size: 10px;
  color: #7c3aed; background: rgba(124,58,237,0.03); white-space: pre-wrap;
}

/* ===== Error ===== */
.msg-error {
  display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px;
  background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
  font-size: 11px; color: #dc2626; min-width: 0;
}
.msg-error span { flex: 1; min-width: 0; word-break: break-all; line-height: 1.5; }
.error-icon { display: flex; flex-shrink: 0; margin-top: 1px; }
.retry-btn {
  margin-left: auto; padding: 2px 8px; background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 4px; font-size: 10px; font-weight: 600; color: #b91c1c;
  cursor: pointer; white-space: nowrap;
}
.retry-btn:hover { background: #fecaca; }

/* ===== Attachment ===== */
.msg-attachments { display: flex; flex-wrap: wrap; gap: 4px; }
.att-preview {
  position: relative; border-radius: 6px; overflow: hidden; border: 1px solid #e5e7eb; cursor: pointer;
}
.att-preview img { max-width: 80px; max-height: 60px; object-fit: cover; display: block; }
.att-preview span { display: none; }

/* ===== Loading ===== */
.thinking-loading { display: flex; gap: 4px; padding: 10px 4px; }
.thinking-loading span {
  width: 6px; height: 6px; border-radius: 50%; background: #9ca3af;
  animation: think-dots 1.4s infinite alternate;
}
.thinking-loading span:nth-child(2) { animation-delay: 0.2s; }
.thinking-loading span:nth-child(3) { animation-delay: 0.4s; }
@keyframes think-dots {
  0% { transform: scale(0.6); opacity: 0.4; }
  100% { transform: scale(1.1); opacity: 1; }
}

/* ===== Execution Cards ===== */
.execution-card {
  padding: 10px 12px; border-radius: 10px; font-size: 11px; line-height: 1.5;
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
}
.execution-card.action { background: #fff8e6; border: 1px solid #ffe8b3; color: #b26a00; }
.execution-card.fill { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
.execution-card.plan { background: #f0f9ff; border: 1px solid #bae6fd; color: #0369a1; }
.exec-icon { margin-bottom: 2px; display: flex; }
.exec-json { margin-top: 4px; background: rgba(0,0,0,0.04); padding: 4px 8px; border-radius: 4px; font-family: monospace; overflow-x: auto; font-size: 9.5px; }
.plan-steps { margin: 6px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
.plan-steps li { display: flex; align-items: center; gap: 6px; opacity: 0.65; }
.plan-steps li.done { opacity: 0.5; }
.plan-steps li.done .step-desc { text-decoration: line-through; }
.step-num { width: 15px; height: 15px; border-radius: 50%; background: currentColor; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: bold; }

/* ===== Input ===== */
.ai-input-container {
  padding: 12px 16px; background: #fff; border-top: 1px solid rgba(229,231,235,0.6);
  display: flex; flex-direction: column; gap: 6px;
}
.attachment-previews { display: flex; flex-wrap: wrap; gap: 4px; }
.att-chip {
  display: flex; align-items: center; gap: 3px; padding: 3px 7px; border-radius: 5px;
  font-size: 10px;
}
.att-chip { background: #f3f4f6; border: 1px solid #e5e7eb; color: #4b5563; }
.remove-chip { cursor: pointer; font-weight: bold; color: #ef4444; margin-left: 2px; font-size: 12px; }
.input-row {
  display: flex; flex-direction: column; background: #f9fafb; border: 1px solid #e5e7eb;
  border-radius: 10px; padding: 6px 10px; transition: border-color 0.2s;
}
.input-row:focus-within { border-color: #7c3aed; background: #fff; }
.ai-textarea {
  border: none; outline: none; background: transparent; resize: none; width: 100%;
  height: 40px; font-size: 12.5px; line-height: 1.5; color: #1f2937; font-family: inherit;
}
.tool-actions {
  display: flex; align-items: center; justify-content: flex-end; gap: 6px;
  margin-top: 2px; border-top: 1px solid rgba(229,231,235,0.4); padding-top: 4px;
}
.tool-btn {
  background: transparent; border: none; color: #94a3b8; cursor: pointer;
  padding: 3px; border-radius: 5px; display: flex; align-items: center; justify-content: center;
}
.tool-btn:hover { background: #f3f4f6; color: #4b5563; }
.hidden-input { display: none; }
.send-btn {
  background: #7c3aed; border: none; color: #fff; width: 24px; height: 24px;
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; margin-left: auto;
}
.send-btn:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }
.send-btn:not(:disabled):hover { background: #6d28d9; transform: scale(1.05); }

/* ===== Animation ===== */
.panel-slide-enter-active, .panel-slide-leave-active { transition: all 0.3s cubic-bezier(0.165,0.84,0.44,1); }
.panel-slide-enter-from, .panel-slide-leave-to { opacity: 0; transform: translateY(20px) scale(0.95); }
</style>
