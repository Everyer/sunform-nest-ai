<template>
  <div ref="containerRef" class="monaco-editor-container" />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'html' },
})
const emit = defineEmits(['update:modelValue'])

const containerRef = ref(null)
let editor = null

onMounted(() => {
  if (typeof window.monaco !== 'undefined') {
    initEditor()
    return
  }
  if (typeof window.require === 'undefined' || !window.__MONACO_CONFIGURED__) {
    window.__MONACO_CONFIGURED__ = true
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs/loader.js'
    script.onload = () => {
      require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' } })
      require(['vs/editor/editor.main'], () => initEditor())
    }
    document.head.appendChild(script)
  } else {
    require(['vs/editor/editor.main'], () => initEditor())
  }
})

onBeforeUnmount(() => {
  editor?.dispose()
})

function initEditor() {
  if (!containerRef.value) return
  editor = monaco.editor.create(containerRef.value, {
    value: props.modelValue || '',
    language: props.language,
      theme: 'vs-dark',
    fontSize: 13,
    minimap: { enabled: false },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
  })
  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor.getValue())
  })
}

watch(() => props.modelValue, (val) => {
  if (editor && val !== undefined && val !== editor.getValue()) {
    editor.setValue(val)
  }
})
</script>

<style>
.monaco-editor-container { width: 100%; height: 100%; min-height: 300px; background: #1e1e1e; }
</style>
