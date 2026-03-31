<template>
  <v-card rounded="lg" elevation="0" border>
    <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">Customer & Pet</v-card-title>
    <v-card-text class="d-flex flex-column gr-3">
      <!-- Customer -->
      <div class="d-flex flex-column gr-1">
        <p class="text-caption text-grey-darken-1">Customer</p>
        <div class="d-flex align-center justify-space-between" style="gap: 10px">
          <div class="d-flex align-center" style="gap: 10px; min-width: 0">
            <v-avatar color="primary" size="40">
              <v-img v-if="member?.avatar" :src="member.avatar" />
              <span v-else class="text-white text-caption font-weight-bold">{{ customerInitials }}</span>
            </v-avatar>
            <p class="text-body-2 font-weight-medium text-truncate">
              {{ displayMember?.name || 'N/A' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Pet -->
      <div class="d-flex flex-column gr-1">
        <p class="text-caption text-grey-darken-1">Pet</p>
        <p class="text-body-2 font-weight-medium">
          {{
            pet
              ? [pet.name, pet.breed ? `(${pet.breed})` : null].filter(Boolean).join(' ')
              : 'N/A'
          }}
        </p>
      </div>

      <!-- Address -->
      <div v-if="displayMember?.address" class="d-flex flex-column gr-1">
        <p class="text-caption text-grey-darken-1">Address</p>
        <p class="text-body-2">
          {{ displayMember.address }}
        </p>
      </div>

      <!-- Phone + Actions -->
      <div v-if="displayMember?.phone" class="d-flex align-center justify-space-between" style="gap: 12px">
        <div class="d-flex flex-column">
          <p class="text-caption text-grey-darken-1">Phone</p>
          <p class="text-body-2">
            {{ displayMember.phone }}
          </p>
        </div>
        <div class="d-flex align-center" style="gap: 8px">
          <v-btn
            variant="tonal"
            color="success"
            size="small"
            :href="`tel:${displayMember.phone}`"
          >
            <v-icon start icon="mdi-phone" size="16" />
            Call
          </v-btn>
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            :href="displayMember.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayMember.address)}` : undefined"
            target="_blank"
          >
            <v-icon start icon="mdi-map-marker-outline" size="16" />
            Navigate
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Visit, Member } from '@/types'
import { computed } from 'vue'

const props = defineProps<{
  visit: Visit
  member: Member | null
}>()

const displayMember = computed(() => props.member || props.visit.member)
const pet = computed(() => props.member?.pets?.[0] || props.visit.pet)

const customerInitials = computed(() => {
  const name = displayMember.value?.name || 'C'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
})
</script>
