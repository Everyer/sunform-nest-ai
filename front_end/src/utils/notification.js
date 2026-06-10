/**
 * 浏览器桌面通知 (Web Notifications API) 封装
 * - 必须 HTTPS / localhost 才有效
 * - 必须在用户手势下 requestPermission
 */

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.permission // 'default' | 'granted' | 'denied'
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch (e) {
    console.warn('[notification] requestPermission failed', e)
    return 'denied'
  }
}

/**
 * 显示一条桌面通知。无权限 / 不支持时静默返回 null。
 * @param {string} title
 * @param {object} [opts]
 * @param {string} [opts.body]        副标题/预览
 * @param {string} [opts.icon]        图标 URL
 * @param {string} [opts.tag]         同 tag 会替换上一条(常用于合并)
 * @param {function} [opts.onclick]   点击回调
 * @param {boolean} [opts.silent]     是否静音
 */
export function showNotification(title, opts = {}) {
  if (!isNotificationSupported()) return null
  if (Notification.permission !== 'granted') return null
  try {
    const iconUrl = opts.icon || (opts.avatar ? (opts.avatar.startsWith('http') || opts.avatar.startsWith('/') ? opts.avatar : '/' + opts.avatar) : '/favicon.svg')
    const n = new Notification(title, {
      body: opts.body || '',
      icon: iconUrl,
      tag: opts.tag,
      silent: true, // 开启 silent 防止系统自带默认提示音，由我们自己播放提示音更和谐
    })
    if (opts.onclick) {
      n.onclick = () => {
        try { opts.onclick() } catch (e) { console.warn(e) }
        try { n.close() } catch (e) {}
      }
    }
    // 8 秒后自动关闭,避免堆积
    setTimeout(() => {
      try { n.close() } catch (e) {}
    }, 8000)
    return n
  } catch (e) {
    console.warn('[notification] show failed', e)
    return null
  }
}

/**
 * 播放清脆的消息提示音（Web Audio API 音频合成）
 * 不依赖任何外部 .mp3 静态资源文件，杜绝 404
 */
export function playNotificationSound() {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    
    // 创建一个振荡器和一个增益节点
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    // 使用正弦波，柔和舒适
    osc.type = 'sine'
    
    // 双音符高科技电子提示音设计：
    // 第一个音符：D5 (587.33 Hz) 持续 0.08 秒，随后平滑过渡到 A5 (880.00 Hz)
    const now = ctx.currentTime
    osc.frequency.setValueAtTime(587.33, now)
    osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.08)
    
    // 音量淡入淡出（防止咔嗒声爆音，且更圆润）
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04) // 最大音量 0.18
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28) // 0.28秒内淡出到无声
    
    osc.start(now)
    osc.stop(now + 0.3)
  } catch (e) {
    // 浏览器可能会因为用户没有跟页面交互而阻止音频播放，静默即可
    console.warn('[notification] playNotificationSound blocked or failed', e)
  }
}

