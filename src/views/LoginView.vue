<template>
  <div class="login-container">
    <!-- 冷啟動 loading overlay — backend 還沒 seed 完之前蓋住整頁 -->
    <div v-if="showOverlay && !isBackendReady" class="startup-overlay">
      <div class="startup-content">
        <div class="startup-spinner"></div>
        <h3 class="startup-title">系統啟動中</h3>
        <p class="startup-message">首次開啟需 30–120 秒初始化知識庫</p>
        <p class="startup-submessage">（系統閒置一段時間後的首次訪問會觸發）</p>
      </div>
    </div>

    <!-- 左側面板：品牌介紹 -->
    <div class="brand-panel">
      <div class="brand-content">
        <div class="brand-logo">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z"
            />
          </svg>
        </div>
        <h1 class="brand-title">企業知識管理系統</h1>
        <p class="brand-subtitle">把公司知識集中管理，讓員工用問的就能找到答案</p>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <span>智慧搜尋 — 用自然語言快速找到所需文件</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <span>AI 問答 — 根據公司文件即時回答您的問題</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <span>安全權限 — 細緻的存取控制保護機密資訊</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右側面板：登入表單 -->
    <div class="form-panel">
      <div class="form-container">
        <div class="form-header">
          <h2 class="form-title">歡迎回來</h2>
          <p class="form-description">請輸入您的帳號資訊以登入系統</p>
        </div>

        <div class="error-message" v-if="errorMessage">
          <svg viewBox="0 0 24 24">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
            />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label" for="email">電子郵件</label>
            <div class="input-wrapper">
              <input
                type="email"
                id="email"
                v-model="email"
                class="form-input"
                :class="{ 'input-error': errors.email }"
                placeholder="請輸入公司信箱"
                @blur="validateEmail"
              />
              <svg class="input-icon" viewBox="0 0 24 24">
                <path
                  d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                />
              </svg>
            </div>
            <span class="field-error" v-if="errors.email">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="password">密碼</label>
            <div class="input-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                class="form-input"
                :class="{ 'input-error': errors.password }"
                placeholder="請輸入密碼"
                @blur="validatePassword"
              />
              <svg class="input-icon" viewBox="0 0 24 24">
                <path
                  d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                />
              </svg>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
                aria-label="顯示密碼"
              >
                <svg viewBox="0 0 24 24">
                  <path
                    v-if="!showPassword"
                    d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                  />
                  <path
                    v-else
                    d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                  />
                </svg>
              </button>
            </div>
            <span class="field-error" v-if="errors.password">{{ errors.password }}</span>
          </div>

          <div class="form-options">
            <label class="checkbox-wrapper">
              <input type="checkbox" class="checkbox-input" id="rememberMe" v-model="rememberMe" />
              <span class="checkbox-label">記住我</span>
            </label>
            <router-link to="/forgot-password" class="forgot-link">忘記密碼？</router-link>
          </div>

          <button type="submit" class="submit-btn">登入系統</button>
        </form>

        <div class="security-notice">
          <svg viewBox="0 0 24 24">
            <path
              d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
            />
          </svg>
          <span>連續登入失敗 5 次後，帳號將被暫時鎖定 15 分鐘。</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/utils/axios'

const router = useRouter()
const authStore = useAuthStore()

// ========== 響應式資料 ==========
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

// 冷啟動 readiness 檢查
const isBackendReady = ref(false)
const showOverlay = ref(false)
let pollTimer = null
let overlayDelayTimer = null

const checkReady = async () => {
  try {
    const res = await api.get('/health/ready', { skipLoading: true, timeout: 3000 })
    if (res.ready) {
      isBackendReady.value = true
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }
    }
  } catch {
    // network / timeout error 都當作還沒 ready，繼續輪詢
  }
}

onMounted(() => {
  checkReady()
  pollTimer = setInterval(checkReady, 3000)
  // 500ms 後仍未 ready 才顯示 overlay（warm backend 不閃）
  overlayDelayTimer = setTimeout(() => {
    if (!isBackendReady.value) showOverlay.value = true
  }, 500)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (overlayDelayTimer) clearTimeout(overlayDelayTimer)
})

// 每個欄位各自的錯誤訊息（空字串 = 沒有錯誤）
const errors = reactive({
  email: '',
  password: '',
})

// ========== 驗證函式 ==========

// Email 驗證：非空 + 格式檢查
const validateEmail = () => {
  if (!email.value.trim()) {
    errors.email = '請輸入電子郵件'
    return false
  }
  // 基本 email 格式：xxx@xxx.xxx
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    errors.email = '請輸入有效的電子郵件格式'
    return false
  }
  errors.email = ''
  return true
}

// 密碼驗證：非空 + 最少 6 字元
const validatePassword = () => {
  if (!password.value) {
    errors.password = '請輸入密碼'
    return false
  }
  if (password.value.length < 6) {
    errors.password = '密碼至少需要 6 個字元'
    return false
  }
  errors.password = ''
  return true
}

// 統一驗證：全部欄位都過才回傳 true
const validateForm = () => {
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()
  return isEmailValid && isPasswordValid
}

// ========== 登入 ==========
const handleLogin = async () => {
  errorMessage.value = ''

  // 前端驗證不通過 → 直接擋住，不送 API
  if (!validateForm()) return

  authStore.setLoading(true)

  try {
    const response = await api.post('/auth/login', {
      email: email.value.trim(),
      password: password.value,
    })
    authStore.setAuth(response)
    router.push('/ai-chat')
  } catch (error) {
    // 優先顯示後端回傳的 detail 訊息（含剩餘次數、鎖定時間等）
    const detail = error.response?.data?.detail

    if (error.response?.status === 423) {
      // 帳號鎖定（登入失敗 5 次）
      errorMessage.value = detail || '帳號已鎖定，請稍後再試'
    } else if (error.response?.status === 403) {
      // 帳號未啟用或已停權
      errorMessage.value = detail || '帳號無法登入，請聯繫管理員'
    } else if (error.response?.status === 401) {
      errorMessage.value = detail || '帳號或密碼錯誤'
    } else if (error.response?.status === 422) {
      errorMessage.value = '請檢查輸入格式'
    } else {
      errorMessage.value = '登入失敗，請稍後再試'
    }
    console.error('登入錯誤:', error)
  } finally {
    authStore.setLoading(false)
  }
}
</script>

<style>
/* ==================== CSS Reset ==================== */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ==================== 主要佈局 ==================== */
.login-container {
  display: flex;
  min-height: 100vh;
}

/* ==================== 冷啟動 Loading Overlay ==================== */
.startup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.startup-content {
  text-align: center;
  max-width: 420px;
  padding: 2rem;
}

.startup-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--primary-200);
  border-top-color: var(--accent-500);
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.startup-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-900);
  margin-bottom: 0.5rem;
}

.startup-message {
  font-size: 0.9375rem;
  color: var(--primary-600);
  margin-bottom: 0.5rem;
}

.startup-submessage {
  font-size: 0.8125rem;
  color: var(--primary-400);
}

/* ==================== 左側面板 ==================== */
.brand-panel {
  flex: 1;
  background: linear-gradient(
    135deg,
    var(--primary-900) 0%,
    var(--primary-800) 50%,
    var(--primary-700) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

.brand-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 40%);
  pointer-events: none;
}

.brand-panel::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 480px;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.brand-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
}

.brand-logo svg {
  width: 44px;
  height: 44px;
  fill: white;
}

.brand-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: 1.125rem;
  color: var(--primary-300);
  margin-bottom: 3rem;
  font-weight: 300;
}

.feature-list {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: var(--primary-200);
  font-size: 0.9375rem;
}

.feature-icon {
  width: 24px;
  height: 24px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.feature-icon svg {
  width: 14px;
  height: 14px;
  fill: var(--accent-400);
}

/* ==================== 右側面板 ==================== */
.form-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  background: white;
}

.form-container {
  width: 100%;
  max-width: 400px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.form-header {
  margin-bottom: 2rem;
}

.form-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-900);
  margin-bottom: 0.5rem;
}

.form-description {
  color: var(--primary-500);
  font-size: 0.9375rem;
}

/* ==================== 表單元素 ==================== */
.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-700);
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-wrapper .form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem !important;
  font-size: 0.9375rem;
  font-family: var(--font-body);
  border: 1.5px solid var(--primary-200);
  border-radius: 10px;
  background: var(--primary-50);
  color: var(--primary-800);
  transition: all 0.2s ease;
}

.form-input::placeholder {
  color: var(--primary-400);
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

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  fill: var(--primary-400);
  transition: fill 0.2s ease;
}

.input-wrapper:focus-within .input-icon {
  fill: var(--accent-500);
}

/* ==================== 密碼切換 ==================== */
.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle svg {
  width: 18px;
  height: 18px;
  fill: var(--primary-400);
  transition: fill 0.2s ease;
}

.password-toggle:hover svg {
  fill: var(--primary-600);
}

/* ==================== 選項區 ==================== */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-500);
  cursor: pointer;
}

.checkbox-label {
  font-size: 0.875rem;
  color: var(--primary-600);
  user-select: none;
}

.forgot-link {
  font-size: 0.875rem;
  color: var(--accent-600);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--accent-500);
  text-decoration: underline;
}

/* ==================== 按鈕 ==================== */
.submit-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: var(--font-display);
  color: white;
  background: linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
}

.submit-btn:active {
  transform: translateY(0);
}

/* ==================== 欄位驗證錯誤 ==================== */
.form-input.input-error {
  border-color: #dc2626;
  background: #fef2f2;
}

.form-input.input-error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.field-error {
  display: block;
  font-size: 0.8125rem;
  color: #dc2626;
  margin-top: 0.375rem;
}

/* ==================== 全域錯誤訊息（後端回傳的） ==================== */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.error-message svg {
  width: 18px;
  height: 18px;
  fill: #dc2626;
  flex-shrink: 0;
}

/* ==================== 安全提示 ==================== */
.security-notice {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--primary-100);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.8125rem;
  color: var(--primary-500);
}

.security-notice svg {
  width: 16px;
  height: 16px;
  fill: var(--primary-400);
  flex-shrink: 0;
  margin-top: 2px;
}

/* ==================== 響應式 ==================== */
@media (max-width: 1024px) {
  .brand-panel {
    display: none;
  }
  .form-panel {
    flex: none;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .form-panel {
    padding: 2rem 1.5rem;
  }
  .form-title {
    font-size: 1.5rem;
  }
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
