import api from '@/util/api'
import { defineStore } from 'pinia'

export interface Analytics {
  cases: number
  partners: number
  vets: number
  members: number
  services: number
  products: number
  openCases: number
  closedCases: number
  escalatedCases: number
  totalRevenue?: number
  servicesRevenue?: number
  productsRevenue?: number
  avgOrder?: number
  visitsByMonth?: { month: string; visits: number; revenue: number }[]
}

/** Normalize API response so card keys always match (handles snake_case from backend if any) */
function normalizeAnalytics(raw: Record<string, unknown> | null): Analytics | null {
  if (!raw || typeof raw !== 'object') return null
  const num = (v: unknown): number => (typeof v === 'number' ? v : Number.isFinite(Number(v)) ? Number(v) : 0)
  const arr = <T = any>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])

  const pendingCases = num((raw as any).pendingCases ?? (raw as any).pending_cases)
  const confirmedCases = num((raw as any).confirmedCases ?? (raw as any).confirmed_cases)
  const rejectedCases = num((raw as any).rejectedCases ?? (raw as any).rejected_cases)
  const escalatedCases = num((raw as any).escalatedCases ?? (raw as any).escalated_cases)

  return {
    cases: num(raw.cases),
    partners: num(raw.partners),
    vets: num(raw.vets),
    members: num(raw.members),
    services: num(raw.services),
    products: num(raw.products),
    // Treat "active visits" as all non-closed cases:
    // pending + escalated
    openCases: num(
      (raw as any).openCases ??
        (raw as any).open_cases ??
        pendingCases + escalatedCases,
    ),
    // Closed = confirmed + rejected
    closedCases: num(
      (raw as any).closedCases ??
        (raw as any).closed_cases ??
        confirmedCases + rejectedCases,
    ),
    escalatedCases,
    totalRevenue: num(raw.totalRevenue ?? (raw as Record<string, unknown>).total_revenue),
    servicesRevenue: num(raw.servicesRevenue ?? (raw as Record<string, unknown>).services_revenue),
    productsRevenue: num(raw.productsRevenue ?? (raw as Record<string, unknown>).products_revenue),
    avgOrder: num(raw.avgOrder ?? (raw as Record<string, unknown>).avg_order),
    visitsByMonth: arr<{ month: string; visits: number; revenue: number }>(
      raw.visitsByMonth ?? (raw as Record<string, unknown>).visits_by_month,
    ),
  }
}

export const useAnalyticsStore = defineStore('AnalyticsStore', {
  state: () => ({}),
  actions: {
    async fetchAnalytics(): Promise<Analytics> {
      const { data } = await api.get('/admin/analytics')
      const normalized = normalizeAnalytics(data as Record<string, unknown>)
      return normalized ?? {
        cases: 0,
        partners: 0,
        vets: 0,
        members: 0,
        services: 0,
        products: 0,
        openCases: 0,
        closedCases: 0,
        escalatedCases: 0,
        totalRevenue: 0,
      }
    }
  }
})
