<template>
  <v-sheet class="d-flex flex-column gr-6">
    <VeterniansTable :veternians :actionLoading />
    <TableFooter :maxValue path="veternians" />
  </v-sheet>
</template>

<script lang="ts" setup>
import TableFooter from '@/components/partials/table/TableFooter.vue'
import VeterniansTable from './VeterniansTable.vue'
import type { Vets } from '@/stores/types/veternians'

defineProps<{
  maxValue: number
  veternians: Vets[]
  actionLoading: boolean
}>()
</script>

<style lang="scss" scoped></style>
