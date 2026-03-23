import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

config({ path: '.env.local' })

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
  workers: 1, // Allineato a playwright.config.ts su CI (storageState condiviso / stabilità auth)
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
    extraHTTPHeaders: {
      'X-Test-Mode': 'true',
    },
  },

  /* Solo Chromium su CI per velocità */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  globalSetup: require.resolve('./tests/e2e/global-setup-auth.ts'),

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3001',
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
})
