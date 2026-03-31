import type { UploadedFile } from './global'

export interface Organization {
  id: string
  organizationName: string
  domain: string
  createdAt: string
  updatedAt: string
  smollVetAccessStartDate: string
  smollVetAccessEndDate: string
  smollVetIsActive: boolean
  contactDetails?: string | null
  groupChatEnabled?: boolean
  domainAccessEnabled?: boolean
  codeAccessEnabled?: boolean
  domainGroupChatEnabled?: boolean
  codeGroupChatEnabled?: boolean
  profileImg?: UploadedFile | null
  codes?: {
    code: string
    usedAt: string | null
  }[]
}

export interface AddOrganizationPayload {
  organizationName: string
  domain?: string
  smollVetAccess?: boolean
  smollVetAccessStartDate?: string
  smollVetAccessEndDate?: string
  smollVetIsActive?: boolean
  contactDetails?: string | null
  groupChatEnabled?: boolean
  domainAccessEnabled?: boolean
  codeAccessEnabled?: boolean
  domainGroupChatEnabled?: boolean
  codeGroupChatEnabled?: boolean
}

export interface UpdateOrganizationPayload {
  organizationName?: string
  domain?: string
  smollVetAccess?: boolean
  smollVetAccessStartDate?: string
  smollVetAccessEndDate?: string
  smollVetIsActive?: boolean
  contactDetails?: string | null
  groupChatEnabled?: boolean
  domainAccessEnabled?: boolean
  codeAccessEnabled?: boolean
  domainGroupChatEnabled?: boolean
  codeGroupChatEnabled?: boolean
}
