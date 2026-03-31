import { defineStore } from 'pinia'
import api from '@/util/api'
import type {
  Visit,
  VetCase,
  VetMember,
  CalendarEvent,
  PaginatedResponse,
  VetService,
  CaseNote,
  CaseAsset
} from '@/stores/types/vet-types'

interface VetVisitsState {
  visits: Visit[] | null
  currentVisit: Visit | null
  currentCase: VetCase | null
  currentMember: VetMember | null
  calendarEvents: CalendarEvent[]
}

function normalizeStatus(status: string | null | undefined, scheduledAt?: string | null): string {
  // Some legacy/admin records may not have an explicit status.
  // Derive a sensible default based on scheduling information.
  const fallback =
    status ||
    (scheduledAt ? 'SCHEDULED' : 'INITIATED')

  return (fallback || '').toUpperCase()
}

function normalizeVisit(item: any): Visit {
  const normalizedStatus = normalizeStatus(item.status, item.scheduledAt) as any

  const normalizedCase = item.case
    ? { ...item.case, id: item.case.id }
    : item.caseId
      ? {
          id: item.caseId,
          consultationId: item.id,
          status: normalizedStatus,
          services: item.case?.serviceChecklist || item.services || [],
          notes: [],
          assets: [],
          member: item.member,
          pet: item.pet || item.case?.pet
        }
      : undefined

  return {
    id: item.id,
    status: normalizedStatus,
    scheduledAt: item.scheduledAt,
    createdAt: item.createdAt,
    acceptedAt: item.acceptedAt,
    updatedAt: item.updatedAt,
    startedAt: item.startedAt,
    endedAt: item.endedAt,
    member:
      typeof item.member === 'string'
        ? { id: '', name: item.member }
        : item.member || undefined,
    pet:
      typeof item.pet === 'string'
        ? { id: '', name: item.pet }
        : item.pet || item.case?.pet || undefined,
    services: item.services || item.case?.serviceChecklist || [],
    case: normalizedCase,
    rejectedBy: item.rejectedByVetName || item.rejectedBy || undefined,
    vet: item.vet ? { id: item.vet.id, name: item.vet.name } : undefined,
  }
}

export const useVetVisitsStore = defineStore('VetVisitsStore', {
  state: (): VetVisitsState => ({
    visits: null,
    currentVisit: null,
    currentCase: null,
    currentMember: null,
    calendarEvents: []
  }),
  actions: {
    async fetchVisits(params?: {
      isCompleted?: boolean
      type?: string
      page?: number
      limit?: number
    }): Promise<PaginatedResponse<Visit>> {
      const { data } = await api.get('/vets/consultations', {
        params: {
          isCompleted: params?.isCompleted,
          type: params?.type,
          page: params?.page ?? 1,
          limit: params?.limit ?? 50
        }
      })
      const visits = (data.data || []).map(normalizeVisit)
      this.visits = visits
      return { data: visits, total: data.total, page: data.page, limit: data.limit }
    },

    async fetchVisitsForAdmin(params?: {
      isCompleted?: boolean
      type?: string
      page?: number
      limit?: number
    }): Promise<PaginatedResponse<Visit>> {
      const { data } = await api.get('/admin/vet-consultations', {
        params: {
          isCompleted: params?.isCompleted,
          type: params?.type,
          page: params?.page ?? 1,
          limit: params?.limit ?? 50
        }
      })
      const visits = (data.data || []).map(normalizeVisit)
      this.visits = visits
      return { data: visits, total: data.total, page: data.page, limit: data.limit }
    },

    async assignVetForAdmin(consultationId: string, vetId: string) {
      await api.patch(`/admin/vet-consultations/${consultationId}/assign-vet`, { vetId })
    },

    async saveNoteForAdmin(consultationId: string, note: string) {
      await api.patch(`/admin/vet-consultations/${consultationId}/notes`, { note })
    },

    async cancelConsultationForAdmin(consultationId: string) {
      await api.post(`/admin/vet-consultations/${consultationId}/cancel`)
    },

    async confirmConsultationForAdmin(consultationId: string) {
      await api.post(`/admin/vet-consultations/${consultationId}/confirm`)
    },

    async createConsultationForAdmin(payload: {
      memberId: string
      petId: string
      address?: string
      scheduledAt?: string
      services?: { id: string; name: string; price: number }[]
      products?: { id: string; name: string; price: number }[]
    }) {
      const { data } = await api.post('/admin/vet-consultations', payload)
      return data
    },

    async fetchVisitDetail(id: string): Promise<Visit> {
      const { data } = await api.get(`/vets/consultations/${id}`)
      const visit = normalizeVisit(data)
      this.currentVisit = visit
      return visit
    },

    async acceptVisit(id: string) {
      await api.post(`/vets/consultations/${id}/accept`)
    },

    async rejectVisit(id: string) {
      await api.post(`/vets/consultations/${id}/reject`)
    },

    async fetchMember(memberId: string): Promise<VetMember> {
      const { data } = await api.get(`/vets/members/${memberId}`)
      this.currentMember = data
      return data
    },

    async fetchCase(caseId: string): Promise<VetCase> {
      const { data } = await api.get(`/vet/cases/${caseId}`)

      const normalized: VetCase = {
        id: data.id ?? caseId,
        consultationId: data.vetConsultation?.id ?? data.consultationId ?? '',
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        services: data.serviceChecklist ?? data.services ?? [],
        notes: data.notes ?? [],
        assets: data.assets ?? [],
        member: data.member,
        pet: data.pet
      }

      this.currentCase = normalized
      return normalized
    },

    async updateServiceChecklist(caseId: string, services: VetService[]) {
      const checklist = services.map((s) => ({
        name: s.name,
        checked: !!s.checked
      }))

      const { data } = await api.patch(`/vet/cases/${caseId}/service-checklist`, { checklist })
      if (this.currentCase) {
        this.currentCase.services = data.serviceChecklist ?? services
      }
      return data
    },

    async addNote(caseId: string, notes: CaseNote[]) {
      const { data } = await api.post(`/vet/cases/${caseId}/notes`, { notes })
      return data
    },

    async uploadFile(file: File): Promise<CaseAsset> {
      const formData = new FormData()
      formData.append('files', file)
      const { data } = await api.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return (Array.isArray(data) ? data[0] : data) as CaseAsset
    },

    async addAssets(caseId: string, assets: CaseAsset[]) {
      const payload = assets.map((a) => ({
        filename: (a as any).name ?? a.filename,
        filesize: a.filesize,
        mimetype: a.mimetype,
        url: a.url
      }))

      const { data } = await api.patch(`/vet/cases/${caseId}/assets`, { assets: payload })
      return data
    },

    async customerNotReachable(caseId: string) {
      await api.post(`/vet/cases/${caseId}/customer-not-reachable`)
    },

    async closeCase(caseId: string) {
      await api.post(`/vet/cases/${caseId}/close`)
    },

    async fetchCalendar(startDate: string, type?: 'monthly' | 'weekly') {
      const { data } = await api.get('/vets/consultations/calendar', {
        params: { startDate, type }
      })
      const consultations = data.consultations || data || []
      this.calendarEvents = consultations.map((c: any) => ({
        id: c.id,
        title: c.member?.name || 'Visit',
        start: c.scheduledAt,
        status: normalizeStatus(c.status) as any,
        consultationId: c.id
      }))
      return data
    }
  }
})
