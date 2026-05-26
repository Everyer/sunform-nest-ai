import request from './index'

export function getPrintTemplatePage(data) {
  return request.post('/print-template/page', data)
}

export function getPrintTemplateDetail(id) {
  return request.post('/print-template/detail', { id })
}

export function createPrintTemplate(data) {
  return request.post('/print-template/create', data)
}

export function updatePrintTemplate(data) {
  return request.post('/print-template/update', data)
}

export function deletePrintTemplate(id) {
  return request.post('/print-template/delete', { id })
}
