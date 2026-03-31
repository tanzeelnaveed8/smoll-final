<template>
  <v-card rounded="lg" elevation="0" border>
    <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">Photos</v-card-title>
    <v-card-text class="d-flex flex-column gr-3">
      <!-- Existing Photos -->
      <div v-if="assets.length" class="d-flex flex-wrap" style="gap: 8px">
        <v-card
          v-for="asset in assets"
          :key="asset.url"
          width="120"
          height="120"
          rounded="lg"
          elevation="0"
          border
          class="overflow-hidden"
        >
          <v-img :src="asset.url" cover height="120" width="120">
            <template #error>
              <div class="d-flex align-center justify-center h-100 bg-grey-lighten-3">
                <v-icon icon="mdi-image-broken" color="grey" />
              </div>
            </template>
          </v-img>
        </v-card>
      </div>
      <p v-else class="text-body-2 text-grey-darken-1">No photos uploaded yet</p>

      <!-- Upload -->
      <div v-if="!disabled && caseId" class="d-flex flex-wrap" style="gap: 8px">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          hidden
          @change="handleFileChange"
        />
        <v-btn
          variant="outlined"
          color="primary"
          size="small"
          :loading="uploading"
          @click="($refs.fileInput as HTMLInputElement).click()"
        >
          <v-icon start icon="mdi-camera" />
          Take Photo / Upload
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { CaseAsset } from '@/stores/types/vet-types'
import { useVetVisitsStore } from '@/stores/vet-visits'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  assets: CaseAsset[]
  caseId?: string
  disabled: boolean
}>()

const emit = defineEmits<{ uploaded: [] }>()
const visitsStore = useVetVisitsStore()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length || !props.caseId) return

  uploading.value = true
  try {
    const uploadedAssets: CaseAsset[] = []

    for (const file of Array.from(files)) {
      const result = await visitsStore.uploadFile(file)
      uploadedAssets.push(result)
    }

    await visitsStore.addAssets(props.caseId, uploadedAssets)
    toast.success(`${uploadedAssets.length} photo(s) uploaded`)
    emit('uploaded')
  } finally {
    uploading.value = false
    input.value = ''
  }
}
</script>
