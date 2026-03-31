<template>
  <v-divider color="#D0D7DC" class="opacity-100" />
  <v-sheet
    class="py-8 px-6 d-flex flex-column gr-4"
    style="border: 1px solid #c62424; border-radius: 12px"
  >
    <v-sheet>
      <h4 class="text-body-1 text-grey1" style="font-weight: 600">Reject with a note</h4>
      <v-textarea
        flat
        rows="2"
        variant="solo-filled"
        :no-resize="true"
        hide-details="auto"
        placeholder="Mention the reason of the rejaction."
        class="mt-2"
      />
    </v-sheet>
    <v-btn color="#c62424" density="compact" class="px-2 align-self-start">Reject </v-btn>
  </v-sheet>
</template>
