import axios from 'axios'
import { useUserStore } from '@/store/useUserStore'
import router from '@/router'

// 智能错误翻译器：将数据库、校验及网络等底层报错转换为优雅、保姆级的中文提示
export function translateErrorMessage(msg, defaultMsg = '请求失败') {
  if (!msg) return defaultMsg
  
  const cleanMsg = String(msg).trim()

  // 1. 常见数据库/ORM 校验冲突 (最常见：唯一索引冲突)
  if (cleanMsg.includes('Validation error')) {
    // 岗位/部门编码、用户名等唯一索引冲突
    if (
      cleanMsg.toLowerCase().includes('unique') || 
      cleanMsg.toLowerCase().includes('must be unique') || 
      cleanMsg.toLowerCase().includes('duplicate')
    ) {
      // 提取可能的冲突字段名
      const fieldMatch = cleanMsg.match(/unique constraint [\'\"]?([a-zA-Z0-9_\-]+)[\'\"]?/)
      const field = fieldMatch ? fieldMatch[1] : ''
      
      let fieldText = '关键字段'
      const lowerField = field.toLowerCase()
      if (lowerField.includes('code')) fieldText = '编码/唯一标识'
      if (lowerField.includes('name')) fieldText = '名称描述'
      if (lowerField.includes('username')) fieldText = '登录账号/用户名'
      if (lowerField.includes('phone')) fieldText = '手机号码'
      if (lowerField.includes('email')) fieldText = '电子邮箱'

      return `⚠️ **校验失败**：您填写的 ${fieldText} 在数据库中已经存在啦，请换一个不重复的值重新提交。`
    }
    
    // 默认的 Validation error 校验失败
    return '⚠️ **校验失败**：数据验证未通过（很可能是岗位编码「postCode」或岗位名称「postName」已经存在，请检查表单中是否存在重复值或为空的必填项）。'
  }

  // 2. 外键约束 / 关联限制 (常见于删除操作)
  if (
    cleanMsg.includes('ForeignKeyConstraintError') || 
    cleanMsg.includes('foreign key constraint') || 
    cleanMsg.toLowerCase().includes('violates foreign key')
  ) {
    return '⚠️ **关联限制**：此条数据正在被其他业务板块（例如关联的用户、明细子表单等）引用，无法直接修改或删除。请先解除关联关系。'
  }

  // 3. 唯一冲突直接抛出 (如 UniqueConstraintError)
  if (
    cleanMsg.includes('UniqueConstraintError') || 
    cleanMsg.includes('unique constraint') || 
    cleanMsg.toLowerCase().includes('duplicate entry')
  ) {
    return '⚠️ **提交冲突**：您填报的数据已存在（触发数据库唯一键限制），请不要重复提交相同的信息。'
  }

  // 4. 空值校验 / 非空限制
  if (
    cleanMsg.includes('NotNullConstraintError') || 
    cleanMsg.includes('cannot be null') || 
    cleanMsg.toLowerCase().includes('must not be null')
  ) {
    return '⚠️ **必填缺失**：存在未填写的必填项，请检查表单完整性后重新提交。'
  }

  // 5. 数据类型溢出/转换失败
  if (
    cleanMsg.includes('out of range') || 
    cleanMsg.includes('data exception') || 
    cleanMsg.toLowerCase().includes('invalid input syntax')
  ) {
    return '⚠️ **格式不符**：输入的数据类型或数值大小超出了限制，请检查数字格式、备注字段的最大长度等。'
  }

  // 6. 网络连接或超时
  if (cleanMsg.includes('Network Error')) {
    return '🔌 **网络断开**：无法连接到服务器，请检查您的网络连接或后端 API 服务是否正常运行。'
  }
  if (cleanMsg.toLowerCase().includes('timeout')) {
    return '⏳ **请求超时**：服务器响应超时，请稍后重新尝试提交。'
  }

  // 7. 处理后端传来的原始中文，直接展示，其余拼装返回
  return cleanMsg
}

const service = axios.create({
  baseURL: '/adminApi',
  timeout: 30000
})

service.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  error => Promise.reject(error)
)

service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.success !== true) {
      // 关键修复：后端部分接口在 token 失效时返回 200 + { success: false, message: '未登录或 token 已过期' }
      // 这里统一识别业务码中的"未登录/token 失效"信息，触发 logout，避免只在路由守卫里兜底
      const rawMsg = (res.message || '').toString()
      if (/未登录|登录已过期|token.{0,5}(过期|失效|无效)|未授权/i.test(rawMsg)) {
        const userStore = useUserStore()
        userStore.logout()
      }
      // 翻译为精美的中文，并通过 Promise.reject 抛出，由视图层的 try-catch 统一触发单次 Toast 提示，完美避免双重弹窗！
      const friendlyMsg = translateErrorMessage(res.message || '请求失败')
      return Promise.reject(new Error(friendlyMsg))
    }
    return res.data
  },
  error => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
    }
    // 关键修复：对于 500 等非 2xx HTTP 报错，后端返回的 JSON 结构在 error.response.data 中
    // 优先提取后端返回的真正业务报错信息（如 "Validation error"），再进行保姆级中文翻译
    const serverMessage = error.response?.data?.message || error.message || '网络错误'
    const friendlyMsg = translateErrorMessage(serverMessage)
    return Promise.reject(new Error(friendlyMsg))
  }
)

export default service
