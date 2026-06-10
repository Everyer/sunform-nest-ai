<template>
  <div class="office-preview-page">
    <!-- 顶部导航与操作工具栏 -->
    <div class="preview-header">
      <div class="brand">
        <span class="dot" />
        <span>知筑 · 万能文件在线预览</span>
      </div>
      <div v-if="currentFile" class="file-meta">
        <span class="file-name" :title="currentFile.name">{{ currentFile.name }}</span>
        <span class="file-size">({{ formatSize(currentFile.size) }})</span>
      </div>
      <div class="actions">
        <n-space>
          <n-button v-if="currentFile" size="small" secondary type="warning" @click="clearFile">
            ✕ 关闭预览
          </n-button>
          <n-button v-if="currentFile" size="small" type="primary" @click="downloadFile">
            📥 下载原始文件
          </n-button>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button size="small" secondary @click="showAbout = true">ℹ️ 格式说明</n-button>
            </template>
            支持 Word / Excel / PDF / Markdown / 纯文本 / 常见图片与多媒体在线预览
          </n-tooltip>
        </n-space>
      </div>
    </div>

    <!-- 主工作区 -->
    <div class="preview-body">
      <!-- 未上传文件时的拖拽上传区 -->
      <div v-if="!currentFile" class="upload-container">
        <div class="upload-card">
          <n-upload
            directory-dnd
            :max="1"
            :show-file-list="false"
            :custom-request="handleFileSelect"
          >
            <div class="dnd-area">
              <div class="upload-icon">📄</div>
              <div class="upload-title">将常规文件拖拽到此处，或<span>点击上传</span></div>
              <div class="upload-tips">
                支持 Word (.docx) ｜ Excel (.xlsx, .xls) ｜ PDF (.pdf) ｜ Markdown (.md) ｜ 文本 & 图片等
              </div>
            </div>
          </n-upload>
        </div>
      </div>

      <!-- 已加载文件时的预览区 -->
      <div v-else class="viewer-container">
        <n-spin :show="loading" :description="loadingText" class="viewer-spin">
          <div class="viewer-wrapper">
            <!-- 1. PDF 预览器 -->
            <div v-if="fileType === 'pdf'" class="pdf-viewer">
              <iframe :src="fileUrl" class="iframe-render" />
            </div>

            <!-- 2. Word (.docx) 预览器 -->
            <div v-else-if="fileType === 'docx'" class="docx-viewer">
              <div class="a4-page-scroller">
                <div ref="docxRef" class="docx-render-container" />
              </div>
            </div>

            <!-- 3. Excel (.xlsx, .xls) 预览器 -->
            <div v-else-if="fileType === 'excel'" class="excel-viewer">
              <div ref="univerRef" class="univer-container" />
            </div>

            <!-- 4. 文本 & Markdown 预览器 -->
            <div v-else-if="fileType === 'text'" class="text-viewer">
              <div class="text-container">
                <div v-if="isMarkdown" class="markdown-body" v-html="markdownHtml" />
                <pre v-else class="plain-text-code"><code>{{ textContent }}</code></pre>
              </div>
            </div>

            <!-- 5. 图片 预览器 -->
            <div v-else-if="fileType === 'image'" class="image-viewer">
              <div class="img-frame">
                <img :src="fileUrl" alt="Preview" />
              </div>
            </div>

            <!-- 6. 音视频 预览器 -->
            <div v-else-if="fileType === 'media'" class="media-viewer">
              <div class="media-card">
                <video v-if="isAudioVideo === 'video'" :src="fileUrl" controls class="video-element" />
                <audio v-else :src="fileUrl" controls class="audio-element" />
              </div>
            </div>

            <!-- 7. 兜底与不支持格式预览器 -->
            <div v-else class="unsupported-viewer">
              <n-result
                status="info"
                title="该格式不支持在线直接预览"
                description="你可以一键下载并在本地 Office / 软件中打开预览"
              >
                <template #footer>
                  <n-space justify="center" vertical style="align-items: center;">
                    <n-button type="primary" @click="downloadFile">📥 立即下载文件</n-button>
                    <n-alert v-if="isOfficeWordOrPPT" title="友情提示" type="info" style="margin-top: 16px; max-width: 450px; text-align: left;">
                      若此文件已上传至公网服务器，你可使用微软在线 Office 预览：
                      <a :href="'https://view.officeapps.live.com/op/view.aspx?src=' + encodeURIComponent(fileUrl || '')" target="_blank" class="ms-link">
                        👉 尝试在微软 Office 在线预览中打开
                      </a>
                    </n-alert>
                  </n-space>
                </template>
              </n-result>
            </div>
          </div>
        </n-spin>
      </div>
    </div>

    <!-- 格式支持弹窗说明 -->
    <n-modal v-model:show="showAbout" preset="card" title="支持的文件格式与底层预览机制" style="max-width: 600px">
      <div class="about-content">
        <h4>项目已集成以下文件在线高保真预览技术：</h4>
        <ul class="tech-list">
          <li>
            <strong>电子表格 (.xlsx / .xls)：</strong>
            使用高性能在线表格引擎 <code>Univer 0.25</code> 自研渲染，支持公式、样式、行高列宽和合并单元格完整还原，并支持直接编辑。
          </li>
          <li>
            <strong>文字文档 (.docx)：</strong>
            使用 <code>docx-preview</code> 在客户端原生解析编译渲染，以仿 A4 纸页面布局完美呈现 Word 文档样式。
          </li>
          <li>
            <strong>PDF 文档 (.pdf)：</strong>
            直接挂载浏览器内置的高保真 PDF 渲染引擎，速度最快、显示效果最完美。
          </li>
          <li>
            <strong>Markdown (.md)：</strong>
            使用 <code>marked</code> 编译器转译为标准 HTML5 结构并匹配 GitHub 主题渲染。
          </li>
          <li>
            <strong>普通文本 & 源码 (.txt / .js / .json / .css 等)：</strong>
            以高性能文本区域自动排版，保留缩进和代码格式。
          </li>
          <li>
            <strong>多媒体文件：</strong>
            支持常见图片格式 (.png / .jpg / .gif / .svg / .webp)，音视频 (.mp3 / .mp4 / .webm) 在线直播播放。
          </li>
        </ul>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import {
  NAlert, NButton, NModal, NResult, NSpace, NSpin, NTooltip, NUpload, useMessage
} from 'naive-ui'
import { xlsxToUniverWorkbook } from '@/views/excel/adapters/xlsx.js'
import { renderAsync } from 'docx-preview'
import { marked } from 'marked'

// ====== Univer 0.25.0 Presets 语言包 & 组件导入 ======
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import UniverPresetSheetsConditionalFormattingZhCN from '@univerjs/preset-sheets-conditional-formatting/locales/zh-CN'
import UniverPresetSheetsDataValidationZhCN from '@univerjs/preset-sheets-data-validation/locales/zh-CN'
import UniverPresetSheetsFilterZhCN from '@univerjs/preset-sheets-filter/locales/zh-CN'
import UniverPresetSheetsSortZhCN from '@univerjs/preset-sheets-sort/locales/zh-CN'
import UniverPresetSheetsFindReplaceZhCN from '@univerjs/preset-sheets-find-replace/locales/zh-CN'
import UniverPresetSheetsDrawingZhCN from '@univerjs/preset-sheets-drawing/locales/zh-CN'
import UniverPresetSheetsNoteZhCN from '@univerjs/preset-sheets-note/locales/zh-CN'
import UniverPresetSheetsHyperLinkZhCN from '@univerjs/preset-sheets-hyper-link/locales/zh-CN'
import UniverPresetSheetsTableZhCN from '@univerjs/preset-sheets-table/locales/zh-CN'
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting'
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation'
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter'
import { UniverSheetsSortPreset } from '@univerjs/preset-sheets-sort'
import { UniverSheetsFindReplacePreset } from '@univerjs/preset-sheets-find-replace'
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing'
import { UniverSheetsNotePreset } from '@univerjs/preset-sheets-note'
import { UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link'
import { UniverSheetsTablePreset } from '@univerjs/preset-sheets-table'
import UniverSheetsNumfmtUiZhCN from '@univerjs/sheets-numfmt-ui/locale/zh-CN'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-conditional-formatting/lib/index.css'
import '@univerjs/preset-sheets-data-validation/lib/index.css'
import '@univerjs/preset-sheets-filter/lib/index.css'
import '@univerjs/preset-sheets-sort/lib/index.css'
import '@univerjs/find-replace/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs/sheets-note-ui/lib/index.css'
import '@univerjs/sheets-hyper-link-ui/lib/index.css'
import '@univerjs/sheets-table-ui/lib/index.css'

defineOptions({ name: 'OfficePreview' })

const message = useMessage()
const showAbout = ref(false)

// 当前预览的文件状态
const currentFile = ref(null)
const fileUrl = ref('')
const fileType = ref('') // 'pdf' | 'docx' | 'excel' | 'text' | 'image' | 'media' | 'unsupported'
const loading = ref(false)
const loadingText = ref('')

// Word (docx) 与 Excel (Univer) 容器 DOM 引用
const docxRef = ref(null)
const univerRef = ref(null)
let univer = null
let univerAPI = null

// 文本与 Markdown 预览数据
const textContent = ref('')
const markdownHtml = ref('')
const isMarkdown = ref(false)

// 判断是否是音视频
const isAudioVideo = ref('')

// 格式补丁
const NumfmtTooltipPatch = {
  'sheets-ui': {
    info: {
      error: '错误',
      forceStringInfo: '以文本形式存储的数字'
    }
  }
}

// 格式大小转换工具
function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理拖拽或点击文件上传
async function handleFileSelect({ file, onFinish, onError }) {
  const rawFile = file.file || file
  if (!rawFile) return onError()
  
  loading.value = true
  loadingText.value = '正在加载并解析文件...'
  currentFile.value = rawFile
  
  // 清理之前的资源
  cleanupPreviewResources()

  const extension = rawFile.name.split('.').pop().toLowerCase()
  fileUrl.value = URL.createObjectURL(rawFile)

  try {
    if (extension === 'pdf') {
      fileType.value = 'pdf'
      loading.value = false
    } else if (extension === 'docx') {
      fileType.value = 'docx'
      loadingText.value = 'Word 正在客户端高保真编译渲染...'
      const buffer = await rawFile.arrayBuffer()
      await nextTick()
      if (docxRef.value) {
        docxRef.value.innerHTML = ''
        await renderAsync(buffer, docxRef.value, null, {
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false
        })
      }
      loading.value = false
    } else if (extension === 'xlsx' || extension === 'xls') {
      fileType.value = 'excel'
      loadingText.value = '电子表格正在引擎加载渲染中...'
      const buffer = await rawFile.arrayBuffer()
      const workbookData = await xlsxToUniverWorkbook(buffer)
      await nextTick()
      initUniver(workbookData)
      loading.value = false
    } else if (['txt', 'md', 'json', 'js', 'css', 'html', 'sql', 'xml'].includes(extension)) {
      fileType.value = 'text'
      const text = await rawFile.text()
      textContent.value = text
      isMarkdown.value = extension === 'md'
      if (isMarkdown.value) {
        markdownHtml.value = await marked(text)
      }
      loading.value = false
    } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) {
      fileType.value = 'image'
      loading.value = false
    } else if (['mp4', 'webm', 'mp3', 'wav', 'ogg'].includes(extension)) {
      fileType.value = 'media'
      isAudioVideo.value = ['mp4', 'webm'].includes(extension) ? 'video' : 'audio'
      loading.value = false
    } else {
      fileType.value = 'unsupported'
      loading.value = false
    }
    onFinish()
  } catch (err) {
    console.error('文件预览失败：', err)
    message.error(`预览失败: ${err.message || err}`)
    fileType.value = 'unsupported'
    loading.value = false
    onError()
  }
}

// 检查是否是常规 Word 或 PPT（用于微软 Office 预览补丁）
const isOfficeWordOrPPT = computed(() => {
  if (!currentFile.value) return false
  const ext = currentFile.value.name.split('.').pop().toLowerCase()
  return ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)
})

// 清理所有缓存的预览资源
function cleanupPreviewResources() {
  if (fileUrl.value) {
    URL.revokeObjectURL(fileUrl.value)
    fileUrl.value = ''
  }
  if (univer) {
    try {
      univer.dispose()
    } catch (_) {}
    univer = null
    univerAPI = null
  }
  textContent.value = ''
  markdownHtml.value = ''
  isMarkdown.value = false
}

// 关闭预览回到上传面板
function clearFile() {
  cleanupPreviewResources()
  currentFile.value = null
  fileType.value = ''
}

// 下载原文件
function downloadFile() {
  if (!currentFile.value) return
  const a = document.createElement('a')
  a.href = fileUrl.value || URL.createObjectURL(currentFile.value)
  a.download = currentFile.value.name
  a.click()
  message.success('已开始下载原始文件')
}

// 初始化 Univer 表格引擎（高保真还原）
function initUniver(workbookData) {
  if (!univerRef.value) return
  univerRef.value.id = 'univer-preview-app'

  const result = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: (() => {
        const fix = (l) => l?.default || l
        const m = mergeLocales(
          fix(UniverPresetSheetsCoreZhCN),
          fix(UniverPresetSheetsConditionalFormattingZhCN),
          fix(UniverPresetSheetsDataValidationZhCN),
          fix(UniverPresetSheetsFilterZhCN),
          fix(UniverPresetSheetsSortZhCN),
          fix(UniverPresetSheetsFindReplaceZhCN),
          fix(UniverPresetSheetsDrawingZhCN),
          fix(UniverPresetSheetsNoteZhCN),
          fix(UniverPresetSheetsHyperLinkZhCN),
          fix(UniverPresetSheetsTableZhCN),
          fix(UniverSheetsNumfmtUiZhCN)
        )

        // 深度合并自定义补丁，防止被 mergeLocales 浅拷贝覆盖掉 sheets-ui
        const deepMerge = (target, source) => {
          for (const key in source) {
            if (source[key] && typeof source[key] === 'object') {
              if (!target[key]) target[key] = {}
              deepMerge(target[key], source[key])
            } else {
              target[key] = source[key]
            }
          }
          return target
        }
        deepMerge(m, NumfmtTooltipPatch)

        return m
      })()
    },
    presets: [
      UniverSheetsCorePreset({
        container: 'univer-preview-app',
        disableTextFormatAlert: true,
        disableTextFormatMark: true,
        disableForceStringAlert: true,
        disableForceStringMark: true
      }),
      UniverSheetsConditionalFormattingPreset(),
      UniverSheetsDataValidationPreset(),
      UniverSheetsFilterPreset(),
      UniverSheetsSortPreset(),
      UniverSheetsFindReplacePreset(),
      UniverSheetsDrawingPreset(),
      UniverSheetsNotePreset(),
      UniverSheetsHyperLinkPreset(),
      UniverSheetsTablePreset()
    ]
  })

  univer = result.univer
  univerAPI = result.univerAPI

  // 加载解析出的 Workbook 数据结构
  univerAPI.createWorkbook(workbookData, { makeCurrent: true })
}

onBeforeUnmount(() => {
  cleanupPreviewResources()
})
</script>

<style scoped>
.office-preview-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f1f5f9;
}

/* 顶部操作条 */
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.brand .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  margin-right: 8px;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 40%;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: #64748b;
}

.preview-body {
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* 拖拽上传区 */
.upload-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 40px;
}

.upload-card {
  width: 100%;
  max-width: 720px;
  background: #fff;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05);
}

.dnd-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 80px 40px;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.3s ease;
}

.dnd-area:hover {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: bounce 2s infinite;
}

.upload-title {
  font-size: 18px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 8px;
}

.upload-title span {
  color: #3b82f6;
  font-weight: 600;
}

.upload-tips {
  font-size: 13px;
  color: #64748b;
}

/* 预览区容器 */
.viewer-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.viewer-spin {
  width: 100%;
  height: 100%;
}

:deep(.n-spin-container),
:deep(.n-spin-content) {
  width: 100%;
  height: 100%;
}

.viewer-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* PDF 预览 */
.pdf-viewer, .iframe-render {
  width: 100%;
  height: 100%;
  border: none;
}

/* Word (.docx) 仿 A4 效果 */
.docx-viewer {
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  overflow: hidden;
}

.a4-page-scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 30px 10px;
  display: flex;
  justify-content: center;
}

.docx-render-container {
  width: 100%;
  max-width: 820px;
  box-sizing: border-box;
}

/* 仅用于提供更好的中英文字体继承 */
:deep(.docx-render-container) {
  font-family: Calibri, 'Segoe UI', system-ui, -apple-system, sans-serif !important;
  color: #2b2b2b !important;
}

/* Excel 预览 */
.excel-viewer {
  width: 100%;
  height: 100%;
  background: #fff;
}

.univer-container {
  width: 100%;
  height: 100%;
}

/* 纯文本/Markdown 预览 */
.text-viewer {
  width: 100%;
  height: 100%;
  background: #fafafa;
  overflow-y: auto;
  padding: 40px 16px;
  display: flex;
  justify-content: center;
}

.text-container {
  width: 100%;
  max-width: 850px;
  background: #fff;
  padding: 36px 48px;
  border-radius: 8px;
  box-shadow: 0 1px 10px rgba(0,0,0,0.05);
}

.plain-text-code {
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 13.5px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  color: #334155;
  background: #f8fafc;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* Markdown 高保真 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 15px;
  line-height: 1.7;
  word-wrap: break-word;
  color: #24292e;
}

.markdown-body :deep(h1), .markdown-body :deep(h2), .markdown-body :deep(h3) {
  font-weight: 600;
  line-height: 1.25;
  margin-top: 24px;
  margin-bottom: 16px;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-body :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
  font-family: monospace;
}

/* 图片预览 */
.image-viewer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #0f172a;
  padding: 20px;
}

.img-frame {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  background: repeating-conic-gradient(#1e293b 0% 25%, #334155 0% 50%) 50% / 20px 20px;
}

.img-frame img {
  display: block;
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

/* 音视频预览 */
.media-viewer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #0f172a;
}

.media-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-element {
  max-width: 800px;
  max-height: 500px;
  border-radius: 6px;
}

.audio-element {
  width: 320px;
}

/* 兜底 */
.unsupported-viewer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #fff;
  padding: 40px;
}

.ms-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.ms-link:hover {
  text-decoration: underline;
}

/* 关于列表 */
.tech-list {
  padding-left: 20px;
  line-height: 2;
  color: #475569;
}

.tech-list li {
  margin-bottom: 12px;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
</style>
