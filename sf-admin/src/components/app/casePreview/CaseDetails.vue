<template>
  <v-card flat rounded="lg" style="border: 1px solid #e8edf0">
    <v-card-text class="pa-5">
      <div class="d-flex justify-space-between align-start">

        <!-- Left: Pet info -->
        <div class="d-flex align-center gc-4">
          <v-avatar size="56" color="#f0f0f0" :image="caseDetails?.pet?.photos?.[0]?.url">
            <v-icon v-if="!caseDetails?.pet?.photos?.[0]?.url" icon="$tb-user-circle" size="28" color="grey" />
          </v-avatar>
          <div>
            <p class="text-body-1 font-weight-bold text-grey1">{{ caseDetails?.pet?.name ?? '-' }}</p>
            <p class="text-caption text-grey2 mt-1">
              {{ caseDetails?.pet?.species ?? '' }}
              <template v-if="caseDetails?.pet?.age != null"> · {{ caseDetails.pet.age }} yrs</template>
              <template v-if="caseDetails?.pet?.gender"> · {{ caseDetails.pet.gender }}</template>
            </p>
            <v-btn
              variant="plain"
              class="px-0 mt-1 text-primary opacity-100"
              flat
              density="compact"
              min-height="auto"
              height="auto"
              min-width="auto"
              style="font-size: 12px"
              @click="dialog = true"
            >View Profile</v-btn>
          </div>
        </div>

        <!-- Right: Status + Meta -->
        <div class="d-flex flex-column align-end gr-3">
          <v-chip
            size="small"
            :color="getCaseStatusData(caseDetails?.status).color ?? '#f7f7f7'"
            variant="tonal"
            class="font-weight-medium text-capitalize"
            style="letter-spacing: 0"
          >
            {{ getCaseStatusData(caseDetails?.status).label }}
          </v-chip>
          <div class="d-flex gc-4 text-right">
            <div>
              <p class="text-caption text-grey2" style="font-weight: 600">Visit Date</p>
              <p class="text-body-2 font-weight-bold mt-1">
                {{ caseDetails?.createdAt ? dayjs(caseDetails.createdAt).format('DD MMM YYYY') : '-' }}
              </p>
            </div>
            <div>
              <p class="text-caption text-grey2" style="font-weight: 600">Time</p>
              <p class="text-body-2 font-weight-bold mt-1">
                {{ caseDetails?.createdAt ? dayjs(caseDetails.createdAt).format('hh:mm A') : '-' }}
              </p>
            </div>
          </div>
          <p class="text-caption text-grey2 font-weight-medium">ID: {{ caseDetails?.id }}</p>
        </div>

      </div>
    </v-card-text>
  </v-card>

  <v-dialog v-model="dialog">
    <PetProfileModal :petDetails="caseDetails?.pet" @closeDialog="dialog = false" />
  </v-dialog>
</template>

<script lang="ts" setup>
import PetProfileModal from '@/components/modal/PetProfileModal.vue'
import type { CaseDetail } from '@/stores/types/cases'
import { getCaseStatusData } from '@/util/helpers'
import dayjs from 'dayjs'
import { ref } from 'vue'

const props = defineProps<{
  caseDetails: CaseDetail
}>()

const dialog = ref(false)
</script>
