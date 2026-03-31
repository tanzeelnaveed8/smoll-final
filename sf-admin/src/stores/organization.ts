import { defineStore } from 'pinia'
import api from '@/util/api'
import type { AddOrganizationPayload, Organization, UpdateOrganizationPayload } from './types/organization'

export const useOrganizationStore = defineStore('organization', {
  state: () => ({}),
  actions: {
    async fetchOrganizations(search?: string, page?: number) {
      const data = await api.get('/admin/organizations', {
        params: {
          search,
          page: page ? page : 1,
          limit: 10
        }
      })
      return data.data
    },
    
    async fetchOrganizationDetails(id: string) {
      const { data } = await api.get(`/admin/organizations/${id}`)
      return data
    },
    
    async addOrganization(payload: AddOrganizationPayload) {
      await api.post('/admin/organizations', payload)
    },

    async updateOrganization(id: string, payload: UpdateOrganizationPayload) {
      await api.put(`/admin/organizations/${id}`, payload)
    },

    async deleteOrganization(id: string) {
      await api.delete(`/admin/organizations/${id}`)
    },

    async fetchOrganizationCodes(id: string) {
      try {
        const { data } = await api.get(`/admin/organizations/${id}/codes`)
        // Backend returns full array, frontend handles pagination
        return data
      } catch (error: any) {
        // Don't throw error for 404 - just return empty array
        if (error.response?.status === 404) {
          return []
        }
        // For other errors, throw them so the component can handle
        throw error 
      }
    },

    async addOrganizationCodes(id: string, numberOfCodes: number, maxUsageMonths: number = 12) {
      const { data } = await api.post(`/admin/organizations/${id}/codes`, {
        numberOfCodes,
        maxUsageMonths
      })
      return data
    },

    async deleteOrganizationCodes(codes: string[]) {
      if (!codes || codes.length === 0) return

      const { data } = await api.post('/admin/organizations/codes/delete', {
        codes,
      })
      return data
    },

    async uploadOrganizationProfileImage(id: string, file: File): Promise<Organization> {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post(`/admin/organizations/${id}/profile-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data
    },

    async removeOrganizationProfileImage(id: string): Promise<Organization> {
      const { data } = await api.delete(`/admin/organizations/${id}/profile-image`)
      return data
    },
  }
})
