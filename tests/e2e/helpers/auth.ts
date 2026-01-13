import { Page, BrowserContext, expect } from '@playwright/test'

const getEnvOrThrow = (key: string): string => {
  const value = process.env[key]?.trim()
  if (!value) {
    throw new Error(`Variabile ${key} mancante: impostala per eseguire i test E2E`)
  }
  return value
}

export const TEST_CREDENTIALS = {
  athlete: {
    email: getEnvOrThrow('PLAYWRIGHT_ATHLETE_EMAIL'),
    password: getEnvOrThrow('PLAYWRIGHT_ATHLETE_PASSWORD'),
  },
  pt: {
    email: getEnvOrThrow('PLAYWRIGHT_TRAINER_EMAIL'),
    password: getEnvOrThrow('PLAYWRIGHT_TRAINER_PASSWORD'),
  },
  admin: {
    email: getEnvOrThrow('PLAYWRIGHT_ADMIN_EMAIL'),
    password: getEnvOrThrow('PLAYWRIGHT_ADMIN_PASSWORD'),
  },
} as const

/**
 * Helper per fare login come atleta
 */
export async function loginAsAthlete(page: Page): Promise<void> {
  await page.goto('/login')
  const emailInput = page.locator('#email')
  const passwordInput = page.locator('#password')
  await emailInput.waitFor({ state: 'visible', timeout: 10000 })
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 })

  // I campi hanno id="email" e id="password"
  await emailInput.fill(TEST_CREDENTIALS.athlete.email)
  await passwordInput.fill(TEST_CREDENTIALS.athlete.password)

  // Cerca il pulsante di submit
  await page.click('button[type="submit"]')
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {})
  await expect(page).toHaveURL(/post-login|home/, { timeout: 45000 })
}

/**
 * Helper per fare login come Personal Trainer
 */
export async function loginAsPT(page: Page): Promise<void> {
  await page.goto('/login')
  const emailInput = page.locator('#email')
  const passwordInput = page.locator('#password')
  await emailInput.waitFor({ state: 'visible', timeout: 10000 })
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 })

  // I campi hanno id="email" e id="password"
  await emailInput.fill(TEST_CREDENTIALS.pt.email)
  await passwordInput.fill(TEST_CREDENTIALS.pt.password)

  // Cerca il pulsante di submit
  await page.click('button[type="submit"]')
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {})
  await expect(page).toHaveURL(/post-login|dashboard/, { timeout: 45000 })
}

/**
 * Helper per fare login come Admin
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login')
  const emailInput = page.locator('#email')
  const passwordInput = page.locator('#password')
  await emailInput.waitFor({ state: 'visible', timeout: 10000 })
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 })

  // I campi hanno id="email" e id="password"
  await emailInput.fill(TEST_CREDENTIALS.admin.email)
  await passwordInput.fill(TEST_CREDENTIALS.admin.password)

  // Cerca il pulsante di submit
  await page.click('button[type="submit"]')
  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {})
  await expect(page).toHaveURL(/post-login|dashboard/, { timeout: 45000 })
}

/**
 * Helper per salvare lo stato di autenticazione in un file
 * Utile per riutilizzare la sessione tra test
 */
export async function saveAuthState(context: BrowserContext, filePath: string): Promise<void> {
  await context.storageState({ path: filePath })
}

/**
 * Helper per caricare lo stato di autenticazione da un file
 * Utile per riutilizzare la sessione tra test
 * NOTA: Lo stato viene caricato automaticamente quando si crea il context con storageState
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loadAuthState(_context: BrowserContext, _filePath: string): Promise<void> {
  // Lo stato viene caricato automaticamente quando si crea il context con storageState
  // Questo è solo un helper per riferimento
}
