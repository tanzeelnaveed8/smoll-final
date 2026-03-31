import { defineStore } from 'pinia'
import api from '@/util/api'

// const data = [
//   {
//     id: 1, // {{ edit_1 }} Added unique id
//     caseId: 'C00388',
//     parentName: 'Fahad shehadat',
//     petName: 'Arya',
//     date: 'Dmac Hills, cluster 15',
//     status: 'Open'
//   },
//   {
//     id: 2, // {{ edit_2 }} Added unique id
//     caseId: 'C00388',
//     parentName: 'Fahad shehadat',
//     petName: 'Arya',
//     date: 'Dmac Hills, cluster 15',
//     status: 'Non- Emergeny'
//   },
//   {
//     id: 3, // {{ edit_3 }} Added unique id
//     caseId: 'C00388',
//     parentName: 'Fahad shehadat',
//     petName: 'Arya',
//     date: 'Dmac Hills, cluster 15',
//     status: 'Open'
//   },
//   {
//     id: 4, // {{ edit_4 }} Added unique id
//     caseId: 'C00388',
//     parentName: 'Fahad shehadat',
//     petName: 'Arya',
//     date: 'Dmac Hills, cluster 15',
//     status: 'Non- Emergeny'
//   },
//   {
//     id: 5, // {{ edit_5 }} Added unique id
//     caseId: 'C00388',
//     parentName: 'Fahad shehadat',
//     petName: 'Arya',
//     date: 'Dmac Hills, cluster 15',
//     status: 'Open'
//   },
//   {
//     id: 6, // {{ edit_6 }} Added unique id
//     caseId: 'C00388',
//     parentName: 'Fahad shehadat',
//     petName: 'Arya',
//     date: 'Dmac Hills, cluster 15',
//     status: 'Open'
//   },
//   {
//     id: 7, // {{ edit_7 }} Added unique id
//     caseId: 'C00388',
//     parentName: 'Fahad shehadat',
//     petName: 'Arya',
//     date: 'Dmac Hills, cluster 15',
//     status: 'Non- Emergeny'
//   },
//   {
//     id: 8, // {{ edit_8 }} Added unique id
//     caseId: 'C00388',
//     parentName: 'Fahad shehadat',
//     petName: 'Arya',
//     date: 'Dmac Hills, cluster 15',
//     status: 'Non- Emergeny'
//   }
// ]

export const useCaseStore = defineStore('CaseStore', {
  state: () => ({}),
  actions: {
    async fetchCases(search?: string, page?: number) {
      const data = await api.get('/admin/cases', {
        params: {
          search,
          page: page ? page : 1,
          limit: 10
        }
      })
      return data.data
    },
    async fetchCaseDetails(id: string) {
      const data = await api.get(`/admin/cases/${id}`)
      return data.data
    },
    async addNote(caseId: string, note: string, author: string) {
      await api.post(`/admin/cases/${caseId}/notes`, { note, author })
    },
    async cancelCase(caseId: string) {
      await api.post(`/admin/cases/${caseId}/cancel`)
    },
    async createCase(payload: { memberId: string; petId: string; vetId: string; description: string; scheduledAt?: string }) {
      const { data } = await api.post('/admin/cases', payload)
      return data
    }
  }
})
