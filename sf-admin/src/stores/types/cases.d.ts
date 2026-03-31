import type { UploadedFile } from './global'
import type { Member } from './member'
import type { Pet } from './pet'
import type { Vets } from './veternians'

export enum CaseStatusEnum {
  PENDING = 'pending',
  OPEN_ESCALATED = 'openEscalated',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected'
}

export interface Cases {
  createdAt: string
  id: string
  member: string
  pet: string
  status: CaseStatusEnum
  vet: string
}

export interface CaseDetail {
  createdAt: string
  id: string
  description: string
  pet: Pet
  status: CaseStatusEnum
  assignedVet: Vets
  member: Member
  sharedFiles: UploadedFile[]
  vetNote?:string
  isEscalated?:boolean
  isDirectEscalated?:boolean
  partnerBooking:{
    scheduledAt:string
    services:{ 
              id:string
              label:string 
              name:string
              price:number
              quantity:number
    }[]
  } | null
}
