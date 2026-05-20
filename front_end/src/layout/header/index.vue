<template>
  <div class="header-bar">
    <div class="header-left">
      <n-button text class="menu-btn desktop-only" @click="appStore.toggleCollapsed()">
        <template #icon>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </template>
      </n-button>
      <n-button text class="menu-btn mobile-only" @click="appStore.toggleMobileSidebar()">
        <template #icon>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </template>
      </n-button>
      <div class="header-divider" />
      <n-breadcrumb class="breadcrumb">
        <n-breadcrumb-item>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </n-breadcrumb-item>
        <n-breadcrumb-item v-if="currentTitle">
          {{ currentTitle }}
        </n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <div class="header-right">
      <div class="header-actions">
        <n-button text class="action-btn" @click="showSettings = true">
          <template #icon>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </template>
        </n-button>
      </div>
      <div class="user-area">
        <n-avatar round size="small" class="user-avatar">
          {{ userStore.realName?.charAt(0) || 'U' }}
        </n-avatar>
        <span class="user-name">{{ userStore.realName }}</span>
        <n-dropdown trigger="click" :options="userOptions" @select="handleUserAction">
          <div class="user-dropdown-trigger">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </n-dropdown>
      </div>
    </div>

    <!-- Theme Settings Drawer -->
    <n-drawer v-model:show="showSettings" :width="300" placement="right">
      <n-drawer-content title="主题设置" closable>
        <div class="settings-group">
          <div class="settings-label">主题模式</div>
          <div class="theme-modes">
            <div 
              class="theme-mode-item light" 
              :class="{ active: appStore.theme === 'light' }"
              @click="appStore.setTheme('light')"
            >
              <div class="mode-preview"></div>
              <span>明亮模式</span>
            </div>
            <div 
              class="theme-mode-item dark" 
              :class="{ active: appStore.theme === 'dark' }"
              @click="appStore.setTheme('dark')"
            >
              <div class="mode-preview"></div>
              <span>暗黑模式</span>
            </div>
          </div>
        </div>

        <n-divider />

        <div class="settings-group">
          <div class="settings-label">系统主题色</div>
          <div class="color-presets">
            <div 
              v-for="color in colorPresets" 
              :key="color"
              class="color-item"
              :style="{ backgroundColor: color }"
              :class="{ active: appStore.primaryColor === color }"
              @click="appStore.setPrimaryColor(color)"
            >
              <svg v-if="appStore.primaryColor === color" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <div class="custom-color-picker">
            <n-color-picker 
              :value="appStore.primaryColor" 
              @update:value="appStore.setPrimaryColor"
              :show-alpha="false"
            />
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { computed, h, ref } from 'vue'
import { NButton, NIcon, NBreadcrumb, NBreadcrumbItem, NDropdown, NAvatar, NDrawer, NDrawerContent, NDivider, NColorPicker } from 'naive-ui'
import { LogOutOutline } from '@vicons/ionicons5'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/useUserStore'
import { useAppStore } from '@/store/useAppStore'

const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const showSettings = ref(false)
const colorPresets = [
  '#0c1832', // Default Navy
  '#d97706', // Amber
  '#059669', // Emerald
  '#dc2626', // Red
  '#2563eb', // Blue
  '#7c3aed', // Violet
  '#db2777', // Pink
]

const currentTitle = computed(() => route.meta?.title || '')

const userOptions = computed(() => [
  {
    label: () => h('div', { style: 'padding:4px 0' }, [
      h('div', { style: 'font-weight:600;color:#0f172a;font-size:14px' }, userStore.realName || userStore.username),
      h('div', { style: 'font-size:12px;color:#94a3b8;margin-top:2px' }, (userStore.roles || []).map(r => r.roleName).join(', ') || '无角色')
    ]),
    key: 'info',
    disabled: true
  },
  { type: 'divider' },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h(NIcon, null, { default: () => h(LogOutOutline) })
  }
])

function handleUserAction(key) {
  if (key === 'logout') userStore.logout()
}
</script>

<style scoped>
.header-bar {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: #fff;
  border-bottom: 1px solid #e8ecf2;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.menu-btn {
  color: #94a3b8;
  transition: color 0.2s;
}
.menu-btn:hover {
  color: #0c1832;
}
.menu-btn :deep(svg) {
  display: block;
}
.header-divider {
  width: 1px;
  height: 20px;
  background: #e8ecf2;
}
.breadcrumb {
  font-size: 13px;
}
.breadcrumb :deep(.n-breadcrumb-item) {
  color: #64748b;
}
.breadcrumb :deep(.n-breadcrumb-item__link) {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.breadcrumb :deep(.n-breadcrumb-item__link svg) {
  display: block;
  flex-shrink: 0;
}
.breadcrumb :deep(.n-breadcrumb-item:last-child .n-breadcrumb-item__link) {
  color: #0f172a;
  font-weight: 500;
}
.breadcrumb :deep(.n-breadcrumb-item__separator) {
  display: inline-flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.action-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  color: #64748b;
  transition: all 0.2s;
}
.action-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.user-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px 4px 4px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}
.user-area:hover {
  background: #f1f5f9;
}
.user-avatar {
  background: linear-gradient(135deg, #0c1832, #1a2d4a) !important;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}
.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-dropdown-trigger {
  display: flex;
  align-items: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}
.user-dropdown-trigger:hover {
  color: #0c1832;
}

/* Settings Styles */
.settings-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.settings-label {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}
.theme-modes {
  display: flex;
  gap: 16px;
}
.theme-mode-item {
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.theme-mode-item span {
  font-size: 12px;
  color: #64748b;
}
.theme-mode-item.active span {
  color: #0f172a;
  font-weight: 500;
}
.mode-preview {
  width: 100%;
  height: 50px;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.2s;
}
.theme-mode-item.light .mode-preview {
  background: #f8f9fc;
  border-color: #e2e8f0;
}
.theme-mode-item.dark .mode-preview {
  background: #1e293b;
  border-color: #334155;
}
.theme-mode-item.active .mode-preview {
  border-color: var(--n-primary-color);
  box-shadow: 0 0 0 2px rgba(12,24,50,0.05);
}

.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.color-item {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}
.color-item:hover {
  transform: scale(1.1);
}
.color-item.active {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--n-primary-color);
}
.custom-color-picker {
  margin-top: 8px;
}

/* Mobile: show/hide correct hamburger */
.mobile-only {
  display: none;
}
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: inline-flex;
  }
  .header-bar {
    padding: 0 10px;
  }
  .header-divider {
    display: none;
  }
  .breadcrumb {
    display: none;
  }
  .header-actions {
    display: none;
  }
}
</style>
