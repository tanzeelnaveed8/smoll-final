<template>
  <v-layout>
    <SideNav />
    <TopBar :title="title" />
    <v-main>
      <RouterView />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import TopBar from '../TopBar.vue'
import SideNav from '../SideNav.vue'

const route = useRoute()

const title = computed(() => route.meta.title as string)
</script>
