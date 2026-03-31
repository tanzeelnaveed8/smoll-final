<template>
  <div class="h-100">
    <v-main class="d-flex align-center justify-center h-100">
      <v-sheet max-width="380" class="w-100 d-flex flex-column align-center" style="gap: 56px">
        <v-img src="/smoll.png" height="22" width="80" />
        <v-sheet class="d-flex flex-column gr-6 w-100">
          <h3 class="text-h6 font-weight-bold">Sign in</h3>
          <v-form
            class="d-flex flex-column gr-6"
            ref="formRef"
            v-model="isFormValid"
            validate-on="blur"
            @submit.prevent="handleFormSubmit"
          >
            <v-sheet class="d-flex flex-column gr-4">
              <v-sheet>
                <p style="font-weight: 600" class="text-body-1">Email address</p>
                <v-text-field
                  v-model="account.email"
                  type="email"
                  :disabled="actionLoading"
                  hide-details="auto"
                  class="text-field mt-2 text-grey1"
                  placeholder="Email address"
                  :rules="rules.email"
                  append-inner-icon="$tb-mail"
                />
              </v-sheet>

              <v-sheet>
                <p style="font-weight: 600" class="text-body-1">Password</p>
                <v-text-field
                  v-model="account.pwd"
                  class="text-field mt-2"
                  :disabled="actionLoading"
                  hide-details="auto"
                  placeholder="Password"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="rules.pwd"
                  :append-inner-icon="showPassword ? '$tb-eye' : '$tb-eyeoff'"
                  @click:append-inner="showPassword = !showPassword"
                />
              </v-sheet>
            </v-sheet>
            <v-btn
              type="submit"
              class="bg-grey1 w-100 text-body-1"
              height="44"
              :loading="actionLoading"
            >
              <template v-slot:append>
                <v-icon icon="$tb-arrow-right" size="20" />
              </template>
              Sign In</v-btn
            >
          </v-form>
          <v-sheet class="d-flex gr-4 flex-column align-center text-body-2 font-weight-medium">
            <span class="text-grey2">
              <span class="text-no-wrap tex-grey2">Trouble signing in? Contact </span>
              <a class="text-grey2" href="mailto:care@smoll.me">care@smoll.me</a>
            </span>
          </v-sheet>
        </v-sheet>
      </v-sheet>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const formRef = ref()
const isFormValid = ref()
const showPassword = ref(false)
const actionLoading = ref(false)

const authStore = useAuthStore()
const router = useRouter()

const rules = ref({
  email: [
    (v: string) =>
      /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(v) || 'Please enter a valid email address.'
  ],
  pwd: [(v: string) => /^.{1,}/gm.test(v) || 'Password must be atleast 8 character long.']
})

const account = ref({
  email: '',
  pwd: ''
})

const handleFormSubmit = async () => {
  if (!isFormValid.value) return
  try {
    actionLoading.value = true

    await authStore.login({
      email: account.value.email.trim(),
      password: account.value.pwd.trim()
    })

    // Navigate to OTP verification step
    router.replace('/verify-otp')
  } finally {
    actionLoading.value = false
  }
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
