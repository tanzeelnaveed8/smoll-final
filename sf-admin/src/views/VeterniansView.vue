<template>
  <v-sheet class="d-flex justify-center">
    <div class="px-6 py-6 d-flex flex-column gr-6 w-100" style="max-width: 1140px">
      <v-sheet class="d-flex justify-space-between w-100">
        <v-sheet class="d-flex align-center gc-4">
          <UtilityBar path="Experts" />
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

        <v-btn
          color="grey1"
          class="text-body-2 px-2"
          prepend-icon="$tb-plus"
          density="comfortable"
          to="/experts/add-vet"
        >
          <template v-slot:prepend>
            <v-icon icon="$tb-plus" size="20" style="margin-right: -4px" />
          </template>
          New Expert
        </v-btn>
      </v-sheet>
      <v-sheet class="d-flex flex-column gr-3">
        <v-tabs v-model="tab" class="tabs text-grey2" height="auto">
          <v-tab
            v-for="tab in tabs"
            :key="tab.value"
            :value="tab.value"
            style="line-height: 18px"
            class="pa-1 pb-2"
            min-width="auto"
            height="auto"
            >{{ tab.title }}</v-tab
          >
        </v-tabs>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item v-for="tab in tabs" :value="tab.value">
            <VeterniansWindow :veternians="veternians.data" :actionLoading :maxValue />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-sheet>
    </div>
  </v-sheet>
</template>

<script lang="ts" setup>
import VeterniansWindow from '@/components/app/veternians/VeterniansWindow.vue'
import UtilityBar from '@/components/partials/UtilityBar.vue'
import useMitt from '@/functions/useMitt'
import type { Vets } from '@/stores/types/veternians'
import { useVeterniansStore } from '@/stores/veternians'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'

const route = useRoute()
const router = useRouter()

const { emitter } = useMitt()

const tab = ref('active')
const tabs = [
  { title: 'Active', value: 'active' },
  { title: 'Deactivated', value: 'deactivate' }
]
const isSuspended = computed(() => tab.value === 'deactivate')

const veternians = ref<{ data: Vets[]; totalRequests: number }>({ data: [], totalRequests: 0 })

const veterniansStore = useVeterniansStore()
const actionLoading = ref(false)
const maxValue = ref()

const getVeternians = async (isSuspended: boolean, search?: string, page?: number) => {
  try {
    actionLoading.value = true
    const { data, count } = await veterniansStore.fetchVets(isSuspended, search, page)
    veternians.value = { data, totalRequests: count }
    maxValue.value = Math.ceil(Number(count) / 10)
  } finally {
    actionLoading.value = false
  }
}

const handleReload = () => {
  getVeternians(isSuspended.value)
}

watch(
  [isSuspended, () => route.query.page, () => route.query.search],
  ([suspended, page, search]) => {
    getVeternians(suspended as boolean, (search as string) ?? '', Number(page) || 1)
  },
  { immediate: true }
)

watch(tab, () => {
  router.replace({ query: undefined })
})

onMounted(() => {
  emitter.on('table-view:update', () => getVeternians(isSuspended.value))
})

onUnmounted(() => {
  emitter.off('table-view:update', () => getVeternians(isSuspended.value))
})
</script>

<style scoped lang="scss">
.tabs:deep(.v-slide-group__content) {
  gap: 16px;
}
.tabs:deep(.v-tab-item--selected) {
  color: #222222 !important;
}
.reload-btn {
  &:deep(.v-btn__prepend) {
    margin: 0px;
  }
}
</style>
