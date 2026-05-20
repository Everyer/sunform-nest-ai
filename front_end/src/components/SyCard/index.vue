<template>
  <div class="sy-card-wrapper">
    <div class="sy-card-inner">
      <div v-if="title || $slots.extra" class="sy-card-header">
        <h3 class="sy-card-title">{{ title }}</h3>
        <div v-if="$slots.extra" class="sy-card-extra">
          <slot name="extra" />
        </div>
      </div>
      <div class="sy-card-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ title: { type: String, default: '' } })
</script>

<style scoped>
.sy-card-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  animation: cardFadeIn 0.35s ease-out;
}
@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.sy-card-inner {
  flex: 1;
  min-height: 0;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(12,24,50,0.04), 0 0 1px rgba(12,24,50,0.02);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.25s ease;
}
.sy-card-inner:hover {
  box-shadow: 0 4px 16px rgba(12,24,50,0.06);
}
.sy-card-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}
.sy-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: 0.2px;
  line-height: 1.4;
}
.sy-card-extra {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sy-card-body {
  flex: 1;
  min-height: 0;
  padding: 18px 24px 22px;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .sy-card-inner {
    border-radius: 10px;
  }
  .sy-card-header {
    padding: 14px 14px 0;
  }
  .sy-card-body {
    padding: 12px 14px 16px;
  }
}
</style>
