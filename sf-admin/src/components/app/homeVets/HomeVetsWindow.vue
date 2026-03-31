<template>
  <v-sheet class="d-flex flex-column gr-4">
    <v-row dense>
      <v-col
        v-for="vet in homeVets"
        :key="vet.id"
        cols="12"
        md="6"
      >
        <v-card class="vet-card" rounded="xl" elevation="1">
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-3">
              <div class="d-flex align-center" style="gap: 10px">
                <v-avatar color="primary" size="40">
                  <v-img v-if="vet.profileImg?.url" :src="vet.profileImg.url" />
                  <span v-else class="text-white text-body-2 font-weight-bold">
                    {{ getInitials(vet.name) }}
                  </span>
                </v-avatar>
                <div>
                  <p class="text-body-1 font-weight-semibold mb-1">
                    {{ vet.name || 'Doctor' }}
                  </p>
                  <p class="text-caption text-grey-darken-1 mb-1">
                    {{ vet.designation || 'Veterinarian' }}
                  </p>
                  <v-chip
                    size="x-small"
                    :color="vet.isSuspended ? 'grey' : vet.isOnline ? 'success' : 'orange'"
                    variant="tonal"
                    class="text-capitalize"
                  >
                    {{ vet.isSuspended ? 'Suspended' : vet.isOnline ? 'Available' : 'Busy' }}
                  </v-chip>
                </div>
              </div>
            </div>

            <div class="vet-details mb-3">
              <p v-if="vet.email" class="text-caption text-grey-darken-2 d-flex align-center mb-1">
                <v-icon icon="mdi-email-outline" size="16" class="mr-1" />
                {{ vet.email }}
              </p>
              <p v-if="vet.phone" class="text-caption text-grey-darken-2 d-flex align-center mb-1">
                <v-icon icon="mdi-phone" size="16" class="mr-1" />
                {{ vet.phone }}
              </p>
              <p v-if="vet.address" class="text-caption text-grey-darken-2 d-flex align-center mb-1">
                <v-icon icon="mdi-map-marker-outline" size="16" class="mr-1" />
                {{ vet.address }}
              </p>
            </div>

            <div class="d-flex align-center mt-3">
              <div>
                <p class="text-caption text-grey-darken-1 mb-1">Assigned Visits</p>
                <p class="text-caption text-grey-darken-2">
                  View assigned cases in vet details.
                </p>
              </div>
              <v-spacer />
              <v-btn
                variant="text"
                size="small"
                class="text-none"
                color="primary"
                :to="`/smoll-home/veterinarians/${vet.id}`"
              >
                View Details
              </v-btn>
            </div>

            <div class="d-flex justify-end mt-2">
              <v-btn
                variant="text"
                size="small"
                class="text-none"
                color="red-darken-1"
                @click="$emit('remove', vet)"
              >
                Remove
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <TableFooter :maxValue path="smoll-home/veterinarians" />
  </v-sheet>
</template>

<script lang="ts" setup>
import TableFooter from '@/components/partials/table/TableFooter.vue'
import type { HomeVet } from '@/stores/types/homeVets'

const props = defineProps<{
  maxValue: number
  homeVets: HomeVet[]
  actionLoading: boolean
}>()

defineEmits<{
  (e: 'remove', vet: HomeVet): void
}>()

const getInitials = (name?: string | null) => {
  if (!name) return 'DR'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
.vet-card {
  border: 1px solid #e3e7f0;
  transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
}

.vet-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
  border-color: #bbdefb;
}
</style>
