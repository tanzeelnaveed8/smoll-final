<template>
  <v-sheet class="d-flex flex-column gr-2">
    <h3 class="text-h6" style="font-weight: 700; line-height: 24px">{{ title }}</h3>
    <p v-if="about" class="text-body-2 text-grey2" style="font-weight: 500">{{ about }}</p>
  </v-sheet>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
  about?: string
}>()
</script>
