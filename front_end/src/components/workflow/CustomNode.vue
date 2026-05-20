<template>
  <div
    class="custom-node"
    :class="[`node-${data.nodeType}`, { selected }]"
  >
    <div class="node-inner">
      <div class="node-icon">
        <n-icon v-if="data.nodeType === 'start'" size="14"><PersonOutline /></n-icon>
        <n-icon v-else-if="data.nodeType === 'end'" size="14"><CheckmarkCircleOutline /></n-icon>
        <n-icon v-else-if="data.nodeType === 'condition'" size="14"><GitBranchOutline /></n-icon>
        <n-icon v-else size="14"><ShieldCheckmarkOutline /></n-icon>
      </div>
      <div class="node-label">{{ data.name }}</div>
    </div>

    <Handle
      v-if="data.nodeType !== 'end'"
      type="source"
      :position="Position.Right"
      class="handle handle-source"
    />
    <Handle
      v-if="data.nodeType === 'condition'"
      type="source"
      :position="Position.Bottom"
      :id="'bottom'"
      class="handle handle-source"
    />
    <Handle
      v-if="data.nodeType !== 'start'"
      type="target"
      :position="Position.Left"
      class="handle handle-target"
    />
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'
import { NIcon } from 'naive-ui'
import { PersonOutline, ShieldCheckmarkOutline, GitBranchOutline, CheckmarkCircleOutline } from '@vicons/ionicons5'

defineProps({
  data: Object,
  selected: { type: Boolean, default: false },
})
</script>

<style scoped>
.custom-node {
  position: relative;
  border-radius: 6px;
  min-width: 56px;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  font-size: 11px;
}
.custom-node:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.10); }
.custom-node.selected { box-shadow: 0 0 0 2px #3b82f6, 0 2px 6px rgba(59,130,246,0.12); }

.node-inner {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
}

.node-start  { background: #ecfdf5; border: 1.5px solid #059669; }
.node-approve { background: #eff6ff; border: 1.5px solid #3b82f6; }
.node-condition { background: #fffbeb; border: 1.5px solid #f59e0b; }
.node-end { background: #fef2f2; border: 1.5px solid #ef4444; }

.node-icon {
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 4px;
  flex-shrink: 0;
}
.node-start .node-icon  { background: #d1fae5; color: #059669; }
.node-approve .node-icon { background: #dbeafe; color: #3b82f6; }
.node-condition .node-icon { background: #fef3c7; color: #f59e0b; }
.node-end .node-icon  { background: #fee2e2; color: #ef4444; }

.node-label { font-size: 10px; font-weight: 600; white-space: nowrap; }

.handle {
  width: 8px; height: 8px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #94a3b8;
  transition: background 0.15s, box-shadow 0.15s;
  cursor: crosshair;
}
.handle:hover {
  background: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25);
}
.handle-source { right: -4px; }
.handle-target { left: -4px; }
</style>
