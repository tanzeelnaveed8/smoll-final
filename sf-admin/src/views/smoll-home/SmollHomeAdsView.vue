<template>
  <div class="d-flex flex-column gr-4">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center flex-wrap mb-4">
      <div>
        <h2 class="text-h6 text-sm-h5 font-weight-bold" style="color: #1565C0">Sponsored Ads</h2>
        <p class="text-caption text-grey-darken-1">Manage sponsored ad spots for Home Services</p>
      </div>
      <v-btn color="primary" variant="tonal" rounded="xl" @click="openAddDialog">
        <v-icon icon="mdi-plus" start />
        Add Ad Spot
      </v-btn>
    </div>

    <!-- Ads Grid -->
    <template v-if="loading">
      <div class="d-flex flex-column gr-3">
        <v-skeleton-loader v-for="i in 3" :key="i" type="card" />
      </div>
    </template>

    <template v-else-if="!adSpots.length">
      <v-card rounded="lg" elevation="0" border class="pa-8 text-center">
        <v-icon icon="mdi-image-multiple-outline" size="48" color="grey-lighten-1" class="mb-3" />
        <p class="text-body-2 text-grey-darken-1">No ad spots found</p>
      </v-card>
    </template>

    <template v-else>
      <v-row dense>
        <v-col
          v-for="ad in adSpots"
          :key="ad.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card rounded="xl" elevation="0" border class="ad-card h-100">
            <v-img
              :src="ad.imageUrl"
              height="200"
              cover
              class="ad-image"
            >
              <template v-slot:placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <v-icon icon="mdi-image-off" size="48" color="grey-lighten-1" />
                </div>
              </template>
            </v-img>

            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <v-chip :color="ad.isActive ? 'success' : 'grey'" size="small" label>
                  {{ ad.isActive ? 'Active' : 'Inactive' }}
                </v-chip>
                <span class="text-caption text-grey-darken-1">Position: {{ ad.position || 'General' }}</span>
              </div>

              <h3 class="text-body-1 font-weight-bold mb-3">{{ ad.title }}</h3>

              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-caption text-grey-darken-1 mb-0">Action:</p>
                  <p class="text-body-2 font-weight-medium">{{ ad.actionLabel }}</p>
                </div>
                <div class="d-flex" style="gap: 8px">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="handleEdit(ad)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="handleDelete(ad)"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600" persistent>
      <v-card rounded="xl">
        <v-card-title class="pa-4">
          <h3 class="text-h6 font-weight-bold">{{ editingAd ? 'Edit Ad Spot' : 'Add Ad Spot' }}</h3>
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
            <v-text-field
              v-model="formData.title"
              label="Title *"
              placeholder="e.g., 20% OFF First Grooming"
              :rules="[v => !!v || 'Title is required']"
              variant="outlined"
              rounded="xl"
              class="mb-3"
            />

            <!-- Image Upload -->
            <div class="mb-3">
              <label class="text-body-2 font-weight-bold mb-2 d-block">Ad Image *</label>
              <v-card
                rounded="xl"
                border
                class="image-upload-area pa-4"
                :class="{ 'has-image': formData.imageUrl }"
              >
                <template v-if="formData.imageUrl">
                  <v-img :src="formData.imageUrl" height="200" cover class="rounded-lg mb-3" />
                  <v-btn color="error" variant="tonal" size="small" @click="removeImage">
                    <v-icon icon="mdi-delete" start />
                    Remove Image
                  </v-btn>
                </template>
                <template v-else>
                  <div class="d-flex flex-column align-center justify-center py-6">
                    <v-icon icon="mdi-cloud-upload-outline" size="48" color="grey-lighten-1" class="mb-2" />
                    <p class="text-body-2 text-grey-darken-1 mb-2">Upload ad image (1200x600px recommended)</p>
                    <v-btn color="primary" variant="tonal" size="small" @click="triggerFileInput">
                      <v-icon icon="mdi-folder-open" start />
                      Choose Image
                    </v-btn>
                  </div>
                </template>
              </v-card>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileChange"
              />
              <p v-if="imageError" class="text-caption text-error mt-1">{{ imageError }}</p>
            </div>

            <v-text-field
              v-model="formData.actionLabel"
              label="Button Label"
              placeholder="e.g., Shop Now"
              variant="outlined"
              rounded="xl"
              class="mb-3"
            />

            <v-text-field
              v-model="formData.actionUrl"
              label="Action URL (Optional)"
              placeholder="e.g., /products/123"
              variant="outlined"
              rounded="xl"
              class="mb-3"
            />

            <v-select
              v-model="formData.position"
              :items="positionOptions"
              label="Position"
              placeholder="Select position"
              variant="outlined"
              rounded="xl"
              class="mb-3"
            />

            <v-switch
              v-model="formData.isActive"
              label="Active"
              color="success"
              hide-details
              class="mb-2"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" variant="tonal" :loading="submitting" @click="handleSubmit">
            {{ editingAd ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/util/api'

interface AdSpot {
  id: string
  title: string
  subtitle?: string
  description?: string
  imageUrl: string
  actionUrl?: string
  actionLabel: string
  isActive: boolean
  sortOrder: number
  position?: string
  createdAt: string
  updatedAt: string
}

const loading = ref(true)
const dialog = ref(false)
const formValid = ref(false)
const submitting = ref(false)
const editingAd = ref<AdSpot | null>(null)
const adSpots = ref<AdSpot[]>([])
const formRef = ref<any>(null)
const fileInputRef = ref<HTMLInputElement>()
const imageError = ref('')

const defaultFormData = {
  title: '',
  imageUrl: '',
  actionLabel: 'Shop Now',
  actionUrl: '',
  position: 'services_top',
  isActive: true,
}

const formData = ref({ ...defaultFormData })

const positionOptions = [
  { title: 'Services - Top', value: 'services_top' },
  { title: 'Services - Middle', value: 'services_middle' },
  { title: 'Products - Top', value: 'products_top' },
  { title: 'Products - Middle', value: 'products_middle' },
]

const fetchAdSpots = async () => {
  loading.value = true
  try {
    const response = await api.get('/ad-spots')
    adSpots.value = response.data || []
  } catch (error) {
    console.error('Error fetching ad spots:', error)
    adSpots.value = []
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  editingAd.value = null
  formData.value = { ...defaultFormData }
  dialog.value = true
}

const handleEdit = (ad: AdSpot) => {
  editingAd.value = ad
  formData.value = {
    title: ad.title,
    imageUrl: ad.imageUrl,
    actionLabel: ad.actionLabel,
    actionUrl: ad.actionUrl || '',
    position: ad.position || 'services_top',
    isActive: ad.isActive,
  }
  dialog.value = true
}

const handleDelete = async (ad: AdSpot) => {
  if (!confirm(`Delete ad spot "${ad.title}"?`)) return

  try {
    await api.delete(`/ad-spots/${ad.id}`)
    await fetchAdSpots()
  } catch (error) {
    console.error('Error deleting ad spot:', error)
    alert('Failed to delete ad spot')
  }
}

const closeDialog = () => {
  dialog.value = false
  editingAd.value = null
  formData.value = { ...defaultFormData }
  imageError.value = ''
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    imageError.value = 'Please select an image file'
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    imageError.value = 'Image size should be less than 5MB'
    return
  }

  imageError.value = ''

  try {
    // Upload file
    const uploadFormData = new FormData()
    uploadFormData.append('files', file)

    const uploadResponse = await api.post('/files', uploadFormData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    formData.value.imageUrl = uploadResponse.data[0]?.url || uploadResponse.data[0]?.fileUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    imageError.value = 'Failed to upload image'
  }

  // Reset file input
  if (target) target.value = ''
}

const removeImage = () => {
  formData.value.imageUrl = ''
}

const handleSubmit = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  if (!formData.value.imageUrl) {
    imageError.value = 'Image is required'
    return
  }

  submitting.value = true

  try {
    if (editingAd.value) {
      await api.patch(`/ad-spots/${editingAd.value.id}`, formData.value)
    } else {
      await api.post('/ad-spots', formData.value)
    }

    await fetchAdSpots()
    closeDialog()
  } catch (error: any) {
    console.error('Error saving ad spot:', error)
    alert(error.response?.data?.message || 'Failed to save ad spot')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchAdSpots()
})
</script>

<style scoped lang="scss">
.ad-card {
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  }
}

.ad-image {
  border-radius: 12px 12px 0 0;
}

.image-upload-area {
  background: #F9FAFB;
  border: 2px dashed #E5E7EB;

  &.has-image {
    border-style: solid;
    border-color: #1565C0;
  }
}
</style>
