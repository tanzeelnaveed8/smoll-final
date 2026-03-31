<template>
  <v-sheet class="d-flex justify-center">
    <div class="px-6 py-6 d-flex flex-column gr-6 w-100" style="max-width: 1140px">
      <v-sheet class="d-flex justify-space-between w-100">
        <v-sheet class="d-flex align-center gc-4">
          <UtilityBar path="Veterinarians" />
          <v-btn
            v-push
            flat
            class="text-grey1 px-0 reload-btn"
            min-width="auto"
            height="auto"
            min-height="auto"
            color="transparent "
            style="margin: 0px"
            @click="handleReload"
          >
            <template v-slot:prepend>
              <v-icon icon="$tb-reload" size="20" />
            </template>
          </v-btn>
        </v-sheet>

        <v-btn
          color="grey1"
          class="text-body-2 px-2"
          prepend-icon="$tb-plus"
          density="comfortable"
          @click="openAddDialog"
        >
          <template v-slot:prepend>
            <v-icon icon="$tb-plus" size="20" style="margin-right: -4px" />
          </template>
          New Vet
        </v-btn>
      </v-sheet>
      <v-sheet class="d-flex flex-column gr-3">
        <v-tabs v-model="tab" class="tabs text-grey2" height="auto">
          <v-tab
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            style="line-height: 18px"
            class="pa-1 pb-2"
            min-width="auto"
            height="auto"
            >{{ tab.title }}</v-tab
          >
        </v-tabs>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item v-for="tab in tabs" :value="tab.value">
            <HomeVetsWindow :homeVets="homeVets.data" :actionLoading :maxValue @remove="handleRemove" />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-sheet>

      <v-dialog v-model="addDialog" max-width="520">
        <v-card rounded="xl">
          <v-card-title class="px-5 pt-5 pb-2">
            <h3 class="text-h6 font-weight-bold">Add Vet</h3>
          </v-card-title>
          <v-card-text class="px-5 pb-4 d-flex flex-column" style="gap: 12px">
            <v-text-field
              v-model="form.drName"
              label="Dr. Name"
              required
              density="comfortable"
              variant="outlined"
            />
            <v-text-field
              v-model="form.specialty"
              label="Specialty"
              density="comfortable"
              variant="outlined"
            />
            <v-text-field
              v-model="form.email"
              label="Email"
              type="email"
              density="comfortable"
              variant="outlined"
            />
            <v-text-field
              v-model="form.phone"
              label="Phone"
              density="comfortable"
              variant="outlined"
            />
            <v-text-field
              v-model="form.imageUrl"
              label="Image URL"
              density="comfortable"
              variant="outlined"
            />
            <v-text-field
              v-model="form.password"
              label="Password"
              type="password"
              density="comfortable"
              variant="outlined"
            />
          </v-card-text>
          <v-card-actions class="px-5 pb-4 d-flex justify-end" style="gap: 8px">
            <v-btn variant="outlined" color="grey-darken-1" @click="addDialog = false">
              Cancel
            </v-btn>
            <v-btn color="primary" @click="handleSaveVet">
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-sheet>
</template>

<script lang="ts" setup>
import HomeVetsWindow from '@/components/app/homeVets/HomeVetsWindow.vue'
import UtilityBar from '@/components/partials/UtilityBar.vue'
import useMitt from '@/functions/useMitt'
import type { HomeVet } from '@/stores/types/homeVets'
import { useHomeVetsStore } from '@/stores/homeVets'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const { emitter } = useMitt()

const tab = ref('active')
const tabs = [
  { title: 'Active', value: 'active' },
  { title: 'Deactivated', value: 'deactivate' }
]
const isSuspended = computed(() => tab.value === 'deactivate')

const homeVets = ref<{ data: HomeVet[]; totalRequests: number }>({ data: [], totalRequests: 0 })

const homeVetsStore = useHomeVetsStore()
const actionLoading = ref(false)
const maxValue = ref()

const addDialog = ref(false)
const form = ref({
  drName: '',
  specialty: '',
  email: '',
  phone: '',
  imageUrl: '',
  password: ''
})

const getHomeVets = async (isSuspended: boolean, search?: string, page?: number) => {
  try {
    actionLoading.value = true
    const { data, count } = await homeVetsStore.fetchHomeVets(isSuspended, search, page)
    homeVets.value = { data, totalRequests: count }
    maxValue.value = Math.ceil(Number(count) / 10)
  } finally {
    actionLoading.value = false
  }
}

const handleReload = () => {
  getHomeVets(isSuspended.value)
}

const openAddDialog = () => {
  form.value = {
    drName: '',
    specialty: '',
    email: '',
    phone: '',
    imageUrl: '',
    password: ''
  }
  addDialog.value = true
}

const handleSaveVet = async () => {
  if (!form.value.drName.trim() || !form.value.email.trim() || !form.value.phone.trim()) {
    toast.error('Name, email and phone are required')
    return
  }
  try {
    actionLoading.value = true
    // Normalize phone: strip spaces/dashes, ensure E.164 format
    let phone = form.value.phone.trim().replace(/[\s\-()]/g, '')
    if (!phone.startsWith('+')) {
      if (phone.startsWith('0')) {
        phone = phone.slice(1)
      }
      phone = `+971${phone}`
    }
    await homeVetsStore.addHomeVet({
      name: form.value.drName,
      email: form.value.email,
      phone,
      designation: form.value.specialty || 'Veterinarian',
      dob: new Date(1985, 0, 1).toISOString() as any,
      address: 'Dubai',
      country: 'UAE',
      timeZone: 'Asia/Dubai',
      profileImg: null as any,
      documents: [],
      password: form.value.password || undefined
    })
    toast.success('Vet added')
    addDialog.value = false
    // Always switch to the Active tab after adding a vet
    // so the newly created (non-suspended) vet is visible.
    tab.value = 'active'
    await getHomeVets(false)
  } catch (err: any) {
    const msg = err?.response?.data?.message
    toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to add vet')
  } finally {
    actionLoading.value = false
  }
}

const handleRemove = async (vet: HomeVet) => {
  try {
    actionLoading.value = true
    await homeVetsStore.suspendHomeVet(vet.id)
    toast.success('Vet removed (deactivated) successfully')
    await getHomeVets(isSuspended.value)
  } catch (err: any) {
    const msg = err?.response?.data?.message
    toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to remove vet')
  } finally {
    actionLoading.value = false
  }
}

watch(
  [isSuspended, () => route.query.page, () => route.query.search],
  ([suspended, page, search]) => {
    getHomeVets(suspended as boolean, (search as string) ?? '', Number(page) || 1)
  },
  { immediate: true }
)

watch(tab, () => {
  router.replace({ query: undefined })
})

onMounted(() => {
  emitter.on('home-vets:update', () => getHomeVets(isSuspended.value))
})

onUnmounted(() => {
  emitter.off('home-vets:update', () => getHomeVets(isSuspended.value))
})
</script>

<style scoped lang="scss">
.tabs:deep(.v-slide-group__content) {
  gap: 16px;
}
.tabs:deep(.v-tab-item--selected) {
  color: #222222 !important;
}
.reload-btn {
  &:deep(.v-btn__prepend) {
    margin: 0px;
  }
}
</style>
