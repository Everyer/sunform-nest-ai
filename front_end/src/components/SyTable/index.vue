<template>
  <div class="sy-table-wrapper">
    <!-- Search area -->
    <div v-if="$slots.search" class="sy-table-search" :class="{ 'search-open': mobileSearchOpen }">
      <div class="search-toggle" @click="toggleMobileSearch">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span>筛选</span>
        <svg class="toggle-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline :points="mobileSearchOpen ? '6 15 12 9 18 15' : '6 9 12 15 18 9'" /></svg>
      </div>
      <div class="search-bar">
        <div class="search-icon-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <div class="search-fields">
          <slot name="search" />
        </div>
        <div class="search-divider" />
        <div class="search-actions">
          <n-button type="primary" size="small" @click="$emit('search')">查询</n-button>
          <n-button size="small" @click="$emit('reset')">重置</n-button>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div v-if="$slots.toolbar || showCreate" class="sy-table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="toolbar-right">
        <slot name="toolbar" />
        <n-button v-if="showCreate" v-ai="'新增'" type="primary" size="small" @click="$emit('create')">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          新增
        </n-button>
      </div>
    </div>

    <!-- Table: desktop -->
    <n-data-table
      class="sy-table-body sy-table-desktop"
      :columns="columns"
      :data="data"
      :loading="loading"
      :row-key="rowKeyFn"
      :bordered="false"
      :single-line="false"
      :striped="true"
      flex-height
      :children-key="childrenKey"
      :default-expand-all="tree"
      :pagination="pagination"
      :row-props="rowProps"
      size="small"
    >
      <template #empty>
        <slot name="empty">
          <n-empty description="暂无数据" />
        </slot>
      </template>
    </n-data-table>

    <!-- Table: mobile card view -->
    <div class="sy-table-cards">
      <div v-if="data.length === 0 && !loading" class="cards-empty">
        <n-empty description="暂无数据" />
      </div>
      <div v-for="row in data" :key="rowKeyFn(row)" class="table-card">
        <!-- Card header: title + actions only -->
        <div class="card-top">
          <span v-if="titleColumn" class="card-title">{{ getNestedValue(row, titleColumn.key) }}</span>
          <div v-if="actionColumns.length" class="card-top-actions">
            <template v-for="col in actionColumns" :key="col.key">
              <template v-if="renderCell(row, col).text">{{ renderCell(row, col).value }}</template>
              <component v-else :is="renderCell(row, col).value" />
            </template>
          </div>
        </div>
        <!-- Card body: all remaining fields in vertical list -->
        <div v-if="bodyColumns.length" class="card-body">
          <div v-for="col in bodyColumns" :key="col.key" class="card-field">
            <span class="card-field-label">{{ col.title }}</span>
            <span class="card-field-value">
              <template v-if="renderCell(row, col).text">{{ renderCell(row, col).value }}</template>
              <component v-else :is="renderCell(row, col).value" />
            </span>
          </div>
        </div>
      </div>
      <!-- Mobile pagination -->
      <div v-if="pagination" class="cards-pagination">
        <n-pagination
          :page="page"
          :page-size="pageSize"
          :item-count="total"
          :page-sizes="[10, 20, 50, 100]"
          show-size-picker
          :prefix="() => `共 ${total} 条`"
          @update:page="(p) => emit('pageChange', p)"
          @update:page-size="(s) => emit('pageChange', 1, s)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import { NDataTable, NButton, NSpace, NForm, NFormItem, NEmpty, NIcon, NPagination } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

const mobileSearchOpen = ref(false)
function toggleMobileSearch() {
  mobileSearchOpen.value = !mobileSearchOpen.value
}

const dataColumns = computed(() => props.columns.filter(c => c.title))
const actionColumns = computed(() => props.columns.filter(c => !c.title))

// Card layout: first text column as title, rest in body
const titleColumn = computed(() => {
  const first = dataColumns.value[0]
  return first && !first.render ? first : null
})

const bodyColumns = computed(() =>
  dataColumns.value.filter(c => c !== titleColumn.value)
)

function getNestedValue(obj, path) {
  if (!obj) return ''
  return path.split('.').reduce((o, k) => o?.[k], obj) ?? ''
}

// Render a cell value safely: wraps strings/numbers as text, passes VNodes to <component :is>
function renderCell(row, col) {
  if (!col.render) {
    return { text: true, value: getNestedValue(row, col.key) }
  }
  const r = col.render(row)
  // Plain string, number, boolean — display as text (handles formatDateTime, '' etc.)
  if (r == null || typeof r === 'string' || typeof r === 'number' || typeof r === 'boolean') {
    return { text: true, value: String(r ?? '') }
  }
  // VNode
  return { text: false, value: r }
}

const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  rowKey: { type: [String, Function], default: 'id' },
  showCreate: { type: Boolean, default: true },
  tree: { type: Boolean, default: false },
  childrenKey: { type: String, default: 'children' },
  rowProps: { type: Function, default: null }
})

const emit = defineEmits(['search', 'reset', 'create', 'pageChange'])

const rowKeyFn = computed(() => {
  if (typeof props.rowKey === 'function') return props.rowKey
  return (row) => row[props.rowKey]
})

const pagination = computed(() => {
  if (props.tree || !props.total) return false
  return {
    page: props.page,
    pageSize: props.pageSize,
    itemCount: props.total,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    pageSize: props.pageSize,
    prefix: ({ itemCount }) => `共 ${itemCount} 条`,
    onChange: (page) => emit('pageChange', page),
    onUpdatePageSize: (size) => emit('pageChange', 1, size),
  }
})
</script>

<style scoped>
.sy-table-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

/* === Search bar === */
.sy-table-search {
  flex-shrink: 0;
  margin-bottom: 18px;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid #e8ecf2;
  border-radius: 12px;
  padding: 14px 18px;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}
.search-bar:focus-within {
  border-color: #0c1832;
  box-shadow: 0 0 0 3px rgba(12,24,50,0.04);
}
.search-icon-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  opacity: 0.4;
}
.search-fields {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 16px;
  flex: 1;
  min-width: 0;
}
.search-fields :deep(.n-form-item) {
  margin-bottom: 0 !important;
}
.search-fields :deep(.n-form-item .n-form-item-label) {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  padding-right: 6px;
}
.search-fields :deep(.n-input) {
  width: 180px;
}
.search-divider {
  width: 1px;
  height: 28px;
  background: #e8ecf2;
  flex-shrink: 0;
}
.search-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* === Toolbar === */
.sy-table-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  min-height: 32px;
}
.toolbar-left { display: flex; align-items: center; gap: 8px; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }

/* === Desktop table === */
.sy-table-body {
  flex: 1;
  min-height: 0;
}
.sy-table-body :deep(.n-data-table-tr) {
  transition: background 0.15s;
}
.sy-table-body :deep(.n-data-table-tr:hover) {
  background: rgba(12,24,50,0.02) !important;
}
.sy-table-body :deep(.n-data-table-tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 #d97706;
}
.sy-table-body :deep(.n-data-table-th) {
  font-size: 13px;
  letter-spacing: 0.2px;
  border-top: none;
  text-transform: uppercase;
  font-weight: 600;
  color: #64748b;
}
.sy-table-body :deep(.n-data-table-td) {
  font-size: 13px;
  color: #0f172a;
}
.sy-table-body :deep(.n-data-table-pagination) {
  padding: 14px 0 0;
}

/* === Mobile card view === */
.sy-table-cards {
  display: none;
  flex: 1;
  min-height: 0;
}
.table-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 2px 12px rgba(12, 24, 50, 0.06), 0 1px 2px rgba(12, 24, 50, 0.04);
  transition: box-shadow 0.2s, transform 0.2s;
}
.table-card:active {
  transform: scale(0.995);
  box-shadow: 0 4px 16px rgba(12, 24, 50, 0.1);
}

/* Card top row: title + actions */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
}
.card-top-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 8px;
}

/* Card body: vertical field list */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.card-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  min-width: 0;
  padding: 6px 0;
  border-bottom: 1px solid #f4f5f7;
}
.card-field:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.card-field-label {
  color: #94a3b8;
  flex-shrink: 0;
  font-size: 12px;
}
.card-field-value {
  color: #475569;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.cards-empty {
  padding: 40px 0;
}
.cards-pagination {
  display: flex;
  justify-content: center;
  margin-top: 4px;
  padding: 8px 0;
}

/* === Mobile search & layout === */
.search-toggle {
  display: none;
}

@media (max-width: 768px) {
  .search-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    font-size: 13px;
    color: #64748b;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    user-select: none;
    border: 1px solid #e8ecf2;
  }
  .search-toggle .toggle-arrow {
    margin-left: auto;
    transition: transform 0.2s ease;
  }
  .sy-table-search {
    margin-bottom: 10px;
  }
  .sy-table-search .search-bar {
    display: none;
  }
  .sy-table-search.search-open .search-bar {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 12px 14px;
  }
  .search-divider {
    display: none;
  }
  .search-fields {
    flex-wrap: wrap;
    gap: 6px;
  }
  .search-actions {
    justify-content: flex-end;
  }

  /* Hide desktop table */
  .sy-table-desktop {
    display: none !important;
  }

  /* Show card view */
  .sy-table-cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
