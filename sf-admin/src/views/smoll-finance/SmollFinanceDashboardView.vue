<template>
  <div class="d-flex flex-column gr-4">
    <div>
      <h2 class="text-h6 font-weight-bold" style="color: #1565C0">Finance</h2>
      <p class="text-caption text-grey-darken-1">This is a separate area from Vet Admin.</p>
    </div>

    <v-card rounded="lg" elevation="0" border>
      <v-card-text>
        <p class="text-body-2 mb-2">
          Routes are now isolated under <span class="font-weight-medium">/smoll-finance</span>.
        </p>
        <div class="d-flex flex-wrap" style="gap: 8px">
          <v-chip size="small" color="primary" variant="tonal">Dashboard</v-chip>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts"></script>
