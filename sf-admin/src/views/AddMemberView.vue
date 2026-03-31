<template>
  <v-sheet class="d-flex justify-center w-100">
    <div class="px-6 py-6 d-flex flex-column gr-5 w-100" style="max-width: 720px">

      <!-- Back -->
      <v-btn variant="plain" color="grey2" prepend-icon="$tb-arrow-left" class="px-0 align-self-start" to="/members">
        Back
      </v-btn>

      <!-- Header -->
      <div>
        <h2 class="text-h6 font-weight-bold text-grey1">Add New Customer</h2>
        <p class="text-body-2 text-grey2 mt-1">Fill in the details below to register a new customer.</p>
      </div>

      <v-form ref="form" @submit.prevent="handleSubmit">
        <div class="d-flex flex-column gr-4">

          <!-- Personal Info Card -->
          <v-card flat rounded="lg" style="border: 1px solid #e8edf0">
            <v-card-text class="pa-5">
              <p class="text-body-2 font-weight-bold text-grey1 mb-4" style="letter-spacing: 0.3px">Personal Information</p>
              <div class="d-flex flex-column gr-4">

                <!-- Name -->
                <div>
                  <p class="text-body-2 font-weight-semibold text-grey1 mb-1">Full Name <span class="text-error">*</span></p>
                  <v-text-field
                    v-model="formData.name"
                    placeholder="e.g. Ahmed Al Mansouri"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    :rules="[v => !!v || 'Name is required']"
                  />
                </div>

                <!-- Email + Phone -->
                <div class="d-flex gc-3">
                  <div class="flex-grow-1">
                    <p class="text-body-2 font-weight-semibold text-grey1 mb-1">Email Address</p>
                    <v-text-field
                      v-model="formData.email"
                      type="email"
                      placeholder="email@example.com"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                  </div>
                  <div class="flex-grow-1">
                    <p class="text-body-2 font-weight-semibold text-grey1 mb-1">Phone Number</p>
                    <v-text-field
                      v-model="formData.phone"
                      placeholder="+971XXXXXXXXX"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    />
                  </div>
                </div>

              </div>
            </v-card-text>
          </v-card>

          <!-- Address Card -->
          <v-card flat rounded="lg" style="border: 1px solid #e8edf0">
            <v-card-text class="pa-5">
              <p class="text-body-2 font-weight-bold text-grey1 mb-4" style="letter-spacing: 0.3px">Address Details</p>
              <div class="d-flex flex-column gr-4">

                <!-- Flat + Street -->
                <div class="d-flex gc-3">
                  <div style="flex: 0 0 180px">
                    <p class="text-body-2 font-weight-semibold text-grey1 mb-1">Flat / Villa No</p>
                    <v-text-field
                      v-model="formData.villa"
                      placeholder="e.g. Villa 12"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                    />
                  </div>
                  <div class="flex-grow-1">
                    <p class="text-body-2 font-weight-semibold text-grey1 mb-1">Street Address</p>
                    <v-text-field
                      v-model="formData.address"
                      placeholder="e.g. Al Wasl Road"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                    />
                  </div>
                </div>

                <!-- City + Country -->
                <div class="d-flex gc-3">
                  <div class="flex-grow-1">
                    <p class="text-body-2 font-weight-semibold text-grey1 mb-1">City</p>
                    <v-text-field
                      v-model="formData.city"
                      placeholder="e.g. Dubai"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                    />
                  </div>
                  <div class="flex-grow-1">
                    <p class="text-body-2 font-weight-semibold text-grey1 mb-1">Country</p>
                    <v-text-field
                      v-model="formData.country"
                      placeholder="e.g. UAE"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                    />
                  </div>
                </div>

              </div>
            </v-card-text>
          </v-card>

          <!-- Actions -->
          <div class="d-flex gc-3 justify-end">
            <v-btn variant="outlined" color="grey2" to="/members">Cancel</v-btn>
            <v-btn color="grey1" type="submit" :loading="saving">Add Customer</v-btn>
          </div>

        </div>
      </v-form>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { useMemberStore } from '@/stores/member'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const memberStore = useMemberStore()
const router = useRouter()
const saving = ref(false)

const formData = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  villa: '',
  city: '',
  country: ''
})

const handleSubmit = async () => {
  if (!formData.value.name) return
  try {
    saving.value = true
    await memberStore.addMember(formData.value)
    toast.success('Customer added successfully')
    router.push('/members')
  } finally {
    saving.value = false
  }
}
</script>
