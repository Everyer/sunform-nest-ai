<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    :style="{ width: modalWidth }"
    :mask-closable="true"
    :title="null"
    :bordered="false"
    :segmented="{ content: 'soft' }"
    :z-index="4100"
    class="new-chat-modal"
  >
    <div class="new-chat">
      <!-- Tab 切换 -->
      <div class="tabs">
        <div
          class="tab"
          :class="{ active: mode === 'direct' }"
          @click="mode = 'direct'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>私聊</span>
        </div>
        <div
          class="tab"
          :class="{ active: mode === 'group' }"
          @click="mode = 'group'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>群聊</span>
        </div>
      </div>

      <!-- 私聊 -->
      <template v-if="mode === 'direct'">
        <div class="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" placeholder="搜索用户..." class="search-input" />
        </div>
        <div class="contact-list">
          <div
            v-for="c in filteredContacts"
            :key="c.id"
            class="contact-item"
            @click="onPickDirect(c)"
          >
            <div class="contact-avatar">{{ (c.staffName || c.username || '?').charAt(0) }}</div>
            <div class="contact-info">
              <div class="contact-name">{{ c.staffName }}</div>
              <div class="contact-meta">{{ c.deptName || c.username }}</div>
            </div>
            <div class="contact-action">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
          </div>
          <div v-if="!filteredContacts.length" class="empty-tip">未找到匹配的用户</div>
        </div>
      </template>

      <!-- 群聊 -->
      <template v-else>
        <div class="form-group">
          <label>群聊名称 <span class="optional">(选填,空着将按成员自动生成)</span></label>
          <n-input v-model:value="groupName" placeholder="例如:产品研发组" />
        </div>
        <div class="form-group">
          <label>选择成员({{ selectedIds.length }})</label>
          <div class="search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="search" placeholder="搜索用户..." class="search-input" />
          </div>
          <div class="member-list">
            <div
              v-for="c in filteredContacts"
              :key="c.id"
              class="member-item"
              :class="{ selected: selectedIds.includes(c.id) }"
              @click="toggleMember(c.id)"
            >
              <div class="member-avatar">{{ (c.staffName || c.username || '?').charAt(0) }}</div>
              <div class="member-info">
                <div class="member-name">{{ c.staffName }}</div>
                <div class="member-meta">{{ c.deptName || c.username }}</div>
              </div>
              <div class="checkbox">
                <svg v-if="selectedIds.includes(c.id)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <n-button @click="$emit('update:show', false)">取消</n-button>
          <n-button
            type="primary"
            :disabled="selectedIds.length < 2"
            @click="onCreateGroup"
            :loading="creating"
          >
            创建群聊
          </n-button>
        </div>
      </template>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { NModal, NInput, NButton, useMessage } from 'naive-ui'
import { useImStore } from '@/store/useImStore'

const props = defineProps({
  show: { type: Boolean, default: false },
})
const emit = defineEmits(['update:show', 'created'])

const store = useImStore()
const message = useMessage()

const mode = ref('direct')
const search = ref('')
const groupName = ref('')
const selectedIds = ref([])
const creating = ref(false)

const modalWidth = computed(() => '480px')

watch(() => props.show, (v) => {
  if (v) {
    search.value = ''
    groupName.value = ''
    selectedIds.value = []
    mode.value = 'direct'
    store.loadContacts().catch(() => {})
  }
})

const filteredContacts = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return store.contacts
  return store.contacts.filter((c) =>
    (c.staffName || '').toLowerCase().includes(q) ||
    (c.username || '').toLowerCase().includes(q) ||
    (c.deptName || '').toLowerCase().includes(q)
  )
})

async function onPickDirect(contact) {
  try {
    await store.createDirect(contact.id)
    message.success(`已开启与 ${contact.staffName || contact.username} 的聊天`)
    emit('update:show', false)
    emit('created')
  } catch (e) {
    message.error('开启聊天失败')
  }
}

function toggleMember(id) {
  const i = selectedIds.value.indexOf(id)
  if (i >= 0) selectedIds.value.splice(i, 1)
  else selectedIds.value.push(id)
}

async function onCreateGroup() {
  if (selectedIds.value.length < 2) return
  // 群聊名称可选:空着时按选中成员自动生成默认名,类似微信"X、Y 的群聊"
  let name = groupName.value.trim()
  if (!name) {
    const members = store.contacts.filter((c) => selectedIds.value.includes(c.id))
    const displayNames = members
      .map((m) => m.staffName || m.username)
      .filter(Boolean)
      .slice(0, 3)
    name = displayNames.length ? `${displayNames.join('、')} 的群聊` : '未命名群聊'
  }
  creating.value = true
  try {
    await store.createGroup(name, selectedIds.value)
    message.success('群聊已创建')
    emit('update:show', false)
    emit('created')
  } catch (e) {
    message.error(e.message || '创建失败')
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.new-chat {
  display: flex; flex-direction: column;
  gap: 14px;
}
.tabs {
  display: flex; gap: 4px;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
}
.tab {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 12px;
  font-size: 13px; color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}
.tab:hover { color: #0f172a; }
.tab.active {
  background: #fff;
  color: #0c1832;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  font-weight: 600;
}

.search-box {
  display: flex; align-items: center; gap: 6px;
  background: #f1f5f9; border-radius: 10px;
  padding: 8px 12px;
  color: #94a3b8;
}
.search-input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 13px; color: #0f172a;
}
.search-input::placeholder { color: #94a3b8; }

.contact-list, .member-list {
  max-height: 360px; overflow-y: auto;
  border: 1px solid #e8ecf2; border-radius: 10px;
  background: #fff;
}
.contact-list::-webkit-scrollbar, .member-list::-webkit-scrollbar { width: 4px; }
.contact-list::-webkit-scrollbar-thumb, .member-list::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.25); border-radius: 2px; }

.contact-item, .member-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}
.contact-item:last-child, .member-item:last-child { border-bottom: none; }
.contact-item:hover, .member-item:hover { background: #f8f9fc; }
.member-item.selected { background: rgba(12,24,50,0.04); }

.contact-avatar, .member-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, #0c1832, #1a2d4a);
  color: #fff; font-weight: 600; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.contact-info, .member-info { flex: 1; min-width: 0; }
.contact-name, .member-name {
  font-size: 13.5px; font-weight: 600; color: #0f172a;
}
.contact-meta, .member-meta {
  font-size: 11.5px; color: #94a3b8;
  margin-top: 1px;
}
.contact-action { color: #94a3b8; }
.checkbox {
  width: 22px; height: 22px;
  border: 1.5px solid #cbd5e1;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  transition: all 0.15s;
}
.member-item.selected .checkbox {
  background: #0c1832;
  border-color: #0c1832;
}

.empty-tip {
  padding: 30px;
  text-align: center;
  font-size: 12.5px;
  color: #94a3b8;
}

.form-group {
  display: flex; flex-direction: column; gap: 8px;
}
.form-group > label {
  font-size: 12.5px; font-weight: 600; color: #475569;
}
.form-group > label .optional {
  font-size: 11px; font-weight: 400; color: #94a3b8; margin-left: 4px;
}
.form-actions {
  display: flex; justify-content: flex-end; gap: 8px;
  margin-top: 4px;
}
</style>
