<template>
  <v-navigation-drawer permanent width="272" class="side-nav position-fixed">
    <template v-slot:prepend>
      <v-img src="/smoll.png" height="22" width="80" class="mx-8 mb-6 mt-9" />
    </template>
    <v-list color="transparent">
      <v-list-item
        v-for="(item, i) in navItems"
        :key="i"
        :prepend-icon="item.icon"
        :active="item.to === '/' ? $route.path === '/' : undefined"
        :to="item.to"
        active-class="side-nav--active"
        class="pl-8 side-nav--link text-grey1"
        style="font-weight: 600"
      >
        {{ item.title }}
      </v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="mb-5">
        <v-divider />
        <v-btn
          variant="plain"
          color="alert"
          height="auto"
          @click="handleLogout"
          class="text-body-1 opacity-100 px-8 py-3 w-100 justify-start"
          style="font-weight: 600; line-height: 24px"
        >
          <template v-slot:prepend>
            <v-icon icon="$tb-layout-sidebar" size="24" class="mr-1" />
          </template>
          Logout
        </v-btn>
        <p class="px-9 text-body-2" style="font-weight: 600">V 2.0</p>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const navItems = [
  { title: 'Home', icon: '$tb-smart-home', to: '/' },
  { title: 'smoll®Home', icon: '$tb-heart-handshake', to: '/smoll-home' },
  { title: 'Experts', icon: '$tb-first-aid-kit', to: '/experts' },
  { title: 'Members', icon: '$tb-users', to: '/members' },
  { title: 'Partner management', icon: '$tb-heart-handshake', to: '/partners' },
  { title: 'Organizations', icon: '$tb-organizations', to: '/organizations' },
  { title: 'Cases', icon: '$tb-writing-sign', to: '/visits' },
  { title: 'Settings', icon: '$tb-settings', to: '/settings' }
]

const handleLogout = async () => {
  await authStore.logout()

  router.replace('/login')
}
</script>

<style lang="scss" scoped>
.side-nav:deep(.v-navigation-drawer__content) {
  overflow: hidden;
}

.side-nav--link {
  border: none;

  &::after {
    border: none !important;
  }

  &:deep(.v-list-item-title) {
    font-weight: 600 !important;
  }
  & :deep(.v-list-item__prepend) {
    display: contents;

    .v-icon {
      margin-right: 12px;
      opacity: 1;
    }
    .v-list-item__spacer {
      display: none;
    }
  }
}

.side-nav--active {
  color: #427594 !important;
  background-color: #f1f8ff !important;
  position: relative;

  &::after {
    content: '';
    display: flex;
    border: none !important;
    width: 4px;
    height: 100%;
    background-color: #427594;
    opacity: 1;
    position: absolute;
    left: calc(100% - 4px);
    z-index: 1000;
    border-radius: 4px 0px 0px 4px;
  }
}

.side-nav--active:deep(.v-list-item__overlay) {
  opacity: 0 !important;
}
</style>
