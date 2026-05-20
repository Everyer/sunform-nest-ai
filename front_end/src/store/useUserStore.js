import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi } from '@/api/auth'
import router from '@/router'

function parseJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(json)
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const username = ref(localStorage.getItem('username') || '')
  const realName = ref(localStorage.getItem('realName') || '')
  const roles = ref(JSON.parse(localStorage.getItem('roles') || '[]'))
  const permissions = ref(JSON.parse(localStorage.getItem('permissions') || '[]'))
  const deptId = ref(localStorage.getItem('deptId') || '')
  const staffId = ref(localStorage.getItem('staffId') || '')
  const menuIds = ref(JSON.parse(localStorage.getItem('menuIds') || '[]'))

  const isLogin = computed(() => !!token.value)

  async function loginAction(formData) {
    const res = await loginApi(formData)
    const tokenStr = res.access_token
    token.value = tokenStr
    localStorage.setItem('token', tokenStr)

    // Decode JWT to get user info (payload is full user JSON)
    const payload = parseJwt(tokenStr)
    username.value = payload.username
    realName.value = payload.staff?.staffName || payload.username
    deptId.value = payload.deptId || ''
    staffId.value = payload.staffId || ''

    localStorage.setItem('username', payload.username)
    localStorage.setItem('realName', realName.value)
    localStorage.setItem('deptId', deptId.value)
    localStorage.setItem('staffId', staffId.value)

    if (payload.roles) {
      roles.value = payload.roles
      localStorage.setItem('roles', JSON.stringify(payload.roles))
    }

    // menuIds will be populated by useMenuStore after fetching role details
    menuIds.value = []
    localStorage.setItem('menuIds', JSON.stringify([]))

    // Build permissions from roleKeys
    const permSet = new Set()
    if (payload.roles) {
      payload.roles.forEach(r => {
        if (r.roleKey) {
          const keys = typeof r.roleKey === 'string' ? JSON.parse(r.roleKey) : r.roleKey
          keys?.forEach(k => permSet.add(k))
        }
      })
    }
    permissions.value = [...permSet]
    localStorage.setItem('permissions', JSON.stringify(permissions.value))

    return res
  }

  function logout() {
    token.value = ''
    username.value = ''
    realName.value = ''
    roles.value = []
    permissions.value = []
    deptId.value = ''
    staffId.value = ''
    menuIds.value = []
    localStorage.clear()
    // 清理菜单/路由/标签页状态
    import('@/store/useMenuStore').then(m => m.useMenuStore().resetRoutes())
    import('@/store/useAppStore').then(m => m.useAppStore().removeAllTabs())
    router.push('/login')
  }

  function hasPermission(code) {
    return permissions.value.includes(code) || roles.value.some(r => r.roleKey?.includes('admin'))
  }

  return {
    token, username, realName, roles, permissions, deptId, staffId, menuIds, isLogin,
    loginAction, logout, hasPermission
  }
})
