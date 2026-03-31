<template>
  <v-card rounded="lg" elevation="0" border>
    <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">Add Extra Services</v-card-title>
    <v-card-text class="d-flex flex-column gr-3">
      <div class="d-flex" style="gap: 8px">
        <v-text-field
          v-model="serviceName"
          placeholder="Service name"
          hide-details
          density="compact"
          class="flex-grow-1"
        />
        <v-text-field
          v-model.number="servicePrice"
          placeholder="Price"
          type="number"
          hide-details
          density="compact"
          style="max-width: 120px"
        />
        <v-btn
          variant="flat"
          color="primary"
          size="small"
          :disabled="!serviceName.trim()"
          :loading="adding"
          @click="handleAdd"
          class="align-self-center"
        >
          Add
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useVetVisitsStore } from '@/stores/vet-visits'
import { ref } from 'vue'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  caseId?: string
}>()

const emit = defineEmits<{ added: [] }>()
const visitsStore = useVetVisitsStore()

const serviceName = ref('')
const servicePrice = ref<number | undefined>()
const adding = ref(false)

const handleAdd = async () => {
  if (!serviceName.value.trim() || !props.caseId) return
  adding.value = true
  try {
    const newService = {
      id: Date.now().toString(),
      name: serviceName.value.trim(),
      price: servicePrice.value,
      checked: false
    }
    const currentCase = visitsStore.currentCase
    const services = [...(currentCase?.services || []), newService]
    await visitsStore.updateServiceChecklist(props.caseId, services)
    serviceName.value = ''
    servicePrice.value = undefined
    toast.success('Service added')
    emit('added')
  } finally {
    adding.value = false
  }
}
</script>
