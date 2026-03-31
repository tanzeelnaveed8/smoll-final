<template>
  <v-sheet class="d-flex justify-center">
    <div class="px-6 pt-6 d-flex flex-column gr-6 w-100" style="max-width: 1140px">
      <v-sheet max-width="393">
        <h1
          class="text-grey1"
          style="font-family: 'CooperLtBT'; font-size: 40px; font-weight: 400; line-height: 48px"
        >
          Hello there, welcome!
        </h1>
      </v-sheet>
      <v-sheet class="d-flex flex-column gr-8">
        <InfoCards :analytics :loading />
      </v-sheet>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import InfoCards from '@/components/app/homepage/InfoCards.vue'
import { useAnalyticsStore, type Analytics } from '@/stores/analytics'
import { onMounted, ref } from 'vue'

const analytics = ref<Analytics | null>(null)
const analyticsStore = useAnalyticsStore()
const loading = ref(false)
const getAnalytics = async () => {
  try {
    loading.value = true
    const data = await analyticsStore.fetchAnalytics()
    analytics.value = data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getAnalytics()
})
</script>
