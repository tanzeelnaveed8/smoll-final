<template>
  <v-sheet class="d-flex justify-end">
    <v-btn
      v-push
      variant="text"
      icon="$tb-chevron-left"
      height="40"
      class="px-4"
      :disabled="pageValue === minValue"
      @click="() => (pageValue === minValue ? '' : pageValue--)"
    />
    <span class="page-value">
      {{ pageValue }}
    </span>
    <v-btn
      v-push
      variant="text"
      icon="$tb-chevron-right"
      height="40"
      class="px-4"
      :disabled="pageValue >= maxValue"
      @click="() => (pageValue >= maxValue ? '' : pageValue++)"
    />
  </v-sheet>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps<{
  maxValue: number
  path: string
}>()

import { useRoute, useRouter } from 'vue-router'

const route = useRoute()

const minValue = ref(1)
const router = useRouter()
const pageValue = ref<number>(Number(router.currentRoute.value.query.page ?? 1))

watch(
  () => route.query,
  () => {
    pageValue.value = Number(route.query.page ?? 1)
  }
)

watch(pageValue, () => {
  router.push({
    path: props.path,
    query: { ...router.currentRoute.value.query, page: pageValue.value }
  })
})
</script>

<style scoped lang="scss">
.page-value {
  color: #222;
  font-weight: 600;
  text-align: center;
  border: 1px solid #dde7ee;
  border-radius: 4px;
  height: 40px;
  display: block;
  padding: 8px;
  width: 54px;
}
</style>
