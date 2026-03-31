<template>
  <v-card rounded="lg" elevation="0" border>
    <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">Notes & Photos</v-card-title>
    <v-card-text class="d-flex flex-column gr-3">
      <!-- Existing Notes -->
      <div v-if="notes.length" class="d-flex flex-column gr-2">
        <div v-for="(note, index) in notes" :key="index" class="pa-3 rounded-lg" style="background-color: #f5f5f5">
          <p class="text-body-2">{{ note.text }}</p>
        </div>
      </div>
      <p v-else class="text-body-2 text-grey-darken-1">No notes added yet</p>

      <!-- Add Note -->
      <div v-if="!disabled && caseId" class="d-flex" style="gap: 8px">
        <v-textarea
          v-model="newNote"
          placeholder="Add visit notes..."
          rows="2"
          auto-grow
          hide-details
          density="compact"
          class="flex-grow-1"
        />
        <v-btn
          icon
          variant="flat"
          color="primary"
          size="small"
          :loading="saving"
          :disabled="!newNote.trim()"
          @click="handleAddNote"
          class="align-self-end"
        >
          <v-icon icon="mdi-send" />
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { CaseNote } from '@/stores/types/vet-types'
import { useVetVisitsStore } from '@/stores/vet-visits'
import { ref, watch } from 'vue'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  notes: CaseNote[]
  caseId?: string
  disabled: boolean
}>()

const emit = defineEmits<{ added: [] }>()
const visitsStore = useVetVisitsStore()

const newNote = ref('')
const saving = ref(false)
const localNotes = ref<CaseNote[]>([])

watch(
  () => props.notes,
  (val) => {
    localNotes.value = val ? [...val] : []
  },
  { immediate: true, deep: true }
)

const handleAddNote = async () => {
  if (!newNote.value.trim() || !props.caseId) return
  saving.value = true
  try {
    const nextNotes: CaseNote[] = [
      ...localNotes.value,
      { text: newNote.value.trim() }
    ]

    await visitsStore.addNote(props.caseId, nextNotes)
    newNote.value = ''
    toast.success('Note added')
    emit('added')
  } finally {
    saving.value = false
  }
}
</script>
