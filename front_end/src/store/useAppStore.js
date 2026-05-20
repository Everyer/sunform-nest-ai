import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true')
  const mobileSidebarOpen = ref(false)
  const keepAliveNames = ref(['dashboard'])
  const activeTab = ref('dashboard')
  const theme = ref(localStorage.getItem('theme') || 'light')
  const primaryColor = ref(localStorage.getItem('primaryColor') || '#0c1832')
  const refreshFlag = ref(true)

  const tabList = computed(() => keepAliveNames.value)

  function toggleCollapsed() {
    collapsed.value = !collapsed.value
    localStorage.setItem('sidebarCollapsed', collapsed.value)
  }

  function addTab(name) {
    if (!name) return
    if (!keepAliveNames.value.includes(name)) {
      keepAliveNames.value.push(name)
    }
    activeTab.value = name
  }

  function removeTab(name) {
    const idx = keepAliveNames.value.indexOf(name)
    if (idx === -1) return
    if (name === 'dashboard') return

    const currentIdx = keepAliveNames.value.indexOf(activeTab.value)
    if (idx === currentIdx) {
      const next = keepAliveNames.value[idx - 1]
      activeTab.value = next
      const route = useRoute()
      // Navigate only if we're removing the current tab
    }
    keepAliveNames.value.splice(idx, 1)
  }

  function removeOtherTabs(name) {
    if (name === 'dashboard') {
      keepAliveNames.value = ['dashboard']
    } else {
      keepAliveNames.value = ['dashboard', name]
    }
    activeTab.value = name
  }

  function removeLeftTabs(name) {
    if (name === 'dashboard') return
    const idx = keepAliveNames.value.indexOf(name)
    keepAliveNames.value = keepAliveNames.value.filter(
      (n, i) => n === 'dashboard' || i >= idx
    )
    activeTab.value = name
  }

  function removeRightTabs(name) {
    const idx = keepAliveNames.value.indexOf(name)
    keepAliveNames.value = keepAliveNames.value.filter(
      (n, i) => n === 'dashboard' || i <= idx
    )
    activeTab.value = name
  }

  function removeAllTabs() {
    keepAliveNames.value = ['dashboard']
    activeTab.value = 'dashboard'
  }

  function setActiveTab(name) {
    activeTab.value = name
  }

  function setTheme(t) {
    theme.value = t
    localStorage.setItem('theme', t)
  }

  function setPrimaryColor(color) {
    primaryColor.value = color
    localStorage.setItem('primaryColor', color)
  }

  async function reloadPage() {
    refreshFlag.value = false
    await new Promise(resolve => setTimeout(resolve, 100))
    refreshFlag.value = true
  }

  function toggleMobileSidebar() {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  }

  return {
    collapsed, mobileSidebarOpen, keepAliveNames, activeTab, tabList, theme, primaryColor, refreshFlag,
    toggleCollapsed, toggleMobileSidebar, addTab, removeTab, removeOtherTabs,
    removeLeftTabs, removeRightTabs, removeAllTabs, setActiveTab, setTheme, setPrimaryColor, reloadPage
  }
})
