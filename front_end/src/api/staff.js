import request from './index'

export function getStaffPage(data) {
  return request.post('/staff/page', data)
}

export function getStaffList() {
  return request.post('/staff/list')
}

export function getStaffDetail(id) {
  return request.post('/staff/detail', { id })
}

export function createStaff(data) {
  return request.post('/staff/create', data)
}

export function updateStaff(data) {
  return request.post('/staff/update', data)
}

export function deleteStaff(id) {
  return request.post('/staff/delete', { id })
}
