<template>
  <div class="page-container">
    <v-sheet color="transparent">
      <div class="d-flex align-center justify-space-between">
        <div>
          <p class="text-h6 font-weight-medium">
            Hello, {{ user?.name }}
          </p>
          <p class="text-body-2 text-grey-darken-1 mt-1">
            Manage your upcoming home visits
          </p>
        </div>
        <v-avatar color="primary" size="48">
          <span class="text-white text-body-2 font-weight-bold">
            {{ (user?.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) }}
          </span>
        </v-avatar>
      </div>
    </v-sheet>
    <UpcomingVisits :visits="upcomingVisits" :loading="loading" @accept="handleAccept" @reject="handleReject" />

    <v-sheet color="transparent" class="mt-6">
      <h3 class="text-h6 font-weight-medium mb-4">My Schedule</h3>
      <div v-if="myScheduleVisits.length" class="d-flex flex-column gr-3">
        <VisitCard
          v-for="visit in myScheduleVisits"
          :key="visit.id"
          :visit="visit"
          readonly
        />
      </div>
      <p v-else class="text-body-2 text-grey-darken-1">
        No visits scheduled yet
      </p>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useVisitsStore } from '@/stores/visits'
import type { Visit } from '@/types'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue3-toastify'
import UpcomingVisits from '@/components/dashboard/UpcomingVisits.vue'
import VisitCard from '@/components/dashboard/VisitCard.vue'
import dayjs from 'dayjs'

const { user } = useAuthStore()
const visitsStore = useVisitsStore()

const visits = ref<Visit[] | null>(null)
const loading = ref(true)

const upcomingVisits = computed(() => {
  const now = dayjs()
  return (visits.value || [])
    .filter((v) => ['INITIATED', 'SCHEDULED'].includes(v.status))
    // Only show visits that have not been accepted or rejected yet
    .filter((v) => !v.acceptedAt && !v.rejectedBy)
    .filter((v) => {
      const d = v.scheduledAt || v.createdAt
      return d ? dayjs(d).isAfter(now) || dayjs(d).isSame(now, 'day') : false
    })
    .sort((a, b) => dayjs(a.scheduledAt || a.createdAt).valueOf() - dayjs(b.scheduledAt || b.createdAt).valueOf())
})

const myScheduleVisits = computed(() =>
  // Show visits that the vet has accepted but not yet completed/rejected
  (visits.value || []).filter(
    (v) =>
      !!v.acceptedAt &&
      !['COMPLETED', 'REJECTED'].includes(v.status),
  ),
)

const fetchVisits = async () => {
  try {
    loading.value = true
    const result = await visitsStore.fetchVisits()
    visits.value = result.data
  } finally {
    loading.value = false
  }
}

const handleAccept = async (id: string) => {
  await visitsStore.acceptVisit(id)
  toast.success('Visit accepted')
  await fetchVisits()
}

const handleReject = async (id: string) => {
  await visitsStore.rejectVisit(id)
  toast.info('Visit rejected')
  await fetchVisits()
}

onMounted(() => {
  fetchVisits()
})
</script>
