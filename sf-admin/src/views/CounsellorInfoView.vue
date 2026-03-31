<template>
  <v-sheet class="d-flex justify-center w-100 h-100">
    <v-sheet class="w-100 pa-6" max-width="800">
      <v-btn variant="plain" color="grey2" prepend-icon="$tb-arrow-left" class="px-0 mb-4" to="/counsellors">
        Back
      </v-btn>

      <template v-if="loading">
        <v-sheet class="d-flex justify-center align-center py-12">
          <v-progress-circular indeterminate color="primary" />
        </v-sheet>
      </template>

      <template v-else-if="counsellor">
        <h2 class="text-h5 font-weight-bold mb-6">Counsellor Information</h2>
        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleUpdate">
          <v-sheet class="d-flex flex-column gr-4">
            <v-text-field
              v-model="form.name"
              label="Full Name"
              hide-details="auto"
              :rules="[required]"
            />

            <v-text-field
              v-model="form.email"
              label="Email Address"
              type="email"
              hide-details="auto"
            />

            <v-text-field
              v-model="form.phone"
              label="Phone Number"
              hide-details="auto"
            />

            <v-text-field
              v-model="form.designation"
              label="Designation"
              hide-details="auto"
            />

            <v-text-field
              v-model="form.address"
              label="Address"
              hide-details="auto"
            />

            <v-autocomplete
              v-model="form.country"
              label="Country"
              :items="countries"
              hide-details="auto"
            />

            <v-autocomplete
              v-model="form.timeZone"
              label="Timezone"
              :items="timezone"
              hide-details="auto"
            />

            <v-btn type="submit" color="grey1" class="align-self-end" :loading="updating">
              Save Changes
            </v-btn>
          </v-sheet>
        </v-form>

        <!-- Deactivate / Activate -->
        <v-divider class="my-6" />
        <v-sheet class="d-flex flex-column gr-3">
          <h3 class="text-body-1 font-weight-bold">Account Status</h3>
          <p class="text-grey2 text-body-2" style="font-weight: 500">
            Current status: <strong>{{ counsellor.isSuspended ? 'Deactivated' : 'Active' }}</strong>
          </p>
          <div>
            <v-btn
              v-if="!counsellor.isSuspended"
              color="error"
              variant="outlined"
              :loading="statusLoading"
              @click="handleSuspend"
            >
              Deactivate Counsellor
            </v-btn>
            <v-btn
              v-else
              color="success"
              variant="outlined"
              :loading="statusLoading"
              @click="handleActivate"
            >
              Activate Counsellor
            </v-btn>
          </div>
        </v-sheet>

        <!-- Reset Password -->
        <v-divider class="my-6" />
        <v-sheet class="d-flex flex-column gr-3">
          <h3 class="text-body-1 font-weight-bold">Login Credentials</h3>
          <p class="text-grey2 text-body-2" style="font-weight: 500">
            Send a new temporary password to the counsellor's email address.
          </p>
          <div>
            <v-btn color="grey1" variant="outlined" :loading="resettingPassword" @click="handleResetPassword">
              Reset Password
            </v-btn>
          </div>
        </v-sheet>
      </template>
    </v-sheet>
  </v-sheet>
</template>

<script lang="ts" setup>
import { useCounsellorsStore } from '@/stores/counsellors'
import type { Counsellor } from '@/stores/types/counsellors'
import { countries, timezone } from '@/util/constant'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'

const route = useRoute()
const counsellorsStore = useCounsellorsStore()
const id = computed(() => route.params.counsellorId as string)

const formRef = ref()
const isFormValid = ref(false)
const loading = ref(false)
const updating = ref(false)
const statusLoading = ref(false)
const resettingPassword = ref(false)
const counsellor = ref<Counsellor | null>(null)

const form = ref({
  name: '',
  email: '',
  phone: '',
  designation: '',
  address: '',
  country: '',
  timeZone: ''
})

const required = (v: string) => !!v || 'This field is required'

const loadCounsellor = async () => {
  try {
    loading.value = true
    const data = await counsellorsStore.fetchCounsellorDetails(id.value)
    counsellor.value = data
    form.value = {
      name: data.name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      designation: data.designation ?? '',
      address: data.address ?? '',
      country: data.country ?? '',
      timeZone: data.timeZone ?? ''
    }
  } finally {
    loading.value = false
  }
}

const handleUpdate = async () => {
  if (!isFormValid.value) return
  try {
    updating.value = true
    await counsellorsStore.updateCounsellor(id.value, form.value)
    toast.success('Counsellor updated successfully')
    await loadCounsellor()
  } catch {
    toast.error('Failed to update counsellor')
  } finally {
    updating.value = false
  }
}

const handleSuspend = async () => {
  try {
    statusLoading.value = true
    await counsellorsStore.suspendCounsellor(id.value)
    toast.success('Counsellor deactivated')
    await loadCounsellor()
  } finally {
    statusLoading.value = false
  }
}

const handleActivate = async () => {
  try {
    statusLoading.value = true
    await counsellorsStore.activateCounsellor(id.value)
    toast.success('Counsellor activated')
    await loadCounsellor()
  } finally {
    statusLoading.value = false
  }
}

const handleResetPassword = async () => {
  try {
    resettingPassword.value = true
    await counsellorsStore.resetCounsellorPassword(id.value)
    toast.success('Password reset email sent')
  } catch {
    toast.error('Failed to reset password')
  } finally {
    resettingPassword.value = false
  }
}

onMounted(() => {
  loadCounsellor()
})
</script>
