import request from './index'

// === 知识库库管理 ===

export function createBase(data) {
  return request.post('/knowledge/base/create', data)
}

export function listBases() {
  return request.get('/knowledge/base/list')
}

export function updateBase(data) {
  return request.post('/knowledge/base/update', data)
}

export function deleteBase(id) {
  return request.post('/knowledge/base/delete', { id })
}

// === 文档及切片管理 ===

export function listDocuments(baseId) {
  return request.get(`/knowledge/document/list?baseId=${baseId}`)
}

// 列出所有知识库下的所有文档（用于"文档管理"菜单）
export function listAllDocuments() {
  return request.get('/knowledge/document/listAll')
}

export function uploadDocument(data) {
  return request.post('/knowledge/document/upload', data)
}

export function deleteDocument(id) {
  return request.post('/knowledge/document/delete', { id })
}

export function getDocumentChunks(documentId) {
  return request.get(`/knowledge/document/chunks?documentId=${documentId}`)
}

export function searchSimilarChunks(data) {
  return request.post('/knowledge/search', data)
}
