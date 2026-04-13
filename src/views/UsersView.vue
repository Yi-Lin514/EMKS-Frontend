<template>

    <!-- ========== 統計卡片區 ========== -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon blue">
          <svg viewBox="0 0 24 24">
            <path
              d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"
            />
          </svg>
        </div>
        <div class="stat-info">
          <h3>{{ stats.total }}</h3>
          <p>總使用者數</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <svg viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </div>
        <div class="stat-info">
          <h3>{{ stats.active }}</h3>
          <p>啟用中</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow">
          <svg viewBox="0 0 24 24">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
        </div>
        <div class="stat-info">
          <h3>{{ stats.inactive }}</h3>
          <p>未啟用</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">
          <svg viewBox="0 0 24 24">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"
            />
          </svg>
        </div>
        <div class="stat-info">
          <h3>{{ stats.suspended }}</h3>
          <p>已停權</p>
        </div>
      </div>
    </div>

    <!-- ========== 資料表格區 ========== -->
    <div class="table-container">
      <!-- 工具列：搜尋 + 篩選 -->
      <div class="table-toolbar">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            class="search-input"
            placeholder="搜尋使用者名稱或信箱..."
          />
          <svg class="search-icon" viewBox="0 0 24 24">
            <path
              d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            />
          </svg>
        </div>
        <div class="filter-group">
          <select v-model="filters.department" class="filter-select">
            <option value="">所有部門</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
          <select v-model="filters.status" class="filter-select">
            <option value="">所有狀態</option>
            <option value="active">啟用中</option>
            <option value="inactive">未啟用</option>
            <option value="suspended">已停權</option>
          </select>
          <select v-model="filters.role" class="filter-select">
            <option value="">所有角色</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
          <button v-if="authStore.hasPermission('user:create')" class="btn btn-primary" @click="openModal('add')">
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
            新增使用者
          </button>
        </div>
      </div>

      <!-- 資料表格 -->
      <table class="data-table">
        <thead>
          <tr>
            <th>使用者</th>
            <th>部門</th>
            <th>狀態</th>
            <th>上次登入</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <!-- 資料載入中 -->
          <tr v-if="isLoading">
            <td colspan="5" style="text-align: center; padding: 3rem 1rem">
              <div style="color: var(--primary-400)">
                <svg
                  viewBox="0 0 24 24"
                  style="width: 48px; height: 48px; fill: var(--primary-300); margin-bottom: 1rem"
                >
                  <path
                    d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"
                  />
                </svg>
                <p style="font-size: 0.9375rem; color: var(--primary-600); margin-bottom: 0.5rem">
                  使用者資料載入中...
                </p>
              </div>
            </td>
          </tr>
          <!-- 使用者列表 -->
          <tr v-else v-for="user in users" :key="user.id">
            <td>
              <div class="user-cell">
                <div class="user-cell-avatar">{{ user.name.charAt(0) }}</div>
                <div class="user-cell-info">
                  <div class="user-cell-name">{{ user.name }}</div>
                  <div class="user-cell-email">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td>{{ user.department_name || '-' }}</td>
            <td>
              <span class="status-badge" :class="user.status">{{ statusText[user.status] }}</span>
            </td>
            <td>{{ user.last_login_at || '從未登入' }}</td>
            <td>
              <div class="action-buttons">
                <button v-if="authStore.hasPermission('user:edit')"
                  class="btn btn-secondary btn-icon"
                  title="編輯"
                  @click="openModal('edit', user)"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </button>
                <button v-if="authStore.hasPermission('user:edit')"
                  class="btn btn-secondary btn-icon"
                  title="停用/啟用"
                  @click="toggleUserStatus(user)"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分頁器 -->
      <div class="table-pagination">
        <div class="pagination-info">
          顯示 {{ pagination.from }}-{{ pagination.to }} 筆，共 {{ pagination.total }} 筆
        </div>
        <div class="pagination-controls">
          <button
            class="pagination-btn"
            :disabled="pagination.page === 1"
            @click="changePage(pagination.page - 1)"
          >
            <svg viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <div class="pagination-pages">
            <button
              v-for="p in totalPages"
              :key="p"
              class="page-btn"
              :class="{ active: p === pagination.page }"
              @click="changePage(p)"
            >
              {{ p }}
            </button>
          </div>
          <button
            class="pagination-btn"
            :disabled="pagination.page === totalPages"
            @click="changePage(pagination.page + 1)"
          >
            <svg viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== 新增/編輯使用者 Modal ==================== -->
    <div class="modal-overlay" :class="{ show: showModal }" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ modalMode === 'add' ? '新增使用者' : '編輯使用者' }}</h2>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveUser">
            <div class="form-section-title">基本資料</div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">姓名 <span class="required">*</span></label>
                <input
                  type="text"
                  v-model="formData.name"
                  class="form-input"
                  placeholder="請輸入姓名"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">員工編號</label>
                <input
                  type="text"
                  v-model="formData.employee_id"
                  class="form-input"
                  placeholder="例如：EMP-2024-001"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">電子郵件 <span class="required">*</span></label>
                <input
                  type="email"
                  v-model="formData.email"
                  class="form-input"
                  placeholder="請輸入公司信箱"
                  required
                />
                <span class="form-hint">系統將發送臨時密碼至此信箱</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">聯絡電話</label>
                <input
                  type="tel"
                  v-model="formData.phone"
                  class="form-input"
                  placeholder="例如：0912-345-678"
                />
              </div>
              <div class="form-group">
                <label class="form-label">職稱</label>
                <input
                  type="text"
                  v-model="formData.job_title"
                  class="form-input"
                  placeholder="例如：資深工程師"
                />
              </div>
            </div>

            <div class="form-divider"></div>

            <div class="form-section-title">組織與權限</div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">所屬部門 <span class="required">*</span></label>
                <select v-model="formData.department_id" class="form-input form-select" required>
                  <option value="">請選擇部門</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">指派角色 <span class="required">*</span></label>
                <select v-model="formData.role_id" class="form-input form-select" required>
                  <option value="">請選擇角色</option>
                  <option v-for="role in roles" :key="role.id" :value="role.id">
                    {{ role.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 帳號狀態：新增時隱藏（後端強制 inactive），編輯時才顯示 -->
            <div v-if="modalMode === 'edit'" class="form-row">
              <div class="form-group">
                <label class="form-label">帳號狀態</label>
                <select v-model="formData.status" class="form-input form-select">
                  <option value="active">啟用中</option>
                  <option value="inactive">未啟用</option>
                  <option value="suspended">已停權</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="saveUser">
            <svg viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            儲存
          </button>
        </div>
      </div>
    </div>

    <!-- Toast 通知 -->
</template>

<script setup>
// 1. Import 區塊
// - Vue: ref, computed, onMounted
import { ref, computed, onMounted, watch } from 'vue'
// - useUserStore, useDepartmentStore, useRoleStore
import { useUserStore } from '@/stores/user'
import { useDepartmentStore } from '@/stores/department'
import { useRoleStore } from '@/stores/role'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

// 2. Store 實例
// - userStore, departmentStore, roleStore
const userStore = useUserStore()
const departmentStore = useDepartmentStore()
const roleStore = useRoleStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

// 3. 響應式資料
// - searchQuery, filters（篩選用）
const searchQuery = ref('')
const filters = ref({
  department: '',
  status: '',
  role: '',
})

// - showModal, modalMode, formData（Modal 用）
const showModal = ref(false)
const modalMode = ref('add')
const formData = ref({
  name: '',
  employee_id: '',
  email: '',
  phone: '',
  job_title: '',
  department_id: '',
  role_id: '',
  status: 'active',
})

// - statusText（狀態對照表，原本的就可以）
const statusText = {
  active: '啟用中',
  inactive: '未啟用',
  suspended: '已停權',
}

const isLoading = computed(() => userStore.loading)

// 分頁：直接從 userStore 取得
const pagination = computed(() => {
  const page = userStore.page
  const pageSize = userStore.page_size
  const total = userStore.total
  const from = total > 0 ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(page * pageSize, total)
  return { page, pageSize, total, from, to }
})

// 4. 計算屬性
// - users（從 userStore）
const users = computed(() => userStore.users)
// - departments（從 departmentStore）
const departments = computed(() => departmentStore.departments)
// - roles（從 roleStore）
const roles = computed(() => roleStore.roles)
// - stats（從後端 API 取得全部使用者的統計數字）
const stats = computed(() => userStore.stats)
// - pagination 相關（from, to, totalPages）
const totalPages = computed(
  () => Math.ceil(pagination.value.total / pagination.value.pageSize) || 1,
)

// 5. 方法
// - openModal(), closeModal()
const openModal = (mode, user = null) => {
  // 設定模式 edit or add
  modalMode.value = mode
  // 根據模式處理 formData
  if (mode === 'edit' && user) {
    // 編輯模式 : 把 user 的資料複製到 formData
    formData.value = { ...user }
  } else {
    // 新增模式 : 重置成空白預設值
    formData.value = {
      name: '',
      employee_id: '',
      email: '',
      phone: '',
      job_title: '',
      department_id: '',
      role_id: '',
      status: 'active',
    }
  }
  // 顯示 Modal
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

// - saveUser()（新增/編輯）
const saveUser = async () => {
  try {
    // 判斷是 add or edit
    if (modalMode.value === 'add') {
      // 新增模式 : 呼叫 userStore.createUser()
      await userStore.createUser(formData.value)
      toastStore.success('新增成功')
    } else {
      // 編輯模式 : 呼叫 userStore.updateUser()
      await userStore.updateUser(formData.value.id, formData.value)
      toastStore.success('編輯成功')
    }
    closeModal()
  } catch(error) {
    // 錯誤處理：detail 可能是字串（自訂錯誤）或陣列（Pydantic 422 驗證錯誤）
    const detail = error.response?.data?.detail
    if (Array.isArray(detail)) {
      toastStore.error('資料格式不正確，請檢查輸入')
    } else {
      toastStore.error(detail || '儲存失敗，請檢查資料')
    }
  }
}

// - deleteUser()（刪除）

// - toggleUserStatus()（切換狀態）
const toggleUserStatus = async (user) => {
  // 判斷新狀態
  const newStatus = user.status === 'active' ? 'suspended' : 'active'

  // 呼叫 API 更新狀態
  await userStore.updateUser(user.id, {
    status: newStatus,
  })

  // 顯示 Toast
  toastStore.success(newStatus === 'active' ? '帳號已啟用' : '帳號已停權')
}

// - changePage(): 切換分頁
const changePage = (page) => {
  const { status, department, role } = filters.value
  userStore.fetchUsers(searchQuery.value, status, department, role, page)
}

// 6. 生命週期
// - onMounted: fetchUsers(), fetchDepartments(), fetchRoles()
onMounted(() => {
  userStore.fetchUsers()
  departmentStore.fetchDepartments()
  roleStore.fetchRoles()
})

// 7. 監聽搜尋輸入
// - 當 searchQuery 改變時，重新呼叫 API
watch(
  [searchQuery, () => filters.value.status, () => filters.value.department, () => filters.value.role],
  ([search, status, departmentId, roleId]) => {
    userStore.fetchUsers(search, status, departmentId, roleId)
  }
)

// 8. 事件監聽
// - ESC 關閉 Modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && showModal.value) closeModal()
})
</script>

<style>
/* ==================== 頁面標頭 ==================== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* ==================== 按鈕樣式 ==================== */
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

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
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

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
  border-radius: 6px;
}

.btn-icon svg {
  display: block;
  width: 16px;
  height: 16px;
  min-width: 16px;
  min-height: 16px;
  fill: var(--primary-600);
}

/* ==================== 統計卡片 ==================== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon.blue {
  background: var(--accent-100);
}
.stat-icon.blue svg {
  fill: var(--accent-600);
}
.stat-icon.green {
  background: var(--success-100);
}
.stat-icon.green svg {
  fill: var(--success-500);
}
.stat-icon.yellow {
  background: var(--warning-100);
}
.stat-icon.yellow svg {
  fill: var(--warning-500);
}
.stat-icon.red {
  background: var(--error-100);
}
.stat-icon.red svg {
  fill: var(--error-500);
}

.stat-info h3 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-900);
  line-height: 1.2;
}

.stat-info p {
  font-size: 0.8125rem;
  color: var(--primary-500);
}

/* ==================== 表格容器 ==================== */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-toolbar {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--primary-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 320px;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem;
  padding-left: 2.5rem;
  font-size: 0.875rem;
  font-family: var(--font-body);
  border: 1.5px solid var(--primary-200);
  border-radius: 8px;
  background: var(--primary-50);
  transition: all 0.15s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-500);
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  fill: var(--primary-400);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-select {
  padding: 0.625rem 2rem 0.625rem 0.875rem;
  font-size: 0.875rem;
  font-family: var(--font-body);
  border: 1.5px solid var(--primary-200);
  border-radius: 8px;
  background: white
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Cpath fill='%2364748b' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")
    no-repeat right 0.5rem center;
  cursor: pointer;
  appearance: none;
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent-500);
}

/* ==================== 資料表格 ==================== */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1rem 1.5rem;
  text-align: left;
}

.data-table th {
  background: var(--primary-50);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary-500);
  border-bottom: 1px solid var(--primary-100);
}

.data-table td {
  font-size: 0.9375rem;
  border-bottom: 1px solid var(--primary-100);
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background: var(--primary-50);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

/* ==================== 使用者儲存格 ==================== */
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-cell-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-400) 0%, var(--accent-600) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.875rem;
  color: white;
  flex-shrink: 0;
}

.user-cell-name {
  font-weight: 500;
  color: var(--primary-900);
}

.user-cell-email {
  font-size: 0.8125rem;
  color: var(--primary-500);
}

/* ==================== 徽章 ==================== */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 20px;
}

.status-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.active {
  background: var(--success-50);
  color: var(--success-500);
}
.status-badge.active::before {
  background: var(--success-500);
}

.status-badge.inactive {
  background: var(--primary-100);
  color: var(--primary-500);
}
.status-badge.inactive::before {
  background: var(--primary-400);
}

.status-badge.suspended {
  background: var(--error-50);
  color: var(--error-500);
}
.status-badge.suspended::before {
  background: var(--error-500);
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 4px;
  background: var(--accent-50);
  color: var(--accent-600);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* ==================== 分頁器 ==================== */
.table-pagination {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--primary-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--primary-500);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--primary-200);
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--accent-500);
  background: var(--accent-50);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn svg {
  width: 16px;
  height: 16px;
  fill: var(--primary-600);
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border: none;
  background: none;
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--primary-600);
  cursor: pointer;
  transition: all 0.15s ease;
}

.page-btn:hover {
  background: var(--primary-100);
}
.page-btn.active {
  background: var(--accent-500);
  color: white;
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
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  transform: translateY(20px);
  transition: transform 0.2s ease;
}

.modal-overlay.show .modal {
  transform: translateY(0);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--primary-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-900);
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--primary-50);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.modal-close:hover {
  background: var(--primary-100);
}
.modal-close svg {
  width: 20px;
  height: 20px;
  fill: var(--primary-600);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--primary-100);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* ==================== Modal 表單 ==================== */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-700);
  margin-bottom: 0.375rem;
}

.form-label .required {
  color: var(--error-500);
}

.form-input,
.form-select {
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  font-family: var(--font-body);
  border: 1.5px solid var(--primary-200);
  border-radius: 8px;
  background: var(--primary-50);
  transition: all 0.15s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent-500);
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select {
  cursor: pointer;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--primary-500);
  margin-top: 0.375rem;
}

.form-divider {
  height: 1px;
  background: var(--primary-100);
  margin: 1.25rem 0;
}

.form-section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--primary-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
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
@media (max-width: 1280px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .data-table {
    display: block;
    overflow-x: auto;
  }
}

@media (max-width: 640px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    max-width: none;
  }
  .filter-group {
    flex-wrap: wrap;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .modal {
    margin: 1rem;
  }
}
</style>
