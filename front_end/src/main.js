import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import naive from 'naive-ui'
import { aiDirective } from './directives/ai'
import { useAiFillerStore } from './store/useAiFillerStore'
import './style.css'

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(naive)

// 注册全局 v-ai 指令
app.directive('ai', aiDirective)

// 每次路由切换时，自动清空上一页注册的 AI 快捷动作，避免意图冲突
router.afterEach(() => {
  const store = useAiFillerStore()
  store.clearAllActions()
  store.unregisterForm() // 同时注销表单
})

app.mount('#app')

