<template>
  <div class="kb-content">
    <FolderSidebar
      :folder-tree="folderTree"
      :selected-folder-id="selectedFolderId"
      :folders-loading="foldersLoading"
      :is-admin="isAdmin"
      :departments="departments"
      @select-folder="selectedFolderId = $event"
      @folders-changed="handleFoldersChanged"
    />

    <main class="kb-main">
      <div class="kb-toolbar">
        <div class="kb-tabs">
          <button
            v-for="tab in visibleTabs"
            :key="tab.key"
            class="kb-tab"
            :class="{ 'kb-tab-active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
            <span v-if="tab.badge != null && tab.badge > 0" class="kb-tab-badge">{{ tab.badge }}</span>
          </button>
        </div>
        <button class="btn btn-primary" @click="openUploadModal">
          <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" /></svg>
          上傳文件
        </button>
      </div>

      <div class="kb-search-bar">
        <svg class="kb-search-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
        <input
          v-model="searchQuery"
          type="text"
          class="kb-search-input"
          placeholder="搜尋檔案名稱..."
        />
        <button v-if="searchQuery" class="kb-search-clear" @click="searchQuery = ''">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
        </button>
      </div>

      <div class="kb-table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 36px;"></th>
              <th>檔案名稱</th>
              <th>類型</th>
              <th>大小</th>
              <th>版本</th>
              <th>權限</th>
              <th v-if="activeTab === 'my-uploads' || activeTab === 'review'">審核狀態</th>
              <th v-if="activeTab !== 'review'">向量化</th>
              <th>上傳者</th>
              <th>時間</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="tableLoading">
              <td colspan="11" class="kb-empty">載入中...</td>
            </tr>
            <tr v-else-if="displayedDocuments.length === 0">
              <td colspan="11" class="kb-empty">{{ emptyText }}</td>
            </tr>
            <tr v-for="doc in displayedDocuments" :key="doc._rowKey">
              <td>
                <button
                  v-if="activeTab !== 'review'"
                  class="kb-star-btn"
                  :class="{ 'kb-starred': favoriteSet.has(doc._docId) }"
                  @click="toggleFavorite(doc)"
                >
                  <svg viewBox="0 0 24 24">
                    <path v-if="favoriteSet.has(doc._docId)" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    <path v-else d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
                  </svg>
                </button>
              </td>
              <td>{{ doc.filename }}</td>
              <td><span class="kb-badge kb-badge-type">.{{ doc.file_type }}</span></td>
              <td>{{ formatSize(doc.file_size) }}</td>
              <td>
                <span v-if="doc.version || doc.current_version" class="kb-badge kb-badge-version">
                  v{{ doc.version || doc.current_version }}
                </span>
                <span v-else class="kb-badge kb-badge-version">-</span>
              </td>
              <td>
                <span class="kb-badge" :class="doc.permission_level === 'public' ? 'kb-badge-public' : 'kb-badge-dept'">
                  {{ doc.permission_level === 'public' ? '公開' : (doc.department_name || '部門') }}
                </span>
              </td>
              <td v-if="activeTab === 'my-uploads' || activeTab === 'review'">
                <span class="kb-badge" :class="'kb-badge-status-' + doc.status">
                  {{ statusTextMap[doc.status] || doc.status }}
                </span>
              </td>
              <td v-if="activeTab !== 'review'">
                <span class="kb-status" :class="'kb-status-' + doc.vectorization_status">
                  {{ vecStatusText(doc.vectorization_status) }}
                </span>
              </td>
              <td>{{ doc.uploaded_by_name || '-' }}</td>
              <td>{{ formatDate(doc.created_at) }}</td>
              <td>
                <div class="kb-actions">
                  <button v-if="activeTab === 'review'" class="btn-icon kb-btn-approve" title="批准" @click="handleApprove(doc)">
                    <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
                  </button>
                  <button v-if="activeTab === 'review'" class="btn-icon kb-btn-reject" title="駁回" @click="openRejectModal(doc)">
                    <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                  </button>
                  <button v-if="activeTab !== 'review'" class="btn-icon kb-btn-version" title="版本歷史" @click="openVersionHistory(doc)">
                    <svg viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" /></svg>
                  </button>
                  <button v-if="activeTab !== 'review' && doc.current_version" class="btn-icon kb-btn-update" title="更新版本" @click="openUploadVersionModal(doc)">
                    <svg viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z" /></svg>
                  </button>
                  <button v-if="isAdmin && activeTab !== 'review'" class="btn-icon btn-icon-danger" title="刪除" @click="confirmDelete(doc)">
                    <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>

  <div v-if="showUploadModal" class="kb-modal-overlay" @click.self="showUploadModal = false">
    <div class="kb-modal kb-modal-upload">
      <h3>上傳文件</h3>
      <div
        class="kb-dropzone"
        :class="{ 'kb-dropzone-active': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
      >
        <input ref="fileInput" type="file" accept=".txt,.pdf" multiple hidden @change="handleFileSelect" />
        <svg viewBox="0 0 24 24" class="kb-upload-icon"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" /></svg>
        <p v-if="selectedFiles.length === 0">拖曳檔案到此處，或點擊選擇檔案（可多選）</p>
        <p v-else>已選擇 {{ selectedFiles.length }} 個檔案：{{ selectedFiles.map(f => f.name).join('、') }}</p>
        <span class="kb-upload-hint">支援 .txt、.pdf</span>
      </div>
      <div class="kb-form-group">
        <label>資料夾</label>
        <select v-model="uploadFolderId">
          <option :value="null">不選擇（根目錄）</option>
          <option v-for="f in flatFolders" :key="f.id" :value="f.id">
            {{ f.prefix }}{{ f.name }}{{ f.department_name ? ` (${f.department_name})` : '' }}
          </option>
        </select>
      </div>
      <div class="kb-form-group">
        <label>搜尋權限</label>
        <select v-model="uploadPermission">
          <option value="public">公開（所有人可搜尋）</option>
          <option value="department">部門限定</option>
        </select>
      </div>
      <div v-if="uploadPermission === 'department'" class="kb-form-group">
        <label>限定部門</label>
        <select v-model="uploadDepartmentId">
          <option :value="null" disabled>請選擇部門</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
        </select>
      </div>
      <div class="kb-modal-actions">
        <button class="btn btn-secondary" @click="showUploadModal = false">取消</button>
        <button class="btn btn-primary" :disabled="selectedFiles.length === 0 || uploading" @click="handleUpload">
          {{ uploading ? '上傳中...' : '上傳' }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="showUploadVersionModal" class="kb-modal-overlay" @click.self="showUploadVersionModal = false">
    <div class="kb-modal">
      <h3>更新版本 — {{ uploadVersionTarget?.filename }}</h3>
      <div
        class="kb-dropzone"
        :class="{ 'kb-dropzone-active': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleVersionDrop"
        @click="$refs.versionFileInput.click()"
      >
        <input ref="versionFileInput" type="file" :accept="'.' + (uploadVersionTarget?.file_type || '')" hidden @change="handleVersionFileSelect" />
        <svg viewBox="0 0 24 24" class="kb-upload-icon"><path d="M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z" /></svg>
        <p v-if="!versionFile">點擊或拖曳選擇新版本檔案</p>
        <p v-else>{{ versionFile.name }}</p>
        <span class="kb-upload-hint">僅接受 .{{ uploadVersionTarget?.file_type }} 格式</span>
      </div>
      <div class="kb-modal-actions">
        <button class="btn btn-secondary" @click="showUploadVersionModal = false">取消</button>
        <button class="btn btn-primary" :disabled="!versionFile || uploadingVersion" @click="handleUploadVersion">
          {{ uploadingVersion ? '上傳中...' : '上傳新版本' }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="deleteTarget" class="kb-modal-overlay" @click.self="deleteTarget = null">
    <div class="kb-modal">
      <h3>確認刪除</h3>
      <p>確定要刪除「{{ deleteTarget.filename }}」嗎？此操作無法復原。</p>
      <div class="kb-modal-actions">
        <button class="btn btn-secondary" @click="deleteTarget = null">取消</button>
        <button class="btn btn-danger" @click="handleDelete">刪除</button>
      </div>
    </div>
  </div>

  <div v-if="rejectTarget" class="kb-modal-overlay" @click.self="rejectTarget = null">
    <div class="kb-modal">
      <h3>駁回文件</h3>
      <p>駁回「{{ rejectTarget.filename }}」v{{ rejectTarget.version }}，請輸入原因：</p>
      <textarea
        v-model="rejectReason"
        class="kb-textarea"
        rows="3"
        placeholder="請輸入駁回原因..."
      ></textarea>
      <div class="kb-modal-actions">
        <button class="btn btn-secondary" @click="rejectTarget = null">取消</button>
        <button class="btn btn-danger" :disabled="!rejectReason.trim()" @click="handleReject">駁回</button>
      </div>
    </div>
  </div>

  <VersionHistoryModal
    :visible="showVersionHistory"
    :doc="versionHistoryDoc"
    @close="showVersionHistory = false"
    @restored="refreshAll"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/axios'
import FolderSidebar from '@/components/knowledge/FolderSidebar.vue'
import VersionHistoryModal from '@/components/knowledge/VersionHistoryModal.vue'

const authStore = useAuthStore()

const allDocuments = ref([])
const folderTree = ref([])
const favoriteIds = ref([])
const pendingDocs = ref([])
const favoriteDocs = ref([])
const departments = ref([])

const tableLoading = ref(false)
const foldersLoading = ref(false)
const uploading = ref(false)
const isDragging = ref(false)

const activeTab = ref('all')
const selectedFolderId = ref(null)
const searchQuery = ref('')
const deleteTarget = ref(null)
const rejectTarget = ref(null)
const rejectReason = ref('')

const showUploadModal = ref(false)
const selectedFiles = ref([])
const uploadFolderId = ref(null)
const uploadPermission = ref('public')
const uploadDepartmentId = ref(null)

const showUploadVersionModal = ref(false)
const uploadVersionTarget = ref(null)
const versionFile = ref(null)
const uploadingVersion = ref(false)

const showVersionHistory = ref(false)
const versionHistoryDoc = ref(null)

const statusTextMap = {
  pending: '待審核',
  approved: '已通過',
  rejected: '已駁回',
}

const isAdmin = computed(() =>
  authStore.userPermissions.some(p => p.startsWith('user:'))
)

const currentUserId = computed(() => authStore.user?.id)

const favoriteSet = computed(() => new Set(favoriteIds.value))

const pendingCount = computed(() => pendingDocs.value.length)

const visibleTabs = computed(() => {
  const tabs = [
    { key: 'all', label: '所有文件', badge: null },
    { key: 'my-uploads', label: '我的上傳', badge: null },
    { key: 'favorites', label: '我的收藏', badge: null },
  ]
  if (isAdmin.value) {
    tabs.push({ key: 'review', label: '待審核', badge: pendingCount.value })
  }
  return tabs
})

const displayedDocuments = computed(() => {
  let docs = []

  if (activeTab.value === 'all') {
    docs = allDocuments.value.filter(d => d.status === 'approved')
  } else if (activeTab.value === 'my-uploads') {
    docs = allDocuments.value.filter(d => d.uploaded_by === currentUserId.value)
  } else if (activeTab.value === 'favorites') {
    docs = favoriteDocs.value
  } else if (activeTab.value === 'review') {
    return pendingDocs.value
  }

  if (selectedFolderId.value !== null) {
    docs = docs.filter(d => d.folder_id === selectedFolderId.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    docs = docs.filter(d => d.filename.toLowerCase().includes(q))
  }

  return docs
})

const emptyText = computed(() => {
  const map = {
    all: '尚無已通過的文件',
    'my-uploads': '你還沒上傳過文件',
    favorites: '尚無收藏文件',
    review: '沒有待審核的文件',
  }
  return map[activeTab.value] || '無資料'
})

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
  flatten(folderTree.value, 0)
  return result
})

const fetchDocuments = async () => {
  tableLoading.value = true
  try {
    const res = await api.get('/knowledge/documents')
    allDocuments.value = res.data.map(d => ({
      ...d,
      _rowKey: `doc-${d.id}`,
      _docId: d.id,
    }))
  } catch (err) {
    console.error('Failed to fetch documents:', err)
  } finally {
    tableLoading.value = false
  }
}

const fetchFolders = async () => {
  foldersLoading.value = true
  try {
    const res = await api.get('/knowledge/folders/tree')
    folderTree.value = res.data
  } catch (err) {
    console.error('Failed to fetch folders:', err)
  } finally {
    foldersLoading.value = false
  }
}

const fetchFavorites = async () => {
  try {
    const res = await api.get('/knowledge/favorites')
    favoriteDocs.value = res.data.map(fav => ({
      id: fav.document_id,
      _rowKey: `fav-${fav.document_id}`,
      _docId: fav.document_id,
      filename: fav.filename,
      file_type: fav.file_type,
      file_size: fav.file_size,
      folder_id: fav.folder_id,
      permission_level: fav.permission_level,
      vectorization_status: fav.vectorization_status,
      chunk_count: fav.chunk_count,
      uploaded_by_name: fav.uploaded_by_name,
      created_at: fav.created_at,
    }))
    favoriteIds.value = res.data.map(fav => fav.document_id)
  } catch (err) {
    console.error('Failed to fetch favorites:', err)
  }
}

const fetchPending = async () => {
  if (!isAdmin.value) return
  try {
    const res = await api.get('/knowledge/review')
    pendingDocs.value = res.data.map(v => ({
      ...v,
      _rowKey: `ver-${v.id}`,
      _docId: v.document_id,
    }))
  } catch (err) {
    console.error('Failed to fetch pending:', err)
  }
}

const fetchDepartments = async () => {
  try {
    const res = await api.get('/departments')
    departments.value = res.departments || []
  } catch (err) {
    console.error('Failed to fetch departments:', err)
  }
}

const handleFoldersChanged = (deletedFolderId) => {
  if (deletedFolderId && selectedFolderId.value === deletedFolderId) {
    selectedFolderId.value = null
  }
  fetchFolders()
}

const toggleFavorite = async (doc) => {
  try {
    if (favoriteSet.value.has(doc._docId)) {
      await api.delete(`/knowledge/favorites/${doc._docId}`)
    } else {
      await api.post(`/knowledge/favorites/${doc._docId}`)
    }
    await fetchFavorites()
  } catch (err) {
    console.error('Toggle favorite failed:', err)
  }
}

const openUploadModal = () => {
  selectedFiles.value = []
  uploadFolderId.value = null
  uploadPermission.value = 'public'
  uploadDepartmentId.value = null
  showUploadModal.value = true
}

const handleFileSelect = (e) => {
  selectedFiles.value = [...e.target.files]
  e.target.value = ''
}

const handleDrop = (e) => {
  isDragging.value = false
  selectedFiles.value = [...e.dataTransfer.files]
}

const handleUpload = async () => {
  if (selectedFiles.value.length === 0) return
  uploading.value = true
  try {
    const formData = new FormData()
    for (const file of selectedFiles.value) {
      formData.append('files', file)
    }
    formData.append('permission_level', uploadPermission.value)
    if (uploadFolderId.value) {
      formData.append('folder_id', uploadFolderId.value)
    }
    if (uploadPermission.value === 'department' && uploadDepartmentId.value) {
      formData.append('department_id', uploadDepartmentId.value)
    }
    const res = await api.post('/knowledge/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (res.errors && res.errors.length > 0) {
      alert('部分檔案失敗：\n' + res.errors.join('\n'))
    }
    showUploadModal.value = false
    await refreshAll()
  } catch (err) {
    const msg = err.response?.data?.detail || err.message
    alert('上傳失敗：' + msg)
  } finally {
    uploading.value = false
  }
}

const openUploadVersionModal = (doc) => {
  uploadVersionTarget.value = doc
  versionFile.value = null
  showUploadVersionModal.value = true
}

const handleVersionFileSelect = (e) => {
  versionFile.value = e.target.files[0] || null
  e.target.value = ''
}

const handleVersionDrop = (e) => {
  isDragging.value = false
  versionFile.value = e.dataTransfer.files[0] || null
}

const handleUploadVersion = async () => {
  if (!versionFile.value || !uploadVersionTarget.value) return
  uploadingVersion.value = true
  try {
    const formData = new FormData()
    formData.append('file', versionFile.value)
    await api.post(`/knowledge/documents/${uploadVersionTarget.value.id}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    showUploadVersionModal.value = false
    await refreshAll()
    alert('新版本已上傳，等待審核')
  } catch (err) {
    const msg = err.response?.data?.detail || err.message
    alert('上傳失敗：' + msg)
  } finally {
    uploadingVersion.value = false
  }
}

const openVersionHistory = (doc) => {
  versionHistoryDoc.value = doc
  showVersionHistory.value = true
}

const confirmDelete = (doc) => {
  deleteTarget.value = doc
}

const handleDelete = async () => {
  try {
    await api.delete(`/knowledge/documents/${deleteTarget.value._docId}`)
    deleteTarget.value = null
    await refreshAll()
  } catch (err) {
    alert('刪除失敗')
  }
}

const handleApprove = async (doc) => {
  try {
    await api.post(`/knowledge/review/${doc.id}/approve`)
    await refreshAll()
  } catch (err) {
    const msg = err.response?.data?.detail || err.message
    alert('批准失敗：' + msg)
  }
}

const openRejectModal = (doc) => {
  rejectTarget.value = doc
  rejectReason.value = ''
}

const handleReject = async () => {
  try {
    await api.post(`/knowledge/review/${rejectTarget.value.id}/reject`, {
      reason: rejectReason.value.trim(),
    })
    rejectTarget.value = null
    await refreshAll()
  } catch (err) {
    const msg = err.response?.data?.detail || err.message
    alert('駁回失敗：' + msg)
  }
}

const refreshAll = async () => {
  await Promise.all([
    fetchDocuments(),
    fetchFavorites(),
    fetchPending(),
  ])
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

onMounted(async () => {
  await Promise.all([
    fetchDocuments(),
    fetchFolders(),
    fetchFavorites(),
    fetchPending(),
    fetchDepartments(),
  ])
})
</script>

<style scoped>
.kb-content {
  display: flex;
  height: calc(100vh - var(--header-height));
  background: linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%);
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  margin: -2rem;
  width: calc(100% + 4rem);
  height: calc(100vh - var(--header-height) + 4rem);
}

.kb-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: white;
}

.kb-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 0 1.5rem;
  border-bottom: 1px solid #dbeafe;
  background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
  min-height: 56px;
}

.kb-tabs { display: flex; gap: 0; height: 100%; }

.kb-tab {
  padding: 0 1.125rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--primary-400);
  border-bottom: 2px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 56px;
  position: relative;
}

.kb-tab:hover { color: var(--primary-700); background: rgba(0, 0, 0, 0.02); }

.kb-tab-active {
  color: #2563eb;
  border-bottom: 3px solid #2563eb;
  font-weight: 600;
  background: rgba(37, 99, 235, 0.04);
}

.kb-tab-badge {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.125rem 0.45rem;
  border-radius: 100px;
  min-width: 18px;
  text-align: center;
  line-height: 1.3;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.kb-search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  background: #fafbfc;
}

.kb-search-icon {
  width: 18px;
  height: 18px;
  fill: var(--primary-400);
  flex-shrink: 0;
}

.kb-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9375rem;
  color: var(--primary-900);
  outline: none;
}

.kb-search-input::placeholder { color: var(--primary-300); }

.kb-search-clear {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s ease;
}

.kb-search-clear svg { width: 16px; height: 16px; fill: var(--primary-400); }
.kb-search-clear:hover { background: rgba(0, 0, 0, 0.06); }

.kb-table-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.kb-table-scroll::-webkit-scrollbar { width: 6px; }
.kb-table-scroll::-webkit-scrollbar-track { background: transparent; }
.kb-table-scroll::-webkit-scrollbar-thumb { background: var(--primary-200); border-radius: 6px; }

.kb-table-scroll .data-table { margin: 0; border-collapse: separate; border-spacing: 0; }

.kb-table-scroll thead {
  position: sticky;
  top: 0;
  background: linear-gradient(180deg, #eff6ff, #dbeafe);
  z-index: 1;
}

.kb-table-scroll thead th {
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #1d4ed8;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid #bfdbfe;
}

.kb-table-scroll tbody tr { transition: all 0.15s ease; }
.kb-table-scroll tbody tr:nth-child(even) { background: #fafafe; }
.kb-table-scroll tbody tr:hover { background: #eff6ff; }

.kb-table-scroll tbody td {
  padding: 0.875rem 1rem;
  font-size: 0.9375rem;
  color: var(--primary-700);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  vertical-align: middle;
}

.kb-star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.kb-star-btn:hover { background: rgba(245, 158, 11, 0.1); transform: scale(1.15); }

.kb-star-btn svg {
  width: 18px;
  height: 18px;
  fill: var(--primary-300);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.kb-star-btn:hover svg { fill: #f59e0b; }
.kb-starred svg { fill: #f59e0b; filter: drop-shadow(0 1px 2px rgba(245, 158, 11, 0.4)); }

.kb-actions { display: flex; gap: 0.375rem; }

.kb-btn-approve { color: #22c55e; }
.kb-btn-approve:hover { background: rgba(34, 197, 94, 0.1); transform: scale(1.05); }

.kb-btn-reject { color: #ef4444; }
.kb-btn-reject:hover { background: rgba(239, 68, 68, 0.1); transform: scale(1.05); }

.kb-btn-version { color: #3b82f6; }
.kb-btn-version:hover { background: rgba(59, 130, 246, 0.1); transform: scale(1.05); }

.kb-btn-update { color: #3b82f6; }
.kb-btn-update:hover { background: rgba(59, 130, 246, 0.1); transform: scale(1.05); }

.kb-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.kb-badge-type { background: var(--primary-50); color: var(--primary-500); border: 1px solid var(--primary-100); }
.kb-badge-public { background: linear-gradient(135deg, #ecfdf5, #d1fae5); color: #065f46; border: 1px solid rgba(16, 185, 129, 0.2); }
.kb-badge-dept { background: linear-gradient(135deg, #fffbeb, #fef3c7); color: #92400e; border: 1px solid rgba(245, 158, 11, 0.2); }

.kb-badge-version { background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #1e40af; border: 1px solid rgba(59, 130, 246, 0.2); }

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

.kb-empty {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--primary-400);
  font-size: 1rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
}

.btn-icon svg { width: 18px; height: 18px; fill: currentColor; }

.btn-icon-danger { color: var(--primary-400); }
.btn-icon-danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; transform: scale(1.05); }

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

.kb-modal-upload { width: 520px; }

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

.kb-dropzone {
  border: 2px dashed var(--primary-200);
  border-radius: 14px;
  padding: 2.5rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafbfc;
  margin-bottom: 1.25rem;
}

.kb-dropzone:hover { border-color: #60a5fa; background: rgba(59, 130, 246, 0.04); transform: translateY(-1px); }
.kb-dropzone-active { border-color: #2563eb; background: rgba(59, 130, 246, 0.06); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

.kb-upload-icon {
  width: 44px;
  height: 44px;
  fill: var(--primary-300);
  margin-bottom: 0.75rem;
  transition: all 0.25s ease;
}

.kb-dropzone:hover .kb-upload-icon { fill: #60a5fa; transform: translateY(-2px); }

.kb-dropzone p { font-size: 1rem; color: var(--primary-600); margin: 0 0 0.375rem; font-weight: 500; }
.kb-upload-hint { font-size: 0.875rem; color: var(--primary-400); }

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

.kb-textarea {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--primary-200);
  border-radius: 10px;
  font-size: 0.9375rem;
  color: var(--primary-900);
  resize: vertical;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}

.kb-textarea:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

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
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
</style>
