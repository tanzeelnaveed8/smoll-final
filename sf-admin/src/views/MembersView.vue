<template>
  <v-sheet class="d-flex justify-center">
    <div class="px-6 py-6 d-flex flex-column gr-6 w-100" style="max-width: 1140px">
      <v-sheet class="d-flex justify-space-between w-100">
        <v-sheet class="d-flex gc-4 align-center">
          <UtilityBar path="members" />
          <v-btn
            v-push
            flat
            class="text-grey1 px-0 reload-btn"
            min-width="auto"
            height="auto"
            min-height="auto"
            color="transparent "
            style="margin: 0px"
            @click="handleReload"
          >
            <template v-slot:prepend>
              <v-icon icon="$tb-reload" size="20" />
            </template>
          </v-btn>
        </v-sheet>
        <v-btn
          color="grey1"
          class="text-body-2 px-2"
          prepend-icon="$tb-plus"
          density="comfortable"
          to="/members/add"
        >
          <template v-slot:prepend>
            <v-icon icon="$tb-plus" size="20" style="margin-right: -4px" />
          </template>
          New Customer
        </v-btn>
      </v-sheet>
      <v-sheet class="d-flex flex-column gr-6">
        <MembersTable :members="members.data" :loading="actionLoading" />
        <TableFooter :maxValue path="members" />
      </v-sheet>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import MembersTable from '@/components/app/members/MembersTable.vue'
import TableFooter from '@/components/partials/table/TableFooter.vue'
import UtilityBar from '@/components/partials/UtilityBar.vue'
import { useMemberStore } from '@/stores/member'
import type { Member } from '@/stores/types/member'
import { onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'

const route = useRoute()
const router = useRouter()

const actionLoading = ref()
const members = ref<{ data: Member[]; totalMembers: number }>({ data: [], totalMembers: 0 })
const maxValue = ref(0)

const memberstore = useMemberStore()

const getMembers = async (search?: string, page?: number) => {
  try {
    actionLoading.value = true
    const { data, count } = await memberstore.fetchMembers(search, page)
    members.value = { data, totalMembers: count }
  } finally {
    actionLoading.value = false
  }
}

const handleReload = () => {
  getMembers()
}

watchEffect(async () => {
  const page = Number(route.query.page)
  const limit = 10
  const search = (route.query.search as LocationQueryValue) ?? ''
  await getMembers(search, page)

  maxValue.value = Math.ceil(Number(members.value.totalMembers) / limit)
})
</script>
<style lang="scss" scoped>
.reload-btn {
  &:deep(.v-btn__prepend) {
    margin: 0px;
  }
}
</style>
