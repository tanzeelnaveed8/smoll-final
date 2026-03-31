import { defineStore } from 'pinia'
import api from '@/util/api'
import type { AddHomeVetPayload, UpdateHomeVetPayload } from './types/homeVets'

export const useHomeVetsStore = defineStore('HomeVetsStore', {
  state: () => ({}),
  actions: {
    async fetchHomeVets(isSuspended: boolean, search?: string, page?: number) {
      const data = await api.get('/admin/home-vets', {
        params: {
          isSuspended,
          search,
          page: page ? page : 1,
          limit: 10
        }
      })
      return data.data
    },

    async fetchHomeVetDetails(id: string) {
      const { data } = await api.get(`/admin/vets/${id}`)
      return data
    },

    async addHomeVet(payload: AddHomeVetPayload) {
      await api.post('/admin/home-vets', payload)
    },

    async updateHomeVet(id: string, payload: UpdateHomeVetPayload) {
      await api.patch(`/admin/vets/${id}`, payload)
    },

    async activateHomeVet(id: string) {
      await api.post(`/admin/vets/${id}/activate`)
    },

    async suspendHomeVet(id: string) {
      await api.post(`/admin/vets/${id}/suspend`)
    },

    async fetchHomeVetCases(id: string) {
      const { data } = await api.get(`/admin/vets/${id}/cases`)
      return data
    },

    async resetHomeVetPassword(id: string) {
      const { data } = await api.post(`/admin/vets/${id}/reset-password`)
      return data
    }
  }
})
