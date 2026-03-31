<template>
  <v-sheet class="d-flex justify-center">
    <div class="px-6 py-6 d-flex flex-column gr-6 w-100" style="max-width: 640px">
      <v-sheet class="d-flex flex-column gr-6">
        <h4 class="text-body-1 text-grey1" style="font-weight: 700">Change Password</h4>
        <v-form v-model="isFormValid" ref="formRef" @submit.prevent="handleSubmit">
          <v-sheet class="d-flex flex-column gr-4 mt-2">
            <v-sheet>
              <p style="font-weight: 600" class="text-body-1">Old Password</p>
              <v-text-field
                v-model="form.currentPassword"
                :type="showOld ? 'text' : 'password'"
                :append-inner-icon="showOld ? '$tb-eye' : '$tb-eyeoff'"
                @click:append-inner="showOld = !showOld"
                class="text-field mt-2 text-grey1"
                hide-details="auto"
                placeholder="Enter old password"
                :rules="rules.required"
                :disabled="actionLoading"
              />
            </v-sheet>

            <v-sheet>
              <p style="font-weight: 600" class="text-body-1">New Password</p>
              <v-text-field
                v-model="form.newPassword"
                :type="showNew ? 'text' : 'password'"
                :append-inner-icon="showNew ? '$tb-eye' : '$tb-eyeoff'"
                @click:append-inner="showNew = !showNew"
                class="text-field mt-2 text-grey1"
                hide-details="auto"
                placeholder="Enter new password"
                :rules="rules.password"
                :disabled="actionLoading"
              />
            </v-sheet>

            <v-sheet>
              <p style="font-weight: 600" class="text-body-1">Repeat Password</p>
              <v-text-field
                v-model="repeatPassword"
                :type="showRepeat ? 'text' : 'password'"
                :append-inner-icon="showRepeat ? '$tb-eye' : '$tb-eyeoff'"
                @click:append-inner="showRepeat = !showRepeat"
                class="text-field mt-2 text-grey1"
                hide-details="auto"
                placeholder="Enter new password"
                :rules="[rules.required[0], matchRule]"
                :disabled="actionLoading"
              />
            </v-sheet>

             <v-sheet class="d-flex justify-start">
              <v-btn
                type="submit"
                class="text-body-1 text-white"
                height="40"
                :loading="actionLoading"
                :disabled="!isFormValid || !canSubmit"
                color="#B8D4E6"
                style="text-transform: none; letter-spacing: 0"
                rounded="pill"
              >
                Change Password
              </v-btn>
            </v-sheet>
          </v-sheet>
        </v-form>
      </v-sheet>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { ref, computed } from 'vue'
import { toast } from 'vue3-toastify'

const formRef = ref()
const isFormValid = ref(false)
const actionLoading = ref(false)
const showOld = ref(false)
const showNew = ref(false)
const showRepeat = ref(false)

const repeatPassword = ref('')
const form = ref({
  currentPassword: '',
  newPassword: ''
})

const rules = {
  required: [(v: string) => /^.{1,}/gm.test(v) || 'Required.'],
  password: [
    (v: string) => /^.{8,}/gm.test(v) || 'Password must be at least 8 characters.'
  ]
}

const matchRule = (v: string) => v === form.value.newPassword || 'Passwords do not match.'

const canSubmit = computed(() => !!form.value.currentPassword && !!form.value.newPassword && repeatPassword.value === form.value.newPassword)

const authStore = useAuthStore()

const handleSubmit = async () => {
  if (!isFormValid.value || !canSubmit.value) return
  try {
    actionLoading.value = true
    await authStore.updateUserPassword({
      currentPassword: form.value.currentPassword.trim(),
      newPassword: form.value.newPassword.trim()
    })
    toast.success('Password changed successfully')
    form.value = { currentPassword: '', newPassword: '' }
    repeatPassword.value = ''
    formRef.value?.resetValidation?.()
  } finally {
    actionLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.text-field:deep(.v-field) {
  background-color: transparent;
  border: 1px solid #dde7ee;
  color: #222222;
  overflow: hidden;
}
</style>