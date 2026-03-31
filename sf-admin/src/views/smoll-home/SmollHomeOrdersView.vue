<template>
  <div class="d-flex flex-column gr-4">
    <div class="d-flex justify-space-between align-center">
      <div>
        <h2 class="text-h6 font-weight-bold" style="color: #1565C0">Orders</h2>
        <p class="text-caption text-grey-darken-1">All service and product orders</p>
      </div>
    </div>

    <!-- Filters -->
    <v-card rounded="lg" elevation="0" border>
      <v-card-text class="d-flex flex-wrap" style="gap: 10px">
        <v-text-field
          v-model="search"
          placeholder="Search by customer or item..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          density="compact"
          clearable
          style="min-width: 150px; flex: 1"
        />
        <v-select
          v-model="typeFilter"
          :items="typeOptions"
          item-title="text"
          item-value="value"
          placeholder="All Types"
          hide-details
          density="compact"
          clearable
          style="min-width: 140px; max-width: 200px"
        />
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          item-title="text"
          item-value="value"
          placeholder="All Status"
          hide-details
          density="compact"
          clearable
          style="min-width: 140px; max-width: 200px"
        />
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
      <v-sheet rounded="lg" class="pa-8 text-center" border>
        <v-icon icon="mdi-format-list-checks" size="48" color="grey-lighten-1" class="mb-3" />
        <p class="text-body-1 text-grey-darken-1">No orders found</p>
      </v-sheet>
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
          class="order-card"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center" style="gap: 12px; flex: 1">
                <v-avatar :color="order.type === 'service' ? 'secondary' : 'primary'" size="40" rounded="lg">
                  <v-icon 
                    :icon="order.type === 'service' ? 'mdi-clipboard-text-clock' : 'mdi-package-variant'" 
                    color="white" 
                    size="22" 
                  />
                </v-avatar>
                
                <div style="flex: 1">
                  <div class="d-flex align-center" style="gap: 8px">
                    <span class="text-body-2 font-weight-bold">{{ order.items?.[0]?.title || 'Order' }}</span>
                    <v-chip
                      :color="order.type === 'service' ? 'secondary' : 'primary'"
                      size="small"
                      label
                      class="text-caption"
                    >
                      {{ order.type === 'service' ? 'Service' : 'Product' }}
                    </v-chip>
                    <v-chip
                      :color="getStatusColor(order.status)"
                      size="small"
                      label
                      class="text-caption"
                    >
                      {{ order.status }}
                    </v-chip>
                  </div>
                  
                  <div class="d-flex align-center mt-1" style="gap: 16px">
                    <span class="text-caption text-grey-darken-1 d-flex align-center" style="gap: 4px">
                      <v-icon icon="mdi-account" size="14" />
                      {{ order.member?.name || 'Customer' }}
                    </span>
                    <span class="text-caption text-grey-darken-1 d-flex align-center" style="gap: 4px">
                      <v-icon icon="mdi-email" size="14" />
                      {{ order.member?.email || 'N/A' }}
                    </span>
                    <span class="text-caption text-grey-darken-1 d-flex align-center" style="gap: 4px">
                      <v-icon icon="mdi-calendar" size="14" />
                      {{ dayjs(order.createdAt).format('DD MMM, YYYY') }}
                    </span>
                    <span v-if="order.schedule" class="text-caption text-grey-darken-1 d-flex align-center" style="gap: 4px">
                      <v-icon icon="mdi-clock-outline" size="14" />
                      {{ order.schedule.labelTop }} {{ order.schedule.labelBottom }} at {{ order.schedule.time }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="d-flex align-center" style="gap: 16px">
                <div class="text-right">
                  <div class="text-body-2 font-weight-bold" style="color: #1565C0">
                    AED {{ order.total?.toFixed(2) || '0.00' }}
                  </div>
                  <div class="text-caption text-grey-darken-1">
                    {{ order.items?.length || 0 }} item{{ order.items?.length !== 1 ? 's' : '' }}
                  </div>
                </div>
                
                <v-btn
                  icon="mdi-chevron-right"
                  size="small"
                  variant="text"
                  @click="viewOrderDetails(order)"
                />
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

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'grey'
  }
  return colors[status] || 'grey'
}

const viewOrderDetails = (order: Order) => {
  // Navigate to order detail page (to be implemented)
  console.log('View order:', order.id)
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped lang="scss">
.order-card {
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  }
}
</style>
