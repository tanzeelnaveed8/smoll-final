<template>
  <div class="smoll-layout">
    <v-app-bar class="smoll-topbar" flat color="white" density="compact">
      <v-app-bar-title>
        <div class="d-flex align-center" style="gap: 8px">
          <v-icon icon="mdi-account" color="#1565C0" size="20" />
          <span class="text-body-1 font-weight-bold" style="color: #1565C0">Customer</span>
        </div>
      </v-app-bar-title>
      <v-btn icon variant="text" to="/" color="#1565C0">
        <v-icon icon="mdi-arrow-left-circle-outline" />
      </v-btn>
    </v-app-bar>

    <v-main class="smoll-main">
      <div class="smoll-content">
        <router-view />
      </div>
    </v-main>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.smoll-layout {
  min-height: 100vh;
}

.smoll-topbar {
  border-bottom: 1px solid #e0e8f0 !important;
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%) !important;
}

.smoll-main {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.smoll-content {
  padding: 16px;
  max-width: 1400px;
}

@media (min-width: 960px) {
  .smoll-content {
    padding: 28px 36px;
  }
}

@media (max-width: 600px) {
  .smoll-content {
    padding: 12px;
  }
}
</style>
