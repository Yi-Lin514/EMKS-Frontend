<template>
  <aside class="kb-sidebar">
    <div class="kb-sidebar-header">
      <div class="kb-sidebar-title">資料夾</div>
      <button v-if="isAdmin" class="kb-folder-add-btn" title="新增資料夾" @click="openFolderModal()">
        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
      </button>
    </div>
    <div class="kb-folder-scroll">
      <div
        class="kb-folder-item"
        :class="{ 'kb-folder-active': selectedFolderId === null }"
        @click="$emit('select-folder', null)"
      >
        <svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
        全部
      </div>
      <div v-if="foldersLoading" class="kb-sidebar-hint">載入中...</div>
      <div v-else-if="folderTree.length === 0" class="kb-sidebar-hint">尚無資料夾</div>
      <template v-else>
        <div v-for="node in folderTree" :key="node.id">
          <div
            class="kb-folder-item"
            :class="{ 'kb-folder-active': selectedFolderId === node.id }"
            @click="$emit('select-folder', node.id)"
          >
            <button
              v-if="node.children && node.children.length"
              class="kb-folder-toggle"
              :class="{ 'kb-folder-toggle-open': !collapsedFolders.has(node.id) }"
              @click.stop="toggleCollapse(node.id)"
            >
              <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
            </button>
            <span v-else class="kb-folder-toggle-spacer"></span>
            <svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
            {{ node.name }}
            <span v-if="node.department_name" class="kb-folder-dept">{{ node.department_name }}</span>
            <span v-if="isAdmin" class="kb-folder-actions" @click.stop>
              <button class="kb-folder-action-btn" title="編輯" @click="openFolderModal(node)">
                <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
              </button>
              <button class="kb-folder-action-btn kb-folder-action-danger" title="刪除" @click="confirmDeleteFolder(node)">
                <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
              </button>
            </span>
          </div>
          <div v-if="node.children && node.children.length && !collapsedFolders.has(node.id)" class="kb-folder-children">
            <div
              v-for="child in node.children"
              :key="child.id"
              class="kb-folder-item"
              :class="{ 'kb-folder-active': selectedFolderId === child.id }"
              @click="$emit('select-folder', child.id)"
            >
              <svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
              {{ child.name }}
              <span v-if="child.department_name" class="kb-folder-dept">{{ child.department_name }}</span>
              <span v-if="isAdmin" class="kb-folder-actions" @click.stop>
                <button class="kb-folder-action-btn" title="編輯" @click="openFolderModal(child)">
                  <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                </button>
                <button class="kb-folder-action-btn kb-folder-action-danger" title="刪除" @click="confirmDeleteFolder(child)">
                  <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                </button>
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </aside>

  <div v-if="showFolderModal" class="kb-modal-overlay" @click.self="showFolderModal = false">
    <div class="kb-modal">
      <h3>{{ folderEditTarget ? '編輯資料夾' : '新增資料夾' }}</h3>
      <div class="kb-form-group">
        <label>資料夾名稱</label>
        <input v-model="folderForm.name" type="text" class="kb-input" placeholder="請輸入名稱" />
      </div>
      <div class="kb-form-group">
        <label>上層資料夾</label>
        <select v-model="folderForm.parent_id">
          <option :value="null">無（頂層）</option>
          <option
            v-for="f in flatFolders.filter(f => f.id !== folderEditTarget?.id)"
            :key="f.id"
            :value="f.id"
          >
            {{ f.prefix }}{{ f.name }}
          </option>
        </select>
      </div>
      <div class="kb-form-group">
        <label>所屬部門</label>
        <select v-model="folderForm.department_id">
          <option :value="null">不指定</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
        </select>
      </div>
      <div class="kb-modal-actions">
        <button class="btn btn-secondary" @click="showFolderModal = false">取消</button>
        <button class="btn btn-primary" :disabled="!folderForm.name.trim() || savingFolder" @click="handleSaveFolder">
          {{ savingFolder ? '儲存中...' : '儲存' }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="deleteFolderTarget" class="kb-modal-overlay" @click.self="deleteFolderTarget = null">
    <div class="kb-modal">
      <h3>刪除資料夾</h3>
      <p>確定要刪除資料夾「{{ deleteFolderTarget.name }}」嗎？</p>
      <div class="kb-modal-actions">
        <button class="btn btn-secondary" @click="deleteFolderTarget = null">取消</button>
        <button class="btn btn-danger" @click="handleDeleteFolder">刪除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/utils/axios'

const props = defineProps({
  folderTree: { type: Array, required: true },
  selectedFolderId: { default: null },
  foldersLoading: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  departments: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-folder', 'folders-changed'])

const collapsedFolders = ref(new Set())

const toggleCollapse = (folderId) => {
  const next = new Set(collapsedFolders.value)
  if (next.has(folderId)) {
    next.delete(folderId)
  } else {
    next.add(folderId)
  }
  collapsedFolders.value = next
}

const showFolderModal = ref(false)
const folderEditTarget = ref(null)
const folderForm = ref({ name: '', parent_id: null, department_id: null })
const savingFolder = ref(false)
const deleteFolderTarget = ref(null)

const flatFolders = computed(() => {
  const result = []
  const flatten = (nodes, depth) => {
    for (const node of nodes) {
      result.push({ ...node, prefix: '\u00A0\u00A0'.repeat(depth) })
      if (node.children?.length) {
        flatten(node.children, depth + 1)
      }
    }
  }
  flatten(props.folderTree, 0)
  return result
})

const openFolderModal = (folder = null) => {
  folderEditTarget.value = folder
  folderForm.value = {
    name: folder?.name || '',
    parent_id: folder?.parent_id || null,
    department_id: folder?.department_id || null,
  }
  showFolderModal.value = true
}

const handleSaveFolder = async () => {
  if (!folderForm.value.name.trim()) return
  savingFolder.value = true
  try {
    if (folderEditTarget.value) {
      await api.put(`/knowledge/folders/${folderEditTarget.value.id}`, folderForm.value)
    } else {
      await api.post('/knowledge/folders', folderForm.value)
    }
    showFolderModal.value = false
    emit('folders-changed')
  } catch (err) {
    const msg = err.response?.data?.detail || err.message
    alert((folderEditTarget.value ? '編輯' : '新增') + '失敗：' + msg)
  } finally {
    savingFolder.value = false
  }
}

const confirmDeleteFolder = (folder) => {
  deleteFolderTarget.value = folder
}

const handleDeleteFolder = async () => {
  const folderId = deleteFolderTarget.value.id
  try {
    await api.delete(`/knowledge/folders/${folderId}`)
    deleteFolderTarget.value = null
    emit('folders-changed', folderId)
  } catch (err) {
    const msg = err.response?.data?.detail || err.message
    alert('刪除失敗：' + msg)
  }
}
</script>

<style scoped>
.kb-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
  border-right: none;
  display: flex;
  flex-direction: column;
}

.kb-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
  flex-shrink: 0;
}

.kb-sidebar-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.kb-folder-add-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.kb-folder-add-btn svg { width: 16px; height: 16px; fill: #3b82f6; }
.kb-folder-add-btn:hover { background: rgba(59, 130, 246, 0.2); transform: scale(1.1); }

.kb-folder-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 0.625rem 1rem;
}

.kb-folder-scroll::-webkit-scrollbar { width: 4px; }
.kb-folder-scroll::-webkit-scrollbar-track { background: transparent; }
.kb-folder-scroll::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 4px; }

.kb-sidebar-hint {
  font-size: 0.9375rem;
  color: var(--primary-400);
  padding: 0.75rem 0.625rem;
}

.kb-folder-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--primary-600);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 2px;
  position: relative;
}

.kb-folder-item:hover {
  background: rgba(59, 130, 246, 0.08);
  color: var(--primary-800);
  transform: translateX(2px);
}

.kb-folder-active {
  background: white;
  color: #2563eb;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.15);
}

.kb-folder-active:hover { transform: none; }

.kb-folder-item svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
  flex-shrink: 0;
  opacity: 0.7;
}

.kb-folder-active svg { opacity: 1; }

.kb-folder-dept {
  font-size: 0.75rem;
  color: var(--primary-400);
  margin-left: auto;
  background: rgba(59, 130, 246, 0.08);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.kb-folder-toggle {
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  border-radius: 4px;
  transition: all 0.2s ease;
  transform: rotate(0deg);
}

.kb-folder-toggle svg { width: 16px; height: 16px; fill: var(--primary-400); }
.kb-folder-toggle:hover { background: rgba(59, 130, 246, 0.1); }
.kb-folder-toggle-open { transform: rotate(90deg); }
.kb-folder-toggle-spacer { width: 18px; flex-shrink: 0; }

.kb-folder-children { padding-left: 1.25rem; }

.kb-folder-actions {
  display: none;
  margin-left: auto;
  gap: 2px;
}

.kb-folder-item:hover .kb-folder-actions { display: inline-flex; }

.kb-folder-action-btn {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  color: #3b82f6;
}

.kb-folder-action-btn svg { width: 14px; height: 14px; fill: currentColor; }
.kb-folder-action-btn:hover { background: rgba(59, 130, 246, 0.15); }
.kb-folder-action-danger { color: var(--primary-400); }
.kb-folder-action-danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.kb-input {
  width: 100%;
  padding: 0.5625rem 0.875rem;
  border: 1px solid var(--primary-200);
  border-radius: 10px;
  font-size: 0.9375rem;
  color: var(--primary-900);
  background: white;
  transition: all 0.2s ease;
  outline: none;
}

.kb-input:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

.kb-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: kb-fade-in 0.2s ease;
}

@keyframes kb-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes kb-slide-up { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

.kb-modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05);
  animation: kb-slide-up 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.kb-modal h3 {
  margin: 0 0 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-900);
  letter-spacing: -0.01em;
}

.kb-modal p {
  margin: 0 0 1rem;
  color: var(--primary-600);
  font-size: 1rem;
  line-height: 1.6;
}

.kb-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.kb-form-group { margin-bottom: 1.125rem; }
.kb-form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--primary-600); margin-bottom: 0.4rem; letter-spacing: 0.01em; }

.kb-form-group select {
  width: 100%;
  padding: 0.5625rem 0.875rem;
  border: 1px solid var(--primary-200);
  border-radius: 10px;
  font-size: 0.9375rem;
  color: var(--primary-900);
  background: white;
  transition: all 0.2s ease;
  outline: none;
}

.kb-form-group select:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

.btn-secondary {
  background: var(--primary-50);
  color: var(--primary-600);
  border: 1px solid var(--primary-200);
  padding: 0.5rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.btn-secondary:hover { background: var(--primary-100); border-color: var(--primary-300); }

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.25);
}

.btn-danger:hover { background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3); transform: translateY(-1px); }
</style>
