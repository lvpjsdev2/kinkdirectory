import { configDefaults, defineConfig } from 'vitest/config'

// The projection seam is pure TypeScript: it needs neither the Vue plugin nor
// any browser environment, so the tests run in its own config rather than
// loading the application build pipeline. The application-level smoke scenario
// mounts the real application and therefore has its own config
// (vitest.smoke.config.ts); it is excluded here so it is not run without a DOM.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: [...configDefaults.exclude, 'src/**/*.smoke.test.ts'],
  },
})
