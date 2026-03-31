<template>
  <v-navigation-drawer permanent width="240" color="white" elevation="1">
    <div class="d-flex flex-column h-100">
      <div class="pa-4 d-flex align-center" style="gap: 12px">
        <v-icon icon="mdi-paw" size="32" color="primary" />
        <span class="text-h6 font-weight-bold">HomeSuite</span>
      </div>

      <v-divider />

      <v-list nav density="comfortable" class="mt-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="pill"
          color="primary"
          class="mb-1"
        />
      </v-list>

      <v-spacer />

      <v-divider />

      <v-list nav density="comfortable" class="pb-4">
        <v-list-item
          prepend-icon="mdi-logout"
          title="Logout"
          rounded="pill"
          @click="handleLogout"
          :loading="loggingOut"
        />
      </v-list>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loggingOut = ref(false)

const navItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  { title: 'My Schedule', icon: 'mdi-calendar', to: '/schedule' },
  { title: 'Visit History', icon: 'mdi-history', to: '/history' },
  { title: 'Finance', icon: 'mdi-currency-usd', to: '/finance' }
]

const handleLogout = async () => {
  try {
    loggingOut.value = true
    await authStore.logout()
  } finally {
    loggingOut.value = false
    router.replace('/login')
  }
}
</script>
