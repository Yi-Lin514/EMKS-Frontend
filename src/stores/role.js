import { defineStore  } from "pinia";
import api from "@/utils/axios";

export const useRoleStore = defineStore('role',{
  state: () => ({
    // 對應後端的響應: RoleListResponse
    roles: [],
    total: 0,

    // 權限相關
    allPermissions: [],       // 所有可用權限（GET /permissions）
    rolePermissionIds: [],    // 目前選中角色的權限 ID 列表

    // UI 狀態
    loading: false,
    error: null,
  }),

  actions: {
    // GET : 取得所有角色列表
    async fetchRoles() {
      this.loading = true
      this.error = null

      try {
        // 呼叫 API
        const response = await api.get('/roles')

        // 存入 state
        this.roles = response.roles
        this.total = response.total
      } catch(error) {
        // 處理錯誤
        this.error = error.message || "取得角色列表失敗"
      } finally {
        this.loading = false
      }
    },

    // POST : 新增角色
    async createRole(data) {
      // data對應後端的 RoleCreate
      this.loading = true
      this.error = null

      try {
        await api.post('/roles', data)
        await this.fetchRoles() // 成功後重新載入列表
      } catch(error) {
        this.error = error.message || "新增角色失敗"
      } finally {
        this.loading = false
      }
    },

    // PUT : 更新角色
    async updateRole(id, data) {
      // data 對應後端的 RoleUpdate
      this.loading = true
      this.error = null

      try {
        await api.put(`/roles/${id}`, data)
        await this.fetchRoles() // 成功後重新載入列表
      } catch(error) {
        this.error = error.message || "更新角色失敗"
      } finally {
        this.loading = false
      }
    },

    // DELETE : 刪除角色
    async deleteRole(id) {
      this.loading = true
      this.error = null

      try {
        await api.delete(`/roles/${id}`)
        await this.fetchRoles()
      } catch(error) {
        this.error = error.message || '刪除失敗'
      } finally {
        this.loading = false
      }
    },

    // ========== 權限管理 ==========

    // GET /permissions : 取得所有可用權限
    async fetchAllPermissions() {
      try {
        const response = await api.get('/permissions')
        this.allPermissions = response.permissions
      } catch(error) {
        this.error = error.message || '取得權限列表失敗'
      }
    },

    // GET /roles/{id}/permissions : 取得某角色的權限
    async fetchRolePermissions(roleId) {
      try {
        const permissions = await api.get(`/roles/${roleId}/permissions`)
        // 存的是 permission id 列表，方便 checkbox v-model 使用
        this.rolePermissionIds = permissions.map(p => p.id)
      } catch(error) {
        this.error = error.message || '取得角色權限失敗'
      }
    },

    // PUT /roles/{id}/permissions : 批次更新角色權限
    async updateRolePermissions(roleId, permissionIds) {
      this.loading = true
      this.error = null

      try {
        await api.put(`/roles/${roleId}/permissions`, {
          permission_ids: permissionIds,
        })
      } catch(error) {
        this.error = error.message || '更新權限失敗'
        throw error  // 讓呼叫端知道失敗了
      } finally {
        this.loading = false
      }
    },
  },
  getters: {},
})
