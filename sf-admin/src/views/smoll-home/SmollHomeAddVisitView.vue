<template>
  <v-sheet class="d-flex justify-center w-100 h-100 bg-grey-lighten-4">
    <v-sheet class="w-100 pa-6" max-width="860" color="transparent">
      <!-- Header -->
      <v-btn variant="plain" color="grey2" prepend-icon="$tb-arrow-left" class="px-0 mb-5" to="/smoll-home/history">
        Back
      </v-btn>
      <h2 class="text-h5 font-weight-bold mb-6">Add Visit</h2>

      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-sheet class="d-flex flex-column gr-4" color="transparent">

          <!-- Customer & Pet -->
          <v-sheet class="rounded-lg pa-5" style="border: 1px solid #d0d7dc; background: #fff">
            <v-sheet class="d-flex flex-column gr-3" color="transparent">
              <v-autocomplete
                v-model="form.memberId"
                label="Customer Name"
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
                label="Pet Name"
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
              <v-text-field
                v-model="form.address"
                label="Address"
                hide-details="auto"
                variant="outlined"
                density="comfortable"
              />
            </v-sheet>
          </v-sheet>

          <!-- Date & Time -->
          <v-sheet class="rounded-lg pa-5" style="border: 1px solid #d0d7dc; background: #fff">
            <v-sheet class="d-flex" style="gap: 12px" color="transparent">
              <v-text-field
                v-model="form.date"
                label="Date"
                type="date"
                hide-details="auto"
                variant="outlined"
                density="comfortable"
                style="flex: 1"
              />
              <v-text-field
                v-model="form.time"
                label="Time"
                type="time"
                hide-details="auto"
                variant="outlined"
                density="comfortable"
                style="flex: 1"
              />
            </v-sheet>
          </v-sheet>

          <!-- Services -->
          <v-sheet class="rounded-lg pa-5" style="border: 1px solid #d0d7dc; background: #fff">
            <p class="text-body-2 font-weight-bold text-uppercase text-grey2 mb-4" style="letter-spacing: 0.5px">Services</p>
            <template v-if="loadingServices">
              <v-skeleton-loader type="list-item@3" />
            </template>
            <template v-else-if="!allServices.length">
              <p class="text-caption text-grey-darken-1">No services available</p>
            </template>
            <template v-else>
              <div class="d-flex flex-column" style="gap: 6px">
                <div
                  v-for="svc in allServices"
                  :key="svc.id"
                  class="d-flex align-center justify-space-between pa-3 rounded-lg"
                  style="border: 1px solid #e8ecf0; cursor: pointer"
                  :style="selectedServiceIds.has(svc.id) ? 'border-color: #1565C0; background: #f0f7ff' : ''"
                  @click="toggleService(svc)"
                >
                  <div class="d-flex align-center" style="gap: 10px">
                    <v-checkbox-btn
                      :model-value="selectedServiceIds.has(svc.id)"
                      color="primary"
                      density="compact"
                      hide-details
                      @click.stop
                      @update:model-value="toggleService(svc)"
                    />
                    <span class="text-body-2">{{ svc.name }}</span>
                  </div>
                  <span class="text-body-2 font-weight-bold" style="color: #2e7d32">
                    AED {{ svc.price ?? 0 }}
                  </span>
                </div>
              </div>
            </template>
          </v-sheet>

          <!-- Products -->
          <v-sheet class="rounded-lg pa-5" style="border: 1px solid #d0d7dc; background: #fff">
            <p class="text-body-2 font-weight-bold text-uppercase text-grey2 mb-4" style="letter-spacing: 0.5px">Products</p>
            <template v-if="loadingProducts">
              <v-skeleton-loader type="list-item@3" />
            </template>
            <template v-else-if="!allProducts.length">
              <p class="text-caption text-grey-darken-1">No products available</p>
            </template>
            <template v-else>
              <div class="d-flex flex-column" style="gap: 6px">
                <div
                  v-for="prod in allProducts"
                  :key="prod.id"
                  class="d-flex align-center justify-space-between pa-3 rounded-lg"
                  style="border: 1px solid #e8ecf0; cursor: pointer"
                  :style="selectedProductIds.has(prod.id) ? 'border-color: #1565C0; background: #f0f7ff' : ''"
                  @click="toggleProduct(prod)"
                >
                  <div class="d-flex align-center" style="gap: 10px">
                    <v-checkbox-btn
                      :model-value="selectedProductIds.has(prod.id)"
                      color="primary"
                      density="compact"
                      hide-details
                      @click.stop
                      @update:model-value="toggleProduct(prod)"
                    />
                    <span class="text-body-2">{{ prod.name }}</span>
                  </div>
                  <span class="text-body-2 font-weight-bold" style="color: #2e7d32">
                    AED {{ prod.price ?? 0 }}
                  </span>
                </div>
              </div>
            </template>
          </v-sheet>

          <!-- Submit -->
          <v-sheet class="d-flex justify-end" color="transparent">
            <v-btn
              type="submit"
              color="grey1"
              size="large"
              :loading="submitting"
            >
              Save Changes
            </v-btn>
          </v-sheet>

        </v-sheet>
      </v-form>
    </v-sheet>
  </v-sheet>
</template>

<script lang="ts" setup>
import { useVetVisitsStore } from '@/stores/vet-visits'
import { useMemberStore } from '@/stores/member'
import { useVetMembersStore } from '@/stores/vet-members'
import { useServiceStore } from '@/stores/service'
import { useProductStore } from '@/stores/product'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const router = useRouter()
const vetVisitsStore = useVetVisitsStore()
const memberStore = useMemberStore()
const vetMembersStore = useVetMembersStore()
const serviceStore = useServiceStore()
const productStore = useProductStore()

const formRef = ref()
const submitting = ref(false)
const loadingMembers = ref(false)
const loadingPets = ref(false)
const loadingServices = ref(false)
const loadingProducts = ref(false)

const members = ref<any[]>([])
const pets = ref<any[]>([])
const allServices = ref<any[]>([])
const allProducts = ref<any[]>([])

const selectedServiceIds = ref<Set<string>>(new Set())
const selectedProductIds = ref<Set<string>>(new Set())

const form = ref({
  memberId: '',
  petId: '',
  address: '',
  date: '',
  time: ''
})

const required = (v: string) => !!v || 'This field is required'

const toggleService = (svc: any) => {
  const s = new Set(selectedServiceIds.value)
  if (s.has(svc.id)) {
    s.delete(svc.id)
  } else {
    s.add(svc.id)
  }
  selectedServiceIds.value = s
}

const toggleProduct = (prod: any) => {
  const s = new Set(selectedProductIds.value)
  if (s.has(prod.id)) {
    s.delete(prod.id)
  } else {
    s.add(prod.id)
  }
  selectedProductIds.value = s
}

const searchMembers = async (search: string) => {
  if (!search || search.length < 2) return
  try {
    loadingMembers.value = true
    const res = await vetMembersStore.fetchVetMembers(search)
    members.value = res.data || []
  } finally {
    loadingMembers.value = false
  }
}

const fetchPets = async (memberId: string) => {
  try {
    loadingPets.value = true
    const data = await memberStore.fetchMembersDetails(memberId)
    pets.value = data.pets ?? []
    // Auto-fill address from member
    if (data.address && !form.value.address) {
      form.value.address = data.address
    }
  } finally {
    loadingPets.value = false
  }
}

watch(() => form.value.memberId, (newVal) => {
  if (newVal) {
    form.value.petId = ''
    form.value.address = ''
    fetchPets(newVal)
  }
})

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const services = allServices.value
    .filter((s) => selectedServiceIds.value.has(s.id))
    .map((s) => ({ id: s.id, name: s.name, price: Number(s.price) || 0 }))

  const products = allProducts.value
    .filter((p) => selectedProductIds.value.has(p.id))
    .map((p) => ({ id: p.id, name: p.name, price: Number(p.price) || 0 }))

  let scheduledAt: string | undefined
  if (form.value.date) {
    const timePart = form.value.time || '00:00'
    scheduledAt = new Date(`${form.value.date}T${timePart}`).toISOString()
  }

  try {
    submitting.value = true
    await vetVisitsStore.createConsultationForAdmin({
      memberId: form.value.memberId,
      petId: form.value.petId,
      address: form.value.address || undefined,
      scheduledAt,
      services,
      products
    })
    toast.success('Visit created successfully')
    router.push('/smoll-home/history')
  } catch {
    toast.error('Failed to create visit')
  } finally {
    submitting.value = false
  }
}

const loadInitialMembers = async () => {
  try {
    loadingMembers.value = true
    const res = await vetMembersStore.fetchVetMembers()
    members.value = res.data || []
  } finally {
    loadingMembers.value = false
  }
}

const fetchServices = async () => {
  try {
    loadingServices.value = true
    const res = await serviceStore.fetchServices()
    allServices.value = res.data
  } finally {
    loadingServices.value = false
  }
}

const fetchProducts = async () => {
  try {
    loadingProducts.value = true
    const res = await productStore.fetchProducts()
    allProducts.value = res.data
  } finally {
    loadingProducts.value = false
  }
}

onMounted(() => {
  loadInitialMembers()
  fetchServices()
  fetchProducts()
})
</script>
