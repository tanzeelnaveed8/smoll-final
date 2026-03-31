<template>
  <v-sheet class="d-flex flex-column gr-3">
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">Name</p>
      <v-text-field
        v-model="account.name"
        type="text"
        :disabled="actionLoading"
        hide-details="auto"
        class="text-field mt-2 text-grey1"
        placeholder="Name"
        :rules="rules.name"
      />
    </v-sheet>
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">Qualifications</p>
      <v-text-field
        v-model="account.designation"
        type="text"
        :disabled="actionLoading"
        hide-details="auto"
        class="text-field mt-2 text-grey1"
        placeholder="Qualifications"
        :rules="rules.designation"
      />
    </v-sheet>
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">DOB</p>
      <v-sheet class="d-flex mt-2 align-start">
        <v-select
          v-model="account.dob.date"
          menu-icon="$tb-chevron-down"
          :disabled="actionLoading"
          hide-details="auto"
          class="num-prefix-select select"
          placeholder="Date"
          :items="daysOfMonth"
          max-width="33.333%"
          :rules="rules.date"
        />
        <v-select
          v-model="account.dob.month"
          max-width="33.333%"
          :disabled="actionLoading"
          menu-icon="$tb-chevron-down"
          hide-details="auto"
          placeholder="Month"
          class="dob-select-month select"
          :items="months"
          :rules="rules.month"
        />
        <v-text-field
          v-model="account.dob.year"
          max-width="33.333%"
          type="number"
          :disabled="actionLoading"
          hide-details="auto"
          class="dob-field-year"
          placeholder="Year"
          :rules="rules.year"
        />
      </v-sheet>
    </v-sheet>
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">Address</p>
      <v-text-field
        v-model="account.address"
        type="text"
        :disabled="actionLoading"
        hide-details="auto"
        class="text-field mt-2 text-grey1"
        placeholder="Address"
        :rules="rules.address"
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
      <p style="font-weight: 600" class="text-body-1">Timezone</p>
      <v-select
        v-model="account.timeZone"
        menu-icon="$tb-chevron-down"
        hide-details="auto"
        :disabled="actionLoading"
        :menu-props="{ offset: '10px' }"
        placeholder="Timezone"
        class="mt-2 select"
        :items="timezone"
        :rules="rules.timeZone"
      ></v-select>
    </v-sheet>
    <v-sheet>
      <p style="font-weight: 600" class="text-body-1">Phone</p>
      <v-text-field
        v-model="account.phone"
        type="text"
        :disabled="actionLoading"
        hide-details="auto"
        class="text-field mt-2 text-grey1 text-field-phone"
        placeholder="Phone number"
        :rules="rules.phone"
      >
      </v-text-field>
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
 

  </v-sheet>
</template>

<script lang="ts" setup>
import { ref, watch, watchEffect } from 'vue'
import { countries, daysOfMonth, months, timezone } from '@/util/constant'
import { getDateObject } from '@/util/helpers'
import dayjs from 'dayjs'
import type { Vets } from '@/stores/types/veternians'

enum VetSpecialties {
  PET_NUTRITION = 'Pet Nutrition',
  PET_BEHAVIOURS = 'Pet Behaviours',
  // OPHTHALMOLOGY = 'Ophthalmology',
  // ORTHOPEDIC = 'Orthopedic',
  GENERAL = 'General'
}

const props = defineProps<{
  formDetails?: Vets
  actionLoading: boolean
}>()

const emit = defineEmits<{
  (events: 'updateDetails', vetDetails: {}): void
}>()



const specialtiesOptions = Object.values(VetSpecialties)

const toggleSpecialty = (specialty: VetSpecialties) => {
  const index = account.value.specialties.indexOf(specialty)
  if (index === -1) {
    account.value.specialties.push(specialty)
  } else {
    account.value.specialties.splice(index, 1)
  }
}

const account = ref<any>({
  name: '',
  designation: '',
  email: '',
  address: '',
  country: null,
  timeZone: null,
  phone: '',
  dob: { date: null, month: null, year: null },
  byAppointmentOnly: false
})



const rules = ref({
  name: [(v: string) => v?.length > 0 || 'Name is required.'],
  designation: [(v: string) => v?.length > 0 || 'Designation is required.'],
  address: [(v: string) => v?.length > 0 || 'Address is required.'],
  country: [(v: string) => v?.length > 0 || 'Country is required.'],
  timeZone: [(v: string) => v?.length > 0 || 'Timezone is required.'],
  phone: [
    (v: string) => /^\+?\d{11,13}$/.test(v) || 'Please enter a valid phone number.',
    (v: string) => v.includes('+') || 'Add + with country code at the beginning'
  ],
  email: [
    (v: string) =>
      /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(v) || 'Please enter a valid email address.'
  ],
  yearsOfExperience: [(v: number) => v > 0 || 'Years of experience is required.'],
  date: [(v: string) => v?.length > 0 || 'Date required.'],
  month: [(v: string) => v?.length > 0 || 'Month required.'],
  year: [
    (v: string) => v?.length > 0 || 'Year required.',
    (v: string) => v?.length <= 4 || 'Invalid year.'
  ]
})

watchEffect(() => {
  const formDetails = props?.formDetails
  if (formDetails) {
    const dob = getDateObject(formDetails?.dob)
    const country = formDetails?.country ? formDetails.country.charAt(0).toUpperCase() + formDetails.country.slice(1) : ''

    account.value = {
      ...account.value,
      ...formDetails,
      dob,
      country,
      specialties: formDetails.specialties ?? [] // 👈 keep in sync
    }
  }
})


watch(
  () => account.value,
  (v) => {
    const month = new Date(Date.parse(v.dob.month + ' 1, 2021')).getMonth()
    const date = new Date(Number(v.dob.year), month, Number(v.dob?.date))

    const { profileImg, documents, ...account } = v
    const accountDetails = {
      ...account,
      dob: dayjs(date).isValid() ? dayjs(date).toISOString() : null,
      specialties: v.specialties ?? [] // ✅ preserve
    }

    emit('updateDetails', accountDetails)
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
    border-top-right-radius: 0px;
    border-top-left-radius: 8px !important;

    border-bottom-right-radius: 0px;
    border-bottom-left-radius: 8px !important;
  }
  &:deep(.v-field__input) {
    padding-right: 2px !important;
  }
}

.dob-select-month:deep(.v-field) {
  border-radius: 0px;
}

.dob-field-year {
  &:deep(.v-field) {
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
  }

  &:deep(.v-field__input) {
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
}

.select {
  &:deep(.v-field__input) {
    opacity: 1 !important;
  }
  &:deep(.v-select__selection-text) {
    color: #222 !important;
  }
}

.specialty-chip {
  border-radius: 100px !important;
  padding: 0 16px !important;
  height: 36px !important;
  font-size: 14px !important;
  border: 1px solid #E0E0E0 !important;
  background-color: white !important;
  cursor: pointer !important;
  transition: all 0.2s ease;

  &.selected {
    border: none !important;
    background-color: #000000 !important;
    color: white !important;
  }

  &:hover {
    opacity: 0.9;
  }
}

.custom-switch {
  &:deep(.v-switch__track) {
    background-color: #E0E0E0;
    opacity: 1;
    border: none;
  }

  &:deep(.v-switch__thumb) {
    background-color: white;
    color: white;
  }

  &:deep(.v-switch--inset .v-switch__track) {
    height: 24px;
    width: 48px;
  }

  &:deep(.v-switch--inset .v-switch__thumb) {
    height: 20px;
    width: 20px;
  }

  &:deep(.v-switch__track--active) {
    background-color: #4477F7 !important;
    opacity: 1 !important;
  }
}
</style>
