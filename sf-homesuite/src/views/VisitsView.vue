<template>
  <div class="page-container">
    <h2 class="text-h6 font-weight-medium">Visit History</h2>

    <!-- Filters -->
    <v-card rounded="lg" elevation="0" border>
      <v-card-text class="d-flex flex-wrap" style="gap: 10px">
        <v-text-field
          v-model="search"
          placeholder="Search..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          density="compact"
          clearable
          style="min-width: 150px; flex: 1"
        />
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          item-title="text"
          item-value="value"
          placeholder="Status"
          hide-details
          density="compact"
          clearable
          style="min-width: 140px; max-width: 200px"
        />
      </v-card-text>
    </v-card>

    <!-- Mobile Cards / Desktop Table -->
    <template v-if="loading">
      <div class="d-flex flex-column gr-3">
        <v-skeleton-loader v-for="i in 4" :key="i" type="card" />
      </div>
    </template>

    <template v-else-if="!filteredVisits.length">
      <v-sheet rounded="lg" class="pa-8 text-center" border>
        <v-icon icon="mdi-history" size="48" color="grey-lighten-1" class="mb-3" />
        <p class="text-body-1 text-grey-darken-1">No visits found</p>
      </v-sheet>
    </template>

    <template v-else>
      <div class="d-flex flex-column gr-3">
        <v-card
          v-for="visit in filteredVisits"
          :key="visit.id"
          rounded="lg"
          elevation="0"
          border
          :to="`/visits/${visit.id}`"
          class="visit-card"
        >
          <v-card-text class="d-flex flex-column gr-2">
            <div class="d-flex justify-space-between align-center">
              <div class="d-flex align-center" style="gap: 10px">
                <v-avatar color="primary" size="36">
                  <span class="text-white text-caption">{{ getInitials(visit.member?.name) }}</span>
                </v-avatar>
                <div>
                  <p class="text-body-2 font-weight-medium">{{ visit.member?.name || 'Customer' }}</p>
                  <p class="text-caption text-grey-darken-1">{{ visit.pet?.name || '' }}</p>
                </div>
              </div>
              <v-chip :color="getStatusColor(visit.status)" size="x-small" variant="tonal">
                {{ getStatusLabel(visit.status) }}
              </v-chip>
            </div>
            <div class="d-flex align-center text-caption text-grey-darken-1" style="gap: 12px">
              <span class="d-flex align-center" style="gap: 4px">
                <v-icon icon="mdi-calendar" size="14" />
                {{ formatDateTime(visit.scheduledAt || visit.createdAt) }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useVisitsStore } from '@/stores/visits'
import type { Visit } from '@/types'
import { formatDateTime, getStatusColor, getStatusLabel } from '@/utils/helpers'
import { computed, onMounted, ref } from 'vue'

const visitsStore = useVisitsStore()

const visits = ref<Visit[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref<string | null>(null)

const statusOptions = [
  { text: 'Completed', value: 'COMPLETED' },
  { text: 'Rejected', value: 'REJECTED' },
  { text: 'Cancelled', value: 'CANCELLED' },
  { text: 'Not Reachable', value: 'NOT_REACHABLE' }
]

const getInitials = (name?: string) => {
  if (!name) return 'C'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const filteredVisits = computed(() => {
  let result = visits.value
  if (statusFilter.value) {
    result = result.filter((v) => v.status === statusFilter.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(
      (v) =>
        v.member?.name?.toLowerCase().includes(q) ||
        v.pet?.name?.toLowerCase().includes(q)
    )
  }
  return result
})

onMounted(async () => {
  try {
    loading.value = true
    const data = await visitsStore.fetchVisits({ isCompleted: true })
    visits.value = data.data
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.visit-card {
  cursor: pointer;
  transition: background-color 0.15s;
}
.visit-card:hover {
  background-color: #f5f7fa;
}
</style>
