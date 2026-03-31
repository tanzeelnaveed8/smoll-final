<template>
  <v-layout>
    <v-main class="main-content">
      <RouterView />
    </v-main>
    <AppBottomNav />
  </v-layout>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppBottomNav from './AppBottomNav.vue'
</script>

<style scoped>
.main-content {
  padding-bottom: 64px !important;
}
</style>
