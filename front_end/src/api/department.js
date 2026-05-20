import request from './index'

export function getDepartmentTree() {
  return request.post('/department/findTree')
}

export function getDepartmentPage(data) {
  return request.post('/department/page', data)
}

export function getDepartmentList() {
  return request.post('/department/list')
}

export function getDepartmentDetail(id) {
  return request.post('/department/detail', { id })
}

export function createDepartment(data) {
  return request.post('/department/create', data)
}

export function updateDepartment(data) {
  return request.post('/department/update', data)
}

export function deleteDepartment(id) {
  return request.post('/department/delete', { id })
}
