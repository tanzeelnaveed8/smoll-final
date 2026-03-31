import type { Nullable, UploadedFile } from './global'

export interface User {
  id: string
  name: string
  phone: string
  designation: string
  yearsOfExperience: number
  profileImg: UploadedFile
  address: string
  country: string
  availability: {}
  email?: string
  isOnline: true
  timeZone: string
  createdAt: string
  updatedAt: string
}

export interface UpdateUserPayloadDto {
  yearsOfExperience?: number
  profileImg?: UploadedFile
  isOnline?: boolean
  name?: string
  designation?: string
  address?: string
  country?: string
  timeZone?: string
  phone?: string
  oldPassword?: string
  password?: string
  currentPassword?: string
  newPassword?: string
}

export interface State {
  user: Nullable<User>
  initializationComplete: boolean
}
