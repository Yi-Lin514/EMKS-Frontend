<template>
  <!-- 頁面主容器：左右雙面板結構 -->
  <div class="page-container">

    <!-- ==================== 左側面板：品牌介紹區 ==================== -->
    <div class="brand-panel">
      <div class="brand-content">
        <!-- 品牌圖示：鎖頭 SVG -->
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </div>

        <!-- 品牌標題 -->
        <h1 class="brand-title">重設您的密碼</h1>

        <!-- 品牌說明文字 -->
        <p class="brand-description">
          別擔心，這種情況很常見。我們會協助您安全地重設密碼，恢復對帳號的存取權限。
        </p>

        <!-- 步驟說明列表 -->
        <div class="steps-container">
          <div class="step-item">
            <div class="step-number">1</div>
            <span class="step-text">輸入您註冊時使用的公司信箱</span>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <span class="step-text">查收信箱中的密碼重設連結</span>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <span class="step-text">點擊連結設定新密碼即可</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 右側面板：表單區 ==================== -->
    <div class="form-panel">
      <div class="form-container">

        <!-- ========== 狀態一：輸入表單 ========== -->
        <div v-if="!isSuccess">
          <!-- 返回登入連結 -->
          <router-link to="/" class="back-link">
            <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
            返回登入
          </router-link>

          <!-- 表單標題區 -->
          <div class="form-header">
            <h2 class="form-title">忘記密碼</h2>
            <p class="form-description">
              請輸入您的電子郵件地址，我們將發送密碼重設連結給您。
            </p>
          </div>

          <!-- 錯誤訊息區塊 -->
          <div class="error-message" v-if="errorMessage">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- 忘記密碼表單 -->
          <form @submit.prevent="handleSubmit">
            <!-- Email 輸入欄位 -->
            <div class="form-group">
              <label class="form-label" for="email">電子郵件</label>
              <div class="input-wrapper">
                <input
                  type="email"
                  id="email"
                  v-model="email"
                  class="form-input"
                  placeholder="請輸入公司信箱"
                  required
                >
                <svg class="input-icon" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
            </div>

            <!-- 送出按鈕 -->
            <button type="submit" class="submit-btn" :disabled="isLoading">
              <template v-if="isLoading">
                <svg class="spinner" viewBox="0 0 24 24">
                  <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                </svg>
                發送中...
              </template>
              <template v-else>
                <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                發送重設連結
              </template>
            </button>
          </form>

          <!-- 安全提示訊息 -->
          <div class="info-notice">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span>基於安全考量，無論此信箱是否存在於系統中，我們都會顯示相同的成功訊息。請確認您輸入的是正確的公司信箱。</span>
          </div>
        </div>

        <!-- ========== 狀態二：成功訊息 ========== -->
        <div class="success-container" v-else>
          <!-- 成功圖示：綠色打勾 -->
          <div class="success-icon">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
          </div>

          <h2 class="success-title">郵件已發送！</h2>

          <p class="success-message">
            我們已將密碼重設連結發送至<br>
            <span class="success-email">{{ email }}</span><br><br>
            請於 <strong>30 分鐘內</strong>點擊信件中的連結完成密碼重設。
          </p>

          <!-- 返回登入按鈕 -->
          <router-link to="/" class="submit-btn" style="text-decoration: none;">
            返回登入頁面
          </router-link>

          <!-- 重新發送區塊 -->
          <div class="resend-section">
            <p class="resend-text">沒有收到郵件？</p>
            <button class="resend-btn" :disabled="countdown > 0" @click="handleResend">
              <template v-if="countdown > 0">
                重新發送（{{ countdown }}秒）
              </template>
              <template v-else>
                重新發送
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import api from '@/utils/axios'

// ==================== 響應式資料 ====================
const email = ref('')
const isLoading = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')
const countdown = ref(0)

let countdownTimer = null

// ==================== 表單提交處理 ====================
const handleSubmit = async () => {
  if (!email.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    await api.post('/auth/forgot-password', { email: email.value })
    // 切換到成功狀態
    isSuccess.value = true
    startCountdown()
  } catch (error) {
    // 處理錯誤
    errorMessage.value = error.response?.data?.detail || '發送失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

// ==================== 倒數計時功能 ====================
const startCountdown = () => {
  countdown.value = 60

  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

// ==================== 重新發送處理 ====================
const handleResend = async () => {
  if (countdown.value > 0) return

  try {
    await api.post('/auth/forgot-password', { email: email.value })
    startCountdown()
    alert('重設連結已重新發送！')
  } catch (error) {
    alert('發送失敗，請稍後再試')
  }
}

// ==================== 清理計時器 ====================
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style>
/* ==================== 頁面整體佈局 ==================== */
.page-container {
  display: flex;
  min-height: 100vh;
}

/* ==================== 左側面板：品牌介紹區 ==================== */
.brand-panel {
  flex: 1;
  background: linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 50%, var(--primary-700) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

/* 裝飾層 1：放射狀漸層光暈 */
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

/* 裝飾層 2：網格線紋理 */
.brand-panel::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

/* 品牌內容區 */
.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 420px;
  animation: fadeInUp 0.8s ease-out;
}

/* 入場動畫 */
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

/* 品牌圖示 */
.brand-icon {
  width: 100px;
  height: 100px;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  border: 2px solid rgba(59, 130, 246, 0.3);
}

.brand-icon svg {
  width: 48px;
  height: 48px;
  fill: var(--accent-400);
}

/* 品牌標題 */
.brand-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

/* 品牌說明文字 */
.brand-description {
  font-size: 1rem;
  color: var(--primary-300);
  line-height: 1.7;
}

/* ==================== 步驟說明區 ==================== */
.steps-container {
  margin-top: 3rem;
  text-align: left;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.step-number {
  width: 28px;
  height: 28px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent-400);
  flex-shrink: 0;
}

.step-text {
  font-size: 0.9375rem;
  color: var(--primary-200);
  padding-top: 3px;
}

/* ==================== 右側面板：表單區 ==================== */
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
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ==================== 返回連結 ==================== */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--primary-500);
  text-decoration: none;
  margin-bottom: 2rem;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--accent-600);
}

.back-link svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* ==================== 表單標題區 ==================== */
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
  line-height: 1.6;
}

/* ==================== 表單元素樣式 ==================== */
.form-group {
  margin-bottom: 1.5rem;
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

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  padding-left: 2.75rem;
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

.form-input:focus + .input-icon,
.input-wrapper:focus-within .input-icon {
  fill: var(--accent-500);
}

/* ==================== 提交按鈕 ==================== */
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.submit-btn svg {
  width: 18px;
  height: 18px;
  fill: white;
}

/* 旋轉動畫 */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ==================== 成功狀態容器 ==================== */
.success-container {
  text-align: center;
  animation: fadeIn 0.4s ease-out;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: var(--success-50);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  border: 2px solid var(--success-100);
}

.success-icon svg {
  width: 40px;
  height: 40px;
  fill: var(--success-500);
}

.success-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-900);
  margin-bottom: 0.75rem;
}

.success-message {
  color: var(--primary-500);
  font-size: 0.9375rem;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.success-email {
  font-weight: 600;
  color: var(--primary-700);
}

/* ==================== 重新發送區塊 ==================== */
.resend-section {
  padding-top: 1.5rem;
  border-top: 1px solid var(--primary-100);
}

.resend-text {
  font-size: 0.875rem;
  color: var(--primary-500);
  margin-bottom: 0.75rem;
}

.resend-btn {
  background: none;
  border: none;
  color: var(--accent-600);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.resend-btn:hover {
  color: var(--accent-500);
}

.resend-btn:disabled {
  color: var(--primary-400);
  cursor: not-allowed;
  text-decoration: none;
}

/* ==================== 錯誤訊息區塊 ==================== */
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

/* ==================== 提示訊息區塊 ==================== */
.info-notice {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--primary-50);
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.8125rem;
  color: var(--primary-600);
}

.info-notice svg {
  width: 16px;
  height: 16px;
  fill: var(--primary-400);
  flex-shrink: 0;
  margin-top: 2px;
}

/* ==================== 響應式設計 ==================== */
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
}
</style>
