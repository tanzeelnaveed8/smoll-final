<template>
  <v-form
    class="d-flex justify-center w-100"
    ref="formRef"
    v-model="formIsValid"
    @submit.prevent="handleFormSubmit"
  >
    <v-sheet class="w-100" max-width="1140">
      <FormLayout>
        <template #form-header>
          <FormHeader
            title="Add Partner"
          />
        </template>
        <template #form>
          <PartnerForm @updateDetails="handleUpdate" :actionLoading />
        </template>
        <template #upload>
          <UploadDoc @updateDoc="handleUpdate"  :hideAppointmentsAndSpecialties="true"/>
        </template>
      </FormLayout>
    </v-sheet>
    <FormFooter buttonText="Add Partner" :loading="actionLoading" />
  </v-form>
</template>

<script lang="ts" setup>
import PartnerForm from '@/components/app/partner/PartnerForm.vue'
import FormLayout from '@/components/layout/FormLayout.vue'
import FormFooter from '@/components/partials/formUi/FormFooter.vue'
import FormHeader from '@/components/partials/formUi/FormHeader.vue'
import UploadDoc from '@/components/partials/formUi/UploadDoc.vue'
import { usePartnerStore } from '@/stores/partner'
import type { Partner } from '@/stores/types/partner'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const actionLoading = ref()
const formRef = ref()
const formIsValid = ref(false)
const PartnerStore = usePartnerStore()
const router = useRouter()

const partnerDetails = ref<any>()

const handleUpdate = (details: any) => {
  partnerDetails.value = { ...partnerDetails.value, ...details }
}

const addPartner = async () => {
  try {
    actionLoading.value = true
    await PartnerStore.addPartner(partnerDetails.value)
  } finally {
    actionLoading.value = false
  }
}

const handleFormSubmit = async () => {
  if (!formIsValid.value) return
  await addPartner()
  router.push('/partners')
}
</script>
