<template>
  <v-card rounded="lg" elevation="0" border>
    <v-card-text class="d-flex flex-column gr-3 pa-4">
      <!-- Header: Avatar + Name + Status -->
      <div class="d-flex justify-space-between align-center">
        <div class="d-flex align-center" style="gap: 10px; min-width: 0">
          <v-avatar color="primary" size="38">
            <span class="text-white text-caption font-weight-bold">{{ initials }}</span>
          </v-avatar>
          <div style="min-width: 0">
            <p class="text-body-2 font-weight-medium text-truncate">{{ visit.member?.name || 'Customer' }}</p>
            <p class="text-caption text-grey-darken-1 text-truncate">{{ petInfo }}</p>
          </div>
        </div>
        <v-chip :color="statusColor" size="x-small" variant="tonal" class="ml-2 flex-shrink-0">
          {{ statusLabel }}
        </v-chip>
      </div>

      <v-divider />

      <!-- Info & details -->
      <div class="d-flex flex-column gr-1">
        <div class="d-flex align-center" style="gap: 4px">
          <v-icon icon="mdi-calendar" size="16" color="grey-darken-1" />
          <span class="text-caption text-grey-darken-1">{{ formattedDate }}</span>
        </div>
        <div class="d-flex align-center" style="gap: 4px">
          <v-icon icon="mdi-clock-outline" size="16" color="grey-darken-1" />
          <span class="text-caption text-grey-darken-1">{{ formattedTime }}</span>
        </div>
        <div v-if="memberAddress" class="d-flex align-center" style="gap: 4px">
          <v-icon icon="mdi-map-marker-outline" size="16" color="grey-darken-1" />
          <span class="text-caption text-grey-darken-1 text-truncate">{{ memberAddress }}</span>
        </div>
        <div v-if="memberPhone" class="d-flex align-center" style="gap: 4px">
          <v-icon icon="mdi-phone" size="16" color="grey-darken-1" />
          <span class="text-caption text-grey-darken-1">{{ memberPhone }}</span>
        </div>
        <div v-if="visit.services?.length" class="d-flex align-center" style="gap: 4px">
          <v-icon icon="mdi-medical-bag" size="16" color="grey-darken-1" />
          <span class="text-caption text-grey-darken-1">
            {{ visit.services.length }} service{{ visit.services.length > 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <!-- Required services -->
      <div v-if="visit.services?.length" class="d-flex flex-column gr-1">
        <p class="text-caption text-grey-darken-1">Required Services</p>
        <div class="d-flex flex-wrap" style="gap: 4px">
          <v-chip v-for="service in visit.services.slice(0, 3)" :key="service.id" size="x-small" variant="outlined">
            {{ service.name }}
          </v-chip>
          <v-chip v-if="visit.services.length > 3" size="x-small" variant="text" class="text-grey">
            +{{ visit.services.length - 3 }} more
          </v-chip>
        </div>
      </div>

      <!-- Rejected info -->
      <div v-if="visit.rejectedBy" class="d-flex align-center" style="gap: 4px">
        <v-icon icon="mdi-close-circle" size="14" color="error" />
        <span class="text-caption text-error">Rejected by {{ visit.rejectedBy }}</span>
      </div>
    </v-card-text>

    <!-- Actions -->
    <v-card-actions class="px-4 pb-3 pt-0">
      <v-btn
        variant="outlined"
        color="primary"
        size="small"
        :to="`/visits/${visit.id}`"
      >
        View
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="showActions"
        variant="tonal"
        color="error"
        size="small"
        :loading="rejecting"
        @click="handleReject"
      >
        Reject
      </v-btn>
      <v-btn
        v-if="showActions"
        variant="flat"
        color="primary"
        size="small"
        :loading="accepting"
        @click="handleAccept"
      >
        Accept Visit
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Visit } from '@/types'
import { formatDate, formatTime, getStatusColor, getStatusLabel } from '@/utils/helpers'
import { computed, ref } from 'vue'

interface Props {
  visit: Visit
  readonly?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  accept: []
  reject: []
}>()

const accepting = ref(false)
const rejecting = ref(false)

const initials = computed(() => {
  const name = props.visit.member?.name || 'C'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
})

const petInfo = computed(() => {
  const pet = props.visit.pet
  if (!pet) return ''
  const parts = [pet.name, pet.species, pet.breed].filter(Boolean)
  return parts.join(' · ')
})

const formattedDate = computed(() => {
  const d = props.visit.scheduledAt || props.visit.createdAt
  return d ? formatDate(d) : 'N/A'
})

const formattedTime = computed(() => {
  const d = props.visit.scheduledAt || props.visit.createdAt
  return d ? formatTime(d) : ''
})

const memberAddress = computed(() => props.visit.member?.address || '')
const memberPhone = computed(() => props.visit.member?.phone || '')

const statusColor = computed(() => getStatusColor(props.visit.status))
const statusLabel = computed(() => getStatusLabel(props.visit.status))

const showActions = computed(
  () =>
    !props.readonly &&
    ['INITIATED', 'SCHEDULED'].includes(props.visit.status) &&
    !props.visit.rejectedBy &&
    !props.visit.acceptedAt,
)

const handleAccept = async () => {
  accepting.value = true
  try {
    emit('accept')
  } finally {
    accepting.value = false
  }
}

const handleReject = async () => {
  rejecting.value = true
  try {
    emit('reject')
  } finally {
    rejecting.value = false
  }
}
</script>
