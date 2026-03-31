<template>
  <div class="smoll-layout">
    <SmollHomeSidebar v-model:drawer="drawer" />

    <!-- Mobile top bar -->
    <v-app-bar class="d-md-none smoll-topbar" flat color="white" density="compact">
      <v-app-bar-nav-icon @click="drawer = !drawer" color="#1565C0" />
      <v-app-bar-title>
        <div class="d-flex align-center" style="gap: 8px">
          <v-icon icon="mdi-shield-crown" color="#1565C0" size="20" />
          <span class="text-body-1 font-weight-bold" style="color: #1565C0">Vet Admin</span>
        </div>
      </v-app-bar-title>
      <v-btn icon variant="text" to="/" color="#1565C0">
        <v-icon icon="mdi-arrow-left-circle-outline" />
      </v-btn>
    </v-app-bar>

    <v-main class="smoll-home-main">
      <div class="smoll-home-content">
        <router-view />
      </div>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SmollHomeSidebar from './SmollHomeSidebar.vue'

const drawer = ref(true)
</script>

<style scoped>
.smoll-layout {
  min-height: 100vh;
}

.smoll-topbar {
  border-bottom: 1px solid #e0e8f0 !important;
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%) !important;
}

.smoll-home-main {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.smoll-home-content {
  padding: 16px;
  max-width: 1400px;
}

@media (min-width: 960px) {
  .smoll-home-content {
    padding: 28px 36px;
  }
}

@media (max-width: 600px) {
  .smoll-home-content {
    padding: 12px;
  }
}
</style>
