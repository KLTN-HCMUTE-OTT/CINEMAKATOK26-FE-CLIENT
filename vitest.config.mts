import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    css: false,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 60,
      }
    }
  }
});
