<template>
  <v-data-table
    :loading
    class="table text-body-2 text-grey1"
    height="484"
    style="font-weight: 600"
    hide-default-footer
    :headers="headers"
    :items
  >
    <template #item.name="{ item }">
      <FullName :title="item.name" :profileImg="item?.profileImg?.url" />
    </template>

    <template #item.action="{ item }">
      <v-btn
        :to="`/members/${item.id}`"
        append-icon="$tb-circle-arrow-up-right"
        class="opacity-100 px-0 font-weight-medium"
        min-height="auto"
        height="auto"
        variant="plain"
        >Preview</v-btn
      >
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import FullName from '@/components/partials/table/FullName.vue'
import type { Member } from '@/stores/types/member'
import { computed } from 'vue'

const props = defineProps<{
  members: Member[]
  loading: boolean
}>()

const items = computed(() =>
  props.members.map((item) => ({
    ...item,
    email: item.email ?? '-',
    address: item.address ?? '-',
    name: item.name ?? '-'
  }))
)

const headers = [
  { title: 'Full name', key: 'name' },
  { title: 'Phone number', key: 'phone' },
  { title: 'Email', key: 'email' },
  { title: 'Pets', key: 'petsCount', align: 'center' },
  { title: 'Visits', key: 'visitsCount', align: 'center' },
  { title: 'Location', key: 'address' },
  { title: 'Action', key: 'action', align: 'center' }
] as const
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
