<template>
  <template v-for="item in menus" :key="item.id">
    <n-menu-item
      v-if="!item.children?.length"
      :value="item.id"
      @click="handleClick(item)"
    >
      <template #icon>
        <n-icon :component="getIcon(item.icon)" />
      </template>
      {{ item.name }}
    </n-menu-item>

    <n-submenu v-else :value="item.id">
      <template #icon>
        <n-icon :component="getIcon(item.icon)" />
      </template>
      <template #label>{{ item.name }}</template>
      <SideMenu :menus="item.children" @select="handleClick" />
    </n-submenu>
  </template>
</template>

<script setup>
import { NIcon } from 'naive-ui'
import * as icons from '@vicons/ionicons5'

defineProps({
  menus: { type: Array, default: () => [] }
})

const emit = defineEmits(['select'])

function getIcon(iconName) {
  return icons[iconName] || icons.GridOutline
}

function handleClick(item) {
  emit('select', item)
}
</script>
