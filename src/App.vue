<template>
  <!-- 需要登入的頁面：用 AppLayout 包住（側邊欄 + 頂部列 + 內容區） -->
  <AppLayout v-if="route.meta.requiresAuth">
    <RouterView />
  </AppLayout>

  <!-- 公開頁面（登入、忘記密碼等）：不需要 Layout -->
  <RouterView v-else />

  <AppToast />
  <AppLoading />
</template>

<script setup>
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'
import AppLayout from './components/AppLayout.vue'
import AppToast from './components/AppToast.vue'
import AppLoading from './components/AppLoading.vue'

const route = useRoute()
const authStore = useAuthStore()

onMounted(() => {
  // 嘗試從 sessionStorage 恢復登入狀態
  authStore.restoreAuth()
})
</script>


