import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 測試設定
  test: {
    environment: 'jsdom',  // 模擬瀏覽器環境（有 window、document、sessionStorage）
    globals: true,          // 不用每次 import { describe, it, expect }
  },
  // --- 加入這段 server 設定 ---
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // FastAPI 的網址
        changeOrigin: true,
        // 如果你的 FastAPI Router 已經有 prefix="/api"，則不需要 rewrite
        // 如果後端路由是直接從 /folders 開始，才需要取消下面這行的註解
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
