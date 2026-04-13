import { defineStore } from 'pinia'
import api from '@/utils/axios'

export const useDepartmentStore = defineStore('department', {
  state: () => ({
    // 對應後端的響應: DepartmentListResponse
    departments: [],
    total: 0,

    // UI 狀態
    loading: false,
    error: null,
  }),

  actions: {
    // GET : 取得所有部門列表
    async fetchDepartments() {
      this.loading = true // 1. 開始載入
      this.error = null // 2. 清除之前的錯誤

      try {
        // 3. 呼叫 API
        const response = await api.get('/departments')
        // debug
        console.log('API 回傳:', response)
        
        // 4. 存入 state
        this.departments = response.departments
        this.total = response.total
      } catch (error) {
        // 5. 處理錯誤
        this.error = error.message || '取得部門列表失敗'
      } finally {
        this.loading = false // 不管成功或失敗都結束載入
      }
    },

    // POST : 新增部門
    async createDepartment(data) {
      // data對應後端的DepartmentCreate
      this.loading = true
      this.error = null

      try {
        await api.post('/departments', data)
        await this.fetchDepartments() // 成功後重新載入列表
      } catch (error) {
        this.error = error.message || '新增部門失敗'
        throw error // 拋出讓 View 的 catch 接住
      } finally {
        this.loading = false
      }
    },

    // PUT : 更新部門
    async updateDepartment(id, data) {
      // data對應後端的DepartmentUpdate
      this.loading = true
      this.error = null

      try {
        await api.put(`/departments/${id}`, data)
        await this.fetchDepartments() // 成功後重新載入列表
      } catch (error) {
        this.error = error.message || '更新部門失敗'
        throw error // 拋出讓 View 的 catch 接住
      } finally {
        this.loading = false
      }
    },

    // DELETE : 刪除部門
    async deleteDepartment(id) {
      this.loading = true
      this.error = null

      try {
        await api.delete(`/departments/${id}`)
        await this.fetchDepartments()
      } catch (error) {
        this.error = error.message || '刪除失敗'
      } finally {
        this.loading = false
      }
    },
  },

  getters: {},
})
