# EMKS Frontend — 企業內部知識管理系統（前端）

基於 Vue 3 + Vite 的企業知識管理系統前端，對接 [EMKS-Backend](https://github.com/Yi-Lin514/EMKS-Backend)。整體採 SPA 架構，核心頁面是**知識庫（文件管理 + 審核 + 版本控制）** 與 **AI 問答（SSE 串流對話）**。

---

## 核心亮點

### 1. SSE 串流對話（fetch + ReadableStream）
沒用 EventSource — 自己拿 `fetch` + `ReadableStream` 解析後端推來的 SSE 事件，逐 token 渲染進對話氣泡。支援使用者主動中斷（AbortController），中斷時後端會保存部分答案 + `[使用者中斷]` 標記。

### 2. 統一對話入口
拿掉 RAG / Agent 模式切換的 Tab，前端只有一個輸入框。LLM 在後端自己判斷要做檢索還是呼叫工具，前端只管把 token 和 sources 渲染出來。

### 3. 手風琴側邊欄 + 路由守衛
Sidebar 根據當前路由自動展開對應群組（手風琴：展開一個關掉其他）。配合 `beforeEach` 路由守衛做三層檢查：登入狀態 / 權限 / 已登入導回。

### 4. Axios Interceptor（Auto Refresh Token）
統一 HTTP client 攔截 401 → 自動用 refresh token 換新的 access token → 重送原請求。Store / 元件層完全不用處理 token 過期。

### 5. Pinia Stores 分層
- `auth`：token、使用者資訊、權限（`hasPermission()`）
- `toast` / `loading`：全域 UI 狀態
- `user` / `department` / `role`：管理頁面的資源快取

---

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Vue 3.5（Composition API + `<script setup>`） |
| 建置 | Vite 7 |
| 路由 | Vue Router 4 |
| 狀態管理 | Pinia 3 |
| HTTP | Axios（含 interceptor） |
| UI 元件庫 | Element Plus（部分元件） |
| 樣式 | 原生 CSS + CSS Variables（主題） |
| 部署 | Docker + Nginx（反向代理 `/api/` 到後端） |

---

## 架構

```
src/
├── main.js              Vue app 進入點
├── App.vue              Root component（<RouterView> + AppLayout）
├── router/index.js      路由定義 + beforeEach 守衛
├── stores/              Pinia stores（auth / user / toast / loading / ...）
├── utils/axios.js       HTTP client + auto refresh token interceptor
├── components/
│   ├── AppLayout.vue    側邊欄 + 頂部導覽列 + 內容區
│   ├── AppToast.vue     全域 Toast
│   ├── AppLoading.vue   全域 Loading
│   └── knowledge/       知識庫相關子元件（FolderSidebar / VersionHistoryModal）
└── views/               頁面元件
```

**資料流**：View → Store Action → API（axios）→ 更新 Store → 響應式 UI

---

## 主要頁面

| 路徑 | 頁面 | 說明 |
|------|------|------|
| `/` | LoginView | 登入 |
| `/forgot-password` / `/reset-password` | 忘記密碼流程 | 寄信 → 驗證 token → 重設 |
| `/ai-chat` | AiChatView | AI 問答（SSE 串流 + 對話紀錄 + 引用來源） |
| `/knowledge` | KnowledgeBaseView | 知識庫（文件列表 + 上傳 + 審核 + 版本歷史） |
| `/profile` | ProfileView | 個人資料 |
| `/users` / `/departments` / `/roles` | 系統管理 | 會員 / 部門 / 角色權限（需管理權限） |
| `/login-history` | LoginHistoryView | 登入稽核紀錄 |

登入後預設導向 `/ai-chat`（這個專案的主要使用場景）。

---

## 快速啟動

### 本機開發

```bash
# 1. 安裝依賴
npm install

# 2. 啟動 dev server（預設 port 5173）
npm run dev
```

> 後端預設在 `http://localhost:8000`，axios baseURL 已設好。

### Build for Production

```bash
npm run build
```

產出在 `dist/`，可以直接用 nginx / 靜態伺服器 host。

### Docker

後端 `docker-compose.yml` 會一起起起這個前端容器（nginx + 建置好的 dist）。

---

## SSE 串流實作重點

```
AiChatView.vue
    └─ fetch('/ai/agent', { body: JSON.stringify(...) })
        └─ reader = response.body.getReader()
            └─ while 讀 chunk
                ├─ 解析 `data: {...}\n\n` 格式
                ├─ type: "token" → 逐字追加到 message.content
                ├─ type: "sources" → 收集引用來源
                └─ type: "done" → 結束
            └─ AbortController 支援主動中斷
```

---

## 開發歷程（簡版）

| 階段 | 內容 |
|:----:|------|
| Phase 1 | 需求規格 + 既有架構分析 |
| Phase 2 | 後端：文件管理 + RAG Pipeline + AI 問答 |
| Phase 3 | 前端：知識庫 UI + 對話介面 |
| Phase 4 | 業務邏輯重構（資料夾 + 審核 + 收藏 + 版本控制） |
| Phase 5 | 手寫強化：權限過濾 + RAG 評估 + Chunk 策略優化 |
| Phase 6 | Docker 容器化（全服務打包） |
| Phase 7 | LlamaIndex：多輪對話 + SSE 串流 |
| Phase 8 | LangGraph：Agent 自動化 |
| Phase 9 | 統一入口（RAG + Agent 合併） |

---

## License

個人作品集專案，未授權商業使用。
