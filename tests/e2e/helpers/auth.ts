import { Page, BrowserContext, expect } from '@playwright/test'

const getEnvOrThrow = (key: string): string => {
  const value = process.env[key]?.trim()
  if (!value) {
    throw new Error(`Variabile ${key} mancante: impostala per eseguire i test E2E`)
  }
  return value
}

const getEnvOptional = (key: string): string | undefined => process.env[key]?.trim() || undefined

export const TEST_CREDENTIALS = {
  athlete: {
    email: getEnvOrThrow('PLAYWRIGHT_ATHLETE_EMAIL'),
    password: getEnvOrThrow('PLAYWRIGHT_ATHLETE_PASSWORD'),
  },
  trainer: {
    email: getEnvOrThrow('PLAYWRIGHT_TRAINER_EMAIL'),
    password: getEnvOrThrow('PLAYWRIGHT_TRAINER_PASSWORD'),
  },
  /** @deprecated Usa trainer. Stessi valori. */
  pt: {
    email: getEnvOrThrow('PLAYWRIGHT_TRAINER_EMAIL'),
    password: getEnvOrThrow('PLAYWRIGHT_TRAINER_PASSWORD'),
  },
  admin: {
    email: getEnvOrThrow('PLAYWRIGHT_ADMIN_EMAIL'),
    password: getEnvOrThrow('PLAYWRIGHT_ADMIN_PASSWORD'),
  },
} as const

/** Credenziali marketing opzionali per test sicurezza. Se mancanti, i test marketing vengono skippati. */
export const MARKETING_CREDENTIALS: { email: string; password: string } | null = (() => {
  const email = getEnvOptional('MARKETING_TEST_EMAIL') ?? getEnvOptional('PLAYWRIGHT_MARKETING_EMAIL')
  const password = getEnvOptional('MARKETING_TEST_PASSWORD') ?? getEnvOptional('PLAYWRIGHT_MARKETING_PASSWORD')
  if (email && password) return { email, password }
  return null
})()

/**
 * Helper per chiudere il cookie banner se presente
 * Critico per Mobile Chrome/Safari dove il banner blocca i click sui form
 */
export async function dismissCookieBanner(page: Page): Promise<void> {
  try {
    // Imposta localStorage per prevenire che il banner appaia
    await page.evaluate(() => {
      localStorage.setItem('cookie-consent', 'true')
    })
    
    // Attendi un attimo per permettere al React di reagire al cambio di localStorage
    await page.waitForTimeout(200)
    
    // Prova a cliccare il bottone "Accetta tutto" se il banner è ancora visibile
    try {
      const cookieButton = page.getByRole('button', { name: /Accetta tutto/i })
      if (await cookieButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await cookieButton.click({ force: true }).catch(() => {})
        await page.waitForTimeout(300)
      }
    } catch {
      // Bottone non trovato o non cliccabile, continua
    }
    
    // Fallback robusto: rimuovi il banner dal DOM se presente (importante per Mobile Safari)
    await page.evaluate(() => {
      const selectors = [
        'div[class*="fixed"][class*="bottom-0"][class*="z-[100]"]',
        'div:has-text("Controllo della tua Privacy")',
      ]
      for (const selector of selectors) {
        try {
          const elements = document.querySelectorAll(selector)
          elements.forEach((el) => {
            const text = el.textContent || ''
            if (text.includes('Privacy') || text.includes('cookie') || text.includes('Cookie')) {
              el.remove()
            }
          })
        } catch {
          // Ignora errori di querySelector
        }
      }
    })
    await page.waitForTimeout(100)
  } catch {
    // Ignora errori, continua comunque
  }
}

/**
 * Helper per fare login come atleta
 */
export async function loginAsAthlete(page: Page): Promise<void> {
  // Imposta cookie consent PRIMA di navigare per prevenire il banner
  await page.addInitScript(() => {
    localStorage.setItem('cookie-consent', 'true')
  })
  
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  
  // Chiudi il cookie banner se presente (critico per Mobile Chrome/Safari)
  await dismissCookieBanner(page)
  
  const emailInput = page.locator('#email')
  const passwordInput = page.locator('#password')
  await emailInput.waitFor({ state: 'visible', timeout: 10000 })
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 })

  // I campi hanno id="email" e id="password"
  // WebKit: usa click + clear + type per compilazione più robusta
  await emailInput.click({ force: true })
  await emailInput.fill('')
  await emailInput.type(TEST_CREDENTIALS.athlete.email, { delay: 20 })
  
  // Verifica che il banner non blocchi prima di cliccare password
  await dismissCookieBanner(page)
  await passwordInput.click({ force: true })
  await passwordInput.fill('')
  await passwordInput.type(TEST_CREDENTIALS.athlete.password, { delay: 20 })
  
  // Verifica che i valori siano stati inseriti correttamente (importante per WebKit)
  const emailValue = await emailInput.inputValue()
  if (emailValue !== TEST_CREDENTIALS.athlete.email) {
    // Retry se il valore non corrisponde
    await emailInput.click()
    await emailInput.fill('')
    await emailInput.type(TEST_CREDENTIALS.athlete.email, { delay: 30 })
  }

  // Cerca il pulsante di submit e attendi redirect in modo robusto per WebKit
  const submitButton = page.locator('button[type="submit"]')
  await submitButton.waitFor({ state: 'visible', timeout: 5000 })
  
  // Verifica che il banner non blocchi prima di cliccare submit (critico per Mobile)
  await dismissCookieBanner(page)
  
  // Avvia navigazione promise prima del click
  const navigationPromise = Promise.race([
    page.waitForURL(/\/post-login/, { timeout: 45000 }),
    page.waitForURL(/\/home/, { timeout: 45000 }),
  ]).catch(() => null)

  await submitButton.click({ force: true })
  
  // Attendi navigazione o verifica auth state (cookies/localStorage) per WebKit
  const navigationResult = await navigationPromise
  
  if (!navigationResult) {
    // WebKit: verifica auth state invece di affidarsi solo alla navigazione
    // Attendi che i cookie di autenticazione Supabase siano impostati o che l'URL cambi
    await expect
      .poll(
        async () => {
          const cookies = await page.context().cookies()
          const hasAuthCookie = cookies.some((c) => c.name.includes('sb-') && c.name.includes('auth-token'))
          const currentUrl = page.url()
          const isRedirected = !currentUrl.includes('/login')
          // Ritorna true se abbiamo auth cookie O se siamo redirectati
          return hasAuthCookie || isRedirected
        },
        { timeout: 30000, intervals: [500, 1000, 2000] },
      )
      .toBeTruthy()
      .catch(async () => {
        // Fallback: verifica URL direttamente con polling
        await expect
          .poll(async () => page.url(), { timeout: 20000, intervals: [500, 1000, 2000] })
          .toMatch(/\/post-login|\/home/)
      })
  }

  // Verifica finale dell'URL
  await expect(page).toHaveURL(/\/post-login|\/home/, { timeout: 10000 })
}

/**
 * Helper per fare login come Personal Trainer
 */
export async function loginAsPT(page: Page): Promise<void> {
  // Imposta cookie consent PRIMA di navigare per prevenire il banner
  await page.addInitScript(() => {
    localStorage.setItem('cookie-consent', 'true')
  })
  
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  
  // Chiudi il cookie banner se presente (critico per Mobile Chrome/Safari)
  await dismissCookieBanner(page)
  
  const emailInput = page.locator('#email')
  const passwordInput = page.locator('#password')
  await emailInput.waitFor({ state: 'visible', timeout: 10000 })
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 })

  // I campi hanno id="email" e id="password"
  // WebKit: usa click + clear + type per compilazione più robusta
  await emailInput.click({ force: true })
  await emailInput.fill('')
  await emailInput.type(TEST_CREDENTIALS.pt.email, { delay: 20 })
  
  // Verifica che il banner non blocchi prima di cliccare password
  await dismissCookieBanner(page)
  await passwordInput.click({ force: true })
  await passwordInput.fill('')
  await passwordInput.type(TEST_CREDENTIALS.pt.password, { delay: 20 })
  
  // Verifica che i valori siano stati inseriti correttamente (importante per WebKit)
  const emailValue = await emailInput.inputValue()
  if (emailValue !== TEST_CREDENTIALS.pt.email) {
    // Retry se il valore non corrisponde
    await emailInput.click()
    await emailInput.fill('')
    await emailInput.type(TEST_CREDENTIALS.pt.email, { delay: 30 })
  }

  // Cerca il pulsante di submit e attendi redirect in modo robusto per WebKit
  const submitButton = page.locator('button[type="submit"]')
  await submitButton.waitFor({ state: 'visible', timeout: 5000 })
  
  // Verifica che il banner non blocchi prima di cliccare submit (critico per Mobile)
  await dismissCookieBanner(page)
  
  // Avvia navigazione promise prima del click
  const navigationPromise = Promise.race([
    page.waitForURL(/\/post-login/, { timeout: 45000 }),
    page.waitForURL(/\/dashboard/, { timeout: 45000 }),
  ]).catch(() => null)

  await submitButton.click({ force: true })
  
  // Attendi navigazione o verifica auth state (cookies/localStorage) per WebKit
  const navigationResult = await navigationPromise
  
  if (!navigationResult) {
    // WebKit: verifica auth state invece di affidarsi solo alla navigazione
    // Attendi che i cookie di autenticazione Supabase siano impostati o che l'URL cambi
    await expect
      .poll(
        async () => {
          const cookies = await page.context().cookies()
          const hasAuthCookie = cookies.some((c) => c.name.includes('sb-') && c.name.includes('auth-token'))
          const currentUrl = page.url()
          const isRedirected = !currentUrl.includes('/login')
          // Ritorna true se abbiamo auth cookie O se siamo redirectati
          return hasAuthCookie || isRedirected
        },
        { timeout: 30000, intervals: [500, 1000, 2000] },
      )
      .toBeTruthy()
      .catch(async () => {
        // Fallback: verifica URL direttamente con polling
        await expect
          .poll(async () => page.url(), { timeout: 20000, intervals: [500, 1000, 2000] })
          .toMatch(/\/post-login|\/dashboard/)
      })
  }

  // Verifica finale dell'URL
  await expect(page).toHaveURL(/\/post-login|\/dashboard/, { timeout: 10000 })
}

/**
 * Helper per fare login come Admin
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  // Imposta cookie consent PRIMA di navigare per prevenire il banner
  await page.addInitScript(() => {
    localStorage.setItem('cookie-consent', 'true')
  })
  
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  
  // Chiudi il cookie banner se presente (critico per Mobile Chrome/Safari)
  await dismissCookieBanner(page)
  
  const emailInput = page.locator('#email')
  const passwordInput = page.locator('#password')
  await emailInput.waitFor({ state: 'visible', timeout: 10000 })
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 })

  // I campi hanno id="email" e id="password"
  // WebKit: usa click + clear + type per compilazione più robusta
  await emailInput.click({ force: true })
  await emailInput.fill('')
  await emailInput.type(TEST_CREDENTIALS.admin.email, { delay: 20 })
  
  // Verifica che il banner non blocchi prima di cliccare password
  await dismissCookieBanner(page)
  await passwordInput.click({ force: true })
  await passwordInput.fill('')
  await passwordInput.type(TEST_CREDENTIALS.admin.password, { delay: 20 })
  
  // Verifica che i valori siano stati inseriti correttamente (importante per WebKit)
  const emailValue = await emailInput.inputValue()
  if (emailValue !== TEST_CREDENTIALS.admin.email) {
    // Retry se il valore non corrisponde
    await emailInput.click()
    await emailInput.fill('')
    await emailInput.type(TEST_CREDENTIALS.admin.email, { delay: 30 })
  }

  // Cerca il pulsante di submit e attendi redirect in modo robusto per WebKit
  const submitButton = page.locator('button[type="submit"]')
  await submitButton.waitFor({ state: 'visible', timeout: 5000 })
  
  // Verifica che il banner non blocchi prima di cliccare submit (critico per Mobile)
  await dismissCookieBanner(page)
  
  // Avvia navigazione promise prima del click
  const navigationPromise = Promise.race([
    page.waitForURL(/\/post-login/, { timeout: 45000 }),
    page.waitForURL(/\/dashboard/, { timeout: 45000 }),
  ]).catch(() => null)

  await submitButton.click({ force: true })
  
  // Attendi navigazione o verifica auth state (cookies/localStorage) per WebKit
  const navigationResult = await navigationPromise
  
  if (!navigationResult) {
    // WebKit: verifica auth state invece di affidarsi solo alla navigazione
    // Attendi che i cookie di autenticazione Supabase siano impostati o che l'URL cambi
    await expect
      .poll(
        async () => {
          const cookies = await page.context().cookies()
          const hasAuthCookie = cookies.some((c) => c.name.includes('sb-') && c.name.includes('auth-token'))
          const currentUrl = page.url()
          const isRedirected = !currentUrl.includes('/login')
          // Ritorna true se abbiamo auth cookie O se siamo redirectati
          return hasAuthCookie || isRedirected
        },
        { timeout: 30000, intervals: [500, 1000, 2000] },
      )
      .toBeTruthy()
      .catch(async () => {
        // Fallback: verifica URL direttamente con polling
        await expect
          .poll(async () => page.url(), { timeout: 20000, intervals: [500, 1000, 2000] })
          .toMatch(/\/post-login|\/dashboard/)
      })
  }

  // Verifica finale dell'URL
  await expect(page).toHaveURL(/\/post-login|\/dashboard/, { timeout: 10000 })
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
export async function loadAuthState(_context: BrowserContext, _filePath: string): Promise<void> {
  // Lo stato viene caricato automaticamente quando si crea il context con storageState
  // Questo è solo un helper per riferimento
}
