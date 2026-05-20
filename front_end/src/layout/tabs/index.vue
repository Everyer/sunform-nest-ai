<template>
  <div class="tab-bar">
    <div class="tab-scroll" ref="tabScrollRef">
      <div class="tab-list">
        <div
          v-for="tab in appStore.keepAliveNames"
          :key="tab"
          class="tab-item"
          :class="{ active: appStore.activeTab === tab }"
          @click="handleClick(tab)"
          @contextmenu.prevent="handleContextMenu($event, tab)"
        >
          <span v-if="tab === 'dashboard'" class="tab-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </span>
          <span class="tab-title">{{ getTabTitle(tab) }}</span>
          <span
            v-if="tab !== 'dashboard'"
            class="tab-close"
            @click.stop="handleClose(tab)"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </span>
        </div>
      </div>
    </div>

    <n-dropdown
      :show="showContextMenu"
      :x="ctxMenuX"
      :y="ctxMenuY"
      placement="bottom-start"
      trigger="manual"
      :options="ctxOptions"
      @select="handleCtxSelect"
      @clickoutside="showContextMenu = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { NDropdown } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/useAppStore'

const router = useRouter()
const appStore = useAppStore()

const showContextMenu = ref(false)
const ctxMenuX = ref(0)
const ctxMenuY = ref(0)
const ctxTabName = ref('')

const ctxOptions = computed(() => [
  { label: '刷新当前', key: 'refresh' },
  { label: '关闭当前', key: 'close', disabled: ctxTabName.value === 'dashboard' },
  { type: 'divider' },
  { label: '关闭其他', key: 'closeOther' },
  { label: '关闭左侧', key: 'closeLeft', disabled: isFirstTab(ctxTabName.value) },
  { label: '关闭右侧', key: 'closeRight', disabled: isLastTab(ctxTabName.value) },
  { type: 'divider' },
  { label: '关闭全部', key: 'closeAll' }
])

function isFirstTab(name) {
  const idx = appStore.keepAliveNames.indexOf(name)
  return idx <= 0
}

function isLastTab(name) {
  const idx = appStore.keepAliveNames.indexOf(name)
  return idx === appStore.keepAliveNames.length - 1
}

function getTabTitle(name) {
  if (name === 'dashboard') return '工作台'
  const routes = router.getRoutes()
  const route = routes.find(r => r.name === name)
  return route?.meta?.title || name
}

function handleClick(name) {
  appStore.setActiveTab(name)
  router.push({ name })
}

function handleClose(name) {
  const idx = appStore.keepAliveNames.indexOf(name)
  const currentIdx = appStore.keepAliveNames.indexOf(appStore.activeTab)
  appStore.removeTab(name)
  if (idx === currentIdx) {
    const arr = appStore.keepAliveNames
    const newIdx = Math.min(idx, arr.length - 1)
    router.push({ name: arr[newIdx] })
  }
}

function handleContextMenu(e, name) {
  ctxTabName.value = name
  ctxMenuX.value = e.clientX
  ctxMenuY.value = e.clientY
  showContextMenu.value = true
}

function handleCtxSelect(key) {
  const name = ctxTabName.value
  switch (key) {
    case 'refresh':
      appStore.reloadPage()
      break
    case 'close':
      handleClose(name)
      break
    case 'closeOther':
      appStore.removeOtherTabs(name)
      if (appStore.activeTab !== name) {
        appStore.setActiveTab(name)
        router.push({ name })
      }
      break
    case 'closeLeft':
      appStore.removeLeftTabs(name)
      if (appStore.activeTab !== name) {
        appStore.setActiveTab(name)
        router.push({ name })
      }
      break
    case 'closeRight':
      appStore.removeRightTabs(name)
      if (appStore.activeTab !== name) {
        appStore.setActiveTab(name)
        router.push({ name })
      }
      break
    case 'closeAll':
      appStore.removeAllTabs()
      router.push({ name: 'dashboard' })
      break
  }
  showContextMenu.value = false
}
</script>

<style scoped>
.tab-bar {
  height: 36px;
  background: #eef0f4;
  display: flex;
  flex-shrink: 0;
  border-bottom: 1px solid #d4d8e0;
  padding: 0 6px;
  overflow: hidden;
}
.tab-scroll {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
}
.tab-scroll::-webkit-scrollbar { height: 0; }

.tab-list {
  display: flex;
  gap: 1px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  font-size: 13px;
  color: #94a3b8;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  background: transparent;
}
.tab-item:hover {
  color: #475569;
  background: rgba(0,0,0,0.02);
}
.tab-item.active {
  color: #0c1832;
  background: #fff;
  font-weight: 500;
  border-bottom-color: #d97706;
}

.tab-icon {
  display: flex;
  align-items: center;
  opacity: 0.5;
}
.tab-icon svg {
  display: block;
  position: relative;
  top: 1px;
}
.tab-item.active .tab-icon {
  opacity: 1;
}

.tab-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
  transition: all 0.15s;
  color: #cbd5e1;
  opacity: 0;
}
.tab-item:hover .tab-close {
  opacity: 1;
}
.tab-close:hover {
  background: rgba(0,0,0,0.06);
  color: #64748b;
}
.tab-item.active .tab-close {
  opacity: 1;
  color: #94a3b8;
}
.tab-item.active .tab-close:hover {
  background: rgba(217,119,6,0.08);
  color: #d97706;
}

@media (max-width: 768px) {
  .tab-bar {
    padding: 0 4px;
    height: 32px;
  }
  .tab-item {
    padding: 0 10px;
    font-size: 12px;
    gap: 4px;
  }
  .tab-title {
    max-width: 80px;
  }
}
</style>
