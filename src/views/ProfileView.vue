<template>
    <!-- ==================== 主內容區 ==================== -->
    <!-- 個人資料頭部卡片 -->
    <div class="profile-header">
      <div class="profile-avatar-section">
        <div class="profile-avatar">{{ userInitial }}</div>
        <label class="avatar-upload-btn" for="avatarUpload">
          <svg viewBox="0 0 24 24">
            <path
              d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"
            />
          </svg>
          <input type="file" id="avatarUpload" accept="image/*" style="display: none" />
        </label>
      </div>
      <div class="profile-info">
        <h2 class="profile-name">{{ authStore.userName }}</h2>
        <p class="profile-title">{{ userProfile.job_title }} · {{ userProfile.department_name }}</p>
        <div class="profile-meta">
          <div class="meta-item">
            <svg viewBox="0 0 24 24">
              <path
                d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
              />
            </svg>
            <span>{{ authStore.userEmail }}</span>
          </div>
          <div class="meta-item">
            <svg viewBox="0 0 24 24">
              <path
                d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              />
            </svg>
            <span>{{ userProfile.phone || '未設定' }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 分頁區塊 -->
    <div class="tabs-container">
      <!-- 分頁標籤列 -->
      <div class="tabs-header">
        <button
        class="tab-btn"
        :class="{ active: activeTab === 'info'}"
        @click="activeTab = 'info'"
        >基本資料</button>
        <button
        class="tab-btn"
        :class="{ active: activeTab === 'password'}"
        @click="activeTab = 'password'"
        >變更密碼</button>
        <button
        class="tab-btn"
        :class="{ active: activeTab === 'security'}"
        @click="activeTab = 'security'"
        >安全設定</button>
      </div>

      <!-- ========== 分頁內容：基本資料 ========== -->
      <div class="tab-content" :class="{ active: activeTab === 'info'}" id="tab-info">
        <form id="infoForm" @submit.prevent="updateProfile">
          <div class="form-section">
            <h3 class="form-section-title">個人資訊</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">姓名 <span class="required">*</span></label>
                <input type="text" class="form-input" v-model="userProfile.name" required />
              </div>
              <div class="form-group">
                <label class="form-label">員工編號</label>
                <input type="text" class="form-input" :value="userProfile.employee_id" disabled />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">電子郵件</label>
                <input type="email" class="form-input" :value="userProfile.email" disabled />
                <span class="form-hint">如需變更信箱，請聯繫系統管理員</span>
              </div>
              <div class="form-group">
                <label class="form-label">聯絡電話</label>
                <input type="tel" class="form-input" v-model="userProfile.phone" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="form-section-title">組織資訊</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">所屬部門</label>
                <input type="text" class="form-input" :value="userProfile.department_name || '未指派'" disabled />
                <span class="form-hint">部門異動請聯繫人資部門</span>
              </div>
              <div class="form-group">
                <label class="form-label">職稱</label>
                <input type="text" class="form-input" :value="userProfile.job_title" disabled />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              {{ isLoading ? '儲存中...' : '儲存變更' }}
            </button>
          </div>
        </form>
      </div>

      <!-- ========== 分頁內容：變更密碼 ========== -->
      <div class="tab-content" :class="{ active: activeTab === 'password'}" id="tab-password">
        <form id="passwordForm" @submit.prevent="changePassword">
          <div class="form-section">
            <h3 class="form-section-title">變更密碼</h3>

            <!-- 目前密碼 -->
            <div class="password-current">
              <div class="form-group">
                <label class="form-label">目前密碼 <span class="required">*</span></label>
                <div class="input-wrapper">
                  <input
                    type="password"
                    class="form-input with-icon"
                    id="currentPassword"
                    v-model="passwordForm.current_password"
                    placeholder="請輸入目前的密碼"
                    required
                  />
                  <svg class="input-icon" viewBox="0 0 24 24">
                    <path
                      d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- 新密碼區塊 -->
            <div class="password-new">
              <div class="form-group">
                <label class="form-label">新密碼 <span class="required">*</span></label>
                <div class="input-wrapper">
                  <input
                    type="password"
                    class="form-input with-icon"
                    id="newPassword"
                    v-model="passwordForm.new_password"
                    placeholder="請輸入新密碼"
                    required
                  />
                  <svg class="input-icon" viewBox="0 0 24 24">
                    <path
                      d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                    />
                  </svg>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">確認新密碼 <span class="required">*</span></label>
                <div class="input-wrapper">
                  <input
                    type="password"
                    class="form-input with-icon"
                    id="confirmNewPassword"
                    v-model="passwordForm.confirm_password"
                    placeholder="請再次輸入新密碼"
                    required
                  />
                  <svg class="input-icon" viewBox="0 0 24 24">
                    <path
                      d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                    />
                  </svg>
                </div>
              </div>
              <!-- 密碼要求清單 -->
              <div class="password-requirements">
                <div class="requirement-item" id="req-length">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span>至少 8 個字元</span>
                </div>
                <div class="requirement-item" id="req-upper">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span>包含大寫字母 (A-Z)</span>
                </div>
                <div class="requirement-item" id="req-lower">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span>包含小寫字母 (a-z)</span>
                </div>
                <div class="requirement-item" id="req-number">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span>包含數字 (0-9)</span>
                </div>
                <div class="requirement-item" id="req-history">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span>不可與最近 3 次密碼相同</span>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? '儲存中...' : '儲存變更' }}
              <svg viewBox="0 0 24 24">
                <path
                  d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                />
              </svg>
              更新密碼
            </button>
          </div>
        </form>
      </div>

      <!-- ========== 分頁內容：安全設定 ========== -->
      <div class="tab-content" :class="{ active: activeTab === 'security'}" id="tab-security">
        <div class="form-section">
          <h3 class="form-section-title">登入活動</h3>
          <div class="security-info">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">上次登入時間</label>
                <input
                  type="text"
                  class="form-input"
                  :value="formatDateTime(userProfile.last_login_at)"
                  disabled
                />
              </div>
              <div class="form-group">
                <label class="form-label">上次登入 IP</label>
                <input
                  type="text"
                  class="form-input"
                  :value="userProfile.last_login_ip || '尚無記錄'"
                  disabled
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">密碼最後變更時間</label>
                <input
                  type="text"
                  class="form-input"
                  :value="formatDateTime(userProfile.password_changed_at)"
                  disabled
                />
              </div>
              <div class="form-group">
                <label class="form-label">帳號狀態</label>
                <input
                  type="text"
                  class="form-input"
                  :value="statusLabel[userProfile.status] || userProfile.status"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
// ========== 1. Import 區 ==========
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/axios'

// ========== 2. Store ==========
const authStore = useAuthStore()

// ========== 3. 常數 ==========
// 帳號狀態中英對照
const statusLabel = {
  active: '啟用中',
  inactive: '未啟用',
  suspended: '已停權',
}

// 日期時間格式化（ISO 字串 → 易讀格式）
const formatDateTime = (isoString) => {
  if (!isoString) return '尚無記錄'
  const date = new Date(isoString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ========== 4. 響應式資料 ==========
const isLoading = ref(false)

// 目前選中的分頁
const activeTab = ref('info')

// 基本資料表單
const userProfile = ref({
  name: '',
  email: '',
  employee_id: '',
  phone: '',
  department_id: '',
  department_name: '',
  job_title: '',
  created_at: '',
  avatar_url: '',
})

// 密碼資料表單
const passwordForm = ref({
  current_password:'',
  new_password: '',
  confirm_password: ''
})

// ========== 4. 方法 ==========
// 實作 API 呼叫和資料處理
const fetchProfile = async () => {
  try {
    // 1. 呼叫 GET/users/me 取得資料
    const response = await api.get('/users/me')

    // 2. 把回傳資料存到 userProfile.value
    userProfile.value = response
  } catch (error) {
    // 3. 錯誤處理
    console.error('取得個人資料失敗', error)
  }
}

// 處理基本資料
const updateProfile = async () => {
  isLoading.value = true
  try {
    // 1. 呼叫 PUT/users/me ，傳送給後端要更新的資料
    const response = await api.put('/users/me', {
      // 只傳可以更新的欄位
      name: userProfile.value.name,
      phone: userProfile.value.phone,
      avatar_url: userProfile.value.avatar_url,
    })
    userProfile.value = response
    // 同步更新 authStore（讓側邊欄、儀表板也更新）
    authStore.updateUser(response)
    // 2. 成功傳送的提示
    alert('更新成功')
  } catch (error) {
    // 3. 錯誤處理
    console.error('更新個人資料失敗', error)
  } finally {
    isLoading.value = false
  }
}

// 處理變更密碼
const changePassword = async () => {
  // 1. 前端驗證:確認兩次新密碼相同
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    alert('新密碼與確認密碼不一致')
    return // 結束函式，不呼叫API
  }

  isLoading.value = true
  try {
    // 2. 呼叫 PUT/users/me/password (只送後端需要的欄位)
    await api.put('/users/me/password',{
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.new_password,
    })
    alert('密碼更新成功')

    // 3. 清空表單
    passwordForm.value = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  } catch (error) {
    // 4. 顯示後端回傳的錯誤訊息
    alert(error.response?.data?.detail || '密碼更新失敗')
  } finally {
    isLoading.value = false
  }
}

// ========== 5. 生命週期 ==========
onMounted(() => {
  fetchProfile()
})
// ========== 計算屬性 ==========
const userInitial = computed(() => {
  const name = authStore.userName
  return name ? name.charAt(0) : '?'
})
</script>
<style scoped>
/* ========== 頁面專屬樣式 ========== */
/* ==================== 個人資料頭部卡片 ==================== */
.profile-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* ---------- 頭像區域 ---------- */
.profile-avatar-section {
  position: relative;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-400) 0%, var(--accent-600) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 2.5rem;
  color: white;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* 頭像上傳按鈕 */
.avatar-upload-btn {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--primary-200);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.avatar-upload-btn:hover {
  background: var(--accent-50);
  border-color: var(--accent-500);
}

.avatar-upload-btn svg {
  width: 16px;
  height: 16px;
  fill: var(--primary-600);
}

.avatar-upload-btn:hover svg {
  fill: var(--accent-600);
}

/* ---------- 個人資訊區 ---------- */
.profile-info {
  flex: 1;
}

.profile-name {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-900);
  margin-bottom: 0.25rem;
}

.profile-title {
  font-size: 1rem;
  color: var(--primary-500);
  margin-bottom: 1rem;
}

/* 資訊標籤：Email、電話、加入時間 */
.profile-meta {
  display: flex;
  gap: 2rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--primary-600);
}

.meta-item svg {
  width: 18px;
  height: 18px;
  fill: var(--primary-400);
}

/* ==================== 分頁元件 ==================== */
.tabs-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* ---------- 分頁標籤列 ---------- */
.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--primary-100);
}

/* 分頁按鈕 */
.tab-btn {
  flex: 1;
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

/* 選中的分頁 */
.tab-btn.active {
  color: var(--accent-600);
}

/* 選中分頁的底部指示線 */
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  /* 蓋住 border-bottom */
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-500);
}

/* ---------- 分頁內容區 ---------- */
.tab-content {
  display: none;
  /* 預設隱藏 */
  padding: 2rem;
}

.tab-content.active {
  display: block;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* ==================== 表單樣式 ==================== */
.form-section {
  margin-bottom: 2rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

/* 表單區段標題 */
.form-section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-800);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--primary-100);
}

/* 表單列：使用 Grid 佈局 */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* 兩欄等寬 */
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

/* 單一表單群組 */
.form-group {
  display: flex;
  flex-direction: column;
}

/* 全寬欄位 */
.form-group.full-width {
  grid-column: 1 / -1;
  /* 跨越所有欄位 */
}

/* ---------- 表單標籤 ---------- */
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-700);
  margin-bottom: 0.5rem;
}

.form-label .required {
  color: var(--error-500);
  /* 必填星號：紅色 */
}

/* ---------- 輸入框 ---------- */
.form-input {
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  font-family: var(--font-body);
  border: 1.5px solid var(--primary-200);
  border-radius: 8px;
  background: var(--primary-50);
  color: var(--primary-800);
  transition: all 0.15s ease;
}

.form-input:hover {
  border-color: var(--primary-300);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-500);
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 禁用狀態 */
.form-input:disabled {
  background: var(--primary-100);
  color: var(--primary-500);
  cursor: not-allowed;
}

/* 有圖示的輸入框 */
.form-input.with-icon {
  padding-left: 2.5rem;
}

.input-wrapper {
  position: relative;
}

/* 輸入框內的圖示 */
.input-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  fill: var(--primary-400);
}

/* 表單提示文字 */
.form-hint {
  font-size: 0.75rem;
  color: var(--primary-500);
  margin-top: 0.375rem;
}

/* ==================== 按鈕樣式 ==================== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--primary-100);
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  font-family: var(--font-body);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* 主要按鈕（藍色） */
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

/* 次要按鈕（外框樣式） */
.btn-secondary {
  background: white;
  color: var(--primary-700);
  border: 1.5px solid var(--primary-200);
}

.btn-secondary:hover {
  background: var(--primary-50);
  border-color: var(--primary-300);
}

.btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* ==================== 密碼表單區塊 ==================== */
.password-current {
  margin-bottom: 1.5rem;
}

.password-new {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* ---------- 密碼要求清單 ---------- */
.password-requirements {
  grid-column: 1 / -1;
  /* 跨越兩欄 */
  padding: 1rem;
  background: var(--primary-50);
  border-radius: 8px;
  margin-top: 0.5rem;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--primary-500);
  margin-bottom: 0.375rem;
}

.requirement-item:last-child {
  margin-bottom: 0;
}

.requirement-item svg {
  width: 16px;
  height: 16px;
  fill: var(--primary-300);
}

/* 滿足條件時的樣式 */
.requirement-item.valid {
  color: var(--success-500);
}

.requirement-item.valid svg {
  fill: var(--success-500);
}

/* ==================== Toast 通知 ==================== */
/* 浮動通知訊息，顯示在右下角 */
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
  /* 初始位置：隱藏在下方 */
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 200;
}

/* 顯示狀態 */
.toast.show {
  transform: translateY(0);
  opacity: 1;
}

/* 成功樣式（綠色） */
.toast.success {
  background: var(--success-500);
}

/* 錯誤樣式（紅色） */
.toast.error {
  background: var(--error-500);
}

.toast svg {
  width: 20px;
  height: 20px;
  fill: white;
}

/* ==================== 響應式設計 ==================== */
/* 平板以下：隱藏側邊欄 */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    /* 往左滑出畫面 */
  }

  .sidebar.open {
    transform: translateX(0);
    /* 展開時滑回原位 */
  }

  .main-content {
    margin-left: 0;
    /* 移除左邊距 */
  }

  /* 個人資料卡片改為垂直排列 */
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-meta {
    justify-content: center;
    flex-wrap: wrap;
  }
}

/* 手機 */
@media (max-width: 640px) {
  .page-content {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    /* 單欄顯示 */
  }

  .password-new {
    grid-template-columns: 1fr;
  }

  /* 分頁標籤可橫向滾動 */
  .tabs-header {
    overflow-x: auto;
  }

  .tab-btn {
    white-space: nowrap;
    flex: none;
    padding: 1rem;
  }
}
</style>
