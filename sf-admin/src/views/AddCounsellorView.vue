<template>
  <v-sheet class="d-flex justify-center w-100 h-100 bg-grey-lighten-4">
    <v-sheet class="w-100 pa-6" max-width="860" color="transparent">

      <v-btn variant="plain" color="grey2" prepend-icon="$tb-arrow-left" class="px-0 mb-5" to="/counsellors">
        Back
      </v-btn>
      <h2 class="text-h5 font-weight-bold mb-6">Add New Counsellor</h2>

      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
        <v-sheet class="d-flex flex-column gr-4" color="transparent">

          <!-- Personal Info -->
          <v-sheet class="rounded-lg pa-5" style="border: 1px solid #d0d7dc; background: #fff">
            <p class="text-body-2 font-weight-bold text-uppercase text-grey2 mb-4" style="letter-spacing: 0.5px">
              Personal Information
            </p>
            <v-sheet class="d-flex flex-column gr-3" color="transparent">
              <v-text-field
                v-model="form.name"
                label="Full Name"
                hide-details="auto"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
                placeholder="e.g. Dr. Sarah Ahmed"
              />
              <v-row no-gutters class="gc-3">
                <v-col>
                  <v-text-field
                    v-model="form.email"
                    label="Email Address"
                    type="email"
                    hide-details="auto"
                    variant="outlined"
                    density="comfortable"
                    :rules="[required, emailRule]"
                    placeholder="e.g. sarah@example.com"
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    v-model="form.phone"
                    label="Phone Number"
                    hide-details="auto"
                    variant="outlined"
                    density="comfortable"
                    :rules="[required]"
                    placeholder="e.g. +971501234567"
                    hint="Include country code (e.g. +971...)"
                  />
                </v-col>
              </v-row>
              <v-text-field
                v-model="form.designation"
                label="Designation"
                hide-details="auto"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
                placeholder="e.g. Pet Behaviourist"
              />
            </v-sheet>
          </v-sheet>

          <!-- Location -->
          <v-sheet class="rounded-lg pa-5" style="border: 1px solid #d0d7dc; background: #fff">
            <p class="text-body-2 font-weight-bold text-uppercase text-grey2 mb-4" style="letter-spacing: 0.5px">
              Location & Timezone
            </p>
            <v-sheet class="d-flex flex-column gr-3" color="transparent">
              <v-text-field
                v-model="form.address"
                label="Address"
                hide-details="auto"
                variant="outlined"
                density="comfortable"
                :rules="[required]"
                placeholder="e.g. Dubai Marina, Dubai"
              />
              <v-row no-gutters class="gc-3">
                <v-col>
                  <v-autocomplete
                    v-model="form.country"
                    label="Country"
                    :items="countries"
                    hide-details="auto"
                    variant="outlined"
                    density="comfortable"
                    :rules="[required]"
                  />
                </v-col>
                <v-col>
                  <v-autocomplete
                    v-model="form.timeZone"
                    label="Timezone"
                    :items="timezone"
                    hide-details="auto"
                    variant="outlined"
                    density="comfortable"
                    :rules="[required]"
                  />
                </v-col>
              </v-row>
            </v-sheet>
          </v-sheet>

          <!-- Info note -->
          <v-sheet class="rounded-lg pa-4 d-flex align-center gc-3" style="border: 1px solid #d0d7dc; background: #f7f9ff">
            <v-icon icon="$tb-mail" size="20" color="primary" />
            <p class="text-body-2 text-grey2" style="font-weight: 500">
              Login credentials will be automatically sent to the counsellor's email after adding.
            </p>
          </v-sheet>

          <!-- Submit -->
          <v-sheet class="d-flex justify-end" color="transparent">
            <v-btn
              type="submit"
              color="grey1"
              size="large"
              :loading="submitting"
              :disabled="!isFormValid"
              prepend-icon="$tb-plus"
            >
              Add Counsellor
            </v-btn>
          </v-sheet>

        </v-sheet>
      </v-form>
    </v-sheet>
  </v-sheet>
</template>

<script lang="ts" setup>
import { useCounsellorsStore } from '@/stores/counsellors'
import { countries, timezone } from '@/util/constant'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const router = useRouter()
const counsellorsStore = useCounsellorsStore()

const formRef = ref()
const isFormValid = ref(false)
const submitting = ref(false)

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
const emailRule = (v: string) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) || 'Invalid email address'

const handleSubmit = async () => {
  if (!isFormValid.value) return
  try {
    submitting.value = true
    await counsellorsStore.addCounsellor(form.value)
    toast.success('Counsellor added! Login credentials sent to their email.')
    router.push('/counsellors')
  } catch {
    toast.error('Failed to add counsellor')
  } finally {
    submitting.value = false
  }
}
</script>
