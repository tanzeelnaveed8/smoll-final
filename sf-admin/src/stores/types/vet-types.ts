export interface VetUser {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  timeZone?: string
}

export interface Pet {
  id: string
  name: string
  species: string
  breed?: string
  age?: number
  weight?: number
  avatar?: string
}

export interface VetMember {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  avatar?: string
  pets?: Pet[]
}

export interface VetService {
  id: string
  name: string
  price?: number
  checked?: boolean
}

export interface CaseNote {
  text: string
}

export interface CaseAsset {
  url: string
  filename: string
  filesize: number
  mimetype: string
}

export interface Visit {
  id: string
  status: VisitStatus
  scheduledAt: string
  acceptedAt?: string
  startedAt?: string
  endedAt?: string
  member?: VetMember
  pet?: Pet
  services?: VetService[]
  case?: VetCase
  rejectedBy?: string
  vet?: VetUser
  createdAt: string
  updatedAt?: string
}

export interface VetCase {
  id: string
  consultationId: string
  status: string
  createdAt: string
  updatedAt: string
  services: VetService[]
  notes: CaseNote[]
  assets: CaseAsset[]
  startedAt?: string
  endedAt?: string
  member?: VetMember
  pet?: Pet
}

export interface FinanceStats {
  totalEarnings: number
  completedVisits: number
  totalVisits?: number
  pendingEarnings?: number
  monthlyEarnings?: { month: string; amount: number }[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export type VisitStatus =
  | 'INITIATED'
  | 'SCHEDULED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'NOT_REACHABLE'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string
  status: VisitStatus
  consultationId: string
}
