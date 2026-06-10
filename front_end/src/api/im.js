import request from './index'

// 联系人列表(可聊天的用户,排除自己)
export function listContacts() {
  return request.post('/im/contacts/list', {})
}

// 我参与的所有会话(含未读 + 最后消息)
export function listConversations() {
  return request.post('/im/conversations/list', {})
}

// 会话详情
export function getConversationDetail(id) {
  return request.post('/im/conversations/detail', { id })
}

// 创建/获取一对一会话(幂等)
export function createDirectConversation(targetUserId) {
  return request.post('/im/conversations/createDirect', { targetUserId })
}

// 创建群聊
export function createGroupConversation(payload) {
  return request.post('/im/conversations/createGroup', payload)
}

// 重命名群聊
export function renameGroup(id, name) {
  return request.post('/im/conversations/rename', { id, name })
}

// 历史消息(倒序分页)
export function getMessagesPage(payload) {
  return request.post('/im/messages/page', payload)
}

// 通过 REST 发送消息(实时通道由 socket.io 接管)
export function sendMessage(payload) {
  return request.post('/im/messages/send', payload)
}

// 推进已读指针
export function markRead(payload) {
  return request.post('/im/messages/markRead', payload)
}

// 群聊消息已读回执
export function markGroupRead(messageId) {
  return request.post('/im/messages/markGroupRead', { messageId })
}

// 清空会话历史(同步删除后端数据)
export function clearHistory(conversationId) {
  return request.post('/im/messages/clear', { conversationId })
}

// 上传附件
// 关键:不要显式设置 Content-Type,让 axios 看到 FormData 后自动生成
// "multipart/form-data; boundary=----xxx" 头,否则不带 boundary 时 multer 无法
// 解析分块,会出现文件 0 字节 / 偶发失败的诡异问题(参考 GlobalAiChat.vue:833)。
export function uploadAttachment(file, onProgress) {
  const fd = new FormData()
  fd.append('file', file, file.name || 'file')
  return request.post('/im/attachments/upload', fd, {
    onUploadProgress: onProgress,
  })
}

// 邀请新成员加入群聊
export function addGroupMembers(conversationId, memberIds) {
  return request.post('/im/conversations/addMembers', { conversationId, memberIds })
}

// 移出群成员
export function removeGroupMember(conversationId, userId) {
  return request.post('/im/conversations/removeMember', { conversationId, userId })
}

// 退出群聊
export function leaveGroup(conversationId) {
  return request.post('/im/conversations/leave', { conversationId })
}

// 解散群聊
export function dismissGroup(conversationId) {
  return request.post('/im/conversations/dismiss', { conversationId })
}

// 消息撤回(2分钟内)
export function recallMessage(messageId) {
  return request.post('/im/messages/recall', { messageId })
}

