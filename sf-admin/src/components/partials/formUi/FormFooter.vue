<template>
  <v-sheet class="px-9 position-fixed bg-white bottom-0 form-footer">
    <v-sheet class="d-flex gc-6 justify-end">
      <v-btn
        :disabled="loading"
        color="#E7F3F7"
        class="px-3 text-grey1 font-weight-bold"
        flat
        style="letter-spacing: 0px"
        type="button"
        @click="$router.back()"
      >
        <template v-if="icon" v-slot:append>
          <v-icon :icon="`$${icon}`" style="margin-left: -4px" />
        </template>
        Cancel
      </v-btn>
      <v-btn
        :loading
        :disabled="loading"
        color="grey1"
        class="px-3"
        style="border: 1px solid #131313; letter-spacing: 0px"
        type="submit"
      >
        {{ buttonText }}
      </v-btn>
    </v-sheet>
  </v-sheet>
</template>

<script lang="ts" setup>
defineProps<{ buttonText: string; icon?: string; loading: boolean }>()
</script>

<style lang="scss" scoped>
.form-footer {
  padding: 26px 36px;
  border-top: 1px solid #d0d7dc;
  width: calc(100% - 270px);
  z-index: 100;
}
</style>
