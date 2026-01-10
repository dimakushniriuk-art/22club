import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'fs'
import { join } from 'path'

/**
 * Configurazione Playwright per test E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Timeout per ogni test - ridotto da 30s a 20s */
  timeout: 20 * 1000,
  expect: {
    /* Timeout per expect assertions - ridotto da 5s a 3s */
    timeout: 3000,
  },
  /* Esegui test in parallelo */
  fullyParallel: true,
  /* Fail build su CI se lasciato accidentalmente focused */
  forbidOnly: !!process.env.CI,
  /* Retry su CI solo */
  retries: process.env.CI ? 2 : 0,
  /* Workers: 2 in locale per parallelismo, 1 su CI per stabilità */
  workers: process.env.CI ? 1 : 2,
  /* Reporter da usare */
  reporter: [['html'], ['list'], process.env.CI ? ['github'] : ['list']],
  /* Shared settings per tutti i progetti */
  use: {
    /* Base URL da usare per le azioni come `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    /* Raccogli trace quando si riprova un test fallito */
    trace: 'on-first-retry',
    /* Screenshot solo quando fallisce */
    screenshot: 'only-on-failure',
    /* Video solo quando fallisce */
    video: 'retain-on-failure',
  },

  /* Configura progetti per browser */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Riutilizza lo stato di autenticazione per evitare login ripetuti (opzionale)
        // Se il file non esiste, Playwright continuerà senza storageState
        storageState: (() => {
          const path = 'tests/e2e/.auth/athlete-auth.json'
          try {
            if (existsSync(join(process.cwd(), path))) {
              return path
            }
          } catch {
            // Ignora errori
          }
          return undefined
        })(),
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test su dispositivi mobili */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Setup globale prima di eseguire i test */
  globalSetup: './tests/e2e/global-setup-auth.ts',

  /* Server di sviluppo da avviare per i test */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // Aumentato a 3 minuti per dare più tempo al server
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
