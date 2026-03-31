<template>
  <v-data-table
    :headers="headers"
    :items="counsellors"
    :loading="actionLoading"
    hide-default-footer
    class="rounded-lg"
    style="border: 1px solid #d0d7dc"
  >
    <template v-slot:item.name="{ item }">
      <router-link :to="`/counsellors/${item.id}`" class="text-decoration-none text-grey1 font-weight-bold">
        {{ item.name ?? '-' }}
      </router-link>
    </template>

    <template v-slot:item.isOnline="{ item }">
      <v-chip
        size="small"
        :color="item.isOnline ? 'success' : 'default'"
        variant="tonal"
      >
        {{ item.isOnline ? 'Online' : 'Offline' }}
      </v-chip>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-btn
        v-if="!item.isSuspended"
        size="small"
        variant="tonal"
        color="error"
        :loading="actionLoading"
        @click="handleSuspend(item.id)"
      >
        Deactivate
      </v-btn>
      <v-btn
        v-else
        size="small"
        variant="tonal"
        color="success"
        :loading="actionLoading"
        @click="handleActivate(item.id)"
      >
        Activate
      </v-btn>
    </template>
  </v-data-table>
</template>

<script lang="ts" setup>
import useMitt from '@/functions/useMitt'
import { useCounsellorsStore } from '@/stores/counsellors'
import type { Counsellor } from '@/stores/types/counsellors'
import { toast } from 'vue3-toastify'

defineProps<{
  counsellors: Counsellor[]
  actionLoading: boolean
}>()

const counsellorsStore = useCounsellorsStore()
const { emitter } = useMitt()

const headers = [
  { title: 'Name', key: 'name', sortable: false },
  { title: 'Email', key: 'email', sortable: false },
  { title: 'Phone', key: 'phone', sortable: false },
  { title: 'Designation', key: 'designation', sortable: false },
  { title: 'Status', key: 'isOnline', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false }
]

const handleSuspend = async (id: string) => {
  try {
    await counsellorsStore.suspendCounsellor(id)
    toast.success('Counsellor deactivated')
    emitter.emit('table-view:update')
  } catch {
    toast.error('Failed to deactivate counsellor')
  }
}

const handleActivate = async (id: string) => {
  try {
    await counsellorsStore.activateCounsellor(id)
    toast.success('Counsellor activated')
    emitter.emit('table-view:update')
  } catch {
    toast.error('Failed to activate counsellor')
  }
}
</script>
