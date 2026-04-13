import { defineStore } from 'pinia'
import api from '@/utils/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
  }),

  actions: {
    setAuth(authData) {
      this.user = authData.user
      this.accessToken = authData.access_token
      this.refreshToken = authData.refresh_token
      sessionStorage.setItem('access_token', authData.access_token)
      sessionStorage.setItem('refresh_token', authData.refresh_token)
      sessionStorage.setItem('user', JSON.stringify(authData.user))
    },

    clearAuth() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('refresh_token')
      sessionStorage.removeItem('user')
    },

    async logout() {
      try {
        if (this.refreshToken) {
          await api.post('/auth/logout', {
            refresh_token: this.refreshToken,
          })
        }
      } catch (error) {
        console.error('登出API錯誤:', error)
      } finally {
        this.clearAuth()
      }
    },

    restoreAuth() {
      const token = sessionStorage.getItem('access_token')
      const refresh = sessionStorage.getItem('refresh_token')
      const userStr = sessionStorage.getItem('user')

      if (token) {
        this.accessToken = token
        this.refreshToken = refresh

        if (userStr) {
          try {
            this.user = JSON.parse(userStr)
          } catch (error) {
            console.error('恢復 user 資訊失敗:', error)
            this.clearAuth()
          }
        }
      }
    },

    setLoading(loading) {
      this.isLoading = loading
    },

    updateUser(userData) {
      this.user = { ...this.user, ...userData }
      sessionStorage.setItem('user', JSON.stringify(this.user))
    },
  },

  getters: {
    userName: (state) => state.user?.name || '',
    userEmail: (state) => state.user?.email || '',
    userStatus: (state) => state.user?.status || '',
    isAuthenticated: (state) => !!state.accessToken,
    userPermissions: (state) => state.user?.permissions || [],
    hasPermission: (state) => (permission) => {
      return state.user?.permissions?.includes(permission) || false
    },
  },
})
