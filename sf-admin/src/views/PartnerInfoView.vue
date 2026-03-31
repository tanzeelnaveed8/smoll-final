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
            title="Add Partner"
          />
        </template>
        <template #form>
          <PartnerForm
            :formDetails="partnerDetails"
            :actionLoading
            @updateDetails="handleUpdateDetails"
          />
        </template>
        <template #upload>
          <!-- <UploadDoc :formDetails="docDetails" @updateDoc="handleUpdateDocs" /> -->
          <UploadDoc 
            :formDetails="docDetails" 
            @updateDoc="handleUpdateDocs" 
            :hideAppointmentsAndSpecialties="true"
          />
        </template>
        <template #reset-password>
          <ResetPassword :id="partnerDetails?.id!" />
        </template>
        <template #deactivate-account>
          <DeactivateAccount
            v-if="!partnerDetails?.isSuspended"
            :id="partnerDetails?.id!"
            type="partner"
          />
        </template>
      </FormLayout>
    </v-sheet>
    <FormFooter buttonText="Update" :loading="actionLoading" />
  </v-form>
</template>

<script lang="ts" setup>
import PartnerForm from '@/components/app/partner/PartnerForm.vue'
import FormLayout from '@/components/layout/FormLayout.vue'
import DeactivateAccount from '@/components/partials/formUi/DeactivateAccount.vue'
import FormFooter from '@/components/partials/formUi/FormFooter.vue'
import ResetPassword from '@/components/partials/formUi/ResetPassword.vue'
import UploadDoc from '@/components/partials/formUi/UploadDoc.vue'
import { usePartnerStore } from '@/stores/partner'
import type { Partner } from '@/stores/types/partner'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'

const formRef = ref()
const isFormValid = ref(false)

const loading = ref(false)
const actionLoading = ref(false)
const partnerDetails = ref<Partner>()
const accountDetails = ref()

const partnerStore = usePartnerStore()
const route = useRoute()
const id = computed(() => route.params.partnerId)

// It sends clinic image according to the props of uploadDoc component
const docDetails = computed(() => ({
  profileImg: partnerDetails.value?.clinicImg || null,
  documents: partnerDetails.value?.documents || []
}))

const handleUpdateDetails = (details: any) => {
  const { clinicImg, imgCollections, ...restDetails } = details
  accountDetails.value = {
    ...accountDetails.value,
    ...restDetails
  }
}

const handleUpdateDocs = (details: any) => {
  accountDetails.value = {
    ...accountDetails.value,
    clinicImg: details.profileImg,
    documents: details.documents
  }
}

const getPartner = async () => {
  try {
    loading.value = true
    const data = await partnerStore.fetchPartnerDetails(`${id.value}`)
    partnerDetails.value = data
  } finally {
    loading.value = false
  }
}

const updatePartner = async () => {
  try {
    actionLoading.value = true
    await partnerStore.updatePartner(`${id.value}`, accountDetails.value)
  } finally {
    actionLoading.value = false
  }
}

const handleFormSubmit = async () => {
  if (!isFormValid.value) return
  await updatePartner()
  toast.success('Partner updated successfully')
}

onMounted(() => {
  getPartner()
})
</script>
