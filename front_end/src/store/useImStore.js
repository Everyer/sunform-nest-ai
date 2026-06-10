import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  listContacts,
  listConversations,
  getConversationDetail,
  createDirectConversation,
  createGroupConversation,
  renameGroup as renameGroupApi,
  getMessagesPage,
  markRead,
  uploadAttachment,
  clearHistory as clearHistoryApi,
} from '@/api/im'
import { imSocket } from '@/utils/imSocket'
import { useUserStore } from './useUserStore'

export const useImStore = defineStore('im', () => {
  // ===== state =====
  const contacts = ref([]) // 联系人列表
  const conversations = ref([]) // 我参与的所有会话
  const activeConvId = ref(null) // 当前打开的会话
  const messagesByConv = ref({}) // { convId: Message[] }
  const typingByConv = ref({}) // { convId: Set<userId> }
  const onlineUserIds = ref(new Set()) // 在线用户
  const panelOpen = ref(false)
  const loaded = ref(false) // 是否已加载过会话列表
  const loadingMessages = ref(false)
  const unreadTotal = ref(0) // 总未读(用于 header 红点)
  const currentUserId = ref('')

  function setCurrentUser(uid) {
    currentUserId.value = uid || ''
  }

  const activeConv = computed(() => conversations.value.find((c) => c.id === activeConvId.value) || null)

  function computeUnread() {
    unreadTotal.value = conversations.value.reduce((s, c) => s + (c.unread || 0), 0)
  }

  // ===== 拉数据 =====
  async function loadContacts(force = false) {
    if (!force && contacts.value.length) return contacts.value
    const res = await listContacts()
    contacts.value = res.data || res || []
    return contacts.value
  }

  async function loadConversations(force = false) {
    if (!force && loaded.value && conversations.value.length) return conversations.value
    const res = await listConversations()
    const data = res.data || res || []
    conversations.value = data
    loaded.value = true
    computeUnread()
    return conversations.value
  }

  async function openConversation(convId) {
    if (!convId) return
    activeConvId.value = convId
    panelOpen.value = true
    await loadHistory(convId, true)
    // 标记已读
    const list = messagesByConv.value[convId] || []
    const last = list[list.length - 1]
    if (last && last.id) {
      try {
        await markRead({ conversationId: convId, lastReadMessageId: last.id })
        // 同步本地未读
        const idx = conversations.value.findIndex((c) => c.id === convId)
        if (idx >= 0) {
          conversations.value[idx].unread = 0
          computeUnread()
        }
      } catch (e) {
        console.warn('markRead failed', e)
      }
    }
  }

  async function loadHistory(convId, reset = false) {
    if (!convId) return
    loadingMessages.value = true
    try {
      const res = await getMessagesPage({ conversationId: convId, pageindex: 1, pagesize: 30 })
      const list = (res.data?.list) || res.list || []
      messagesByConv.value[convId] = list
    } finally {
      loadingMessages.value = false
    }
  }

  async function loadMoreHistory(convId) {
    const list = messagesByConv.value[convId] || []
    if (!list.length) return
    const oldest = list[0]
    const res = await getMessagesPage({
      conversationId: convId,
      pageindex: 1,
      pagesize: 30,
      beforeMessageId: oldest.id,
    })
    const more = res.data?.list || res.list || []
    messagesByConv.value[convId] = [...more, ...list]
  }

  // ===== 实时:收到新消息 =====
  function receiveMessage(msg) {
    if (!msg || !msg.conversationId) return
    const convId = msg.conversationId

    // 追加到该会话消息
    const list = messagesByConv.value[convId] || []
    // 去重
    if (!list.some((m) => m.id === msg.id)) {
      messagesByConv.value[convId] = [...list, msg]
    }

    // 更新会话最后一条
    const idx = conversations.value.findIndex((c) => c.id === convId)
    if (idx >= 0) {
      const c = conversations.value[idx]
      c.lastMessage = {
        id: msg.id,
        type: msg.type,
        content: msg.content,
        attachmentName: msg.attachmentName,
        senderId: msg.senderId,
        createdAt: msg.createdAt,
      }
      c.lastMessageAt = msg.createdAt || new Date().toISOString()
      // 如果不是我发的,且当前未打开该会话,未读+1
      if (msg.senderId !== currentUserId.value) {
        if (activeConvId.value !== convId) {
          c.unread = (c.unread || 0) + 1
        }
      }
      // 把这个会话移到顶
      const item = conversations.value.splice(idx, 1)[0]
      conversations.value.unshift(item)
      computeUnread()
    } else {
      // 新会话被拉入:重新拉列表
      loadConversations(true).catch(() => {})
    }
  }

  // ===== 实时:已读 =====
  function receiveRead({ conversationId, userId, lastReadMessageId }) {
    if (userId === currentUserId.value) {
      const idx = conversations.value.findIndex((c) => c.id === conversationId)
      if (idx >= 0) {
        conversations.value[idx].unread = 0
        computeUnread()
      }
    }
    // 找到我发的最后一条已读消息(用于 UI 显示"已读")
    if (userId && lastReadMessageId) {
      // 可在 store 中维护 lastReadMap 供 UI 查询,这里简单先不存
    }
  }

  // ===== 实时:会话被清空 =====
  function receiveConversationCleared({ conversationId }) {
    if (!conversationId) return
    // 清掉本地消息列表
    if (messagesByConv.value[conversationId]) {
      messagesByConv.value[conversationId] = []
    }
    // 更新会话列表的"最后一条"预览
    const idx = conversations.value.findIndex((c) => c.id === conversationId)
    if (idx >= 0) {
      conversations.value[idx].lastMessage = null
      conversations.value[idx].unread = 0
      computeUnread()
    }
  }

  // ===== 实时:会话元数据被更新(重命名等) =====
  function receiveConversationUpdated({ conversationId, name }) {
    if (!conversationId) return
    const idx = conversations.value.findIndex((c) => c.id === conversationId)
    if (idx >= 0 && name) {
      conversations.value[idx] = { ...conversations.value[idx], name }
    }
  }

  // ===== 实时:正在输入 =====
  function receiveTyping({ conversationId, userId, isTyping }) {
    if (!conversationId) return
    if (!typingByConv.value[conversationId]) typingByConv.value[conversationId] = new Set()
    const set = typingByConv.value[conversationId]
    if (isTyping) set.add(userId)
    else set.delete(userId)
  }

  // ===== 实时:在线状态 =====
  function receivePresence({ userId, online }) {
    const s = new Set(onlineUserIds.value)
    if (online) s.add(userId)
    else s.delete(userId)
    onlineUserIds.value = s
  }

  // ===== 发送消息 =====
  function sendMessage(convId, payload) {
    if (!convId) return Promise.reject(new Error('no conversation'))
    return new Promise((resolve, reject) => {
      imSocket.emit('message:send', { conversationId: convId, ...payload }, (ack) => {
        if (ack?.ok) resolve(ack.message)
        else reject(new Error(ack?.reason || 'send failed'))
      })
    })
  }

  // ===== 发送附件 =====
  async function sendAttachment(convId, file) {
    const res = await uploadAttachment(file)
    const data = res.data || res
    const isImage = (data.mime || '').startsWith('image/')
    return sendMessage(convId, {
      type: isImage ? 'image' : 'file',
      content: isImage ? '[图片]' : '[文件]',
      attachmentName: data.name,
      attachmentUrl: data.url,
      attachmentSize: data.size,
      attachmentMime: data.mime,
    })
  }

  // ===== 发送输入事件 =====
  function sendTyping(convId, isTyping) {
    imSocket.emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId: convId })
  }

  // ===== 创建会话 =====
  async function createDirect(targetUserId) {
    const res = await createDirectConversation(targetUserId)
    const id = res.data?.id || res.id
    await loadConversations(true)
    await openConversation(id)
    return id
  }

  async function createGroup(name, memberIds) {
    const res = await createGroupConversation({ name, memberIds })
    const id = res.data?.id || res.id
    await loadConversations(true)
    await openConversation(id)
    return id
  }

  // 重命名群聊:乐观更新本地 + 调 API
  async function renameGroup(convId, newName) {
    const name = (newName || '').trim()
    if (!name) throw new Error('群聊名称不能为空')
    // 乐观更新
    const idx = conversations.value.findIndex((c) => c.id === convId)
    if (idx >= 0) {
      conversations.value[idx] = { ...conversations.value[idx], name }
    }
    try {
      await renameGroupApi(convId, name)
    } catch (e) {
      // 失败回滚:重拉列表
      await loadConversations(true)
      throw e
    }
  }

  // ===== 清空会话历史(乐观:先清本地,再调 API) =====
  async function clearConversation(convId) {
    if (!convId) return
    // 乐观更新:立刻清掉本地视图
    receiveConversationCleared({ conversationId: convId })
    // 调后端真删
    await clearHistoryApi(convId)
  }

  // ===== 面板控制 =====
  function openPanel() {
    panelOpen.value = true
    if (!loaded.value) loadConversations().catch(() => {})
  }
  function closePanel() {
    panelOpen.value = false
    // 🌟 关键:关掉弹窗时把 activeConvId 也清空,否则 receiveMessage 里
    // `if (activeConvId.value !== convId)` 永远为 false,关弹窗后别的会话
    // 发来消息不会触发 unread +1,顶部红点不出现。
    activeConvId.value = null
  }
  function togglePanel() {
    panelOpen.value ? closePanel() : openPanel()
  }

  // ===== 绑定 socket 事件 =====
  function bindSocketEvents() {
    imSocket.on('message:new', receiveMessage)
    imSocket.on('message:read', receiveRead)
    imSocket.on('typing', receiveTyping)
    imSocket.on('presence', receivePresence)
    imSocket.on('conversation:cleared', receiveConversationCleared)
    imSocket.on('conversation:updated', receiveConversationUpdated)
    imSocket.on('conversation:update', () => {
      loadConversations(true).catch(() => {})
    })
  }

  function unbindSocketEvents() {
    imSocket.off('message:new', receiveMessage)
    imSocket.off('message:read', receiveRead)
    imSocket.off('typing', receiveTyping)
    imSocket.off('presence', receivePresence)
    imSocket.off('conversation:cleared', receiveConversationCleared)
    imSocket.off('conversation:updated', receiveConversationUpdated)
  }

  // ===== 启动 / 停用 =====
  function start() {
    const userStore = useUserStore()
    if (!userStore.token) return
    setCurrentUser(parseJwtSub(userStore.token))
    imSocket.connect(userStore.token)
    bindSocketEvents()
    // 启动时拉一次未读
    loadConversations().catch(() => {})
  }

  function stop() {
    unbindSocketEvents()
    imSocket.disconnect()
    panelOpen.value = false
    activeConvId.value = null
    conversations.value = []
    messagesByConv.value = {}
    loaded.value = false
    unreadTotal.value = 0
  }

  function parseJwtSub(token) {
    if (!token) return ''
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const obj = JSON.parse(json)
      return obj.sub || obj.id || ''
    } catch (e) {
      return ''
    }
  }

  return {
    contacts,
    conversations,
    activeConvId,
    activeConv,
    messagesByConv,
    typingByConv,
    onlineUserIds,
    panelOpen,
    loadingMessages,
    unreadTotal,
    loaded,
    currentUserId,
    loadContacts,
    loadConversations,
    openConversation,
    loadHistory,
    loadMoreHistory,
    sendMessage,
    sendAttachment,
    sendTyping,
    receiveMessage,
    receiveRead,
    receiveTyping,
    receivePresence,
    receiveConversationCleared,
    receiveConversationUpdated,
    createDirect,
    createGroup,
    renameGroup,
    clearConversation,
    openPanel,
    closePanel,
    togglePanel,
    start,
    stop,
    setCurrentUser,
  }
})
