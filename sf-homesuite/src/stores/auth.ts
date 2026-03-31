import { defineStore } from 'pinia'
import api from '@/utils/api'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  initializationComplete: boolean
}

export const useAuthStore = defineStore('AuthStore', {
  state: (): AuthState => ({
    user: null,
    initializationComplete: false
  }),
  actions: {
    async login(payload: { email: string; password: string }) {
      await api.post('/vet/auth/login', payload)
      // After successful login, load current user
      await this.fetchUser()
    },
    async refreshToken() {
      await api.post('/vet/auth/refresh-token')
    },
    async logout() {
      try {
        await api.post('/vet/auth/logout')
      } catch {
        // ignore errors – we still clear local state
      } finally {
        this.user = null
        this.initializationComplete = true
      }
    },
    async fetchUser(): Promise<User> {
      try {
        const { data } = await api.get('/vets/me')
        // Normalize backend vet payload into our User shape
        const raw = data as any
        const rawProfile = raw.profileImg ?? raw.profile_image ?? raw.avatar
        let avatarUrl: string | undefined =
          (rawProfile && typeof rawProfile === 'object' && rawProfile.url) ||
          (typeof rawProfile === 'string' ? rawProfile : undefined)

        // If backend returns a relative path, prefix with API base URL
        if (avatarUrl && avatarUrl.startsWith('/')) {
          const base = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || ''
          avatarUrl = `${base}${avatarUrl}`
        }

        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: avatarUrl,
          timeZone: data.timeZone
        }
        this.user = user
        return user
      } finally {
        this.initializationComplete = true
      }
    }
  }
})
