<template>
  <v-app-bar flat color="white" elevation="0" density="compact" class="topbar">
    <template #append>
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon variant="text" size="small" v-bind="props">
            <v-avatar color="primary" size="32">
              <v-img v-if="user?.avatar" :src="user.avatar" />
              <span v-else class="text-white text-caption font-weight-bold">{{ initials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list density="compact" width="180">
          <v-list-item class="text-body-2">
            <template #prepend>
              <v-icon icon="mdi-account" size="18" />
            </template>
            {{ user?.name || 'User' }}
          </v-list-item>
          <v-divider />
          <v-list-item @click="handleLogout" :disabled="loggingOut" class="text-body-2">
            <template #prepend>
              <v-icon icon="mdi-logout" size="18" />
            </template>
            Logout
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

defineProps<{ title: string }>()

const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const loggingOut = ref(false)

const initials = computed(() => {
  const name = user.value?.name || 'U'
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
})

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

<style scoped>
.topbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}
</style>
