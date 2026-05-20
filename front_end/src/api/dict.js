import request from './index'

export function getDictPage(data) {
  return request.post('/dict/page', data)
}

export function getDictList() {
  return request.post('/dict/list')
}

export function getDictTree() {
  return request.post('/dict/findTree')
}

export function getDictDetail(id) {
  return request.post('/dict/detail', { id })
}

export function createDict(data) {
  return request.post('/dict/create', data)
}

export function updateDict(data) {
  return request.post('/dict/update', data)
}

export function deleteDict(id) {
  return request.post('/dict/delete', { id })
}
