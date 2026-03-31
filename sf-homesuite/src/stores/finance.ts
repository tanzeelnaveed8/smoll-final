import { defineStore } from 'pinia'
import api from '@/utils/api'
import type { FinanceStats } from '@/types'

interface FinanceState {
  stats: FinanceStats | null
}

export const useFinanceStore = defineStore('FinanceStore', {
  state: (): FinanceState => ({
    stats: null
  }),
  actions: {
    async fetchStats(): Promise<FinanceStats> {
      const { data } = await api.get('/vets/finance')
      const stats: FinanceStats = {
        totalEarnings: data.totalEarnings ?? 0,
        completedVisits: data.completedVisits ?? 0,
        totalVisits: data.totalVisits ?? 0,
        monthlyEarnings: data.monthlyEarnings ?? []
      }
      this.stats = stats
      return stats
    }
  }
})
