<template>
  <v-sheet class="d-flex justify-space-between align-center">
    <div class="d-flex gc-6">
      <v-text-field
        v-model="search"
        width="280"
        class="text-field text-body-2"
        style="height: 32px"
        hide-details="auto"
        density="compact"
        placeholder="Search"
        color="grey2"
        type="text"
      >
        <template v-slot:prepend-inner> <v-icon icon="$tb-search" size="16" /></template>
      </v-text-field>
    </div>
  </v-sheet>
</template>

<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps<{
  path: string
}>()

const router = useRouter()
const route = useRoute()

const search = ref(route.query.search)

watch(
  search,
  useDebounceFn(() => {
    router.push({
      path: props.path,
      query: { ...router.currentRoute.value.query, search: search.value }
    })
  }, 500)
)

watch(
  () => route.query,
  (v) => {
    search.value = v.search as string
  }
)
</script>

<style scoped lang="scss">
.select {
  &:deep(.v-field) {
    color: #494949;
  }
  &:deep(.v-field__input) {
    padding: 6px 0px 6px 12px !important;
  }

  &:deep(.v-select__selection-text) {
    font-size: 14px;
    line-height: 20px;
    overflow: visible;
  }

  &:deep(.v-input__control) {
    height: 32px;
  }

  &:deep(.v-field__input) > input {
    font-size: 14px;
    line-height: 20px;
  }
}

.select-item {
  &:deep(.v-list-item__content) {
    display: flex;
    justify-content: space-between;
  }

  &:deep(.v-list-item-title) {
    font-size: 14px !important;
  }
}

.text-field {
  &:deep(.v-field) {
    background-color: transparent !important;
  }

  &:deep(.v-input__control) {
    height: inherit;

    & .v-field__field {
      height: 32px;

      & input {
        font-size: 14px;
        line-height: 20px;
        font-weight: 500;
        height: inherit;
        padding: 6px 8px;
      }
    }
  }
}
</style>
