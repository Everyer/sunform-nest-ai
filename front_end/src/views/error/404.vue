<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <p class="error-title">页面不存在</p>
      <p class="error-desc">您访问的页面可能已被删除或地址不正确</p>
      <n-button type="primary" @click="$router.push('/dashboard')">返回首页</n-button>
    </div>
  </div>
</template>

<script setup>
import { NButton } from 'naive-ui'
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
.error-content {
  text-align: center;
}
.error-code {
  font-size: 120px;
  font-weight: 900;
  color: #e8eaed;
  margin: 0;
  line-height: 1;
  letter-spacing: -4px;
}
.error-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 12px 0 8px;
}
.error-desc {
  color: #999;
  margin-bottom: 24px;
  font-size: 14px;
}
</style>
