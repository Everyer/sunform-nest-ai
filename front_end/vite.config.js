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
      },
      '/socket.io': {
        target: 'http://localhost:9528',
        ws: true,
        changeOrigin: true
      },
      // 🌟 关键:本地开发时,/static 也要转发到后端,
      // 否则 IM 附件的 <img src> / <a download> 会直接命中 Vite 自己的 404 HTML,
      // 文件下载下来其实是 404 页面(Excel/图片都打不开)。
      '/static': {
        target: 'http://localhost:9528',
        changeOrigin: true
      }
    }
  }
}))
