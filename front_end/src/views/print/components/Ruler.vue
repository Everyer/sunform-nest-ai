<template>
  <div class="ruler-container" :style="containerStyle">
    <!-- 左上角交叉空白块 -->
    <div class="ruler-corner"></div>
    
    <!-- 顶部横向刻度尺 -->
    <canvas 
      ref="horizCanvas" 
      class="ruler-horizontal"
      :height="rulerThickness"
      :style="{ left: rulerThickness + 'px' }"
    ></canvas>
    
    <!-- 左侧纵向刻度尺 -->
    <canvas 
      ref="vertCanvas" 
      class="ruler-vertical"
      :width="rulerThickness"
      :style="{ top: rulerThickness + 'px' }"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';

const props = defineProps({
  zoom: {
    type: Number,
    default: 1
  },
  scrollLeft: {
    type: Number,
    default: 0
  },
  scrollTop: {
    type: Number,
    default: 0
  },
  paperWidth: {
    type: Number,
    default: 210 // 毫米 (A4宽)
  },
  paperHeight: {
    type: Number,
    default: 297 // 毫米 (A4高)
  },
  // 鼠标在画布页面（相对纸张左上角）的像素坐标
  mouseX: {
    type: Number,
    default: -1
  },
  mouseY: {
    type: Number,
    default: -1
  },
  // 画布在标尺容器内的左/上外边距 (以保证对齐)
  canvasMarginLeft: {
    type: Number,
    default: 40 // px
  },
  canvasMarginTop: {
    type: Number,
    default: 40 // px
  }
});

const horizCanvas = ref(null);
const vertCanvas = ref(null);

const rulerThickness = 24; // 标尺厚度 (px)
const MM_TO_PX = 3.779527559; // 1mm ≈ 3.78px (96 DPI下)

const containerStyle = computed(() => ({
  height: rulerThickness + 'px',
  width: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 10,
  pointerEvents: 'none'
}));

// 重绘标尺
const drawRulers = () => {
  drawHorizontal();
  drawVertical();
};

// 绘制横向标尺
const drawHorizontal = () => {
  const canvas = horizCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // 处理高清屏模糊问题
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rulerThickness * dpr;
  ctx.scale(dpr, dpr);
  
  // 清画布
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, rect.width, rulerThickness);
  
  // 画底线
  ctx.strokeStyle = '#e8ecf2';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, rulerThickness - 0.5);
  ctx.lineTo(rect.width, rulerThickness - 0.5);
  ctx.stroke();
  
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#94a3b8';
  ctx.font = '9px system-ui';
  ctx.textAlign = 'center';
  
  const scale = props.zoom;
  const mmStep = MM_TO_PX * scale; // 1毫米在当前缩放下的像素宽度
  
  // 画布起始像素位置 = 标尺起始偏移 + 画布的外边距 * 缩放 - 滚动条偏移
  const startX = props.canvasMarginLeft - props.scrollLeft;
  const totalMm = props.paperWidth + 10; // 稍微多画一点点
  
  for (let mm = 0; mm <= totalMm; mm++) {
    const x = startX + mm * mmStep;
    if (x < 0 || x > rect.width) continue;
    
    ctx.beginPath();
    if (mm % 10 === 0) {
      // 10mm 大刻度
      ctx.moveTo(x, rulerThickness - 10);
      ctx.lineTo(x, rulerThickness);
      ctx.stroke();
      if (mm > 0) {
        ctx.fillText(mm.toString(), x, rulerThickness - 12);
      }
    } else if (mm % 5 === 0) {
      // 5mm 中刻度
      ctx.moveTo(x, rulerThickness - 6);
      ctx.lineTo(x, rulerThickness);
      ctx.stroke();
    } else {
      // 1mm 小刻度
      ctx.moveTo(x, rulerThickness - 4);
      ctx.lineTo(x, rulerThickness);
      ctx.stroke();
    }
  }
  
  // 绘制鼠标红色指示线
  if (props.mouseX >= 0 && props.mouseX <= props.paperWidth * MM_TO_PX) {
    const mousePx = startX + props.mouseX * scale;
    if (mousePx >= 0 && mousePx <= rect.width) {
      ctx.strokeStyle = '#ff4d4f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mousePx, 0);
      ctx.lineTo(mousePx, rulerThickness);
      ctx.stroke();
    }
  }
};

// 绘制纵向标尺
const drawVertical = () => {
  const canvas = vertCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // 处理高清屏模糊问题
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rulerThickness * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  
  // 清画布
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, rulerThickness, rect.height);
  
  // 画右侧底线
  ctx.strokeStyle = '#e8ecf2';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rulerThickness - 0.5, 0);
  ctx.lineTo(rulerThickness - 0.5, rect.height);
  ctx.stroke();
  
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#94a3b8';
  ctx.font = '9px system-ui';
  ctx.textAlign = 'right';
  
  const scale = props.zoom;
  const mmStep = MM_TO_PX * scale;
  
  // 纵向画布起始像素位置
  const startY = props.canvasMarginTop - props.scrollTop;
  const totalMm = props.paperHeight + 10;
  
  for (let mm = 0; mm <= totalMm; mm++) {
    const y = startY + mm * mmStep;
    if (y < 0 || y > rect.height) continue;
    
    ctx.beginPath();
    if (mm % 10 === 0) {
      // 10mm 大刻度
      ctx.moveTo(rulerThickness - 10, y);
      ctx.lineTo(rulerThickness, y);
      ctx.stroke();
      if (mm > 0) {
        // 旋转文字或者右对齐
        ctx.save();
        ctx.translate(rulerThickness - 12, y + 3);
        ctx.fillText(mm.toString(), 0, 0);
        ctx.restore();
      }
    } else if (mm % 5 === 0) {
      // 5mm 中刻度
      ctx.moveTo(rulerThickness - 6, y);
      ctx.lineTo(rulerThickness, y);
      ctx.stroke();
    } else {
      // 1mm 小刻度
      ctx.moveTo(rulerThickness - 4, y);
      ctx.lineTo(rulerThickness, y);
      ctx.stroke();
    }
  }
  
  // 绘制鼠标红色指示线
  if (props.mouseY >= 0 && props.mouseY <= props.paperHeight * MM_TO_PX) {
    const mousePy = startY + props.mouseY * scale;
    if (mousePy >= 0 && mousePy <= rect.height) {
      ctx.strokeStyle = '#ff4d4f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, mousePy);
      ctx.lineTo(rulerThickness, mousePy);
      ctx.stroke();
    }
  }
};

// 监听各个依赖项并重绘
watch(
  () => [props.zoom, props.scrollLeft, props.scrollTop, props.mouseX, props.mouseY, props.paperWidth, props.paperHeight],
  () => {
    requestAnimationFrame(drawRulers);
  },
  { deep: true }
);

// 窗口尺寸变化重绘
let resizeObserver = null;
onMounted(() => {
  requestAnimationFrame(drawRulers);
  
  // 监听容器大小变化
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      drawRulers();
    });
    if (horizCanvas.value) resizeObserver.observe(horizCanvas.value);
    if (vertCanvas.value) resizeObserver.observe(vertCanvas.value);
  }
  
  window.addEventListener('resize', drawRulers);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', drawRulers);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});
</script>

<style scoped>
.ruler-container {
  pointer-events: none;
}

.ruler-corner {
  position: absolute;
  top: 0;
  left: 0;
  width: 24px; /* rulerThickness */
  height: 24px;
  background-color: #ffffff;
  border-right: 1px solid #e8ecf2;
  border-bottom: 1px solid #e8ecf2;
  z-index: 12;
  pointer-events: auto;
}

.ruler-horizontal {
  position: absolute;
  top: 0;
  width: calc(100% - 24px);
  z-index: 11;
  pointer-events: auto;
}

.ruler-vertical {
  position: absolute;
  left: 0;
  height: calc(100vh - 24px); /* 视情况而定 */
  z-index: 11;
  pointer-events: auto;
}
</style>
