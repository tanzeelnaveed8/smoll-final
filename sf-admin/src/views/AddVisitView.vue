<template>
  <v-sheet class="d-flex justify-center w-100 h-100 bg-grey-lighten-4">
    <v-sheet class="w-100 pa-6" max-width="860" color="transparent">
      <!-- Header -->
      <v-btn variant="plain" color="grey2" prepend-icon="$tb-arrow-left" class="px-0 mb-5" to="/visits">
        Back
      </v-btn>
      <h2 class="text-h5 font-weight-bold mb-6">Create New Visit</h2>

      <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleSubmit">
        <v-sheet class="d-flex flex-column gr-4" color="transparent">

          <!-- Section: Customer & Pet -->
          <v-sheet class="rounded-lg pa-5" style="border: 1px solid #d0d7dc; background: #fff">
            <p class="text-body-2 font-weight-bold text-uppercase text-grey2 mb-4" style="letter-spacing: 0.5px">Customer Information</p>
            <v-sheet class="d-flex flex-column gr-3" color="transparent">
              <v-autocomplete
                v-model="form.memberId"
                label="Customer"
                :items="members"
                item-title="name"
                item-value="id"
                :loading="loadingMembers"
                :rules="[required]"
                hide-details="auto"
                variant="outlined"
                density="comfortable"
                @update:search="searchMembers"
              />
              <v-autocomplete
                v-model="form.petId"
                label="Pet"
                :items="pets"
                item-title="name"
                item-value="id"
                :disabled="!form.memberId"
                :loading="loadingPets"
                :rules="[required]"
                hide-details="auto"
                variant="outlined"
                density="comfortable"
                :placeholder="!form.memberId ? 'Select a customer first' : 'Select pet'"
              />
            </v-sheet>
          </v-sheet>

          <!-- Section: Vet & Schedule -->
          <v-sheet class="rounded-lg pa-5" style="border: 1px solid #d0d7dc; background: #fff">
            <p class="text-body-2 font-weight-bold text-uppercase text-grey2 mb-4" style="letter-spacing: 0.5px">Visit Details</p>
            <v-sheet class="d-flex flex-column gr-3" color="transparent">
              <v-autocomplete
                v-model="form.vetId"
                label="Assigned Veterinarian"
                :items="vets"
                item-title="name"
                item-value="id"
                :loading="loadingVets"
                :rules="[required]"
                hide-details="auto"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="form.scheduledAt"
                label="Scheduled Date & Time"
                type="datetime-local"
                hide-details="auto"
                variant="outlined"
                density="comfortable"
              />
            </v-sheet>
          </v-sheet>

          <!-- Section: Description -->
          <v-sheet class="rounded-lg pa-5" style="border: 1px solid #d0d7dc; background: #fff">
            <p class="text-body-2 font-weight-bold text-uppercase text-grey2 mb-4" style="letter-spacing: 0.5px">Visit Description</p>
            <v-textarea
              v-model="form.description"
              placeholder="Describe the reason for visit, symptoms, or any relevant details..."
              rows="4"
              :rules="[required]"
              hide-details="auto"
              variant="outlined"
              no-resize
            />
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
              Create Visit
            </v-btn>
          </v-sheet>

        </v-sheet>
      </v-form>
    </v-sheet>
  </v-sheet>
</template>

<script lang="ts" setup>
import { useCaseStore } from '@/stores/case'
import { useMemberStore } from '@/stores/member'
import { useVeterniansStore } from '@/stores/veternians'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const router = useRouter()
const caseStore = useCaseStore()
const memberStore = useMemberStore()
const vetStore = useVeterniansStore()

const formRef = ref()
const isFormValid = ref(false)
const submitting = ref(false)
const loadingMembers = ref(false)
const loadingPets = ref(false)
const loadingVets = ref(false)

const members = ref<any[]>([])
const pets = ref<any[]>([])
const vets = ref<any[]>([])

const form = ref({
  memberId: '',
  petId: '',
  vetId: '',
  description: '',
  scheduledAt: ''
})

const required = (v: string) => !!v || 'This field is required'

const searchMembers = async (search: string) => {
  if (!search || search.length < 2) return
  try {
    loadingMembers.value = true
    const data = await memberStore.fetchMembers(search)
    members.value = data.data
  } finally {
    loadingMembers.value = false
  }
}

const fetchPets = async (memberId: string) => {
  try {
    loadingPets.value = true
    const data = await memberStore.fetchMembersDetails(memberId)
    pets.value = data.pets ?? []
  } finally {
    loadingPets.value = false
  }
}

const fetchVets = async () => {
  try {
    loadingVets.value = true
    const data = await vetStore.fetchVets(false)
    vets.value = data.data
  } finally {
    loadingVets.value = false
  }
}

watch(() => form.value.memberId, (newVal) => {
  if (newVal) {
    form.value.petId = ''
    fetchPets(newVal)
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value) return
  try {
    submitting.value = true
    await caseStore.createCase({
      ...form.value,
      scheduledAt: form.value.scheduledAt || undefined
    })
    toast.success('Visit created successfully')
    router.push('/visits')
  } catch {
    toast.error('Failed to create visit')
  } finally {
    submitting.value = false
  }
}

const loadInitialMembers = async () => {
  try {
    loadingMembers.value = true
    const data = await memberStore.fetchMembers()
    members.value = data.data
  } finally {
    loadingMembers.value = false
  }
}

onMounted(() => {
  fetchVets()
  loadInitialMembers()
})
</script>
