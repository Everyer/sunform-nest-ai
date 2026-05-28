import request from './index'

/**
 * 上传音频文件
 * @param {File} file - 音频文件
 * @param {string} purpose - 用途：voice_clone 或 prompt_audio
 * @returns {Promise<{fileId: string}>}
 */
export function uploadAudioFile(file, purpose = 'voice_clone') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('purpose', purpose)

  return request.post('/ai/voice/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 音色克隆
 * @param {Object} params - 克隆参数
 * @param {string} params.fileId - 复刻音频的 file_id
 * @param {string} params.voiceId - 自定义的音色 ID
 * @param {string} params.text - 试听文本
 * @param {string} params.promptFileId - 示例音频的 file_id（可选）
 * @param {string} params.promptText - 示例音频文本（可选）
 * @param {string} params.model - 语音模型（可选）
 * @returns {Promise<{audioUrl: string, voiceId: string}>}
 */
export function cloneVoice(params) {
  return request.post('/ai/voice/clone', params)
}

/**
 * 文字转语音
 * @param {Object} params - 合成参数
 * @param {string} params.text - 要合成的文本
 * @param {string} params.voiceId - 音色 ID
 * @param {string} params.model - 语音模型（可选）
 * @param {number} params.speed - 语速（可选）
 * @param {number} params.volume - 音量（可选）
 * @returns {Promise<{audioUrl: string}>}
 */
export function textToSpeech(params) {
  return request.post('/ai/voice/tts', params)
}
