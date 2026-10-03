import { defineConfig } from 'vitest/config'

// The projection seam is pure TypeScript: it needs neither the Vue plugin nor
// any browser environment, so the tests run in its own config rather than
// loading the application build pipeline.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
