export interface Counsellor {
  id: string
  name: string
  phone: string
  email: string | null
  designation: string | null
  address: string | null
  country: string | null
  isOnline: boolean
  isSuspended: boolean
  timeZone: string | null
  createdAt: string
  updatedAt: string
}

export interface AddCounsellorPayload {
  name: string
  phone: string
  email: string
  designation: string
  address: string
  country: string
  timeZone: string
}

export interface UpdateCounsellorPayload {
  name?: string
  phone?: string
  email?: string
  designation?: string
  address?: string
  country?: string
  timeZone?: string
}
