<template>
  <!-- Toast 容器 (固定在右下角) -->
  <div class="app-toast-container">
    <!-- v-for 渲染每個 toast -->
    <div
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      class="app-toast-item"
      :class="'app-toast-' + toast.type"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>

<style>
/* Toast 容器 - 固定在右下角 */
.app-toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 單個 Toast */
.app-toast-item {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: app-toast-slideIn 0.3s ease;
}

/* 進場動畫 */
@keyframes app-toast-slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 不同類型的顏色 */
.app-toast-success {
  background: #10b981;
}

.app-toast-error {
  background: #ef4444;
}

.app-toast-warning {
  background: #f59e0b;
}
</style>
