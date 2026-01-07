import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/animation/**/*.ts'],
      exclude: ['src/**/__tests__/**', 'src/**/*.d.ts'],
    },
  },
  // Disable CSS processing to avoid PostCSS config issues from parent directory
  css: {
    postcss: {},
  },
});
