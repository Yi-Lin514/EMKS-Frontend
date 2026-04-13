<template>
    <!-- 分頁標籤 -->
    <div class="tabs-container">
      <div class="tabs-header">
        <div class="tabs-left">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'roles' }"
            @click="activeTab = 'roles'"
          >
            角色列表
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'matrix' }"
            @click="activeTab = 'matrix'"
          >
            權限矩陣
          </button>
        </div>
        <button v-if="authStore.hasPermission('role:create')" class="btn btn-primary" @click="openModal('add')">
          <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
          新增角色
        </button>
      </div>

      <!-- Tab 內容：角色列表 -->
      <div class="tab-content" :class="{ active: activeTab === 'roles' }">
        <div class="role-grid">
          <div
            v-for="role in roles"
            :key="role.code"
            class="role-card"
            :class="{ selected: selectedRole?.code === role.code }"
            @click="selectRole(role)"
          >
            <div class="role-card-header">
              <div class="role-icon" :class="role.type">
                <svg viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
              </div>
              <span class="system-badge" v-if="role.is_system">系統內建</span>
            </div>
            <div class="role-card-title">{{ role.name }}</div>
            <div class="role-card-code">{{ role.code }}</div>
            <div class="role-card-desc">{{ role.description }}</div>
            <div class="role-card-footer">
              <span class="role-user-count"
                ><strong>{{ role.user_count }}</strong> 位使用者</span
              >
              <button v-if="authStore.hasPermission('role:edit')" class="btn btn-secondary btn-sm" @click.stop="openModal('edit', role)">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                  />
                </svg>
                編輯
              </button>
              <!-- 刪除按鈕（只有非系統角色 + 有權限才顯示） -->
              <button
                v-if="!role.is_system && authStore.hasPermission('role:delete')"
                class="btn btn-danger btn-sm"
                @click.stop="deleteRole(role)"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 內容：權限矩陣 -->
      <div class="tab-content" :class="{ active: activeTab === 'matrix' }">
        <div class="matrix-toolbar">
          <div class="matrix-info">
            目前編輯：<strong>{{ selectedRole?.name || '請先選擇角色' }}</strong>
          </div>
          <button class="btn btn-primary btn-sm" :disabled="!selectedRole" @click="savePermissions">
            <svg viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            儲存變更
          </button>
        </div>

        <div class="matrix-container">
          <table class="permission-matrix">
            <thead>
              <tr>
                <th>權限項目</th>
                <th>權限代碼</th>
                <th class="check-cell">啟用</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="group in permissionGroups" :key="group.name">
                <tr class="permission-group">
                  <td colspan="3">{{ group.name }}</td>
                </tr>
                <tr v-for="perm in group.permissions" :key="perm.code">
                  <td class="permission-name">{{ perm.name }}</td>
                  <td class="permission-code">{{ perm.code }}</td>
                  <td class="check-cell">
                    <input
                      type="checkbox"
                      class="matrix-checkbox"
                      :disabled="!selectedRole"
                      v-model="permissionStates[perm.id]"
                    />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" :class="{ show: showModal }" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ modalMode === 'add' ? '新增角色' : '編輯角色' }}</h2>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveRole">
            <div class="form-group">
              <label class="form-label">角色名稱 <span class="required">*</span></label>
              <input
                type="text"
                v-model="formData.name"
                class="form-input"
                placeholder="例如：專案經理"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">角色代碼 <span class="required">*</span></label>
              <input
                type="text"
                v-model="formData.code"
                class="form-input"
                placeholder="例如：project_manager"
              />
              <span class="form-hint">用於系統識別，建議使用小寫英文與底線</span>
            </div>
            <div class="form-group">
              <label class="form-label">角色描述</label>
              <textarea
                v-model="formData.description"
                class="form-input form-textarea"
                placeholder="描述此角色的職責與權限範圍..."
              ></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveRole">
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
// ========== 1. Import 區塊 ==========
// - Vue 的 ref, computed, onMounted, reactive, watch
import { ref, computed, onMounted, reactive } from 'vue'
// - roleStore
import { useRoleStore } from '@/stores/role'
// - authStore（權限控制用）
import { useAuthStore } from '@/stores/auth'
// - toastStore（全域 Toast）
import { useToastStore } from '@/stores/toast'

// ========== 2. Store 實例 ==========
const roleStore = useRoleStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

// ========== 3. 響應式資料 ==========
// - activeTab（分頁切換）
const activeTab = ref('roles')

// - selectedRole（選中的角色）
const selectedRole = ref(null)

// - showModal, modalMode, formData（Modal 相關）
const showModal = ref(false)
const modalMode = ref('add')
const formData = ref({
  name: '',
  code: '',
  description: '',
})

// - permissionStates：key = permission.id, value = true/false（checkbox 用）
const permissionStates = reactive({})

// ========== 4. 計算屬性 ==========
// - roles（從 Store 取角色列表）
const roles = computed(() => roleStore.roles)

// - permissionGroups：將所有權限依 resource 分組，給 template 的 v-for 用
//   結構：[{ name: '使用者管理', resource: 'user', permissions: [...] }, ...]
const permissionGroups = computed(() => {
  const grouped = {}

  // 資源名稱的中文對照
  const resourceLabels = {
    document: '文件管理',
    user: '使用者管理',
    department: '部門管理',
    role: '角色管理',
    ai: 'AI 功能',
    system: '系統管理',
  }

  for (const perm of roleStore.allPermissions) {
    if (!grouped[perm.resource]) {
      grouped[perm.resource] = {
        name: resourceLabels[perm.resource] || perm.resource,
        resource: perm.resource,
        permissions: [],
      }
    }
    grouped[perm.resource].permissions.push(perm)
  }

  return Object.values(grouped)
})

// ========== 5. 方法 ==========
// - selectRole() : 選中角色，並載入該角色的權限
const selectRole = async (role) => {
  selectedRole.value = role
  // 載入該角色目前的權限
  await roleStore.fetchRolePermissions(role.id)
  // 用 store 裡的 rolePermissionIds 初始化 checkbox 狀態
  initPermissionStates()
}

// - initPermissionStates() : 根據角色的權限初始化 checkbox
const initPermissionStates = () => {
  // 先清空所有 checkbox
  for (const key in permissionStates) {
    delete permissionStates[key]
  }
  // 把所有權限設為 false
  for (const perm of roleStore.allPermissions) {
    permissionStates[perm.id] = false
  }
  // 該角色擁有的權限設為 true
  for (const permId of roleStore.rolePermissionIds) {
    permissionStates[permId] = true
  }
}

// - openModal() : 開啟 Modal
const openModal = (mode, role = null) => {
  modalMode.value = mode
  if (mode === 'edit' && role) {
    formData.value = { ...role }
  } else {
    formData.value = { name: '', code: '', description: '' }
  }
  showModal.value = true
}

// - closeModal() : 關閉 Modal
const closeModal = () => {
  showModal.value = false
}

// - saveRole() : 儲存角色
const saveRole = async () => {
  if (modalMode.value === 'add') {
    await roleStore.createRole({
      name: formData.value.name,
      code: formData.value.code,
      description: formData.value.description,
    })
    toastStore.success('角色已新增')
  } else {
    await roleStore.updateRole(formData.value.id, {
      name: formData.value.name,
      code: formData.value.code,
      description: formData.value.description,
    })
    toastStore.success('角色已更新')
  }
  closeModal()
}

// - deleteRole() : 刪除角色
const deleteRole = async (role) => {
  if (!confirm(`確定要刪除「${role.name}」嗎？`)) {
    return
  }
  await roleStore.deleteRole(role.id)
  // 如果刪的是目前選中的角色，清除選取
  if (selectedRole.value?.id === role.id) {
    selectedRole.value = null
  }
  toastStore.success('角色已刪除')
}

// - savePermissions() : 儲存權限矩陣的變更
const savePermissions = async () => {
  if (!selectedRole.value) return

  // 收集所有被勾選的 permission ID
  const checkedIds = Object.entries(permissionStates)
    .filter(([_, checked]) => checked)
    .map(([id]) => Number(id))

  try {
    await roleStore.updateRolePermissions(selectedRole.value.id, checkedIds)
    toastStore.success('權限設定已儲存')
  } catch {
    toastStore.error('權限儲存失敗')
  }
}

// ========== 6. 生命週期 ==========
onMounted(async () => {
  // 同時載入角色列表和所有權限
  await Promise.all([
    roleStore.fetchRoles(),
    roleStore.fetchAllPermissions(),
  ])
})

// ========== 7. 事件監聽 ==========
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && showModal.value) closeModal()
})
</script>

<style>
/* ==================== 頁面標頭 ==================== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-header-info h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-900);
  margin-bottom: 0.25rem;
}

.page-header-info p {
  font-size: 0.9375rem;
  color: var(--primary-500);
}

/* ==================== 按鈕 ==================== */
.btn {
  padding: 0.75rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  font-family: var(--font-body);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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

.btn-sm {
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
}

.btn.btn-danger {
  background: white;
  color: #ef4444;
  border: 1.5px solid #fecaca !important;
}

.btn.btn-danger:hover {
  background: #fef2f2;
  border-color: #fca5a5 !important;
}

/* ==================== 分頁標籤 ==================== */
.tabs-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--primary-100);
  padding: 0 1.5rem;
}

.tabs-left {
  display: flex;
}

.tab-btn {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--primary-500);
  cursor: pointer;
  position: relative;
  transition: color 0.15s ease;
}

.tab-btn:hover {
  color: var(--primary-700);
}
.tab-btn.active {
  color: var(--accent-600);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-500);
}

.tab-content {
  display: none;
  padding: 1.5rem;
}
.tab-content.active {
  display: block;
}

/* ==================== 角色卡片 ==================== */
.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.role-card {
  border: 1.5px solid var(--primary-200);
  border-radius: 10px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.role-card:hover {
  border-color: var(--accent-400);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.role-card.selected {
  border-color: var(--accent-500);
  background: var(--accent-50);
}

.role-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.role-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-icon svg {
  width: 22px;
  height: 22px;
}

.role-icon.admin {
  background: var(--error-100);
}
.role-icon.admin svg {
  fill: var(--error-500);
}
.role-icon.manager {
  background: var(--warning-100);
}
.role-icon.manager svg {
  fill: var(--warning-500);
}
.role-icon.editor {
  background: var(--accent-100);
}
.role-icon.editor svg {
  fill: var(--accent-500);
}
.role-icon.viewer {
  background: var(--success-100);
}
.role-icon.viewer svg {
  fill: var(--success-500);
}
.role-icon.guest {
  background: var(--primary-100);
}
.role-icon.guest svg {
  fill: var(--primary-500);
}

.system-badge {
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: var(--primary-100);
  color: var(--primary-600);
}

.role-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-900);
  margin-bottom: 0.25rem;
}

.role-card-code {
  font-size: 0.75rem;
  color: var(--primary-500);
  font-family: monospace;
  margin-bottom: 0.5rem;
}

.role-card-desc {
  font-size: 0.8125rem;
  color: var(--primary-600);
  line-height: 1.5;
}

.role-card-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--primary-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-user-count {
  font-size: 0.75rem;
  color: var(--primary-500);
}

.role-user-count strong {
  color: var(--primary-700);
}

/* ==================== 權限矩陣 ==================== */
.matrix-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.matrix-info {
  font-size: 0.875rem;
  color: var(--primary-600);
}

.matrix-info strong {
  color: var(--accent-600);
}

.matrix-container {
  overflow-x: auto;
}

.permission-matrix {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.permission-matrix th,
.permission-matrix td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--primary-100);
}

.permission-matrix thead th {
  background: var(--primary-50);
  font-weight: 600;
  color: var(--primary-700);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.permission-matrix tbody tr:hover {
  background: var(--primary-50);
}

.permission-group {
  font-weight: 600;
  color: var(--primary-800);
  background: var(--primary-50);
}

.permission-name {
  padding-left: 2rem !important;
  color: var(--primary-700);
}

.permission-code {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--primary-500);
}

.check-cell {
  text-align: center;
}

.matrix-checkbox {
  width: 20px;
  height: 20px;
  accent-color: var(--accent-500);
  cursor: pointer;
}

.matrix-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.5;
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
  max-width: 500px;
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
@media (max-width: 768px) {
  .role-grid {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
