<template>
  <div class="login-root h-100 w-100">
    <template v-if="loading">
      <v-sheet class="d-flex justify-center align-center h-100 w-100">
        <v-progress-circular indeterminate color="primary" />
      </v-sheet>
    </template>

    <template v-else>
      <v-main class="login-main d-flex align-center justify-center h-100 px-4">
        <v-sheet class="login-hero login-card-combined" rounded="xl" elevation="12">
          <div class="login-card-inner">
            <!-- Brand / hero -->
            <div class="login-hero-left">
              <div class="d-flex align-center mb-2" style="gap: 10px">
                <v-avatar color="white" size="40">
                  <v-icon icon="mdi-paw" size="30" color="primary" />
                </v-avatar>
                <div class="d-flex flex-column">
                  <span class="text-h6 font-weight-bold text-white">HomeSuite</span>
                  <span class="text-caption text-white text-medium-emphasis">Vet portal</span>
                </div>
              </div>
              <h2 class="login-hero-title">Care for pets, made simple.</h2>
              <p class="login-hero-subtitle">
                Log in to manage home visits, daily schedule, and pet care in a single, focused workspace.
              </p>
              <ul class="login-hero-points">
                <li>See upcoming home visits at a glance</li>
                <li>Review pet details before every appointment</li>
                <li>Keep your schedule organised and on time</li>
              </ul>
            </div>

            <!-- Form inside the same card -->
            <div class="login-form-wrapper">
              <div class="login-card-header mb-3">
                <h1 class="login-title text-white">Welcome back</h1>
                <p class="login-subtitle text-white text-medium-emphasis">
                  Sign in to continue to your HomeSuite.
                </p>
              </div>

              <v-form
                ref="formRef"
                v-model="isFormValid"
                validate-on="blur"
                class="d-flex flex-column"
                @submit.prevent="handleFormSubmit"
              >
                <div class="d-flex flex-column" style="row-gap: 16px">
                  <div>
                    <p class="text-body-2 font-weight-medium mb-1 text-white">Email address</p>
                    <v-text-field
                      v-model="account.email"
                      type="email"
                      :disabled="actionLoading"
                      hide-details="auto"
                      placeholder="name@clinic.com"
                      density="comfortable"
                      variant="outlined"
                      :rules="rules.email"
                      autocomplete="email"
                      class="login-text-field"
                    />
                  </div>

                  <div>
                    <div class="d-flex justify-space-between align-center mb-1">
                      <p class="text-body-2 font-weight-medium mb-0 text-white">Password</p>
                      <button
                        type="button"
                        class="login-link-button text-caption"
                        @click="showPassword = !showPassword"
                      >
                        {{ showPassword ? 'Hide' : 'Show' }} password
                      </button>
                    </div>
                    <v-text-field
                      v-model="account.pwd"
                      :disabled="actionLoading"
                      hide-details="auto"
                      placeholder="Enter your password"
                      :type="showPassword ? 'text' : 'password'"
                      :rules="rules.pwd"
                      density="comfortable"
                      variant="outlined"
                      autocomplete="current-password"
                      class="login-text-field"
                    />
                  </div>
                </div>

                <v-alert
                  v-if="errorMessage"
                  type="error"
                  variant="tonal"
                  density="compact"
                  closable
                  class="mt-4"
                  @click:close="errorMessage = ''"
                >
                  {{ errorMessage }}
                </v-alert>

                <v-btn
                  type="submit"
                  class="mt-6 w-100 text-body-1 font-weight-semibold login-submit-btn"
                  height="44"
                  :loading="actionLoading"
                  :disabled="actionLoading"
                >
                  Sign in
                </v-btn>

                <p class="text-caption text-white text-medium-emphasis text-center mt-4">
                  Having trouble logging in? Contact your Smoll coordinator for access.
                </p>
              </v-form>
            </div>
          </div>

          <div class="login-hero-footer text-caption text-white text-high-emphasis mt-4">
            Designed for Smoll vets • Secure access
          </div>
        </v-sheet>
      </v-main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const formRef = ref()
const isFormValid = ref()
const showPassword = ref(false)
const actionLoading = ref(false)
const loading = ref(false)
const errorMessage = ref('')

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

onBeforeMount(() => {
  // If already logged in in this session, go straight to home
  if (user.value) {
    router.replace('/home')
  }
  loading.value = false
})

const handleFormSubmit = async () => {
  if (!isFormValid.value) return

  try {
    errorMessage.value = ''
    actionLoading.value = true
    await authStore.login({
      email: account.value.email.trim(),
      password: account.value.pwd.trim()
    })
    router.replace('/home')
  } catch (error: any) {
    const msg = error.response?.data?.message
    if (Array.isArray(msg)) {
      errorMessage.value = msg[0]
    } else {
      errorMessage.value = msg || 'Something went wrong. Please try again.'
    }
  } finally {
    actionLoading.value = false
  }
}
</script>

<style scoped>
.login-root {
  background:
    radial-gradient(circle at top left, rgba(227, 242, 253, 0.9) 0, transparent 55%),
    radial-gradient(circle at bottom right, rgba(252, 228, 236, 0.9) 0, transparent 55%),
    linear-gradient(135deg, #f5f7fb, #ffffff);
}

.login-main {
  max-width: 1200px;
  margin: 0 auto;
}

.login-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 32px;
  width: 100%;
  align-items: stretch;
}

.login-hero {
  border-radius: 28px;
  padding: 32px 32px 24px;
  background:
    radial-gradient(circle at top right, rgba(144, 202, 249, 0.35), transparent 60%),
    linear-gradient(135deg, #1565c0, #5c6bc0);
  color: #fff;
  box-shadow: 0 18px 45px rgba(21, 101, 192, 0.35);
}

.login-hero-title {
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 8px;
}

.login-hero-subtitle {
  font-size: 14px;
  opacity: 0.95;
  max-width: 320px;
}

.login-hero-points {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  font-size: 13px;
}

.login-hero-points li::before {
  content: '•';
  margin-right: 6px;
}

.login-hero-footer {
  opacity: 0.9;
}

.login-card {
  border-radius: 24px;
  padding: 28px 24px 24px;
  background-color: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
}

.login-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
}

.login-subtitle {
  font-size: 13px;
  color: #607d8b;
  margin: 4px 0 0;
}

.login-link-button {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: #ffffff;
  font-weight: 500;
}

.login-submit-btn {
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.35);
}

.login-submit-btn :deep(.v-btn__content) {
  color: #0f172a;
  font-weight: 600;
}

.login-card-combined {
  max-width: 900px;
  width: 100%;
  transform: translateY(0);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.login-card-inner {
  display: flex;
  flex-direction: row;
  gap: 32px;
}

.login-hero-left {
  flex: 1.1;
}

.login-form-wrapper {
  flex: 0.9;
  padding: 12px 0 0;
}

.login-text-field :deep(.v-field) {
  background-color: #ffffff;
}

.login-text-field :deep(.v-field__input),
.login-text-field :deep(input) {
  color: #0f172a !important;
}

.login-card-combined:hover {
  transform: translateY(-4px);
  box-shadow: 0 26px 65px rgba(15, 23, 42, 0.46);
}

@media (max-width: 960px) {
  .login-shell {
    grid-template-columns: minmax(0, 1fr);
    max-width: 420px;
  }

  .login-card {
    padding: 24px 20px 22px;
  }

  .login-card-inner {
    flex-direction: column;
    gap: 24px;
  }

  .login-form-wrapper {
    padding-bottom: 4px;
  }
}
</style>
