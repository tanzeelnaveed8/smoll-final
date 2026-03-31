<template>
  <v-sheet class="d-flex justify-center">
    <div class="px-6 py-6 d-flex flex-column gr-6 w-100" style="max-width: 1140px">
      <v-sheet class="d-flex justify-space-between w-100">
        <v-sheet class="d-flex align-center gc-4">
          <UtilityBar path="/services" />
        </v-sheet>
        <v-btn color="grey1" class="text-body-2 px-2" prepend-icon="$tb-plus" density="comfortable" @click="openAddDialog">
          <template v-slot:prepend>
            <v-icon icon="$tb-plus" size="20" style="margin-right: -4px" />
          </template>
          New Service
        </v-btn>
      </v-sheet>
      <v-sheet class="d-flex flex-column gr-6">
        <v-table class="text-body-2" style="border: 1px solid #dde7ee; border-radius: 8px">
          <thead>
            <tr>
              <th class="font-weight-bold">Name</th>
              <th class="font-weight-bold">Description</th>
              <th class="font-weight-bold">Time needed</th>
              <th class="font-weight-bold">Starting price</th>
              <th class="font-weight-bold">Status</th>
              <th class="font-weight-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-6">
                <v-progress-circular indeterminate color="primary" size="24" />
              </td>
            </tr>
            <tr v-else-if="!services.length">
              <td colspan="6" class="text-center py-6 text-grey2">No services found</td>
            </tr>
            <tr v-for="service in services" :key="service.id" class="cursor-pointer" @click="editService(service)">
              <td class="font-weight-bold">{{ service.name }}</td>
              <td>{{ service.description || '-' }}</td>
              <td>{{ service.durationMinutes != null ? service.durationMinutes + ' min' : '-' }}</td>
              <td>{{ service.price }} {{ service.currency }}</td>
              <td>
                <v-chip :color="service.isActive ? 'success' : 'error'" size="small">
                  {{ service.isActive ? 'Active' : 'Inactive' }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-btn icon variant="text" size="small" @click.stop="confirmDelete(service)">
                  <v-icon icon="$tb-x" size="18" color="error" />
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
        <TableFooter :maxValue path="/services" />
      </v-sheet>
    </div>
  </v-sheet>

  <!-- Add/Edit Dialog -->
  <v-dialog v-model="showAddDialog" width="560" persistent>
    <v-card class="service-form-card">
      <v-card-title class="text-h6 font-weight-bold pa-5 pb-0">
        {{ editingService ? 'Edit Service' : 'Add Service' }}
      </v-card-title>
      <v-card-text class="pa-5 pt-4">
        <v-form ref="form" @submit.prevent="handleSave" class="service-form">
          <v-text-field
            v-model="formData.name"
            label="Name"
            :rules="[v => !!v || 'Name is required']"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="mb-3"
          />
          <v-textarea
            v-model="formData.description"
            label="Description"
            rows="3"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="mb-3"
          />
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model.number="formData.price"
                label="Price"
                type="number"
                min="0"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="mb-3"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="formData.durationMinutes"
                label="Minutes"
                type="number"
                min="0"
                placeholder="e.g. 30"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="mb-3"
              />
            </v-col>
          </v-row>
          <v-file-input
            v-model="formData.pictures"
            label="Pictures (optional)"
            prepend-icon=""
            prepend-inner-icon="$tb-cloud-upload"
            multiple
            accept="image/*"
            variant="outlined"
            density="compact"
            hide-details="auto"
            show-size
            class="mb-3"
            @update:model-value="onServicePicturesSelect"
          />
          <v-sheet v-if="servicePreviewUrl" class="mt-2">
            <v-img :src="servicePreviewUrl" alt="Preview" class="service-image-preview" cover />
          </v-sheet>
          <v-switch v-if="editingService" v-model="formData.isActive" label="Active" color="primary" hide-details class="mb-3" />

          <!-- Packages section -->
          <v-sheet class="mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-2 font-weight-bold">Packages</span>
              <v-btn size="small" variant="tonal" color="primary" @click="addPackage">+ Add package</v-btn>
            </div>
            <v-sheet v-if="formData.packages.length === 0" class="text-body-2 text-grey2 py-2">No packages yet</v-sheet>
            <v-sheet v-for="(pkg, pkgIdx) in formData.packages" :key="pkgIdx" class="mb-3 pa-3" style="border: 1px solid #e0e0e0; border-radius: 8px">
              <div class="d-flex align-center gc-2 mb-2">
                <v-text-field
                  v-model="pkg.name"
                  label="Package name"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="flex: 2"
                />
                <v-text-field
                  v-model.number="pkg.price"
                  label="Price (AED)"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="flex: 1"
                />
                <v-checkbox
                  v-model="pkg.highlighted"
                  label="Featured"
                  density="compact"
                  hide-details
                  color="primary"
                  style="flex: 0 0 auto"
                />
                <v-btn icon variant="text" size="small" @click="removePackage(pkgIdx)">
                  <v-icon icon="$tb-x" size="16" color="error" />
                </v-btn>
              </div>
              <!-- Perks -->
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-caption text-grey">Perks / Features</span>
                <v-btn size="x-small" variant="text" color="primary" @click="addPerk(pkgIdx)">+ Add perk</v-btn>
              </div>
              <v-sheet v-for="(perk, perkIdx) in pkg.perks" :key="perkIdx" class="d-flex align-center gc-2 mb-1">
                <v-text-field
                  v-model="pkg.perks[perkIdx]"
                  :label="`Perk ${perkIdx + 1}`"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="flex: 1"
                />
                <v-btn icon variant="text" size="small" @click="removePerk(pkgIdx, perkIdx)">
                  <v-icon icon="$tb-x" size="14" color="error" />
                </v-btn>
              </v-sheet>
              <v-sheet v-if="!pkg.perks.length" class="text-caption text-grey2">No perks added</v-sheet>
            </v-sheet>
          </v-sheet>

          <!-- Add-ons section -->
          <v-sheet class="mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-2 font-weight-bold">Add-ons</span>
              <v-btn size="small" variant="tonal" color="primary" @click="addAddon">+ Add add-on</v-btn>
            </div>
            <v-sheet v-if="formData.addons.length === 0" class="text-body-2 text-grey2 py-2">No add-ons yet</v-sheet>
            <v-sheet v-for="(addon, index) in formData.addons" :key="index" class="d-flex align-center gc-2 mb-2">
              <v-text-field
                v-model="addon.name"
                label="Add-on name"
                variant="outlined"
                density="compact"
                hide-details
                style="flex: 2"
              />
              <v-text-field
                v-model.number="addon.price"
                label="Price"
                type="number"
                min="0"
                variant="outlined"
                density="compact"
                hide-details
                style="flex: 1"
              />
              <v-btn icon variant="text" size="small" @click="removeAddon(index)">
                <v-icon icon="$tb-x" size="16" color="error" />
              </v-btn>
            </v-sheet>
          </v-sheet>

          <v-sheet class="d-flex gap-3 justify-end pt-2">
            <v-btn variant="outlined" @click="showAddDialog = false">Cancel</v-btn>
            <v-btn color="primary" :loading="saving" @click="handleSave">Save</v-btn>
          </v-sheet>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Delete Confirmation -->
  <v-dialog v-model="showDeleteDialog" width="400">
    <v-card class="pa-6">
      <h3 class="mb-4">Delete Service</h3>
      <p>Are you sure you want to delete "{{ deletingService?.name }}"?</p>
      <v-sheet class="d-flex gc-3 justify-end mt-4">
        <v-btn variant="outlined" @click="showDeleteDialog = false">Cancel</v-btn>
        <v-btn color="error" :loading="deleting" @click="handleDelete">Delete</v-btn>
      </v-sheet>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import UtilityBar from '@/components/partials/UtilityBar.vue'
import TableFooter from '@/components/partials/table/TableFooter.vue'
import { useServiceStore } from '@/stores/service'
import { ref, watch, watchEffect } from 'vue'
import { useRoute, type LocationQueryValue } from 'vue-router'
import { toast } from 'vue3-toastify'

const route = useRoute()
const serviceStore = useServiceStore()

const services = ref<any[]>([])
const loading = ref(false)
const maxValue = ref(0)
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingService = ref<any>(null)
const deletingService = ref<any>(null)
const servicePreviewUrl = ref<string | null>(null)

const formData = ref({
  name: '',
  description: '',
  price: 0,
  durationMinutes: null as number | null,
  isActive: true,
  pictures: [] as unknown[],
  addons: [] as { name: string; price: number }[],
  packages: [] as { name: string; price: number; highlighted: boolean; perks: string[] }[],
})

const addAddon = () => {
  formData.value.addons.push({ name: '', price: 0 })
}

const removeAddon = (index: number) => {
  formData.value.addons.splice(index, 1)
}

const addPackage = () => {
  formData.value.packages.push({ name: '', price: 0, highlighted: false, perks: [] })
}

const removePackage = (index: number) => {
  formData.value.packages.splice(index, 1)
}

const addPerk = (pkgIdx: number) => {
  formData.value.packages[pkgIdx].perks.push('')
}

const removePerk = (pkgIdx: number, perkIdx: number) => {
  formData.value.packages[pkgIdx].perks.splice(perkIdx, 1)
}

const getServices = async (search?: string, page?: number) => {
  try {
    loading.value = true
    const pageNum = page != null && Number(page) >= 1 ? Number(page) : 1
    const searchStr = search != null ? String(search).trim() : ''
    const result = await serviceStore.fetchServices(searchStr || undefined, pageNum)
    services.value = result?.data ?? []
    const total = result?.count ?? 0
    maxValue.value = Math.max(1, Math.ceil(total / 10))
  } catch {
    services.value = []
    maxValue.value = 1
    toast.error('Failed to load services')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  if (servicePreviewUrl.value) {
    URL.revokeObjectURL(servicePreviewUrl.value)
    servicePreviewUrl.value = null
  }
  editingService.value = null
  formData.value = { name: '', description: '', price: 0, durationMinutes: null, isActive: true, pictures: [], addons: [], packages: [] }
  showAddDialog.value = true
}

function setServicePreviewFromFiles(files: unknown) {
  if (servicePreviewUrl.value) {
    URL.revokeObjectURL(servicePreviewUrl.value)
    servicePreviewUrl.value = null
  }
  const list = Array.isArray(files) ? files : files ? [files] : []
  const first = list.find((f): f is File => f instanceof File && f.type.startsWith('image/'))
  if (first) servicePreviewUrl.value = URL.createObjectURL(first)
}

const onServicePicturesSelect = (files: File[] | File | null) => {
  setServicePreviewFromFiles(files)
}

watch(() => formData.value.pictures, (newVal) => {
  setServicePreviewFromFiles(newVal)
}, { immediate: true })

const editService = (service: any) => {
  if (servicePreviewUrl.value) {
    URL.revokeObjectURL(servicePreviewUrl.value)
    servicePreviewUrl.value = null
  }
  editingService.value = service
  formData.value = {
    name: service.name,
    description: service.description || '',
    price: service.price,
    durationMinutes: service.durationMinutes ?? null,
    isActive: service.isActive,
    pictures: [],
    addons: Array.isArray(service.addons) ? service.addons.map((a: any) => ({ name: a.name, price: Number(a.price) })) : [],
    packages: Array.isArray(service.packages) ? service.packages.map((p: any) => ({
      name: p.name,
      price: Number(p.price),
      highlighted: !!p.highlighted,
      perks: Array.isArray(p.perks) ? [...p.perks] : [],
    })) : [],
  }
  showAddDialog.value = true
}

const confirmDelete = (service: any) => {
  deletingService.value = service
  showDeleteDialog.value = true
}

const handleSave = async () => {
  const name = formData.value.name?.trim()
  if (!name) {
    toast.error('Name is required')
    return
  }
  try {
    saving.value = true
    const price = Number(formData.value.price)
    const durationMinutes = formData.value.durationMinutes != null ? Number(formData.value.durationMinutes) : null
    const addons = formData.value.addons
      .filter(a => a.name?.trim())
      .map(a => ({ name: a.name.trim(), price: Number(a.price) || 0 }))
    const packages = formData.value.packages
      .filter(p => p.name?.trim())
      .map(p => ({
        name: p.name.trim(),
        price: Number(p.price) || 0,
        highlighted: !!p.highlighted,
        perks: p.perks.filter(pk => pk?.trim()).map(pk => pk.trim()),
      }))
    const payload = {
      name,
      description: formData.value.description?.trim() || undefined,
      price: Number.isFinite(price) ? price : 0,
      durationMinutes: durationMinutes != null && Number.isFinite(durationMinutes) ? durationMinutes : undefined,
      isActive: formData.value.isActive,
      addons: addons.length > 0 ? addons : undefined,
      packages: packages.length > 0 ? packages : undefined,
    }
    if (editingService.value) {
      await serviceStore.updateService(editingService.value.id, payload)
      toast.success('Service updated')
    } else {
      await serviceStore.addService(payload)
      toast.success('Service added')
    }
    showAddDialog.value = false
    editingService.value = null
    if (servicePreviewUrl.value) {
      URL.revokeObjectURL(servicePreviewUrl.value)
      servicePreviewUrl.value = null
    }
    formData.value = { name: '', description: '', price: 0, durationMinutes: null, isActive: true, pictures: [], addons: [], packages: [] }
    const pageNum = route.query.page != null && Number(route.query.page) >= 1 ? Number(route.query.page) : 1
    const searchStr = (route.query.search as string) ?? ''
    await getServices(searchStr, pageNum)
  } catch {
    toast.error(editingService.value ? 'Failed to update service' : 'Failed to add service')
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  try {
    deleting.value = true
    await serviceStore.deleteService(deletingService.value.id)
    toast.success('Service deleted')
    showDeleteDialog.value = false
    const pageNum = route.query.page != null && Number(route.query.page) >= 1 ? Number(route.query.page) : 1
    const searchStr = (route.query.search as string) ?? ''
    await getServices(searchStr, pageNum)
  } finally {
    deleting.value = false
  }
}

watchEffect(async () => {
  const page = route.query.page != null && Number(route.query.page) >= 1 ? Number(route.query.page) : 1
  const search = (route.query.search as LocationQueryValue) ?? ''
  await getServices(search, page)
})
</script>

<style scoped>
.service-form-card {
  border-radius: 12px;
}
.service-image-preview {
  max-width: 120px;
  max-height: 120px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
</style>
