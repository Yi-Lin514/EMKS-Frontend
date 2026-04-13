import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    // Toast 訊息列表
    toasts: [], // success, error, warning, info
  }),
  actions: {
    // 新增 Toast 訊息
    addToast(message, type) {
      // 1. 產生唯一 id
      const id = Date.now().toString()
      // 2. 建立 toast 物件
      const toast = {
        id,
        message,
        type,
      }
      // 3. 加入到 toasts 陣列
      this.toasts.push(toast)
      // 4. 設定自動移除
      setTimeout(() => {
        this.removeToast(id)
      }, 2000) // 2 秒後自動移除
    },
    // 自動移除 Toast 訊息
    removeToast(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
    // 快捷方法 - 讓使用更直覺
    success(message) {
      this.addToast(message, 'success')
    },
    error(message) {
      this.addToast(message, 'error')
    },
    warning(message) {
      this.addToast(message, 'warning')
    },
  },
})
