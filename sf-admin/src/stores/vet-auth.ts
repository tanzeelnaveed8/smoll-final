import { defineStore } from 'pinia'
import api from '@/util/api'
import type { VetUser } from '@/stores/types/vet-types'

interface VetAuthState {
  user: VetUser | null
  initializationComplete: boolean
}

export const useVetAuthStore = defineStore('VetAuthStore', {
  state: (): VetAuthState => ({
    user: null,
    initializationComplete: false
  }),
  actions: {
    async login(payload: { email: string; password: string }) {
      await api.post('/vet/auth/login', payload)
    },
    async refreshToken() {
      await api.post('/vet/auth/refresh-token')
    },
    async logout() {
      await api.post('/vet/auth/logout')
      this.user = null
    },
    async fetchUser(): Promise<VetUser> {
      const { data } = await api.get('/vets/me')
      this.user = data
      return data
    }
  }
})
