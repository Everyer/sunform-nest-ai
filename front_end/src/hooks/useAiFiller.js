import { onUnmounted, watch, isRef } from 'vue'
import { useAiFillerStore } from '../store/useAiFillerStore'

/**
 * 业务表单接入 AI 填表助手的 Composition API Hook
 * @param {Object} schema 表单对应的 JSON Schema 协议，用于引导 AI 提取字段
 * @param {Function} fillCallback AI 提取出 JSON 数据后的填充回调函数 (data) => void
 * @param {Ref<boolean> | Function | boolean} [activeCondition=true] 可选的激活条件（支持 Ref、计算属性或 Getter 函数），控制 AI 填表功能的显示隐藏
 */
export function useAiFiller(schema, fillCallback, activeCondition = true) {
  const store = useAiFillerStore()

  // 统一转换成 watch 可监听的数据源
  const watchSource = typeof activeCondition === 'function' 
    ? activeCondition 
    : (isRef(activeCondition) ? () => activeCondition.value : () => activeCondition)

  watch(
    watchSource,
    (isActive) => {
      if (isActive) {
        store.registerForm(schema, fillCallback)
      } else {
        // 只有当当前活跃的 Schema 确实是当前注册的这个时才注销，防止多个 hook 冲突
        if (store.activeSchema === schema) {
          store.unregisterForm()
        }
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    if (store.activeSchema === schema) {
      store.unregisterForm()
    }
  })
}
