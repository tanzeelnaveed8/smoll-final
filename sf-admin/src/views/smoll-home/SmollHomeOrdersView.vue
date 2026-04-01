<template>
  <div class="d-flex flex-column gr-4">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap">
      <div class="mb-2 mb-sm-0">
        <h2 class="text-h6 text-sm-h5 font-weight-bold" style="color: #1565C0">Orders</h2>
        <p class="text-caption text-grey-darken-1">All service and product orders</p>
      </div>
    </div>

    <!-- Filters -->
    <v-card rounded="lg" elevation="0" border class="mb-4">
      <v-card-text class="pa-3">
        <div class="d-flex flex-column flex-sm-row" style="gap: 10px">
          <v-text-field
            v-model="search"
            placeholder="Search..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            density="compact"
            clearable
            variant="outlined"
            class="flex-grow-1"
          />
          <v-select
            v-model="typeFilter"
            :items="typeOptions"
            item-title="text"
            item-value="value"
            placeholder="Type"
            hide-details
            density="compact"
            clearable
            variant="outlined"
            style="min-width: 120px"
          />
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            item-title="text"
            item-value="value"
            placeholder="Status"
            hide-details
            density="compact"
            clearable
            variant="outlined"
            style="min-width: 120px"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading -->
    <template v-if="loading">
      <div class="d-flex flex-column gr-3">
        <v-skeleton-loader v-for="i in 4" :key="i" type="card" />
      </div>
    </template>

    <!-- Empty -->
    <template v-else-if="!filteredOrders.length">
      <v-card rounded="lg" elevation="0" border class="pa-8 text-center">
        <v-icon icon="mdi-package-variant" size="48" color="grey-lighten-1" class="mb-3" />
        <p class="text-body-2 text-grey-darken-1">No orders found</p>
      </v-card>
    </template>

    <!-- List -->
    <template v-else>
      <div class="d-flex flex-column gr-3">
        <v-card
          v-for="order in filteredOrders"
          :key="order.id"
          rounded="lg"
          elevation="0"
          border
          class="order-card cursor-pointer"
          @click="viewOrderDetails(order)"
        >
          <v-card-text class="pa-3">
            <div class="d-flex flex-column flex-sm-row align-sm-center" style="gap: 12px">
              <v-avatar :color="order.type === 'service' ? 'success' : 'primary'" size="40" rounded="lg" class="flex-shrink-0">
                <v-icon
                  :icon="order.type === 'service' ? 'mdi-clipboard-text-clock' : 'mdi-package-variant'"
                  color="white"
                  size="20"
                />
              </v-avatar>

              <div style="flex: 1">
                <div class="d-flex align-center justify-space-between mb-1 flex-wrap">
                  <div class="d-flex align-center flex-wrap" style="gap: 6px">
                    <v-chip
                      :color="order.type === 'service' ? 'success' : 'primary'"
                      size="x-small"
                      label
                      class="font-weight-medium"
                    >
                      {{ order.type === 'service' ? 'Service' : 'Product' }}
                    </v-chip>
                    <v-chip
                      :color="getStatusColor(order.status)"
                      size="x-small"
                      label
                      class="font-weight-medium"
                    >
                      {{ getStatusLabel(order) }}
                    </v-chip>
                  </div>
                  <span class="text-caption text-grey-darken-1">
                    {{ dayjs(order.createdAt).format('DD MMM, YYYY') }}
                  </span>
                </div>

                <h3 class="text-body-2 font-weight-bold mb-1">{{ order.title }}</h3>

                <div class="d-flex flex-wrap align-center" style="gap: 12px">
                  <span class="text-caption text-grey-darken-1">
                    {{ order.member?.name || 'Customer' }}
                  </span>
                  <span class="text-caption text-grey-darken-1">•</span>
                  <span class="text-caption text-grey-darken-1">
                    {{ order.member?.email || 'N/A' }}
                  </span>
                </div>
              </div>

              <div class="text-sm-right">
                <div class="text-body-2 font-weight-bold" style="color: #1565C0">
                  AED {{ order.total?.toFixed(2) }}
                </div>
                <div class="text-caption text-grey-darken-1">
                  {{ order.items?.length || 0 }} items
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import api from '@/util/api'

interface OrderItem {
  id: string
  type: 'service' | 'product'
  title: string
  unitPrice: number
  quantity: number
  imageUrl?: string
}

interface Order {
  id: string
  type: 'service' | 'product'
  title: string
  status: string
  createdAt: string
  total: number
  items: OrderItem[]
  schedule?: {
    labelTop?: string
    labelBottom?: string
    time?: string
  }
  member?: {
    name: string
    email: string
  }
}

const loading = ref(true)
const search = ref('')
const typeFilter = ref<string | null>(null)
const statusFilter = ref<string | null>(null)
const orders = ref<Order[]>([])

const typeOptions = [
  { text: 'Services', value: 'service' },
  { text: 'Products', value: 'product' }
]

const statusOptions = [
  { text: 'Pending', value: 'pending' },
  { text: 'Confirmed', value: 'confirmed' },
  { text: 'Completed', value: 'completed' },
  { text: 'Cancelled', value: 'cancelled' }
]

const fetchOrders = async () => {
  loading.value = true
  try {
    const response = await api.get('/orders/admin')
    orders.value = response.data || []
  } catch (error) {
    console.error('Error fetching orders:', error)
    orders.value = []
  } finally {
    loading.value = false
  }
}

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchesSearch = !search.value || 
      order.title?.toLowerCase().includes(search.value.toLowerCase()) ||
      order.member?.name?.toLowerCase().includes(search.value.toLowerCase()) ||
      order.member?.email?.toLowerCase().includes(search.value.toLowerCase())
    
    const matchesType = !typeFilter.value || order.type === typeFilter.value
    const matchesStatus = !statusFilter.value || order.status === statusFilter.value
    
    return matchesSearch && matchesType && matchesStatus
  })
})

const getStatusLabel = (order: Order) => {
  if (order.status === 'completed') {
    return order.type === 'product' ? 'Delivered' : 'Completed'
  }
  return order.status
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',      // Orange/Yellow
    confirmed: 'primary',    // Blue
    completed: 'success',    // Green
    cancelled: 'error'       // Red
  }
  return colors[status] || 'grey'
}

const viewOrderDetails = (order: Order) => {
  // Navigate to order detail page
  window.location.href = `/smoll-home/orders/${order.id}`
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped lang="scss">
.order-card {
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
