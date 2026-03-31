import { defineStore } from 'pinia'
import api from '@/util/api'
import type { State, UpdateUserPayloadDto } from './types/auth'

export const useAuthStore = defineStore('AuthStore', {
  state: (): State => ({
    user: null,
    initializationComplete: false,
    otpRequired: false,
    pendingEmail: ''
  }),

  actions: {
    async login(payload: { email: string; password: string }) {
      await api.post('/admin/auth/login', payload)
      this.otpRequired = true
      this.pendingEmail = payload.email
    },

    async verifyOtp(otp: string) {
      const { data } = await api.post('/admin/auth/verify-otp', {
        email: this.pendingEmail,
        otp
      })

      this.user = data
      this.initializationComplete = true
      this.otpRequired = false
      this.pendingEmail = ''
      return this.user
    },

    async logout() {
      await api.post('/admin/auth/logout')
      this.user = null
      this.otpRequired = false
      this.pendingEmail = ''
    },

    async fetchUser() {
      const { data } = await api.get('/admin/me')
      this.user = data
      return data
    },

    // Update current admin user profile or password
    async updateUserPassword(payload: UpdateUserPayloadDto) {
      const { data } = await api.post('/admin/auth/change-password', payload)
      // If server returns updated user, keep store in sync
      this.user = data ?? this.user
      return data
    }
  }
})

// ✅ Export an explicit type for proper "this" inference
export type AuthStore = ReturnType<typeof useAuthStore>
