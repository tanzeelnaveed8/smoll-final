<template>
  <v-sheet>
    <CounsellorsTable :counsellors="counsellors" :actionLoading="actionLoading" />
    <TableFooter :maxValue="maxValue" />
  </v-sheet>
</template>

<script lang="ts" setup>
import CounsellorsTable from './CounsellorsTable.vue'
import TableFooter from '@/components/partials/table/TableFooter.vue'
import type { Counsellor } from '@/stores/types/counsellors'

defineProps<{
  counsellors: Counsellor[]
  actionLoading: boolean
  maxValue: number
}>()
</script>
