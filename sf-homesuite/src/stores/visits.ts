import { defineStore } from 'pinia'
import api from '@/utils/api'
import type { Visit, Case, Member, CalendarEvent, PaginatedResponse, Service, CaseNote, CaseAsset } from '@/types'

interface VisitsState {
  visits: Visit[] | null
  currentVisit: Visit | null
  currentCase: Case | null
  currentMember: Member | null
  calendarEvents: CalendarEvent[]
}

function normalizeStatus(status: string): string {
  return (status || '').toUpperCase()
}

function normalizeVisit(item: any): Visit {
  const normalizedStatus = normalizeStatus(item.status) as any

  // Prefer full case object if present; otherwise fall back to a minimal stub using caseId
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
    rejectedBy: item.rejectedByVetName || item.rejectedBy || undefined
  }
}

export const useVisitsStore = defineStore('VisitsStore', {
  state: (): VisitsState => ({
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

    async fetchMember(memberId: string): Promise<Member> {
      const { data } = await api.get(`/vets/members/${memberId}`)
      this.currentMember = data
      return data
    },

    async fetchCase(caseId: string): Promise<Case> {
      const { data } = await api.get(`/vet/cases/${caseId}`)

      // Normalise backend response so UI can always rely on services/notes/assets
      const normalized: Case = {
        id: data.id ?? caseId,
        consultationId: data.vetConsultation?.id ?? data.consultationId ?? '',
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        services: data.serviceChecklist ?? data.services ?? [],
        // Keep raw notes/assets shape but ensure arrays so UI doesn't break
        notes: data.notes ?? [],
        assets: data.assets ?? [],
        member: data.member,
        pet: data.pet
      }

      this.currentCase = normalized
      return normalized
    },

    async updateServiceChecklist(caseId: string, services: Service[]) {
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
      // API returns an array of files
      return (Array.isArray(data) ? data[0] : data) as CaseAsset
    },

    async addAssets(caseId: string, assets: CaseAsset[]) {
      const payload = assets.map((a) => ({
        filename: a.name,
        filesize: (a as any).filesize,
        mimetype: (a as any).mimetype,
        url: a.url,
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
        consultationId: c.id,
      }))
      return data
    }
  }
})
