import { existsSync, mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, type FullConfig, type Page } from '@playwright/test'
import {
  TEST_CREDENTIALS,
  MARKETING_CREDENTIALS,
  LOGIN_EMAIL_FIELD,
  LOGIN_PASSWORD_FIELD,
} from './helpers/auth'

/**
 * Setup globale per l'autenticazione.
 * Esegue il login per i diversi ruoli e salva lo stato su file per riuso nei test.
 */
async function globalSetupAuth(_config: FullConfig) {
  if (process.env.SKIP_GLOBAL_AUTH) {
    console.log('⏭️  SKIP_GLOBAL_AUTH attivo: salto creazione storage state')
    return
  }
  const storageDir = join(process.cwd(), 'tests/e2e/.auth')

  // Crea directory se non esiste
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true })
  }

  // In CI (e opzionalmente con PLAYWRIGHT_FORCE_AUTH_REFRESH=1) non riusare file .auth:
  // runner puliti o env diversa richiedono login reale ogni volta.
  const skipAuthCache = !!process.env.CI || process.env.PLAYWRIGHT_FORCE_AUTH_REFRESH === '1'

  // Se gli storage esistono già (da meno di 24h), riusali per velocità (solo fuori CI)
  const athleteStatePath = join(storageDir, 'athlete-auth.json')
  const ptStatePath = join(storageDir, 'pt-auth.json')
  const adminStatePath = join(storageDir, 'admin-auth.json')
  const marketingStatePath = join(storageDir, 'marketing-auth.json')

  const isRecent = (p: string) => {
    if (!existsSync(p)) return false
    const stats = statSync(p)
    const hoursSinceMod = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60)
    return stats.size > 100 && hoursSinceMod < 24
  }

  const needMarketing = !!MARKETING_CREDENTIALS && (skipAuthCache || !isRecent(marketingStatePath))
  if (
    !skipAuthCache &&
    isRecent(athleteStatePath) &&
    isRecent(ptStatePath) &&
    isRecent(adminStatePath) &&
    !needMarketing
  ) {
    console.log('✅ Storage state validi trovati, riuso cache')
    return
  }
  if (skipAuthCache) {
    console.log(
      '🔁 Auth: refresh forzato (CI o PLAYWRIGHT_FORCE_AUTH_REFRESH), salto cache file .auth',
    )
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  })
  const page = await context.newPage()

  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'

  // Funzione di login riutilizzabile e robusta
  async function performLogin(
    targetPage: Page,
    credentials: { email: string; password: string },
    roleName: string,
  ) {
    console.log(`🔐 Setting up ${roleName} authentication...`)

    // Inietta consenso cookie direttamente nel localStorage per evitare il banner
    await targetPage.addInitScript(() => {
      window.localStorage.setItem('cookie-consent', 'true')
    })

    // Tentativi di caricamento pagina login
    let loadSuccess = false
    for (let i = 0; i < 3; i++) {
      try {
        await targetPage.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
        loadSuccess = true
        break
      } catch {
        console.warn(`⚠️ [${roleName}] Goto login failed (attempt ${i + 1}), retrying...`)
        await targetPage.waitForTimeout(2000)
      }
    }
    if (!loadSuccess) throw new Error(`Could not load login page for ${roleName}`)

    // Cookie Consent
    try {
      const cookieButton = targetPage.getByRole('button', { name: /Accetta tutto/i })
      if (await cookieButton.isVisible({ timeout: 3000 })) {
        console.log(`🍪 [${roleName}] Cookie banner detected, clicking accept...`)
        await cookieButton.click()
        await targetPage.waitForTimeout(1000)
      }
    } catch {
      // Ignora errori cookie
    }

    await targetPage.waitForSelector(LOGIN_EMAIL_FIELD, { timeout: 20000, state: 'visible' })
    await targetPage.waitForSelector(LOGIN_PASSWORD_FIELD, {
      timeout: 20000,
      state: 'visible',
    })

    const emailInput = targetPage.locator(LOGIN_EMAIL_FIELD).first()
    const passwordInput = targetPage.locator(LOGIN_PASSWORD_FIELD).first()
    const submitButton = targetPage.locator('button[type="submit"]').first()

    // Inserimento dati con retry e verifica
    const fillForm = async () => {
      await emailInput.click()
      await emailInput.fill('')
      await emailInput.type(credentials.email, { delay: 20 })

      await passwordInput.click()
      await passwordInput.fill('')
      await passwordInput.type(credentials.password, { delay: 20 })
    }

    let fillVerified = false
    for (let i = 0; i < 3; i++) {
      await fillForm()
      const ev = await emailInput.inputValue()
      if (ev === credentials.email) {
        fillVerified = true
        break
      }
      console.warn(`⚠️ [${roleName}] Fill verification failed (attempt ${i + 1}), retrying...`)
      await targetPage.waitForTimeout(1000)
    }
    if (!fillVerified) throw new Error(`Could not fill login form for ${roleName}`)

    // Submit
    console.log(`🔑 [${roleName}] Submitting login form...`)

    const navigationPromise = Promise.race([
      targetPage.waitForURL('**/home', { timeout: 45000 }),
      targetPage.waitForURL('**/dashboard', { timeout: 45000 }),
      targetPage.waitForURL('**/dashboard/**', { timeout: 45000 }),
      targetPage.waitForURL('**/post-login**', { timeout: 45000 }),
    ]).catch(async () => {
      return { success: false, url: targetPage.url() }
    })

    await submitButton.click()
    const result = await navigationPromise

    if (result && typeof result === 'object' && 'success' in result && result.success === false) {
      console.warn(
        `⚠️ [${roleName}] Navigation timeout or failure. Current URL: ${targetPage.url()}`,
      )
      if (targetPage.url().includes('/login')) {
        await targetPage.screenshot({ path: `login-failed-${roleName}.png` })
        throw new Error(`${roleName} login failed - stayed on login page`)
      }
    }

    try {
      await targetPage.waitForLoadState('domcontentloaded', { timeout: 10000 })
    } catch {
      // Ignora errori di load state
    }

    console.log(`✅ [${roleName}] Auth successful: ${targetPage.url()}`)
  }

  try {
    // 1. Athlete
    await performLogin(page, TEST_CREDENTIALS.athlete, 'Athlete')
    await context.storageState({ path: athleteStatePath })

    // 2. PT
    const ptContext = await browser.newContext()
    const ptPage = await ptContext.newPage()
    await performLogin(ptPage, TEST_CREDENTIALS.pt, 'PT')
    await ptContext.storageState({ path: ptStatePath })
    await ptContext.close()

    // 3. Admin
    const adminContext = await browser.newContext()
    const adminPage = await adminContext.newPage()
    await performLogin(adminPage, TEST_CREDENTIALS.admin, 'Admin')
    await adminContext.storageState({ path: adminStatePath })
    await adminContext.close()

    // 4. Marketing (opzionale: solo se env MARKETING_TEST_EMAIL / MARKETING_TEST_PASSWORD sono impostate)
    if (MARKETING_CREDENTIALS) {
      const marketingContext = await browser.newContext()
      const marketingPage = await marketingContext.newPage()
      await performLogin(marketingPage, MARKETING_CREDENTIALS, 'Marketing')
      await marketingContext.storageState({ path: marketingStatePath })
      await marketingContext.close()
    } else {
      console.log(
        '⏭️  Credenziali marketing non impostate: salto marketing-auth.json (imposta MARKETING_TEST_EMAIL e MARKETING_TEST_PASSWORD)',
      )
    }
  } catch (error) {
    console.error('❌ Global Setup Auth Error:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
}

export default globalSetupAuth
