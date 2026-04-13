<template>
  <!-- Loading 遮罩 (只在 isLoading 時顯示) -->
  <div v-if="loadingStore.isLoading" class="app-loading-overlay">
    <!-- Spinner 轉圈動畫 -->
    <div class="app-loading-spinner"></div>
  </div>
</template>

<script setup>
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()
</script>

<style>
/* 全螢幕遮罩 */
.app-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Spinner 轉圈動畫 */
.app-loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: app-loading-spin 0.8s linear infinite;
}

/* 旋轉動畫 */
@keyframes app-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
