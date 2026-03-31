<template>
  <v-sheet class="d-flex flex-column gr-6">
    <v-sheet class="d-flex flex-column gr-4">
      <v-sheet>
        <h5 class="text-body-1 text-grey1" style="font-weight: 600">
          {{ memberDetails?.name || '-' }}'s Pets
        </h5>
      </v-sheet>
      <v-sheet class="pets-container" style="border: 1px solid #d0d7dc; border-radius: 12px">
        <MemberPetItem
          v-if="memberDetails?.pets?.length"
          v-for="pet in memberDetails?.pets"
          :key="pet?.id"
          :pet
        />
        <p class="pa-4" v-else>No pets here.</p>
      </v-sheet>
    </v-sheet>
  </v-sheet>
</template>

<script lang="ts" setup>
import type { Pet } from '@/stores/types/pet'
import MemberPetItem from './MemberPetItem.vue'
import type { Member } from '@/stores/types/member'

defineProps<{
  memberDetails: Member
}>()
</script>

<style lang="scss" scoped>
.pets-container {
  max-width: 600px;
  max-height: 600px;
  overflow: auto;

  & > *:not(:last-child) {
    border-bottom: 1px solid #d0d7dc;
  }
}
</style>
