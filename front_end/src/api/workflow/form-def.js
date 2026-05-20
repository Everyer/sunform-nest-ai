import request from '@/api/index'

export function getFormDefPage(data) {
  return request.post('/workflow/form-def/page', data)
}

export function getFormDefList() {
  return request.post('/workflow/form-def/list')
}

export function getFormDefDetail(id) {
  return request.post('/workflow/form-def/detail', { id })
}

export function createFormDef(data) {
  return request.post('/workflow/form-def/create', data)
}

export function updateFormDef(data) {
  return request.post('/workflow/form-def/update', data)
}

export function deleteFormDef(id) {
  return request.post('/workflow/form-def/delete', { id })
}
