import { createVuetify } from 'vuetify'
import { theme } from './theme.config'
import { md2 } from 'vuetify/blueprints'
import { aliases } from './icon.config'

export const config: Parameters<typeof createVuetify>[0] = {
  defaults: {
    global: {
      ripple: false
    },

    VTextField: {
      variant: 'solo-filled',
      elevation: 0,
      flat: true,
      density: 'comfortable',
      persistentHint: true
    },
    VSelect: {
      variant: 'solo-filled',
      flat: true,
      elevation: 0,
      density: 'comfortable'
    },
    VTab: {
      variant: 'plain'
    }
  },
  blueprint: md2,
  icons: {
    aliases
  },
  theme: {
    themes: {
      light: theme
    }
  }
}
