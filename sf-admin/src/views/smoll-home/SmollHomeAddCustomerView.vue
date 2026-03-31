<template>
  <v-sheet class="d-flex justify-center w-100">
    <div class="px-4 px-sm-6 py-6 d-flex flex-column gr-5 w-100" style="max-width: 720px">
      <v-btn
        variant="plain"
        color="grey-darken-1"
        prepend-icon="mdi-arrow-left"
        class="px-0 align-self-start"
        to="/smoll-home/customers"
      >
        Back
      </v-btn>

      <div>
        <h2 class="text-h6 font-weight-bold" style="color: #1565C0">Add Customer</h2>
        <p class="text-caption text-grey-darken-1 mt-1">
          This customer will appear in your Vet Admin customers list.
        </p>
      </div>

      <v-form ref="form" @submit.prevent="handleSubmit">
        <div class="d-flex flex-column gr-4">
          <v-card flat rounded="lg" style="border: 1px solid #e0e7f1">
            <v-card-text class="pa-5 d-flex flex-column gr-4">
              <div>
                <p class="text-body-2 font-weight-semibold mb-1">
                  Full Name <span class="text-error">*</span>
                </p>
                <v-text-field
                  v-model="formData.name"
                  placeholder="e.g. Ahmed Al Mansouri"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  :rules="[v => !!v || 'Name is required']"
                />
              </div>

              <div class="d-flex flex-column flex-sm-row" style="gap: 12px">
                <div class="flex-grow-1">
                  <p class="text-body-2 font-weight-semibold mb-1">Email</p>
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
                  <p class="text-body-2 font-weight-semibold mb-1">Phone</p>
                  <v-text-field
                    v-model="formData.phone"
                    placeholder="+971XXXXXXXXX"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  />
                </div>
              </div>

              <div>
                <p class="text-body-2 font-weight-semibold mb-1">Address</p>
                <v-text-field
                  v-model="formData.address"
                  placeholder="Street / Area"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                />
              </div>
            </v-card-text>
          </v-card>

          <div class="d-flex justify-end" style="gap: 8px">
            <v-btn variant="outlined" color="grey-darken-1" to="/smoll-home/customers">
              Cancel
            </v-btn>
            <v-btn color="primary" type="submit" :loading="saving">
              Save Customer
            </v-btn>
          </div>
        </div>
      </v-form>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/member'
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
    router.push('/smoll-home/customers')
  } finally {
    saving.value = false
  }
}
</script>

