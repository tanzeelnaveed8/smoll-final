<template>
  <v-sheet class="d-flex flex-column w-100" style="height: 100vh">
    <!-- Sticky Header -->
    <v-sheet
      class="d-flex align-center justify-space-between px-6 py-4 elevation-2"
      color="white"
      style="position: sticky; top: 0; z-index: 10"
    >
      <div class="d-flex align-center gc-4">
        <v-btn icon flat @click="router.back()">
          <v-icon icon="$tb-arrow-left" />
        </v-btn>
        <h4 class="text-h5 font-weight-bold mb-0">{{ organization?.organizationName }}</h4>
      </div>

      <v-btn flat color="transparent" @click="fetchOrganizationDetails">
        <v-icon icon="$tb-reload" size="20" />
      </v-btn>
    </v-sheet>

    <!-- Tabs + Content -->
    <v-sheet class="flex-1 overflow-y-auto px-6 py-6">
      <v-tabs v-model="activeTab" color="primary">
        <v-tab value="details">Information</v-tab>
        <v-tab value="codes">Organization Codes</v-tab>
        <v-tab value="domain">Domain</v-tab>
      </v-tabs>

      <v-window v-model="activeTab" class="mt-6">
        <!-- DETAILS TAB -->
        <v-window-item value="details">
          <!-- Loader -->
          <v-sheet v-if="loading" class="d-flex justify-center align-center pa-4">
            <v-progress-circular indeterminate color="primary" />
          </v-sheet>

          <v-sheet v-else class="d-flex flex-column gr-6">
            <v-sheet class="d-flex align-center gc-4">
              <input
                type="file"
                ref="orgProfileInput"
                style="display: none"
                accept="image/*"
                @change="handleOrgProfileChange"
              />
              <v-avatar
                color="#d5d5d5"
                class="text-grey2"
                size="72"
                icon="$tb-building"
                :image="organization?.profileImg?.url"
              />
              
            </v-sheet>

            <!-- Organization Details Form -->
            <v-sheet class="d-flex flex-column gr-3">
              <v-sheet>
                <p style="font-weight: 600" class="text-body-1">Organization Name</p>
                <v-text-field
                  readonly
                  :value="organization?.organizationName"
                  type="text"
                  hide-details="auto"
                  class="text-field mt-2 text-grey1"
                  placeholder="Organization Name"
                />
              </v-sheet>

              <v-sheet>
                <p style="font-weight: 600" class="text-body-1">Contact Details</p>
                <v-text-field
                  readonly
                  :value="organization?.contactDetails ?? ''"
                  type="text"
                  hide-details="auto"
                  class="text-field mt-2 text-grey1"
                  placeholder="Contact Details"
                />
              </v-sheet>

              <!-- <v-sheet>
                <p style="font-weight: 600" class="text-body-1">SmollVet Access</p>
                <v-text-field
                  readonly
                  :value="organization?.smollVetIsActive ? 'Active' : 'Inactive'"
                  type="text"
                  hide-details="auto"
                  class="text-field mt-2 text-grey1"
                  placeholder="Access Status"
                  :append-inner-icon="
                    organization?.smollVetIsActive ? '$tb-check' : '$tb-x'
                  "
                />
              </v-sheet>

              <v-sheet>
                <p style="font-weight: 600" class="text-body-1">Access Start Date</p>
                <v-text-field
                  readonly
                  :value="organization?.smollVetAccessStartDate"
                  type="text"
                  hide-details="auto"
                  class="text-field mt-2 text-grey1"
                  placeholder="Start Date"
                  append-inner-icon="$tb-calendar"
                />
              </v-sheet>

              <v-sheet>
                <p style="font-weight: 600" class="text-body-1">Access End Date</p>
                <v-text-field
                  readonly
                  :value="organization?.smollVetAccessEndDate"
                  type="text"
                  hide-details="auto"
                  class="text-field mt-2 text-grey1"
                  placeholder="End Date"
                  append-inner-icon="$tb-calendar"
                />
              </v-sheet> -->
            </v-sheet>

            <!-- Action Buttons -->
            <v-sheet class="d-flex gc-4 mt-4">
              <v-btn color="primary" prepend-icon="$tb-edit" @click="openEditDialog">
                Edit Organization
              </v-btn>
              <v-btn
                v-if="organization?.smollVetIsActive"
                color="error"
                prepend-icon="$tb-ban"
                @click="confirmToggleActive(true)"
              >
                Deactivate Organization
              </v-btn>
              <v-btn
                v-else
                color="success"
                prepend-icon="$tb-check"
                @click="confirmToggleActive(false)"
              >
                Activate Organization
              </v-btn>
            </v-sheet>
          </v-sheet>
        </v-window-item>

        <!-- CODES TAB -->
        <v-window-item value="codes">
          <v-sheet class="d-flex flex-column gr-4">
            <!-- Header with Title and Action Buttons -->
            <div class="d-flex align-center justify-space-between">
              <h4 class="text-h6 font-weight-bold">Organization Codes</h4>

              <div class="d-flex align-center" style="gap: 12px">
                <!-- Edit Codes Button -->
                <v-btn
                  color="primary"
                  prepend-icon="$tb-edit"
                  @click="openCodeSettingsDialog"
                  :disabled="codesLoading"
                >
                  Edit Codes
                </v-btn>

                <!-- Delete Selected Button - Only shown when codes are selected -->
                <v-btn
                  v-if="selectedCodes.length > 0"
                  color="error"
                  prepend-icon="$tb-trash"
                  @click="confirmDeleteSelected"
                  :disabled="codesLoading || deleteSelectedLoading"
                  :loading="deleteSelectedLoading"
                >
                  Delete Selected ({{ selectedCodes.length }})
                </v-btn>

                <v-btn
                  color="primary"
                  prepend-icon="$tb-plus"
                  @click="openAddCodesDialog"
                  :disabled="!organization?.smollVetIsActive || codesLoading"
                >
                  Add Codes
                </v-btn>

                <v-btn
                  color="success"
                  prepend-icon="mdi-download"
                  @click="downloadCSV"
                  :disabled="codesLoading || codes.length === 0"
                >
                  Export CSV
                </v-btn>
              </div>
            </div>

            <!-- Code Settings Display -->
            <v-sheet class="d-flex flex-wrap gap-4 pa-4 bg-grey-lighten-4 rounded">
              <v-checkbox
                :model-value="organization?.codeAccessEnabled"
                label="Code Access Enabled"
                color="primary"
                hide-details
                disabled
                density="compact"
                class="mr-4"
              />
              <v-checkbox
                :model-value="organization?.codeGroupChatEnabled"
                label="Code Group Chat Enabled"
                color="primary"
                hide-details
                disabled
                density="compact"
              />
            </v-sheet>

            <!-- Search Field -->
            <v-sheet v-if="!codesLoading && codes.length > 0">
              <p style="font-weight: 600" class="text-body-1">Search</p>
              <v-text-field
                v-model="search"
                type="text"
                hide-details="auto"
                class="text-field mt-2 text-grey1"
                placeholder="Search code, email or phone"
                append-inner-icon="mdi-magnify"
                clearable
              />
            </v-sheet>

            <!-- Loader for Codes -->
            <v-sheet
              v-if="codesLoading"
              class="d-flex justify-center align-center pa-8"
              style="min-height: 300px"
            >
              <v-progress-circular indeterminate color="primary" />
            </v-sheet>

            <!-- Empty State - No Codes Found -->
            <v-sheet
              v-else-if="!codesLoading && codes.length === 0"
              class="d-flex flex-column align-center justify-center pa-8"
              style="min-height: 300px"
            >
              <v-icon icon="$tb-database-off" size="64" color="grey" class="mb-4" />
              <h3 class="text-h6 text-grey-darken-1 mb-2">No Codes Found</h3>
              <p class="text-body-2 text-grey mb-4">
                This organization doesn't have any generated codes yet.
              </p>
              <v-btn
                color="primary"
                prepend-icon="$tb-plus"
                @click="openAddCodesDialog"
                :disabled="!organization?.smollVetIsActive"
              >
                Add Codes
              </v-btn>
            </v-sheet>

            <!-- Empty State - No Search Results -->
            <v-sheet
              v-else-if="!codesLoading && codes.length > 0 && filteredCodes.length === 0"
              class="d-flex flex-column align-center justify-center pa-8"
              style="min-height: 300px"
            >
              <v-icon icon="$tb-search-off" size="64" color="grey" class="mb-4" />
              <h3 class="text-h6 text-grey-darken-1 mb-2">No Results Found</h3>
              <p class="text-body-2 text-grey">
                No codes match your search "{{ search }}". Try a different search term.
              </p>
            </v-sheet>

            <!-- Codes Table -->
            <v-sheet
              v-else-if="!codesLoading && filteredCodes.length > 0"
              class="codes-table-wrapper"
            >
              <v-data-table
                v-model="selectedCodes"
                class="codes-table text-body-2 text-grey1"
                height="484"
                style="font-weight: 600"
                hide-default-footer
                show-select
                :headers="codeHeaders"
                :items="paginatedCodes"
                :custom-sort="customSort"
                item-value="code"
                return-object
              >
                <!-- Custom header checkbox -->
                <template #header.data-table-select>
                  <v-checkbox-btn
                    :model-value="isAllPageSelected"
                    :indeterminate="isSomePageSelected && !isAllPageSelected"
                    @click.stop="handleSelectAllOnPage"
                    color="primary"
                  />
                </template>

                <!-- Custom checkbox slot to disable used codes -->
                <template #item.data-table-select="{ item }">
                  <v-checkbox-btn
                    :model-value="isItemSelected(item)"
                    :disabled="!!item.usedAt"
                    @click.stop="handleItemSelect(item)"
                    color="primary"
                  />
                </template>

                <template #item.code="{ item }">
                  <div class="d-flex align-center" style="gap: 8px">
                    <span class="font-weight-bold">{{ item.code }}</span>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="copyToClipboard(item.code)"
                      class="copy-btn"
                      title="Copy code"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        style="transform: scaleX(-1)"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </v-btn>
                  </div>
                </template>

                <template #item.usedAt="{ item }">
                  <v-chip v-if="item.usedAt" size="small" color="success" variant="tonal">
                    {{ item.usedAt }}
                  </v-chip>
                  <v-chip v-else size="small" color="grey" variant="tonal"> Not Used </v-chip>
                </template>

                <template #item.member="{ item }">
                  <span>{{ item.member?.email || '-' }}</span>
                </template>

                <template #item.phone="{ item }">
                  <span>{{ item.member?.phone || '-' }}</span>
                </template>

                <template #item.maxUsageMonths="{ item }">
                  <span>{{ item.maxUsageMonths ?? '-' }}</span>
                </template>
              </v-data-table>

              <!-- Pagination -->
              <v-pagination
                v-model="page"
                :length="totalPages"
                class="mt-4"
                size="small"
                total-visible="5"
              />
            </v-sheet>
          </v-sheet>
        </v-window-item>

        <!-- DOMAIN TAB -->
        <v-window-item value="domain">
          <v-sheet class="d-flex flex-column gr-6">

            <v-sheet class="d-flex flex-wrap gap-4 pa-4 bg-grey-lighten-4 rounded">
              <v-checkbox
                :model-value="organization?.domainAccessEnabled"
                label="Domain Access Enabled"
                color="primary"
                hide-details
                disabled
                density="compact"
                class="mr-4"
              />
              <v-checkbox
                :model-value="organization?.domainGroupChatEnabled"
                label="Domain Group Chat Enabled"
                color="primary"
                hide-details
                disabled
                density="compact"
              />
            </v-sheet>

            <v-sheet>
              <p style="font-weight: 600" class="text-body-1">Domain</p>
              <v-text-field
                readonly
                :value="organization?.domain"
                type="text"
                hide-details="auto"
                class="text-field mt-2 text-grey1"
                placeholder="Domain"
              />
            </v-sheet>

            <v-sheet>
              <p style="font-weight: 600" class="text-body-1">Access Start Date</p>
              <v-text-field
                readonly
                :value="organization?.smollVetAccessStartDate"
                type="text"
                hide-details="auto"
                class="text-field mt-2 text-grey1"
                placeholder="Start Date"
              />
            </v-sheet>

            <v-sheet>
              <p style="font-weight: 600" class="text-body-1">Access End Date</p>
              <v-text-field
                readonly
                :value="organization?.smollVetAccessEndDate"
                type="text"
                hide-details="auto"
                class="text-field mt-2 text-grey1"
                placeholder="End Date"
              />
            </v-sheet>

            <v-sheet class="d-flex gc-4 mt-4">
              <v-btn color="primary" prepend-icon="$tb-edit" @click="openDomainEditDialog">
                Edit Domain
              </v-btn>
              <v-btn
                v-if="organization?.smollVetIsActive"
                color="error"
                prepend-icon="$tb-ban"
                @click="confirmToggleActive(true)"
              >
                Deactivate Organization
              </v-btn>
              <v-btn
                v-else
                color="success"
                prepend-icon="$tb-check"
                @click="confirmToggleActive(false)"
              >
                Activate Organization
              </v-btn>
            </v-sheet>
          </v-sheet>
        </v-window-item>
      </v-window>
    </v-sheet>

    <!-- Edit Organization Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600px">
      <v-card class="rounded-lg">
        <v-card-title class="text-h5 font-weight-bold pa-6 pb-2"> Edit Organization </v-card-title>
        <v-card-text class="pa-6 pt-4">
          <v-form ref="formRef" v-model="isFormValid">
            <v-sheet class="d-flex flex-column gr-6">
              <v-text-field
                v-model="form.organizationName"
                label="Organization Name"
                variant="outlined"
                density="comfortable"
                bg-color="grey-lighten-4"
                required
                :rules="[(v: any) => !!v || 'Organization name is required']"
              ></v-text-field>

              <v-text-field
                v-model="form.contactDetails"
                label="Contact Details"
                variant="outlined"
                density="comfortable"
                bg-color="grey-lighten-4"
                maxlength="256"
                counter="256"
                :rules="[(v: any) => !v || String(v).length <= 256 || 'Max 256 characters']"
              ></v-text-field>

              <v-sheet class="d-flex align-center gc-4">
                <input
                  type="file"
                  ref="editOrgProfileInput"
                  style="display: none"
                  accept="image/*"
                  @change="handleEditOrgProfileChange"
                />
                <v-avatar
                  color="#d5d5d5"
                  class="text-grey2"
                  size="56"
                  icon="$tb-building"
                  :image="organization?.profileImg?.url"
                />
                <v-btn
                  class="px-3"
                  density="compact"
                  flat
                  style="letter-spacing: 0px"
                  :disabled="uploadLoading"
                  :loading="uploadLoading"
                  @click="triggerEditOrgProfileUpload"
                >Upload</v-btn>
                <v-btn
                  class="px-3"
                  density="compact"
                  variant="text"
                  color="error"
                  style="letter-spacing: 0px"
                  :disabled="removeLoading || uploadLoading || !organization?.profileImg"
                  :loading="removeLoading"
                  @click="handleEditRemoveOrgProfile"
                >Remove</v-btn>
              </v-sheet>

              
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-2">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showEditDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="handleUpdateOrganization"
            :loading="submitLoading"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Domain Dialog -->
    <v-dialog v-model="showDomainDialog" max-width="600px">
      <v-card class="rounded-lg">
        <v-card-title class="text-h5 font-weight-bold pa-6 pb-2"> Edit Domain </v-card-title>
        <v-card-text class="pa-6 pt-4">
          <v-form ref="domainFormRef" v-model="isDomainFormValid">
            <v-sheet class="d-flex flex-column gr-6">

              <v-text-field
                v-model="domainForm.domain"
                label="Domain"
                variant="outlined"
                density="comfortable"
                bg-color="grey-lighten-4"
              ></v-text-field>

              <v-checkbox
                v-model="domainForm.domainAccessEnabled"
                label="Enable Domain Access"
                color="primary"
                hide-details
                density="compact"
              />

              <v-checkbox
                v-model="domainForm.domainGroupChatEnabled"
                label="Enable Domain Group Chat"
                color="primary"
                hide-details
                density="compact"
              />

              <v-text-field
                v-model="domainForm.smollVetAccessStartDate"
                label="SmollVet Access Start Date"
                type="date"
                variant="outlined"
                density="comfortable"
                bg-color="grey-lighten-4"
              ></v-text-field>

              <v-text-field
                v-model="domainForm.smollVetAccessEndDate"
                label="SmollVet Access End Date"
                type="date"
                variant="outlined"
                density="comfortable"
                bg-color="grey-lighten-4"
              ></v-text-field>
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-2">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showDomainDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="handleUpdateDomain"
            :loading="submitLoading"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Code Settings Dialog -->
    <v-dialog v-model="showCodeSettingsDialog" max-width="600px">
      <v-card class="rounded-lg">
        <v-card-title class="text-h5 font-weight-bold pa-6 pb-2"> Edit Codes </v-card-title>
        <v-card-text class="pa-6 pt-4">
          <v-form>
            <v-sheet class="d-flex flex-column gr-6">
              <v-checkbox
                v-model="codeSettingsForm.codeAccessEnabled"
                label="Enable Code Access"
                color="primary"
                hide-details
                density="compact"
              />

              <v-checkbox
                v-model="codeSettingsForm.codeGroupChatEnabled"
                label="Enable Code Group Chat"
                color="primary"
                hide-details
                density="compact"
              />
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-2">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showCodeSettingsDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="handleUpdateCodeSettings"
            :loading="submitLoading"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Activate/Deactivate Organization Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card class="rounded-lg">
        <v-card-title class="text-h5 font-weight-bold pa-6 pb-2">
          {{ pendingDeactivate ? 'Confirm Deactivate' : 'Confirm Activate' }}
        </v-card-title>
        <v-card-text class="pa-6 pt-4">
          {{
            pendingDeactivate
              ? 'Are you sure you want to deactivate this organization? Codes will remain usable only while organization is active.'
              : 'Are you sure you want to activate this organization?'
          }}
        </v-card-text>
        <v-card-actions class="pa-6 pt-2">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn
            :color="pendingDeactivate ? 'error' : 'success'"
            variant="flat"
            @click="handleToggleActive"
            :loading="deleteLoading"
            class="text-white"
          >
            {{ pendingDeactivate ? 'Deactivate' : 'Activate' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Selected Codes Dialog -->
    <v-dialog v-model="showDeleteSelectedDialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-card-title class="text-h5 font-weight-bold pa-6 pb-2">
          Delete Selected Codes
        </v-card-title>
        <v-card-text class="pa-6 pt-4">
          <p class="mb-4">
            Are you sure you want to delete <strong>{{ selectedCodes.length }}</strong> selected
            code(s)?
          </p>
          <p class="text-caption text-grey">
            Note: Only unused codes can be deleted. This action cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="pa-6 pt-2">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showDeleteSelectedDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="handleDeleteSelectedCodes"
            :loading="deleteSelectedLoading"
            class="text-white"
          >
            Delete {{ selectedCodes.length }} Code(s)
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Codes Dialog -->
    <v-dialog v-model="showAddCodesDialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-card-title class="text-h5 font-weight-bold pa-6 pb-2">
          Add Organization Codes
        </v-card-title>
        <v-card-text class="pa-6 pt-4">
          <v-form ref="addCodesFormRef" v-model="isAddCodesFormValid">
            <v-text-field
              v-model.number="addCodesForm.numberOfCodes"
              label="Number of Codes"
              type="number"
              variant="outlined"
              density="comfortable"
              bg-color="grey-lighten-4"
              hint="Enter the number of codes to generate (1-1000)"
              persistent-hint
              required
              :rules="[
                (v: any) => (v !== null && v !== '') || 'Number of codes is required',
                (v: any) => Number.isInteger(Number(v)) || 'Must be a whole number',
                (v: any) => Number(v) > 0 || 'Must be greater than 0',
                (v: any) => Number(v) <= 1000 || 'Cannot add more than 1000 codes at once'
              ]"
            />

            <v-text-field
              v-model.number="addCodesForm.maxUsageMonths"
              type="number"
              label="Max Usage (months)"
              variant="outlined"
              density="comfortable"
              bg-color="grey-lighten-4"
              min="1"
              max="24"
              :rules="[
                (v: any) => (v !== null && v !== '') || 'Max usage is required',
                (v: any) => Number.isInteger(Number(v)) || 'Must be a whole number',
                (v: any) => Number(v) >= 1 || 'Must be at least 1 month',
                (v: any) => Number(v) <= 24 || 'Cannot exceed 24 months'
              ]"
              hide-details="auto"
              class="mt-4"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-2">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeAddCodesDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="addCodesLoading"
            :disabled="!isAddCodesFormValid"
            @click="handleAddCodes"
          >
            Add Codes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrganizationStore } from '@/stores/organization'
import type { Organization, UpdateOrganizationPayload } from '@/stores/types/organization'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()
  const organizationStore = useOrganizationStore()

const loading = ref(true)
const codesLoading = ref(false)
const submitLoading = ref(false)
const deleteLoading = ref(false)
const addCodesLoading = ref(false)
const deleteSelectedLoading = ref(false)
  const codesInitialized = ref(false)
  const orgProfileInput = ref<any>(null)
  const uploadLoading = ref(false)
  const removeLoading = ref(false)
  const editOrgProfileInput = ref<any>(null)

const organization = ref<Organization | null>(null)
const codes = ref<any[]>([])
const selectedCodes = ref<any[]>([])
const activeTab = ref<'details' | 'codes' | 'domain'>('details')
const search = ref('')
const page = ref(1)
const itemsPerPage = 10

const showEditDialog = ref(false)
const showDomainDialog = ref(false)
const showCodeSettingsDialog = ref(false)
const showDeleteDialog = ref(false)
const showAddCodesDialog = ref(false)
const showDeleteSelectedDialog = ref(false)

const formRef = ref<any>()
const isFormValid = ref(false)
const domainFormRef = ref<any>()
const isDomainFormValid = ref(false)

const addCodesFormRef = ref<any>()
const isAddCodesFormValid = ref(false)
const addCodesForm = ref({ numberOfCodes: 10, maxUsageMonths: 12 })

const form = ref<UpdateOrganizationPayload>({
  organizationName: '',
  contactDetails: '',
  smollVetIsActive: true,
  smollVetAccessStartDate: '',
  smollVetAccessEndDate: '',
  groupChatEnabled: false
})
const domainForm = ref({
  domain: '',
  smollVetIsActive: true,
  smollVetAccessStartDate: '',
  smollVetAccessEndDate: '',
  domainAccessEnabled: false,
  domainGroupChatEnabled: false
})
  const codeSettingsForm = ref({
    codeAccessEnabled: false,
    codeGroupChatEnabled: false
  })

  const triggerOrgProfileUpload = () => {
    orgProfileInput.value?.click()
  }

  const handleOrgProfileChange = async (e: any) => {
    const file = e?.target?.files?.[0]
    if (!file || !organization.value) {
      e.target.value = ''
      return
    }
    try {
      uploadLoading.value = true
      await organizationStore.uploadOrganizationProfileImage(organization.value.id, file)
      toast.success('Profile image updated')
      await fetchOrganizationDetails()
    } catch (error: any) {
      console.error(error)
      toast.error('Failed to upload image')
    } finally {
      uploadLoading.value = false
      e.target.value = ''
    }
  }

  const handleRemoveOrgProfile = async () => {
    if (!organization.value) return
    try {
      removeLoading.value = true
      await organizationStore.removeOrganizationProfileImage(organization.value.id)
      toast.success('Profile image removed')
      await fetchOrganizationDetails()
    } catch (error: any) {
      console.error(error)
      toast.error('Failed to remove image')
    } finally {
      removeLoading.value = false
    }
  }

  const triggerEditOrgProfileUpload = () => {
    editOrgProfileInput.value?.click()
  }

  const handleEditOrgProfileChange = async (e: any) => {
    const file = e?.target?.files?.[0]
    if (!file || !organization.value) {
      e.target.value = ''
      return
    }
    try {
      uploadLoading.value = true
      await organizationStore.uploadOrganizationProfileImage(organization.value.id, file)
      toast.success('Profile image updated')
      await fetchOrganizationDetails()
    } catch (error: any) {
      console.error(error)
      toast.error('Failed to upload image')
    } finally {
      uploadLoading.value = false
      e.target.value = ''
    }
  }

  const handleEditRemoveOrgProfile = async () => {
    if (!organization.value) return
    try {
      removeLoading.value = true
      await organizationStore.removeOrganizationProfileImage(organization.value.id)
      toast.success('Profile image removed')
      await fetchOrganizationDetails()
    } catch (error: any) {
      console.error(error)
      toast.error('Failed to remove image')
    } finally {
      removeLoading.value = false
    }
  }

// Table headers with sortable enabled
const codeHeaders = [
  { title: 'Code', key: 'code', sortable: true },
  { title: 'Activated on', key: 'usedAt', sortable: true },
  { title: 'Duration (months)', key: 'maxUsageMonths', sortable: true },
  { title: 'User Email', key: 'member', sortable: true },
  { title: 'User Phone', key: 'phone', sortable: true }
] as const

// Copy to clipboard function
const copyToClipboard = async (text: string) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      toast.success(`Code "${text}" copied to clipboard!`)
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      toast.success(`Code "${text}" copied to clipboard!`)
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    toast.error('Failed to copy code to clipboard')
  }
}

// Check if an item is selected
const isItemSelected = (item: any) => {
  return selectedCodes.value.some((selected) => selected.code === item.code)
}

// Get unused codes on current page
const unusedCodesOnPage = computed(() => {
  return paginatedCodes.value.filter((code) => !code.usedAt)
})

// Check if all unused codes on current page are selected
const isAllPageSelected = computed(() => {
  if (unusedCodesOnPage.value.length === 0) return false
  return unusedCodesOnPage.value.every((code) => isItemSelected(code))
})

// Check if some (but not all) unused codes on current page are selected
const isSomePageSelected = computed(() => {
  if (unusedCodesOnPage.value.length === 0) return false
  const selectedCount = unusedCodesOnPage.value.filter((code) => isItemSelected(code)).length
  return selectedCount > 0 && selectedCount < unusedCodesOnPage.value.length
})

// Handle individual item selection
const handleItemSelect = (item: any) => {
  if (item.usedAt) return // Don't allow selection of used codes

  const index = selectedCodes.value.findIndex((c) => c.code === item.code)

  if (index > -1) {
    // Item is selected, remove it
    selectedCodes.value.splice(index, 1)
  } else {
    // Item is not selected, add it
    selectedCodes.value.push(item)
  }
}

// Handle select all/deselect all on current page
const handleSelectAllOnPage = () => {
  const allSelected = isAllPageSelected.value

  if (allSelected) {
    // Deselect all unused codes from current page
    const currentPageCodes = unusedCodesOnPage.value.map((c) => c.code)
    selectedCodes.value = selectedCodes.value.filter(
      (selected) => !currentPageCodes.includes(selected.code)
    )
  } else {
    // Select all unused codes from current page
    const codesToAdd = unusedCodesOnPage.value.filter((code) => !isItemSelected(code))
    selectedCodes.value.push(...codesToAdd)
  }
}

// Fetch organization details
const fetchOrganizationDetails = async () => {
  try {
    loading.value = true
    const id = route.params.id as string
    const data = await organizationStore.fetchOrganizationDetails(id)
    organization.value = data
  } catch (error) {
    console.error('Error fetching organization details:', error)
    toast.error('Failed to load organization details')
    router.push('/organizations')
  } finally {
    loading.value = false
  }
}

// Fetch codes
const fetchOrganizationCodes = async () => {
  if (!organization.value) return
  try {
    codesLoading.value = true
    const id = route.params.id as string
    const result = await organizationStore.fetchOrganizationCodes(id)
    codes.value = Array.isArray(result) ? result : []
    codesInitialized.value = true
  } catch (err: any) {
    console.error('Error fetching codes:', err)
    codes.value = []
    codesInitialized.value = true
    if (err?.response?.status !== 404) {
      toast.error(err.message || 'Failed to load organization codes')
    }
  } finally {
    codesLoading.value = false
  }
}

// Watch for tab change
watch(activeTab, (val) => {
  if (val === 'codes' && !codesInitialized.value) {
    fetchOrganizationCodes()
  }
})

// Clear selection when search changes
watch(search, () => {
  selectedCodes.value = []
  page.value = 1
})

// Custom sort function for v-data-table
const customSort = (items: any[], sortBy: string[], sortDesc: boolean[]) => {
  if (!sortBy.length || sortBy[0] === undefined) {
    return items
  }

  const key = sortBy[0]
  const isDescending = sortDesc[0] || false

  const sortedItems = [...items]

  sortedItems.sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (key) {
      case 'member':
        aValue = a.member?.email || ''
        bValue = b.member?.email || ''
        break

      case 'phone':
        aValue = a.member?.phone || ''
        bValue = b.member?.phone || ''
        break

      case 'usedAt':
        if (!a.usedAt && !b.usedAt) return 0
        if (!a.usedAt) return isDescending ? -1 : 1
        if (!b.usedAt) return isDescending ? 1 : -1

        aValue = new Date(a.usedAt).getTime()
        bValue = new Date(b.usedAt).getTime()
        break

      case 'maxUsageMonths':
        aValue = a.maxUsageMonths ?? 0
        bValue = b.maxUsageMonths ?? 0
        break

      case 'code':
      default:
        aValue = a[key] || ''
        bValue = b[key] || ''
        break
    }

    if (typeof aValue === 'string') aValue = aValue.toLowerCase()
    if (typeof bValue === 'string') bValue = bValue.toLowerCase()

    let comparison = 0
    if (aValue < bValue) {
      comparison = -1
    } else if (aValue > bValue) {
      comparison = 1
    }

    return isDescending ? comparison * -1 : comparison
  })

  return sortedItems
}

// Filter codes based on search
const filteredCodes = computed(() => {
  let list = codes.value.map((item) => ({
    ...item,
    code: item.code || '-',
    usedAt: item.usedAt,
    maxUsageMonths: item.maxUsageMonths ?? null,
    member: item.member
  }))

  if (search.value) {
    const searchLower = search.value.toLowerCase()
    list = list.filter(
      (c) =>
        c.code.toLowerCase().includes(searchLower) ||
        (c.member?.email || '').toLowerCase().includes(searchLower) ||
        (c.member?.phone || '').toLowerCase().includes(searchLower)
    )
  }

  return list
})

// Paginate codes
const paginatedCodes = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredCodes.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredCodes.value.length / itemsPerPage))

// Reset page when search changes
watch(search, () => {
  page.value = 1
})

// Download CSV function
const downloadCSV = () => {
  try {
    const headers = ['Code', 'Activated on', 'User Email', 'User Phone', 'User Name', 'User ID']

    const rows = filteredCodes.value.map((item) => [
      item.code || '',
      item.usedAt || 'Not Used',
      item.member?.email || '-',
      item.member?.phone || '-',
      item.member?.name || '-',
      item.member?.id || '-'
    ])

    const escapeCSV = (value: string) => {
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    const csvContent = [headers.join(','), ...rows.map((row) => row.map(escapeCSV).join(','))].join(
      '\n'
    )

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    const timestamp = new Date().toISOString().split('T')[0]
    const orgName = organization.value?.organizationName?.replace(/[^a-z0-9]/gi, '-') || 'export'
    const filename = `organization-codes-${orgName}-${timestamp}.csv`

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('CSV downloaded successfully')
  } catch (error) {
    toast.error('Failed to download CSV')
    console.error('CSV download error:', error)
  }
}

// Dialog actions - Edit functionality
const openEditDialog = () => {
  if (!organization.value) return

  form.value = {
    organizationName: organization.value.organizationName,
    contactDetails: organization.value.contactDetails ?? '',
    groupChatEnabled: organization.value.groupChatEnabled ?? false
  }

  showEditDialog.value = true
}

const openDomainEditDialog = () => {
  if (!organization.value) return
  domainForm.value = {
    domain: organization.value.domain,
    smollVetIsActive: organization.value.smollVetIsActive,
    smollVetAccessStartDate: organization.value.smollVetAccessStartDate,
    smollVetAccessEndDate: organization.value.smollVetAccessEndDate,
    domainAccessEnabled: organization.value.domainAccessEnabled ?? false,
    domainGroupChatEnabled: organization.value.domainGroupChatEnabled ?? false
  }
  showDomainDialog.value = true
}

const openCodeSettingsDialog = () => {
  if (!organization.value) return
  codeSettingsForm.value = {
    codeAccessEnabled: organization.value.codeAccessEnabled ?? false,
    codeGroupChatEnabled: organization.value.codeGroupChatEnabled ?? false
  }
  showCodeSettingsDialog.value = true
}

const handleUpdateOrganization = async () => {
  if (!organization.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    submitLoading.value = true
    await organizationStore.updateOrganization(organization.value.id, {
      organizationName: form.value.organizationName,
      contactDetails: form.value.contactDetails,
      groupChatEnabled: !!form.value.groupChatEnabled
    })
    toast.success('Organization updated successfully')
    showEditDialog.value = false
    await fetchOrganizationDetails()
  } catch (error) {
    console.error('Error updating organization:', error)
    toast.error('Failed to update organization')
  } finally {
    submitLoading.value = false
  }
}

const handleUpdateDomain = async () => {
  if (!organization.value) return
  // optional validation; allow empty domain
  try {
    submitLoading.value = true
    await organizationStore.updateOrganization(organization.value.id, {
      domain: domainForm.value.domain?.trim() || '',
      smollVetIsActive: domainForm.value.smollVetIsActive,
      smollVetAccessStartDate: domainForm.value.smollVetAccessStartDate,
      smollVetAccessEndDate: domainForm.value.smollVetAccessEndDate,
      domainAccessEnabled: domainForm.value.domainAccessEnabled,
      domainGroupChatEnabled: domainForm.value.domainGroupChatEnabled
    })
    toast.success('Domain settings updated successfully')
    showDomainDialog.value = false
    await fetchOrganizationDetails()
  } catch (error) {
    console.error('Error updating domain settings:', error)
    toast.error('Failed to update domain settings')
  } finally {
    submitLoading.value = false
  }
}

const handleUpdateCodeSettings = async () => {
  if (!organization.value) return
  try {
    submitLoading.value = true
    await organizationStore.updateOrganization(organization.value.id, {
      codeAccessEnabled: codeSettingsForm.value.codeAccessEnabled,
      codeGroupChatEnabled: codeSettingsForm.value.codeGroupChatEnabled
    })
    toast.success('Code settings updated successfully')
    showCodeSettingsDialog.value = false
    await fetchOrganizationDetails()
  } catch (error) {
    console.error('Error updating code settings:', error)
    toast.error('Failed to update code settings')
  } finally {
    submitLoading.value = false
  }
}

// Activate/Deactivate organization functionality
const pendingDeactivate = ref(true)
const confirmToggleActive = (isCurrentlyActive: boolean) => {
  pendingDeactivate.value = !!isCurrentlyActive
  showDeleteDialog.value = true
}

const handleToggleActive = async () => {
  if (!organization.value) return
  try {
    deleteLoading.value = true
    await organizationStore.updateOrganization(organization.value.id, {
      smollVetIsActive: !pendingDeactivate.value
    })
    toast.success(!pendingDeactivate.value ? 'Organization activated' : 'Organization deactivated')
    showDeleteDialog.value = false
    await fetchOrganizationDetails()
  } catch (error) {
    console.error('Error updating organization status:', error)
    toast.error('Failed to update organization status')
  } finally {
    deleteLoading.value = false
  }
}

// Dialog actions - Delete selected codes functionality
const confirmDeleteSelected = () => {
  if (selectedCodes.value.length === 0) {
    toast.warning('No codes selected for deletion')
    return
  }

  // Filter out any used codes (extra safety check)
  const unusedSelected = selectedCodes.value.filter((code) => !code.usedAt)

  if (unusedSelected.length === 0) {
    toast.warning('Cannot delete used codes')
    return
  }

  showDeleteSelectedDialog.value = true
}

const handleDeleteSelectedCodes = async () => {
  try {
    deleteSelectedLoading.value = true

    // Extract only unused code strings
    const codesToDelete = selectedCodes.value
      .filter((code) => !code.usedAt)
      .map((code) => code.code)

    if (codesToDelete.length === 0) {
      toast.warning('No unused codes to delete')
      return
    }

    await organizationStore.deleteOrganizationCodes(codesToDelete)

    toast.success(`Successfully deleted ${codesToDelete.length} code(s)`)

    // Clear selection
    selectedCodes.value = []

    // Close dialog
    showDeleteSelectedDialog.value = false

    // Refresh codes list
    await fetchOrganizationCodes()
  } catch (error: any) {
    console.error('Error deleting codes:', error)
    toast.error(error?.message || 'Failed to delete selected codes')
  } finally {
    deleteSelectedLoading.value = false
  }
}

// Dialog actions - Add Codes functionality
const openAddCodesDialog = () => {
  addCodesForm.value = { numberOfCodes: 10, maxUsageMonths: 12 }
  showAddCodesDialog.value = true
  if (addCodesFormRef.value) {
    addCodesFormRef.value.resetValidation()
  }
}

const closeAddCodesDialog = () => {
  showAddCodesDialog.value = false
}

const handleAddCodes = async () => {
  if (!addCodesFormRef.value) return

  const { valid } = await addCodesFormRef.value.validate()
  if (!valid) return

  if (!organization.value) return

  try {
    addCodesLoading.value = true
    const id = organization.value.id
    await organizationStore.addOrganizationCodes(
      id,
      addCodesForm.value.numberOfCodes,
      addCodesForm.value.maxUsageMonths ?? 12
    )
    toast.success(`Successfully added ${addCodesForm.value.numberOfCodes} codes`)
    showAddCodesDialog.value = false
    await fetchOrganizationCodes()
  } catch (error: any) {
    console.error('Error adding codes:', error)
    toast.error(error?.message || 'Failed to add codes')
  } finally {
    addCodesLoading.value = false
  }
}

onMounted(() => {
  fetchOrganizationDetails()
})
</script>

<style lang="scss" scoped>
.text-field:deep(.v-input__prepend) {
  margin: 0px;
}

.text-field:deep(.v-field) {
  background-color: white;
}

.text-grey1 {
  color: #666;
}

.text-grey2 {
  color: #999;
}

.codes-table-wrapper {
  border-radius: 8px;
  overflow: hidden;
}

.codes-table {
  &:deep(td) {
    white-space: nowrap !important;
  }

  &:deep(.v-data-table__th) {
    font-weight: 700 !important;
    color: #494949 !important;
    background-color: #f5f5f5;
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: #ebebeb;
    }
  }

  &:deep(.v-data-table-header) {
    background-color: #f5f5f5;
  }

  &:deep(tbody tr:hover) {
    background-color: #f9f9f9 !important;
  }

  &:deep(.v-data-table-header__sort-badge) {
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
  }

  // Style for disabled checkboxes (used codes)
  &:deep(.v-selection-control--disabled) {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

// Copy button styling
.copy-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #666;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #000;
  }

  svg {
    display: block;
    transform: scaleX(-1); // Flip horizontally
  }
}

// Show copy button on row hover
.codes-table:deep(tbody tr:hover .copy-btn) {
  opacity: 1;
}
</style>
