import request from './index'

export function getUserSurveyPage(data) {
  return request.post('/userSurvey/page', data)
}

export function getUserSurveyList() {
  return request.post('/userSurvey/list')
}

export function getUserSurveyDetail(id) {
  return request.post('/userSurvey/detail', { id })
}

export function createUserSurvey(data) {
  return request.post('/userSurvey/create', data)
}

export function updateUserSurvey(data) {
  return request.post('/userSurvey/update', data)
}

export function deleteUserSurvey(id) {
  return request.post('/userSurvey/delete', { id })
}
