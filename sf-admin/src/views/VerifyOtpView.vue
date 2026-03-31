<template>
  <div class="h-100">
    <v-main class="d-flex align-center justify-center h-100">
      <v-sheet max-width="380" class="w-100 d-flex flex-column align-center" style="gap: 56px">
        <v-img src="/smoll.png" height="22" width="80" />
        <v-sheet class="d-flex flex-column gr-6 w-100">
          <h3 class="text-h6 font-weight-bold">Verify OTP</h3>

          <p class="text-body-2 mb-2" v-if="pendingEmail">
            Enter the 4-digit code sent to <strong>{{ pendingEmail }}</strong>
          </p>

          <v-form
            class="d-flex flex-column gr-6"
            ref="formRef"
            v-model="isFormValid"
            validate-on="blur"
            @submit.prevent="handleVerify"
          >
            <v-sheet>
              <p style="font-weight: 600" class="text-body-1">OTP Code</p>
              <v-text-field
                v-model="otp"
                class="text-field mt-2"
                :disabled="actionLoading"
                hide-details="auto"
                placeholder="Enter 4-digit OTP"
                :rules="rules.otp"
                maxlength="4"
              />
            </v-sheet>

            <v-btn type="submit" class="bg-grey1 w-100 text-body-1" height="44" :loading="actionLoading">
              <template v-slot:append>
                <v-icon icon="$tb-arrow-right" size="20" />
              </template>
              Verify
            </v-btn>
          </v-form>

          <v-btn variant="text" class="mt-2" :disabled="actionLoading" @click="goBack">
            Back to Sign In
          </v-btn>
        </v-sheet>
      </v-sheet>
    </v-main>
  </div>
  
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const formRef = ref()
const isFormValid = ref()
const actionLoading = ref(false)
const otp = ref('')

const authStore = useAuthStore()
const { pendingEmail } = storeToRefs(authStore)
const router = useRouter()

const rules = ref({
  otp: [
    (v: string) => /^\d{4}$/.test(v) || 'OTP must be a 4-digit code.'
  ]
})

const handleVerify = async () => {
  if (!isFormValid.value) return
  try {
    actionLoading.value = true
    await authStore.verifyOtp(otp.value.trim())
    router.replace('/')
  } catch (error: any) {
    // toast.error(error?.message || 'Failed to verify OTP.')
  } finally {
    actionLoading.value = false
  }
}

const goBack = () => {
  router.replace('/login')
}
</script>

<style scoped lang="scss">
.text-field:deep(.v-field) {
  background-color: transparent;
  border: 1px solid #222222;
  color: #222222;
  overflow: hidden;
}
</style>