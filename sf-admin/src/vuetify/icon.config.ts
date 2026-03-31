import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import IconMail from '@/components/icons/IconMail.vue'
import IconEye from '@/components/icons/IconEye.vue'

import type { IconAliases } from 'vuetify'
import { aliases as defaultAliases } from 'vuetify/iconsets/mdi'
import IconEyeOff from '@/components/icons/IconEyeOff.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconSmartHome from '@/components/icons/IconSmartHome.vue'
import IconUsers from '@/components/icons/IconUsers.vue'
import IconHeartHandshake from '@/components/icons/IconHeartHandshake.vue'
import IconWritingSign from '@/components/icons/IconWritingSign.vue'
import IconFirstaidKit from '@/components/icons/IconFirstAidKit.vue'
import IconLayoutSidebar from '@/components/icons/IconLayoutSidebar.vue'
import IconSquare from '@/components/icons/IconSquare.vue'
import IconSquareCheck from '@/components/icons/IconSquareCheck.vue'
import IconCircleArrowUpRight from '@/components/icons/IconCircleArrowUpRight.vue'
import IconStar from '@/components/icons/IconStar.vue'
import IconBolt from '@/components/icons/IconBolt.vue'
import IconDotVerticle from '@/components/icons/IconDotVerticle.vue'
import IconSelector from '../components/icons/IconSelector.vue'
import IconCheck from '@/components/icons/IconCheck.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import IconArrowLeft from '@/components/icons/IconArrowLeft.vue'
import IconChevronDown from '@/components/icons/IconChevronDown.vue'
import IconCloudUpload from '@/components/icons/IconCloudUpload.vue'
import IconX from '@/components/icons/IconX.vue'
import IconFileCertificate from '@/components/icons/IconFileCertificate.vue'
import IconRosetteDiscountCheck from '@/components/icons/IconRosetteDiscountCheck.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconUser from '@/components/icons/IconUser.vue'
import IconMinusVerticle from '@/components/icons/IconMinusVerticle.vue'
import IconReload from '@/components/icons/IconReload.vue'
import IconUserCircle from '@/components/icons/IconUserCircle.vue'
import IconCircleCheckFilled from '@/components/icons/IconCircleCheckFilled.vue'
import IconCircleCheck from '@/components/icons/IconCircleCheck.vue'
import IconBuilding from '@/components/icons/IconBuilding.vue'
import IconOrganizations from '@/components/icons/IconOrganizations.vue'  
import IconSettings from '@/components/icons/IconSettings.vue'

// Import your custom icon components

const aliases: IconAliases = {
  ...defaultAliases,
  // Map your icon names to the custom names you'll use in your application
  checkboxOff: IconSquare,
  checkboxOn: IconSquareCheck,
  dropdown: IconSelector,
  'tb-arrow-right': IconArrowRight,
  'tb-mail': IconMail,
  'tb-eye': IconEye,
  'tb-eyeoff': IconEyeOff,
  'tb-plus': IconPlus,
  'tb-smart-home': IconSmartHome,
  'tb-first-aid-kit': IconFirstaidKit,
  'tb-users': IconUsers,
  'tb-heart-handshake': IconHeartHandshake,
  'tb-writing-sign': IconWritingSign,
  'tb-layout-sidebar': IconLayoutSidebar,
  'tb-circle-arrow-up-right': IconCircleArrowUpRight,
  'tb-star': IconStar,
  'tb-bolt': IconBolt,
  'tb-dot-verticle': IconDotVerticle,
  'tb-check': IconCheck,
  'tb-search': IconSearch,
  'tb-arrow-left': IconArrowLeft,
  'tb-chevron-down': IconChevronDown,
  'tb-cloud-upload': IconCloudUpload,
  'tb-x': IconX,
  'tb-file-certificate': IconFileCertificate,
  'tb-rosette-discount-check': IconRosetteDiscountCheck,
  'tb-chevron-right': IconChevronRight,
  'tb-chevron-left': IconChevronLeft,
  'tb-user': IconUser,
  'tb-minus-verticle': IconMinusVerticle,
  'tb-reload': IconReload,
  'tb-user-circle': IconUserCircle,
  'tb-circle-check': IconCircleCheck,
  'tb-circle-check-filled': IconCircleCheckFilled,
  'tb-building': IconBuilding,
  'tb-organizations': IconOrganizations,
  'tb-settings': IconSettings,
}

export { aliases }
