import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMenuTree } from '@/api/menu'
import { getRoleDetail } from '@/api/role'
import { useUserStore } from './useUserStore'
import router from '@/router'
import EmptyLayout from '@/layout/empty.vue'

const modules = import.meta.glob('/src/views/**/*.vue')

function createAsyncComponent(viewPath) {
  if (!viewPath) return null
  // Try exact match first, then with .vue extension
  const key = `/src/views/${viewPath}`
  if (modules[key]) return modules[key]
  if (modules[key + '.vue']) return modules[key + '.vue']
  // Also try with index.vue for directory-style paths
  if (modules[key + '/index.vue']) return modules[key + '/index.vue']
  return null
}

export const useMenuStore = defineStore('menu', () => {
  const menuList = ref(JSON.parse(localStorage.getItem('menuList') || '[]'))
  const sidebarMenus = ref([])
  const hasGeneratedRoutes = ref(false)

  function filterMenusByUser(menus, menuIds) {
    const userStore = useUserStore()
    const isAdmin = userStore.roles.some(r => {
      const keys = Array.isArray(r.roleKey) ? r.roleKey : (typeof r.roleKey === 'string' ? JSON.parse(r.roleKey || '[]') : [])
      return keys.includes('admin') || r.roleName === '超级管理员'
    })

    return menus
      .filter(m => {
        if (isAdmin) return true
        return menuIds.includes(m.id)
      })
      .map(m => ({
        ...m,
        children: m.children?.length ? filterMenusByUser(m.children, menuIds) : []
      }))
      .filter(m => m.type !== 'comp')
  }

  async function generateRoutes() {
    const userStore = useUserStore()
    const menus = await getMenuTree()

    // 非 admin 用户: 从角色详情获取可访问的菜单ID
    const isAdmin = userStore.roles.some(r => {
      const keys = Array.isArray(r.roleKey) ? r.roleKey : (typeof r.roleKey === 'string' ? JSON.parse(r.roleKey || '[]') : [])
      return keys.includes('admin') || r.roleName === '超级管理员'
    })
    if (!isAdmin && (!userStore.menuIds || userStore.menuIds.length === 0)) {
      const menuIdSet = new Set()
      for (const role of userStore.roles) {
        try {
          const detail = await getRoleDetail(role.id)
          if (detail?.menuIds) {
            detail.menuIds.forEach(id => menuIdSet.add(id))
          }
        } catch (e) {
          console.error('获取角色菜单失败:', role.id, e)
        }
      }
      userStore.menuIds = [...menuIdSet]
      localStorage.setItem('menuIds', JSON.stringify([...menuIdSet]))
    }

    const filtered = filterMenusByUser(menus, userStore.menuIds)

    localStorage.setItem('menuList', JSON.stringify(filtered))
    menuList.value = filtered
    sidebarMenus.value = filtered

    // Remove old dynamic routes (cascade removes children)
    router.getRoutes().forEach(r => {
      if (r.meta?.dynamic) {
        try { router.removeRoute(r.name) } catch (e) {}
      }
    })

    // Build nested routes: parent menus use EmptyLayout, children nest under them
    function addMenuRoutes(menuItems, parentName = 'root', parentPath = '') {
      for (const menu of menuItems) {
        const fullPath = menu.path.startsWith('/') ? menu.path : `${parentPath}/${menu.path}`
        // 子级 routePath 必须相对父级，否则 vue-router 会拼成 /parent/parent/child
        let routePath
        if (!parentPath) {
          // 顶级：去掉前导 /
          routePath = fullPath.replace(/^\//, '')
        } else if (fullPath === parentPath) {
          // 子路径与父级相同（如 /knowledge → 知识库管理）
          routePath = ''
        } else if (fullPath.startsWith(parentPath + '/')) {
          // 去掉父级前缀，保留后缀
          routePath = fullPath.slice(parentPath.length + 1)
        } else {
          routePath = fullPath.replace(/^\//, '')
        }
        const comp = menu.component ? createAsyncComponent(menu.component) : null

        if (menu.children?.length) {
          // Parent menu: EmptyLayout renders <router-view> for children
          router.addRoute(parentName, {
            path: routePath,
            name: menu.id,
            component: EmptyLayout,
            meta: { title: menu.name, icon: menu.icon, code: menu.code, menuId: menu.id, dynamic: true }
          })

          // Redirect parent URL to first component child
          const firstChild = menu.children.find(c => c.component && createAsyncComponent(c.component))
          if (firstChild) {
            router.addRoute(menu.id, { path: '', name: menu.id + '-redirect', redirect: { name: firstChild.id } })
          }

          addMenuRoutes(menu.children, menu.id, fullPath)
        } else if (comp) {
          // Leaf menu: add under parent, full URL resolves via nesting
          router.addRoute(parentName, {
            path: routePath,
            name: menu.id,
            component: comp,
            meta: { title: menu.name, icon: menu.icon, code: menu.code, menuId: menu.id, dynamic: true }
          })
        }
      }
    }

    addMenuRoutes(filtered)

    // Add catch-all 404 as child of root
    router.addRoute('root', {
      path: ':pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/error/404.vue'),
      meta: { title: '404' }
    })

    hasGeneratedRoutes.value = true
  }

  function resetRoutes() {
    hasGeneratedRoutes.value = false
    menuList.value = []
    sidebarMenus.value = []
  }

  return { menuList, sidebarMenus, hasGeneratedRoutes, generateRoutes, resetRoutes }
})
