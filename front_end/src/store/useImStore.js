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
  addGroupMembers,
  removeGroupMember,
  leaveGroup as leaveGroupApi,
  dismissGroup as dismissGroupApi,
  recallMessage as recallMessageApi,
} from '@/api/im'
import { imSocket } from '@/utils/imSocket'
import { showNotification, getNotificationPermission, playNotificationSound } from '@/utils/notification'
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
  const soundEnabled = ref(localStorage.getItem('im_sound_enabled') !== 'false') // 声音提醒开关，默认开启
  const loaded = ref(false) // 是否已加载过会话列表
  const loadingMessages = ref(false)
  const uploadProgress = ref(0) // 上传进度 (0-100)
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
      // 桌面通知:仅在不是我发的、且当前未打开该会话时弹
      const shouldNotify =
        msg.senderId !== currentUserId.value && activeConvId.value !== convId
      if (msg.senderId !== currentUserId.value) {
        if (activeConvId.value !== convId) {
          c.unread = (c.unread || 0) + 1
        }
      }
      // 把这个会话移到顶
      const item = conversations.value.splice(idx, 1)[0]
      conversations.value.unshift(item)
      computeUnread()
      
      // 新消息提醒与声音控制
      if (msg.senderId !== currentUserId.value) {
        // 判断我是否正看着当前会话
        const lookingAtCurrentConv = panelOpen.value && activeConvId.value === convId && typeof document !== 'undefined' && !document.hidden && document.hasFocus()
        
        if (shouldNotify) {
          notifyNewMessage(c, msg)
        }
        
        if (soundEnabled.value && !lookingAtCurrentConv) {
          playNotificationSound()
        }
        
        if (typeof document !== 'undefined' && (document.hidden || !document.hasFocus())) {
          startTitleFlash()
        }
      }
    } else {
      // 新会话被拉入:重新拉列表
      loadConversations(true).catch(() => {})
    }
  }

  // 解析发送者显示名:优先 staffName,再 username
  function resolveSenderName(msg) {
    const s = msg?.sender
    if (!s) return '未知用户'
    return s.staff?.staffName || s.username || '未知用户'
  }

  // 消息预览(把图片/文件转成可读形式)
  function formatMessagePreview(msg) {
    if (!msg) return ''
    if (msg.type === 'image') return '[图片]'
    if (msg.type === 'file') return `[文件] ${msg.attachmentName || ''}`.trim()
    return (msg.content || '').slice(0, 80)
  }

  // 弹出桌面通知。失败 / 无权限 / 不支持均静默。
  function notifyNewMessage(conv, msg) {
    if (getNotificationPermission() !== 'granted') return
    const senderName = resolveSenderName(msg)
    const isGroup = conv.type === 'group'
    const title = isGroup
      ? `${senderName} · ${conv.name || '群聊'}`
      : senderName
    const body = formatMessagePreview(msg)
    const avatar = msg?.sender?.avatar || ''
    showNotification(title, {
      body,
      avatar,
      tag: `im-conv-${conv.id}`, // 同会话的连发消息会合并为一条
      onclick: () => {
        try { window.focus() } catch (e) {}
        try { openConversation(conv.id) } catch (e) {}
      },
    })
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
    uploadProgress.value = 0
    try {
      const res = await uploadAttachment(file, (evt) => {
        if (evt.total) {
          uploadProgress.value = Math.round((evt.loaded * 100) / evt.total)
        }
      })
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
    } finally {
      uploadProgress.value = 0
    }
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
    imSocket.on('connect', () => {
      if (loaded.value) {
        loadConversations(true).catch(() => {})
        if (activeConvId.value) {
          loadHistory(activeConvId.value).catch(() => {})
        }
      }
    })
    imSocket.on('message:new', receiveMessage)
    imSocket.on('message:read', receiveRead)
    imSocket.on('message:recall', receiveMessageRecall)
    imSocket.on('typing', receiveTyping)
    imSocket.on('presence', receivePresence)
    imSocket.on('conversation:cleared', receiveConversationCleared)
    imSocket.on('conversation:updated', receiveConversationUpdated)
    imSocket.on('conversation:kicked', receiveConversationKicked)
    imSocket.on('conversation:dismissed', receiveConversationDismissed)
    imSocket.on('conversation:update', () => {
      loadConversations(true).catch(() => {})
    })
  }

  function unbindSocketEvents() {
    imSocket.off('message:new', receiveMessage)
    imSocket.off('message:read', receiveRead)
    imSocket.off('message:recall', receiveMessageRecall)
    imSocket.off('typing', receiveTyping)
    imSocket.off('presence', receivePresence)
    imSocket.off('conversation:cleared', receiveConversationCleared)
    imSocket.off('conversation:updated', receiveConversationUpdated)
    imSocket.off('conversation:kicked', receiveConversationKicked)
    imSocket.off('conversation:dismissed', receiveConversationDismissed)
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

  function setSoundEnabled(val) {
    soundEnabled.value = val
    localStorage.setItem('im_sound_enabled', val ? 'true' : 'false')
    if (val) {
      playNotificationSound()
    }
  }

  // 实时:接收撤回广播
  function receiveMessageRecall({ messageId, conversationId, content }) {
    if (!messageId || !conversationId) return
    const list = messagesByConv.value[conversationId] || []
    const idx = list.findIndex((m) => m.id === messageId)
    if (idx >= 0) {
      list[idx].type = 'system'
      list[idx].content = content
      list[idx].attachmentName = null
      list[idx].attachmentUrl = null
      list[idx].attachmentSize = null
      list[idx].attachmentMime = null
      list[idx].replyToMessageId = null
      messagesByConv.value[conversationId] = [...list]
    }
    const cIdx = conversations.value.findIndex((c) => c.id === conversationId)
    if (cIdx >= 0) {
      const c = conversations.value[cIdx]
      if (c.lastMessage && c.lastMessage.id === messageId) {
        c.lastMessage.type = 'system'
        c.lastMessage.content = content
        c.lastMessage.attachmentName = null
      }
    }
  }

  // 实时:接收被踢广播
  function receiveConversationKicked({ conversationId }) {
    if (!conversationId) return
    conversations.value = conversations.value.filter((c) => c.id !== conversationId)
    computeUnread()
    if (activeConvId.value === conversationId) {
      activeConvId.value = null
    }
  }

  // 实时:接收群解散广播
  function receiveConversationDismissed({ conversationId }) {
    if (!conversationId) return
    conversations.value = conversations.value.filter((c) => c.id !== conversationId)
    computeUnread()
    if (messagesByConv.value[conversationId]) {
      delete messagesByConv.value[conversationId]
    }
    if (activeConvId.value === conversationId) {
      activeConvId.value = null
    }
  }

  // 撤回消息 API 触发
  async function recallMessage(msgId) {
    await recallMessageApi(msgId)
  }

  // 群聊拉人
  async function inviteMembers(convId, userIds) {
    await addGroupMembers(convId, userIds)
    await loadConversations(true)
    if (activeConvId.value === convId) {
      const res = await getConversationDetail(convId)
      const idx = conversations.value.findIndex((c) => c.id === convId)
      if (idx >= 0) {
        conversations.value[idx].members = res.data?.members || res.members || []
      }
    }
  }

  // 群聊踢人
  async function kickMember(convId, userId) {
    await removeGroupMember(convId, userId)
    await loadConversations(true)
    if (activeConvId.value === convId) {
      const res = await getConversationDetail(convId)
      const idx = conversations.value.findIndex((c) => c.id === convId)
      if (idx >= 0) {
        conversations.value[idx].members = res.data?.members || res.members || []
      }
    }
  }

  // 退群
  async function leaveGroup(convId) {
    await leaveGroupApi(convId)
    await loadConversations(true)
  }

  // 解散群聊
  async function dismissGroup(convId) {
    await dismissGroupApi(convId)
    await loadConversations(true)
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
    soundEnabled,
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
    setSoundEnabled,
    uploadProgress,
    recallMessage,
    inviteMembers,
    kickMember,
    leaveGroup,
    dismissGroup,
  }
})

// ====== 浏览器标签页 Title 闪烁提醒助手 ======
let titleTimer = null
let isFlashing = false
let originalTitle = ''

function startTitleFlash(text = '【您有新消息】') {
  if (typeof document === 'undefined') return
  if (isFlashing) return
  if (!originalTitle) originalTitle = document.title
  isFlashing = true
  let show = true
  titleTimer = setInterval(() => {
    document.title = show ? `${text} ${originalTitle}` : `【　　　　　】 ${originalTitle}`
    show = !show
  }, 800)
}

function stopTitleFlash() {
  if (typeof document === 'undefined') return
  if (!isFlashing) return
  clearInterval(titleTimer)
  titleTimer = null
  isFlashing = false
  if (originalTitle) document.title = originalTitle
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const clearFlash = () => {
    if (!document.hidden) {
      stopTitleFlash()
    }
  }
  document.addEventListener('visibilitychange', clearFlash)
  window.addEventListener('focus', clearFlash)
}
