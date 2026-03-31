import { defineStore } from 'pinia'
import type { UploadedFile } from './types/global'
import api from '@/util/api'

export const useUploadStore = defineStore('UploadStore', {
  state: () => ({}),
  actions: {
    async uploadFile(files: FormData): Promise<UploadedFile[]> {
      const response = await api.post('/files', files)
      const data = response.data
      const list = Array.isArray(data) ? data : data?.data
      return Array.isArray(list) ? list : []
    }
  }
})
