<template>
  <div class="h-100 w-100">
    <template v-if="loading">
      <v-sheet class="d-flex justify-center align-center h-100 w-100" style="min-height: 100vh">
        <v-progress-circular indeterminate color="primary" />
      </v-sheet>
    </template>

    <template v-else>
      <v-main class="d-flex align-center justify-center h-100 px-4" style="min-height: 100vh">
        <v-sheet max-width="380" class="w-100 d-flex flex-column align-center" style="gap: 28px">
          <div class="d-flex align-center" style="gap: 10px">
            <v-icon icon="mdi-paw" size="40" color="primary" />
            <span class="text-h5 font-weight-bold">smoll Home</span>
          </div>

          <v-sheet class="d-flex flex-column w-100 text-center">
            <h3 class="text-h6">Vet Admin Login</h3>
            <v-sheet class="d-flex flex-column gr-5 mt-5 text-start">
              <v-form
                class="d-flex flex-column gr-5"
                ref="formRef"
                v-model="isFormValid"
                validate-on="blur"
                @submit.prevent="handleFormSubmit"
              >
                <v-sheet class="d-flex flex-column gr-3">
                  <v-sheet>
                    <p class="text-body-2 font-weight-medium mb-1">Email address</p>
                    <v-text-field
                      v-model="account.email"
                      type="email"
                      :disabled="actionLoading"
                      hide-details="auto"
                      placeholder="Enter email"
                      :rules="rules.email"
                    />
                  </v-sheet>

                  <v-sheet>
                    <p class="text-body-2 font-weight-medium mb-1">Password</p>
                    <v-text-field
                      v-model="account.pwd"
                      :disabled="actionLoading"
                      hide-details="auto"
                      placeholder="Password"
                      :type="showPassword ? 'text' : 'password'"
                      :rules="rules.pwd"
                      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append-inner="showPassword = !showPassword"
                    />
                  </v-sheet>
                </v-sheet>

                <v-btn
                  type="submit"
                  class="bg-primary w-100 text-body-1"
                  height="44"
                  :loading="actionLoading"
                  :disabled="actionLoading"
                >
                  Sign In
                </v-btn>
              </v-form>
            </v-sheet>
          </v-sheet>

          <v-btn variant="text" color="primary" to="/login" class="mt-2">
            <v-icon start icon="mdi-arrow-left" />
            Admin Login
          </v-btn>
        </v-sheet>
      </v-main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useVetAuthStore } from '@/stores/vet-auth'
import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const vetAuthStore = useVetAuthStore()
const { user } = storeToRefs(vetAuthStore)

const formRef = ref()
const isFormValid = ref()
const showPassword = ref(false)
const actionLoading = ref(false)
const loading = ref(false)

const rules = ref({
  email: [
    (v: string) =>
      /^[\w.+-]+@([\w-]+\.)+[\w-]{2,4}$/g.test(v) || 'Please enter a valid email address.'
  ],
  pwd: [(v: string) => /^.{8,}/gm.test(v) || 'Password must be at least 8 characters long.']
})

const account = ref({
  email: '',
  pwd: ''
})

onBeforeMount(async () => {
  try {
    if (!user.value) {
      loading.value = true
      await vetAuthStore.fetchUser()
      if (user.value) {
        router.replace('/smoll-home')
      }
    } else {
      router.replace('/smoll-home')
    }
  } catch {
    // Not logged in, stay on login page
  } finally {
    loading.value = false
  }
})

const handleFormSubmit = async () => {
  if (!isFormValid.value) return

  try {
    actionLoading.value = true
    await vetAuthStore.login({
      email: account.value.email.trim(),
      password: account.value.pwd.trim()
    })
    router.replace('/smoll-home')
  } finally {
    actionLoading.value = false
  }
}
</script>
