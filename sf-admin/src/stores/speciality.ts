import { defineStore } from 'pinia'
import api from '@/util/api'

export interface Speciality {
    id: string
    name: string
}

export const useSpecialityStore = defineStore('SpecialityStore', {
    state: () => ({
        specialties: [] as Speciality[]
    }),

    actions: {
        async fetchSpecialities() {
            try {
                const response = await api.get('/specialities')
                this.specialties = response.data // API already gives [{id, name}, ...]
            } catch (error) {
                console.error('Error fetching specialties:', error)
            }
        }
    }
})
