<template>
  <template v-if="loading">
    <div class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>
  </template>

  <template v-else>
    <!-- Summary Cards -->
    <div class="stats-grid">
      <v-card rounded="lg" elevation="0" border>
        <v-card-text class="d-flex align-center pa-4" style="gap: 12px">
          <v-avatar color="success" size="42" rounded="lg">
            <v-icon icon="mdi-cash" color="white" size="20" />
          </v-avatar>
          <div>
            <p class="text-caption text-grey-darken-1">Total Earnings</p>
            <p class="text-h6 font-weight-bold">{{ formatCurrency(stats?.totalEarnings || 0) }}</p>
          </div>
        </v-card-text>
      </v-card>

      <v-card rounded="lg" elevation="0" border>
        <v-card-text class="d-flex align-center pa-4" style="gap: 12px">
          <v-avatar color="primary" size="42" rounded="lg">
            <v-icon icon="mdi-check-circle" color="white" size="20" />
          </v-avatar>
          <div>
            <p class="text-caption text-grey-darken-1">Completed</p>
            <p class="text-h6 font-weight-bold">{{ stats?.completedVisits || 0 }}</p>
          </div>
        </v-card-text>
      </v-card>

      <v-card rounded="lg" elevation="0" border>
        <v-card-text class="d-flex align-center pa-4" style="gap: 12px">
          <v-avatar color="info" size="42" rounded="lg">
            <v-icon icon="mdi-calendar-check" color="white" size="20" />
          </v-avatar>
          <div>
            <p class="text-caption text-grey-darken-1">Total Visits</p>
            <p class="text-h6 font-weight-bold">{{ stats?.totalVisits || 0 }}</p>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Monthly Breakdown -->
    <v-card v-if="stats?.monthlyEarnings?.length" rounded="lg" elevation="0" border>
      <v-card-title class="text-body-2 font-weight-bold pa-4 pb-2">Monthly Earnings</v-card-title>
      <v-card-text>
        <div class="d-flex flex-column gr-2">
          <div
            v-for="month in stats.monthlyEarnings"
            :key="month.month"
            class="d-flex justify-space-between align-center pa-3 rounded-lg"
            style="background-color: #f5f5f5"
          >
            <span class="text-body-2 font-weight-medium">{{ month.month }}</span>
            <span class="text-body-2 font-weight-bold">{{ formatCurrency(month.amount) }}</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-card v-if="!stats?.monthlyEarnings?.length" rounded="lg" elevation="0" border>
      <v-card-text class="text-center pa-6">
        <v-icon icon="mdi-chart-line" size="40" color="grey-lighten-1" class="mb-2" />
        <p class="text-body-2 text-grey-darken-1">Monthly breakdown will appear here</p>
      </v-card-text>
    </v-card>
  </template>
</template>

<script setup lang="ts">
import { useVetFinanceStore } from '@/stores/vet-finance'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'

const financeStore = useVetFinanceStore()
const { stats } = storeToRefs(financeStore)
const loading = ref(true)

const formatCurrency = (amount: number) => {
  return `${amount.toFixed(2)} AED`
}

onMounted(async () => {
  try {
    loading.value = true
    await financeStore.fetchStats()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
