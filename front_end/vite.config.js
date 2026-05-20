import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
export default defineConfig({
  plugins: [vue()],
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
})
