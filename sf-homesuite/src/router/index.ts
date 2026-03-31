import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import ScheduleView from '@/views/ScheduleView.vue'
import VisitDetailView from '@/views/VisitDetailView.vue'
import VisitsView from '@/views/VisitsView.vue'
import FinanceView from '@/views/FinanceView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/home',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: DashboardView,
          meta: { title: 'Dashboard' }
        },
        {
          path: '/schedule',
          component: ScheduleView,
          meta: { title: 'My Schedule' }
        },
        {
          path: '/visits/:id',
          component: VisitDetailView,
          meta: { title: 'Visit Detail' }
        },
        {
          path: '/history',
          component: VisitsView,
          meta: { title: 'Visit History' }
        },
        {
          path: '/finance',
          component: FinanceView,
          meta: { title: 'Finance' }
        }
      ]
    },
    {
      path: '/login',
      component: LoginView
    }
  ]
})

// Auth guard: redirect to login when not authenticated
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // On first navigation after page load, try to restore user from cookie
  if (!authStore.initializationComplete) {
    try {
      // Timeout after 3s so the page doesn't stay blank if the API is slow/down
      await Promise.race([
        authStore.fetchUser(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ])
    } catch {
      // ignore errors; user stays null if not logged in
      authStore.$patch({ initializationComplete: true })
    }
  }

  const isAuthed = !!authStore.user

  // If trying to access login page
  if (to.path === '/login') {
    if (isAuthed) {
      return next('/home')
    }
    return next()
  }

  // Protected routes: redirect to login if not authenticated
  if (to.meta?.requiresAuth && !isAuthed) {
    return next('/login')
  }

  return next()
})

export default router
