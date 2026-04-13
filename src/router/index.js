import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 公開頁面（不需登入）
import LoginView from '../views/LoginView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'

// Module B - 會員與權限管理
import ProfileView from '@/views/ProfileView.vue'
import UsersView from '@/views/UsersView.vue'
import DepartmentsView from '@/views/DepartmentsView.vue'
import RolesView from '@/views/RolesView.vue'
import LoginHistoryView from '@/views/LoginHistoryView.vue'

// AI 知識庫
import KnowledgeBaseView from '@/views/KnowledgeBaseView.vue'
import AiChatView from '@/views/AiChatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return false
  },
  routes: [
    // ===== 公開頁面（不需登入）=====
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    },

    // ===== 需要登入的頁面 =====
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true, pageTitle: '個人資料' },
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true, pageTitle: '使用者管理', requiredPermission: 'user:view' },
    },
    {
      path: '/departments',
      name: 'departments',
      component: DepartmentsView,
      meta: { requiresAuth: true, pageTitle: '部門管理', requiredPermission: 'department:view' },
    },
    {
      path: '/roles',
      name: 'roles',
      component: RolesView,
      meta: { requiresAuth: true, pageTitle: '角色權限', requiredPermission: 'role:view' },
    },
    {
      path: '/login-history',
      name: 'login-history',
      component: LoginHistoryView,
      meta: { requiresAuth: true, pageTitle: '登入歷史', requiredPermission: 'system:view' },
    },

    // ===== AI 知識庫 =====
    {
      path: '/knowledge',
      name: 'knowledge',
      component: KnowledgeBaseView,
      meta: { requiresAuth: true, pageTitle: 'AI 知識庫' },
    },
    {
      path: '/ai-chat',
      name: 'ai-chat',
      component: AiChatView,
      meta: { requiresAuth: true, pageTitle: 'AI 問答' },
    },
  ],
})

// 路由守衛：每次切換頁面前都會執行
router.beforeEach((to, from, next) => {
  // 從 sessionStorage 檢查是否有 token
  const isAuthenticated = !!sessionStorage.getItem('access_token')

  // 情況 1：要去需要登入的頁面，但沒登入 → 導向登入頁
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  }
  // 情況 2：已登入但要去登入頁 → 導向 AI 問答
  else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'ai-chat' })
  }
  // 情況 3：需要特定權限，但使用者沒有 → 導向 AI 問答
  else if (to.meta.requiredPermission) {
    const authStore = useAuthStore()
    if (!authStore.hasPermission(to.meta.requiredPermission)) {
      next({ name: 'ai-chat' })
    } else {
      next()
    }
  }
  // 其他情況：放行
  else {
    next()
  }
})

export default router
