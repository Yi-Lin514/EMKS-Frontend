<!-- 共用 Layout：側邊欄 + 頂部導覽列 + 內容區 -->
<template>
  <div class="app-layout">
    <!-- ==================== 側邊欄 ==================== -->
    <aside class="sidebar">
      <!-- 側邊欄頭部：Logo -->
      <div class="sidebar-header">
        <router-link to="/ai-chat" class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18z" />
            </svg>
          </div>
          <span class="logo-text">知識管理系統</span>
        </router-link>
      </div>

      <!-- 導覽選單 -->
      <nav class="nav-menu">
        <!-- ===== AI 知識庫群組 ===== -->
        <div class="nav-group">
          <div class="nav-group-header" @click="toggleGroup('ai-knowledge')">
            <span class="nav-group-title">AI 知識庫</span>
            <svg class="nav-group-arrow" :class="{ open: openGroup === 'ai-knowledge' }" viewBox="0 0 24 24">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
            </svg>
          </div>
          <div class="nav-group-items" v-show="openGroup === 'ai-knowledge'">
            <router-link to="/knowledge" class="nav-item" active-class="active">
              <svg viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              <span>知識庫</span>
            </router-link>
            <router-link to="/ai-chat" class="nav-item" active-class="active">
              <svg viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
              </svg>
              <span>AI 問答</span>
            </router-link>
          </div>
        </div>

        <!-- ===== 系統管理群組（需要管理權限才顯示） ===== -->
        <div class="nav-group" v-if="showAdminGroup">
          <div class="nav-group-header" @click="toggleGroup('admin')">
            <span class="nav-group-title">系統管理</span>
            <svg class="nav-group-arrow" :class="{ open: openGroup === 'admin' }" viewBox="0 0 24 24">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
            </svg>
          </div>
          <div class="nav-group-items" v-show="openGroup === 'admin'">
            <router-link v-if="authStore.hasPermission('user:view')" to="/users" class="nav-item" active-class="active">
              <svg viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              <span>使用者管理</span>
            </router-link>
            <router-link v-if="authStore.hasPermission('department:view')" to="/departments" class="nav-item" active-class="active">
              <svg viewBox="0 0 24 24">
                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
              </svg>
              <span>部門管理</span>
            </router-link>
            <router-link v-if="authStore.hasPermission('role:view')" to="/roles" class="nav-item" active-class="active">
              <svg viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
              </svg>
              <span>角色權限</span>
            </router-link>
            <router-link v-if="authStore.hasPermission('system:view')" to="/login-history" class="nav-item" active-class="active">
              <svg viewBox="0 0 24 24">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
              </svg>
              <span>登入歷史</span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- 側邊欄底部：使用者資訊（點擊進個人資料） -->
      <div class="sidebar-footer">
        <router-link to="/profile" class="user-menu" active-class="">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-info">
            <div class="user-name">{{ authStore.userName }}</div>
            <div class="user-role">{{ authStore.userStatus }}</div>
          </div>
        </router-link>
      </div>
    </aside>

    <!-- ==================== 主內容區 ==================== -->
    <main class="main-content">
      <!-- 頂部導覽列 -->
      <header class="header">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="header-actions">
          <!-- 登出按鈕 -->
          <button class="header-btn" @click="handleLogout">
            <svg viewBox="0 0 24 24">
              <path
                d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
          </button>
        </div>
      </header>

      <!-- 頁面內容（slot 讓子頁面塞內容進來） -->
      <div class="page-content">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// ========== 頁面標題 ==========
const pageTitle = computed(() => route.meta.pageTitle || 'AI 問答')

// ========== 使用者頭像 ==========
const userInitial = computed(() => {
  const name = authStore.userName
  return name ? name.charAt(0) : '?'
})

// ========== 手風琴收折邏輯 ==========

// 目前展開的群組（null = 全部收合，'knowledge' | 'personal' | 'admin'）
const openGroup = ref(null)

// 路由 → 群組的對應表
const routeGroupMap = {
  '/knowledge': 'ai-knowledge',
  '/ai-chat': 'ai-knowledge',
  '/users': 'admin',
  '/departments': 'admin',
  '/roles': 'admin',
  '/login-history': 'admin',
}

// 根據當前路由判斷屬於哪個群組
const getGroupForRoute = (path) => {
  // 精確匹配
  if (routeGroupMap[path]) return routeGroupMap[path]
  // 前綴匹配（處理 /documents/:id/edit 等動態路由）
  for (const [routePath, group] of Object.entries(routeGroupMap)) {
    if (path.startsWith(routePath)) return group
  }
  return null
}

// 切換群組（手風琴：點開的關掉別的，點已開的就收合）
const toggleGroup = (groupName) => {
  openGroup.value = openGroup.value === groupName ? null : groupName
}

// 監聽路由變化 → 自動展開對應群組
watch(() => route.path, (newPath) => {
  const group = getGroupForRoute(newPath)
  if (group) openGroup.value = group
}, { immediate: true })

// 系統管理群組是否顯示（任一管理權限即可）
const showAdminGroup = computed(() => {
  return authStore.hasPermission('user:view') ||
         authStore.hasPermission('department:view') ||
         authStore.hasPermission('role:view') ||
         authStore.hasPermission('system:view')
})

// ========== 登出 ==========
const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<style>
/* ==================== 應用程式整體佈局 ==================== */
.app-layout {
  display: flex;
  min-height: 100vh;
}

/* ==================== 側邊欄 ==================== */
.sidebar {
  width: var(--sidebar-width);
  background: var(--primary-900);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 20px;
  height: 20px;
  fill: white;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: white;
}

/* ==================== 導覽選單 ==================== */
.nav-menu {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

/* 獨立導覽項目（儀表板） */
.nav-item-standalone {
  margin: 0.25rem 0 0.5rem;
}

/* 群組容器 */
.nav-group {
  margin-bottom: 0.25rem;
}

/* 群組標頭（可點擊展開/收合） */
.nav-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1.5rem;
  cursor: pointer;
  transition: background 0.15s ease;
  user-select: none;
}

.nav-group-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* 群組標題文字 */
.nav-group-title {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--primary-400);
}

/* 箭頭圖示（展開時旋轉 180°） */
.nav-group-arrow {
  width: 16px;
  height: 16px;
  fill: var(--primary-500);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.nav-group-arrow.open {
  transform: rotate(180deg);
}

/* 群組子項目容器 */
.nav-group-items {
  padding-bottom: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: var(--primary-300);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: all 0.15s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.active {
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent-400);
  border-left-color: var(--accent-500);
}

.nav-item svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
  flex-shrink: 0;
}

/* ==================== 側邊欄底部 ==================== */
.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
  text-decoration: none;
}

.user-menu:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-400) 0%, var(--accent-600) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.875rem;
  color: white;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: var(--primary-400);
}

/* ==================== 主內容區 ==================== */
.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
}

/* ==================== 頂部導覽列 ==================== */
.header {
  height: var(--header-height);
  background: white;
  border-bottom: 1px solid var(--primary-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 50;
}

.page-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-900);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: var(--primary-50);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  position: relative;
}

.header-btn:hover {
  background: var(--primary-100);
}

.header-btn svg {
  width: 20px;
  height: 20px;
  fill: var(--primary-600);
}

/* ==================== 頁面內容區 ==================== */
.page-content {
  padding: 2rem;
  background-color: var(--primary-50);
  flex: 1;
}

/* ==================== 響應式設計 ==================== */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
