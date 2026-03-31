import { defineStore } from 'pinia'
import api from '@/util/api'
import type { AddPartnerPayload, UpdatePartnerPayload } from './types/partner'

export const usePartnerStore = defineStore('PartnerStore', {
  state: () => ({}),
  actions: {
    async fetchPartners(isSuspended: boolean, isPending: boolean, search?: string, page?: number) {
      const data = await api.get('/admin/partners', {
        params: {
          isSuspended,
          isPending,
          search,
          page: page ? page : 1,
          limit: 10
        }
      })
      return data.data
    },
    async fetchPartnerDetails(id: string) {
      const { data } = await api.get(`/admin/partners/${id}`)
      return data
    },
    async addPartner(payload: AddPartnerPayload) {
      await api.post('/admin/partners', payload)
    },

    async updatePartner(id: string, payload: UpdatePartnerPayload) {
      await api.patch(`/admin/partners/${id}`, payload)
    },

    async activatePartner(id: string) {
      await api.post(`/admin/partners/${id}/activate`)
    },

    async suspendPartner(id: string) {
      await api.post(`/admin/partners/${id}/suspend`)
    },

    async resetPartnerPassword(id:string){
      await api.post(`/admin/partners/${id}/reset-password`)
    }
  }
})
