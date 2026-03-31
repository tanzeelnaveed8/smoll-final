import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './assets/global.css'

import App from './App.vue'
import router from './router'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { md2 } from 'vuetify/blueprints'

import 'vue3-toastify/dist/index.css'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

const vuetify = createVuetify({
  defaults: {
    global: { ripple: false },
    VBtn: { rounded: 'pill' },
    VTextField: { variant: 'solo-filled', elevation: 0, flat: true, density: 'comfortable', persistentHint: true },
    VSelect: { variant: 'solo-filled', flat: true, elevation: 0, density: 'comfortable' },
    VTextarea: { variant: 'solo-filled', flat: true }
  },
  blueprint: md2,
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#0D6EFD',
          secondary: '#6C757D',
          success: '#198754',
          error: '#DC3545',
          warning: '#FFC107',
          info: '#0DCAF0',
          background: '#F8FAFB',
          surface: '#FFFFFF'
        }
      }
    }
  }
})

const app = createApp(App)

dayjs.extend(relativeTime)

app.use(Vue3Toastify, {
  theme: 'dark',
  position: 'top-right',
  pauseOnFocusLoss: false,
  transition: 'slide',
  autoClose: 3000,
  hideProgressBar: true,
  dangerouslyHTMLString: true,
  closeButton: false
} as ToastContainerOptions)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
