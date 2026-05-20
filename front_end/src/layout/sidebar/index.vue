<template>
  <div
    class="sidebar"
    :class="{ collapsed: appStore.collapsed, 'float-show': floatPanel, 'mobile-open': appStore.mobileSidebarOpen }"
    @mouseenter="onSidebarEnter"
    @mouseleave="onSidebarLeave"
  >
    <!-- First level -->
    <div class="first-level-bar">
      <div class="logo-area" @click="appStore.toggleCollapsed()">
        <div class="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
      </div>
      <div class="first-menu-list">
        <div
          v-for="(item, index) in firstLevelMenus"
          :key="item.id"
          class="first-menu-item"
          :class="{ active: activeFirstIndex === index }"
          @click="selectFirstMenu(index)"
        >
          <n-tooltip placement="right" :show-arrow="false" :delay="500">
            <template #trigger>
              <div class="first-item-inner">
                <n-icon :size="18" :component="getIcon(item.icon)" />
              </div>
            </template>
            {{ item.name }}
          </n-tooltip>
        </div>
      </div>
      <div class="collapse-btn" @click="appStore.toggleCollapsed()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline v-if="appStore.collapsed" points="9 18 15 12 9 6" />
          <polyline v-else points="15 18 9 12 15 6" />
        </svg>
      </div>
    </div>

    <!-- Second level -->
    <div class="second-level-panel">
      <div class="second-header">
        <span class="second-badge" />
        <span class="second-title">{{ activeFirstMenu?.name || '导航' }}</span>
      </div>
      <div class="second-menu-area">
        <n-menu
          :options="secondLevelOptions"
          :value="activeMenuKey"
          :indent="18"
          :render-icon="renderMenuIcon"
          inverted
          @update:value="handleMenuSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h, watch } from 'vue'
import { NMenu, NIcon, NTooltip } from 'naive-ui'
import * as icons from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/store/useMenuStore'
import { useAppStore } from '@/store/useAppStore'

const router = useRouter()
const menuStore = useMenuStore()
const appStore = useAppStore()

const activeFirstIndex = ref(0)
const activeMenuKey = ref(null)
const floatPanel = ref(false)
let floatTimer = null

function onSidebarEnter() {
  clearTimeout(floatTimer)
  if (appStore.collapsed) floatPanel.value = true
}
function onSidebarLeave() {
  floatTimer = setTimeout(() => { floatPanel.value = false }, 200)
}

const firstLevelMenus = computed(() => menuStore.sidebarMenus || [])
const activeFirstMenu = computed(() => firstLevelMenus.value[activeFirstIndex.value] || null)

const secondLevelOptions = computed(() => {
  if (!activeFirstMenu.value) return []
  return buildMenuOptions(activeFirstMenu.value.children || [])
})

function buildMenuOptions(menus) {
  return menus
    .filter(m => m.type !== 'comp')
    .map(m => ({
      label: m.name,
      key: m.id,
      iconName: m.icon,
      children: m.children?.length ? buildMenuOptions(m.children) : undefined
    }))
}

function getIcon(iconName) {
  return icons[iconName] || icons.GridOutline
}

function renderMenuIcon(option) {
  if (!option.iconName) return null
  return h(NIcon, { size: '16' }, { default: () => h(getIcon(option.iconName)) })
}

function selectFirstMenu(index) {
  activeFirstIndex.value = index
}

function handleMenuSelect(key) {
  appStore.mobileSidebarOpen = false
  activeMenuKey.value = key
  const menu = findMenuById(activeFirstMenu.value.children || [], key)
  if (menu?.type === 'comp') {
    window.$message?.warning('该菜单为组件权限，无页面')
    return
  }
  router.push({ name: key })
}

function findMenuById(menus, id) {
  for (const m of menus) {
    if (m.id === id) return m
    if (m.children?.length) {
      const found = findMenuById(m.children, id)
      if (found) return found
    }
  }
  return null
}

function containsMenu(menus, id) {
  if (!menus) return false
  return menus.some(m => m.id === id || (m.children?.length && containsMenu(m.children, id)))
}

function findFirstLevelIndex(name) {
  if (!name) return -1
  return firstLevelMenus.value.findIndex(m =>
    m.id === name || containsMenu(m.children, name)
  )
}

// Sync sidebar active state with route changes
watch(() => router.currentRoute.value.name, (name) => {
  if (!name) return
  const idx = findFirstLevelIndex(name)
  if (idx >= 0) activeFirstIndex.value = idx
  activeMenuKey.value = name
}, { immediate: true })
</script>

<style scoped>
.sidebar {
  display: flex;
  height: 100%;
}
.sidebar.collapsed {
  position: relative;
}

/* Floating panel on collapsed hover */
.sidebar.collapsed .second-level-panel {
  position: absolute;
  left: 56px;
  top: 0;
  bottom: 0;
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-12px);
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
  box-shadow: 8px 0 24px rgba(0,0,0,0.3);
}
.sidebar.collapsed.float-show .second-level-panel {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

/* First level - deep navy */
.first-level-bar {
  width: 56px;
  background: #0c1832;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}
/* Subtle grain overlay */
.first-level-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E");
  pointer-events: none;
}

.logo-area {
  padding: 20px 0 18px;
  display: flex;
  justify-content: center;
  position: relative;
}
.logo-area::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 0;
  height: 1px;
  background: rgba(255,255,255,0.06);
}
.logo-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(217,119,6,0.12);
  border: 1px solid rgba(217,119,6,0.2);
  border-radius: 10px;
}

.first-menu-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.first-menu-item {
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.2s;
  color: rgba(255,255,255,0.35);
}
.first-menu-item:hover {
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.7);
}
.first-menu-item.active {
  background: rgba(217,119,6,0.12);
  color: #d97706;
}
.first-item-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.collapse-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: rgba(255,255,255,0.25);
  cursor: pointer;
  transition: all 0.2s;
  margin-top: auto;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.collapse-btn:hover {
  color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.06);
}
.collapse-btn svg {
  display: block;
}

/* Second level */
.second-level-panel {
  width: 220px;
  background: #0f1b32;
  border-right: 1px solid rgba(255,255,255,0.04);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.second-header {
  padding: 20px 20px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.second-title {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.3px;
}
.second-badge {
  width: 3px;
  height: 16px;
  background: #d97706;
  border-radius: 2px;
  flex-shrink: 0;
}
.second-menu-area {
  flex: 1;
  overflow-y: auto;
  padding: 6px 10px 16px;
}
.second-menu-area :deep(.n-menu) {
  border: none;
}
.second-menu-area :deep(.n-menu-item) {
  margin: 1px 0;
  border-radius: 8px;
}
.second-menu-area :deep(.n-menu-item-content) {
  display: flex;
  align-items: center;
}
.second-menu-area :deep(.n-menu-item-content__icon) {
  display: flex;
  align-items: center;
  height: 100%;
}
.second-menu-area :deep(.n-menu-item-content__icon svg) {
  display: block;
}
.second-menu-area :deep(.n-menu-item.n-menu-item--selected) {
  background: rgba(217,119,6,0.12) !important;
}
.second-menu-area :deep(.n-menu-item-content--selected) {
  color: #d97706 !important;
  font-weight: 500;
}
.second-menu-area :deep(.n-menu-item-content--selected .n-menu-item-content__icon) {
  color: #d97706 !important;
}
.second-menu-area :deep(.n-menu-item:hover) {
  background: rgba(255,255,255,0.08) !important;
}
.second-menu-area :deep(.n-menu-item:hover .n-menu-item-content__label) {
  color: #fff !important;
}
.second-menu-area :deep(.n-menu-item-content::before) {
  left: 4px;
  right: 4px;
  border-radius: 8px;
}
/* Fix submenu popup on dark */
.second-menu-area :deep(.n-submenu .n-menu-item-group) {
  background: #0f1b32;
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  /* On mobile, show both bars side by side always */
  .sidebar.collapsed .second-level-panel {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
  }
  .collapse-btn {
    display: none;
  }
}
</style>
