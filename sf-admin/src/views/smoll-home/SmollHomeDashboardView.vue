<template>
  <div class="vet-dashboard">
    <!-- Header -->
    <div class="dashboard-header mb-5">
      <h1 class="dashboard-title">Vet Admin</h1>
      <p class="dashboard-subtitle">Welcome back! Here's your overview</p>
    </div>

    <!-- Top Stats Cards Row -->
    <v-row class="mb-2">
      <v-col v-for="card in statCards" :key="card.key" cols="6" sm="6" md="3">
        <v-card
          flat
          class="stat-card rounded-xl pa-4 pa-sm-5 d-flex flex-column h-100"
          :to="card.to"
        >
          <div class="d-flex align-center mb-2 mb-sm-3" style="gap: 10px">
            <v-avatar :color="card.iconBg" size="40" rounded="lg">
              <v-icon :icon="card.icon" :color="card.iconColor" size="22" />
            </v-avatar>
            <p class="stat-label">{{ card.title }}</p>
          </div>
          <div class="flex-grow-1">
            <div v-if="loading" class="mb-1">
              <v-skeleton-loader type="text" width="60" />
            </div>
            <p v-else class="stat-value">
              {{ card.prefix }}{{ getCardValue(card.key) }}
            </p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bottom Section: Upcoming Visits + Recent Orders -->
    <v-row>
      <!-- Upcoming Visits -->
      <v-col cols="12" md="6">
        <v-card flat class="bottom-card rounded-xl h-100">
          <v-card-title class="card-header d-flex align-center justify-space-between pa-4 pa-sm-5 pb-3">
            <div class="d-flex align-center" style="gap: 10px">
              <v-avatar color="#e3f2fd" size="36" rounded="lg">
                <v-icon icon="mdi-calendar-clock" color="#1565C0" size="20" />
              </v-avatar>
              <span class="bottom-card-title">Upcoming Visits</span>
            </div>
            <v-btn
              variant="text"
              color="#1565C0"
              size="small"
              to="/smoll-home/schedule"
              class="text-none font-weight-medium"
              append-icon="mdi-arrow-right"
            >
              View All
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4 pa-sm-5 pt-3">
            <div v-if="visitsLoading" class="d-flex flex-column" style="gap: 12px">
              <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-avatar-two-line" />
            </div>
            <div v-else-if="!upcomingVisits.length" class="empty-state pa-6">
              <v-icon icon="mdi-calendar-blank" size="48" color="#b0bec5" />
              <p class="mt-2 text-body-2 text-grey-darken-1">No upcoming visits</p>
            </div>
            <div v-else class="d-flex flex-column" style="gap: 12px">
              <div
                v-for="visit in upcomingVisits.slice(0, 5)"
                :key="visit.id"
                class="visit-item rounded-lg pa-3"
              >
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center" style="gap: 8px">
                    <div class="visit-date-badge">
                      <span class="visit-date-day">{{ formatVisitDay(visit.scheduledAt || visit.createdAt) }}</span>
                    </div>
                    <div>
                      <p class="text-body-2 font-weight-bold mb-0">
                        {{ visit.member?.name || 'Customer' }}
                      </p>
                    </div>
                  </div>
                  <v-chip
                    :color="getStatusColor(visit.status)"
                    size="x-small"
                    variant="tonal"
                    class="flex-shrink-0 text-capitalize"
                  >
                    {{ getStatusLabel(visit.status) }}
                  </v-chip>
                </div>
                <div class="d-flex align-center" style="gap: 6px">
                  <v-icon icon="mdi-clock-outline" size="14" color="#1565C0" />
                  <span class="text-body-2 text-grey-darken-2">
                    {{ formatVisitTime(visit.scheduledAt || visit.createdAt) }} • Consultation
                  </span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Recent Orders -->
      <v-col cols="12" md="6">
        <v-card flat class="bottom-card rounded-xl h-100">
          <v-card-title class="card-header d-flex align-center justify-space-between pa-4 pa-sm-5 pb-3">
            <div class="d-flex align-center" style="gap: 10px">
              <v-avatar color="#fce4ec" size="36" rounded="lg">
                <v-icon icon="mdi-shopping" color="#c62828" size="20" />
              </v-avatar>
              <span class="bottom-card-title">Recent Orders</span>
            </div>
            <v-btn
              variant="text"
              color="#1565C0"
              size="small"
              to="/smoll-home/history"
              class="text-none font-weight-medium"
              append-icon="mdi-arrow-right"
            >
              View All
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4 pa-sm-5 pt-3">
            <div v-if="ordersLoading" class="d-flex flex-column" style="gap: 12px">
              <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-avatar-two-line" />
            </div>
            <div v-else-if="!recentOrders.length" class="empty-state pa-6">
              <v-icon icon="mdi-receipt-text" size="48" color="#b0bec5" />
              <p class="mt-2 text-body-2 text-grey-darken-1">No recent orders</p>
            </div>
            <div v-else class="d-flex flex-column" style="gap: 12px">
              <div
                v-for="order in recentOrders.slice(0, 5)"
                :key="order.id"
                class="order-item rounded-lg pa-3"
              >
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center" style="gap: 10px; min-width: 0">
                    <v-avatar :color="getAvatarColor(order)" size="36">
                      <span class="text-white text-caption font-weight-bold">{{ getOrderInitials(order) }}</span>
                    </v-avatar>
                    <div style="min-width: 0">
                      <p class="text-body-2 font-weight-medium text-truncate">{{ order.customerName || 'Customer' }}</p>
                      <span class="text-caption text-grey-darken-1">
                        {{ formatOrderDate(order.createdAt) }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="text-body-2 font-weight-bold" style="color: #2e7d32">
                      AED {{ formatPrice(order.amount) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useAnalyticsStore, type Analytics } from '@/stores/analytics'
import { useVetVisitsStore } from '@/stores/vet-visits'
import { formatDateTime, getStatusColor, getStatusLabel } from '@/util/vet-helpers'
import { onMounted, ref, computed } from 'vue'

interface DashboardOrder {
  id: string
  customerName: string
  amount: number
  createdAt: string
}

const analyticsStore = useAnalyticsStore()
const vetVisitsStore = useVetVisitsStore()

const analytics = ref<Analytics | null>(null)
const loading = ref(true)
const visitsLoading = ref(true)
const ordersLoading = ref(true)
const upcomingVisits = ref<any[]>([])
const recentOrders = ref<DashboardOrder[]>([])

interface StatCard {
  title: string
  key: string
  icon: string
  iconBg: string
  iconColor: string
  to: string
  prefix: string
}

const statCards: StatCard[] = [
  {
    title: 'Total Revenue',
    key: 'totalRevenue',
    icon: 'mdi-cash-multiple',
    iconBg: '#e3f2fd',
    iconColor: '#1565C0',
    to: '/smoll-home/finance',
    prefix: 'AED '
  },
  {
    title: 'Active Visits',
    key: 'openCases',
    icon: 'mdi-calendar-check',
    iconBg: '#e8f5e9',
    iconColor: '#2e7d32',
    to: '/smoll-home/history',
    prefix: ''
  },
  {
    title: 'New Customers',
    key: 'members',
    icon: 'mdi-account-group',
    iconBg: '#fff3e0',
    iconColor: '#e65100',
    to: '/smoll-home/customers',
    prefix: ''
  },
  {
    title: 'Low Stock',
    key: 'lowStock',
    icon: 'mdi-alert-circle-outline',
    iconBg: '#fce4ec',
    iconColor: '#c62828',
    to: '/smoll-home/products',
    prefix: ''
  }
]

const lowStockCount = computed(() => {
  return 0 // Placeholder - will be updated when we have product inventory tracking
})

function getCardValue(key: string): string {
  if (key === 'lowStock') return String(lowStockCount.value)
  if (!analytics.value) return '0'
  const v = (analytics.value as any)[key]
  if (v === undefined || v === null) return '0'
  if (key === 'totalRevenue') {
    return Number(v).toLocaleString('en-AE', { maximumFractionDigits: 0 })
  }
  return String(Number(v))
}

const avatarColors = ['#1565C0', '#2e7d32', '#e65100', '#6a1b9a', '#ad1457', '#00838f']

function getAvatarColor(item: any): string {
  const name = item.customerName || item.memberName || ''
  const idx = name.length % avatarColors.length
  return avatarColors[idx]
}

function getOrderInitials(order: DashboardOrder): string {
  const name = order.customerName || 'C'
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatVisitDay(date: string | null | undefined): string {
  if (!date) return '--'
  const d = new Date(date)
  return d.getDate().toString()
}

function formatVisitTime(date: string | null | undefined): string {
  if (!date) return '--:--'
  const d = new Date(date)
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

function formatOrderDate(date: string | null | undefined): string {
  if (!date) return '--'
  const d = new Date(date)
  return d.toLocaleDateString('en-AE', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatVisitDate(date: string | null | undefined): string {
  return formatDateTime(date)
}

function formatPrice(price: number | undefined): string {
  if (!price && price !== 0) return '0'
  return Number(price).toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function normalizeOrders(rawOrders: any[]): DashboardOrder[] {
  return rawOrders.map((o: any) => ({
    id: o.case?.id || o.id,
    customerName: typeof o.member === 'string' ? o.member : o.member?.name || 'Customer',
    amount:
      (Array.isArray(o.case?.serviceChecklist)
        ? o.case.serviceChecklist.reduce((sum: number, item: any) => {
            const price = typeof item?.price === 'number' ? item.price : 0
            return sum + price
          }, 0)
        : undefined) ??
      o.totalAmount ??
      o.amount ??
      0,
    createdAt: o.scheduledAt || o.createdAt || o.orderDate || new Date().toISOString()
  }))
}

onMounted(async () => {
  const analyticsPromise = analyticsStore.fetchAnalytics()
    .then((data) => { analytics.value = data })
    .catch(() => {})
    .finally(() => { loading.value = false })

  // Use same source as vet admin Visits list: all non-completed consultations,
  // regardless of type (scheduled/instant). We filter locally for upcoming.
  const visitsPromise = vetVisitsStore.fetchVisitsForAdmin({ isCompleted: false, page: 1, limit: 10 } as any)
    .then((res) => {
      const visits = res?.data || res || []
      const normalized = (Array.isArray(visits) ? visits : []).map((v: any) => {
        const baseStatus = (v.status || '').toUpperCase()
        const isAcceptedActive =
          v.acceptedAt &&
          !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(baseStatus)
        return {
          ...v,
          status: isAcceptedActive ? 'ACCEPTED' : baseStatus || 'INITIATED',
        }
      })
      // Only show visits that are not completed/rejected
      upcomingVisits.value = normalized.filter(
        (v: any) => !['COMPLETED', 'REJECTED', 'CANCELLED'].includes((v.status || '').toUpperCase())
      ).slice(0, 5)
    })
    .catch(() => {})
    .finally(() => { visitsLoading.value = false })

  const ordersPromise = vetVisitsStore.fetchVisitsForAdmin({ page: 1, limit: 10 } as any)
    .then((res) => {
      const consultations = res?.data || res || []
      recentOrders.value = normalizeOrders(Array.isArray(consultations) ? consultations : []).slice(0, 5)
    })
    .catch(() => {})
    .finally(() => { ordersLoading.value = false })

  await Promise.allSettled([analyticsPromise, visitsPromise, ordersPromise])
})
</script>

<style scoped>
.vet-dashboard {
  max-width: 100%;
}

.dashboard-header {
  padding-bottom: 4px;
}

.dashboard-title {
  font-size: 26px;
  font-weight: 800;
  color: #1565C0;
  line-height: 1.2;
}

.dashboard-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: #78909c;
  margin-top: 4px;
}

/* Stat Cards */
.stat-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e8edf5 !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04) !important;
  min-height: 110px;
  background: #fff;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #263238;
  line-height: 1.2;
  margin-bottom: 0;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #78909c;
}

/* Bottom Cards */
.bottom-card {
  border: 1px solid #e8edf5 !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04) !important;
}

.bottom-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #263238;
}

.visit-item {
  background: #f8fafe;
  border: 1px solid #e8edf5;
  transition: all 0.2s ease;
}

.visit-item:hover {
  background: #eef4fb;
  border-color: #bbdefb;
}

.visit-date-badge {
  background: linear-gradient(135deg, #1565C0 0%, #1976D2 100%);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.visit-date-day {
  font-size: 18px;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.order-item {
  background: #fafbfc;
  border: 1px solid #eceff1;
  transition: all 0.2s ease;
}

.order-item:hover {
  background: #f5f7fa;
  border-color: #cfd8dc;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 960px) {
  .dashboard-title {
    font-size: 22px;
  }

  .stat-value {
    font-size: 22px;
  }
}

@media (max-width: 600px) {
  .dashboard-title {
    font-size: 20px;
  }

  .dashboard-subtitle {
    font-size: 12px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 11px;
  }

  .bottom-card-title {
    font-size: 14px;
  }
}
</style>
