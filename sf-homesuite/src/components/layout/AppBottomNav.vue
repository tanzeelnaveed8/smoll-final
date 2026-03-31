<template>
  <v-bottom-navigation
    :model-value="activeTab"
    grow
    color="primary"
    class="bottom-nav"
    elevation="8"
  >
    <v-btn
      v-for="item in navItems"
      :key="item.to"
      :to="item.logout ? undefined : item.to"
      :value="item.to"
      @click="item.logout ? handleLogout() : undefined"
    >
      <v-icon :icon="item.icon" />
      <span class="nav-label">{{ item.title }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { title: 'Visits', icon: 'mdi-history', to: '/history' },
  { title: 'Finance', icon: 'mdi-wallet', to: '/finance' },
  { title: 'Logout', icon: 'mdi-logout', to: '__logout__', logout: true }
] as const

const routeItems = navItems.filter((item) => !item.logout)

const activeTab = computed(() => {
  const path = route.path
  if (path === '/') return '/'
  return routeItems.find((item) => item.to !== '/' && path.startsWith(item.to))?.to || '/'
})

const handleLogout = async () => {
  await authStore.logout()
  router.replace('/login')
}
</script>

<style scoped>
.bottom-nav {
  position: fixed !important;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.nav-label {
  font-size: 11px;
  margin-top: 2px;
  font-weight: 500;
}
</style>
