<template>
  <div class="d-flex flex-column gr-4">
    <template v-if="loading">
      <v-sheet class="d-flex justify-center align-center" style="min-height: 300px">
        <v-progress-circular indeterminate color="primary" />
      </v-sheet>
    </template>

    <template v-else-if="visit">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between" style="gap: 12px">
        <div class="d-flex align-center" style="gap: 8px; min-width: 0">
          <v-btn icon variant="text" size="small" @click="$router.back()">
            <v-icon icon="mdi-arrow-left" />
          </v-btn>
          <div class="d-flex flex-column" style="min-width: 0">
            <h2 class="text-body-1 font-weight-bold text-truncate">
              Visit Details
            </h2>
            <div class="d-flex align-center" style="gap: 6px">
              <span class="text-caption text-grey-darken-1">Status</span>
              <v-chip :color="getStatusColor(visit.status)" size="x-small" variant="tonal">
                {{ getStatusLabel(visit.status) }}
              </v-chip>
            </div>
          </div>
        </div>
        <v-avatar color="primary" size="48">
          <span class="text-white text-body-2 font-weight-bold">
            {{
              (member?.name || visit.member?.name || 'U')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            }}
          </span>
        </v-avatar>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex flex-column gr-2 mt-3">
        <div class="d-flex flex-wrap" style="gap: 8px">
          <v-btn
            v-if="canStartVisit"
            color="primary"
            variant="flat"
            size="small"
            :loading="actionLoading === 'start'"
            @click="handleStartVisit"
          >
            <v-icon start icon="mdi-play-circle" size="16" />
            Start Visit
          </v-btn>
          <v-btn
            v-if="canCloseVisit"
            color="success"
            variant="flat"
            size="small"
            :loading="actionLoading === 'close'"
            :disabled="!allServicesChecked"
            @click="handleCloseVisit"
          >
            <v-icon start icon="mdi-check-circle" size="16" />
            Complete Visit
          </v-btn>
          <v-btn
            v-if="isActiveVisit"
            color="warning"
            variant="flat"
            size="small"
            :loading="actionLoading === 'notReachable'"
            @click="handleNotReachable"
          >
            <v-icon start icon="mdi-alert-circle" size="16" />
            Customer is Not Reachable
          </v-btn>
        </div>
        <div v-if="!allServicesChecked && canCloseVisit" class="d-flex align-center" style="gap: 6px">
          <v-icon icon="mdi-alert" color="warning" size="16" />
          <span class="text-caption text-warning">Complete all services before closing.</span>
        </div>
      </div>

      <!-- Content -->
      <div class="d-flex flex-column gr-4">
        <VisitInfo :visit="visit" :member="member" />
        <VisitTimestamp :visit="visit" :case-data="caseData" />
        <ServiceChecklist
          :services="caseData?.services || visit.services || []"
          :disabled="!isActiveVisit"
          @update="handleServiceUpdate"
        />
        <ExtraServices
          v-if="isActiveVisit"
          :case-id="caseData?.id"
          @added="refreshCase"
        />
        <VisitNotes
          :notes="caseData?.notes || []"
          :case-id="caseData?.id"
          :disabled="!isActiveVisit"
          @added="refreshCase"
        />
        <VisitPhotos
          :assets="caseData?.assets || []"
          :case-id="caseData?.id"
          :disabled="!isActiveVisit"
          @uploaded="refreshCase"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useVetVisitsStore } from '@/stores/vet-visits'
import type { Visit, VetCase, VetMember, VetService } from '@/stores/types/vet-types'
import { getStatusColor, getStatusLabel } from '@/util/vet-helpers'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import VisitInfo from '@/components/smoll-home/visits/VisitInfo.vue'
import VisitTimestamp from '@/components/smoll-home/visits/VisitTimestamp.vue'
import ServiceChecklist from '@/components/smoll-home/visits/ServiceChecklist.vue'
import ExtraServices from '@/components/smoll-home/visits/ExtraServices.vue'
import VisitNotes from '@/components/smoll-home/visits/VisitNotes.vue'
import VisitPhotos from '@/components/smoll-home/visits/VisitPhotos.vue'

const route = useRoute()
const router = useRouter()
const visitsStore = useVetVisitsStore()

const visit = ref<Visit | null>(null)
const caseData = ref<VetCase | null>(null)
const member = ref<VetMember | null>(null)
const loading = ref(true)
const actionLoading = ref<string | null>(null)

const visitId = computed(() => route.params.id as string)

const isActiveVisit = computed(() => {
  const status = (visit.value?.status || '').toUpperCase()
  return ['ACCEPTED', 'IN_PROGRESS'].includes(status)
})

const canStartVisit = computed(() =>
  ['SCHEDULED', 'INITIATED'].includes(visit.value?.status || '')
)

const canCloseVisit = computed(() =>
  visit.value?.status === 'IN_PROGRESS'
)

const allServicesChecked = computed(() => {
  const services = caseData.value?.services || visit.value?.services || []
  return services.length > 0 && services.every((s) => s.checked)
})

const fetchVisitData = async () => {
  try {
    loading.value = true
    const visitData = await visitsStore.fetchVisitDetail(visitId.value)
    visit.value = visitData

    if (visitData.case?.id) {
      caseData.value = await visitsStore.fetchCase(visitData.case.id)
    }

    if (visitData.member?.id) {
      member.value = await visitsStore.fetchMember(visitData.member.id)
    }
  } finally {
    loading.value = false
  }
}

const refreshCase = async () => {
  if (caseData.value?.id) {
    caseData.value = await visitsStore.fetchCase(caseData.value.id)
  }
}

const handleStartVisit = async () => {
  actionLoading.value = 'start'
  try {
    await visitsStore.acceptVisit(visitId.value)
    toast.success('Visit started')
    await fetchVisitData()
  } finally {
    actionLoading.value = null
  }
}

const handleCloseVisit = async () => {
  if (!caseData.value?.id) return
  actionLoading.value = 'close'
  try {
    await visitsStore.closeCase(caseData.value.id)
    toast.success('Visit closed successfully')
    await fetchVisitData()
  } finally {
    actionLoading.value = null
  }
}

const handleNotReachable = async () => {
  if (!caseData.value?.id) return
  actionLoading.value = 'notReachable'
  try {
    await visitsStore.customerNotReachable(caseData.value.id)
    toast.info('Customer marked as not reachable')
    await fetchVisitData()
  } finally {
    actionLoading.value = null
  }
}

const handleServiceUpdate = async (services: VetService[]) => {
  if (!caseData.value?.id) return
  await visitsStore.updateServiceChecklist(caseData.value.id, services)
  await refreshCase()
}

onMounted(() => {
  fetchVisitData()
})
</script>
