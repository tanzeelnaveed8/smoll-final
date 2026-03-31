import { sentryVitePlugin } from "@sentry/vite-plugin";
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5174,
    proxy: {
      '/admin': { target: 'http://localhost:3000', changeOrigin: true },
      '/files': { target: 'http://localhost:3000', changeOrigin: true },
      '/specialities': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  plugins: [vue(), Vuetify({
    autoImport: true,
    styles: {
      configFile: 'src/vuetify/styles/settings.scss'
    }
  }), sentryVitePlugin({
    org: "smoll-lo",
    project: "smoll-admin"
  })],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  build: {
    sourcemap: true
  }
})