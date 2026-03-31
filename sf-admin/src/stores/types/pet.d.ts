import type { UploadedFile } from './global'

export interface Pet {
  id: string
  name: string
  age: number
  weight: number
  species: ['dog', 'cat']
  gender: ['male', 'female']
  spayedOrNeutered: boolean
  breed: string
  chipNumber: number | null
  photos: UploadedFile[]
  createdAt: string
  updatedAt: string
  careId?: string
  benefitUsageSummary: {
    id: number
    name: string
    totalUsageCount: number
    consumedUsageCount: number
    history: {
      partnerId: string
      clinicName: string
      note: string
      vet: string | null
      createdAt: string
    }[]
  }[]
  subscriptionDetails: {
    status: string
    startDate: string
    endDate: string
  }
}
