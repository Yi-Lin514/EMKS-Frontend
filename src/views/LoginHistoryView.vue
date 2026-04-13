<template>
    <!-- 記錄表格 -->
    <div class="table-container">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>時間</th>
              <th>Email</th>
              <th>狀態</th>
              <th>失敗原因</th>
              <th>IP 位址</th>
              <th>裝置</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="empty-state">載入中...</td>
            </tr>
            <tr v-else-if="records.length === 0">
              <td colspan="6" class="empty-state">尚無登入記錄</td>
            </tr>
            <tr v-for="record in records" :key="record.id">
              <td class="cell-time">{{ formatDateTime(record.created_at) }}</td>
              <td>{{ record.attempted_email }}</td>
              <td>
                <span class="status-badge" :class="record.login_status">
                  {{ record.login_status === 'success' ? '成功' : '失敗' }}
                </span>
              </td>
              <td class="cell-reason">{{ record.failure_reason || '-' }}</td>
              <td class="cell-ip">{{ record.ip_address || '-' }}</td>
              <td>{{ record.device_type || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁控制 -->
      <div class="pagination" v-if="totalPages > 1">
        <button
          class="btn btn-secondary btn-sm"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        >
          上一頁
        </button>
        <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 頁（共 {{ total }} 筆）</span>
        <button
          class="btn btn-secondary btn-sm"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          下一頁
        </button>
      </div>
    </div>
</template>

<script setup>
// ========== 1. Import ==========
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/axios'

// ========== 2. 響應式資料 ==========
const records = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const loading = ref(false)

// ========== 3. 計算屬性 ==========
const totalPages = computed(() => Math.ceil(total.value / pageSize))

// ========== 4. 方法 ==========

// 日期時間格式化
const formatDateTime = (isoString) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 取得登入歷史
const fetchHistory = async (page = 1) => {
  loading.value = true
  try {
    const response = await api.get('/auth/login-history', {
      params: { page, limit: pageSize },
    })
    records.value = response.records
    total.value = response.total
    currentPage.value = response.page
  } catch (error) {
    console.error('取得登入歷史失敗', error)
  } finally {
    loading.value = false
  }
}

// 換頁
const goToPage = (page) => {
  fetchHistory(page)
}

// ========== 5. 生命週期 ==========
onMounted(() => {
  fetchHistory()
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

/* ==================== 表格容器 ==================== */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th,
.data-table td {
  padding: 0.875rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--primary-100);
}

.data-table thead th {
  background: var(--primary-50);
  font-weight: 600;
  color: var(--primary-700);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background: var(--primary-50);
}

/* 欄位寬度提示 */
.cell-time {
  white-space: nowrap;
  color: var(--primary-600);
}

.cell-reason {
  color: var(--primary-500);
  font-size: 0.8125rem;
}

.cell-ip {
  font-family: monospace;
  font-size: 0.8125rem;
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 3rem 1rem !important;
  color: var(--primary-400);
}

/* ==================== 狀態標籤 ==================== */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.success {
  background: var(--success-100);
  color: var(--success-700);
}

.status-badge.failed {
  background: var(--error-100);
  color: var(--error-700);
}

/* ==================== 分頁 ==================== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--primary-100);
}

.page-info {
  font-size: 0.8125rem;
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
}

.btn-secondary {
  background: white;
  color: var(--primary-700);
  border: 1.5px solid var(--primary-200);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--primary-50);
  border-color: var(--primary-300);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
}
</style>
