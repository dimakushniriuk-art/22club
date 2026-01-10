import { Page, BrowserContext } from '@playwright/test'

/**
 * Credenziali reali per i test E2E
 * NOTA: Queste sono credenziali reali del sistema di produzione/test
 */
export const TEST_CREDENTIALS = {
  athlete: {
    email: 'dima.kushniriuk@gmail.com',
    password: 'dimon280894',
  },
  pt: {
    email: 'b.francesco@22club.it',
    password: 'FrancescoB',
  },
  admin: {
    email: 'admin@22club.it',
    password: 'adminadmin',
  },
} as const

/**
 * Helper per fare login come atleta
 */
export async function loginAsAthlete(page: Page): Promise<void> {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // I campi hanno id="email" e id="password"
  await page.fill('#email', TEST_CREDENTIALS.athlete.email)
  await page.fill('#password', TEST_CREDENTIALS.athlete.password)

  // Cerca il pulsante di submit
  await page.click('button[type="submit"]')
  await page.waitForURL('**/home', { timeout: 10000 })
}

/**
 * Helper per fare login come Personal Trainer
 */
export async function loginAsPT(page: Page): Promise<void> {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // I campi hanno id="email" e id="password"
  await page.fill('#email', TEST_CREDENTIALS.pt.email)
  await page.fill('#password', TEST_CREDENTIALS.pt.password)

  // Cerca il pulsante di submit
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 10000 })
}

/**
 * Helper per fare login come Admin
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // I campi hanno id="email" e id="password"
  await page.fill('#email', TEST_CREDENTIALS.admin.email)
  await page.fill('#password', TEST_CREDENTIALS.admin.password)

  // Cerca il pulsante di submit
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard', { timeout: 10000 })
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
