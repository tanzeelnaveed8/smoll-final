import type { UploadedFile } from './global'

export interface HomeVet {
  id: string
  name: string
  email: string
  phone: string
  designation: string
  dob: string
  address: string
  country: string
  timeZone: string | null
  profileImg: UploadedFile | null
  documents?: UploadedFile[]
  isOnline: boolean
  isSuspended: boolean
  createdAt: string
  updatedAt: string
  yearsOfExperience: number | null
  avgRating?: string
}

export interface AddHomeVetPayload {
  name: string
  email: string
  phone: string
  designation: string
  dob: string
  address: string
  country: string
  timeZone: string | null
  profileImg: UploadedFile | null
  documents: UploadedFile[] | []
  password?: string
}

export interface UpdateHomeVetPayload {
  name?: string
  email?: string
  phone?: string
  designation?: string
  dob?: string
  address?: string
  country?: string
  timeZone?: string | null
  profileImg?: UploadedFile | null
  documents?: UploadedFile[] | []
}
