<template>
  <div class="fc-tree-node flex flex-col items-center">
    <!-- Card representing the current node -->
    <div class="fc-node" :class="['fc-' + (node.type || 'approve')]">
      <div class="fc-node-type">{{ nodeTypeLabel(node.type) }}</div>
      <div class="fc-node-name" :title="node.name">{{ node.name }}</div>
    </div>

    <!-- Children -->
    <div v-if="node.children && node.children.length > 0" class="fc-children flex flex-col items-center w-full">
      <!-- Single child branch -->
      <div v-if="node.children.length === 1" class="flex flex-col items-center w-full">
        <!-- Down Arrow -->
        <div class="fc-arrow my-2">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="#94a3b8" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <FlowChartTree :node="node.children[0]" />
      </div>

      <!-- Multiple children (branching) -->
      <div v-else class="flex flex-col items-center w-full mt-2">
        <!-- Down arrow into a branching line -->
        <div class="fc-arrow-split flex flex-col items-center w-full relative">
          <div class="w-0.5 h-6 bg-slate-300"></div>
          <!-- Horizontal connection line connecting the branches -->
          <div class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-slate-300"></div>
        </div>

        <div class="flex gap-8 items-start justify-center pt-4 w-full">
          <div 
            v-for="child in node.children" 
            :key="child.id" 
            class="flex flex-col items-center relative min-w-[130px]"
          >
            <!-- Vertical line to each branch -->
            <div class="w-0.5 h-4 bg-slate-300 absolute -top-4"></div>

            <!-- Branch Edge Label -->
            <div class="fc-edge-label-container mb-3 z-10">
              <span class="fc-edge-label px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600 shadow-sm whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis inline-block" :title="child.edgeLabel">
                {{ child.edgeLabel || '分支' }}
              </span>
            </div>

            <!-- Recursive render -->
            <FlowChartTree :node="child" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import FlowChartTree from './FlowChartTree.vue'

defineProps({
  node: {
    type: Object,
    required: true,
  },
})

function nodeTypeLabel(type) {
  return { start: '发起', approve: '审批', condition: '条件', end: '结束' }[type] || type
}
</script>

<style scoped>
.fc-node {
  width: 130px;
  padding: 8px 12px;
  border-radius: 6px;
  text-align: center;
  border: 1.5px solid;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.fc-node.fc-start { border-color: #059669; background: #ecfdf5; }
.fc-node.fc-approve { border-color: #3b82f6; background: #eff6ff; }
.fc-node.fc-condition { border-color: #f59e0b; background: #fffbeb; }
.fc-node.fc-end { border-color: #ef4444; background: #fef2f2; }

.fc-node-type { 
  font-size: 9px; 
  font-weight: 700; 
  letter-spacing: 0.5px; 
  margin-bottom: 2px; 
}
.fc-node.fc-start .fc-node-type { color: #059669; }
.fc-node.fc-approve .fc-node-type { color: #3b82f6; }
.fc-node.fc-condition .fc-node-type { color: #f59e0b; }
.fc-node.fc-end .fc-node-type { color: #ef4444; }

.fc-node-name { 
  font-size: 11px; 
  font-weight: 600; 
  color: #1e293b; 
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fc-arrow svg {
  display: block;
}
</style>
