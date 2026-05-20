import request from './index'

export function getPostPage(data) {
  return request.post('/post/page', data)
}

export function getPostList() {
  return request.post('/post/list')
}

export function getPostDetail(id) {
  return request.post('/post/detail', { id })
}

export function createPost(data) {
  return request.post('/post/create', data)
}

export function updatePost(data) {
  return request.post('/post/update', data)
}

export function deletePost(id) {
  return request.post('/post/delete', { id })
}
