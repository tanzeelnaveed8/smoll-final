<template>
  <v-app>
    <RouterView />
  </v-app>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { RouterView } from 'vue-router'

dayjs.extend(utc)
dayjs.extend(timezone)
</script>
