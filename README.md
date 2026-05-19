# EMKS Frontend — 企業內部知識管理系統（前端）

EMKS 的 Vue 3 SPA 前端。系統整體介紹、架構圖、技術決策見 [EMKS-Backend README](https://github.com/Yi-Lin514/EMKS-Backend)。

**Live Demo**: https://emks-frontend.vercel.app

**Demo 影片**: 🎥 [完整功能展示 Demo](https://youtu.be/ziwNRBcmG5Y)

---

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Vue 3.5（Composition API + `<script setup>`） |
| 建置 | Vite 7 |
| 路由 | Vue Router 4（beforeEach 三層守衛） |
| 狀態管理 | Pinia 3（6 stores） |
| HTTP | Axios（401 auto refresh token + subscriber queue） |
| UI | Element Plus + Tailwind CSS |
| 字型 | Plus Jakarta Sans + Noto Sans TC |
| 部署 | Vercel (SPA) / Docker + Nginx（反代 /api/） |

---

## 頁面

| 路徑 | 功能 | 權限 |
|------|------|------|
| `/` | 登入（含冷啟動偵測） | Public |
| `/ai-chat` | AI 問答（SSE 串流 + 對話紀錄 + 引用來源） | 登入 |
| `/knowledge` | 知識庫（上傳 / 審核 / 版本 / 收藏 / 資料夾） | 登入 |
| `/users` | 使用者管理 | user:view |
| `/departments` | 部門管理 | department:view |
| `/roles` | 角色 + 權限矩陣 | role:view |
| `/login-history` | 登入稽核 | system:view |
| `/profile` | 個人資料 + 改密碼 | 登入 |

---

## 前端重點實作

### SSE Streaming（不用 EventSource）

用 `fetch` + `ReadableStream` + `TextDecoder` 自己解析 SSE — 因為 `EventSource` 不能帶 JWT header。逐 token 渲染進對話氣泡。後端有斷線偵測 + partial answer 保存機制。

### Token Auto-Refresh

Axios interceptor 攔 401 → 用 refresh token 換新 access token → subscriber queue 防 thundering herd → 重送所有排隊的 request。Store / 元件層不處理 token 過期。

### 權限控制

- Router `beforeEach`：登入檢查 → 權限檢查 → 已登入導回
- `authStore.hasPermission()`：UI 元素按權限顯示/隱藏
- 雙層保護（前端守衛 + 後端 dependency injection）

---

## 快速啟動

```bash
npm install
npm run dev          # http://localhost:5173
```

後端預設 http://localhost:8000，Vite dev server 已設 proxy。

Production build：

```bash
npm run build        # 產出 dist/
```

Docker 由後端 `docker-compose.yml` 統一起。

---

## License

個人作品集專案，未授權商業使用。
