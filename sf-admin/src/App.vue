<template>
  <v-app>
    <template v-if="loading">
      <v-sheet class="d-flex justify-center align-center h-100">
        <v-progress-circular indeterminate color="primary" />
      </v-sheet>
    </template>

    <template v-else>
      <RouterView />
    </template>
  </v-app>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { storeToRefs } from 'pinia'

const loading = ref(false)
const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()

const { user, initializationComplete } = storeToRefs(authStore)

onBeforeMount(async () => {
  if (!user.value && route.path !== '/login') {
    initializationComplete.value = false

    try {
      loading.value = true
      const user = await authStore.fetchUser()

      initializationComplete.value = true
    } catch (error) {
      router.replace('/login')
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})
</script>

<style scoped></style>
