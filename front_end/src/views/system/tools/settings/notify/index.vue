<template>
  <SyCard title="通知设置">
    <n-empty description="四级嵌套菜单页面 — /system/tools/settings/notify">
      <template #extra>
        <n-tag size="small" :bordered="false" :color="{ color: '#fef3c7', textColor: '#92400e' }">四层嵌套</n-tag>
      </template>
    </n-empty>
  </SyCard>
</template>

<script setup>
import { NEmpty, NTag } from 'naive-ui'
import SyCard from '@/components/SyCard/index.vue'
</script>
