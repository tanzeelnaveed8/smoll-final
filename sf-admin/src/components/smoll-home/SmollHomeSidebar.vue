<template>
  <v-navigation-drawer
    :model-value="drawer"
    @update:model-value="$emit('update:drawer', $event)"
    :permanent="!isMobile"
    :temporary="isMobile"
    width="268"
    class="vet-sidebar"
    :style="!isMobile ? 'position: fixed' : ''"
  >
    <template #prepend>
      <div class="sidebar-header">
        <div class="d-flex align-center" style="gap: 12px">
          <v-avatar color="#1565C0" size="40" rounded="lg" class="sidebar-avatar">
            <v-icon icon="mdi-shield-crown" color="white" size="22" />
          </v-avatar>
          <div>
            <span class="sidebar-title">Vet Admin</span>
            <p class="sidebar-subtitle">Management Portal</p>
          </div>
        </div>
      </div>
    </template>

    <v-list density="compact" nav color="transparent" class="px-3 mt-1">
      <v-list-item
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        active-class="vet-sidebar--active"
        class="vet-sidebar--link mb-1"
        rounded="lg"
        @click="isMobile && $emit('update:drawer', false)"
      >
        <v-list-item-title class="nav-label">{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <template #append>
      <div class="pa-4">
        <v-divider class="mb-3" />
        <v-btn
          variant="tonal"
          color="#1565C0"
          block
          class="justify-start back-btn"
          prepend-icon="mdi-arrow-left-circle-outline"
          to="/"
          rounded="lg"
        >
          Back to Admin
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

defineProps<{ drawer: boolean }>()
defineEmits<{ 'update:drawer': [value: boolean] }>()

const { mdAndUp } = useDisplay()
const isMobile = computed(() => !mdAndUp.value)

const navItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/smoll-home' },
  { title: 'Services', icon: 'mdi-medical-bag', to: '/smoll-home/services' },
  { title: 'Products', icon: 'mdi-package-variant-closed', to: '/smoll-home/products' },
  { title: 'Orders', icon: 'mdi-format-list-checks', to: '/smoll-home/orders' },
  { title: 'Customers', icon: 'mdi-account-group', to: '/smoll-home/customers' },
  { title: 'Veterinaries', icon: 'mdi-stethoscope', to: '/smoll-home/veterinarians' },
  { title: 'Finance', icon: 'mdi-chart-line', to: '/smoll-home/finance' }
]
</script>

<style lang="scss" scoped>
.vet-sidebar {
  border-right: 1px solid #e0e8f0 !important;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%) !important;
}

.sidebar-header {
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e8edf5;
  background: linear-gradient(135deg, #e3f0ff 0%, #f0f7ff 100%);
}

.sidebar-avatar {
  box-shadow: 0 2px 8px rgba(21, 101, 192, 0.25);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: #1565C0;
  display: block;
  line-height: 1.2;
}

.sidebar-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: #78909c;
  margin: 0;
}

.nav-label {
  font-weight: 600 !important;
  font-size: 13.5px !important;
}

.vet-sidebar--link {
  transition: all 0.2s ease;

  &:deep(.v-list-item__prepend) {
    .v-icon {
      margin-right: 12px;
      opacity: 0.7;
      font-size: 20px;
      color: #546e7a;
    }
    .v-list-item__spacer {
      display: none;
    }
  }

  &:hover {
    background-color: #e8f1fb !important;
  }
}

.vet-sidebar--active {
  color: #1565C0 !important;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
  box-shadow: 0 2px 8px rgba(21, 101, 192, 0.12);

  &:deep(.v-list-item__prepend .v-icon) {
    opacity: 1;
    color: #1565C0;
  }
}

.vet-sidebar--active:deep(.v-list-item__overlay) {
  opacity: 0 !important;
}

.back-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}
</style>
