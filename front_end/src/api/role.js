import request from './index'

export function getRolePage(data) {
  return request.post('/role/page', data)
}

export function getRoleList() {
  return request.post('/role/list')
}

export function getRoleDetail(id) {
  return request.post('/role/detail', { id })
}

export function createRole(data) {
  return request.post('/role/create', data)
}

export function updateRole(data) {
  return request.post('/role/update', data)
}

export function deleteRole(id) {
  return request.post('/role/delete', { id })
}
