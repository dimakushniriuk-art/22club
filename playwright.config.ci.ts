import { defineConfig, devices } from '@playwright/test'

/**
 * Configurazione Playwright per CI/CD
 * Ottimizzata per esecuzione in ambiente CI
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60 * 1000, // Timeout più lungo per CI
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2, // Retry automatico su CI
  workers: 2, // Parallelismo limitato per CI
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Solo Chromium su CI per velocità */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3001',
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
})
