<template>
  <div v-if="visible" class="kb-modal-overlay" @click.self="$emit('close')">
    <div class="kb-modal kb-modal-wide">
      <h3>版本歷史 — {{ doc?.filename }}</h3>
      <div v-if="loading" class="kb-empty">載入中...</div>
      <div v-else-if="versions.length === 0" class="kb-empty">無版本紀錄</div>
      <div v-else class="kb-version-list">
        <div
          v-for="v in versions"
          :key="v.id"
          class="kb-version-item"
          :class="{ 'kb-version-current': v.is_current }"
        >
          <div class="kb-version-header">
            <span class="kb-badge kb-badge-version">v{{ v.version }}</span>
            <span v-if="v.is_current" class="kb-badge kb-badge-status-approved">目前版本</span>
            <span v-if="v.restored_from" class="kb-badge kb-badge-restore">還原自 v{{ v.restored_from }}</span>
            <span class="kb-badge" :class="'kb-badge-status-' + v.status">{{ statusTextMap[v.status] || v.status }}</span>
            <span class="kb-version-size">{{ formatSize(v.file_size) }}</span>
            <span class="kb-version-meta">{{ v.uploaded_by_name }} · {{ formatDate(v.created_at) }}</span>
          </div>
          <div v-if="v.reject_reason" class="kb-version-reject">駁回原因：{{ v.reject_reason }}</div>
          <div v-if="v.vectorization_status && v.vectorization_status !== 'none'" class="kb-version-vec">
            <span class="kb-status" :class="'kb-status-' + v.vectorization_status">
              {{ vecStatusText(v.vectorization_status) }}
            </span>
            <span v-if="v.chunk_count">· {{ v.chunk_count }} chunks</span>
          </div>
          <div class="kb-version-actions">
            <button class="btn btn-sm btn-secondary" @click="handleDownload(v)">下載</button>
            <button
              v-if="v.status === 'approved' && !v.is_current"
              class="btn btn-sm btn-primary"
              @click="handleRestore(v)"
            >還原此版本</button>
          </div>
        </div>
      </div>
      <div class="kb-modal-actions">
        <button class="btn btn-secondary" @click="$emit('close')">關閉</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '@/utils/axios'

const props = defineProps({
  visible: { type: Boolean, default: false },
  doc: { type: Object, default: null },
})

const emit = defineEmits(['close', 'restored'])

const versions = ref([])
const loading = ref(false)

const statusTextMap = {
  pending: '待審核',
  approved: '已通過',
  rejected: '已駁回',
}

watch(() => props.visible, async (val) => {
  if (val && props.doc) {
    versions.value = []
    loading.value = true
    try {
      const res = await api.get(`/knowledge/documents/${props.doc._docId}/versions`)
      versions.value = res.data
    } catch (err) {
      console.error('Failed to fetch versions:', err)
    } finally {
      loading.value = false
    }
  }
})

const handleDownload = async (v) => {
  const docId = props.doc._docId
  try {
    const res = await api.get(`/knowledge/documents/${docId}/versions/${v.id}/download`, {
      responseType: 'blob',
      skipLoading: true,
      transformResponse: [(data) => data],
    })
    const blob = new Blob([res])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fname = props.doc.filename
    const baseName = fname.includes('.') ? fname.substring(0, fname.lastIndexOf('.')) : fname
    a.download = `${baseName}_v${v.version}.${props.doc.file_type}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    alert('下載失敗')
  }
}

const handleRestore = async (v) => {
  if (!confirm(`確定要還原到 v${v.version} 嗎？將建立新版本並需要重新審核。`)) return
  try {
    const docId = props.doc._docId
    await api.post(`/knowledge/documents/${docId}/versions/${v.id}/restore`)
    loading.value = true
    const res = await api.get(`/knowledge/documents/${docId}/versions`)
    versions.value = res.data
    loading.value = false
    emit('restored')
    alert('已還原，新版本待審核')
  } catch (err) {
    const msg = err.response?.data?.detail || err.message
    alert('還原失敗：' + msg)
  }
}

const formatSize = (bytes) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-TW') + ' ' + d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
}

const vecStatusText = (status) => {
  const map = { none: '未處理', processing: '處理中', completed: '已完成', failed: '失敗' }
  return map[status] || status
}
</script>

<style scoped>
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

.kb-modal-wide { width: 640px; max-height: 80vh; overflow-y: auto; }

.kb-modal h3 {
  margin: 0 0 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-900);
  letter-spacing: -0.01em;
}

.kb-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.kb-empty {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--primary-400);
  font-size: 1rem;
}

.kb-version-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.kb-version-item {
  border: 1px solid var(--primary-100);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  transition: all 0.15s ease;
}

.kb-version-item:hover { border-color: var(--primary-200); background: #fafbfc; }

.kb-version-current {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.03);
}

.kb-version-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.kb-version-size {
  font-size: 0.8125rem;
  color: var(--primary-400);
}

.kb-version-meta {
  font-size: 0.8125rem;
  color: var(--primary-400);
  margin-left: auto;
}

.kb-version-reject {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #991b1b;
  background: #fef2f2;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
}

.kb-version-vec {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  color: var(--primary-500);
}

.kb-version-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.kb-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.kb-badge-version { background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #1e40af; border: 1px solid rgba(59, 130, 246, 0.2); }
.kb-badge-restore { background: linear-gradient(135deg, #f5f3ff, #ede9fe); color: #5b21b6; border: 1px solid rgba(139, 92, 246, 0.2); }
.kb-badge-status-pending { background: linear-gradient(135deg, #fffbeb, #fef3c7); color: #92400e; border: 1px solid rgba(245, 158, 11, 0.2); }
.kb-badge-status-approved { background: linear-gradient(135deg, #ecfdf5, #d1fae5); color: #065f46; border: 1px solid rgba(16, 185, 129, 0.2); }
.kb-badge-status-rejected { background: linear-gradient(135deg, #fef2f2, #fee2e2); color: #991b1b; border: 1px solid rgba(239, 68, 68, 0.15); }

.kb-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9375rem;
  font-weight: 500;
}

.kb-status::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.kb-status-completed::before { background: #22c55e; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15); }
.kb-status-none::before { background: #d1d5db; box-shadow: 0 0 0 3px rgba(209, 213, 219, 0.2); }
.kb-status-processing::before { background: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); animation: kb-pulse 2s ease-in-out infinite; }
.kb-status-failed::before { background: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15); }

@keyframes kb-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.btn-sm {
  padding: 0.3rem 0.75rem;
  font-size: 0.8125rem;
  border-radius: 8px;
}

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
</style>
