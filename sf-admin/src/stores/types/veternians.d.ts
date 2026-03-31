import type { UploadedFile } from './global'

export enum VetSpecialties {
  PET_NUTRITION = 'Pet Nutrition',
  PET_BEHAVIOURS = 'Pet Behaviours',
  // OPHTHALMOLOGY = 'Ophthalmology',
  // ORTHOPEDIC = 'Orthopedic',
  GENERAL = 'General'
}

export interface Vets {
  address: string
  country: string
  createdAt: string
  designation: string
  dob: string
  documents?: UploadedFile[]
  email: string
  id: string
  isOnline: boolean
  isSuspended: boolean
  name: string
  phone: string
  profileImg: UploadedFile | null
  timeZone: null | string
  updatedAt: string
  yearsOfExperience: null | null
  avgRating?: string
  byAppointmentOnly?: boolean
  specialties?: VetSpecialties[]
}

export interface AddVetPayload {
  name: string
  phone: string
  timeZone: null | string
  country: string
  designation: string
  dob: string
  address: string
  email: string
  documents: UploadedFile[] | []
  profileImg: UploadedFile | null
  byAppointmentOnly?: boolean
  specialties?: VetSpecialties[]
}

export interface UpdateVetPayload {
  name?: string
  phone?: string
  timeZone?: null | string
  country?: string
  designation?: string
  dob?: string
  address?: string
  email?: string
  documents?: UploadedFile[] | []
  profileImg?: UploadedFile | null
  byAppointmentOnly?: boolean
  specialties?: VetSpecialties[]
}
