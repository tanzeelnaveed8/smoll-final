import { defineStore } from 'pinia'
import api from '@/util/api'
import type { AddVetPayload, UpdateVetPayload } from './types/veternians'

export const useVeterniansStore = defineStore('VeterniansStore', {
  state: () => ({}),
  actions: {
    async fetchVets(isSuspended: boolean, search?: string, page?: number) {
      const data = await api.get('/admin/vets', {
        params: {
          isSuspended,
          search,
          page: page ? page : 1,
          limit: 10
        }
      })
      return data.data
    },

    async fetchVetDetails(id: string) {
      const { data } = await api.get(`/admin/vets/${id}`)
      return data
    },

    async addVet(payload: AddVetPayload) {
      await api.post('/admin/vets', payload)
    },

    async updateVet(id: string, payload: UpdateVetPayload) {
      await api.patch(`/admin/vets/${id}`, payload)
    },

    async activateVet(id: string) {
      await api.post(`/admin/vets/${id}/activate`)
    },

    async suspendVet(id: string) {
      await api.post(`/admin/vets/${id}/suspend`)
    },
    async fetchVetCases(id: string) {
      const { data } = await api.get(`/admin/vets/${id}/cases`)
      return data
    },
    async resetVetPassword(id: string) {
      const { data } = await api.post(`/admin/vets/${id}/reset-password`)
      return data
    }
  }
})
