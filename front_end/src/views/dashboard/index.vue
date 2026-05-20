<template>
  <div class="dashboard">
    <!-- Welcome banner -->
    <div class="welcome-banner">
      <div class="banner-bg-pattern" />
      <div class="banner-content">
        <div class="banner-text">
          <p class="banner-greeting">上午好</p>
          <h2 class="banner-title">{{ userStore.realName || 'Admin' }}</h2>
          <p class="banner-desc">保持专注，高效工作</p>
        </div>
        <div class="banner-stats">
          <div class="mini-stat">
            <span class="mini-stat-value">1</span>
            <span class="mini-stat-label">在线用户</span>
          </div>
          <div class="mini-stat-divider" />
          <div class="mini-stat">
            <span class="mini-stat-value">{{ formatDate }}</span>
            <span class="mini-stat-label">{{ formatWeekday }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stat grid -->
    <div class="stat-grid">
      <div v-for="card in statCards" :key="card.label" class="stat-card" :style="{ '--card-bg': card.bg, '--card-accent': card.accent }">
        <div class="stat-card-top">
          <span class="stat-card-label">{{ card.label }}</span>
          <div class="stat-card-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" v-html="card.iconPath" />
          </div>
        </div>
        <div class="stat-card-value">{{ card.value }}</div>
      </div>
    </div>

    <!-- Bottom section - fills remaining space -->
    <div class="bottom-section">
      <div class="section-card quick-card">
        <div class="section-header">
          <h4>快捷入口</h4>
        </div>
        <div class="quick-grid">
          <div v-for="item in quickActions" :key="item.key" class="quick-item" @click="goSystem(item.key)">
            <div class="quick-item-icon" :style="{ background: item.bg }">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" v-html="item.iconPath" />
            </div>
            <span class="quick-item-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="section-card info-card">
        <div class="section-header">
          <h4>系统信息</h4>
        </div>
        <div class="info-list">
          <div class="info-row">
            <span class="info-label">版本</span>
            <span class="info-value">
              <n-tag size="tiny" :bordered="false" :color="{ color: '#e8ecf2', textColor: '#475569' }">v1.0.0</n-tag>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">用户</span>
            <span class="info-value">{{ userStore.username }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">角色</span>
            <span class="info-value">
              <n-tag v-for="r in userStore.roles" :key="r.id" size="tiny" :bordered="false" :color="{ color: '#fef3c7', textColor: '#92400e' }" style="margin:1px 2px">
                {{ r.roleName }}
              </n-tag>
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">登录</span>
            <span class="info-value">{{ loginTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { NTag, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/useUserStore'

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const now = new Date()
const loginTime = now.toLocaleString()
const formatDate = `${now.getMonth() + 1}/${now.getDate()}`
const formatWeekday = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()]

const statCards = [
  { label: '用户总数', value: '--', bg: 'linear-gradient(135deg, #0c1832, #1a2d4a)', accent: '#d97706', iconPath: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { label: '在线用户', value: '1', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)', accent: '#0ea5e9', iconPath: '<path d="M12 2a10 10 0 1 0 10 10h-10Z"/><path d="M12 12 2.93 17.66"/><path d="M12 2v10h10"/>' },
  { label: '菜单数量', value: '--', bg: 'linear-gradient(135deg, #1c1917, #292524)', accent: '#d97706', iconPath: '<path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/>' },
  { label: '角色数量', value: '--', bg: 'linear-gradient(135deg, #0f172a, #1e293b)', accent: '#059669', iconPath: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' }
]

const quickActions = [
  { key: 'user', label: '用户管理', bg: '#0c1832', iconPath: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { key: 'role', label: '角色管理', bg: '#d97706', iconPath: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
  { key: 'menu', label: '菜单管理', bg: '#0ea5e9', iconPath: '<path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M14 14h7v7h-7z"/><path d="M3 14h7v7H3z"/>' },
  { key: 'department', label: '部门管理', bg: '#059669', iconPath: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
  { key: 'staff', label: '员工管理', bg: '#7c3aed', iconPath: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { key: 'dict', label: '字典管理', bg: '#0891b2', iconPath: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' }
]

function goSystem(page) {
  message.info(`请通过左侧菜单访问 ${page} 管理`)
}
</script>

<style scoped>
.dashboard {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Welcome Banner */
.welcome-banner {
  background: linear-gradient(135deg, #0c1832 0%, #1a2d4a 50%, #2d1b00 100%);
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 22px;
  position: relative;
  overflow: hidden;
}
.banner-bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image: radial-gradient(circle at 25% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 75% 50%, #d97706 0%, transparent 50%);
}
.banner-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.banner-greeting {
  font-size: 13px;
  font-weight: 500;
  color: rgba(217,119,6,0.8);
  margin-bottom: 4px;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.banner-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px;
}
.banner-desc {
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  margin: 0;
}
.banner-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}
.mini-stat {
  text-align: center;
}
.mini-stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}
.mini-stat-label {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.mini-stat-divider {
  width: 1px;
  height: 36px;
  background: rgba(255,255,255,0.1);
}

/* Stat Grid */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 22px;
}
.stat-card {
  border-radius: 14px;
  padding: 20px 22px;
  background: var(--card-bg);
  transition: all 0.3s;
  cursor: default;
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--card-accent);
  opacity: 0.5;
}
.stat-card:hover {
  transform: translateY(-3px);
}
.stat-card:hover::before {
  opacity: 1;
}
.stat-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.stat-card-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.6);
}
.stat-card-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  color: rgba(255,255,255,0.4);
}
.stat-card-value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

/* Bottom */
.bottom-section {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  min-height: 0;
  align-items: start;
}
.section-card {
  background: #fff;
  border-radius: 14px;
  padding: 22px 24px;
  box-shadow: 0 1px 3px rgba(12,24,50,0.04);
  transition: box-shadow 0.25s;
}
.section-card:hover {
  box-shadow: 0 4px 16px rgba(12,24,50,0.06);
}
.section-header {
  margin-bottom: 18px;
}
.section-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
  border: 1px solid #f0f2f6;
}
.quick-item:hover {
  border-color: rgba(217,119,6,0.2);
  background: rgba(217,119,6,0.02);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(12,24,50,0.05);
}
.quick-item-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.quick-item-label {
  font-size: 12px;
  font-weight: 500;
  color: #475569;
}

/* Info */
.info-list {
  display: flex;
  flex-direction: column;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f2f6;
  font-size: 13px;
}
.info-row:last-child { border: none; }
.info-label { color: #94a3b8; }
.info-value {
  color: #0f172a;
  font-weight: 500;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 2px;
}

@media (max-width: 768px) {
  .welcome-banner {
    padding: 20px 18px;
    margin-bottom: 14px;
    border-radius: 12px;
  }
  .banner-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
  .banner-title {
    font-size: 20px;
  }
  .banner-stats {
    gap: 14px;
  }
  .mini-stat-value {
    font-size: 16px;
  }
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 14px;
  }
  .stat-card {
    padding: 14px 16px;
    border-radius: 10px;
  }
  .stat-card-value {
    font-size: 22px;
  }
  .bottom-section {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .section-card {
    padding: 16px;
  }
  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .quick-item {
    padding: 14px 8px;
  }
}
@media (max-width: 480px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
