<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :loading="actionLoading"
    class="bg-white rounded-lg"
    hover
    :items-per-page="-1"
    hide-default-footer
  >
    <template v-slot:item.organizationName="{ item }">
      <FullName :title="item.organizationName" :profile-img="item.profileImg?.url" />
    </template>
    
    <template v-slot:item.smollVetIsActive="{ item }">
      <v-chip
        :color="item.smollVetIsActive ? 'success' : 'error'"
        size="small"
        class="text-black"
      >
        {{ item.smollVetIsActive ? 'Active' : 'Inactive' }}
      </v-chip>
    </template>
    
    <template v-slot:item.actions="{ item }">
      <v-sheet class="d-flex gc-2">
        <v-btn
          class="rounded opacity-100 px-2 font-weight-medium text-caption"
          style="letter-spacing: 0px !important; text-indent: 0px !important"
          min-height="auto"
          height="auto"
          min-width="auto"
          :to="`/organizations/${item.id}`"
          variant="outlined"
        >
          View
        </v-btn>
      </v-sheet>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import FullName from '@/components/partials/table/FullName.vue'
import type { Organization } from '@/stores/types/organization'
import { computed } from 'vue'

const props = defineProps<{
  organizations: Organization[]
  actionLoading: boolean
}>()

const items = computed(() => props.organizations)

const headers = [
  { title: 'Organization Name', key: 'organizationName' },
  { title: 'Domain', key: 'domain' },
  { title: 'SmollVet Access Start', key: 'smollVetAccessStartDate' },
  { title: 'SmollVet Access End', key: 'smollVetAccessEndDate' },
  { title: 'Status', key: 'smollVetIsActive' },
  { title: 'Actions', key: 'actions', sortable: false }
]
</script>

<style scoped lang="scss"></style>