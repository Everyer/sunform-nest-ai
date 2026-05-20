import request from './index'

export function getUserPage(data) {
  return request.post('/user/page', data)
}

export function getUserList() {
  return request.post('/user/list')
}

export function getUserDetail(id) {
  return request.post('/user/detail', { id })
}

export function createUser(data) {
  return request.post('/user/create', data)
}

export function updateUser(data) {
  return request.post('/user/update', data)
}

export function deleteUser(id) {
  return request.post('/user/delete', { id })
}
