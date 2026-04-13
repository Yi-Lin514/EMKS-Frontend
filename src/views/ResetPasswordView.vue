<template>
  <!-- 頁面主容器 -->
  <div class="page-container">
    <!-- ==================== 左側面板：品牌介紹區 ==================== -->
    <div class="brand-panel">
      <div class="brand-content">
        <!-- 品牌圖示：鑰匙 SVG -->
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
            />
          </svg>
        </div>

        <h1 class="brand-title">{{ isActivation ? '啟用帳號' : '設定新密碼' }}</h1>
        <p class="brand-description">
          請設定一個安全且容易記住的新密碼。建議使用密碼管理器來保管您的密碼。
        </p>

        <!-- 密碼安全提示 -->
        <div class="tips-container">
          <div class="tips-title">
            <svg viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            密碼安全提示
          </div>
          <div class="tip-item">
            <div class="tip-icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <span>避免使用生日、電話等個人資訊</span>
          </div>
          <div class="tip-item">
            <div class="tip-icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <span>不要在多個網站使用相同密碼</span>
          </div>
          <div class="tip-item">
            <div class="tip-icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <span>定期更換密碼以確保安全</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 右側面板：表單區 ==================== -->
    <div class="form-panel">
      <div class="form-container">
        <!-- ========== 狀態一：重設密碼表單 ========== -->
        <div v-if="pageState === 'form'">
          <div class="form-header">
            <h2 class="form-title">{{ isActivation ? '啟用帳號' : '重設密碼' }}</h2>
            <p class="form-description">請為您的帳號設定新密碼</p>
            <!-- 顯示目前操作的帳號 Email -->
            <div class="user-email">
              <svg viewBox="0 0 24 24">
                <path
                  d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                />
              </svg>
              <span>{{ userEmail }}</span>
            </div>
          </div>

          <!-- 重設密碼表單 -->
          <form @submit.prevent="handleSubmit">
            <!-- 新密碼欄位 -->
            <div class="form-group">
              <label class="form-label" for="newPassword">新密碼</label>
              <div class="input-wrapper">
                <input
                  :type="showNewPassword ? 'text' : 'password'"
                  id="newPassword"
                  v-model="newPassword"
                  class="form-input"
                  placeholder="請輸入新密碼"
                  required
                  @input="onPasswordInput"
                />
                <svg class="input-icon" viewBox="0 0 24 24">
                  <path
                    d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                  />
                </svg>
                <button
                  type="button"
                  class="password-toggle"
                  @click="showNewPassword = !showNewPassword"
                >
                  <svg viewBox="0 0 24 24" class="eye-icon" v-if="!showNewPassword">
                    <path
                      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                    />
                  </svg>
                  <svg viewBox="0 0 24 24" class="eye-icon" v-else>
                    <path
                      d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                    />
                  </svg>
                </button>
              </div>

              <!-- 密碼強度指示器 -->
              <div class="password-strength" v-if="newPassword.length > 0">
                <div class="strength-bar">
                  <div class="strength-fill" :class="strengthLevel"></div>
                </div>
                <span class="strength-text" :class="strengthLevel">{{ strengthText }}</span>
              </div>

              <!-- 密碼要求清單 -->
              <div class="requirements">
                <div class="requirement-item" :class="{ valid: checks.length }">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span>至少 8 個字元</span>
                </div>
                <div class="requirement-item" :class="{ valid: checks.upper }">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span>包含大寫字母 (A-Z)</span>
                </div>
                <div class="requirement-item" :class="{ valid: checks.lower }">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span>包含小寫字母 (a-z)</span>
                </div>
                <div class="requirement-item" :class="{ valid: checks.number }">
                  <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span>包含數字 (0-9)</span>
                </div>
              </div>
            </div>

            <!-- 確認密碼欄位 -->
            <div class="form-group">
              <label class="form-label" for="confirmPassword">確認新密碼</label>
              <div class="input-wrapper">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  class="form-input"
                  :class="confirmInputClass"
                  placeholder="請再次輸入新密碼"
                  required
                />
                <svg class="input-icon" viewBox="0 0 24 24">
                  <path
                    d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                  />
                </svg>
                <button
                  type="button"
                  class="password-toggle"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <svg viewBox="0 0 24 24" class="eye-icon" v-if="!showConfirmPassword">
                    <path
                      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                    />
                  </svg>
                  <svg viewBox="0 0 24 24" class="eye-icon" v-else>
                    <path
                      d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                    />
                  </svg>
                </button>
              </div>
              <!-- 密碼不一致錯誤訊息 -->
              <div class="field-error" v-if="showConfirmError">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  />
                </svg>
                <span>兩次輸入的密碼不一致</span>
              </div>
            </div>

            <!-- 提交按鈕 -->
            <button type="submit" class="submit-btn" :disabled="!canSubmit || isLoading">
              <template v-if="isLoading">
                <svg viewBox="0 0 24 24" class="spinner">
                  <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z" />
                </svg>
                處理中...
              </template>
              <template v-else>
                <svg viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                {{ isActivation ? '確認啟用帳號' : '確認重設密碼' }}
              </template>
            </button>
          </form>
        </div>

        <!-- ========== 狀態二：成功訊息 ========== -->
        <div class="success-container" v-else-if="pageState === 'success'">
          <div class="success-icon">
            <svg viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          <h2 class="success-title">{{ isActivation ? '帳號啟用成功！' : '密碼重設成功！' }}</h2>
          <p class="success-message">
            您的密碼已成功更新。<br />
            現在可以使用新密碼登入系統了。
          </p>

          <router-link to="/" class="submit-btn" style="text-decoration: none">
            <svg viewBox="0 0 24 24"><path d="M10 17l5-5-5-5v10z" /></svg>
            前往登入
          </router-link>

          <!-- 自動跳轉倒數 -->
          <p class="countdown-text">{{ redirectCountdown }} 秒後自動跳轉至登入頁面</p>
        </div>

        <!-- ========== 狀態三：連結過期 ========== -->
        <div class="expired-container" v-else-if="pageState === 'expired'">
          <div class="expired-icon">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
          </div>
          <h2 class="expired-title">連結已過期</h2>
          <p class="expired-message">
            此密碼重設連結已失效。<br />
            重設連結的有效時間為 30 分鐘。
          </p>

          <router-link to="/forgot-password" class="secondary-btn"> 重新申請密碼重設 </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/axios'

const route = useRoute()
const router = useRouter()

// 判斷是重設密碼還是啟用帳號
const type = computed(() => route.query.type || 'reset')
const isActivation = computed(() => type.value === 'activation')

// ==================== 響應式資料 ====================
const pageState = ref('form') // 'form' | 'success' | 'expired'
const userEmail = ref('user@company.com')
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const redirectCountdown = ref(5)

let countdownTimer = null

// ==================== 密碼驗證 ====================
const checks = computed(() => ({
  length: newPassword.value.length >= 8,
  upper: /[A-Z]/.test(newPassword.value),
  lower: /[a-z]/.test(newPassword.value),
  number: /[0-9]/.test(newPassword.value),
}))

const allValid = computed(() => Object.values(checks.value).every((v) => v))

const passwordsMatch = computed(
  () => newPassword.value === confirmPassword.value && confirmPassword.value.length > 0,
)

const canSubmit = computed(() => allValid.value && passwordsMatch.value)

// ==================== 密碼強度 ====================
const strengthLevel = computed(() => {
  const passed = Object.values(checks.value).filter((v) => v).length
  if (passed === 4) return 'strong'
  if (passed === 3) return 'good'
  if (passed === 2) return 'fair'
  return 'weak'
})

const strengthText = computed(() => {
  const map = {
    strong: '強度：非常安全',
    good: '強度：安全',
    fair: '強度：一般',
    weak: '強度：弱',
  }
  return map[strengthLevel.value]
})

// ==================== 確認密碼狀態 ====================
const showConfirmError = computed(() => confirmPassword.value.length > 0 && !passwordsMatch.value)

const confirmInputClass = computed(() => {
  if (confirmPassword.value.length === 0) return ''
  return passwordsMatch.value ? 'success' : 'error'
})

// ==================== 事件處理 ====================
const onPasswordInput = () => {
  // 密碼輸入時的額外處理（如有需要）
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  isLoading.value = true

  try {
    const token = route.query.token // 從 URL 取得 token
    // 例如 ?token=abc123 → token = "abc123"

    // 根據 type 決定呼叫哪個 API
    const apiUrl = isActivation.value ? '/auth/activate-account' : '/auth/reset-password'
    await api.post(apiUrl, {
      token,
      new_password: newPassword.value,
    })

    // 切換到成功狀態
    pageState.value = 'success'
    startRedirectCountdown()
  } catch (error) {
    // 如果 token 無效或過期
    if (error.response?.status === 400) {
      pageState.value = 'expired'
    }
  } finally {
    isLoading.value = false
  }
}

const startRedirectCountdown = () => {
  redirectCountdown.value = 5
  countdownTimer = setInterval(() => {
    redirectCountdown.value--
    if (redirectCountdown.value <= 0) {
      clearInterval(countdownTimer)
      router.push('/')
    }
  }, 1000)
}

// ==================== 生命週期 ====================
onMounted(async () => {
  // 1. 檢查 URL 有沒有帶 token（使用者可能手動輸入網址）
  const token = route.query.token
  if (!token) {
    pageState.value = 'expired'
    return
  }

  // 2. 呼叫後端驗證 token，順便拿使用者 email
  try {
    const res = await api.get(`/auth/verify-token?token=${token}&type=${type.value}`)
    userEmail.value = res.email
  } catch {
    pageState.value = 'expired'
  }
})

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
  max-width: 420px;
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

/* 品牌圖示：綠色 */
.brand-icon {
  width: 100px;
  height: 100px;
  background: rgba(34, 197, 94, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  border: 2px solid rgba(34, 197, 94, 0.3);
}

.brand-icon svg {
  width: 48px;
  height: 48px;
  fill: #4ade80;
}

.brand-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.brand-description {
  font-size: 1rem;
  color: var(--primary-300);
  line-height: 1.7;
}

/* ==================== 密碼安全提示區塊 ==================== */
.tips-container {
  margin-top: 3rem;
  text-align: left;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
}

.tips-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-200);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tips-title svg {
  width: 18px;
  height: 18px;
  fill: var(--warning-500);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: var(--primary-300);
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-icon {
  width: 20px;
  height: 20px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-icon svg {
  width: 12px;
  height: 12px;
  fill: var(--accent-400);
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

.user-email {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-50);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--primary-700);
}

.user-email svg {
  width: 16px;
  height: 16px;
  fill: var(--primary-400);
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
  padding-right: 2.75rem;
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

.form-input.error {
  border-color: var(--error-500);
}

.form-input.success {
  border-color: var(--success-500);
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

/* ==================== 密碼顯示/隱藏切換按鈕 ==================== */
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

/* ==================== 密碼強度指示器 ==================== */
.password-strength {
  margin-top: 0.75rem;
}

.strength-bar {
  height: 4px;
  background: var(--primary-100);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  width: 0%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  width: 25%;
  background: var(--error-500);
}
.strength-fill.fair {
  width: 50%;
  background: var(--warning-500);
}
.strength-fill.good {
  width: 75%;
  background: #60a5fa;
}
.strength-fill.strong {
  width: 100%;
  background: var(--success-500);
}

.strength-text {
  font-size: 0.75rem;
  color: var(--primary-500);
}

.strength-text.weak {
  color: var(--error-500);
}
.strength-text.fair {
  color: var(--warning-500);
}
.strength-text.good {
  color: #60a5fa;
}
.strength-text.strong {
  color: var(--success-500);
}

/* ==================== 密碼要求清單 ==================== */
.requirements {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--primary-50);
  border-radius: 8px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--primary-500);
  margin-bottom: 0.5rem;
}

.requirement-item:last-child {
  margin-bottom: 0;
}

.requirement-item svg {
  width: 16px;
  height: 16px;
  fill: var(--primary-300);
  transition: fill 0.2s ease;
}

.requirement-item.valid {
  color: var(--success-500);
}

.requirement-item.valid svg {
  fill: var(--success-500);
}

/* ==================== 欄位錯誤訊息 ==================== */
.field-error {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--error-500);
}

.field-error svg {
  width: 14px;
  height: 14px;
  fill: var(--error-500);
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
  margin-top: 2rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.submit-btn svg {
  width: 18px;
  height: 18px;
  fill: white;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ==================== 成功狀態容器 ==================== */
.success-container {
  text-align: center;
  animation: fadeIn 0.4s ease-out;
}

.success-icon {
  width: 100px;
  height: 100px;
  background: var(--success-50);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  border: 3px solid var(--success-100);
  animation: scaleIn 0.4s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.success-icon svg {
  width: 50px;
  height: 50px;
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

.countdown-text {
  font-size: 0.875rem;
  color: var(--primary-400);
  margin-top: 1rem;
}

/* ==================== 連結過期狀態容器 ==================== */
.expired-container {
  text-align: center;
}

.expired-icon {
  width: 80px;
  height: 80px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  border: 2px solid #fecaca;
}

.expired-icon svg {
  width: 40px;
  height: 40px;
  fill: var(--error-500);
}

.expired-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-900);
  margin-bottom: 0.75rem;
}

.expired-message {
  color: var(--primary-500);
  font-size: 0.9375rem;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--accent-600);
  background: white;
  border: 1.5px solid var(--accent-500);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.secondary-btn:hover {
  background: var(--accent-500);
  color: white;
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
