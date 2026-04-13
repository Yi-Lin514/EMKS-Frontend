import axios from 'axios'
import { useLoadingStore } from '@/stores/loading'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 用'鎖'處理 API 同時呼叫的問題
let isRefreshing = false
let refreshSubscribers = []
// 通知所有等待的請求 : 新 token 來了
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken))
  refreshSubscribers = [] // 清空等待隊列
}

// Request Interceptor: 自動帶 token
api.interceptors.request.use(
  (config) => {
    if (!config.skipLoading) {
      const loadingStore = useLoadingStore()
      loadingStore.startLoading()
    }
    const token = sessionStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response Interceptor: 處理回應
api.interceptors.response.use(
  (response) => {
    if (!response.config.skipLoading) {
      const loadingStore = useLoadingStore()
      loadingStore.stopLoading()
    }
    return response.data
  },
  async (error) => {
    if (!error.config?.skipLoading) {
      const loadingStore = useLoadingStore()
      loadingStore.stopLoading()
    }
    const originalRequest = error.config // 保存原本的請求設定

    // 只處理 401 錯誤
    if (error.response?.status === 401) {
      // 情況 1：我是第一個收到 401 的（負責刷新）
      if (!isRefreshing) {
        const refreshToken = sessionStorage.getItem('refresh_token')
        //沒有 refresh_token > 未登入過 > 不需要刷新
        if (!refreshToken) {
          return Promise.reject(error)
        }

        isRefreshing = true // 上鎖

        try {
          // 呼叫刷新 API（用原生 axios 避免被 interceptor 攔截）
          const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/refresh`, {
            refresh_token: refreshToken,
          })

          // 更新 sessionStorage
          const { access_token, refresh_token } = response.data
          sessionStorage.setItem('access_token', access_token)
          sessionStorage.setItem('refresh_token', refresh_token)

          // 通知其他等待的請求
          onRefreshed(access_token)

          // 重發原本失敗的請求
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        } catch (refreshError) {
          // 刷新失敗 → 登出
          sessionStorage.removeItem('access_token')
          sessionStorage.removeItem('refresh_token')
          sessionStorage.removeItem('user')
          window.location.href = '/' // 或其他處理方式
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false // 解鎖
        }
      }
      // 情況 2：別人正在刷新，我加入等待佇列
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken) => {
          // 收到新 token 後，重發原本的請求
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          resolve(api(originalRequest))
        })
      })
    }

    return Promise.reject(error)
  },
)

export default api
