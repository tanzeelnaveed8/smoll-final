<template>
  <v-form
    ref="formRef"
    class="d-flex justify-center w-100"
    v-model="formIsValid"
    @submit.prevent="handleFormSubmit"
  >
    <v-sheet class="w-100" max-width="1140">
      <FormLayout>
        <template #form-header>
          <FormHeader title="Add New Vet" />
        </template>
        <template #form>
          <HomeVetForm @updateDetails="handleUpdate" :actionLoading />
        </template>
        <template #upload>
          <UploadDoc @updateDoc="handleUpdate" />
        </template>
      </FormLayout>
    </v-sheet>
    <FormFooter buttonText="Add" :loading="actionLoading" />
  </v-form>
</template>

<script lang="ts" setup>
import HomeVetForm from '@/components/app/homeVets/HomeVetForm.vue'
import FormLayout from '@/components/layout/FormLayout.vue'
import FormFooter from '@/components/partials/formUi/FormFooter.vue'
import FormHeader from '@/components/partials/formUi/FormHeader.vue'
import UploadDoc from '@/components/partials/formUi/UploadDoc.vue'
import { useHomeVetsStore } from '@/stores/homeVets'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const actionLoading = ref()
const formRef = ref()
const formIsValid = ref(false)
const homeVetsStore = useHomeVetsStore()
const router = useRouter()

const vetDetails = ref()

const handleUpdate = (details: any) => {
  vetDetails.value = { ...vetDetails.value, ...details }
}

const addVet = async () => {
  try {
    actionLoading.value = true
    await homeVetsStore.addHomeVet(vetDetails.value)
  } finally {
    actionLoading.value = false
  }
}

const handleFormSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  await addVet()
  router.push('/smoll-home/veterinarians')
}
</script>
