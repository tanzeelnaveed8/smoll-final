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
          class="opacity-100 px-0 font-weight-medium"
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
import type { HomeVet } from '@/stores/types/homeVets'
import { useHomeVetsStore } from '@/stores/homeVets'
import { truncateString } from '@/util/helpers'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  homeVets: HomeVet[]
  actionLoading: boolean
}>()

const homeVetsStore = useHomeVetsStore()
const router = useRouter()
const loading = ref(false)
const { emitter } = useMitt()

const headers = [
  { title: 'Full name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Phone number', key: 'phone' },
  { title: 'Location', key: 'address' },
  { title: 'Status', key: 'isOnline' },
  { title: 'Action', key: 'isSuspended', align: 'center' }
] as const

const items = computed(() =>
  props.homeVets.map((item) => ({
    ...item,
    address: truncateString(item.address, 24)
  }))
)

const handleRowClick = async (event: Event, row: any) => {
  const id = row.item.id
  router.push(`/smoll-home/veterinarians/${id}`)
}

const suspendVet = async (id: string) => {
  try {
    loading.value = true
    await homeVetsStore.suspendHomeVet(id)
  } finally {
    loading.value = false
  }
}

const activateVet = async (id: string) => {
  try {
    loading.value = true
    await homeVetsStore.activateHomeVet(id)
  } finally {
    loading.value = false
  }
}

const handleDeactivateVet = async (e: MouseEvent, vetDetails: HomeVet) => {
  await suspendVet(vetDetails.id)
  toast.success('Vet deactivated successfully')
  emitter.emit('home-vets:update')
}

const handleActivateVet = async (e: MouseEvent, vetDetails: HomeVet) => {
  await activateVet(vetDetails.id)
  toast.success('Vet activated successfully')
  emitter.emit('home-vets:update')
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
</style>
