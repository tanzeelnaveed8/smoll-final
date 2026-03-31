import { defineStore } from 'pinia'
import api from '@/util/api'
import type { FinanceStats } from '@/stores/types/vet-types'

interface VetFinanceState {
  stats: FinanceStats | null
}

export const useVetFinanceStore = defineStore('VetFinanceStore', {
  state: (): VetFinanceState => ({
    stats: null
  }),
  actions: {
    async fetchStats(): Promise<FinanceStats> {
      const { data } = await api.get('/vets/finance')
      const stats: FinanceStats = {
        totalEarnings: data.totalEarnings ?? 0,
        completedVisits: data.completedVisits ?? 0,
        totalVisits: data.totalVisits ?? 0
      }
      this.stats = stats
      return stats
    }
  }
})
