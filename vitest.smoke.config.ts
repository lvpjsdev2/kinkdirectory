import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

// The application-level smoke scenario runs the real application: it mounts
// `src/App.vue` with the application's own plugins and drives the rendered DOM.
// That needs the application's build pipeline (Vue, Tailwind, Nuxt UI) and a
// DOM, so it lives in its own config instead of the pure-projection one.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: 'smoke',
      environment: 'happy-dom',
      // A desktop viewport so the screen renders the desktop List and its
      // in-row Choice buttons, which is what a person on a desktop sees.
      environmentOptions: {
        happyDOM: { width: 1440, height: 900 },
      },
      include: ['src/**/*.smoke.test.ts'],
    },
  }),
)
