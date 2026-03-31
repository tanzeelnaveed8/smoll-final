<template>
  <v-data-table
    class="table text-body-2 text-grey1"
    height="400"
    style="font-weight: 500"
    hide-default-footer
    :items
    :headers="headers"
    :hover="true"
    :loading="actionLoading || loading"
    @click:row="handleRowClick"
  >
    <template #item.name="{ item }">
      <FullName :title="item.name" :profileImg="item.profileImg?.url" />
    </template>

    <template #item.isOnline="{ item }">
      <p :style="item.isOnline ? 'color:#56B686' : 'color:#E02A2A'">
        {{ item.isOnline ? 'Online' : 'Offline' }}
      </p>
    </template>

    <template #item.isSuspended="{ item }">
      <v-btn
        v-if="!item.isSuspended"
        @click.stop="handleDeactivateVet($event, item)"
        class="opacity-100 px-0 font-weight-medium"
        min-height="auto"
        height="auto"
        :disabled="actionLoading || loading"
        variant="plain"
        >Deactivate</v-btn
      >
      <template v-else>
        <v-btn
          @click.stop="handleActivateVet($event, item)"
          class="opacity-100 px-0 fot-weight-medium"
          min-height="auto"
          height="auto"
          :disabled="actionLoading || loading"
          variant="plain"
          >Activate</v-btn
        >
      </template>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import FullName from '@/components/partials/table/FullName.vue'
import useMitt from '@/functions/useMitt'
import type { Vets } from '@/stores/types/veternians'
import { useVeterniansStore } from '@/stores/veternians'
import { truncateString } from '@/util/helpers'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  veternians: Vets[]
  actionLoading: boolean
}>()

const veterniansStore = useVeterniansStore()
const router = useRouter()
const loading = ref(false)
const { emitter } = useMitt()

const headers = [
  { title: 'Full name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Phone number', key: 'phone' },
  { title: 'Location', key: 'address' },
  { title: 'Status', key: 'isOnline' },
  { title: 'Score', key: 'rating' },
  { title: 'Action', key: 'isSuspended', align: 'center' }
] as const

const items = computed(() =>
  props.veternians.map((item) => ({
    ...item,
    rating: `${typeof item.avgRating !== 'number' && 0} / 5`,
    address: truncateString(item.address, 24)
  }))
)

const handleRowClick = async (event: Event, row: any) => {
  const id = row.item.id
  router.push(`/experts/${id}`)
}

const suspendVet = async (id: string) => {
  try {
    loading.value = true
    await veterniansStore.suspendVet(id)
  } finally {
    loading.value = false
  }
}
const activateVet = async (id: string) => {
  try {
    loading.value = true
    await veterniansStore.activateVet(id)
  } finally {
    loading.value = false
  }
}

const handleDeactivateVet = async (e: MouseEvent, vetDetails: Vets) => {
  await suspendVet(vetDetails.id)
  toast.success('Vet deactivated successfully')
  emitter.emit('table-view:update')
}

const handleActivateVet = async (e: MouseEvent, vetDetails: Vets) => {
  await activateVet(vetDetails.id)
  toast.success('Vet activated successfully')
  emitter.emit('table-view:update')
}
</script>

<style scoped lang="scss">
.table {
  &:deep(td) {
    white-space: nowrap !important;
  }

  &:deep(.v-data-table__th) {
    font-weight: 700 !important;
    color: #494949 !important;
  }
}

.checkbox {
  &:deep(.v-selection-control) {
    min-height: auto;
  }

  &:deep(.v-selection-control__wrapper) {
    height: auto;
    width: auto;
  }

  &:deep(.v-selection-control__input) {
    height: auto;
    width: auto;
  }

  &:deep(.v-icon) {
    width: 16px;
    min-width: 16px;
    height: 16px;
  }
}
</style>
