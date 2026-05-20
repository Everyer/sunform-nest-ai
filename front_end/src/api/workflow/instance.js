import request from '@/api/index'

export function startInstance(data) {
  return request.post('/workflow/instance/start', data)
}

export function approveInstance(data) {
  return request.post('/workflow/instance/approve', data)
}

export function withdrawInstance(instanceId) {
  return request.post('/workflow/instance/withdraw', { instanceId })
}

export function getInstancePage(data) {
  return request.post('/workflow/instance/page', data)
}

export function getInstanceDetail(id) {
  return request.post('/workflow/instance/detail', { id })
}
