<template>
  <v-sheet
    height="64"
    class="d-flex px-4 text-grey2 text-body-2 align-center justify-space-between font-weight-medium"
  >
    <div class="d-flex gc-2 align-center">
      <v-avatar size="36" color="grey2" :image="pet?.photos[0]?.url" />
      <div class="d-flex flex-column align-start">
        <p>{{ pet.name }}</p>

        <!-- color="#56b686" -->
        <v-chip
          v-if="pet.careId"
          variant="flat"
          :color="pet.subscriptionDetails.status.toLowerCase() === 'active' ? '#56b686' : '#f31101'"
          text-color="white"
          size="small"
          style="height: 20px; padding: 0px 6px; line-height: 20px; margin-top: 2px"
        >
          {{ pet.subscriptionDetails.status }}
        </v-chip>
      </div>
    </div>
    <p>{{ pet.id }}</p>
    <p>{{ pet.breed }}</p>
    <p>{{ pet.age }}</p>
    <v-btn
      min-height="auto"
      min-width="auto"
      height="auto"
      @click="modal = true"
      class="px-0 text-primary opacity-100"
      variant="plain"
      color="transparent"
    >
      <template v-slot:append>
        <v-icon icon="$tb-circle-arrow-up-right" style="margin-left: -4px" />
      </template>
      Open Profile
    </v-btn>

    <v-dialog v-model="modal">
      <PetProfileModal :petDetails="pet" @closeDialog="modal = false" />
    </v-dialog>
  </v-sheet>
</template>

<script lang="ts" setup>
import PetProfileModal from '@/components/modal/PetProfileModal.vue'
import type { Pet } from '@/stores/types/pet'
import { ref } from 'vue'

defineProps<{
  pet: Pet
}>()

const modal = ref(false)
</script>
