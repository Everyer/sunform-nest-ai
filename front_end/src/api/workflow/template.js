import request from '@/api/index'

export function getTemplatePage(data) {
  return request.post('/workflow/template/page', data)
}

export function getTemplateList() {
  return request.post('/workflow/template/list')
}

export function getTemplateDetail(id) {
  return request.post('/workflow/template/detail', { id })
}

export function createTemplate(data) {
  return request.post('/workflow/template/create', data)
}

export function updateTemplate(data) {
  return request.post('/workflow/template/update', data)
}

export function deleteTemplate(id) {
  return request.post('/workflow/template/delete', { id })
}

export function publishTemplate(id) {
  return request.post('/workflow/template/publish', { id })
}

export function deactivateTemplate(id) {
  return request.post('/workflow/template/deactivate', { id })
}
