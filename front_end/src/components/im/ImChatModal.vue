<template>
  <transition name="im-panel-slide">
    <div v-if="store.panelOpen" class="im-modal" :class="{ maximized: maximized }">
      <!-- 头部 -->
      <div class="im-header">
        <div class="header-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>消息</span>
          <span v-if="store.unreadTotal > 0" class="total-badge">{{ store.unreadTotal > 99 ? '99+' : store.unreadTotal }}</span>
        </div>
        <div class="header-actions">
          <button class="icon-btn" :title="maximized ? '还原' : '最大化'" @click="maximized = !maximized">
            <svg v-if="!maximized" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>
          </button>
          <button class="icon-btn" title="关闭" @click="store.closePanel()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <!-- 双栏 -->
      <div class="im-body" :class="{ 'mobile-show-list': mobileView === 'list' }">
        <div class="col-left">
          <ConversationList
            :conversations="store.conversations"
            :active-conv-id="store.activeConvId"
            :loading="false"
            @select="onSelectConv"
            @new-chat="showNewChat = true"
          />
        </div>
        <div class="col-right">
          <ChatWindow
            :conv="store.activeConv"
            :mobile="isMobile"
            @back="onMobileBack"
          />
        </div>
      </div>

      <!-- 新建聊天 -->
      <NewChatDialog v-model:show="showNewChat" />
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useImStore } from '@/store/useImStore'
import { useUserStore } from '@/store/useUserStore'
import ConversationList from './ConversationList.vue'
import ChatWindow from './ChatWindow.vue'
import NewChatDialog from './NewChatDialog.vue'

const store = useImStore()
const userStore = useUserStore()
const maximized = ref(false)
const showNewChat = ref(false)
const isMobile = ref(false)
const mobileView = ref('list') // 'list' | 'chat'

function detectMobile() {
  isMobile.value = window.innerWidth < 768
}
onMounted(() => {
  detectMobile()
  window.addEventListener('resize', detectMobile)
})
onUnmounted(() => {
  window.removeEventListener('resize', detectMobile)
})

// 启动/停用:跟 userStore.token 绑定
watch(() => userStore.token, (token) => {
  if (token) store.start()
  else store.stop()
}, { immediate: true })

onUnmounted(() => store.stop())

function onSelectConv(id) {
  store.openConversation(id)
  if (isMobile.value) mobileView.value = 'chat'
}
function onMobileBack() {
  mobileView.value = 'list'
}
</script>

<style scoped>
.im-modal {
  position: fixed;
  right: 24px; bottom: 24px;
  width: 880px; height: 680px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 48px);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px) saturate(120%);
  -webkit-backdrop-filter: blur(24px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  display: flex; flex-direction: column;
  z-index: 4000;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.im-modal::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, #0c1832, #2563eb, #06b6d4);
  z-index: 10;
}
.im-modal.maximized {
  right: 12px; bottom: 12px;
  width: calc(100vw - 24px);
  height: calc(100vh - 24px);
  border-radius: 20px;
}

.im-header {
  height: 50px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid rgba(12, 24, 50, 0.06);
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6));
  flex-shrink: 0;
}
.header-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 700; color: #0f172a;
}
.total-badge {
  background: #dc2626; color: #fff;
  font-size: 10px; font-weight: 700;
  padding: 1px 6px; border-radius: 8px;
}
.header-actions { display: flex; gap: 4px; }
.icon-btn {
  background: transparent; border: none;
  width: 30px; height: 30px;
  border-radius: 8px;
  color: #64748b;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.icon-btn:hover { background: #f1f5f9; color: #0c1832; }
.icon-btn:active { transform: scale(0.92); }

.im-body {
  flex: 1;
  display: flex;
  min-height: 0;
}
.col-left {
  display: flex;
  flex-shrink: 0;
}
.col-right {
  flex: 1;
  display: flex;
  min-width: 0;
}

/* 入场动画 */
.im-panel-slide-enter-active, .im-panel-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.im-panel-slide-enter-from, .im-panel-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}

/* 移动端 */
@media (max-width: 768px) {
  .im-modal {
    right: 0; bottom: 0;
    width: 100vw; height: 100vh;
    max-width: 100vw; max-height: 100vh;
    border-radius: 0;
  }
  .im-modal.maximized {
    right: 0; bottom: 0;
    width: 100vw; height: 100vh;
    border-radius: 0;
  }
  .im-body { position: relative; }
  .col-left, .col-right {
    width: 100%; flex: 0 0 100%;
    transition: transform 0.3s ease;
  }
  .im-body.mobile-show-list .col-left { transform: translateX(0); }
  .im-body.mobile-show-list .col-right { transform: translateX(100%); position: absolute; inset: 0; }
  .im-body:not(.mobile-show-list) .col-left { transform: translateX(-100%); position: absolute; inset: 0; }
  .im-body:not(.mobile-show-list) .col-right { transform: translateX(0); }
}
</style>
