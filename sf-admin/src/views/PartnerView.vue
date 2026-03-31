<template>
  <v-sheet class="d-flex justify-center">
    <div class="px-6 py-6 d-flex flex-column gr-6 w-100" style="max-width: 1140px">
      <v-sheet class="d-flex justify-space-between w-100">
        <v-sheet class="d-flex align-center gc-4">
          <UtilityBar path="partners" />

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
          to="/partners/add-partner"
        >
          <template v-slot:prepend>
            <v-icon icon="$tb-plus" size="20" style="margin-right: -4px" />
          </template>
          New Partner
        </v-btn>
      </v-sheet>
      <v-sheet class="d-flex flex-column gr-3">
        <v-tabs v-model="tab" class="tabs text-grey2" height="auto">
          <v-tab
            v-for="tab in tabs"
            :value="tab.value"
            style="line-height: 18px"
            class="pa-1 pb-2"
            min-width="auto"
            height="auto"
            :disabled="tab.value === 'requests'"
          >
            {{ tab.title }}
          </v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item v-for="tab in tabs" :key="tab.value" :value="tab.value">
            <PartnersWindow :partners="partners.data" :actionLoading :maxValue />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-sheet>
    </div>
  </v-sheet>
</template>

<script lang="ts" setup>
import PartnersWindow from '@/components/app/partner/PartnersWindow.vue'
import UtilityBar from '@/components/partials/UtilityBar.vue'
import useMitt from '@/functions/useMitt'
import { usePartnerStore } from '@/stores/partner'
import type { Partner } from '@/stores/types/partner'
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'

const tab = ref()
const tabs = [
  { title: 'Active', value: 'active' },
  { title: 'Deactivated', value: 'deactivated' }
  // { title: 'Requests', value: 'requests' }
]

const isSuspended = computed(() => tab.value === 'deactivated' && tab.value !== 'requests')
const isPending = computed(() => tab.value === 'requests')

const route = useRoute()
const router = useRouter()
const actionLoading = ref(false)
const maxValue = ref()
const { emitter } = useMitt()

const partners = ref<{ data: Partner[]; totalPartners: number }>({ data: [], totalPartners: 0 })

const partnerStore = usePartnerStore()

const getPartners = async (
  isSuspended: boolean,
  isPending: boolean,
  search?: string,
  page?: number
) => {
  try {
    actionLoading.value = true
    const { data } = await partnerStore.fetchPartners(isSuspended, isPending, search, page)
    partners.value = { data, totalPartners: data.length }
  } finally {
    actionLoading.value = false
  }
}
const handleReload = () => {
  getPartners(isSuspended.value, isPending.value)
}

watchEffect(async () => {
  const page = Number(route.query.page)
  const limit = 10
  const search = (route.query.search as LocationQueryValue) ?? ''
  await getPartners(isSuspended.value, isPending.value, search, page)

  maxValue.value = Math.ceil(Number(partners.value.totalPartners) / limit)
})

watch(tab, () => {
  router.replace({ query: undefined })
})

onMounted(() => {
  emitter.on('table-view:update', () => getPartners(isSuspended.value, isPending.value))
})

onUnmounted(() => {
  emitter.off('table-view:update', () => getPartners(isSuspended.value, isPending.value))
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
