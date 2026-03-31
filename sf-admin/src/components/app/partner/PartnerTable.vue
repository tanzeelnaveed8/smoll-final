<template>
  <v-data-table
    :loading="actionLoading || loading"
    class="table text-body-2 text-grey1"
    height="484"
    style="font-weight: 600"
    hide-default-footer
    :items
    :headers="headers"
    :hover="true"
    @click:row="handleRowClick"
  >
    <template #item.name="{ item }">
      <FullName :title="item?.name" :profileImg="item?.clinicImg?.url" />
    </template>

    <template #item.action="{ item }">
      <v-btn
        v-if="!item?.isSuspended"
        class="opacity-100 px-0 font-weight-medium"
        @click.stop="handleDeactivatePartner($event, item)"
        min-height="auto"
        height="auto"
        :disabled="actionLoading || loading"
        variant="plain"
      >
        Deactivate
      </v-btn>
      <template v-if="item?.isSuspended">
        <v-btn
          @click.stop="handleActivatePartner($event, item)"
          class="opacity-100 px-0 fot-weight-medium"
          min-height="auto"
          height="auto"
          variant="plain"
          :disabled="actionLoading || loading"
          >Activate</v-btn
        >
      </template>
      <!-- <v-sheet v-if="item.status === 'request'" class="d-flex gc-4 justify-center">
        <v-btn
          class="rounded opacity-100 px-2 font-weight-medium text-caption"
          style="letter-spacing: 0px !important; text-indent: 0px !important"
          min-height="auto"
          color="#2F6E20"
          height="auto"
          variant="outlined"
        >
          Approve</v-btn
        >
        <v-btn
          class="rounded opacity-100 px-2 font-weight-medium text-caption"
          style="letter-spacing: 0px !important; text-indent: 0px !important"
          min-height="auto"
          height="auto"
          min-width="auto"
          variant="outlined"
          to="/partners/verify-partner"
          >verify</v-btn
        >
      </v-sheet> -->
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import FullName from '@/components/partials/table/FullName.vue'
import useMitt from '@/functions/useMitt'
import { usePartnerStore } from '@/stores/partner'
import type { Partner } from '@/stores/types/partner'
import { truncateString } from '@/util/helpers'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  partners: Partner[]
  actionLoading: boolean
}>()

const items = computed(() =>
  props.partners.map((item) => ({
    ...item,
    address: item?.address && truncateString(item.address, 20)
  }))
)

const partnerStore = usePartnerStore()
const router = useRouter()
const loading = ref(false)
const { emitter } = useMitt()

const headers = [
  { title: 'Clinic name', key: 'name' },
  { title: 'Receptionist name', key: 'receptionistName' },
  { title: 'Email', key: 'email' },
  { title: 'Phone number', key: 'phone' },
  { title: 'Clinic Address', key: 'address' },
  { title: 'Action', align: 'center', key: 'action' }
] as const

const handleRowClick = async (event: Event, row: any) => {
  const id = row.item.id
  router.push(`/partners/${id}`)
}

const suspendPartner = async (id: string) => {
  try {
    loading.value = true
    await partnerStore.suspendPartner(id)
  } finally {
    loading.value = false
  }
}
const activatePartner = async (id: string) => {
  try {
    loading.value = true
    await partnerStore.activatePartner(id)
  } finally {
    loading.value = false
  }
}

const handleDeactivatePartner = async (e: MouseEvent, partnerDetails: any) => {
  await suspendPartner(partnerDetails.id)
  toast.success('Vet deactivated successfully')
  emitter.emit('table-view:update')
}

const handleActivatePartner = async (e: MouseEvent, partnerDetails: any) => {
  await activatePartner(partnerDetails.id)
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
