<template>
  <v-card rounded="lg" elevation="0" border>
    <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">Visit Timeline</v-card-title>
    <v-card-text class="d-flex flex-column gr-3">
      <div class="d-flex justify-space-between">
        <div>
          <p class="text-caption text-grey-darken-1">Scheduled</p>
          <p class="text-body-2 font-weight-medium">{{ formatDateTime(scheduledAt) }}</p>
        </div>
        <div v-if="startedAt">
          <p class="text-caption text-grey-darken-1">Started</p>
          <p class="text-body-2 font-weight-medium">{{ formatDateTime(startedAt) }}</p>
        </div>
        <div v-if="endedAt">
          <p class="text-caption text-grey-darken-1">Ended</p>
          <p class="text-body-2 font-weight-medium">{{ formatDateTime(endedAt) }}</p>
        </div>
      </div>
      <div v-if="duration" class="d-flex align-center" style="gap: 6px">
        <v-icon icon="mdi-timer-outline" size="18" color="grey-darken-1" />
        <span class="text-body-2 text-grey-darken-1">Duration: {{ duration }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Visit, VetCase } from '@/stores/types/vet-types'
import { formatDateTime } from '@/util/vet-helpers'
import dayjs from 'dayjs'
import { computed } from 'vue'

const props = defineProps<{
  visit: Visit
  caseData: VetCase | null
}>()

const scheduledAt = computed(() => props.visit.scheduledAt || props.visit.createdAt)

const startedAt = computed(() => props.visit.acceptedAt || props.caseData?.createdAt || null)

const endedAt = computed(() => props.caseData?.updatedAt || null)

const duration = computed(() => {
  const start = startedAt.value
  const end = endedAt.value
  if (!start || !end) return null
  const mins = dayjs(end).diff(dayjs(start), 'minute')
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  const remainMins = mins % 60
  return `${hrs}h ${remainMins}m`
})
</script>
