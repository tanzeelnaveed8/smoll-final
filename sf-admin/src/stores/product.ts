import { defineStore } from 'pinia'
import api from '@/util/api'

export type ProductListResult = { data: any[]; count: number }

export const useProductStore = defineStore('ProductStore', {
  state: () => ({}),
  actions: {
    async fetchProducts(search?: string, page?: number): Promise<ProductListResult> {
      const res = await api.get('/admin/products', {
        params: { search: search || undefined, page: page && Number(page) >= 1 ? Number(page) : 1, limit: 10 }
      })
      const body = res.data
      if (Array.isArray(body)) return { data: body, count: body.length }
      const data = body?.data ?? []
      const count = typeof body?.count === 'number' ? body.count : data.length
      return { data: Array.isArray(data) ? data : [], count }
    },
    async fetchProductDetails(id: string) {
      const { data } = await api.get(`/admin/products/${id}`)
      return data
    },
    async addProduct(payload: {
      name: string
      description?: string
      price?: number
      stock?: number
      category?: string
      imageUrl?: string
      imageGallery?: string[]
    }) {
      await api.post('/admin/products', payload)
    },
    async updateProduct(
      id: string,
      payload: {
        name?: string
        description?: string
        price?: number
        stock?: number
        category?: string
        imageUrl?: string
        imageGallery?: string[]
        isActive?: boolean
      }
    ) {
      await api.patch(`/admin/products/${id}`, payload)
    },
    async deleteProduct(id: string) {
      await api.delete(`/admin/products/${id}`)
    }
  }
})
