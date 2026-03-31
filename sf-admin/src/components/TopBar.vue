<template>
  <v-app-bar
    app
    border
    style="border: none; border-bottom: 1px solid #dde7ee"
    class="px-8 position-fixed"
    flat
  >
    <div
      class="text-body-1 ma-0 text-grey1 w-100"
      style="line-height: 24px; font-weight: 700; color: black"
      v-html="rawTitle"
    ></div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  title: string
}>()

const rawTitle = ref('')

watchEffect(() => {
  const title = props.title

  const updatedTitle =
    title.split('/').length > 1
      ? `
  ${title.split('/').slice(0, -1).join('/')} /
    <span style='color:#222'>${title.split('/').slice(-1)}</span>`
      : title.split('/')[0]

  rawTitle.value = updatedTitle
})
</script>
