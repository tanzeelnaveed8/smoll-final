<template>
  <v-divider color="#D0D7DC" class="opacity-100" />
  <v-sheet
    class="py-8 px-6 d-flex flex-column gr-4"
    style="border: 1px solid #777; border-radius: 12px"
  >
    <v-sheet>
      <h4 class="text-body-1 text-grey1" style="font-weight: 600">Reset Password</h4>
      <p class="text-grey2 mt-2 text-body-2 font-weight-medium">A new password will be generated and sent to the registered email address.</p>
    </v-sheet>
    <v-btn
      color="#222"
      density="comfortable"
      class="px-2 align-self-start"
      style="letter-spacing: 0px"
      :loading
      :disabled="loading"
      @click="handleResetPassword"
      >Reset</v-btn
    >
  </v-sheet>
</template>

<script setup lang="ts">
import { usePartnerStore } from '@/stores/partner';
import { ref } from 'vue';
import { toast } from 'vue3-toastify';

const props = defineProps<{
  id: string
}>()

const partnerStore = usePartnerStore()

const loading = ref(false)

const handleResetPassword = async () => {
    try {
    loading.value = true
      await partnerStore.resetPartnerPassword(props.id)
      toast.success('New Password sent successfully!')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
    
</style>