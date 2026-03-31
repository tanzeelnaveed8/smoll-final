<template>
  <v-sheet class="d-flex flex-column gr-3">
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">Clinic Name</p>
      <v-text-field
        v-model="account.name"
        type="email"
        :disabled="actionLoading"
        hide-details="auto"
        class="text-field mt-2 text-grey1"
        placeholder="Name"
        :rules="rules.name"
      />
    </v-sheet>
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">Receptionist name</p>
      <v-text-field
        v-model="account.receptionistName"
        type="text"
        :disabled="actionLoading"
        hide-details="auto"
        class="text-field mt-2 text-grey1"
        placeholder="Reciptionist name"
        :rules="rules.receptionistName"
      />
    </v-sheet>
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">Email address</p>
      <v-text-field
        v-model="account.email"
        type="email"
        :disabled="actionLoading"
        hide-details="auto"
        class="text-field mt-2 text-grey1"
        placeholder="Email address"
        :rules="rules.email"
        append-inner-icon="$tb-mail"
      />
    </v-sheet>
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">Clinic Address</p>
      <v-text-field
        v-model="account.address"
        type="text"
        :disabled="actionLoading"
        hide-details="auto"
        class="text-field mt-2 text-grey1"
        placeholder="Clinic address"
        :rules="rules.address"
      />
    </v-sheet>
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">City</p>
      <v-text-field
        v-model="account.city"
        type="text"
        :disabled="actionLoading"
        hide-details="auto"
        class="text-field mt-2 text-grey1"
        placeholder="City"
        :rules="rules.city"
      />
    </v-sheet>
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">Country</p>
      <v-select
        v-model="account.country"
        menu-icon="$tb-chevron-down "
        :disabled="actionLoading"
        hide-details="auto"
        :menu-props="{ offset: '10px' }"
        placeholder="Country"
        class="mt-2 select"
        :items="countries"
        :rules="rules.country"
      ></v-select>
    </v-sheet>
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">Time Zone</p>
      <v-select
        v-model="account.timeZone"
        menu-icon="$tb-chevron-down"
        :disabled="actionLoading"
        hide-details="auto"
        :menu-props="{ offset: '10px' }"
        placeholder="Timezone"
        class="mt-2"
        :items="timezone"
        :rules="rules.timeZone"
      ></v-select>
    </v-sheet>
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">Phone Number</p>
      <v-text-field
        v-model="account.phone"
        type="email"
        :disabled="actionLoading"
        hide-details="auto"
        class="text-field mt-2 text-grey1 text-field-phone"
        placeholder="Phone number"
        :rules="rules.phone"
      >
      </v-text-field>
    </v-sheet>

    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">Add specialities</p>
      <v-select
        v-model="account.specialities"
        class="mt-2"
        :items="allSpecialities"
        item-title="name"
        return-object
        placeholder="Select Specialities"
        hide-details="auto"
        :menu-props="{ offset: '10px' }"
        menu-icon="$tb-chevron-down"
        hide-selected
        multiple
      >
        <template v-slot:selection="{ item }">
          <v-chip>
            <span>{{ item.raw?.name }}</span>
          </v-chip>
        </template>
      </v-select>
    </v-sheet>
  </v-sheet>
</template>

<script lang="ts" setup>
import { ref, watch, watchEffect } from 'vue'
import { countries, timezone } from '@/util/constant'
import type { Partner } from '@/stores/types/partner'

const props = defineProps<{
  formDetails?: Partner
  actionLoading: boolean
}>()

const emit = defineEmits<{
  (events: 'updateDetails', partnerDetails: {}): void
}>()

const allSpecialities = ref([])

const account = ref<any>({
  name: '',
  receptionistName: '',
  email: '',
  address: '',
  city: '',
  country: null,
  timeZone: null,
  phone: '',
  specialities: []
})

const rules = ref({
  name: [(v: string) => v?.length > 0 || 'Name is required.'],
  receptionistName: [(v: string) => v?.length > 0 || 'Receptionist name is required.'],
  email: [
    (v: string) =>
      /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(v) || 'Please enter a valid email address.'
  ],
  address: [(v: string) => v?.length > 0 || 'Address is required.'],
  city: [(v: string) => v?.length > 0 || 'City is required.'],
  country: [(v: string) => v?.length > 0 || 'Country is required.'],
  timeZone: [(v: string) => v?.length > 0 || 'Timezone is required.'],
  phone: [
    (v: string) => /^\+?\d{11,13}$/.test(v) || 'Please enter a valid phone number.',
    (v: string) => v.includes('+') || 'Add + with country code at the beginning'
  ]
})

watchEffect(() => {
  const formDetails = props?.formDetails
  if (props.formDetails) account.value = { ...account.value, ...formDetails }
})

watch(
  () => account.value,
  (v) => {
    const { clinicImg, documents, ...account } = v
    const specialities = v.specialities.map((item: { name: string }) => item.name)

    emit('updateDetails', { ...account, specialities })
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.text-field:deep(.v-input__prepend) {
  margin: 0px;
}

.num-prefix-select {
  &:deep(.v-field) {
    background-color: white;
  }
  &:deep(.v-field__input) {
    padding-right: 2px !important;
  }
}

.dob-select-month:deep(.v-field) {
  border-radius: 0px;
}

.dob-field-year:deep(.v-field) {
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
}
</style>
