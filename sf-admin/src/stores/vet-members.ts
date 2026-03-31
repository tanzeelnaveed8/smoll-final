import { defineStore } from 'pinia'
import api from '@/util/api'

interface VetMemberQuery {
  search?: string
  page?: number
  limit?: number
}

export const useVetMembersStore = defineStore('VetMembersStore', {
  state: () => ({}),
  actions: {
    async fetchVetMembers(search?: string, page?: number, limit = 10) {
      const { data } = await api.get('/admin/vet-members', {
        params: {
          search,
          page: page || 1,
          limit
        }
      })
      return data
    },
    async addVetMember(payload: {
      name: string
      email?: string
      phone?: string
      address?: string
      villa?: string
      city?: string
      country?: string
      petInfo?: string
    }) {
      const { data } = await api.post('/admin/vet-members', payload)
      return data
    },
    async updateVetMember(id: string, payload: {
      name?: string
      email?: string
      phone?: string
      address?: string
      villa?: string
      city?: string
      country?: string
      petInfo?: string
    }) {
      const { data } = await api.patch(`/admin/vet-members/${id}`, payload)
      return data
    },
    async deleteVetMember(id: string) {
      await api.delete(`/admin/vet-members/${id}`)
    }
  }
})

