<template>
  <div class="chat-window">
    <!-- 空态 -->
    <div v-if="!conv" class="empty-window">
      <div class="empty-icon">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div class="empty-title">选择左侧的会话开始聊天</div>
      <div class="empty-sub">或者点击 + 按钮发起新聊天</div>
    </div>

    <template v-else>
      <!-- 顶部头部 -->
      <div class="chat-header">
        <div class="header-left">
          <button v-if="mobile" class="back-btn" @click="$emit('back')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="header-avatar" :class="conv.type">
            <span>{{ avatarLetter }}</span>
            <span v-if="otherOnline" class="online-dot"></span>
          </div>
          <div class="header-info">
            <div class="header-name">{{ conv.name }}</div>
            <div class="header-status">
              <template v-if="conv.type === 'direct'">
                <span v-if="otherOnline" class="status-online">在线</span>
                <span v-else class="status-offline">离线</span>
              </template>
              <template v-else-if="conv.type === 'group'">
                {{ (conv.members || []).length }} 位成员
              </template>
              <template v-else>
                系统消息
              </template>
              <span v-if="typingText" class="typing-text">· {{ typingText }}</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <button v-if="conv.type === 'group'" class="icon-btn" title="重命名群聊" @click="onRenameGroup">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
            </svg>
          </button>
          <button class="icon-btn" :title="clearing ? '清空中...' : '清空聊天记录'" :disabled="clearing" @click="onClearHistory">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 消息区 -->
      <div ref="msgBoxRef" class="msg-scroll">
        <div v-if="loading" class="loading-tip"><n-spin size="small" /></div>
        <div v-else-if="!messages.length" class="empty-msg">
          <div class="empty-msg-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="empty-msg-text">开始你们的对话吧</div>
        </div>
        <template v-else>
          <template v-for="(item, idx) in arranged" :key="item.id || `d-${idx}`">
            <div v-if="item.kind === 'date'" class="date-sep">
              <span>{{ item.label }}</span>
            </div>
            <MessageBubble
              v-else
              :message="item.msg"
              :is-mine="item.msg.senderId === currentUserId"
              :sender-name="item.msg.sender?.staff?.staffName || item.msg.sender?.username || ''"
              :show-name="conv.type === 'group' && item.msg.senderId !== currentUserId && !item.nextSameSender"
              @reply="onSetReply"
            />
          </template>
        </template>
      </div>

      <!-- 输入区 -->
      <MessageInput
        ref="inputRef"
        :conv-id="conv.id"
        :members="conv.type === 'group' ? (conv.members || []) : []"
        :current-user-id="currentUserId"
        :reply-to="replyTo"
        @send="onSend"
        @send-typing="onTyping"
        @cancel-reply="replyTo = null"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'
import { useImStore } from '@/store/useImStore'

const props = defineProps({
  conv: { type: Object, default: null },
  mobile: { type: Boolean, default: false },
})
defineEmits(['back'])

const store = useImStore()
const msgBoxRef = ref(null)
const inputRef = ref(null)
const replyTo = ref(null) // 被引用的消息对象,null = 未引用
const loading = computed(() => store.loadingMessages)
const currentUserId = computed(() => store.currentUserId)

const messages = computed(() => {
  if (!props.conv) return []
  return store.messagesByConv[props.conv.id] || []
})

const avatarLetter = computed(() => {
  const n = props.conv?.name || '?'
  if (props.conv?.type === 'group') return '#'
  return n.charAt(0)
})

const otherOnline = computed(() => {
  if (!props.conv || props.conv.type !== 'direct') return false
  const other = (props.conv.members || []).find((m) => m.userId !== currentUserId.value)
  return other ? store.onlineUserIds.has(other.userId) : false
})

const typingText = computed(() => {
  if (!props.conv) return ''
  const set = store.typingByConv[props.conv.id]
  if (!set || set.size === 0) return ''
  const arr = [...set].filter((u) => u !== currentUserId.value)
  if (!arr.length) return ''
  // 找对端用户名
  const other = (props.conv.members || []).find((m) => m.userId === arr[0])
  const name = other?.staffName || other?.username || '对方'
  return `${name} 正在输入...`
})

// 排版:合并日期分隔 + 同人连续消息隐藏头像文字
const arranged = computed(() => {
  const arr = []
  let lastDate = ''
  let lastSender = ''
  const list = messages.value
  for (let i = 0; i < list.length; i++) {
    const m = list[i]
    const date = formatDate(m.createdAt)
    if (date !== lastDate) {
      arr.push({ kind: 'date', label: date, id: 'd-' + date })
      lastDate = date
      lastSender = ''
    }
    const sameAsNext = list[i + 1] && list[i + 1].senderId === m.senderId
    arr.push({ kind: 'msg', msg: m, nextSameSender: sameAsNext })
    lastSender = m.senderId
  }
  return arr
})

function formatDate(t) {
  if (!t) return ''
  const d = new Date(t)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return '今天'
  const yest = new Date(now)
  yest.setDate(yest.getDate() - 1)
  if (d.toDateString() === yest.toDateString()) return '昨天'
  const diff = (now - d) / (1000 * 86400)
  if (diff < 7) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return `周${weekdays[d.getDay()]}`
  }
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

// 自动滚到底
watch(messages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

watch(() => props.conv?.id, async (newId, oldId) => {
  // 切换会话:重置引用、聚焦输入框、滚到底
  if (newId !== oldId) {
    replyTo.value = null
  }
  await nextTick()
  scrollToBottom()
  // 点击会话项时自动聚焦输入框
  if (newId && inputRef.value) {
    inputRef.value.focus()
  }
})

function scrollToBottom() {
  if (msgBoxRef.value) {
    msgBoxRef.value.scrollTop = msgBoxRef.value.scrollHeight
  }
}

onMounted(() => nextTick(() => {
  scrollToBottom()
  if (props.conv?.id && inputRef.value) inputRef.value.focus()
}))

// 发送
async function onSend({ text, files, mentions }) {
  if (!props.conv) return
  const replyMessageId = replyTo.value?.id || null
  // 发出后清掉引用状态(下条消息默认不再引用)
  replyTo.value = null
  try {
    // 文本
    if (text) {
      await store.sendMessage(props.conv.id, {
        type: 'text',
        content: text,
        mentions: mentions && mentions.length ? mentions : undefined,
        replyToMessageId: replyMessageId || undefined,
      })
    }
    // 附件
    for (const f of files || []) {
      await store.sendAttachment(props.conv.id, f)
    }
  } catch (e) {
    console.error('send failed', e)
  }
}

// 设置引用消息(由 MessageBubble 触发)
function onSetReply(msg) {
  if (!msg) return
  replyTo.value = msg
  // 聚焦输入框
  nextTick(() => {
    if (inputRef.value) inputRef.value.focus()
  })
}

// 输入状态
let typingTimer = null
function onTyping(isTyping) {
  if (!props.conv) return
  store.sendTyping(props.conv.id, isTyping)
  if (isTyping) {
    clearTimeout(typingTimer)
    typingTimer = setTimeout(() => store.sendTyping(props.conv.id, false), 3000)
  }
}
onUnmounted(() => clearTimeout(typingTimer))

// 清空聊天记录(带确认,清完后端数据)
import { useDialog, useMessage, NInput } from 'naive-ui'
import { h, ref as vref } from 'vue'
const dialog = useDialog()
const nMessage = useMessage()
const clearing = ref(false)
const renaming = ref(false)
async function onClearHistory() {
  if (!props.conv || clearing.value) return
  const convName = props.conv.name || '当前会话'
  const convTypeLabel = props.conv.type === 'group' ? '群聊' : (props.conv.type === 'system' ? '系统会话' : '私聊')
  dialog.warning({
    // 显式 zIndex:naive UI 的 <n-dialog-provider> 没有 zIndex prop,
    // 不传的话 dialog 自身无 z-index,会被显式 z-index: 4000 的 IM 弹窗盖住。
    // 6000 高于 ImChatModal(4000)/NewChatDialog(4100)/GlobalAiChat(5000),确保浮在最上面。
    zIndex: 6000,
    title: '清空聊天记录',
    content: `确定要清空【${convName}】(${convTypeLabel}) 的全部聊天记录吗?\n清空后会同步删除后端数据,所有成员都将看不到历史消息,且无法恢复。`,
    positiveText: '确认清空',
    negativeText: '取消',
    onPositiveClick: async () => {
      clearing.value = true
      try {
        await store.clearConversation(props.conv.id)
        nMessage.success('已清空聊天记录')
      } catch (e) {
        nMessage.error(e.message || '清空失败')
      } finally {
        clearing.value = false
      }
    },
  })
}

// 重命名群聊:用 dialog.create + h(NInput) 弹输入框
// 走 store.renameGroup(乐观更新 + 失败回滚),后端会广播 conversation:updated
function onRenameGroup() {
  if (!props.conv || renaming.value) return
  const convId = props.conv.id
  const currentName = props.conv.name || ''
  // 用闭包共享同一个 ref,这样 onPositiveClick 能拿到最新值
  const inputRef = vref(currentName)

  dialog.create({
    title: '重命名群聊',
    showIcon: false,
    zIndex: 6000,
    // 关键:content 必须是返回 VNode 的 render 函数,不能返回原生 DOM 元素
    // (用 h(NInput, ...) 渲染一个真正的 Vue 节点,不能 wrap 一个 div + createElement)
    content: () =>
      h('div', { style: 'padding: 4px 0 0;' }, [
        h(NInput, {
          value: inputRef.value,
          'onUpdate:value': (v) => { inputRef.value = v },
          placeholder: '请输入新的群聊名称',
          maxlength: 100,
          autofocus: true,
          onKeyup: (e) => {
            if (e.key === 'Enter') {
              // 拦截 Enter 不提交表单,但点击"保存"按钮
              const btns = document.querySelectorAll('.n-dialog .n-button')
              btns.forEach((b) => {
                if (b.textContent && b.textContent.trim() === '保存') b.click()
              })
            }
          },
        }),
      ]),
    positiveText: '保存',
    negativeText: '取消',
    onPositiveClick: () => {
      const newName = (inputRef.value || '').trim()
      if (!newName) {
        nMessage.warning('群聊名称不能为空')
        return false // 不关闭对话框
      }
      if (newName === currentName) return true // 没变化,直接关
      renaming.value = true
      store.renameGroup(convId, newName)
        .then(() => nMessage.success('已重命名'))
        .catch((e) => nMessage.error(e.message || '重命名失败'))
        .finally(() => { renaming.value = false })
      return true
    },
  })
}
</script>

<style scoped>
.chat-window {
  flex: 1;
  display: flex; flex-direction: column;
  min-width: 0;
  background: #fff;
}
.empty-window {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: #f8f9fc;
  gap: 8px;
}
.empty-title { font-size: 14px; color: #475569; font-weight: 500; }
.empty-sub { font-size: 12px; color: #94a3b8; }

.chat-header {
  display: flex; align-items: center;
  padding: 10px 16px;
  background: #fff;
  border-bottom: 1px solid #e8ecf2;
  flex-shrink: 0;
  height: 56px;
}
.header-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.back-btn {
  border: none; background: transparent;
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #475569; cursor: pointer;
}
.back-btn:hover { background: #f1f5f9; }
.header-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600; color: #fff;
  background: linear-gradient(135deg, #0c1832, #1a2d4a);
  flex-shrink: 0;
  position: relative;
}
.header-avatar.group { background: linear-gradient(135deg, #059669, #10b981); }
.header-avatar.system { background: linear-gradient(135deg, #d97706, #f59e0b); }
.online-dot {
  position: absolute; right: -1px; bottom: -1px;
  width: 10px; height: 10px;
  border-radius: 50%; background: #10b981;
  border: 2px solid #fff;
}
.header-info { flex: 1; min-width: 0; }
.header-name {
  font-size: 14px; font-weight: 600; color: #0f172a;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.header-status { font-size: 11.5px; color: #94a3b8; display: flex; gap: 4px; align-items: center; }
.status-online { color: #10b981; }
.status-offline { color: #94a3b8; }
.typing-text { color: #0c1832; font-weight: 500; }

.header-right { display: flex; align-items: center; gap: 4px; }
.icon-btn {
  background: transparent; border: none;
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #64748b; cursor: pointer;
  transition: all 0.2s;
}
.icon-btn:hover:not(:disabled) { background: #f1f5f9; color: #dc2626; }
.icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.icon-btn:active:not(:disabled) { transform: scale(0.92); }

.msg-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f3f4f8;
  display: flex; flex-direction: column;
  scroll-behavior: smooth;
}
.msg-scroll::-webkit-scrollbar { width: 5px; }
.msg-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.25); border-radius: 3px; }

.loading-tip { padding: 30px; text-align: center; }
.empty-msg {
  margin: auto;
  text-align: center;
  color: #94a3b8;
}
.empty-msg-icon { margin-bottom: 6px; }
.empty-msg-text { font-size: 12.5px; }

.date-sep {
  text-align: center;
  margin: 6px 0 12px;
}
.date-sep span {
  display: inline-block;
  font-size: 10.5px;
  color: #94a3b8;
  background: rgba(148,163,184,0.12);
  padding: 3px 12px;
  border-radius: 12px;
}
</style>
