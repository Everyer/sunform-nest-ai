import request from './index'

export function getOnboardingPage(data) {
  return request.post('/onboarding/page', data)
}

export function getOnboardingList() {
  return request.post('/onboarding/list')
}

export function getOnboardingDetail(id) {
  return request.post('/onboarding/detail', { id })
}

export function createOnboarding(data) {
  return request.post('/onboarding/create', data)
}

export function updateOnboarding(data) {
  return request.post('/onboarding/update', data)
}

export function deleteOnboarding(id) {
  return request.post('/onboarding/delete', { id })
}
