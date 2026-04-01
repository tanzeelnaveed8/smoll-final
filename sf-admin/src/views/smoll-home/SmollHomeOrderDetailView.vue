<template>
  <div class="d-flex flex-column gr-4">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap">
      <div class="d-flex align-center flex-wrap" style="gap: 12px">
        <v-btn icon="mdi-arrow-left" variant="text" @click="$router.push('/smoll-home/orders')" class="flex-shrink-0" />
        <div>
          <h2 class="text-h6 text-sm-h5 font-weight-bold" style="color: #1565C0">Order Details</h2>
          <p class="text-caption text-grey-darken-1">Order #{{ order?.id?.slice(-6).toUpperCase() }}</p>
        </div>
      </div>
      <v-btn color="primary" variant="tonal" @click="fetchOrder" class="mt-2 mt-sm-0">
        <v-icon icon="mdi-refresh" start />
        Refresh
      </v-btn>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <v-card rounded="lg" elevation="0" border>
        <v-card-text>
          <v-skeleton-loader type="text" />
          <v-skeleton-loader type="list-item-three-line" />
          <v-skeleton-loader type="list-item-three-line" />
        </v-card-text>
      </v-card>
    </template>

    <!-- Empty -->
    <template v-else-if="!order">
      <v-card rounded="lg" elevation="0" border class="pa-8 text-center">
        <v-icon icon="mdi-package-variant" size="48" color="grey-lighten-1" class="mb-3" />
        <p class="text-body-2 text-grey-darken-1 mb-4">Order not found</p>
        <v-btn color="primary" variant="tonal" @click="$router.push('/smoll-home/orders')">
          Back to Orders
        </v-btn>
      </v-card>
    </template>

    <!-- Content -->
    <template v-else>
      <div class="d-flex flex-column gr-3">
        <!-- Order Info Card -->
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center mb-3">
              <div class="d-flex align-center" style="gap: 8px">
                <v-chip :color="order.type === 'service' ? 'success' : 'primary'" size="small" label>
                  {{ order.type === 'service' ? 'Service' : 'Product' }}
                </v-chip>
                <v-chip :color="getStatusColorChip(order.status)" size="small" label>
                  {{ getStatusLabel(order) }}
                </v-chip>
              </div>
              <span class="text-caption text-grey-darken-1">
                {{ dayjs(order.createdAt).format('DD MMM, YYYY') }}
              </span>
            </div>

            <h3 class="text-body-1 font-weight-bold mb-3">{{ order.title }}</h3>

            <div class="d-flex flex-wrap" style="gap: 16px">
              <div class="d-flex align-center" style="gap: 8px">
                <v-icon icon="mdi-account" size="16" color="grey" />
                <span class="text-caption">{{ order.member?.name || 'N/A' }}</span>
              </div>
              <div class="d-flex align-center" style="gap: 8px">
                <v-icon icon="mdi-email" size="16" color="grey" />
                <span class="text-caption">{{ order.member?.email || 'N/A' }}</span>
              </div>
              <!-- Day & Time - Only for Service Orders -->
              <template v-if="order.type === 'service' && order.schedule">
                <div v-if="order.schedule.labelTop" class="d-flex align-center" style="gap: 8px">
                  <v-icon icon="mdi-calendar" size="16" color="grey" />
                  <span class="text-caption">{{ order.schedule.labelTop }} {{ order.schedule.labelBottom || '' }}</span>
                </div>
                <div v-if="order.schedule.time" class="d-flex align-center" style="gap: 8px">
                  <v-icon icon="mdi-clock-outline" size="16" color="grey" />
                  <span class="text-caption">{{ order.schedule.time }}</span>
                </div>
              </template>
            </div>
          </v-card-text>
        </v-card>

        <!-- Status Update -->
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-center" style="gap: 16px">
              <div>
                <h4 class="text-subtitle-2 font-weight-bold mb-1">Order Status</h4>
                <p class="text-caption text-grey-darken-1">Update the order status</p>
              </div>
              <v-select
                v-model="selectedStatus"
                :items="statusOptions"
                item-title="text"
                item-value="value"
                :color="getStatusColorIcon(selectedStatus)"
                density="compact"
                hide-details
                variant="outlined"
                class="flex-shrink-0"
                style="max-width: 100%; width: 180px"
                @update:model-value="updateStatus"
              />
            </div>
          </v-card-text>
        </v-card>

        <!-- Order Items -->
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <h4 class="text-subtitle-2 font-weight-bold mb-3">Order Items</h4>
            <v-list lines="two" class="pa-0" bg-color="transparent">
              <v-list-item
                v-for="(item, index) in order.items"
                :key="item.id"
                :class="index < order.items.length - 1 ? 'border-b' : ''"
                class="px-0"
              >
                <template v-slot:prepend>
                  <v-avatar :color="item.type === 'service' ? 'success' : 'primary'" size="40" rounded="lg">
                    <v-icon v-if="item.imageUrl" :image="item.imageUrl" />
                    <v-icon v-else :icon="item.type === 'service' ? 'mdi-clipboard-text-clock' : 'mdi-package-variant'" color="white" size="18" />
                  </v-avatar>
                </template>

                <template v-slot:title>
                  <div class="text-body-2 font-weight-bold">{{ item.title }}</div>
                </template>

                <template v-slot:subtitle>
                  <div class="d-flex align-center" style="gap: 12px">
                    <span class="text-caption text-grey-darken-1">Qty: {{ item.quantity }}</span>
                    <span class="text-caption text-grey-darken-1">AED {{ item.unitPrice?.toFixed(2) }} each</span>
                  </div>
                </template>

                <template v-slot:append>
                  <div class="text-body-2 font-weight-bold" style="color: #1565C0">
                    AED {{ (item.unitPrice * item.quantity).toFixed(2) }}
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Order Summary -->
        <v-card rounded="lg" elevation="0" border>
          <v-card-text class="pa-4">
            <h4 class="text-subtitle-2 font-weight-bold mb-3">Order Summary</h4>
            <v-list class="pa-0" bg-color="transparent">
              <v-list-item class="px-0">
                <template v-slot:title>
                  <div class="d-flex justify-space-between">
                    <span class="text-body-2 text-grey-darken-1">Order ID</span>
                    <span class="text-body-2 font-weight-medium">#{{ order.id?.slice(-6).toUpperCase() }}</span>
                  </div>
                </template>
              </v-list-item>
              <v-list-item class="px-0">
                <template v-slot:title>
                  <div class="d-flex justify-space-between">
                    <span class="text-body-2 text-grey-darken-1">Order Date</span>
                    <span class="text-body-2 font-weight-medium">{{ dayjs(order.createdAt).format('DD MMM, YYYY') }}</span>
                  </div>
                </template>
              </v-list-item>
              <v-list-item class="px-0">
                <template v-slot:title>
                  <div class="d-flex justify-space-between">
                    <span class="text-body-2 text-grey-darken-1">Payment Method</span>
                    <span class="text-body-2 font-weight-medium">Online</span>
                  </div>
                </template>
              </v-list-item>
              <v-divider class="my-2" />
              <v-list-item class="px-0">
                <template v-slot:title>
                  <div class="d-flex justify-space-between">
                    <span class="text-body-1 font-weight-bold">Total Amount</span>
                    <span class="text-h6 font-weight-bold" style="color: #1565C0">
                      AED {{ order.total?.toFixed(2) }}
                    </span>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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

const route = useRoute()
const loading = ref(true)
const updating = ref(false)
const order = ref<Order | null>(null)
const selectedStatus = ref<string>('')

const statusOptions = computed(() => {
  const baseOptions = [
    { text: 'Pending', value: 'pending' },
    { text: 'Confirmed', value: 'confirmed' },
    { text: 'Cancelled', value: 'cancelled' }
  ]
  
  // Add completed/delivered based on order type
  const completedOption = {
    text: order.value?.type === 'product' ? 'Delivered' : 'Completed',
    value: 'completed'
  }
  
  // Insert after confirmed
  baseOptions.splice(2, 0, completedOption)
  
  return baseOptions
})

const fetchOrder = async () => {
  loading.value = true
  try {
    const orderId = route.params.id as string
    const response = await api.get(`/orders/admin/${orderId}`)
    order.value = response.data
    selectedStatus.value = response.data?.status || 'pending'
  } catch (error) {
    console.error('Error fetching order:', error)
    order.value = null
  } finally {
    loading.value = false
  }
}

const updateStatus = async () => {
  if (!order.value || updating.value) return
  
  const previousStatus = order.value.status
  updating.value = true
  
  try {
    const orderId = order.value.id
    await api.patch(`/orders/admin/${orderId}`, { status: selectedStatus.value })
    order.value.status = selectedStatus.value
    
    // Show success message
    alert(`Order status updated to ${selectedStatus.value}`)
  } catch (error) {
    console.error('Error updating status:', error)
    alert('Failed to update order status')
    // Revert to previous status
    selectedStatus.value = previousStatus
    if (order.value) {
      order.value.status = previousStatus
    }
  } finally {
    updating.value = false
  }
}

const getStatusLabel = (order: Order) => {
  if (order.status === 'completed') {
    return order.type === 'product' ? 'Delivered' : 'Completed'
  }
  return order.status
}

const getStatusColorIcon = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',      // Orange
    confirmed: 'primary',    // Blue
    completed: 'success',    // Green
    cancelled: 'error'       // Red
  }
  return colors[status] || 'grey'
}

const getStatusColorChip = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',      // Orange
    confirmed: 'primary',    // Blue
    completed: 'success',    // Green
    cancelled: 'error'       // Red
  }
  return colors[status] || 'grey'
}

onMounted(() => {
  fetchOrder()
})
</script>

<style scoped lang="scss">
.border-b {
  border-bottom: 1px solid #F3F4F6 !important;
}
</style>
