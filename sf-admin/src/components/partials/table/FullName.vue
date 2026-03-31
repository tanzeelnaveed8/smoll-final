<template>
  <v-sheet class="d-flex align-center" style="gap: 10px">
    <v-avatar
      color="#d5d5d5"
      class="text-grey2"
      size="26"
      :image="profileImg"
      icon="$tb-user"
      style="font-size: 10px"
    />
    <span class="text-body-2 text-grey1" style="height: 20px; font-weight: 600">{{ title }}</span>
  </v-sheet>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  profileImg: string | undefined
}>()
</script>
