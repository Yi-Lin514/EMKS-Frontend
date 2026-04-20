<template>
  <div class="chat-layout">
    <div class="chat-sidebar">
      <div class="chat-sidebar-header">
        <button class="new-chat-btn" @click="startNewChat">
          <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          新對話
        </button>
      </div>
      <div class="chat-history">
        <div v-if="conversations.length === 0" class="history-empty">
          尚無對話紀錄
        </div>
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="history-item"
          :class="{ 'history-item-active': conv.id === conversationId }"
          @click="loadConversation(conv.id)"
        >
          <div class="history-item-title">{{ conv.title }}</div>
          <div class="history-item-meta">
            <span v-html="formatDate(conv.updated_at)"></span>
            <button class="history-delete-btn" @click.stop="deleteConversation(conv.id)">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-main">
      <div class="messages-container" ref="messagesRef">
        <div class="messages-wrapper">
          <div v-if="messages.length === 0" class="welcome-screen">
            <div class="welcome-icon">
              <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
            </div>
            <h2 class="welcome-title">有什麼我可以幫您的？</h2>
            <p class="welcome-desc">我可以根據公司知識庫回答問題、查詢文件狀態、統計分析等</p>
          </div>

          <div v-else id="messagesArea">
            <template v-for="(msg, idx) in messages" :key="idx">
              <div class="message" :class="msg.role === 'user' ? 'message-user' : 'message-ai'">
                <div v-if="msg.role === 'assistant'" class="message-avatar">
                  <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                </div>
                <div :class="msg.role === 'assistant' ? 'message-content' : ''">
                  <div class="message-bubble">
                    <div v-if="loading && msg.content === '' && idx === messages.length - 1" class="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                    <div v-else class="message-text" v-html="renderMarkdown(msg.content)"></div>
                    <div v-if="msg.sources && msg.sources.length" class="message-sources">
                      <div class="sources-label">參考來源</div>
                      <div
                        v-for="(src, sIdx) in filterSources(msg.sources)"
                        :key="sIdx"
                        class="source-item"
                        :class="{ 'source-item-clickable': src.current_version_id }"
                        :title="src.current_version_id ? '點擊下載' : ''"
                        @click="src.current_version_id && downloadSource(src)"
                      >
                        <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
                        {{ src.document_title }}
                        <span class="source-score">{{ (src.relevance_score * 100).toFixed(0) }}%</span>
                        <svg v-if="src.current_version_id" class="source-download-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                      </div>
                    </div>
                  </div>
                  <div v-if="msg.role === 'assistant'" class="message-actions">
                    <button class="action-btn" @click="copyMessage(msg.content)">
                      <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                      複製
                    </button>
                  </div>
                </div>
              </div>
            </template>

          </div>
        </div>
      </div>

      <div class="input-container">
        <div class="input-wrapper">
          <div class="input-box" :class="{ 'input-box-focus': inputFocused }" @click="chatInputRef?.focus()">
            <textarea
              ref="chatInputRef"
              class="chat-input"
              v-model="question"
              placeholder="輸入您的問題..."
              rows="1"
              @keydown="handleKeydown"
              @input="autoResize"
              @focus="inputFocused = true"
              @blur="inputFocused = false"
              :disabled="loading"
            ></textarea>
            <button class="send-btn" @click="sendMessage" :disabled="loading || !question.trim()">
              <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <div class="input-hint">AI 回答基於公司知識庫，請以正式文件為準</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import api from '@/utils/axios'
import { useAuthStore } from '@/stores/auth'

const messages = ref([])
const question = ref('')
const loading = ref(false)
const conversationId = ref(null)
const conversations = ref([])
const messagesRef = ref(null)
const chatInputRef = ref(null)
const inputFocused = ref(false)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

const autoResize = () => {
  const el = chatInputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const sendMessage = async () => {
  const q = question.value.trim()
  if (!q || loading.value) return

  messages.value.push({ role: 'user', content: q })
  question.value = ''
  loading.value = true

  await nextTick()
  if (chatInputRef.value) {
    chatInputRef.value.style.height = 'auto'
  }
  scrollToBottom()

  const aiMessage = reactive({ role: 'assistant', content: '', sources: [] })
  messages.value.push(aiMessage)

  try {
    // 統一走 Agent SSE 串流
    const authStore = useAuthStore()
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    const response = await fetch(`${baseURL}/ai/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.accessToken}`,
      },
      body: JSON.stringify({
        question: q,
        conversation_id: conversationId.value,
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        const body = await response.json().catch(() => ({}))
        aiMessage.content = body.detail || '請求過於頻繁，請稍後再試'
      } else {
        aiMessage.content = '抱歉，發生錯誤，請稍後再試。'
      }
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = JSON.parse(line.slice(6))

        if (data.type === 'conversation_id') {
          conversationId.value = data.conversation_id
          fetchConversations()
        } else if (data.type === 'token') {
          aiMessage.content += data.content
          scrollToBottom()
        } else if (data.type === 'sources') {
          aiMessage.sources = data.sources
        }
      }
    }
  } catch (err) {
    aiMessage.content = aiMessage.content || '抱歉，發生錯誤，請稍後再試。'
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const fetchConversations = async () => {
  try {
    const res = await api.get('/ai/conversations', { skipLoading: true })
    conversations.value = res.data
  } catch {
    //
  }
}

const loadConversation = async (id) => {
  if (id === conversationId.value) return
  try {
    const res = await api.get(`/ai/conversations/${id}/messages`, { skipLoading: true })
    const conv = res.data
    conversationId.value = conv.id
    messages.value = conv.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      sources: msg.sources || [],
    }))
    scrollToBottom()
  } catch {
    //
  }
}

const deleteConversation = async (id) => {
  try {
    await api.delete(`/ai/conversations/${id}`, { skipLoading: true })
    conversations.value = conversations.value.filter(c => c.id !== id)
    if (conversationId.value === id) {
      startNewChat()
    }
  } catch {
    //
  }
}

const startNewChat = () => {
  messages.value = []
  conversationId.value = null
  question.value = ''
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const d = date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const t = date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  return `${d}<br>${t}`
}

const copyMessage = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    //
  }
}

const filterSources = (sources) => {
  if (!sources || !sources.length) return []
  const maxScore = Math.max(...sources.map(s => s.relevance_score))
  return sources.filter(s => s.relevance_score >= maxScore - 0.15)
}

const downloadSource = async (src) => {
  if (!src.current_version_id) return
  try {
    const res = await api.get(
      `/knowledge/documents/${src.document_id}/versions/${src.current_version_id}/download`,
      { responseType: 'blob', skipLoading: true, transformResponse: [(data) => data] }
    )
    const url = window.URL.createObjectURL(new Blob([res]))
    const a = document.createElement('a')
    a.href = url
    a.download = src.document_title
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('下載失敗', e)
  }
}

onMounted(() => {
  fetchConversations()
})

const renderMarkdown = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: calc(100vh - var(--header-height) - 4rem);
  overflow: hidden;
  border-radius: 12px;
  background: var(--primary-50);
  margin: -2rem;
  height: calc(100vh - var(--header-height));
  border-radius: 0;
}

.chat-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid var(--primary-200);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.chat-sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--primary-100);
}

.new-chat-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.15s ease;
}

.new-chat-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.new-chat-btn svg {
  width: 18px;
  height: 18px;
  fill: white;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.history-empty {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--primary-400);
  font-size: 0.875rem;
}

.history-item {
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 0.25rem;
}

.history-item:hover {
  background: var(--primary-50);
}

.history-item-active {
  background: var(--accent-50);
  border: 1px solid var(--accent-200);
}

.history-item-title {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--primary-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-item-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--primary-400);
}

.history-delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.15s ease;
}

.history-item:hover .history-delete-btn {
  opacity: 1;
}

.history-delete-btn:hover {
  background: var(--primary-100);
}

.history-delete-btn svg {
  width: 14px;
  height: 14px;
  fill: var(--primary-400);
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.messages-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--accent-100, #dbeafe) 0%, var(--accent-50, #eff6ff) 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.welcome-icon svg {
  width: 40px;
  height: 40px;
  fill: var(--accent-500);
}

.welcome-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-900);
  margin-bottom: 0.5rem;
}

.welcome-desc {
  font-size: 1rem;
  color: var(--primary-500);
  margin-bottom: 2rem;
  max-width: 400px;
}

.message {
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-user {
  display: flex;
  justify-content: flex-end;
}

.message-user .message-bubble {
  background: linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%);
  color: white;
  border-radius: 16px 16px 4px 16px;
  max-width: fit-content;
  word-break: break-word;
}

.message-ai {
  display: flex;
  gap: 0.75rem;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary-700) 0%, var(--primary-900) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar svg {
  width: 20px;
  height: 20px;
  fill: white;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 48px);
}

.message-ai .message-bubble {
  background: white;
  border: 1px solid var(--primary-200);
  border-radius: 4px 16px 16px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.message-bubble {
  padding: 1rem 1.25rem;
}

.message-text {
  font-size: 0.9375rem;
  line-height: 1.7;
}

.message-sources {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--primary-100);
}

.sources-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--primary-50);
  border-radius: 6px;
  margin-bottom: 0.375rem;
  font-size: 0.8125rem;
  color: var(--primary-700);
  transition: background 0.15s;
}

.source-item-clickable {
  cursor: pointer;
}

.source-item-clickable:hover {
  background: var(--primary-100);
}

.source-item svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
  flex-shrink: 0;
}

.source-score {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--primary-400);
}

.source-download-icon {
  opacity: 0.6;
}

.source-item-clickable:hover .source-download-icon {
  opacity: 1;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.action-btn {
  padding: 0.375rem 0.625rem;
  background: none;
  border: 1px solid var(--primary-200);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--primary-500);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.15s ease;
  font-family: inherit;
}

.action-btn:hover {
  background: var(--primary-50);
  border-color: var(--primary-300);
  color: var(--primary-700);
}

.action-btn svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 0.5rem 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--primary-400);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-8px); }
}

.input-container {
  padding: 1rem 2rem 1rem;
  background: var(--primary-50);
}

.input-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.input-hint {
  margin-top: 0.5rem;
}

.input-box {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  cursor: text;
  background: white;
  border: 1.5px solid var(--primary-200);
  border-radius: 24px;
  padding: 0.5rem 0.5rem 0.5rem 1.25rem;
  transition: all 0.15s ease;
}

.input-box-focus {
  border-color: var(--accent-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.chat-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: none;
  line-height: 1.5;
  padding: 0.5rem 0;
  background: transparent;
  max-height: 120px;
  min-height: 24px;
}

.chat-input::placeholder {
  color: var(--primary-400);
}

.send-btn {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  background: var(--primary-200);
  cursor: not-allowed;
  transform: none;
}

.send-btn svg {
  width: 20px;
  height: 20px;
  fill: white;
}

.input-hint {
  text-align: center;
  font-size: 0.75rem;
  color: var(--primary-400);
  margin-top: 0.75rem;
}

@media (max-width: 1024px) {
  .chat-sidebar {
    display: none;
  }
}

@media (max-width: 640px) {
  .messages-container {
    padding: 1rem;
  }

  .input-container {
    padding: 1rem;
  }

  .message-user .message-bubble,
  .message-content {
    max-width: 90%;
  }
}
</style>
