<template>
  <div class="app-layout">
    <!-- Mobile backdrop -->
    <div
      class="mobile-backdrop"
      :class="{ show: appStore.mobileSidebarOpen }"
      @click="appStore.mobileSidebarOpen = false"
    />
    <div class="layout-container">
      <Sidebar />
      <div class="main-area">
        <AppHeader />
        <div class="main-content">
          <AppTabs />
          <div class="content-area">
            <div class="content-inner">
              <router-view v-if="appStore.refreshFlag" v-slot="{ Component, route }">
                <transition name="fade-slide" mode="out-in" appear>
                  <keep-alive :include="appStore.keepAliveNames">
                    <component :is="Component" :key="route.fullPath" />
                  </keep-alive>
                </transition>
              </router-view>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './sidebar/index.vue'
import AppHeader from './header/index.vue'
import AppTabs from './tabs/index.vue'
import { useAppStore } from '@/store/useAppStore'

const appStore = useAppStore()
</script>

<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
  background: #f3f4f8;
}
.layout-container {
  display: flex;
  height: 100vh;
}

/* Mobile backdrop */
.mobile-backdrop {
  display: none;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 24px;
}
.content-inner {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .mobile-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 150;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }
  .mobile-backdrop.show {
    opacity: 1;
    pointer-events: auto;
  }
  .content-area {
    padding: 12px 12px 16px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

/* Page transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
