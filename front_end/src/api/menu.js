import request from './index'

export function getMenuTree() {
  return request.post('/menu/findTree')
}

export function getMenuPage(data) {
  return request.post('/menu/page', data)
}

export function getMenuList() {
  return request.post('/menu/list')
}

export function getMenuDetail(id) {
  return request.post('/menu/detail', { id })
}

export function createMenu(data) {
  return request.post('/menu/create', data)
}

export function updateMenu(data) {
  return request.post('/menu/update', data)
}

export function deleteMenu(id) {
  return request.post('/menu/delete', { id })
}
