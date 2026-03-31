<template>
  <div class="px-6 pt-6 d-flex flex-column gr-6 align-start" style="padding-bottom: 110px">
    <v-btn
      variant="plain"
      prepend-icon="$tb-arrow-left"
      class="px-0 text-grey2 btn-back"
      @click="$router.back()"
      >Back
    </v-btn>

    <v-sheet class="d-flex gc-12 w-100">
      <v-sheet class="d-flex flex-column gr-6 w-100" style="max-width: calc(50% - 24px)">
        <slot name="form-header"></slot>
        <slot name="form"></slot>
      </v-sheet>
      <v-sheet class="w-100 d-flex flex-column gr-8" style="max-width: calc(50% - 24px)">
        <slot name="upload"></slot>
        <slot name="reset-password"></slot>
        <slot name="deactivate-account"></slot>
      </v-sheet>
    </v-sheet>
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.btn-back {
  &:hover {
    color: #222 !important;
  }
}
</style>
