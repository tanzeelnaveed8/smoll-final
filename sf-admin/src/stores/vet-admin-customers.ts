import { defineStore } from 'pinia'

export interface VetAdminCustomer {
  id: string
  fullName: string
  email?: string
  phone?: string
  address?: string
  petInfo?: string
  createdAt: string
}

interface VetAdminCustomerState {
  customers: VetAdminCustomer[]
}

const STORAGE_KEY = 'smoll-vet-admin-customers'

function loadFromStorage(): VetAdminCustomer[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function saveToStorage(customers: VetAdminCustomer[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers))
  } catch {
    // ignore storage errors
  }
}

export const useVetAdminCustomerStore = defineStore('VetAdminCustomerStore', {
  state: (): VetAdminCustomerState => ({
    customers: []
  }),
  actions: {
    hydrate() {
      this.customers = loadFromStorage()
    },
    addCustomer(payload: {
      fullName: string
      email?: string
      phone?: string
      address?: string
      petInfo?: string
    }) {
      const customer: VetAdminCustomer = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        petInfo: payload.petInfo,
        createdAt: new Date().toISOString()
      }
      this.customers = [customer, ...this.customers]
      saveToStorage(this.customers)
    }
  }
})

