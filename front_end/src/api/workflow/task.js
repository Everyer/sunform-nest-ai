import request from '@/api/index'

export function getTodoList(data) {
  return request.post('/workflow/task/todo', data)
}

export function getDoneList(data) {
  return request.post('/workflow/task/done', data)
}

export function getTaskDetail(instanceId, nodeId) {
  return request.post('/workflow/task/detail', { instanceId, nodeId })
}
