<template>
  <v-sheet class="d-flex flex-column gr-6">
    <v-sheet class="d-flex flex-column gr-6">
      <v-sheet>
        <h5 class="text-body-1 text-grey1" style="font-weight: 600">Profile Picture</h5>
      </v-sheet>
      <v-sheet class="d-flex gc-4 align-center">
        <v-sheet width="72" height="72" class="d-flex align-center justify-center">
          <input
            type="file"
            ref="profileInput"
            style="display: none"
            @change="handleImagePreview($event, 'profile')"
          />
          <v-avatar
            color="#d5d5d5"
            size="72"
            icon="$tb-user"
            class="text-grey2"
            :image="profile?.url"
          />
        </v-sheet>
        <v-sheet>
          <v-btn
            class="px-3"
            density="compact"
            flat
            style="letter-spacing: 0px"
            @click="handleUpdateProfileBtn"
            :disabled="actionLoading !== ''"
            :loading="actionLoading === 'profile'"
            >Upload</v-btn
          >
          <p class="text-body-1 text-grey2 mt-1">Max file size of 5MB</p>
        </v-sheet>
      </v-sheet>
    </v-sheet>

    <v-sheet width="100%" class="d-flex flex-column">
      <v-sheet
        width="100%"
        height="100%"
        position="relative"
        class="d-flex justify-center align-center"
        style="border-radius: 12px; border: 1px dashed #494949; overflow: hidden"
        :class="[
          actionLoading ? 'cursor-default' : 'cursor-pointer',
          isDragging ? 'drag-over' : ''
        ]"
        @click="!actionLoading && fileInput.click()"
        @dragover.prevent="isDragging = true"
        @dragenter.prevent="isDragging = true"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <v-sheet v-if="actionLoading === 'file'" class="loading-overlay">
          <v-progress-circular indeterminate />
        </v-sheet>

        <v-sheet class="py-12 px-6 d-flex justify-center flex-column align-center">
          <v-icon icon="$tb-cloud-upload" color="grey2" />

          <v-sheet position="relative" style="margin-top: 10px" class="text-primary text-center">
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              @change="handleImagePreview($event, 'file')"
            />
            <v-btn
              flat
              height="auto"
              min-height="auto"
              style="letter-spacing: 0px; font-weight: 600"
              variant="plain"
              color="grey1"
              class="text-body-1 opacity-100"
              :disabled="actionLoading !== ''"
            >
              Upload a File
            </v-btn>
            <p
              class="text-caption text-center text-grey2 mt-2"
              style="max-width: 152px; font-weight: 500"
            >
              Click to browse, or drag & drop a file here
            </p>
          </v-sheet>
        </v-sheet>
      </v-sheet>

      <!-- Conditionally show Appointments and Specialties sections -->
      <template v-if="!hideAppointmentsAndSpecialties">
        <v-sheet class="d-flex align-center pt-5" style="gap: 10px">
          <span class="text-body-1" style="font-weight: 500; color: #222222"
            >By Appointments only</span
          >
          <v-switch
            v-model="account.byAppointmentOnly"
            hide-details
            color="primary"
            inset
            class="custom-switch ma-0"
          />
        </v-sheet>
        <v-sheet class="pt-5">
          <p style="font-weight: 600" class="text-body-1 pb-3">Specialties</p>
          <v-sheet
            class="d-flex flex-wrap border"
            style="gap: 8px; padding: 14px; border-radius: 12px; border-color: black !important"
          >
            <v-chip
              v-for="specialty in specialtiesOptions"
              :key="specialty.id"
              v-show="specialty.name !== 'Ophthalmology' && specialty.name !== 'Orthopedic'"
              :color="isSelected(specialty.id) ? 'black' : undefined"
              :text-color="isSelected(specialty.id) ? 'white' : undefined"
              variant="outlined"
              :class="['specialty-chip', isSelected(specialty.id) ? 'selected' : '']"
              @click="toggleSpecialty(specialty.id)"
            >
              {{ specialty.name }}
            </v-chip>
          </v-sheet>
        </v-sheet>
      </template>

      <v-sheet v-if="files?.length" class="mt-6">
        <v-chip-group class="pa-0 uploaded-file-container pb-1" selected-class="bg-white">
          <v-chip
            v-for="(file, i) in files"
            :key="i + 'a'"
            variant="outlined"
            class="uploaded-file"
            prepend-icon="$tb-file-certificate"
          >
            <a :href="file?.url" target="_blank" style="text-decoration: none; color: inherit">
              {{ shortenFileName(file?.filename, 15) }}
            </a>
            <v-btn
              color="grey1"
              variant="plain"
              class="ml-auto mx-0 h-auto"
              width="auto"
              icon="$tb-x"
              @click.stop="handleRemoveFile($event, file)"
            />
          </v-chip>
        </v-chip-group>
      </v-sheet>
    </v-sheet>
  </v-sheet>
</template>

<script lang="ts" setup>
import type { UploadedFile } from '@/stores/types/global'
import { useUploadStore } from '@/stores/upload'
import { useSpecialityStore } from '@/stores/speciality'
import { shortenFileName } from '@/util/helpers'
import { computed, onMounted, ref, watch, watchEffect, type Ref } from 'vue'
import { toast } from 'vue3-toastify'

const specialityStore = useSpecialityStore()

const emit = defineEmits<{
  (
    event: 'updateDoc',
    doc: {
      documents: UploadedFile[] | []
      profileImg: UploadedFile | null
      specialties: string[]
      byAppointmentOnly: boolean
    }
  ): void
}>()

const props = withDefaults(defineProps<{
  formDetails?: { profileImg: UploadedFile | null; documents: UploadedFile[] | [] } | any
  hideAppointmentsAndSpecialties?: boolean
}>(), {
  hideAppointmentsAndSpecialties: false
})

const uploadStore = useUploadStore()

const profile = ref()
const files = ref<UploadedFile[]>([])
const actionLoading = ref('')
const profileInput = ref<Ref | null>(null)
const fileInput = ref<Ref | null>(null)
const isDragging = ref(false)

const handleUpdateProfileBtn = () => {
  profileInput.value.click()
}

const handleAddFileBtn = () => {
  fileInput.value.click()
}

enum VetSpecialties {
  PET_NUTRITION = 'Pet Nutrition',
  PET_BEHAVIOURS = 'Pet Behaviours',
  GENERAL = 'General'
}

const account = ref<any>({
  dob: { date: null, month: null, year: null },
  byAppointmentOnly: false
})

const specialties = ref<string[]>([])

const toggleSpecialty = (specialtyId: string) => {
  const index = specialties.value.indexOf(specialtyId)
  if (index === -1) {
    specialties.value.push(specialtyId)
  } else {
    specialties.value.splice(index, 1)
  }
}

const isSelected = (id: string) => specialties.value.includes(id)

const handleImagePreview = async (e: any, type: 'profile' | 'file') => {
  const file = e.target.files[0]
  if (!file) return
  const bodyFormData = new FormData()
  bodyFormData.append('files', file)

  const sameFileExist = files.value.find((exFile) => exFile.filename === file.name)

  if (sameFileExist) {
    toast.error('File exists!')
    e.target.value = ''
    return
  }

  if (type === 'file') await updateFiles(bodyFormData)
  if (type === 'profile') await updateProfileImage(bodyFormData)

  e.target.value = ''
}

const handleDrop = async (ev: DragEvent) => {
  isDragging.value = false

  if (!ev.dataTransfer?.files.length) return

  const file = ev.dataTransfer.files[0]
  const bodyFormData = new FormData()
  bodyFormData.append('files', file)

  await updateFiles(bodyFormData)
}

const handleRemoveFile = (e: MouseEvent, item: UploadedFile) => {
  const updatedFiles = files.value.filter((file) => file.filename !== item.filename)
  files.value = [...updatedFiles]
}

const getUploadedFile = async (bodyFormData: FormData, loadingType: string) => {
  try {
    actionLoading.value = loadingType
    return await uploadStore.uploadFile(bodyFormData)
  } finally {
    actionLoading.value = ''
  }
}

const updateProfileImage = async (bodyFormData: FormData) => {
  const formattedProfile = await getUploadedFile(bodyFormData, 'profile')
  profile.value = formattedProfile[0]
}

const updateFiles = async (bodyFormData: FormData) => {
  const formattedProfile = await getUploadedFile(bodyFormData, 'file')
  files.value = [...files.value, formattedProfile[0]]
}

const handleDragLeave = (event: DragEvent) => {
  if (!(event.currentTarget as Node)?.contains(event.relatedTarget as Node | null)) {
    isDragging.value = false
  }
}

watch(
  () => props.formDetails,
  (newVal) => {
    if (!newVal) return
    profile.value = newVal.profileImg ?? null
    files.value = newVal.documents ?? []
    specialties.value = (newVal.specialties ?? []).map((s: any) =>
      typeof s === 'object' ? s.id : s
    )
    account.value.byAppointmentOnly = newVal.byAppointmentOnly ?? false
  },
  { immediate: true, deep: true }
)

watch([files, profile, specialties, account], () => { 
  emit('updateDoc', {
    documents: files.value,
    profileImg: profile.value,
    specialties: specialties.value,
    byAppointmentOnly: account.value.byAppointmentOnly
  })
}, { deep: true })

onMounted(() => {
  specialityStore.fetchSpecialities()
})

const specialtiesOptions = computed(() => specialityStore.specialties)
</script>

<style lang="scss" scoped>
.uploaded-file-container {
  &:deep(.v-slide-group__content) {
    flex-direction: column;
    gap: 12px;
  }
}

.uploaded-file {
  padding: 0px 16px;
  margin: 0px;
  height: 44px;
  border-color: #222;
  color: #222;
  border-radius: 8px;
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;

  &:deep(.v-chip__prepend) {
    margin-right: 8px;
  }
  &:deep(.v-chip__content) {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  &:deep(.v-icon) {
    width: 20px;
    height: 20px;
    margin-inline: 0px;
  }
}

.loading-overlay {
  position: absolute;
  max-width: 523px;
  height: 196px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #22222228;
}

.drag-over {
  border: 1px dashed #007bff !important;
  background-color: rgba(0, 123, 255, 0.05);
}

.specialty-chip {
  border-radius: 100px !important;
  padding: 0 16px !important;
  height: 36px !important;
  font-size: 14px !important;
  border: 1px solid #e0e0e0 !important;
  background-color: white !important;
  cursor: pointer !important;
  transition: all 0.2s ease;

  &.selected {
    border: none !important;
    background-color: #000000 !important;
    color: white !important;
  }

  &:hover {
    opacity: 0.9;
  }
}

.custom-switch {
  &:deep(.v-switch__track) {
    background-color: #e0e0e0;
    opacity: 1;
    border: none;
  }

  &:deep(.v-switch__thumb) {
    background-color: white;
    color: white;
  }

  &:deep(.v-switch--inset .v-switch__track) {
    height: 24px;
    width: 48px;
  }

  &:deep(.v-switch--inset .v-switch__thumb) {
    height: 20px;
    width: 20px;
  }

  &:deep(.v-switch__track--active) {
    background-color: #4477f7 !important;
    opacity: 1 !important;
  }
}
</style>