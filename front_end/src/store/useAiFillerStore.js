import { defineStore } from 'pinia'
import { ref, watch, nextTick } from 'vue'

export const useAiFillerStore = defineStore('aiFiller', () => {
  // ========== 表单状态 ==========
  const activeSchema = ref(null)
  const activeCallback = ref(null)

  // 当前页面通过 v-ai 注册的可被 AI 触发的动作列表
  const availableActions = ref({})

  // ========== 事件总线（核心改进） ==========
  // 用一个简单的 Promise 机制来实现「等待表单就绪再填入」
  let _schemaReadyResolvers = []

  // 注册当前活动表单
  const registerForm = (schema, callback) => {
    activeSchema.value = schema
    activeCallback.value = callback

    // 关键：当表单注册成功时，解决所有等待中的 Promise
    nextTick(() => {
      const resolvers = _schemaReadyResolvers.splice(0)
      for (const resolve of resolvers) {
        resolve({ schema, callback })
      }
    })
  }

  // 注销当前表单
  const unregisterForm = () => {
    activeSchema.value = null
    activeCallback.value = null
  }

  /**
   * 核心新增：等待表单就绪
   * 如果当前已有 activeSchema，立即返回
   * 否则返回一个 Promise，等到 registerForm 被调用时 resolve
   * 超时保护：最多等 5 秒
   */
  const waitForFormReady = (timeoutMs = 5000) => {
    // 如果已经有活跃的表单，直接返回
    if (activeSchema.value && activeCallback.value) {
      return Promise.resolve({ schema: activeSchema.value, callback: activeCallback.value })
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        // 超时时从队列中移除自己
        const idx = _schemaReadyResolvers.indexOf(resolve)
        if (idx !== -1) _schemaReadyResolvers.splice(idx, 1)
        reject(new Error('等待表单就绪超时（5秒）'))
      }, timeoutMs)

      // 包装 resolve 以便清除超时
      const wrappedResolve = (result) => {
        clearTimeout(timer)
        resolve(result)
      }

      _schemaReadyResolvers.push(wrappedResolve)
    })
  }

  /**
   * 核心新增：直接填入数据并可选提交
   * 这是一个高层封装，整合了「等待表单 → 填入数据 → 可选点击提交」的完整流程
   */
  const fillFormData = async (data, shouldSubmit = false) => {
    // 1. 如果当前没有表单，等待表单就绪
    let cb = activeCallback.value
    if (!cb) {
      try {
        const ready = await waitForFormReady()
        cb = ready.callback
      } catch (e) {
        console.error('[AI Filler] 填入失败：', e.message)
        return false
      }
    }

    // 2. 填入数据
    if (cb && data) {
      try {
        cb(data)
        console.log('[AI Filler] 数据已填入:', data)
      } catch (e) {
        console.error('[AI Filler] 填入回调执行失败:', e)
        return false
      }
    }

    // 3. 如果需要提交，等一帧确保 Vue 更新完毕再点击
    if (shouldSubmit) {
      await nextTick()
      await new Promise(r => setTimeout(r, 500)) // 给 UI 一点时间
      executeAction('确定') || executeAction('提交') || executeAction('保存')
    }

    return true
  }

  // 注册通用动作
  const registerAction = (name, callback) => {
    availableActions.value[name] = callback
  }

  // 注销通用动作
  const unregisterAction = (name) => {
    delete availableActions.value[name]
  }

  // 执行动作 (支持模糊/同义词匹配)
  const executeAction = (name) => {
    // 1. 精确匹配
    let callback = availableActions.value[name]
    if (callback) {
      try { callback(); return true } catch (e) {
        console.error(`[AI Action] 触发动作 ${name} 失败:`, e)
      }
    }

    // 2. 模糊/同义词映射
    const cleanName = name.trim()
    const keys = Object.keys(availableActions.value)
    
    // 定义同义词组
    const synonymGroups = [
      ['新增', '新建', '添加', '创建', 'create', 'add', 'new'],
      ['修改', '编辑', '更新', 'edit', 'update'],
      ['删除', '清除', '移除', 'delete', 'remove'],
      ['查询', '搜索', '检索', 'search', 'query'],
      ['导出', '下载', 'export', 'download', '导出excel'],
      ['导入', '上传', 'import', 'upload'],
      ['查看', '详情', '查看详情', 'view', 'detail'],
      ['确定', '提交', '保存', '确认', 'submit', 'confirm', 'ok', 'save']
    ]

    // 找到包含 cleanName 的同义词组
    const matchedGroup = synonymGroups.find(group => 
      group.some(word => cleanName.toLowerCase().includes(word.toLowerCase()) || word.toLowerCase().includes(cleanName.toLowerCase()))
    )

    if (matchedGroup) {
      for (const actionKey of keys) {
        if (matchedGroup.some(word => actionKey.toLowerCase().includes(word.toLowerCase()) || word.toLowerCase().includes(actionKey.toLowerCase()))) {
          console.log(`[AI Action] 同义词匹配成功: 「${name}」->「${actionKey}」`)
          callback = availableActions.value[actionKey]
          if (callback) {
            try { callback(); return true } catch (e) {
              console.error(`[AI Action] 触发动作 ${actionKey} 失败:`, e)
            }
          }
        }
      }
    }

    // 3. 子串匹配
    for (const actionKey of keys) {
      if (cleanName.includes(actionKey) || actionKey.includes(cleanName)) {
        console.log(`[AI Action] 子串模糊匹配成功: 「${name}」->「${actionKey}」`)
        callback = availableActions.value[actionKey]
        if (callback) {
          try { callback(); return true } catch (e) {
            console.error(`[AI Action] 触发动作 ${actionKey} 失败:`, e)
          }
        }
      }
    }

    console.warn(`[AI Action] 未找到可执行的动作: ${name}. 当前可用动作:`, keys)
    return false
  }

  // 清除所有的通用动作（切路由时使用）
  const clearAllActions = () => {
    availableActions.value = {}
  }

  return {
    activeSchema,
    activeCallback,
    availableActions,
    registerForm,
    unregisterForm,
    registerAction,
    unregisterAction,
    executeAction,
    clearAllActions,
    // 新增 API
    waitForFormReady,
    fillFormData
  }
})
