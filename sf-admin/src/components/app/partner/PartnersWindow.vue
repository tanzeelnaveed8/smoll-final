<template>
  <v-sheet class="d-flex flex-column gr-6">
    <PartnerTable :partners :actionLoading />
    <TableFooter :maxValue path="partners" />
  </v-sheet>
</template>

<script lang="ts" setup>
import TableFooter from '@/components/partials/table/TableFooter.vue'
import PartnerTable from './PartnerTable.vue'
import type { Partner } from '@/stores/types/partner'

defineProps<{
  maxValue: number
  partners: Partner[]
  actionLoading: boolean
}>()
</script>

<style lang="scss" scoped></style>
