<template>
  <div class="d-flex flex-column gr-4">
    <div class="d-flex justify-space-between align-center">
      <div>
        <h2 class="text-h6 font-weight-bold" style="color: #1565C0">Customers</h2>
        <p class="text-caption text-grey-darken-1">
          Customers visible only inside Vet Admin area
        </p>
      </div>
      <v-btn
        color="primary"
        class="text-body-2 text-none"
        prepend-icon="mdi-plus"
        size="small"
        @click="openAddDialog"
      >
        Add Customer
      </v-btn>
    </div>

    <!-- Empty -->
    <template v-if="!filteredCustomers.length">
      <v-sheet rounded="lg" class="pa-8 text-center" border>
        <v-icon icon="mdi-account-group-outline" size="48" color="grey-lighten-1" class="mb-3" />
        <p class="text-body-1 text-grey-darken-1">No customers found</p>
      </v-sheet>
    </template>

    <!-- Cards grid -->
    <template v-else>
      <v-row class="customer-grid" dense>
        <v-col
          v-for="c in filteredCustomers"
          :key="c.id"
          cols="12"
          md="6"
        >
          <v-card class="customer-card" rounded="xl" elevation="1">
            <v-card-text class="pa-5">
              <div class="d-flex justify-space-between align-start mb-3">
                <div class="d-flex align-center" style="gap: 10px">
                  <v-avatar color="primary" size="40">
                    <span class="text-white text-body-2 font-weight-bold">
                      {{ getInitials(c.name) }}
                    </span>
                  </v-avatar>
                  <div>
                    <p class="text-body-1 font-weight-semibold mb-1">
                      {{ c.name || 'Customer' }}
                    </p>
                    <p class="text-caption text-grey-darken-1">
                      Joined {{ new Date(c.createdAt).toLocaleDateString('en-AE', { month: 'short', year: 'numeric' }) }}
                    </p>
                  </div>
                </div>
                <div class="d-flex align-center" style="gap: 4px">
                  <v-btn icon variant="text" size="small" color="grey-darken-1" @click.stop="handleEdit(c)">
                    <v-icon icon="mdi-pencil-outline" size="18" />
                  </v-btn>
                  <v-btn icon variant="text" size="small" color="red-darken-1" @click.stop="handleDelete(c)">
                    <v-icon icon="mdi-delete-outline" size="18" />
                  </v-btn>
                </div>
              </div>

              <div class="customer-details mb-3">
                <p v-if="c.email" class="text-caption text-grey-darken-2 d-flex align-center mb-1">
                  <v-icon icon="mdi-email-outline" size="16" class="mr-1" />
                  {{ c.email }}
                </p>
                <p v-if="c.phone" class="text-caption text-grey-darken-2 d-flex align-center mb-1">
                  <v-icon icon="mdi-phone" size="16" class="mr-1" />
                  {{ c.phone }}
                </p>
                <p v-if="c.address" class="text-caption text-grey-darken-2 d-flex align-center mb-1">
                  <v-icon icon="mdi-map-marker-outline" size="16" class="mr-1" />
                  {{ c.address }}
                </p>
                <p v-if="c.pets && c.pets.length" class="text-caption text-grey-darken-2 d-flex align-center mb-1">
                  <v-icon icon="mdi-paw" size="16" class="mr-1" />
                  <span>
                    Pets:
                    <span v-for="(p, index) in c.pets" :key="index">
                      {{ p.name }}
                      <span v-if="p.breed && p.breed.toLowerCase() !== 'unknown'">
                        ({{ p.breed }})
                      </span>
                      <span v-if="index < c.pets.length - 1">, </span>
                    </span>
                  </span>
                </p>
              </div>

              <div class="d-flex align-center mt-3" style="gap: 16px">
                <div class="stat-chip">
                  <p class="text-caption text-grey-darken-1 mb-1">Total Visits</p>
                  <p class="text-body-2 font-weight-semibold mb-0 text-grey-darken-4">
                    {{ c.visitsCount ?? 0 }}
                  </p>
                </div>
                <div class="stat-chip">
                  <p class="text-caption text-grey-darken-1 mb-1">Spent</p>
                  <p class="text-body-2 font-weight-semibold mb-0 text-grey-darken-4">
                    AED {{ (c.totalSpent ?? 0).toLocaleString('en-AE', { maximumFractionDigits: 0 }) }}
                  </p>
                </div>
                <v-spacer />
                <v-btn
                  variant="text"
                  size="small"
                  class="text-none"
                  color="primary"
                  :to="`/smoll-home/visits/add`"
                >
                  New Visit
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Add Customer Dialog -->
    <v-dialog v-model="addDialog" max-width="520">
      <v-card rounded="xl">
        <v-card-title class="px-5 pt-5 pb-2">
          <h3 class="text-h6 font-weight-bold">Add Customer</h3>
        </v-card-title>
        <v-card-text class="px-5 pb-4 d-flex flex-column" style="gap: 12px">
          <v-text-field
            v-model="formData.fullName"
            label="Full Name"
            required
            density="comfortable"
            variant="outlined"
          />
          <v-text-field
            v-model="formData.email"
            label="Email"
            type="email"
            density="comfortable"
            variant="outlined"
          />
          <v-text-field
            v-model="formData.phone"
            label="Phone"
            density="comfortable"
            variant="outlined"
          />
          <v-text-field
            v-model="formData.address"
            label="Address"
            density="comfortable"
            variant="outlined"
          />
          <v-text-field
            v-model="formData.petInfo"
            label="Pet Name & Breed"
            density="comfortable"
            variant="outlined"
            placeholder="e.g. Milo, Golden Retriever"
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-4 d-flex justify-end" style="gap: 8px">
          <v-btn variant="outlined" color="grey-darken-1" @click="addDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="handleSave">
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useVetMembersStore } from '@/stores/vet-members'
import { toast } from 'vue3-toastify'

const vetMembersStore = useVetMembersStore()

const search = ref('')
const addDialog = ref(false)
const editingId = ref<string | null>(null)

const formData = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  petInfo: ''
})

const customers = ref<
  {
    id: string
    name: string | null
    phone: string | null
    email: string | null
    address: string | null
    pets?: { name: string; breed?: string }[]
  }[]
>([])

const filteredCustomers = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return customers.value
  return customers.value.filter((c) => {
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.phone || '').toLowerCase().includes(term) ||
      (c.address || '').toLowerCase().includes(term)
    )
  })
})

const getInitials = (name?: string | null) => {
  if (!name) return 'C'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const loadCustomers = async () => {
  const res = await vetMembersStore.fetchVetMembers()
  customers.value = res.data || []
}

onMounted(() => {
  loadCustomers()
})

const openAddDialog = () => {
  formData.value = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    petInfo: ''
  }
  addDialog.value = true
  editingId.value = null
}

const handleSave = async () => {
  if (!formData.value.fullName.trim()) return
  try {
    if (editingId.value) {
      await vetMembersStore.updateVetMember(editingId.value, {
        name: formData.value.fullName,
        email: formData.value.email || undefined,
        phone: formData.value.phone || undefined,
        address: formData.value.address || undefined,
        petInfo: formData.value.petInfo || undefined
      })
      toast.success('Customer updated')
    } else {
      await vetMembersStore.addVetMember({
        name: formData.value.fullName,
        email: formData.value.email || undefined,
        phone: formData.value.phone || undefined,
        address: formData.value.address || undefined,
        petInfo: formData.value.petInfo || undefined
      })
      toast.success('Customer added')
    }
    addDialog.value = false
    await loadCustomers()
  } catch (e) {
    toast.error('Failed to save customer')
  }
}

const handleEdit = (customer: any) => {
  formData.value = {
    fullName: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    // Pre-fill pet info from first pet (if available) so it feels "saved"
    petInfo:
      customer.pets && customer.pets.length
        ? `${customer.pets[0].name || ''}${
            customer.pets[0].breed ? `, ${customer.pets[0].breed}` : ''
          }`
        : ''
  }
  editingId.value = customer.id
  addDialog.value = true
}

const handleDelete = (customer: any) => {
  if (!confirm(`Delete customer "${customer.name}"?`)) return
  vetMembersStore
    .deleteVetMember(customer.id)
    .then(async () => {
      toast.success('Customer deleted')
      await loadCustomers()
    })
    .catch(() => {
      toast.error('Failed to delete customer')
    })
}
</script>

<style scoped>
.customer-item {
  border-bottom: 1px solid #eceff1;
}

.customer-item:last-of-type {
  border-bottom: none;
}

.customer-card {
  border: 1px solid #e3e7f0;
  transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
}

.customer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
  border-color: #bbdefb;
}

.stat-chip {
  padding: 6px 10px;
  border-radius: 10px;
  background-color: #f5f7fa;
  min-width: 90px;
}
</style>

