import { defineStore } from "pinia";
import api from "@/utils/axios";

export const useUserStore = defineStore('user',{
  state: () => ({
    // 對應後端的響應: UserListResponse
    users: [],
    total: 0,
    page: 1,
    page_size: 10,
    stats: { total: 0, active: 0, inactive: 0, suspended: 0 },

    // UI 狀態
    loading: false,
    error: null
  }),

  actions: {
    // GET : 取得所有使用者列表（支援搜尋+篩選）
    async fetchUsers(search = '', status = '', departmentId = '', roleId = '', page = 1) {
      this.loading = true
      this.error = null

      try {
        // 組裝 URL
        let url = '/users'
        const params = new URLSearchParams()

        if (search) {
          params.append('search', search)
        }
        if (status) {
          params.append('status', status)
        }
        if (departmentId) {
          params.append('department_id', departmentId)
        }
        if (roleId) {
          params.append('role_id', roleId)
        }
        if (page > 1) {
          params.append('page', page)
        }
        // 如果有參數
        if (params.toString()) {
          url += `?${params.toString()}`
        }

        // 呼叫 API
        const response = await api.get(url)

        // 存入 state
        this.users = response.users
        this.total = response.total
        this.page = response.page
        this.page_size = response.page_size
        if (response.stats) this.stats = response.stats
      } catch(error) {
        // 錯誤處理
        this.error = error.message || '取得使用者列表失敗'
      } finally {
        this.loading = false
      }
    },

    // POST : 新增使用者
    async createUser(data) {
      // data 對應後端的 UserCreate
      this.loading = true
      this.error = null

      try {
        await api.post('/users' ,data)
        await this.fetchUsers()
      } catch(error) {
        this.error = error.message || '新增使用者失敗'
        throw error
      } finally {
        this.loading = false
      }
    },

    // PUT : 更新使用者
    async updateUser(id, data){
      // data 對應後端的 UserAdminUpdate
      this.loading = true
      this.error = null

      try {
        await api.put(`/users/${id}`, data)
        await this.fetchUsers()
      } catch(error) {
        this.error = error.message || '更新使用者失敗'
        throw error
      } finally {
        this.loading = false
      }
    },

    // DELETE : 刪除使用者
    async deleteUser(id) {
      this.loading = true
      this.error = null

      try {
        await api.delete(`/users/${id}`)
        await this.fetchUsers()
      } catch (error) {
        this.error = error.message || '刪除失敗'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
  getters: {}
})
