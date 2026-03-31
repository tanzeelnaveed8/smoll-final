<template>
  <v-sheet
    max-width="600"
    class="w-100 align-self-center"
    flat
    style="border: 1px solid #d0d7dc; border-radius: 12px; background-color: white"
  >
    <v-sheet
      class="d-flex justify-space-between align-center px-6 py-4"
      style="border-bottom: 1px solid #e0e0e0"
    >
      <h3 class="text-h6" style="line-height: 24px; font-weight: 700">Pet Profile</h3>

      <v-btn
        height="auto"
        width="auto"
        min-width="auto"
        type="button"
        @click="$emit('closeDialog')"
        flat
        class="px-0 text-grey2"
        color="transparent"
      >
        <v-icon icon="$tb-x" size="24" />
      </v-btn>
    </v-sheet>
    <v-sheet class="px-6 pt-3 pb-11 d-flex flex-column gr-6">
      <v-sheet class="d-flex gc-4 align-center">
        <v-avatar size="72" color="#d5d5d5" :image="petDetails?.photos[0]?.url" />
        <v-sheet>
          <p style="font-weight: 600">{{ petDetails?.name }}</p>
          <p class="text-body-2 font-weight-medium text-grey2">{{ petDetails?.careId }}</p>
        </v-sheet>
      </v-sheet>

      <!-- Tabs -->
      <v-tabs v-model="tab" class="tabs text-grey2" height="auto" color="grey1">
        <v-tab
          v-for="(tab, i) in tabs"
          :key="i"
          :value="tab.value"
          style="line-height: 18px"
          class="pa-1 pb-2"
          min-width="auto"
          height="auto"
        >
          {{ tab.title }}
        </v-tab>
      </v-tabs>

      <!-- Tab Content -->
      <v-window v-model="tab">
        <!-- 🐾 Pet Info Tab -->
        <v-window-item value="pet-info">
          <v-sheet class="d-flex flex-column gr-4">
            <v-sheet class="w-100">
              <p style="font-weight: 600" class="text-body-1">Name</p>
              <v-text-field
                readonly
                :value="petDetails?.name"
                type="text"
                hide-details="auto"
                class="text-field mt-2 text-grey1"
                placeholder="Name"
              />
            </v-sheet>
            <v-sheet class="w-100">
              <p style="font-weight: 600" class="text-body-1">Age</p>
              <v-text-field
                readonly
                :value="petDetails?.age"
                type="text"
                hide-details="auto"
                class="text-field mt-2 text-grey1"
                placeholder="Age"
              />
            </v-sheet>
            <v-sheet class="w-100">
              <p style="font-weight: 600" class="text-body-1">Weight</p>
              <v-text-field
                readonly
                :value="petDetails?.weight"
                type="text"
                hide-details="auto"
                class="text-field mt-2 text-grey1"
                placeholder="Weight"
              />
            </v-sheet>
            <v-sheet class="w-100">
              <p style="font-weight: 600" class="text-body-1">Species</p>
              <v-text-field
                readonly
                :value="petDetails?.species"
                type="text"
                hide-details="auto"
                class="text-field mt-2 text-grey1"
                placeholder="Species"
              />
            </v-sheet>
            <v-sheet class="w-100">
              <p style="font-weight: 600" class="text-body-1">Breed</p>
              <v-text-field
                readonly
                :value="petDetails?.breed"
                type="text"
                hide-details="auto"
                class="text-field mt-2 text-grey1"
                placeholder="Breed"
              />
            </v-sheet>
            <v-sheet class="d-flex gc-4">
              <v-sheet class="w-100">
                <p style="font-weight: 600" class="text-body-1">Chip Number (Optional)</p>
                <v-text-field
                  readonly
                  :value="petDetails?.chipNumber ? petDetails?.chipNumber : null"
                  type="text"
                  hide-details="auto"
                  class="text-field mt-2 text-grey1"
                  placeholder="Chip number"
                />
              </v-sheet>
              <v-sheet class="w-100">
                <p style="font-weight: 600" class="text-body-1">Spayed/Neutered</p>
                <v-text-field
                  readonly
                  :value="petDetails?.spayedOrNeutered ? 'Yes' : 'No'"
                  type="text"
                  hide-details="auto"
                  class="text-field mt-2 text-grey1"
                  placeholder="Status"
                />
              </v-sheet>
            </v-sheet>
          </v-sheet>
        </v-window-item>

        <!-- 📋 Membership & Services Tab -->
        <v-window-item value="membership">
          <v-sheet class="d-flex flex-column gr-4">
            <!-- Membership Card -->
            <v-card flat class="pa-5 rounded-xl mb-4" color="#f6f9fc">
              <div class="d-flex justify-space-between flex-wrap align-center">
                <div class="d-flex align-center mb-3 mb-md-0">
                  <div>
                    <div class="text-caption text-grey-darken-2">Start</div>
                    <div class="text-body-1 font-weight-medium">
                      {{
                        dayjs(petDetails?.subscriptionDetails.startDate).format('DD MMM YYYY') ||
                        '-'
                      }}
                    </div>
                  </div>
                </div>

                <div class="d-flex align-center mb-3 mb-md-0">
                  <div>
                    <div class="text-caption text-grey-darken-2">Expiry</div>
                    <div class="text-body-1 font-weight-medium">
                      {{
                        dayjs(petDetails?.subscriptionDetails.endDate).format('DD MMM YYYY') || '-'
                      }}
                    </div>
                  </div>
                </div>

                <v-chip
                  :color="
                    petDetails.subscriptionDetails.status.toLowerCase() === 'active'
                      ? '#56b686'
                      : '#f31101'
                  "
                  text-color="white"
                  variant="flat"
                  size="default"
                  label
                  class="mt-2 mt-md-0 rounded-pill"
                >
                  {{ petDetails.subscriptionDetails.status }}
                </v-chip>
              </div>
            </v-card>

            <!-- Services Availed -->
            <div>
              <div class="d-flex justify-space-between mb-2">
                <p class="text-grey2 pl-2" style="font-weight: 600">Services Availed</p>
                <p class="text-grey2" style="font-weight: 600; max-width: 102px; width: 100%">
                  Sessions
                </p>
              </div>
              <v-expansion-panels class="expansion-panels" v-if="petDetails?.benefitUsageSummary">
                <v-expansion-panel
                  v-for="service in petDetails?.benefitUsageSummary"
                  :key="service.id"
                >
                  <v-expansion-panel-title v-slot="{ expanded }">
                    <div class="d-flex justify-space-between align-center w-100">
                      <!-- Left: Chevron + Service Name -->
                      <div class="d-flex align-center gap-2">
                        <v-icon
                          size="20"
                          class="mr-1"
                          :icon="expanded ? '$tb-chevron-down' : '$tb-chevron-right'"
                        />
                        <div class="font-weight-bold">{{ service.name }}</div>
                      </div>

                      <!-- Right: Dots for usage -->
                      <div class="d-flex align-center gc-1" style="max-width: 102px; width: 100%">
                        <v-icon
                          :icon="
                            n <= service.consumedUsageCount
                              ? `$tb-circle-check-filled`
                              : `$tb-circle-check`
                          "
                          v-for="n in service.totalUsageCount"
                          :key="n"
                          :color="n <= service.consumedUsageCount ? '#56b686' : '#494949'"
                        />
                      </div>
                    </div>
                  </v-expansion-panel-title>

                  <v-expansion-panel-text>
                    <div
                      v-if="service.history?.length"
                      v-for="(clinic, index) in service.history"
                      :key="index"
                      class="mb-4"
                    >
                      <p class="text-grey2 mb-1" style="font-size: 14px; font-weight: 700">
                        Service Provided by
                      </p>
                      <div class="d-flex justify-space-between align-center mb-1">
                        <p class="text-body-1" style="font-weight: 800">{{ clinic.clinicName }}</p>
                        <span style="font-weight: 600">{{
                          dayjs(clinic.createdAt).format('DD-MM-YYYY')
                        }}</span>
                      </div>
                      <p class="mb-1" style="font-size: 14px; font-weight: 600">
                        {{ clinic.note || 'No note added' }}
                      </p>
                      <p style="font-weight: 600; font-size: 14px">
                        Vet name: {{ clinic.vet || '' }}
                      </p>
                      <v-divider class="mt-3" v-if="index < service.history.length - 1" />
                    </div>
                    <div v-else>
                      <p>No service usage history available.</p>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
              <p v-else>No service usage history available.</p>
            </div>
          </v-sheet>
        </v-window-item>
      </v-window>
    </v-sheet>
  </v-sheet>
</template>

<script lang="ts" setup>
import type { Pet } from '@/stores/types/pet'
import dayjs from 'dayjs'
import { ref, watch, watchEffect } from 'vue'

const props = defineProps<{
  petDetails: Pet
}>()

const tab = ref('pet-info')

const tabs = [
  { title: 'Pet Info', value: 'pet-info' },
  { title: 'Membership', value: 'membership' } //show only when the subscription is active
]
</script>

<style lang="scss" scoped>
.text-field {
  &:deep(.v-field__input) {
    cursor: default !important;
  }
}

.tabs:deep(.v-slide-group__content) {
  gap: 16px;
}

.expansion-panels {
  &:deep(.v-expansion-panel__shadow) {
    display: none !important;
  }

  &:deep(.v-expansion-panel-title) {
    padding-right: 4px;
    padding-left: 4px;
  }

  &:deep(.v-expansion-panel-title__icon) {
    display: none;
  }
}
</style>
