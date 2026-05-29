import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  // 开发时 base 为 /，生产构建 base 为 /static/admin/（NestJS ServeStatic 挂载路径）
  base: command === 'serve' ? '/' : '/static/admin/',
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js',
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 9526,
    proxy: {
      '/adminApi': {
        target: 'http://localhost:9528',
        changeOrigin: true
      }
    }
  }
}))
