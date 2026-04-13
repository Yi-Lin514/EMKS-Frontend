<template>
    <!-- 雙面板佈局 -->
    <div class="dept-layout">
      <!-- ========== 左側面板：組織架構樹 ========== -->
      <div class="tree-panel">
        <div class="panel-card">
          <div class="panel-header">
            <span class="panel-title">組織架構</span>
            <button v-if="authStore.hasPermission('department:create')" class="btn btn-primary btn-sm" @click="openModal('add')">
              <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
              新增
            </button>
          </div>
          <div class="panel-body">
            <!-- 空狀態 -->
            <div
              class="empty-state"
              v-if="departmentStore.departments.length === 0 && !departmentStore.loading"
            >
              <div class="empty-state-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"
                  />
                </svg>
              </div>
              <div class="empty-state-title">尚無部門資料</div>
              <div class="empty-state-desc">點擊上方「新增」按鈕建立第一個部門</div>
            </div>

            <!-- 樹狀結構 -->
            <div class="tree-container" v-else>
              <div class="tree-node" v-for="dept in departmentStore.departments" :key="dept.id">
                <div
                  class="tree-node-content"
                  :class="{ selected: selectedDept?.id === dept.id }"
                  @click="selectDepartment(dept)"
                >
                  <span
                    class="tree-toggle"
                    :class="{ expanded: dept.expanded, empty: !dept.children?.length }"
                    @click.stop="toggleNode(dept)"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </span>
                  <span class="tree-icon">
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"
                      />
                    </svg>
                  </span>
                  <span class="tree-label">{{ dept.name }}</span>
                  <span class="tree-count">{{ dept.member_count }}</span>
                </div>
                <!-- 子部門 -->
                <div
                  class="tree-children"
                  :class="{ expanded: dept.expanded }"
                  v-if="dept.children?.length"
                >
                  <div class="tree-node" v-for="child in dept.children" :key="child.id">
                    <div
                      class="tree-node-content"
                      :class="{ selected: selectedDept?.id === child.id }"
                      @click="selectDepartment(child)"
                    >
                      <span class="tree-toggle empty"></span>
                      <span class="tree-icon">
                        <svg viewBox="0 0 24 24">
                          <path
                            d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"
                          />
                        </svg>
                      </span>
                      <span class="tree-label">{{ child.name }}</span>
                      <span class="tree-count">{{ child.member_count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== 右側面板：部門詳情 ========== -->
      <div class="detail-panel">
        <div class="panel-card">
          <!-- 未選擇部門 -->
          <div class="empty-state" v-if="!selectedDept">
            <div class="empty-state-icon">
              <svg viewBox="0 0 24 24">
                <path
                  d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z"
                />
              </svg>
            </div>
            <div class="empty-state-title">選擇部門查看詳情</div>
            <div class="empty-state-desc">從左側組織架構中點選部門</div>
          </div>

          <!-- 已選擇部門 -->
          <template v-else>
            <div class="detail-header">
              <div>
                <h2 class="detail-title">{{ selectedDept.name }}</h2>
                <p class="detail-subtitle">部門代碼：{{ selectedDept.code }}</p>
              </div>
              <div class="detail-actions">
                <button v-if="authStore.hasPermission('department:edit')" class="btn btn-secondary" @click="openModal('edit')">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                    />
                  </svg>
                  編輯
                </button>
                <button v-if="authStore.hasPermission('department:delete')" class="btn btn-danger" @click="confirmDelete">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                    />
                  </svg>
                  刪除
                </button>
              </div>
            </div>

            <div class="detail-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">上層部門</span>
                  <span class="info-value">{{ selectedDept.parent_name || '無（頂層部門）' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">部門主管</span>
                  <span class="info-value">{{ selectedDept.manager_name || '未指派' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">部門層級</span>
                  <span class="info-value">{{ selectedDept.level }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">成員人數</span>
                  <span class="info-value">{{ selectedDept.member_count }} 人</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">部門描述</span>
                  <span class="info-value">{{ selectedDept.description || '無描述' }}</span>
                </div>
              </div>

              <div class="section-header">
                <span class="section-title">部門成員</span>
              </div>
              <div class="member-list">
                <div class="member-item" v-for="member in selectedDept.members" :key="member.id">
                  <div class="member-avatar">{{ member.name.charAt(0) }}</div>
                  <div class="member-info">
                    <div class="member-name">{{ member.name }}</div>
                    <div class="member-role">{{ member.job_title }}</div>
                  </div>
                </div>
                <div class="empty-state-small" v-if="!selectedDept.members?.length">
                  此部門尚無成員
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ==================== 新增/編輯部門 Modal ==================== -->
    <div class="modal-overlay" :class="{ show: showModal }" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ modalMode === 'add' ? '新增部門' : '編輯部門' }}</h2>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveDepartment">
            <div class="form-group">
              <label class="form-label">部門名稱 <span class="required">*</span></label>
              <input
                type="text"
                v-model="formData.name"
                class="form-input"
                placeholder="例如：技術部"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">部門代碼 <span class="required">*</span></label>
              <input
                type="text"
                v-model="formData.code"
                class="form-input"
                placeholder="例如：TECH"
              />
              <span class="form-hint">用於系統識別，建議使用大寫英文</span>
            </div>
            <div class="form-group">
              <label class="form-label">上層部門</label>
              <select v-model="formData.parent_id" class="form-input form-select">
                <option value="">無（設為頂層部門）</option>
                <option v-for="dept in allDepartments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">部門主管</label>
              <select v-model="formData.manager_id" class="form-input form-select">
                <option value="">暫不指派</option>
                <option v-for="user in userStore.users" :key="user.id" :value="user.id">
                  {{ user.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">部門描述</label>
              <textarea
                v-model="formData.description"
                class="form-input form-textarea"
                placeholder="描述此部門的職責與工作內容..."
              ></textarea>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveDepartment">
            <svg viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            儲存
          </button>
        </div>
      </div>
    </div>
</template>

<script setup>
// 1. import 區塊
import { ref, computed, onMounted } from 'vue'
import { useDepartmentStore } from '@/stores/department'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

// 2. Store 實例
const departmentStore = useDepartmentStore()
const userStore = useUserStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

// 3. 本地響應式資料( Modal、Toast、選中的部門 )
const selectedDept = ref(null)

// Modal 相關
const showModal = ref(false)
const modalMode = ref('add')
const formData = ref({
  // 參考後端 DepartmentCreate 的欄位定義
  name: '',
  code: '',
  parent_id: null,
  manager_id: null,
  description: '',
})


// 4. 計算屬性
const allDepartments = computed(() => departmentStore.departments)

// 5. 方法( CRUD 操作、Modal 控制 )
// 選中部門 : 點擊部門節點
const selectDepartment = (dept) => {
  selectedDept.value = dept
}

// 開啟 Modal : 點擊「新增」或「編輯」按鈕
const openModal = (mode) => {
  // 設定模式
  modalMode.value = mode

  if (mode === 'edit' && selectedDept.value) {
    // 編輯模式 : 把選中的部門資料複製到表單
    formData.value = { ...selectedDept.value }
  } else {
    // 新增模式 : 清空表單
    formData.value = {
      name: '',
      code: '',
      parent_id: null,
      manager_id: null,
      description: '',
    }
  }
  showModal.value = true // 顯示 Modal
}

// 關閉 Modal : 點擊「取消」或背景
const closeModal = () => {
  showModal.value = false
}

// 新增或更新部門 : 點擊「儲存」按鈕
const saveDepartment = async () => {
  // 把空字串轉成 null，避免後端 Pydantic 驗證失敗
  const payload = {
    ...formData.value,
    parent_id: formData.value.parent_id || null,
    manager_id: formData.value.manager_id || null,
  }

  try {
    if (modalMode.value === 'add') {
      await departmentStore.createDepartment(payload)
      toastStore.success('部門已新增')
    } else {
      const editId = selectedDept.value.id
      await departmentStore.updateDepartment(editId, payload)
      selectedDept.value = departmentStore.departments.find(d => d.id === editId)
      toastStore.success('部門已更新')
    }
    closeModal()
  } catch (error) {
    const detail = error.response?.data?.detail
    toastStore.error(detail || '儲存失敗，請檢查資料')
  }
}

// 刪除部門 : 點擊「刪除」按鈕
const confirmDelete = async () => {
  // 先確認，再呼叫Store的delete
  if (confirm('確定要刪除此部門嗎?')) {
    await departmentStore.deleteDepartment(selectedDept.value.id)
    toastStore.success('部門已刪除')
    selectedDept.value = null // 清除選中狀態
  }
}

// 6. 生命週期
onMounted(() => {
  departmentStore.fetchDepartments()
  userStore.fetchUsers()
})
</script>

<style>
/* ==================== 雙面板佈局 ==================== */
.dept-layout {
  display: flex;
  gap: 1.5rem;
  height: calc(100vh - var(--header-height) - 4rem);
}

.tree-panel {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.detail-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.panel-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--primary-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.panel-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--primary-800);
}

.panel-body {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
}

/* ==================== 按鈕 ==================== */
.btn {
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  text-decoration: none;
}

.btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}

.btn-secondary {
  background: white;
  color: var(--primary-700);
  border: 1.5px solid var(--primary-200);
}

.btn-secondary:hover {
  background: var(--primary-50);
  border-color: var(--primary-300);
}

.btn-danger {
  background: white;
  color: var(--error-500);
  border: 1.5px solid var(--error-100);
}

.btn-danger:hover {
  background: var(--error-100);
}

/* ==================== 樹狀結構 ==================== */
.tree-container {
  font-size: 0.9375rem;
}
.tree-node {
  margin-bottom: 0.25rem;
}

.tree-node-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tree-node-content:hover {
  background: var(--primary-50);
}
.tree-node-content.selected {
  background: var(--accent-50);
  color: var(--accent-600);
}

.tree-toggle {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tree-toggle svg {
  width: 16px;
  height: 16px;
  fill: var(--primary-400);
  transition: transform 0.15s ease;
}

.tree-toggle.expanded svg {
  transform: rotate(90deg);
}
.tree-toggle.empty {
  visibility: hidden;
}

.tree-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.tree-icon svg {
  width: 20px;
  height: 20px;
  fill: var(--primary-400);
}
.tree-node-content.selected .tree-icon svg {
  fill: var(--accent-500);
}

.tree-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-count {
  font-size: 0.75rem;
  color: var(--primary-400);
  background: var(--primary-100);
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
}

.tree-children {
  margin-left: 1.5rem;
  display: none;
}

.tree-children.expanded {
  display: block;
}

/* ==================== 空狀態 ==================== */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  background: var(--primary-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.empty-state-icon svg {
  width: 32px;
  height: 32px;
  fill: var(--primary-400);
}
.empty-state-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-700);
  margin-bottom: 0.5rem;
}
.empty-state-desc {
  font-size: 0.875rem;
  color: var(--primary-500);
}
.empty-state-small {
  text-align: center;
  padding: 2rem;
  color: var(--primary-400);
  font-size: 0.875rem;
}

/* ==================== 詳情區 ==================== */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid var(--primary-100);
}

.detail-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-900);
  margin-bottom: 0.25rem;
}

.detail-subtitle {
  font-size: 0.875rem;
  color: var(--primary-500);
}
.detail-actions {
  display: flex;
  gap: 0.5rem;
}
.detail-body {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary-500);
}

.info-value {
  font-size: 0.9375rem;
  color: var(--primary-800);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--primary-800);
}

/* ==================== 成員列表 ==================== */
.member-list {
  border: 1px solid var(--primary-100);
  border-radius: 8px;
  overflow: hidden;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--primary-100);
}

.member-item:last-child {
  border-bottom: none;
}

.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-600);
}

.member-info {
  flex: 1;
}
.member-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-800);
}
.member-role {
  font-size: 0.75rem;
  color: var(--primary-500);
}

/* ==================== Modal ==================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.modal-overlay.show {
  opacity: 1;
  visibility: visible;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  transform: translateY(20px);
  transition: transform 0.2s ease;
}

.modal-overlay.show .modal {
  transform: translateY(0);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--primary-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary-900);
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--primary-50);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--primary-100);
}
.modal-close svg {
  width: 18px;
  height: 18px;
  fill: var(--primary-600);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--primary-100);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* ==================== 表單 ==================== */
.form-group {
  margin-bottom: 1.25rem;
}
.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-700);
  margin-bottom: 0.375rem;
}

.form-label .required {
  color: var(--error-500);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  font-family: var(--font-body);
  border: 1.5px solid var(--primary-200);
  border-radius: 8px;
  background: var(--primary-50);
  transition: all 0.15s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-500);
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}
.form-hint {
  font-size: 0.75rem;
  color: var(--primary-500);
  margin-top: 0.375rem;
}

/* ==================== Toast ==================== */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  background: var(--primary-900);
  color: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 300;
}

.toast.show {
  transform: translateY(0);
  opacity: 1;
}
.toast.success {
  background: var(--success-500);
}
.toast.error {
  background: var(--error-500);
}
.toast svg {
  width: 20px;
  height: 20px;
  fill: white;
}

/* ==================== 響應式 ==================== */
@media (max-width: 1024px) {
  .dept-layout {
    flex-direction: column;
  }
  .tree-panel {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
