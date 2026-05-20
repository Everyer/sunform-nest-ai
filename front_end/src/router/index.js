import { createRouter, createWebHashHistory } from 'vue-router'
import { staticRoutes } from './routes'
import { useUserStore } from '@/store/useUserStore'
import { useMenuStore } from '@/store/useMenuStore'
import { useAppStore } from '@/store/useAppStore'

const router = createRouter({
  history: createWebHashHistory(),
  routes: staticRoutes
})

let generatedForToken = ''

router.beforeEach(async (to, from, next) => {
  if (to.meta?.whiteList) {
    const userStore = useUserStore()
    if (to.path === '/login' && userStore.isLogin) {
      next('/')
      return
    }
    next()
    return
  }

  const userStore = useUserStore()
  if (!userStore.isLogin) {
    next({ path: '/login' })
    return
  }

  const menuStore = useMenuStore()
  // Force re-generate if token changed (e.g. re-login without page refresh)
  if (!menuStore.hasGeneratedRoutes || generatedForToken !== userStore.token) {
    try {
      await menuStore.generateRoutes()
      generatedForToken = userStore.token
      next({ ...to, replace: true })
      return
    } catch (e) {
      console.error('Failed to generate routes:', e)
      userStore.logout()
      return
    }
  }

  if (to.name && to.name !== 'NotFound') {
    const appStore = useAppStore()
    appStore.addTab(to.name)
    appStore.setActiveTab(to.name)
  }

  next()
})

export default router
