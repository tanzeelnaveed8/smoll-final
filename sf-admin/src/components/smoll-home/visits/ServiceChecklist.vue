<template>
  <v-card rounded="lg" elevation="0" border>
    <v-card-title class="text-body-1 font-weight-bold pa-4 pb-2">
      Services Checklist
      <v-chip
        v-if="services.length"
        size="x-small"
        variant="tonal"
        :color="allChecked ? 'success' : 'warning'"
        class="ml-2"
      >
        {{ checkedCount }}/{{ services.length }}
      </v-chip>
    </v-card-title>
    <v-card-text class="d-flex flex-column gr-2">
      <template v-if="!services.length">
        <p class="text-body-2 text-grey-darken-1">No services listed</p>
      </template>

      <template v-else>
        <p v-if="disabled" class="text-caption text-grey-darken-1">
          Start the visit to begin checking off services.
        </p>

        <v-list density="compact">
          <v-list-item v-for="(service, index) in localServices" :key="service.id || index">
            <template #prepend>
              <v-checkbox-btn
                v-model="service.checked"
                :disabled="disabled"
                color="primary"
                @update:model-value="handleToggle"
              />
            </template>
            <v-list-item-title :class="{ 'text-decoration-line-through text-grey': service.checked }">
              {{ service.name }}
            </v-list-item-title>
            <template #append>
              <span v-if="service.price" class="text-body-2 text-grey-darken-1">
                {{ service.price?.toFixed(2) }} AED
              </span>
            </template>
          </v-list-item>
        </v-list>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { VetService } from '@/stores/types/vet-types'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  services: VetService[]
  disabled: boolean
}>()

const emit = defineEmits<{
  update: [services: VetService[]]
}>()

const localServices = ref<VetService[]>([])

watch(
  () => props.services,
  (val) => {
    localServices.value = val.map((s) => ({ ...s }))
  },
  { immediate: true, deep: true }
)

const checkedCount = computed(() => localServices.value.filter((s) => s.checked).length)
const allChecked = computed(() => localServices.value.length > 0 && localServices.value.every((s) => s.checked))

const handleToggle = () => {
  emit('update', localServices.value)
}
</script>
