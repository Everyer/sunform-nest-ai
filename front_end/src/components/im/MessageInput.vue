<template>
  <div class="im-input-container">
    <!-- 上传进度条 -->
    <div v-if="store.uploadProgress > 0" class="upload-progress-bar">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: store.uploadProgress + '%' }"></div>
      </div>
      <div class="progress-text">正在上传附件: {{ store.uploadProgress }}%</div>
    </div>

    <!-- 引用条(引用某条消息时显示) -->
    <div v-if="replyTo" class="reply-bar">
      <div class="reply-bar-inner">
        <div class="reply-bar-label">引用</div>
        <div class="reply-bar-content">
          <span class="reply-bar-name">{{ replyTo.sender?.staff?.staffName || replyTo.sender?.username || '未知用户' }}:</span>
          <span class="reply-bar-text">{{ replyPreview }}</span>
        </div>
      </div>
      <button class="reply-bar-close" title="取消引用" @click="$emit('cancel-reply')">×</button>
    </div>

    <!-- 附件预览 -->
    <div v-if="pendingAttachments.length" class="attachment-previews">
      <div v-for="(a, idx) in pendingAttachments" :key="idx" class="att-chip">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        <span class="att-name">{{ a.name }}</span>
        <span class="remove-chip" @click="removeAttachment(idx)">×</span>
      </div>
    </div>

    <div class="input-row">
      <textarea
        ref="textRef"
        v-model="text"
        class="text-input"
        :placeholder="placeholder"
        rows="1"
        @keydown.enter.exact.prevent="onEnter"
        @compositionstart="isComposing = true"
        @compositionend="isComposing = false"
        @input="onInputChange"
        @paste="onPaste"
      ></textarea>
      <div class="toolbar">
        <label class="tool-btn" title="发送文件">
          <input type="file" multiple class="hidden-input" @change="onFilePick" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        </label>
        <button
          class="send-btn"
          :disabled="!canSend"
          @click="handleSend"
          title="发送 (Enter)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>

    <!-- @ 成员浮层 -->
    <div v-if="showMention" class="mention-popup" :style="mentionStyle">
      <div class="mention-popup-title">选择要@的成员</div>
      <div
        v-for="m in filteredMentionMembers"
        :key="m.userId"
        class="mention-item"
        @mousedown.prevent="onPickMention(m)"
      >
        <div class="mention-avatar">{{ (m.staffName || m.username || '?').charAt(0) }}</div>
        <div class="mention-info">
          <div class="mention-name">{{ m.staffName || m.username }}</div>
          <div class="mention-meta">{{ m.username }}</div>
        </div>
      </div>
      <div v-if="!filteredMentionMembers.length" class="mention-empty">没有匹配成员</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useImStore } from '@/store/useImStore'

const props = defineProps({
  convId: { type: String, required: true },
  // 群成员(群聊时传,触发 @ 浮层用):[{ userId, staffName, username }]
  members: { type: Array, default: () => [] },
  // 当前用户 id(用于在 @ 列表里排除自己)
  currentUserId: { type: String, default: '' },
  // 被引用的消息(可选,引用条)
  replyTo: { type: Object, default: null },
  // 父组件可通过 v-model 传 placeholder
  placeholder: { type: String, default: '输入消息...' },
})
const emit = defineEmits(['send', 'send-typing', 'cancel-reply'])
const store = useImStore()

const text = ref('')
const textRef = ref(null)
const isComposing = ref(false)
const pendingAttachments = ref([])
// @ 浮层状态
const showMention = ref(false)
const mentionQuery = ref('')
const mentionStart = ref(-1) // @ 在 text 中的索引位置
const mentionStyle = ref({ bottom: '60px', left: '16px' })
// 已经选中的 @ 成员: [{ userId, name }],发送时随消息一起发
const pickedMentions = ref([])

const canSend = computed(() => !!text.value.trim() || pendingAttachments.value.length > 0)

function onEnter() {
  if (isComposing.value) return
  handleSend()
}

function onInputChange(e) {
  emit('send-typing', text.value.length > 0)
  // 自动调整高度:基础 38px(行高 + padding),每多一行 +20
  const el = textRef.value
  if (el) {
    el.style.height = 'auto'
    const lineHeight = 22
    const minH = 38
    const maxH = 140
    const next = Math.min(Math.max(el.scrollHeight, minH), maxH)
    el.style.height = next + 'px'
  }
  // 检测 @ 触发
  detectMentionTrigger(e)
}

function detectMentionTrigger(e) {
  const el = textRef.value
  if (!el) return
  const cursor = el.selectionStart
  if (cursor == null) return
  // 向前找最近的 @
  const before = text.value.slice(0, cursor)
  const atIdx = before.lastIndexOf('@')
  if (atIdx < 0) {
    showMention.value = false
    return
  }
  // @ 后面到光标之间不能有空格(否则已经脱离 @ 的范围)
  const between = before.slice(atIdx + 1)
  if (/\s/.test(between)) {
    showMention.value = false
    return
  }
  // 只在群聊(有成员)时启用 @
  if (!props.members || props.members.length === 0) {
    showMention.value = false
    return
  }
  mentionQuery.value = between
  mentionStart.value = atIdx
  showMention.value = true
  // 浮层定位:相对 textarea 容器
  positionMentionPopup()
}

function positionMentionPopup() {
  // 用 bottom 定位:popup 底部贴在 textarea 顶部上方 6px 处。
  // 之前用 top: 几像素 + 默认 popup 高度 240px,popup 直接撑到容器底部之外/被裁剪 —
  // 表现为"@ 列表出现在输入框下面"。改成 bottom 定位后,popup 不论高度多少
  // 都会从 textarea 顶部向上展开,自然不会掉到下面。
  const el = textRef.value
  if (!el) return
  const container = el.closest('.im-input-container')
  if (!container) return
  const containerRect = container.getBoundingClientRect()
  const taRect = el.getBoundingClientRect()
  const containerH = container.clientHeight
  const textareaOffsetTop = taRect.top - containerRect.top
  // bottom = 容器高度 - (textarea 顶部到容器顶部的距离 - 6px 间距)
  mentionStyle.value = {
    bottom: (containerH - textareaOffsetTop + 6) + 'px',
    left: '16px',
  }
}

const filteredMentionMembers = computed(() => {
  const q = mentionQuery.value.toLowerCase()
  return (props.members || [])
    .filter((m) => m.userId !== props.currentUserId) // 排除自己
    .filter((m) => {
      if (!q) return true
      const n = (m.staffName || m.username || '').toLowerCase()
      return n.includes(q)
    })
    .slice(0, 8)
})

function onPickMention(m) {
  const displayName = m.staffName || m.username || '用户'
  // 把 @query 替换成 @displayName + 空格
  const before = text.value.slice(0, mentionStart.value)
  const after = text.value.slice(mentionStart.value + 1 + mentionQuery.value.length)
  text.value = before + '@' + displayName + ' ' + after
  // 记录 userId 用于发送
  if (!pickedMentions.value.find((x) => x.userId === m.userId)) {
    pickedMentions.value.push({ userId: m.userId, name: displayName })
  }
  showMention.value = false
  // 重新聚焦 textarea + 调整高度
  nextTick(() => {
    if (textRef.value) {
      textRef.value.focus()
      const pos = before.length + displayName.length + 2
      textRef.value.setSelectionRange(pos, pos)
      onInputChange()
    }
  })
}

function onPaste(e) {
  const cbd = e.clipboardData
  if (!cbd) return
  const maxSize = 20 * 1024 * 1024 // 20MB
  for (const item of cbd.items) {
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) {
        if (file.size > maxSize) {
          message.error(`粘贴文件 "${file.name || '图片'}" 超过 20MB 限制`)
          continue
        }
        pendingAttachments.value.push(file)
      }
    }
  }
}

function onFilePick(e) {
  const maxSize = 20 * 1024 * 1024 // 20MB
  for (const f of e.target.files) {
    if (f.size > maxSize) {
      message.error(`文件 "${f.name}" 超过 20MB 限制`)
      continue
    }
    pendingAttachments.value.push(f)
  }
  e.target.value = ''
}

function removeAttachment(idx) {
  pendingAttachments.value.splice(idx, 1)
}

function reset() {
  text.value = ''
  pendingAttachments.value = []
  pickedMentions.value = []
  showMention.value = false
  emit('send-typing', false)
  nextTick(() => {
    if (textRef.value) {
      textRef.value.style.height = '38px'
      textRef.value.focus()
    }
  })
}

// 暴露给父组件:外部调用 .focus() 聚焦输入框
function focusInput() {
  nextTick(() => {
    if (textRef.value) {
      textRef.value.focus()
      // 强制刷新高度
      onInputChange()
    }
  })
}

defineExpose({ reset, focus: focusInput })

const handleSend = () => {
  if (!canSend.value) return
  const t = text.value.trim()
  const files = [...pendingAttachments.value]
  const mentions = pickedMentions.value.map((m) => m.userId)
  text.value = ''
  pendingAttachments.value = []
  pickedMentions.value = []
  showMention.value = false
  emit('send-typing', false)
  nextTick(() => {
    if (textRef.value) {
      textRef.value.style.height = '38px'
    }
  })
  emit('send', { text: t, files, mentions })
}

const replyPreview = computed(() => {
  if (!props.replyTo) return ''
  if (props.replyTo.type === 'image') return '[图片]'
  if (props.replyTo.type === 'file') return `[文件] ${props.replyTo.attachmentName || ''}`
  return (props.replyTo.content || '').slice(0, 60)
})

// 点击外部关闭 @ 浮层
function onDocClick(e) {
  if (!showMention.value) return
  const root = textRef.value?.closest('.im-input-container')
  if (root && !root.contains(e.target)) showMention.value = false
}
onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>

<style scoped>
.im-input-container {
  position: relative;
  padding: 14px 14px 6px;
  background: #fff;
  border-top: 1px solid #e8ecf2;
  display: flex; flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
}

/* 引用条 */
.reply-bar {
  display: flex; align-items: center;
  background: #f1f5f9;
  border-left: 3px solid #0c1832;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #475569;
  gap: 8px;
}
.reply-bar-inner { flex: 1; min-width: 0; display: flex; gap: 6px; }
.reply-bar-label {
  font-weight: 600; color: #0c1832; flex-shrink: 0;
}
.reply-bar-content { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.reply-bar-name { color: #0c1832; font-weight: 500; }
.reply-bar-text { color: #64748b; }
.reply-bar-close {
  background: transparent; border: none; color: #94a3b8;
  font-size: 16px; cursor: pointer; line-height: 1; padding: 0 4px;
  font-weight: 700;
}
.reply-bar-close:hover { color: #dc2626; }

.attachment-previews { display: flex; flex-wrap: wrap; gap: 6px; }
.att-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 8px;
  font-size: 11.5px; background: #f1f5f9;
  border: 1px solid #e2e8f0; color: #475569;
  max-width: 220px;
}
.att-name {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 160px;
}
.remove-chip { cursor: pointer; font-weight: bold; color: #ef4444; font-size: 13px; }

.input-row {
  display: flex; flex-direction: column;
  background: #f8f9fc;
  border: 1px solid #e8ecf2;
  border-radius: 10px;
  padding: 9px 12px 6px;
  transition: all 0.2s;
}
.input-row:focus-within {
  border-color: #0c1832;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(12, 24, 50, 0.06);
}
.text-input {
  border: none; outline: none; background: transparent; resize: none;
  width: 100%;
  height: 46px;
  max-height: 140px;
  font-size: 13.5px; line-height: 1.55; color: #0f172a; font-family: inherit;
  display: block;
  padding: 4px 2px;
  box-sizing: border-box;
}
.toolbar {
  display: flex; align-items: center; justify-content: flex-end; gap: 6px;
  padding-top: 4px;
}
.tool-btn {
  background: transparent; border: none; color: #94a3b8; cursor: pointer;
  padding: 4px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.tool-btn:hover:not(:disabled) { background: #f1f5f9; color: #475569; }
.tool-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.hidden-input { display: none; }
.send-btn {
  background: linear-gradient(135deg, #0c1832, #1a2d4a);
  border: none; color: #fff;
  width: 28px; height: 28px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
  margin-left: 4px;
  box-shadow: 0 2px 6px rgba(12,24,50,0.2);
}
.send-btn:disabled { background: #cbd5e1; color: #fff; cursor: not-allowed; box-shadow: none; }
.send-btn:not(:disabled):hover { transform: scale(1.06); box-shadow: 0 4px 10px rgba(12,24,50,0.3); }
.send-btn:not(:disabled):active { transform: scale(0.94); }

/* @ 浮层 */
.mention-popup {
  position: absolute;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06);
  width: 240px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 100;
  padding: 4px;
}
.mention-popup-title {
  font-size: 10.5px; color: #94a3b8;
  padding: 6px 8px 4px; font-weight: 600;
}
.mention-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px; border-radius: 6px; cursor: pointer;
  transition: background 0.15s;
}
.mention-item:hover { background: #f1f5f9; }
.mention-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, #0c1832, #1a2d4a);
  color: #fff; font-size: 11px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mention-info { flex: 1; min-width: 0; }
.mention-name { font-size: 12.5px; color: #0f172a; font-weight: 500; }
.mention-meta { font-size: 10.5px; color: #94a3b8; }
.mention-empty { padding: 14px; text-align: center; font-size: 12px; color: #94a3b8; }

/* 上传进度条 */
.upload-progress-bar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
  background: #f0fdf4; border: 1px solid #bbf7d0;
  border-radius: 8px; padding: 6px 12px;
  font-size: 11px; color: #15803d;
}
.progress-track {
  flex: 1; height: 6px; background: #dcfce7;
  border-radius: 3px; overflow: hidden;
}
.progress-fill {
  height: 100%; background: #16a34a;
  transition: width 0.2s ease-out;
}
.progress-text { font-weight: 600; font-family: monospace; white-space: nowrap; }
</style>
