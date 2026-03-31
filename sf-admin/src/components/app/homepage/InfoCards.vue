<template>
  <v-row v-if="loading" class="cards-grid" dense>
    <v-col v-for="(i, ind) in 4" :key="ind" cols="12" sm="6" md="3" lg="3">
      <v-skeleton-loader type="image" class="card-skeleton" />
    </v-col>
  </v-row>
  <v-row v-else class="cards-grid" dense>
    <v-col
      v-for="card in infoCards"
      :key="card.value"
      cols="12"
      sm="6"
      md="3"
      lg="3"
    >
      <v-card
        flat
        class="info-card pa-4 rounded-lg d-flex flex-column h-100"
        style="border: 1px solid #d0d7dc"
      >
        <div class="flex-grow-1">
          <p
            class="text-grey1 mb-1"
            style="font-size: 28px; line-height: 36px; font-weight: 300; font-family: 'Cooper'"
          >
            {{ cardValue(card) }}
          </p>
          <p class="text-grey2 text-body-2" style="line-height: 22px; font-weight: 600">
            {{ card.title }}
          </p>
        </div>
        <v-card-actions class="pa-0 mt-3" style="min-height: auto">
          <v-btn
            height="32"
            flat
            :to="card.to"
            class="px-3 text-primary text-caption"
            variant="elevated"
            append-icon="$tb-arrow-right"
            style="
              background-color: #f4f5f5 !important;
              font-weight: 500 !important;
              line-height: 16px;
            "
          >
            Manage
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
<script lang="ts" setup>
import type { Analytics } from '@/stores/analytics'

const props = defineProps<{
  analytics: Analytics | null
  loading: boolean
}>()

function cardValue(card: { value: keyof Analytics }): string {
  if (!props.analytics) return '0'
  const v = props.analytics[card.value]
  if (v === undefined || v === null) return '0'
  if (card.value === 'totalRevenue') {
    return Number(v).toLocaleString('en-AE', { maximumFractionDigits: 0 })
  }
  return String(Number(v))
}

const infoCards: Array<{ title: string; to: string; value: keyof Analytics }> = [
  { title: 'Members', to: '/members', value: 'members' },
  { title: 'Our Veterinarians', to: '/experts', value: 'vets' },
  { title: 'Partners', to: '/partners', value: 'partners' },
  { title: 'Cases', to: '/visits', value: 'cases' }
]
</script>

<style lang="scss" scoped>
.cards-grid {
  margin: 0 -8px;
}

.card-skeleton {
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  &:deep(.v-skeleton-loader__bone) {
    height: 100%;
  }
}

.info-card {
  min-height: 140px;
}
</style>
