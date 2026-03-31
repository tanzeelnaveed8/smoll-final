import { defineStore } from 'pinia'
import api from '@/util/api'
import type { AddCounsellorPayload, UpdateCounsellorPayload } from './types/counsellors'

export const useCounsellorsStore = defineStore('CounsellorsStore', {
  actions: {
    async fetchCounsellors(isSuspended: boolean, search?: string, page?: number) {
      const { data } = await api.get('/admin/counsellors', {
        params: {
          isSuspended,
          search,
          page: page ?? 1,
          limit: 10
        }
      })
      return data
    },

    async fetchCounsellorDetails(id: string) {
      const { data } = await api.get(`/admin/counsellors/${id}`)
      return data
    },

    async addCounsellor(payload: AddCounsellorPayload) {
      await api.post('/admin/counsellors', payload)
    },

    async updateCounsellor(id: string, payload: UpdateCounsellorPayload) {
      await api.patch(`/admin/counsellors/${id}`, payload)
    },

    async suspendCounsellor(id: string) {
      await api.post(`/admin/counsellors/${id}/suspend`)
    },

    async activateCounsellor(id: string) {
      await api.post(`/admin/counsellors/${id}/activate`)
    },

    async resetCounsellorPassword(id: string) {
      await api.post(`/admin/counsellors/${id}/reset-password`)
    }
  }
})
