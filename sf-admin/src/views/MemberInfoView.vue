<template>
  <v-sheet class="d-flex justify-center w-100" style="height: 100%; justify-content: space-between">
    <template v-if="actionLoading">
      <v-sheet class="d-flex justify-center align-center h-100">
        <v-progress-circular indeterminate color="primary" />
      </v-sheet>
    </template>
    <div v-else class="px-6 py-6 d-flex flex-column gr-6 align-start" style="max-width: 1140px">
      <v-sheet class="d-flex justify-space-between align-center w-100 mb-2">
        <v-btn variant="plain" color="grey2" prepend-icon="$tb-arrow-left" class="px-0 btn-back" to="/members">
          Back
        </v-btn>
        <v-btn color="error" variant="outlined" :loading="deleting" @click="confirmDelete = true">
          Delete Customer
        </v-btn>
      </v-sheet>
      <v-sheet v-if="memberDetails" class="d-flex gc-4 mb-4" style="border: 1px solid #d0d7dc; border-radius: 8px; padding: 16px">
        <v-sheet class="d-flex flex-column align-center">
          <p class="text-grey2 text-body-2 font-weight-bold">Visits</p>
          <p class="text-grey1 text-h5 font-weight-bold">{{ memberDetails.visitsCount ?? 0 }}</p>
        </v-sheet>
        <v-sheet class="d-flex flex-column align-center">
          <p class="text-grey2 text-body-2 font-weight-bold">Pets</p>
          <p class="text-grey1 text-h5 font-weight-bold">{{ memberDetails.petsCount ?? memberDetails.pets?.length ?? 0 }}</p>
        </v-sheet>
      </v-sheet>
      <v-sheet class="d-flex gc-12 w-100">
        <v-sheet class="d-flex flex-column gr-6 w-100">
          <FormHeader title="Members Information" about=" Edit members and their pets. View detailed profiles, including pet information and
              history. You can also deactivate accounts as needed." />
          <MemberForm :memberDetails />
        </v-sheet>
        <v-sheet class="w-100 d-flex flex-column gr-8">
          <MembersPet :memberDetails="memberDetails!" />
        </v-sheet>
      </v-sheet>
    </div>
    <v-dialog v-model="confirmDelete" width="400" persistent>
      <v-card class="pa-6">
        <h3 class="mb-3">Delete Customer</h3>
        <p class="text-grey2">Are you sure you want to delete "{{ memberDetails?.name }}"? This action cannot be undone.</p>
        <v-sheet class="d-flex gc-3 justify-end mt-4">
          <v-btn variant="outlined" @click="confirmDelete = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="handleDelete">Delete</v-btn>
        </v-sheet>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>

<script lang="ts" setup>
import MemberForm from '@/components/app/members/MemberForm.vue'
import MembersPet from '@/components/app/members/MembersPet.vue'
import FormHeader from '@/components/partials/formUi/FormHeader.vue'
import { useMemberStore } from '@/stores/member'
import type { Member } from '@/stores/types/member'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const memberDetails = ref<Member | null>(null)
const actionLoading = ref(false)
const deleting = ref(false)
const confirmDelete = ref(false)
const memberStore = useMemberStore()
const route = useRoute()
const router = useRouter()

const getMemberDetails = async () => {
  try {
    const id = route.params.memberId as string
    actionLoading.value = true
    const data = await memberStore.fetchMembersDetails(id)
    memberDetails.value = data
  } finally {
    actionLoading.value = false
  }
}

const handleDelete = async () => {
  if (!memberDetails.value) return
  try {
    deleting.value = true
    await memberStore.deleteMember(memberDetails.value.id)
    toast.success('Customer deleted')
    router.replace('/members')
  } catch {
    toast.error('Failed to delete customer')
  } finally {
    deleting.value = false
    confirmDelete.value = false
  }
}

onMounted(() => getMemberDetails())
</script>

<style>
.btn-back {
  &:hover {
    color: #222 !important;
  }
}
</style>
