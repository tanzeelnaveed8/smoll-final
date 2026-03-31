import type { UploadedFile } from './global'

export interface Partner {
  address: null | string
  city: null | string
  clinicImg: UploadedFile
  country: null | string
  createdAt: string
  email: string
  id: string
  isSuspended: boolean
  name: string
  openingHours: null | string
  phone: string
  postalCode: null | string
  receptionistName: string
  specialities: [] | { id: string; name: string }[]
  imgCollections:File[]
  documents:File[]
}

export interface AddPartnerPayload {
  address: string
  city: string
  clinicImg: UploadedFile
  documents: UploadedFile[]
  country: string
  email: string
  name: string
  phone: string
  timeZone: string
  receptionistName: string
  specialities?: { id: string; name: string }[]
}

export interface UpdatePartnerPayload {
  address?: string
  city?: string
  clinicImg?: UploadedFile
  documents?: UploadedFile[]
  imgCollections?: imgCollections
  country?: string
  email?: string
  name?: string
  phone?: string
  timeZone?: string
  receptionistName?: string
  specialities?: { id: string; name: string }[]
}
