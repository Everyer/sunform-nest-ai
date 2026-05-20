<script setup>
import { NConfigProvider, NMessageProvider, NDialogProvider, NGlobalStyle, darkTheme, useMessage, useDialog } from 'naive-ui'
import { useAppStore } from '@/store/useAppStore'
import { computed, defineComponent } from 'vue'
import GlobalAiChat from '@/components/ai/GlobalAiChat.vue'

const appStore = useAppStore()

// 在 provider 树内部设置 window.$message（注册为组件，渲染 null）
const GlobalSetup = defineComponent({
  setup() {
    window.$message = useMessage()
    window.$dialog = useDialog()
    return () => null
  },
})
const themeOverrides = computed(() => {
  const primary = appStore.primaryColor
  return {
    common: {
      primaryColor: primary,
      primaryColorHover: lighten(primary, 10),
      primaryColorPressed: darken(primary, 10),
      primaryColorSuppl: primary,
      borderRadius: '8px',
      borderRadiusSmall: '6px',
      heightMedium: '38px',
      heightSmall: '32px',
      fontSizeMedium: '14px',
      fontSizeSmall: '13px',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontWeightStrong: '600',
      boxShadowMedium: '0 2px 8px rgba(12,24,50,0.06)',
      boxShadowLarge: '0 8px 24px rgba(12,24,50,0.08)',
      popColor: '#fff',
      tableColor: '#fff',
      cardColor: '#fff',
      modalColor: '#fff',
      bodyColor: '#f3f4f8',
      actionColor: '#f8f9fc',
      hoverColor: '#f0f2f6',
      dividerColor: '#e8ecf2',
      borderColor: '#e8ecf2',
      textColor1: '#0f172a',
      textColor2: '#475569',
      textColor3: '#94a3b8',
      // Info/Warning/Success colors with warm tones
      infoColor: primary,
      infoColorSuppl: primary,
      warningColor: '#d97706',
      warningColorSuppl: '#d97706',
      successColor: '#059669',
      successColorSuppl: '#059669',
      errorColor: '#dc2626',
      errorColorSuppl: '#dc2626',
    },
    Card: {
      borderRadius: '14px',
      paddingMedium: '24px',
      titleFontWeight: '600',
      titleTextColor: '#0f172a'
    },
    Button: {
      borderRadiusMedium: '8px',
      borderRadiusSmall: '6px',
      fontWeightMedium: '500',
      fontSizeMedium: '14px',
      fontSizeSmall: '13px',
      heightMedium: '38px',
      heightSmall: '32px',
      // Ghost/quaternary button styles
      textColorGhost: '#475569',
      textColorGhostHover: primary,
      borderGhost: '1px solid #e8ecf2',
      borderGhostHover: `1px solid ${primary}`,
    },
    Menu: {
      itemHeight: '42px',
      fontSize: '14px',
      borderRadius: '8px',
      itemColorActive: `${primary}15`,
      itemColorHover: 'rgba(255,255,255,0.08)',
      itemTextColorActive: primary,
      itemTextColorActiveHover: primary,
      itemIconColorActive: primary,
      arrowColorActive: primary,
      itemTextColor: 'rgba(255,255,255,0.7)',
      itemTextColorHover: '#fff',
      itemIconColor: 'rgba(255,255,255,0.5)',
      itemIconColorHover: '#fff',
      arrowColor: 'rgba(255,255,255,0.3)',
      color: 'transparent',
    },
    DataTable: {
      thColor: '#f8f9fc',
      thTextColor: '#475569',
      thFontWeight: '600',
      tdColor: '#fff',
      tdColorStriped: '#fafbfd',
      borderColor: '#e8ecf2',
      tdTextColor: '#0f172a',
      borderRadius: '10px',
      lineHeight: '46px',
      thPadding: '0 14px',
      tdPadding: '0 14px',
    },
    Input: {
      borderRadius: '8px',
      color: '#f8f9fc',
      colorFocus: '#fff',
      border: '1px solid #e8ecf2',
      borderFocus: `1px solid ${primary}`,
      borderHover: '1px solid #94a3b8',
      textColor: '#0f172a',
      placeholderColor: '#94a3b8',
    },
    Select: {
      borderRadius: '8px',
      menuBorderRadius: '10px',
      color: '#f8f9fc',
      colorFocus: '#fff',
    },
    TreeSelect: {
      borderRadius: '8px',
    },
    Tag: {
      borderRadius: '6px',
    },
    Switch: {
      railColorActive: primary,
    },
    Modal: {
      borderRadius: '16px',
      titleFontSize: '17px',
      titleFontWeight: '600',
    },
    Pagination: {
      borderRadius: '6px',
      itemColorActive: primary,
      itemTextColorActive: '#fff',
    },
    Tree: {
      nodeBorderRadius: '6px',
    }
  }
})

// Helper functions for color manipulation
function lighten(color, percent) {
  const num = parseInt(color.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function darken(color, percent) {
  const num = parseInt(color.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) - amt,
    G = (num >> 8 & 0x00FF) - amt,
    B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}
</script>

<template>
  <n-config-provider
    :theme-overrides="themeOverrides"
    :theme="appStore.theme === 'dark' ? darkTheme : null"
  >
    <n-global-style />
    <n-message-provider>
      <n-dialog-provider>
        <GlobalSetup />
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
        <!-- 全局 AI 智能填报与指令助手 -->
        <GlobalAiChat />
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
* { box-sizing: border-box; margin: 0; }

html, body { height: 100%; }

body {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f3f4f8;
  color: #0f172a;
}

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.25);
  border-radius: 3px;
  transition: background 0.2s;
}
::-webkit-scrollbar-thumb:hover { background-color: rgba(148, 163, 184, 0.45); }

/* Smooth transitions for form elements */
.n-button, .n-input__wrapper, .n-select .n-base-selection,
.n-tree-select .n-base-selection {
  transition: all 0.2s ease !important;
}

/* Card content scroll fix */
.n-card-content {
  min-height: 0;
}

/* Mobile global overrides */
@media (max-width: 768px) {
  .n-modal .n-card {
    width: calc(100vw - 16px) !important;
    max-width: calc(100vw - 16px) !important;
  }
  .n-modal .n-card__content {
    padding: 14px 12px !important;
  }
  .n-form .n-form-item .n-form-item-blank {
    width: 100%;
  }
  .n-form .n-row {
    flex-direction: column !important;
    gap: 0 !important;
  }
  .n-form .n-col {
    max-width: 100% !important;
    flex: 0 0 100% !important;
    width: 100% !important;
  }
}
</style>
