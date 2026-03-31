<template>
  <v-sheet class="d-flex justify-center">
    <div class="px-6 pt-6 d-flex flex-column gr-6 w-100" style="max-width: 1140px">
      <v-sheet class="d-flex gc-4 align-center">
        <UtilityBar path="cases" />
        <v-btn color="grey1" to="/visits/add" flat>New Visit</v-btn>
        <v-btn
          v-push
          flat
          class="text-grey1 px-0 reload-btn"
          min-width="auto"
          height="auto"
          min-height="auto"
          color="transparent "
          style="margin: 0px"
          @click="handleReload"
        >
          <template v-slot:prepend>
            <v-icon icon="$tb-reload" size="20" />
          </template>
        </v-btn>
      </v-sheet>
      <CasesTable :cases="cases.data" :loading="actionLoading" />
      <TableFooter :maxValue path="cases" />
    </div>
  </v-sheet>
</template>

<script lang="ts" setup>
import CasesTable from '@/components/app/cases/CasesTable.vue'
import TableFooter from '@/components/partials/table/TableFooter.vue'
import UtilityBar from '@/components/partials/UtilityBar.vue'
import { useCaseStore } from '@/stores/case'
import type { Cases } from '@/stores/types/cases'
import { onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'

const route = useRoute()
const router = useRouter()

const actionLoading = ref()
const cases = ref<{ data: Cases[]; totalCases: number }>({ data: [], totalCases: 0 })
const maxValue = ref(0)

const caseStore = useCaseStore()

const getCases = async (search?: string, page?: number) => {
  try {
    actionLoading.value = true
    const { data, count } = await caseStore.fetchCases(search, page)
    cases.value = { data, totalCases: count }
  } finally {
    actionLoading.value = false
  }
}

const handleReload = () => {
  getCases()
}

watchEffect(async () => {
  const page = Number(route.query.page)
  const limit = 10
  const search = (route.query.search as LocationQueryValue) ?? ''
  await getCases(search, page)

  maxValue.value = Math.ceil(Number(cases.value.totalCases) / limit)
})
</script>

<style lang="scss" scoped>
.reload-btn {
  &:deep(.v-btn__prepend) {
    margin: 0px;
  }
}
</style>
