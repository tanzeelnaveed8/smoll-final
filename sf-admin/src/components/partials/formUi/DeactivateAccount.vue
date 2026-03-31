<template>
  <v-divider v-if="type === 'vet'" color="#D0D7DC" class="opacity-100" />
  <v-sheet
    class="py-8 px-6 d-flex flex-column gr-4"
    style="border: 1px solid #c62424; border-radius: 12px"
  >
    <v-sheet>
      <h4 class="text-body-1 text-grey1" style="font-weight: 600">Danger Zone</h4>
    </v-sheet>
    <v-btn
      color="#c62424"
      density="comfortable"
      class="px-2 align-self-start"
      style="letter-spacing: 0px"
      :loading
      :disabled="loading"
      @click="handleDeactivateUser"
      >Account deactivate</v-btn
    >
  </v-sheet>
</template>

<script lang="ts" setup>
import useMitt from '@/functions/useMitt'
import { usePartnerStore } from '@/stores/partner'
import { useVeterniansStore } from '@/stores/veternians'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const props = defineProps<{
  id: string
  type: 'vet' | 'partner'
}>()

const partnerStore = usePartnerStore()
const vetStore = useVeterniansStore()
const loading = ref(false)
const { emitter } = useMitt()
const router = useRouter()

const suspendUser = async (id: string) => {
  try {
    loading.value = true
    if (props.type === 'vet') {
      await vetStore.suspendVet(id)
    } else {
      await partnerStore.suspendPartner(id)
    }
  } finally {
    loading.value = false
  }
}

const handleDeactivateUser = async (e: MouseEvent) => {
  await suspendUser(props.id)
  toast.success('Account deactivated successfully')
  emitter.emit('table-view:update')
  router.back()
}
</script>

<style lang="scss" scoped></style>
