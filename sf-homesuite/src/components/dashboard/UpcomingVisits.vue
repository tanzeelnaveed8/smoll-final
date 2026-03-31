<template>
  <v-sheet color="transparent">
    <h3 class="text-h6 font-weight-medium mb-4">Upcoming Visits</h3>

    <template v-if="loading">
      <div class="d-flex flex-column gr-3">
        <v-skeleton-loader v-for="i in 3" :key="i" type="card" />
      </div>
    </template>

    <template v-else-if="!visits?.length">
      <v-sheet rounded="lg" class="pa-8 text-center">
        <v-icon icon="mdi-calendar-blank" size="48" color="grey-lighten-1" class="mb-3" />
        <p class="text-body-1 text-grey-darken-1">No upcoming visits</p>
      </v-sheet>
    </template>

    <template v-else>
      <div class="d-flex flex-column gr-3">
        <VisitCard
          v-for="visit in visits"
          :key="visit.id"
          :visit="visit"
          @accept="$emit('accept', visit.id)"
          @reject="$emit('reject', visit.id)"
        />
      </div>
    </template>
  </v-sheet>
</template>

<script setup lang="ts">
import type { Visit } from '@/types'
import VisitCard from './VisitCard.vue'

defineProps<{
  visits: Visit[] | null
  loading: boolean
}>()

defineEmits<{
  accept: [id: string]
  reject: [id: string]
}>()
</script>
