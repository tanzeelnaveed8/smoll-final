<template>
  <v-form
    class="d-flex justify-center w-100 h-100"
    v-model="isFormValid"
    ref="formRef"
    @submit.prevent="handleFormSubmit"
  >
    <template v-if="loading">
      <v-sheet class="d-flex justify-center align-center h-100">
        <v-progress-circular indeterminate color="primary" />
      </v-sheet>
    </template>
    <v-sheet v-else class="w-100" max-width="1140">
      <FormLayout>
        <template #form-header>
          <FormHeader
            title="Vet Information"
          />
        </template>
        <template #form>
          <VetForm :formDetails="vetDetails!" :actionLoading @updateDetails="handleVetFormUpdate" />
        </template>
        <template #upload>
          <UploadDoc :formDetails="docDetails" @updateDoc="handleDocUpdate" />
        </template>
        <template #deactivate-account>
          <DeactivateAccount v-if="!vetDetails?.isSuspended" :id="vetDetails?.id!" type="vet" />
          <!-- Reset Password -->
          <v-sheet class="mt-6">
            <h3 class="text-body-1 font-weight-bold mb-2">Login Credentials</h3>
            <p class="text-grey2 text-body-2 mb-3" style="font-weight: 500">Generate a new temporary password for this vet.</p>
            <v-btn color="grey1" variant="outlined" :loading="resettingPassword" @click="handleResetPassword">
              Reset Password
            </v-btn>
          </v-sheet>
          <!-- Visit History -->
          <v-sheet class="mt-6">
            <h3 class="text-body-1 font-weight-bold mb-3">Visit History</h3>
            <v-sheet v-if="loadingCases" class="d-flex justify-center py-4">
              <v-progress-circular indeterminate color="primary" size="24" />
            </v-sheet>
            <v-sheet v-else-if="vetCases.length" class="d-flex flex-column gr-2">
              <v-card v-for="c in vetCases" :key="c.id" flat class="pa-3 rounded-lg" style="border: 1px solid #d0d7dc">
                <v-sheet class="d-flex justify-space-between align-center">
                  <div>
                    <p class="font-weight-bold">{{ c.id }}</p>
                    <p class="text-grey2 text-body-2">Member: {{ c.member?.name ?? '-' }} | Pet: {{ c.pet?.name ?? '-' }}</p>
                  </div>
                  <v-chip :color="c.status === 'closed' ? 'success' : 'warning'" size="small">{{ c.status }}</v-chip>
                </v-sheet>
              </v-card>
            </v-sheet>
            <p v-else class="text-grey2 text-body-2" style="font-weight: 500">No visit history found.</p>
          </v-sheet>
        </template>
      </FormLayout>
    </v-sheet>
    <FormFooter buttonText="Update" :loading="actionLoading" />
  </v-form>
</template>

<script lang="ts" setup>
import VetForm from '@/components/app/veternians/VetForm.vue'
import FormLayout from '@/components/layout/FormLayout.vue'
import DeactivateAccount from '@/components/partials/formUi/DeactivateAccount.vue'
import FormFooter from '@/components/partials/formUi/FormFooter.vue'
import UploadDoc from '@/components/partials/formUi/UploadDoc.vue'
import FormHeader from '@/components/partials/formUi/FormHeader.vue'
import type { Vets } from '@/stores/types/veternians'
import { useVeterniansStore } from '@/stores/veternians'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'

const formRef = ref()
const isFormValid = ref(false)

const loading = ref(false)
const actionLoading = ref(false)
const vetDetails = ref<Vets | null>(null)
const vetCases = ref<any[]>([])
const loadingCases = ref(false)
const resettingPassword = ref(false)
const accountDetails = ref({
  documents: [],
  profileImg: null,
  specialties: [],
  byAppointmentOnly: false
})

const veterniansStore = useVeterniansStore()
const route = useRoute()
const id = computed(() => route.params.vetId)

const docDetails = computed(() => ({
  profileImg: vetDetails.value?.profileImg || null,
  documents: vetDetails.value?.documents || [],
  specialties: vetDetails.value?.specialties || [],
  byAppointmentOnly: vetDetails.value?.byAppointmentOnly ?? false
}))

// Helper to merge only defined values and normalize specialties to id array
const mergeAccountDetails = (partial: any) => {
  const definedOnly = Object.fromEntries(
    Object.entries(partial ?? {}).filter(([, v]) => v !== undefined)
  ) as any

  if (definedOnly.specialties !== undefined) {
    definedOnly.specialties = (definedOnly.specialties || []).map((s: any) =>
      typeof s === 'object' ? s.id : s
    )
  }
  accountDetails.value = {
    ...accountDetails.value,
    ...definedOnly
  }
}

// Separate handlers for better debugging
const handleVetFormUpdate = (details: any) => {
  const { specialties: _ignoreSpecialties, documents: _ignoreDocs, profileImg: _ignoreImg, ...rest } = details || {}
  mergeAccountDetails(rest)
}

const handleDocUpdate = (details: any) => {
  mergeAccountDetails(details)
}



const getVet = async () => {
  try {
    loading.value = true
    const data = await veterniansStore.fetchVetDetails(`${id.value}`)

    // ✅ normalize backend → frontend
    vetDetails.value = {
      ...data,
      specialties: (data as any).specialities ?? [] 
    }

    // Initialize accountDetails with current vet data
    accountDetails.value = {
      documents: data.documents || [],
      profileImg: data.profileImg || null,
      specialties: (data as any).specialities?.map((s: { id?: string | number } | string | number) =>
        typeof s === 'object' ? s.id as string | number : s
      ) || [],
      byAppointmentOnly: data.byAppointmentOnly ?? false
    }
  } finally {
    loading.value = false
  }
}

const updateVet = async () => {
  try {
    actionLoading.value = true
    const specialityIds = accountDetails.value.specialties || []
    // Include VetForm fields alongside files/specialties
    const { documents, profileImg, specialties, byAppointmentOnly, ...vetFormFields } = accountDetails.value as any
    const payload = {
      ...vetFormFields,
      documents: documents || [],
      profileImg: profileImg || null,
      specialityIds: specialityIds,
      byAppointmentOnly: byAppointmentOnly ?? false
    }
    
    await veterniansStore.updateVet(`${id.value}`, payload)
  } finally {
    actionLoading.value = false
  }
}
const handleFormSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  await updateVet()
  toast.success('Vet updated successfully')
}

const getVetCases = async () => {
  try {
    loadingCases.value = true
    vetCases.value = await veterniansStore.fetchVetCases(`${id.value}`)
  } finally {
    loadingCases.value = false
  }
}

const handleResetPassword = async () => {
  try {
    resettingPassword.value = true
    await veterniansStore.resetVetPassword(`${id.value}`)
    toast.success('Password reset email sent')
  } finally {
    resettingPassword.value = false
  }
}


onMounted(() => {
  getVet()
  getVetCases()
})
</script>