<template>
  <v-sheet class="d-flex justify-center">
    <div class="px-6 py-6 d-flex flex-column gr-6 w-100" style="max-width: 1140px">
      <v-sheet class="d-flex justify-space-between w-100">
        <v-sheet class="d-flex align-center gc-4">
          <UtilityBar path="Organizations" />
          <v-btn
            v-push
            flat
            class="text-grey1 px-0 reload-btn"
            min-width="auto"
            height="auto"
            min-height="auto"
            color="transparent"
            style="margin: 0px"
            @click="fetchOrganizations"
          >
            <template v-slot:prepend>
              <v-icon icon="$tb-reload" size="20" />
            </template>
          </v-btn>
        </v-sheet>
        
        <v-btn
          color="grey1"
          class="text-body-2 px-2"
          density="comfortable"
          @click="openAddDialog"
        >
          <template v-slot:prepend>
            <v-icon icon="$tb-plus" size="20" style="margin-right: -4px" />
          </template>
          Add Organization
        </v-btn>
      </v-sheet>
      
      <v-sheet class="d-flex flex-column gr-6">
        <OrganizationTable :organizations="organizations.data" :actionLoading="actionLoading" />
        <TableFooter :maxValue="maxValue" path="organizations" />
      </v-sheet>
      
      <!-- Add Organization Dialog -->
      <v-dialog v-model="showAddDialog" max-width="600px">
        <v-card class="rounded-lg">
          <v-card-title class="text-h5 font-weight-bold pa-6 pb-2">
            Add New Organization
          </v-card-title>
          <v-card-text class="pa-6 pt-4">
            <v-form ref="formRef" v-model="isFormValid" @submit.prevent="handleAddOrganization">
              <v-sheet class="d-flex flex-column gr-6">
                <v-text-field
                  v-model="form.organizationName"
                  label="Organization Name"
                  variant="outlined"
                  density="comfortable"
                  bg-color="grey-lighten-4"
                  required
                  :rules="[(v: any) => !!v || 'Organization name is required']"
                ></v-text-field>
              </v-sheet>
            </v-form>
          </v-card-text>
          <v-card-actions class="pa-6 pt-2">
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="text" @click="closeAddDialog">Cancel</v-btn>
            <v-btn 
              color="primary" 
              variant="flat"
              @click="handleAddOrganization"
              :loading="submitLoading"
              :disabled="!isFormValid"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-sheet>
</template>

<script lang="ts" setup>
import OrganizationTable from '@/components/app/organization/OrganizationTable.vue'
import TableFooter from '@/components/partials/table/TableFooter.vue'
import UtilityBar from '@/components/partials/UtilityBar.vue'
import { useOrganizationStore } from '@/stores/organization'
import type { Organization } from '@/stores/types/organization'
import { onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter, type LocationQueryValue } from 'vue-router'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()

const actionLoading = ref(false)
const submitLoading = ref(false)
const organizations = ref<{ data: Organization[]; count: number }>({ 
  data: [], 
  count: 0 
})
const maxValue = ref(0)
const showAddDialog = ref(false)
const formRef = ref()
const isFormValid = ref(false)

const form = ref({
  organizationName: ''
})

const organizationStore = useOrganizationStore()

// No coupled fields: creation is name-only

const fetchOrganizations = async (search?: string, page?: number) => {
  try {
    actionLoading.value = true
    const data = await organizationStore.fetchOrganizations(search, page)
    organizations.value = data
  } catch (error) {
    console.error('Error fetching organizations:', error)
    toast.error('Failed to load organizations')
  } finally {
    actionLoading.value = false
  }
}

const openAddDialog = () => {
  form.value = { organizationName: '' }
  showAddDialog.value = true
  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

const closeAddDialog = () => {
  showAddDialog.value = false
  if (formRef.value) {
    formRef.value.reset()
  }
}

const handleAddOrganization = async () => {
  if (!formRef.value) return
  
  const { valid } = await formRef.value.validate()
  if (!valid) return
  
  try {
    submitLoading.value = true
    await organizationStore.addOrganization({
      organizationName: form.value.organizationName.trim()
    })
    toast.success('Organization added successfully')
    closeAddDialog()
    // Refresh with current params
    const search = (route.query.search as string) || ''
    const page = Number(route.query.page || 1)
    await fetchOrganizations(search, page)
    
  } catch (error: any) {
    console.error('Error adding organization:', error)
    toast.error(error.message || 'Failed to add organization')
  } finally {
    submitLoading.value = false
  }
}

watchEffect(async () => {
  const page = Number(route.query.page || 1)
  const limit = 10
  const search = (route.query.search as LocationQueryValue) ?? ''
  
  await fetchOrganizations(search, page)
  
  maxValue.value = Math.ceil(organizations.value.count / limit)
})

</script>

<style scoped lang="scss"></style>
