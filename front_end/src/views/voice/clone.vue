<template>
  <div class="voice-clone-page">
    <n-card title="语音克隆" size="large">
      <n-steps :current="currentStep" :status="stepStatus" vertical>
        <!-- 步骤1：上传音频 -->
        <n-step title="上传待克隆音频" description="上传一段您的语音文件（mp3/m4a/wav，10秒-5分钟）">
          <div class="step-content">
            <n-upload
              v-model:file-list="cloneFileList"
              :max="1"
              accept=".mp3,.m4a,.wav"
              :custom-request="handleCloneUpload"
              :on-remove="handleCloneFileRemove"
            >
              <n-button type="primary" :loading="uploadingClone">
                <template #icon>
                  <n-icon><cloud-upload-outline /></n-icon>
                </template>
                选择音频文件
              </n-button>
            </n-upload>
            <n-text depth="3" class="upload-tip">
              支持 mp3、m4a、wav 格式，文件大小不超过 20MB，时长 10秒-5分钟
            </n-text>
            <div v-if="cloneFileId" class="file-success">
              <n-icon color="#18a058"><checkmark-circle-outline /></n-icon>
              <span>上传成功：{{ cloneFileList[0]?.name }}</span>
            </div>
          </div>
        </n-step>

        <!-- 步骤2：上传示例音频（可选） -->
        <n-step title="上传示例音频（可选）" description="提供一段标准发音的示例音频，可增强克隆效果">
          <div class="step-content">
            <n-upload
              v-model:file-list="promptFileList"
              :max="1"
              accept=".mp3,.m4a,.wav"
              :custom-request="handlePromptUpload"
              :on-remove="handlePromptFileRemove"
            >
              <n-button :loading="uploadingPrompt">
                <template #icon>
                  <n-icon><cloud-upload-outline /></n-icon>
                </template>
                选择示例音频（可选）
              </n-button>
            </n-upload>
            <n-input
              v-model:value="promptText"
              type="textarea"
              placeholder="请输入示例音频对应的文本内容（建议 10-50 字）"
              :rows="3"
              class="prompt-text-input"
            />
            <div v-if="promptFileId" class="file-success">
              <n-icon color="#18a058"><checkmark-circle-outline /></n-icon>
              <span>上传成功：{{ promptFileList[0]?.name }}</span>
            </div>
          </div>
        </n-step>

        <!-- 步骤3：配置并克隆 -->
        <n-step title="配置音色并克隆" description="设置音色 ID 和试听文本，开始克隆">
          <div class="step-content">
            <n-form label-placement="left" label-width="120">
              <n-form-item label="自定义音色 ID">
                <n-input v-model:value="voiceId" placeholder="例如：my_voice_2024" :minlength="8" :maxlength="20" />
                <n-text depth="3" class="form-tip">
                  8-20 个字符，仅支持字母、数字和下划线
                </n-text>
              </n-form-item>
              <n-form-item label="试听文本">
                <n-input
                  v-model:value="cloneText"
                  type="textarea"
                  placeholder="请输入用于试听克隆效果的文本"
                  :rows="3"
                />
              </n-form-item>
              <n-form-item label="语音模型">
                <n-select v-model:value="selectedModel" :options="modelOptions" />
              </n-form-item>
            </n-form>
            <n-button
              type="primary"
              :loading="cloning"
              :disabled="!canClone"
              @click="handleClone"
            >
              <template #icon>
                <n-icon><mic-outline /></n-icon>
              </template>
              开始克隆
            </n-button>
          </div>
        </n-step>
      </n-steps>

      <!-- 克隆结果 -->
      <n-divider v-if="cloneResult" />
      <div v-if="cloneResult" class="clone-result">
        <n-alert type="success" title="克隆成功">
          <p>音色 ID：<strong>{{ cloneResult.voiceId }}</strong></p>
          <p>请保存此 ID，后续调用语音合成时使用</p>
        </n-alert>
        <div class="audio-player">
          <n-button type="primary" @click="playCloneAudio">
            <template #icon>
              <n-icon><play-outline /></n-icon>
            </template>
            播放试听
          </n-button>
          <audio ref="cloneAudioRef" :src="cloneResult.audioUrl" />
        </div>
      </div>
    </n-card>

    <!-- 文字转语音 -->
    <n-card title="文字转语音" size="large" class="tts-card">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="音色 ID">
          <n-input v-model:value="ttsVoiceId" placeholder="输入音色 ID（系统预设或克隆的音色）" />
        </n-form-item>
        <n-form-item label="合成文本">
          <n-input
            v-model:value="ttsText"
            type="textarea"
            placeholder="请输入要合成语音的文本"
            :rows="5"
          />
        </n-form-item>
        <n-form-item label="语音模型">
          <n-select v-model:value="ttsModel" :options="modelOptions" />
        </n-form-item>
        <n-form-item label="语速">
          <n-slider v-model:value="ttsSpeed" :min="0.5" :max="2" :step="0.1" :marks="{ 1: '正常' }" />
        </n-form-item>
        <n-form-item label="音量">
          <n-slider v-model:value="ttsVolume" :min="0.5" :max="2" :step="0.1" :marks="{ 1: '正常' }" />
        </n-form-item>
      </n-form>
      <n-button
        type="primary"
        :loading="synthesizing"
        :disabled="!canSynthesize"
        @click="handleSynthesize"
      >
        <template #icon>
          <n-icon><volume-high-outline /></n-icon>
        </template>
        生成语音
      </n-button>

      <!-- 合成结果 -->
      <div v-if="ttsResult" class="tts-result">
        <n-divider />
        <div class="audio-player">
          <n-button type="primary" @click="playTtsAudio">
            <template #icon>
              <n-icon><play-outline /></n-icon>
            </template>
            播放语音
          </n-button>
          <n-button type="info" secondary @click="downloadTtsAudio">
            <template #icon>
              <n-icon><download-outline /></n-icon>
            </template>
            下载音频
          </n-button>
          <audio ref="ttsAudioRef" :src="ttsResult.audioUrl" />
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'
import {
  NCard, NSteps, NStep, NUpload, NButton, NIcon, NInput, NForm,
  NFormItem, NSelect, NSlider, NDivider, NAlert, NText
} from 'naive-ui'
import {
  CloudUploadOutline, CheckmarkCircleOutline, MicOutline,
  PlayOutline, VolumeHighOutline, DownloadOutline
} from '@vicons/ionicons5'
import { uploadAudioFile, cloneVoice, textToSpeech } from '@/api/voice'

const message = useMessage()

// 步骤状态
const currentStep = ref(1)
const stepStatus = computed(() => {
  if (cloning.value || uploadingClone.value) return 'process'
  if (cloneResult.value) return 'finish'
  return 'process'
})

// 音频文件
const cloneFileList = ref([])
const cloneFileId = ref('')
const uploadingClone = ref(false)

const promptFileList = ref([])
const promptFileId = ref('')
const promptText = ref('')
const uploadingPrompt = ref(false)

// 克隆配置
const voiceId = ref('')
const cloneText = ref('你好，这是一段测试语音，用于验证克隆效果。')
const selectedModel = ref('speech-2.8-hd')
const cloning = ref(false)
const cloneResult = ref(null)
const cloneAudioRef = ref(null)

// 模型选项
const modelOptions = [
  { label: 'speech-2.8-hd（最新超清）', value: 'speech-2.8-hd' },
  { label: 'speech-2.6-hd（高清语音）', value: 'speech-2.6-hd' },
  { label: 'speech-02-hd（高清语音）', value: 'speech-02-hd' }
]

// TTS 配置
const ttsVoiceId = ref('')
const ttsText = ref('')
const ttsModel = ref('speech-2.8-hd')
const ttsSpeed = ref(1)
const ttsVolume = ref(1)
const synthesizing = ref(false)
const ttsResult = ref(null)
const ttsAudioRef = ref(null)

// 计算属性
const canClone = computed(() => {
  return cloneFileId.value && voiceId.value && voiceId.value.length >= 8 && cloneText.value && !cloning.value
})

const canSynthesize = computed(() => {
  return ttsVoiceId.value && ttsText.value && !synthesizing.value
})

// 上传待克隆音频
async function handleCloneUpload({ file }) {
  uploadingClone.value = true
  try {
    const result = await uploadAudioFile(file.file, 'voice_clone')
    cloneFileId.value = result.fileId
    message.success('音频上传成功')
    if (currentStep.value < 2) currentStep.value = 2
  } catch (error) {
    message.error('上传失败：' + error.message)
    throw error
  } finally {
    uploadingClone.value = false
  }
}

function handleCloneFileRemove() {
  cloneFileId.value = ''
  return true
}

// 上传示例音频
async function handlePromptUpload({ file }) {
  uploadingPrompt.value = true
  try {
    const result = await uploadAudioFile(file.file, 'prompt_audio')
    promptFileId.value = result.fileId
    message.success('示例音频上传成功')
  } catch (error) {
    message.error('上传失败：' + error.message)
    throw error
  } finally {
    uploadingPrompt.value = false
  }
}

function handlePromptFileRemove() {
  promptFileId.value = ''
  return true
}

// 开始克隆
async function handleClone() {
  if (!canClone.value) return

  cloning.value = true
  try {
    const params = {
      fileId: cloneFileId.value,
      voiceId: voiceId.value,
      text: cloneText.value,
      model: selectedModel.value
    }

    // 如果有示例音频，添加到参数中
    if (promptFileId.value && promptText.value) {
      params.promptFileId = promptFileId.value
      params.promptText = promptText.value
    }

    const result = await cloneVoice(params)
    cloneResult.value = result
    message.success('音色克隆成功！')

    // 自动填充 TTS 的音色 ID
    ttsVoiceId.value = result.voiceId
  } catch (error) {
    message.error('克隆失败：' + error.message)
  } finally {
    cloning.value = false
  }
}

// 播放克隆音频
function playCloneAudio() {
  cloneAudioRef.value?.play()
}

// 文字转语音
async function handleSynthesize() {
  if (!canSynthesize.value) return

  synthesizing.value = true
  try {
    const result = await textToSpeech({
      text: ttsText.value,
      voiceId: ttsVoiceId.value,
      model: ttsModel.value,
      speed: ttsSpeed.value,
      volume: ttsVolume.value
    })
    ttsResult.value = result
    message.success('语音合成成功！')
  } catch (error) {
    message.error('合成失败：' + error.message)
  } finally {
    synthesizing.value = false
  }
}

// 播放 TTS 音频
function playTtsAudio() {
  if (ttsResult.value?.audioBase64) {
    const base64 = ttsResult.value.audioBase64
    console.log('audioBase64 length:', base64.length)
    console.log('audioBase64 first 20 chars:', base64.substring(0, 20))

    // 使用 Blob 方式播放
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'audio/mpeg' })
    const blobUrl = URL.createObjectURL(blob)

    console.log('blob size:', blob.size, 'bytes')

    const audio = new Audio()
    audio.src = blobUrl
    audio.oncanplay = () => {
      console.log('音频已加载，可以播放')
      audio.play()
    }
    audio.onerror = (e) => {
      console.error('音频加载错误:', e)
      // 尝试下载验证
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = 'tts_audio.mp3'
      a.click()
      window.$message?.error('播放失败，已尝试下载文件，请手动打开验证')
    }
  } else {
    ttsAudioRef.value?.play()
  }
}

// 下载 TTS 音频
function downloadTtsAudio() {
  if (!ttsResult.value) return
  
  try {
    let blobUrl = ''
    if (ttsResult.value.audioBase64) {
      const base64 = ttsResult.value.audioBase64
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'audio/mpeg' })
      blobUrl = URL.createObjectURL(blob)
    } else {
      blobUrl = ttsResult.value.audioUrl
    }
    
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `tts_${Date.now()}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    message.success('音频下载成功')
  } catch (error) {
    message.error('下载失败：' + error.message)
  }
}
</script>

<style scoped>
.voice-clone-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.step-content {
  padding: 16px 0;
}

.upload-tip {
  display: block;
  margin-top: 8px;
  font-size: 12px;
}

.file-success {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  color: #18a058;
}

.prompt-text-input {
  margin-top: 12px;
}

.form-tip {
  display: block;
  margin-top: 4px;
  font-size: 12px;
}

.clone-result {
  padding: 16px 0;
}

.audio-player {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tts-card {
  margin-top: 20px;
}

.tts-result {
  padding-top: 16px;
}
</style>
