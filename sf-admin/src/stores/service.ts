import { defineStore } from 'pinia'
import api from '@/util/api'

export type ServiceListResult = { data: any[]; count: number }

export const useServiceStore = defineStore('ServiceStore', {
  state: () => ({}),
  actions: {
    async fetchServices(search?: string, page?: number): Promise<ServiceListResult> {
      const res = await api.get('/admin/services', {
        params: { search: search || undefined, page: page && Number(page) >= 1 ? Number(page) : 1, limit: 10 }
      })
      const body = res.data
      if (Array.isArray(body)) return { data: body, count: body.length }
      const data = body?.data ?? []
      const count = typeof body?.count === 'number' ? body.count : data.length
      return { data: Array.isArray(data) ? data : [], count }
    },
    async fetchServiceDetails(id: string) {
      const { data } = await api.get(`/admin/services/${id}`)
      return data
    },
    async addService(payload: { name: string; description?: string; price?: number; currency?: string; durationMinutes?: number; addons?: { name: string; price: number }[]; packages?: { name: string; price: number; highlighted?: boolean; perks?: string[] }[] }) {
      await api.post('/admin/services', payload)
    },
    async updateService(id: string, payload: { name?: string; description?: string; price?: number; durationMinutes?: number | null; isActive?: boolean; addons?: { name: string; price: number }[]; packages?: { name: string; price: number; highlighted?: boolean; perks?: string[] }[] }) {
      await api.patch(`/admin/services/${id}`, payload)
    },
    async deleteService(id: string) {
      await api.delete(`/admin/services/${id}`)
    }
  }
})
