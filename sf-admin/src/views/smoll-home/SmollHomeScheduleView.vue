<template>
  <div class="d-flex flex-column gr-5">
    <h2 class="text-h6 font-weight-bold" style="color: #1565C0">Schedule</h2>

    <v-card rounded="lg" elevation="0" border>
      <v-card-text class="pa-3 pa-sm-4">
        <!-- Month Navigation -->
        <div class="d-flex align-center justify-space-between mb-3">
          <v-btn icon variant="text" size="small" @click="prevMonth">
            <v-icon icon="mdi-chevron-left" />
          </v-btn>
          <h3 class="text-body-1 font-weight-bold">{{ currentMonthLabel }}</h3>
          <v-btn icon variant="text" size="small" @click="nextMonth">
            <v-icon icon="mdi-chevron-right" />
          </v-btn>
        </div>

        <template v-if="loading">
          <div class="d-flex justify-center pa-6">
            <v-progress-circular indeterminate color="primary" />
          </div>
        </template>

        <template v-else>
          <!-- Day Headers -->
          <div class="calendar-grid mb-1">
            <div v-for="day in weekDays" :key="day" class="text-center py-1">
              <span class="text-caption text-grey-darken-1 font-weight-medium">{{ day }}</span>
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="calendar-grid calendar-body">
            <div
              v-for="(cell, index) in calendarCells"
              :key="index"
              class="calendar-cell"
              :class="{
                'bg-grey-lighten-4': !cell.currentMonth,
                'today-cell': cell.isToday
              }"
            >
              <p
                class="text-caption day-number"
                :class="{
                  'text-grey-darken-2': cell.currentMonth,
                  'text-grey-lighten-1': !cell.currentMonth,
                  'today-badge': cell.isToday
                }"
              >
                {{ cell.day }}
              </p>
              <div v-for="evt in cell.events.slice(0, 2)" :key="evt.id" class="mt-1">
                <v-chip
                  size="x-small"
                  :color="evt.status === 'open' ? '#56B686' : '#999'"
                  variant="tonal"
                  class="w-100 justify-start event-chip"
                  :to="`/smoll-home/visits/${evt.id}`"
                >
                  {{ evt.member }}
                </v-chip>
              </div>
              <p v-if="cell.events.length > 2" class="text-caption text-primary mt-1" style="font-size: 10px">
                +{{ cell.events.length - 2 }}
              </p>
            </div>
          </div>
        </template>

        <!-- Upcoming list -->
        <div v-if="upcomingCases.length" class="mt-4">
          <v-divider class="mb-3" />
          <p class="text-body-2 font-weight-bold mb-2">Upcoming</p>
          <div class="d-flex flex-column gr-2">
            <v-card
              v-for="c in upcomingCases"
              :key="c.id"
              variant="outlined"
              rounded="lg"
              class="pa-3"
              :to="`/smoll-home/visits/${c.id}`"
            >
              <div class="d-flex justify-space-between align-center">
                <div style="min-width: 0">
                  <p class="text-body-2 font-weight-medium text-truncate">{{ c.member || 'Visit' }}</p>
                  <p class="text-caption text-grey-darken-1">{{ c.pet }} &middot; {{ formatDate(c.createdAt) }}</p>
                </div>
                <v-chip
                  size="x-small"
                  variant="tonal"
                  :color="c.status === 'open' ? '#56B686' : '#999'"
                >
                  {{ c.status === 'open' ? 'Open' : 'Closed' }}
                </v-chip>
              </div>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useVetVisitsStore } from '@/stores/vet-visits'
import dayjs from 'dayjs'
import { computed, onMounted, ref, watch } from 'vue'

const vetVisitsStore = useVetVisitsStore()

interface ScheduleEvent {
  id: string
  member: string
  pet: string
  createdAt: string
  status: 'open' | 'closed'
}

const currentDate = ref(dayjs())
const loading = ref(true)
const allCases = ref<ScheduleEvent[]>([])

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const currentMonthLabel = computed(() => currentDate.value.format('MMMM YYYY'))

const formatDate = (date: string) => {
  const d = dayjs(date)
  return d.isValid() ? d.format('MMM D, YYYY') : '-'
}

interface CalendarCell {
  day: number
  currentMonth: boolean
  date: string
  isToday: boolean
  events: ScheduleEvent[]
}

const calendarCells = computed((): CalendarCell[] => {
  const startOfMonth = currentDate.value.startOf('month')
  const endOfMonth = currentDate.value.endOf('month')
  const startDay = startOfMonth.day()
  const daysInMonth = endOfMonth.date()
  const today = dayjs().format('YYYY-MM-DD')

  const cells: CalendarCell[] = []

  // Previous month padding
  const prevM = startOfMonth.subtract(1, 'month')
  const prevMonthDays = prevM.daysInMonth()
  for (let i = startDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const dateStr = prevM.date(day).format('YYYY-MM-DD')
    cells.push({ day, currentMonth: false, date: dateStr, isToday: false, events: [] })
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = currentDate.value.date(d).format('YYYY-MM-DD')
    const dayEvents = allCases.value.filter((c) => dayjs(c.createdAt).format('YYYY-MM-DD') === dateStr)
    cells.push({ day: d, currentMonth: true, date: dateStr, isToday: dateStr === today, events: dayEvents })
  }

  // Next month padding
  const remaining = 42 - cells.length
  const nextM = endOfMonth.add(1, 'day')
  for (let i = 0; i < remaining; i++) {
    const dateStr = nextM.add(i, 'day').format('YYYY-MM-DD')
    cells.push({ day: i + 1, currentMonth: false, date: dateStr, isToday: false, events: [] })
  }

  return cells
})

const upcomingCases = computed(() => {
  const now = dayjs()
  return allCases.value
    .filter((c) => c.status === 'open' && dayjs(c.createdAt).isAfter(now.subtract(1, 'day')))
    .sort((a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix())
    .slice(0, 5)
})

const fetchCases = async () => {
  loading.value = true
  try {
    const res = await vetVisitsStore.fetchVisitsForAdmin({ page: 1, limit: 100 } as any)
    const consultations = res?.data || []
    allCases.value = (Array.isArray(consultations) ? consultations : []).map((c: any) => ({
      id: c.id,
      member: c.member?.name || 'Visit',
      pet: c.pet?.name || c.case?.pet?.name || '-',
      createdAt: c.scheduledAt || c.createdAt || new Date().toISOString(),
      status: ['COMPLETED', 'REJECTED', 'CANCELLED'].includes((c.status || '').toUpperCase())
        ? 'closed'
        : 'open'
    }))
  } finally {
    loading.value = false
  }
}

const prevMonth = () => { currentDate.value = currentDate.value.subtract(1, 'month') }
const nextMonth = () => { currentDate.value = currentDate.value.add(1, 'month') }

watch(currentDate, () => fetchCases())
onMounted(() => fetchCases())
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}
.calendar-body {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}
.calendar-cell {
  min-height: 52px;
  padding: 2px 3px;
  border: 0.5px solid #e8e8e8;
  overflow: hidden;
}
@media (min-width: 600px) {
  .calendar-cell {
    min-height: 72px;
    padding: 4px 6px;
  }
}
.day-number {
  font-weight: 500;
  font-size: 11px;
}
.today-badge {
  background-color: #0D6EFD;
  color: white !important;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.today-cell {
  background-color: #f0f6ff;
}
.event-chip {
  cursor: pointer;
  font-size: 10px !important;
  height: 18px !important;
}
</style>
