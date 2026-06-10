import { io } from 'socket.io-client'

/**
 * IM Socket.IO 客户端单例
 * - connect(token) : 登录后调用,开始连接
 * - disconnect()   : 注销/登出时调用
 * - on(event, cb) / off(event, cb)
 * - emit(event, payload, ack?)
 */
class ImSocket {
  constructor() {
    this.socket = null
    this.handlers = new Map() // event -> Set<callback>
    this.currentToken = null
  }

  connect(token) {
    if (!token) return
    if (this.socket && this.currentToken === token && this.socket.connected) return
    if (this.socket) {
      try { this.socket.disconnect() } catch (e) {}
      this.socket = null
    }
    this.currentToken = token

    const url = window.location.origin
    this.socket = io(url + '/im', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    })

    this.socket.on('connect', () => {
      console.log('[imSocket] connected', this.socket.id)
    })
    this.socket.on('disconnect', (reason) => {
      console.log('[imSocket] disconnected', reason)
    })
    this.socket.on('connect_error', (err) => {
      console.warn('[imSocket] connect_error', err.message)
    })

    // 重新绑定业务事件(避免重连后丢失)
    for (const [event, cbs] of this.handlers.entries()) {
      this.socket.on(event, (payload) => {
        for (const cb of cbs) {
          try { cb(payload) } catch (e) { console.error(e) }
        }
      })
    }
  }

  disconnect() {
    if (this.socket) {
      try { this.socket.disconnect() } catch (e) {}
      this.socket = null
    }
    this.currentToken = null
  }

  on(event, callback) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event).add(callback)
    if (this.socket) {
      this.socket.on(event, (payload) => {
        try { callback(payload) } catch (e) { console.error(e) }
      })
    }
  }

  off(event, callback) {
    if (this.handlers.has(event)) {
      this.handlers.get(event).delete(callback)
    }
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  emit(event, payload, ack) {
    if (!this.socket) return
    if (ack) {
      this.socket.emit(event, payload, ack)
    } else {
      this.socket.emit(event, payload)
    }
  }

  isConnected() {
    return this.socket && this.socket.connected
  }
}

export const imSocket = new ImSocket()
