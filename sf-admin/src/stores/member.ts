import { defineStore } from 'pinia'
import api from '@/util/api'

export const useMemberStore = defineStore('MemberStore', {
  state: () => ({}),
  actions: {
    async fetchMembers(search?: string, page?: number) {
      const data = await api.get('/admin/members', {
        params: {
          search,
          page: page ? page : 1,
          limit: 10
        }
      })
      return data.data
    },
    async fetchMembersDetails(id: string) {
      const data = await api.get(`/admin/members/${id}`)
      return data.data
    },
    async addMember(payload: { name: string; email?: string; phone?: string; address?: string; villa?: string; city?: string; country?: string }) {
      await api.post('/admin/members', payload)
    },
    async updateMember(id: string, payload: { name?: string; email?: string; phone?: string; address?: string; villa?: string; city?: string; country?: string }) {
      await api.patch(`/admin/members/${id}`, payload)
    },
    async deleteMember(id: string) {
      await api.delete(`/admin/members/${id}`)
    }
  }
})
