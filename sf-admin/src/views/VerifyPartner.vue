<template>
  <v-form class="d-flex justify-center w-100">
    <v-sheet class="w-100" max-width="1140">
      <FormLayout>
        <template #form-header>
          <FormHeader
            title="Partner Request"
          />
        </template>
        <template #form>
          <PartnerForm :actionLoading />
        </template>
        <template #upload>
          <UploadDoc />
        </template>
        <template #deactivate-account>
          <RejectPartner />
        </template>
      </FormLayout>
    </v-sheet>
    <FormFooter
      buttonText="Approve profile"
      icon="tb-rosette-discount-check"
      :loading="actionLoading"
    />
  </v-form>
</template>

<script lang="ts" setup>
import PartnerForm from '@/components/app/partner/PartnerForm.vue'
import FormLayout from '@/components/layout/FormLayout.vue'
import FormFooter from '@/components/partials/formUi/FormFooter.vue'
import FormHeader from '@/components/partials/formUi/FormHeader.vue'
import RejectPartner from '@/components/partials/formUi/RejectPartner.vue'
import UploadDoc from '@/components/partials/formUi/UploadDoc.vue'
import { ref } from 'vue'

const actionLoading = ref(false)
</script>
