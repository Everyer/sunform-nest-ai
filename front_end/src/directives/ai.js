import { useAiFillerStore } from '../store/useAiFillerStore'

export const aiDirective = {
  mounted(el, binding) {
    const actionName = binding.value
    if (!actionName) return

    const store = useAiFillerStore()

    // 默认点击行为：安全且唯一地触发一次点击事件（防止触发多次导致重复提交）
    const defaultClickTrigger = () => {
      if (typeof el.click === 'function') {
        try {
          el.click()
        } catch (e) {
          console.error('[AI Action] Native click error:', e)
          dispatchSingleClick(el)
        }
      } else {
        dispatchSingleClick(el)
      }
    }

    const dispatchSingleClick = (target) => {
      try {
        const event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        })
        target.dispatchEvent(event)
      } catch (e) {
        console.error('[AI Action] Dispatch click error:', e)
      }
    }

    // 把 DOM 节点的触发事件绑定到全局 Store
    store.registerAction(actionName, defaultClickTrigger)
  },
  
  unmounted(el, binding) {
    const actionName = binding.value
    if (!actionName) return

    const store = useAiFillerStore()
    store.unregisterAction(actionName)
  }
}
