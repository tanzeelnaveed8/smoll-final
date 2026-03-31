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
    <template #item.status="{ item }">
      <v-chip
        variant="flat"
        :class="`text-caption ${item.status !== 'pending' && 'text-grey1'} font-weight-medium`"
        style="padding: 0px 10px; height: 24px; line-height: 16px; letter-spacing: 0px !important"
        :color="item.status === 'pending' ? '#56B686' : '#F7F7F7'"
      >
        {{ getCaseStatusData(item.status).label }}
      </v-chip>
    </template>

    <template #item.action="{ item }">
      <v-btn
        :to="`/visits/${item.id}`"
        class="opacity-100 px-0 font-weight-medium"
        min-height="auto"
        height="auto"
        variant="plain"
      >
        <template v-slot:append>
          <v-icon icon="$tb-eye" style="margin-left: -4px" />
        </template>
        Preview</v-btn
      >
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import FullName from '@/components/partials/table/FullName.vue'
import dayjs from 'dayjs'
import { getCaseStatusData } from '@/util/helpers'
import type { Cases } from '@/stores/types/cases'

const props = defineProps<{
  loading: boolean
  cases: Cases[]
}>()

const items = computed(() =>
  props.cases.map((item) => ({ ...item, createdAt: dayjs(item.createdAt).format('DD MMMM YYYY') }))
)

const headers = [
  { title: 'Visit Id', key: 'id' },
  { title: "Parent's name", key: 'member' },
  { title: "Pet's name", key: 'pet' },
  { title: 'Date', key: 'createdAt' },
  { title: 'Status', key: 'status' },
  { title: 'Action', align: 'center', key: 'action' }
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
