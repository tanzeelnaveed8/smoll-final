<template>
  <v-sheet class="d-flex flex-column gr-6">
    <v-avatar
      color="#d5d5d5"
      class="text-grey2"
      size="72"
      :image="memberDetails?.profileImg?.url"
      icon="$tb-user"
    />
    <v-sheet class="d-flex flex-column gr-3">
      <v-sheet>
        <p style="font-weight: 600" class="text-body-1">Name</p>
        <v-text-field
          v-model="form.name"
          type="text"
          hide-details="auto"
          class="text-field mt-2 text-grey1"
          placeholder="Name"
        />
      </v-sheet>
      <v-sheet>
        <p style="font-weight: 600" class="text-body-1">Flat/Villa No</p>
        <v-text-field
          v-model="form.villa"
          type="text"
          hide-details="auto"
          class="text-field mt-2 text-grey1"
          placeholder="Address"
        />
      </v-sheet>
      <v-sheet>
        <p style="font-weight: 600" class="text-body-1">Street Address</p>
        <v-text-field
          v-model="form.address"
          type="text"
          hide-details="auto"
          class="text-field mt-2 text-grey1"
          placeholder="Address"
        />
      </v-sheet>
      <v-sheet>
        <p style="font-weight: 600" class="text-body-1">City</p>
        <v-text-field
          v-model="form.city"
          type="text"
          hide-details="auto"
          class="text-field mt-2 text-grey1"
          placeholder="City"
        />
      </v-sheet>
      <v-sheet>
        <p style="font-weight: 600" class="text-body-1">Country</p>
        <v-text-field
          v-model="form.country"
          type="text"
          hide-details="auto"
          class="text-field mt-2 text-grey1"
          placeholder="Country"
        />
      </v-sheet>
      <v-sheet>
        <p style="font-weight: 600" class="text-body-1">Phone</p>
        <v-text-field
          v-model="form.phone"
          type="text"
          hide-details="auto"
          class="text-field mt-2 text-grey1"
          placeholder="Phone number"
        />
      </v-sheet>

      <v-sheet>
        <p style="font-weight: 600" class="text-body-1">Email address</p>
        <v-text-field
          v-model="form.email"
          type="email"
          hide-details="auto"
          class="text-field mt-2 text-grey1"
          placeholder="Email address"
          append-inner-icon="$tb-mail"
        />
      </v-sheet>
    </v-sheet>
    <v-sheet class="d-flex gc-3">
      <v-btn color="grey1" :loading="saving" @click="handleUpdate">Update</v-btn>
      <v-btn color="error" variant="outlined" :loading="deleting" @click="showDeleteDialog = true">Delete</v-btn>
    </v-sheet>
  </v-sheet>

  <v-dialog v-model="showDeleteDialog" width="400">
    <v-card class="pa-6">
      <h3 class="mb-4">Delete Customer</h3>
      <p>Are you sure you want to delete this customer?</p>
      <v-sheet class="d-flex gc-3 justify-end mt-4">
        <v-btn variant="outlined" @click="showDeleteDialog = false">Cancel</v-btn>
        <v-btn color="error" :loading="deleting" @click="handleDelete">Delete</v-btn>
      </v-sheet>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import type { Member } from '@/stores/types/member'
import { useMemberStore } from '@/stores/member'
import { reactive, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  memberDetails: Member | null
}>()

const memberStore = useMemberStore()
const router = useRouter()
const saving = ref(false)
const deleting = ref(false)
const showDeleteDialog = ref(false)

const form = reactive({
  name: '',
  villa: '',
  address: '',
  city: '',
  country: '',
  phone: '',
  email: ''
})

watchEffect(() => {
  if (props.memberDetails) {
    form.name = props.memberDetails.name ?? ''
    form.villa = props.memberDetails.villa ?? ''
    form.address = props.memberDetails.address ?? ''
    form.city = props.memberDetails.city ?? ''
    form.country = props.memberDetails.country ?? ''
    form.phone = props.memberDetails.phone ?? ''
    form.email = props.memberDetails.email ?? ''
  }
})

const handleUpdate = async () => {
  if (!props.memberDetails) return
  try {
    saving.value = true
    await memberStore.updateMember(props.memberDetails.id, form)
    toast.success('Customer updated successfully')
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!props.memberDetails) return
  try {
    deleting.value = true
    await memberStore.deleteMember(props.memberDetails.id)
    toast.success('Customer deleted')
    showDeleteDialog.value = false
    router.push('/members')
  } finally {
    deleting.value = false
  }
}
</script>

<style lang="scss" scoped>
.text-field:deep(.v-input__prepend) {
  margin: 0px;
}
</style>
