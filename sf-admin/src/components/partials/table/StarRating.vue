<template>
  <v-sheet class="d-flex gc-1">
    <v-icon
      v-for="(item, ind) in 5"
      :key="ind"
      icon="$tb-star"
      size="16"
      :color="ind < +rating ? '#DEB32F' : '#D0D7DC'"
    />
  </v-sheet>
</template>
<script setup lang="ts">
defineProps<{
  rating: string
}>()
</script>
