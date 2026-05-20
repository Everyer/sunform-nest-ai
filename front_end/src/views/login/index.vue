<template>
  <div class="login-page">
    <!-- Dark ambient background -->
    <div class="bg-layer">
      <div class="bg-glow glow-1" />
      <div class="bg-glow glow-2" />
      <div class="bg-glow glow-3" />
      <div class="bg-grid" />
      <div class="bg-noise" />
    </div>

    <div class="login-container">
      <!-- Brand side -->
      <div class="brand-side">
        <div class="brand-content">
          <div class="brand-logo">
            <div class="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span class="brand-name">ADMIN</span>
          </div>

          <div class="brand-tagline">
            <h2 class="tagline-main">企业级后台<br/>管理系统</h2>
            <p class="tagline-sub">高效 · 安全 · 智能</p>
          </div>

          <div class="brand-features">
            <div class="feature-line">
              <span class="feature-dot" />
              <span>数据驾驶舱</span>
            </div>
            <div class="feature-line">
              <span class="feature-dot" />
              <span>精细化权限控制</span>
            </div>
            <div class="feature-line">
              <span class="feature-dot" />
              <span>全链路审计日志</span>
            </div>
          </div>
        </div>

        <div class="brand-footer">
          <span>© 2026 Enterprise Platform</span>
        </div>
      </div>

      <!-- Login side -->
      <div class="login-side">
        <div class="login-panel">
          <div class="panel-header">
            <h3 class="panel-title">欢迎登录</h3>
            <p class="panel-desc">请使用账号密码登录系统</p>
          </div>

          <n-form ref="formRef" :model="formValue" :rules="rules" size="large">
            <div class="field-group">
              <label class="field-label">账号</label>
              <n-input
                v-model:value="formValue.username"
                placeholder="请输入账号"
                class="login-input"
              >
                <template #prefix>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </template>
              </n-input>
            </div>

            <div class="field-group">
              <label class="field-label">密码</label>
              <n-input
                v-model:value="formValue.password"
                type="password"
                show-password-on="click"
                placeholder="请输入密码"
                class="login-input"
                @keydown.enter="handleLogin"
              >
                <template #prefix>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </template>
              </n-input>
            </div>

            <n-button type="primary" block :loading="loading" class="login-btn" @click="handleLogin">
              {{ loading ? '登录中...' : '登 录' }}
            </n-button>
          </n-form>

          <div class="panel-footer">
            <span class="version-tag">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NForm, NInput, NButton, useMessage } from 'naive-ui'
import md5 from 'js-md5'
import { useUserStore } from '@/store/useUserStore'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const userStore = useUserStore()

const formRef = ref(null)
const formValue = ref({ username: '', password: '' })
const loading = ref(false)

const rules = {
  username: { required: true, message: '请输入用户名', trigger: 'blur' },
  password: { required: true, message: '请输入密码', trigger: 'blur' }
}

async function handleLogin() {
  const errors = await new Promise(resolve => formRef.value?.validate(resolve))
  if (errors) return
  loading.value = true
  try {
    await userStore.loginAction({
      username: formValue.value.username,
      password: md5(formValue.value.password)
    })
    message.success('登录成功')
    router.push('/')
  } catch (e) {
    message.error(e.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
  background: #080f1a;
}

/* === Background === */
.bg-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #080f1a 0%, #0c1832 40%, #0f1d3a 60%, #1a0f08 100%);
  z-index: 0;
}
.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}
.glow-1 {
  width: 600px; height: 600px;
  top: -20%; right: -10%;
  background: radial-gradient(circle, rgba(217,119,6,0.08), transparent 70%);
}
.glow-2 {
  width: 400px; height: 400px;
  bottom: -15%; left: 5%;
  background: radial-gradient(circle, rgba(15,69,157,0.1), transparent 70%);
}
.glow-3 {
  width: 300px; height: 300px;
  top: 40%; left: 40%;
  background: radial-gradient(circle, rgba(217,119,6,0.05), transparent 70%);
}
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 48px 48px;
}
.bg-noise {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
}

/* === Container === */
.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  width: 880px;
  max-width: 94vw;
  min-height: 540px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
}

/* === Brand Side === */
.brand-side {
  flex: 1;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 44px 40px;
  position: relative;
  overflow: hidden;
}
.brand-side::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(217,119,6,0.04), transparent 70%);
  pointer-events: none;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(217,119,6,0.1);
  border: 1px solid rgba(217,119,6,0.15);
  border-radius: 10px;
}
.brand-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 4px;
}

.brand-tagline {
  margin: 40px 0;
}
.tagline-main {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  line-height: 1.25;
  margin: 0 0 12px;
}
.tagline-sub {
  font-size: 14px;
  color: rgba(255,255,255,0.35);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin: 0;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.feature-line {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: rgba(255,255,255,0.5);
}
.feature-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d97706;
  flex-shrink: 0;
}

.brand-footer {
  font-size: 11px;
  color: rgba(255,255,255,0.15);
}

/* === Login Side === */
.login-side {
  width: 400px;
  background: rgba(15,23,42,0.85);
  backdrop-filter: blur(30px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px;
}
.login-panel {
  width: 100%;
}
.panel-header {
  margin-bottom: 32px;
}
.panel-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}
.panel-desc {
  margin: 6px 0 0;
  font-size: 14px;
  color: rgba(255,255,255,0.3);
}

/* Fields */
.field-group {
  margin-bottom: 22px;
}
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8px;
}

.login-input :deep(.n-input__wrapper) {
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 10px !important;
  height: 48px !important;
  box-shadow: none !important;
  transition: all 0.25s !important;
  padding-left: 14px !important;
}
.login-input :deep(.n-input__wrapper:hover) {
  border-color: rgba(217,119,6,0.25) !important;
}
.login-input :deep(.n-input__wrapper.n-input__wrapper--focus) {
  border-color: #d97706 !important;
  box-shadow: 0 0 0 3px rgba(217,119,6,0.08) !important;
  background: rgba(255,255,255,0.06) !important;
}
.login-input :deep(.n-input__input-el) {
  color: #f1f5f9 !important;
  font-size: 15px !important;
}
.login-input :deep(.n-input__input-el::placeholder) {
  color: rgba(255,255,255,0.2) !important;
}
.login-input :deep(.n-input__prefix) {
  color: rgba(255,255,255,0.2) !important;
  margin-right: 8px;
}

/* Button */
.login-btn {
  height: 50px !important;
  border-radius: 12px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  margin-top: 8px;
  background: linear-gradient(135deg, #d97706, #f59e0b) !important;
  border: none !important;
  color: #fff !important;
  box-shadow: 0 6px 24px rgba(217,119,6,0.25) !important;
  transition: all 0.3s !important;
  letter-spacing: 2px;
}
.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(217,119,6,0.35) !important;
}
.login-btn:active {
  transform: translateY(0);
}

.panel-footer {
  text-align: center;
  margin-top: 28px;
}
.version-tag {
  font-size: 11px;
  color: rgba(255,255,255,0.12);
  letter-spacing: 1px;
}

@media (max-width: 800px) {
  .brand-side { display: none; }
  .login-side { width: 100%; }
  .login-container { max-width: 400px; }
}
</style>
