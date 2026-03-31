<template>
  <div class="d-flex flex-column gr-4">
    <div class="d-flex justify-space-between align-center">
      <div>
        <h2 class="text-h6 font-weight-bold" style="color: #1565C0">Visits & Orders</h2>
        <p class="text-caption text-grey-darken-1">Manage upcoming and past vet visits</p>
      </div>
      <v-btn
        color="primary"
        class="text-body-2 text-none"
        prepend-icon="mdi-plus"
        size="small"
        to="/smoll-home/visits/add"
      >
        Add Visit
      </v-btn>
    </div>

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
          @update:model-value="debouncedFetch"
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

    <!-- Loading -->
    <template v-if="loading">
      <div class="d-flex flex-column gr-3">
        <v-skeleton-loader v-for="i in 4" :key="i" type="card" />
      </div>
    </template>

    <!-- Empty -->
    <template v-else-if="!filteredCases.length">
      <v-sheet rounded="lg" class="pa-8 text-center" border>
        <v-icon icon="mdi-history" size="48" color="grey-lighten-1" class="mb-3" />
        <p class="text-body-1 text-grey-darken-1">No visits found</p>
      </v-sheet>
    </template>

    <!-- List -->
    <template v-else>
      <div class="d-flex flex-column gr-3">
        <v-expansion-panels multiple class="visit-panels">
          <v-expansion-panel
            v-for="c in filteredCases"
            :key="c.id"
            rounded="lg"
            elevation="0"
            class="visit-panel"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center" style="gap: 10px">
                  <v-avatar color="primary" size="32">
                    <span class="text-white text-caption">{{ getInitials(c.member?.name) }}</span>
                  </v-avatar>
                  <div>
                    <div class="d-flex align-center" style="gap: 6px">
                      <span class="text-body-2 font-weight-medium">
                        {{ c.member?.name || 'Customer' }}
                      </span>
                      <span v-if="c.pet?.name" class="text-caption text-grey-darken-1">
                        • Pet: {{ c.pet.name }}
                      </span>
                    </div>
                    <div class="text-caption text-grey-darken-1 d-flex align-center" style="gap: 10px">
                      <span class="d-flex align-center" style="gap: 4px">
                        <v-icon icon="mdi-calendar" size="14" />
                        {{ dayjs(c.scheduledAt || c.createdAt).format('YYYY-MM-DD') }}
                      </span>
                      <span v-if="c.scheduledAt" class="d-flex align-center" style="gap: 4px">
                        <v-icon icon="mdi-clock-outline" size="14" />
                        {{ dayjs(c.scheduledAt || c.createdAt).format('HH:mm') }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="d-flex align-center" style="gap: 12px">
                  <span v-if="getVisitAmount(c) !== null" class="text-body-2 font-weight-bold" style="color: #2e7d32">
                    AED {{ getVisitAmount(c) }}
                  </span>
                  <v-chip
                    size="x-small"
                    :color="getStatusColor(c.status)"
                    variant="tonal"
                    class="text-capitalize"
                  >
                    {{ getStatusLabel(c.status) }}
                  </v-chip>
                </div>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="d-flex flex-column gr-3">
                <!-- Details -->
                <div>
                  <p class="text-caption text-grey-darken-1 mb-1">Details</p>
                  <div class="d-flex flex-wrap" style="gap: 16px">
                    <div class="visit-info-block">
                      <p class="text-caption text-grey-darken-1 mb-1">Address</p>
                      <p class="text-body-2">
                        {{ c.member?.address || '—' }}
                      </p>
                    </div>
                    <div class="visit-info-block">
                      <p class="text-caption text-grey-darken-1 mb-1">Contact</p>
                      <p class="text-body-2">
                        {{ c.member?.phone || '—' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Assigned vet -->
                <div class="visit-info-block">
                  <p class="text-caption text-grey-darken-1 mb-1">Assign Vet</p>
                  <v-select
                    v-model="selectedVetByVisit[c.id]"
                    :items="vets"
                    item-title="name"
                    item-value="id"
                    placeholder="Select vet"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    clearable
                    class="mt-1 assign-vet-select"
                    :chips="!!selectedVetByVisit[c.id]"
                    closable-chips
                  />
                </div>

                <!-- Items -->
                <div class="visit-items" v-if="c.items && c.items.length">
                  <p class="text-caption text-grey-darken-1 mb-1">Items</p>
                  <div class="d-flex flex-wrap" style="gap: 8px">
                    <v-chip
                      v-for="(item, idx) in c.items"
                      :key="idx"
                      size="x-small"
                      color="grey-lighten-3"
                      class="text-caption"
                    >
                      {{ typeof item === 'string' ? item : item.name || 'Item' }}
                    </v-chip>
                  </div>
                </div>

                <!-- Custom notes -->
                <div class="visit-notes">
                  <p class="text-caption text-grey-darken-1 mb-1">Custom Notes</p>
                  <v-textarea
                    v-model="notesByVisit[c.id]"
                    rows="2"
                    density="comfortable"
                    variant="outlined"
                    hide-details="auto"
                    placeholder="Add notes..."
                    class="visit-notes-input"
                  />
                </div>

                <div class="d-flex flex-wrap justify-space-between align-center" style="gap: 8px">
                  <div class="d-flex align-center" style="gap: 8px">
                    <v-btn
                      variant="text"
                      color="primary"
                      size="small"
                      class="text-none"
                      prepend-icon="mdi-file-document-outline"
                      @click="handleInvoice(c)"
                    >
                      View Invoice
                    </v-btn>
                  </div>
                  <div class="d-flex align-center" style="gap: 8px">
                    <v-btn
                      variant="outlined"
                      color="grey-darken-1"
                      size="small"
                      class="text-none"
                      v-if="['SCHEDULED', 'INITIATED', 'ACCEPTED'].includes(c.status)"
                      @click="handleCancel(c)"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      color="primary"
                      size="small"
                      class="text-none"
                      v-if="['SCHEDULED', 'INITIATED', 'ACCEPTED'].includes(c.status)"
                      @click="handleConfirm(c)"
                    >
                      Confirm
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </template>
  </div>

  <!-- Invoice dialog -->
  <v-dialog v-model="showInvoice" max-width="520">
    <v-card rounded="xl">
      <v-card-title class="d-flex justify-space-between align-center px-5 pt-5 pb-2">
        <div>
          <h3 class="text-h6 font-weight-bold mb-1">Visit Invoice</h3>
          <p class="text-caption text-grey-darken-1">
            {{ invoiceVisit?.member?.name || 'Customer' }} •
            <span v-if="invoiceVisit?.pet?.name">Pet: {{ invoiceVisit?.pet?.name }}</span>
          </p>
        </div>
        <v-btn icon variant="text" color="grey" @click="showInvoice = false">
          <v-icon icon="mdi-close" />
        </v-btn>
      </v-card-title>
      <v-card-text class="px-5 pb-5 pt-1">
        <div class="d-flex flex-column gr-3">
          <div class="d-flex justify-space-between text-caption text-grey-darken-1">
            <span>Date</span>
            <span>Time</span>
          </div>
          <div class="d-flex justify-space-between text-body-2 mb-2">
            <span>
              {{ invoiceVisit ? dayjs(invoiceVisit.scheduledAt || invoiceVisit.createdAt).format('YYYY-MM-DD') : '—' }}
            </span>
            <span>
              {{ invoiceVisit ? dayjs(invoiceVisit.scheduledAt || invoiceVisit.createdAt).format('HH:mm') : '--:--' }}
            </span>
          </div>

          <v-divider class="my-2" />

          <div>
            <p class="text-caption text-grey-darken-1 mb-1">Items</p>
            <div
              v-if="
                invoiceVisit &&
                ((invoiceVisit.services && invoiceVisit.services.length) ||
                  (invoiceVisit.case && invoiceVisit.case.services && invoiceVisit.case.services.length))
              "
            >
              <div
                v-for="(s, idx) in (invoiceVisit.services && invoiceVisit.services.length
                  ? invoiceVisit.services
                  : invoiceVisit.case?.services || [])"
                :key="s.id || idx"
                class="d-flex justify-space-between text-body-2 mb-1"
              >
                <span>{{ s.name }}</span>
                <span v-if="s.price">AED {{ s.price }}</span>
              </div>
            </div>
            <p v-else class="text-caption text-grey-darken-1">No items</p>
          </div>

          <v-divider class="my-2" />

          <div class="d-flex justify-space-between align-center">
            <span class="text-caption text-grey-darken-1">Total</span>
            <span class="text-body-1 font-weight-bold" style="color: #2e7d32">
              AED
              {{
                invoiceVisit
                  ? getVisitAmount(
                      invoiceVisit.services && invoiceVisit.services.length
                        ? invoiceVisit
                        : { ...invoiceVisit, services: invoiceVisit.case?.services || [] } as any
                    ) || '0'
                  : '0'
              }}
            </span>
          </div>

          <div class="d-flex justify-end mt-4">
            <v-btn color="primary" class="text-none" @click="showInvoice = false">
              Close
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useVetVisitsStore } from '@/stores/vet-visits'
import type { Visit, VisitStatus } from '@/stores/types/vet-types'
import { useVeterniansStore } from '@/stores/veternians'
import dayjs from 'dayjs'
import { computed, onMounted, ref } from 'vue'

const vetVisitsStore = useVetVisitsStore()
const vetStore = useVeterniansStore()

const cases = ref<Visit[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref<string | null>(null)
const vets = ref<any[]>([])
const selectedVetByVisit = ref<Record<string, string | null>>({})
const notesByVisit = ref<Record<string, string>>({})
const showInvoice = ref(false)
const invoiceVisit = ref<Visit | null>(null)

const statusOptions = [
  { text: 'Scheduled', value: 'SCHEDULED' },
  { text: 'Accepted', value: 'ACCEPTED' },
  { text: 'In Progress', value: 'IN_PROGRESS' },
  { text: 'Completed', value: 'COMPLETED' },
  { text: 'Rejected', value: 'REJECTED' },
  { text: 'Cancelled', value: 'CANCELLED' },
]

const getInitials = (name?: string) => {
  if (!name) return 'C'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const getStatusColor = (status?: VisitStatus) => {
  switch (status) {
    case 'INITIATED':
      return 'warning'
    case 'SCHEDULED':
      return 'info'
    case 'ACCEPTED':
      return 'primary'
    case 'IN_PROGRESS':
      return 'warning'
    case 'COMPLETED':
      return 'success'
    case 'REJECTED':
      return 'error'
    case 'CANCELLED':
      return 'grey'
    case 'NOT_REACHABLE':
      return 'orange-darken-2'
    default:
      return 'default'
  }
}

const getStatusLabel = (status?: VisitStatus) => {
  // Some legacy/admin records may not have an explicit status.
  // Default to "Scheduled" instead of "Unknown" for better UX.
  if (!status) return 'Scheduled'
  switch (status) {
    case 'INITIATED':
      // For Vet Admin, INITIATED means "pending vet action"
      return 'Pending'
    case 'SCHEDULED':
      return 'Scheduled'
    case 'ACCEPTED':
      return 'Accepted'
    case 'IN_PROGRESS':
      return 'In progress'
    case 'COMPLETED':
      return 'Completed'
    case 'REJECTED':
      return 'Rejected'
    case 'CANCELLED':
      return 'Cancelled'
    case 'NOT_REACHABLE':
      return 'Not reachable'
    default:
      return status
  }
}

const getVisitAmount = (visit: Visit): string | null => {
  if (Array.isArray(visit.services) && visit.services.length) {
    const sum = visit.services.reduce((acc, s) => acc + (s.price ?? 0), 0)
    if (sum > 0) return sum.toFixed(0)
  }
  return null
}

const filteredCases = computed(() => {
  let result = cases.value
  if (statusFilter.value) {
    result = result.filter((c) => c.status === statusFilter.value)
  }
  const term = search.value.trim().toLowerCase()
  if (term) {
    result = result.filter((c) => {
      const memberName = c.member?.name?.toLowerCase() || ''
      const petName = c.pet?.name?.toLowerCase() || ''
      return memberName.includes(term) || petName.includes(term)
    })
  }
  return result
})

let debounceTimer: ReturnType<typeof setTimeout>
const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    // We already fetched from backend; search is applied client-side.
    // No extra call needed here.
  }, 300)
}

const fetchCases = async () => {
  try {
    loading.value = true
    const res = await vetVisitsStore.fetchVisitsForAdmin({ page: 1, limit: 50 })
    const raw = res.data || res || []
    // Derive a frontend "ACCEPTED" state when vet has accepted but
    // consultation is not yet completed/rejected.
    cases.value = (Array.isArray(raw) ? raw : []).map((v: any) => {
      const baseStatus = (v.status || '').toUpperCase()
      const isAcceptedActive =
        v.acceptedAt &&
        !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(baseStatus)
      return {
        ...v,
        status: isAcceptedActive ? 'ACCEPTED' : baseStatus || 'INITIATED',
      } as Visit
    })
    const mapVet: Record<string, string | null> = {}
    const mapNotes: Record<string, string> = {}
    for (const v of cases.value) {
      mapVet[v.id] = v.vet?.id ?? null
      mapNotes[v.id] = ''
    }
    selectedVetByVisit.value = mapVet
    notesByVisit.value = mapNotes
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchCases()
  const list = await vetStore.fetchVets(false)
  vets.value = list?.data || list || []
})

const handleCancel = async (visit: Visit) => {
  await vetVisitsStore.cancelConsultationForAdmin(visit.id)
  await fetchCases()
}

const handleConfirm = async (visit: Visit) => {
  const vetId = selectedVetByVisit.value[visit.id]
  if (vetId) {
    await vetVisitsStore.assignVetForAdmin(visit.id, vetId)
  }
  const note = notesByVisit.value[visit.id]
  if (note?.trim()) {
    await vetVisitsStore.saveNoteForAdmin(visit.id, note.trim())
  }
  await vetVisitsStore.confirmConsultationForAdmin(visit.id)
  await fetchCases()
}

const handleInvoice = (visit: Visit) => {
  invoiceVisit.value = visit
  showInvoice.value = true
}
</script>

<style scoped>
.visit-card {
  cursor: pointer;
  transition: background-color 0.15s;
}
.visit-card:hover {
  background-color: #f5f7fa;
}
.visit-panels {
  border-radius: 12px;
}
.visit-panel {
  border-radius: 12px !important;
  border: 1px solid #e0e7f1;
}
.visit-info-block {
  min-width: 180px;
}
.visit-items {
  margin-top: 4px;
}
.visit-notes {
  padding: 8px 10px;
  border-radius: 8px;
  background-color: #f8fafc;
  border: 1px dashed #e2e8f0;
}
.visit-notes-input {
  background-color: #ffffff;
}

.assign-vet-select {
  min-width: 220px;
  max-width: 260px;
}
</style>
