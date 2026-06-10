<template>
  <div :id="`msg-${message.id}`" class="msg-row" :class="isMine ? 'mine' : 'theirs'">
    <!-- 对方头像(我方不显示头像,由 ChatWindow 右侧统一显示) -->
    <div v-if="!isMine" class="avatar">
      {{ avatarLetter }}
    </div>

    <div class="msg-stack">
      <!-- 发送者姓名(群聊对方) -->
      <div v-if="!isMine && showName" class="sender-name">{{ senderName }}</div>

      <!-- 系统消息 -->
      <div v-if="message.type === 'system'" class="system-msg">
        {{ message.content }}
      </div>

      <!-- 业务消息(图片/文件/文本):统一外层 .bubble-wrap = 横向 flex,
           内容(引用条 + 气泡)与"引用回复"按钮作为兄弟节点,按钮
           hover 才显示。把按钮做成真实的 flex 兄弟可以避免之前
           position:absolute + left:-28px 把按钮压到头像上 / 鼠标移动到
           按钮时丢失 hover 的问题。 -->
      <div v-else class="bubble-wrap" :class="isMine ? 'wrap-mine' : 'wrap-theirs'">
        <div class="bubble-content">
          <!-- 引用预览(此条消息引用了另一条) -->
          <div v-if="message.replyTo" class="quote-card interactive" :class="isMine ? 'quote-mine' : 'quote-theirs'" title="点击跳转到原消息" @click="emit('jump-to-msg', message.replyTo.id)">
            <div class="quote-bar"></div>
            <div class="quote-content">
              <div class="quote-name">
                {{ message.replyTo.sender?.staff?.staffName || message.replyTo.sender?.username || '未知' }}
              </div>
              <div class="quote-text">{{ quotePreview }}</div>
            </div>
          </div>

          <!-- 图片 -->
          <template v-if="message.type === 'image'">
            <div class="bubble image-bubble" :class="isMine ? 'bubble-mine' : 'bubble-theirs'">
              <img :src="message.attachmentUrl" :alt="message.attachmentName" class="img-content" @click="openImage" />
            </div>
          </template>

          <!-- 文件 -->
          <template v-else-if="message.type === 'file'">
            <div class="bubble file-bubble" :class="isMine ? 'bubble-mine' : 'bubble-theirs'">
              <a :href="message.attachmentUrl" download :class="isMine ? 'file-link-light' : 'file-link-dark'">
                <div class="file-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div class="file-info">
                  <div class="file-name">{{ message.attachmentName || '文件' }}</div>
                  <div class="file-meta">{{ humanSize }} · {{ ext }}</div>
                </div>
                <div class="file-dl" title="下载">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </div>
              </a>
            </div>
          </template>

          <!-- 文本(支持 @人 高亮) -->
          <template v-else>
            <div class="bubble text-bubble" :class="isMine ? 'bubble-mine' : 'bubble-theirs'">
              <span v-for="(seg, i) in textSegments" :key="i" :class="{ 'mention-chip': seg.kind === 'mention' }">{{ seg.text }}</span>
            </div>
          </template>
        </div>

        <!-- 撤回按钮:如果是自己发送且在2分钟内,wrap hover 时显示 -->
        <button v-if="canRecall" class="reply-action recall-action" title="撤回消息" @click="emit('recall', message.id)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>

        <!-- 引用按钮:flex 兄弟节点,默认 visibility:hidden 但占位,hover wrap 时显示 -->
        <button class="reply-action" title="引用回复" @click="emit('reply', message)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 17 4 12 9 7"/>
            <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
          </svg>
        </button>
      </div>

      <!-- 时间 + 状态 -->
      <div v-if="message.type !== 'system'" class="meta-row" :class="isMine ? 'mine' : 'theirs'">
        <span class="time">{{ formatTime(message.createdAt) }}</span>
        <span v-if="isMine && message.type !== 'system'" class="status">
          <span v-if="readByOthers" class="read">已读</span>
          <span v-else class="delivered">已送达</span>
        </span>
      </div>
    </div>

    <!-- 我方头像 -->
    <div v-if="isMine" class="avatar mine">
      {{ avatarLetter }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: Object, required: true },
  isMine: { type: Boolean, default: false },
  senderName: { type: String, default: '' },
  showName: { type: Boolean, default: false },
  readByOthers: { type: Boolean, default: false },
})
const emit = defineEmits(['reply', 'jump-to-msg', 'recall'])

// 判断 2 分钟内是否可撤回
const canRecall = computed(() => {
  if (!props.isMine) return false
  if (props.message.type === 'system') return false
  const t = props.message.createdAt
  if (!t) return false
  const d = new Date(t)
  if (isNaN(d.getTime())) return false
  return Date.now() - d.getTime() < 2 * 60 * 1000
})

const avatarLetter = computed(() => {
  const name = props.senderName || (props.isMine ? '我' : '?')
  return name.charAt(0)
})

const humanSize = computed(() => {
  const s = props.message.attachmentSize
  if (!s) return ''
  if (s < 1024) return s + ' B'
  if (s < 1024 * 1024) return (s / 1024).toFixed(1) + ' KB'
  return (s / 1024 / 1024).toFixed(2) + ' MB'
})

const ext = computed(() => {
  const n = props.message.attachmentName || ''
  const m = n.match(/\.([a-zA-Z0-9]+)$/)
  return m ? m[1].toUpperCase() : ''
})

// 引用消息的预览文本(被 @ 引用的那一条)
const quotePreview = computed(() => {
  const r = props.message.replyTo
  if (!r) return ''
  if (r.type === 'image') return '[图片]'
  if (r.type === 'file') return `[文件] ${r.attachmentName || ''}`
  return (r.content || '').slice(0, 80)
})

// 把文本拆成普通文本 / @人提及 两类段,UI 中以 chip 高亮
const textSegments = computed(() => {
  const t = props.message.content || ''
  if (!t) return []
  const re = /@[^\s@]+/g
  const segs = []
  let last = 0
  let m
  while ((m = re.exec(t)) !== null) {
    if (m.index > last) segs.push({ kind: 'text', text: t.slice(last, m.index) })
    segs.push({ kind: 'mention', text: m[0] })
    last = m.index + m[0].length
  }
  if (last < t.length) segs.push({ kind: 'text', text: t.slice(last) })
  return segs
})

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  if (isNaN(d.getTime())) return t
  const pad = (n) => (n < 10 ? '0' + n : n)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function openImage() {
  if (props.message.attachmentUrl) window.open(props.message.attachmentUrl, '_blank')
}
</script>

<style scoped>
.msg-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 14px;
  max-width: 100%;
}
/* 我方消息:不用 row-reverse(行为不一致),改成 row + justify-content: flex-end
   配合 DOM 中 mine 头像放在 msg-stack 之后,自然渲染成 [empty][bubble][avatar]
   这样气泡贴右,头像紧贴气泡右侧,左侧空白 = 排版正常的"对方"留白。 */
.msg-row.mine {
  justify-content: flex-end;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-top: 2px;
}
.avatar.mine {
  background: linear-gradient(135deg, #0c1832, #1a2d4a);
}

.msg-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 70%;
  min-width: 0;
}
.msg-row.mine .msg-stack { align-items: flex-end; }

.sender-name {
  font-size: 11px;
  color: #94a3b8;
  padding-left: 4px;
}

/* bubble-wrap:横向 flex,内容(引用条+气泡)与引用按钮作为兄弟节点。
   按钮永远占位(visibility:hidden 占位但不显形),hover wrap 时显形,
   这样鼠标从气泡移到按钮的过程一直停留在 wrap 内 → hover 不丢失。 */
.bubble-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-width: 0;
}
.wrap-mine { flex-direction: row-reverse; }
.wrap-theirs { flex-direction: row; }

.bubble-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.wrap-mine .bubble-content { align-items: flex-end; }
.wrap-theirs .bubble-content { align-items: flex-start; }

/* 引用预览卡片 —— 此卡片位于气泡 *上方*(不在气泡里),
   所以它的视觉环境永远是聊天区的浅灰背景,而不是气泡的颜色。
   因此 mine / theirs 都用同一组中性颜色(深灰文字 + 浅灰底),
   避免之前 mine 用半透明白底 + 白字导致整块卡片看不见。 */
.quote-card {
  display: flex;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 8px;
  font-size: 11.5px;
  max-width: 100%;
  background: #e2e8f0;
  border-left: 3px solid #94a3b8;
}
.quote-card.interactive {
  cursor: pointer;
  transition: background 0.2s;
}
.quote-card.interactive:hover {
  background: #cbd5e1;
}
.recall-action:hover {
  color: #ea580c !important;
  background: #fff7ed !important;
}
.quote-bar { display: none; } /* 改用 border-left 做引用条 */
.quote-content { min-width: 0; flex: 1; }
.quote-name {
  font-size: 11px; font-weight: 600;
  color: #334155;
  margin-bottom: 1px;
}
.quote-text {
  font-size: 11px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 220px;
}

/* 引用操作按钮:flex 兄弟节点,默认 hidden 但占位,wrap hover 时显形 */
.reply-action {
  flex-shrink: 0;
  width: 24px; height: 24px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.15s;
}
.bubble-wrap:hover .reply-action {
  visibility: visible;
  opacity: 1;
}
.reply-action:hover {
  color: #0c1832;
  background: #f1f5f9;
}

/* 气泡 */
.bubble {
  padding: 9px 13px;
  border-radius: 14px;
  font-size: 13.5px;
  line-height: 1.55;
  word-break: break-word;
  white-space: pre-wrap;
  max-width: 100%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.bubble-mine {
  background: linear-gradient(135deg, #0c1832, #1a2d4a);
  color: #fff;
  border-top-right-radius: 4px;
}
.bubble-theirs {
  background: #fff;
  color: #0f172a;
  border-top-left-radius: 4px;
  border: 1px solid #e8ecf2;
}

/* @人 提及 chip:文本气泡里高亮 @username */
.mention-chip {
  color: #2563eb;
  font-weight: 600;
  background: rgba(37,99,235,0.08);
  padding: 0 2px;
  border-radius: 3px;
}
.bubble-mine .mention-chip {
  color: #93c5fd;
  background: rgba(255,255,255,0.12);
}

/* 文件 */
.file-bubble { padding: 8px; min-width: 200px; max-width: 260px; }
/* 我方文件卡片:实色白底 + 深色字,确保在深蓝气泡上文件名/小字/下载图标清晰可读
   (之前用 rgba(255,255,255,0.18) 半透明白底+白色字,几乎看不见)。 */
.file-bubble.bubble-mine {
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.file-bubble.bubble-theirs { background: #f8f9fc; }
.file-link-dark, .file-link-light {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none; color: inherit;
}
/* 我方文件链接:深色文字(适配白底卡片) */
.file-link-light { color: #0c1832; }
.file-icon {
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background: rgba(0,0,0,0.06);
}
/* 我方文件图标底色:深色块 + 白色 SVG(适配白底卡片) */
.file-link-light .file-icon {
  background: #0c1832;
  color: #ffffff;
}
.file-info { flex: 1; min-width: 0; }
.file-name {
  font-size: 12.5px; font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  max-width: 180px;
}
.file-meta { font-size: 10.5px; opacity: 0.7; margin-top: 1px; }
.file-dl { display: flex; opacity: 0.7; }

/* 图片 */
.image-bubble { padding: 4px; max-width: 240px; }
.bubble-mine.image-bubble { background: transparent; padding: 0; }
.bubble-theirs.image-bubble { background: transparent; border: none; padding: 0; }
.img-content {
  max-width: 220px; max-height: 220px;
  border-radius: 10px;
  display: block; cursor: pointer;
}

/* 系统消息 */
.system-msg {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  background: rgba(148,163,184,0.1);
  border-radius: 12px;
  padding: 4px 12px;
  margin: 8px auto;
  display: inline-block;
}
.msg-row .system-msg { display: block; text-align: center; }

/* 时间 + 状态 */
.meta-row {
  display: flex; gap: 8px; font-size: 10.5px; color: #94a3b8;
  padding: 0 4px;
}
.meta-row.mine { justify-content: flex-end; }
.meta-row .read { color: #2563eb; }
</style>
