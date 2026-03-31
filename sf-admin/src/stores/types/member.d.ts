import type { UploadedFile } from './global'
import type { Pet } from './pet'

export interface Member {
  address: string | null
  city: string | null
  country: string | null
  createdAt: string
  email: string | null
  id: string
  name: string
  pets?: Pet[]
  phone: string
  profileImg: UploadedFile | null
  villa: string | null
  petsCount?: number
  visitsCount?: number
}
