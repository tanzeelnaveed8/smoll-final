import './assets/global.css'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import 'vue3-toastify/dist/index.css'

import App from './App.vue'
import router from './router'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'

import { config } from './vuetify/vuetify.config'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'

import * as Sentry from '@sentry/vue'

const app = createApp(App)

const vuetify = createVuetify(config)

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

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration({ router }), Sentry.replayIntegration()],
  enabled: import.meta.env.MODE === 'production',
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Capture Replay for 10% of all sessions,plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})

app.mount('#app')
