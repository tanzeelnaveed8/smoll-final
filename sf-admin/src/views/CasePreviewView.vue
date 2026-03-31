<template>
  <v-sheet class="h-100 w-100">

    <!-- Loading -->
    <template v-if="actionLoading">
      <v-sheet class="d-flex justify-center align-center h-100">
        <v-progress-circular indeterminate color="primary" />
      </v-sheet>
    </template>

    <div v-else class="px-6 pt-6 pb-10">

      <!-- Top bar -->
      <div class="d-flex align-center justify-space-between mb-5">
        <v-btn variant="plain" color="grey2" prepend-icon="$tb-arrow-left" class="px-0" to="/visits">
          Back
        </v-btn>
        <v-btn
          v-if="caseDetails && caseDetails.status !== 'closed'"
          color="error"
          variant="outlined"
          size="small"
          :loading="cancelling"
          @click="handleCancelVisit"
        >
          Cancel Visit
        </v-btn>
      </div>

      <v-sheet max-width="860" class="w-100 mx-auto d-flex flex-column gr-4">

        <!-- Case header card -->
        <CaseDetails :caseDetails="caseDetails!" />

        <!-- Tabs card -->
        <v-card flat rounded="lg" style="border: 1px solid #e8edf0">

          <!-- Tab headers -->
          <div style="border-bottom: 1px solid #e8edf0" class="px-5">
            <v-tabs v-model="tab" class="tabs text-grey2" height="auto" color="grey1">
              <v-tab
                v-for="(t, i) in tabs"
                :key="i"
                :value="t.value"
                style="line-height: 18px"
                class="pa-1 pb-3 pt-3"
                min-width="auto"
                height="auto"
              >{{ t.title }}</v-tab>
            </v-tabs>
          </div>

          <v-card-text class="pa-5">
            <v-tabs-window v-model="tab">

              <!-- VISIT BRIEF -->
              <v-tabs-window-item value="caseBrief">
                <v-sheet
                  color="#f9fafb"
                  class="rounded-lg pa-5 text-grey2"
                  style="border: 1px solid #e8edf0; font-weight: 500; min-height: 200px; white-space: pre-wrap"
                >
                  {{ caseDetails?.description || 'No description provided.' }}
                </v-sheet>
              </v-tabs-window-item>

              <!-- VISIT INFO -->
              <v-tabs-window-item value="caseInfo">
                <div class="d-flex flex-column gr-5">

                  <!-- Member -->
                  <div>
                    <p class="text-caption font-weight-bold text-uppercase text-grey2 mb-3" style="letter-spacing: 0.8px">Member Details</p>
                    <v-card flat color="#f9fafb" rounded="lg" style="border: 1px solid #e8edf0">
                      <v-card-text class="pa-4">
                        <div class="d-flex align-center justify-space-between">
                          <div class="d-flex align-center gc-3">
                            <v-avatar size="36" color="#e8edf0">
                              <v-icon icon="$tb-user-circle" size="20" color="grey" />
                            </v-avatar>
                            <div>
                              <p class="text-body-2 font-weight-bold">{{ caseDetails?.member?.name ?? '-' }}</p>
                            </div>
                          </div>
                          <p class="text-body-2 font-weight-medium text-grey2">{{ caseDetails?.member?.phone ?? '-' }}</p>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>

                  <!-- Assigned Expert -->
                  <div>
                    <p class="text-caption font-weight-bold text-uppercase text-grey2 mb-3" style="letter-spacing: 0.8px">Assigned Expert</p>
                    <v-card flat color="#f9fafb" rounded="lg" style="border: 1px solid #e8edf0">
                      <v-card-text class="pa-4">
                        <div class="d-flex align-center justify-space-between">
                          <div class="d-flex align-center gc-3">
                            <v-avatar size="36" color="#e8edf0">
                              <v-icon icon="$tb-user-circle" size="20" color="grey" />
                            </v-avatar>
                            <div>
                              <p class="text-body-2 font-weight-bold">{{ caseDetails?.assignedVet?.name ?? '-' }}</p>
                              <p class="text-caption text-grey2 mt-1">{{ caseDetails?.assignedVet?.designation ?? '-' }}</p>
                            </div>
                          </div>
                          <p class="text-body-2 font-weight-medium text-grey2">{{ caseDetails?.assignedVet?.phone ?? '-' }}</p>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>

                  <!-- Expert Note -->
                  <div v-if="caseDetails?.vetNote">
                    <p class="text-caption font-weight-bold text-uppercase text-grey2 mb-3" style="letter-spacing: 0.8px">Expert Note</p>
                    <v-card flat color="#f9fafb" rounded="lg" style="border: 1px solid #e8edf0">
                      <v-card-text class="pa-4">
                        <p class="text-body-2 font-weight-medium text-grey2">{{ caseDetails.vetNote }}</p>
                      </v-card-text>
                    </v-card>
                  </div>

                  <!-- Escalation -->
                  <div>
                    <p class="text-caption font-weight-bold text-uppercase text-grey2 mb-3" style="letter-spacing: 0.8px">Escalation Details</p>
                    <div class="d-flex gc-3 flex-wrap">
                      <v-chip size="small" variant="tonal" :color="caseDetails?.isEscalated ? 'warning' : 'default'">
                        Escalated: {{ caseDetails?.isEscalated ? 'Yes' : 'No' }}
                      </v-chip>
                      <v-chip size="small" variant="tonal" :color="caseDetails?.isDirectEscalated ? 'warning' : 'default'">
                        Direct: {{ caseDetails?.isDirectEscalated ? 'Yes' : 'No' }}
                      </v-chip>
                      <v-chip size="small" variant="tonal" :color="caseDetails?.isEmergency ? 'error' : 'default'">
                        Emergency: {{ caseDetails?.isEmergency ? 'Yes' : 'No' }}
                      </v-chip>
                    </div>
                  </div>

                  <!-- Quote Submission -->
                  <template v-if="caseDetails?.partnerBooking">
                    <div>
                      <p class="text-caption font-weight-bold text-uppercase text-grey2 mb-3" style="letter-spacing: 0.8px">Quote Submission</p>
                      <v-card flat color="#f9fafb" rounded="lg" style="border: 1px solid #e8edf0">
                        <v-card-text class="pa-4">
                          <p v-if="caseDetails.partnerBooking.scheduledAt" class="text-body-2 text-grey2 mb-3">
                            Date: {{ new Date(caseDetails.partnerBooking.scheduledAt).toLocaleDateString('en-IN') }}
                          </p>
                          <table class="w-100">
                            <thead>
                              <tr>
                                <th class="text-left pb-2" style="font-weight: 600; color: #888; font-size: 13px">Service</th>
                                <th class="text-center pb-2" style="font-weight: 600; color: #888; font-size: 13px">Qty</th>
                                <th class="text-right pb-2" style="font-weight: 600; color: #888; font-size: 13px">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="s in caseDetails.partnerBooking.services" :key="s.id" style="border-top: 1px solid #e8edf0">
                                <td class="py-2 text-body-2 font-weight-medium">{{ s.name }}</td>
                                <td class="py-2 text-center text-body-2">{{ s.quantity ?? 1 }}</td>
                                <td class="py-2 text-right text-body-2 font-weight-bold">{{ s.price }} AED</td>
                              </tr>
                            </tbody>
                          </table>
                        </v-card-text>
                      </v-card>
                    </div>
                  </template>

                </div>
              </v-tabs-window-item>

              <!-- NOTES -->
              <v-tabs-window-item value="notes">
                <div class="d-flex flex-column gr-3" style="min-height: 200px">
                  <div v-if="caseDetails?.notes?.length" class="d-flex flex-column gr-2">
                    <v-card
                      v-for="(note, i) in caseDetails.notes"
                      :key="i"
                      flat
                      color="#f9fafb"
                      rounded="lg"
                      style="border: 1px solid #e8edf0"
                      class="pa-3"
                    >
                      <p class="text-body-2 font-weight-bold">{{ note.author ?? 'Admin' }}</p>
                      <p class="text-body-2 text-grey2 mt-1" style="font-weight: 500">{{ note.note }}</p>
                      <p v-if="note.createdAt" class="text-caption text-grey2 mt-2">
                        {{ new Date(note.createdAt).toLocaleString() }}
                      </p>
                    </v-card>
                  </div>
                  <p v-else class="text-body-2 text-grey2 font-weight-medium">No notes yet.</p>

                  <div class="d-flex gc-2 mt-2">
                    <v-text-field
                      v-model="newNote"
                      placeholder="Write a note..."
                      hide-details
                      density="comfortable"
                      variant="outlined"
                      class="flex-grow-1"
                    />
                    <v-btn
                      color="grey1"
                      :disabled="!newNote"
                      :loading="addingNote"
                      height="48"
                      @click="handleAddNote"
                    >Add</v-btn>
                  </div>
                </div>
              </v-tabs-window-item>

              <!-- SHARED FILES -->
              <v-tabs-window-item value="sharedFiles">
                <div style="min-height: 200px">
                  <p v-if="!caseDetails?.pet?.photos?.length" class="text-body-2 text-grey2 text-center pt-10">
                    No shared files.
                  </p>
                  <div v-else class="cases-shared-files">
                    <v-img
                      v-for="(file, i) in caseDetails.pet.photos"
                      :key="i"
                      :src="file.url"
                      cover
                      color="#f0f0f0"
                      class="rounded-lg"
                      height="164"
                    />
                  </div>
                </div>
              </v-tabs-window-item>

              <!-- INVOICE -->
              <v-tabs-window-item value="invoice">
                <div style="min-height: 200px">
                  <template v-if="caseDetails?.partnerBooking?.services?.length">
                    <v-card flat color="#f9fafb" rounded="lg" style="border: 1px solid #e8edf0">
                      <v-card-text class="pa-4">
                        <table class="w-100">
                          <thead>
                            <tr>
                              <th class="text-left pb-3" style="font-weight: 600; color: #888; font-size: 13px">Service</th>
                              <th class="text-center pb-3" style="font-weight: 600; color: #888; font-size: 13px">Qty</th>
                              <th class="text-right pb-3" style="font-weight: 600; color: #888; font-size: 13px">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              v-for="s in caseDetails.partnerBooking.services"
                              :key="s.id"
                              style="border-top: 1px solid #e8edf0"
                            >
                              <td class="py-3 text-body-2 font-weight-medium">{{ s.name }}</td>
                              <td class="py-3 text-center text-body-2">{{ s.quantity ?? 1 }}</td>
                              <td class="py-3 text-right text-body-2 font-weight-bold">{{ s.price }} AED</td>
                            </tr>
                          </tbody>
                        </table>
                        <v-divider class="my-3" />
                        <div class="d-flex align-center justify-space-between">
                          <v-chip
                            :color="caseDetails.status === 'closed' ? 'success' : 'warning'"
                            size="small"
                            variant="tonal"
                          >
                            {{ caseDetails.status === 'closed' ? 'Paid' : 'Pending' }}
                          </v-chip>
                          <p class="font-weight-bold text-body-1">
                            Total: {{ caseDetails.partnerBooking.services.reduce((sum: number, s: any) => sum + (s.price * (s.quantity ?? 1)), 0) }} AED
                          </p>
                        </div>
                      </v-card-text>
                    </v-card>
                  </template>
                  <p v-else class="text-body-2 text-grey2 font-weight-medium pt-4">No invoice available.</p>
                </div>
              </v-tabs-window-item>

            </v-tabs-window>
          </v-card-text>
        </v-card>

      </v-sheet>
    </div>
  </v-sheet>
</template>

<script lang="ts" setup>
import CaseDetails from '@/components/app/casePreview/CaseDetails.vue'
import { useCaseStore } from '@/stores/case'
import type { CaseDetail } from '@/stores/types/cases'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'

const tab = ref('caseBrief')
const route = useRoute()
const caseDetails = ref<CaseDetail | null>()
const actionLoading = ref(false)
const newNote = ref('')
const addingNote = ref(false)
const cancelling = ref(false)

const caseStore = useCaseStore()

const tabs = [
  { title: 'Visit Brief', value: 'caseBrief' },
  { title: 'Visit Info', value: 'caseInfo' },
  { title: 'Notes', value: 'notes' },
  { title: 'Shared Files', value: 'sharedFiles' },
  { title: 'Invoice', value: 'invoice' },
]

const getCaseDetails = async () => {
  try {
    const id = route.params.caseId as string
    actionLoading.value = true
    const data = await caseStore.fetchCaseDetails(id)
    caseDetails.value = data
  } finally {
    actionLoading.value = false
  }
}

const handleAddNote = async () => {
  if (!newNote.value || !caseDetails.value) return
  try {
    addingNote.value = true
    await caseStore.addNote(caseDetails.value.id, newNote.value, 'Admin')
    caseDetails.value.notes = [
      ...(caseDetails.value.notes ?? []),
      { note: newNote.value, author: 'Admin', createdAt: new Date().toISOString() },
    ]
    newNote.value = ''
    toast.success('Note added')
  } finally {
    addingNote.value = false
  }
}

const handleCancelVisit = async () => {
  if (!caseDetails.value) return
  try {
    cancelling.value = true
    await caseStore.cancelCase(caseDetails.value.id)
    caseDetails.value.status = 'closed'
    toast.success('Visit cancelled')
  } finally {
    cancelling.value = false
  }
}

onMounted(() => {
  getCaseDetails()
})
</script>

<style scoped lang="scss">
.tabs:deep(.v-slide-group__content) {
  gap: 16px;
}
.tabs:deep(.v-tab-item--selected) {
  color: #222222 !important;
}
.cases-shared-files {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
</style>
