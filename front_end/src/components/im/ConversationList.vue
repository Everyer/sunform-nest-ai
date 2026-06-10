<template>
  <div class="conv-list">
    <!-- 顶部搜索 + 新建 -->
    <div class="list-header">
      <div class="search-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" placeholder="搜索会话" class="search-input" />
      </div>
      <button class="new-btn" title="新建聊天" @click="$emit('new-chat')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>

    <!-- 会话列表 -->
    <div class="list-body">
      <div v-if="loading" class="empty-state">
        <n-spin size="small" />
      </div>
      <div v-else-if="!filtered.length" class="empty-state">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="empty-text">暂无会话</div>
        <button class="empty-action" @click="$emit('new-chat')">+ 发起新聊天</button>
      </div>

      <div
        v-for="conv in filtered"
        :key="conv.id"
        class="conv-item"
        :class="{ active: conv.id === activeConvId }"
        @click="$emit('select', conv.id)"
      >
        <!-- 头像 -->
        <div class="conv-avatar" :class="conv.type">
          <span>{{ avatarLetter(conv) }}</span>
          <span v-if="isOnline(conv)" class="online-dot"></span>
        </div>

        <!-- 中间内容 -->
        <div class="conv-body">
          <div class="conv-line1">
            <span class="conv-name">{{ conv.name }}</span>
            <span class="conv-time">{{ formatTime(conv.lastMessageAt) }}</span>
          </div>
          <div class="conv-line2">
            <span class="conv-preview">
              <span v-if="hasMention(conv)" class="mention-tag">[有人@我] </span>
              {{ previewText(conv) }}
            </span>
            <span v-if="conv.unread > 0" class="unread-badge">{{ conv.unread > 99 ? '99+' : conv.unread }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useImStore } from '@/store/useImStore'

const props = defineProps({
  conversations: { type: Array, default: () => [] },
  activeConvId: { type: String, default: null },
  loading: { type: Boolean, default: false },
})
defineEmits(['select', 'new-chat'])

const store = useImStore()
const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.conversations
  return props.conversations.filter((c) => (c.name || '').toLowerCase().includes(q))
})

function avatarLetter(conv) {
  if (conv.type === 'group') return '#'
  const n = conv.name || '?'
  return n.charAt(0)
}

function isOnline(conv) {
  if (conv.type !== 'direct') return false
  // 找到对端 userId
  const other = (conv.members || []).find((m) => m.userId !== store.currentUserId)
  if (!other) return false
  return store.onlineUserIds.has(other.userId)
}

function previewText(conv) {
  const m = conv.lastMessage
  if (!m) return '暂无消息'
  if (m.type === 'text') return m.content || ''
  if (m.type === 'image') return '[图片]'
  if (m.type === 'file') return `[文件] ${m.attachmentName || ''}`
  if (m.type === 'system') return m.content || '系统消息'
  return ''
}

function hasMention(conv) {
  if (conv.type !== 'group') return false
  if (!conv.unread || conv.unread <= 0) return false
  const m = conv.lastMessage
  if (!m || !m.mentions) return false
  try {
    const list = typeof m.mentions === 'string' ? JSON.parse(m.mentions) : m.mentions
    if (Array.isArray(list)) {
      return list.includes(store.currentUserId)
    }
  } catch (e) {}
  return false
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const diff = (now - d) / 1000
  if (diff < 7 * 86400) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return `周${weekdays[d.getDay()]}`
  }
  return `${d.getMonth() + 1}/${d.getDate()}`
}
function pad(n) { return n < 10 ? '0' + n : n }
</script>

<style scoped>
.conv-list {
  width: 280px;
  display: flex; flex-direction: column;
  background: #f8f9fc;
  border-right: 1px solid #e8ecf2;
  flex-shrink: 0;
}
.list-header {
  padding: 12px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid #e8ecf2;
  background: #fff;
}
.search-box {
  flex: 1;
  display: flex; align-items: center; gap: 6px;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 6px 10px;
  color: #94a3b8;
}
.search-input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 12.5px; color: #0f172a;
}
.search-input::placeholder { color: #94a3b8; }
.new-btn {
  width: 32px; height: 32px;
  border: none; background: linear-gradient(135deg, #0c1832, #1a2d4a);
  color: #fff; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(12,24,50,0.2);
}
.new-btn:hover { transform: scale(1.06); }
.new-btn:active { transform: scale(0.94); }

.list-body {
  flex: 1; overflow-y: auto;
  padding: 6px 0;
}
.list-body::-webkit-scrollbar { width: 4px; }
.list-body::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.25); border-radius: 2px; }

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.empty-icon { margin-bottom: 4px; }
.empty-text { font-size: 12.5px; }
.empty-action {
  margin-top: 6px;
  padding: 6px 14px;
  background: #0c1832;
  color: #fff;
  border: none; border-radius: 6px;
  font-size: 12px; cursor: pointer;
  transition: opacity 0.2s;
}
.empty-action:hover { opacity: 0.85; }

.conv-item {
  display: flex; gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
  align-items: center;
  border-bottom: 1px solid rgba(232, 236, 242, 0.5);
}
.conv-item:hover { background: #eef0f5; }
.conv-item.active { background: #e8ecf2; }

.conv-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600; color: #fff;
  background: linear-gradient(135deg, #0c1832, #1a2d4a);
  flex-shrink: 0;
  position: relative;
}
.conv-avatar.group { background: linear-gradient(135deg, #059669, #10b981); }
.conv-avatar.system { background: linear-gradient(135deg, #d97706, #f59e0b); }
.online-dot {
  position: absolute; right: -1px; bottom: -1px;
  width: 11px; height: 11px;
  border-radius: 50%; background: #10b981;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.05);
}

.conv-body {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 2px;
}
.conv-line1 {
  display: flex; justify-content: space-between; align-items: center;
}
.conv-name {
  font-size: 13px; font-weight: 600; color: #0f172a;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  max-width: 160px;
}
.conv-time {
  font-size: 10.5px; color: #94a3b8; flex-shrink: 0; margin-left: 6px;
}
.conv-line2 {
  display: flex; justify-content: space-between; align-items: center; gap: 6px;
}
.conv-preview {
  font-size: 11.5px; color: #64748b;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  flex: 1; min-width: 0;
}
.unread-badge {
  background: #dc2626; color: #fff;
  font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 10px;
  flex-shrink: 0;
  min-width: 18px; text-align: center;
  box-shadow: 0 1px 3px rgba(220,38,38,0.3);
}
.mention-tag {
  color: #ef4444;
  font-weight: 700;
}
</style>
