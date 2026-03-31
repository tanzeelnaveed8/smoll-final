<template>
  <v-sheet class="d-flex justify-center">
    <div class="px-6 py-6 d-flex flex-column gr-6 w-100" style="max-width: 1140px">
      <!-- Header -->
      <v-sheet class="mb-4">
        <h2 class="text-grey1" style="font-family: 'CooperLtBT'; font-weight: 400">Financial Overview</h2>
        <p class="text-grey2 mt-1 text-body-1" style="font-weight: 600">
          Revenue, visits, and performance for Vet Admin.
        </p>
      </v-sheet>

      <v-sheet v-if="loading" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="primary" />
      </v-sheet>

      <template v-else>
        <!-- Revenue Breakdown -->
        <v-sheet class="mb-6">
          <h3 class="text-grey1 mb-3" style="font-weight: 600">Revenue Breakdown</h3>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-card flat class="px-4 py-5 rounded-lg" style="border: 1px solid #d0d7dc">
                <p class="text-grey2 text-body-2" style="font-weight: 600">Services Revenue</p>
                <p class="text-grey1 mt-2" style="font-size: 28px; font-weight: 700">
                  AED {{ formatNumber(analytics?.servicesRevenue ?? analytics?.totalRevenue ?? 0) }}
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card flat class="px-4 py-5 rounded-lg" style="border: 1px solid #d0d7dc">
                <p class="text-grey2 text-body-2" style="font-weight: 600">Products Revenue</p>
                <p class="text-grey1 mt-2" style="font-size: 28px; font-weight: 700">
                  AED {{ formatNumber(analytics?.productsRevenue ?? 0) }}
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>

        <!-- Monthly Stats -->
        <v-sheet class="mb-6">
          <h3 class="text-grey1 mb-3" style="font-weight: 600">Monthly Stats</h3>
          <v-row dense>
            <v-col cols="6" md="3">
              <v-card flat class="px-4 py-4 rounded-lg" style="border: 1px solid #d0d7dc">
                <p class="text-grey2 text-body-2" style="font-weight: 600">Total Visits</p>
                <p class="text-grey1 mt-2" style="font-size: 22px; font-weight: 700">
                  {{ analytics?.cases ?? 0 }}
                </p>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card flat class="px-4 py-4 rounded-lg" style="border: 1px solid #d0d7dc">
                <p class="text-grey2 text-body-2" style="font-weight: 600">Avg. Order</p>
                <p class="text-grey1 mt-2" style="font-size: 22px; font-weight: 700">
                  AED {{ formatNumber(analytics?.avgOrder ?? 0) }}
                </p>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card flat class="px-4 py-4 rounded-lg" style="border: 1px solid #d0d7dc">
                <p class="text-grey2 text-body-2" style="font-weight: 600">Services</p>
                <p class="text-grey1 mt-2" style="font-size: 22px; font-weight: 700">
                  {{ analytics?.services ?? 0 }}
                </p>
              </v-card>
            </v-col>
            <v-col cols="6" md="3">
              <v-card flat class="px-4 py-4 rounded-lg" style="border: 1px solid #d0d7dc">
                <p class="text-grey2 text-body-2" style="font-weight: 600">Products</p>
                <p class="text-grey1 mt-2" style="font-size: 22px; font-weight: 700">
                  {{ analytics?.products ?? 0 }}
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>

        <!-- Visits by Month -->
        <v-sheet>
          <h3 class="text-grey1 mb-3" style="font-weight: 600">Visits by Month</h3>
          <v-card flat class="rounded-lg" style="border: 1px solid #d0d7dc">
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th class="text-left text-grey2 text-body-2" style="font-weight: 600">Month</th>
                  <th class="text-left text-grey2 text-body-2" style="font-weight: 600">Visits</th>
                  <th class="text-left text-grey2 text-body-2" style="font-weight: 600">Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in visitsByMonth" :key="row.month">
                  <td class="text-body-2 text-grey1">{{ row.month }}</td>
                  <td class="text-body-2 text-grey1">{{ row.visits }}</td>
                  <td class="text-body-2 text-grey1">AED {{ formatNumber(row.revenue) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-sheet>
      </template>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { useAnalyticsStore } from '@/stores/analytics'
import { computed, onMounted, ref } from 'vue'

const analyticsStore = useAnalyticsStore()
const analytics = ref<any>(null)
const loading = ref(false)

const visitsByMonth = computed(() => analytics.value?.visitsByMonth ?? [])

const formatNumber = (v: number) => {
  return Number(v || 0).toLocaleString('en-AE', { maximumFractionDigits: 0 })
}

onMounted(async () => {
  try {
    loading.value = true
    analytics.value = await analyticsStore.fetchAnalytics()
  } finally {
    loading.value = false
  }
})
</script>
