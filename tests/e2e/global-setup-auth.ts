import { chromium, FullConfig } from '@playwright/test'
import { TEST_CREDENTIALS } from './helpers/auth'
import { join } from 'path'
import { mkdirSync, existsSync, statSync } from 'fs'

/**
 * Setup globale per creare e salvare lo stato di autenticazione
 * Questo permette di riutilizzare la sessione tra test invece di fare login ogni volta
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Se gli storage esistono già, riusali per evitare login flaky
  const athleteStatePath = join(storageDir, 'athlete-auth.json')
  const ptStatePath = join(storageDir, 'pt-auth.json')
  // adminStatePath riservato per futuro uso multi-role
  const fileIsNonEmpty = (p: string) => existsSync(p) && statSync(p).size > 10
  if (fileIsNonEmpty(athleteStatePath) && fileIsNonEmpty(ptStatePath)) {
    console.log('✅ Storage state già presente, skip login e riuso cache')
    return
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // Intercetta le richieste per debug
  page.on('request', (request) => {
    if (request.url().includes('auth') || request.url().includes('login')) {
      console.log(`🌐 Request: ${request.method()} ${request.url()}`)
    }
  })

  page.on('response', (response) => {
    if (response.url().includes('auth') || response.url().includes('login')) {
      console.log(`📥 Response: ${response.status()} ${response.url()}`)
    }
  })

  page.on('console', (msg) => {
    const text = msg.text()
    // Logga tutti i console.log che contengono "LOGIN" per debug
    if (
      text.includes('LOGIN') ||
      text.includes('Reindirizzamento') ||
      msg.type() === 'error' ||
      text.includes('error') ||
      text.includes('Error')
    ) {
      console.log(`🖥️ Console: ${msg.type()} ${text.substring(0, 200)}`)
    }
  })

  try {
    console.log('🔐 Setting up authentication state...')

    const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'
    console.log(`📍 Using base URL: ${baseUrl}`)

    // Verifica che il server sia raggiungibile
    try {
      const response = await page.goto(`${baseUrl}/login`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })
      if (!response || !response.ok()) {
        throw new Error(`Server not responding: ${response?.status()}`)
      }
      console.log('✅ Server is reachable')
    } catch (error) {
      console.error('❌ Failed to reach server:', error)
      throw new Error(
        `Cannot connect to server at ${baseUrl}. Make sure the dev server is running.`,
      )
    }

    // Attendi che il form sia completamente caricato
    console.log('⏳ Waiting for login form...')
    await page.waitForSelector('#email', { timeout: 15000, state: 'visible' })
    await page.waitForSelector('#password', { timeout: 15000, state: 'visible' })
    await page.waitForSelector('button[type="submit"]', { timeout: 15000, state: 'visible' })

    // Verifica che il form sia interattivo
    const emailInput = page.locator('#email').first()
    const passwordInput = page.locator('#password').first()
    const submitButton = page.locator('button[type="submit"]').first()

    // Verifica che i campi non siano disabilitati
    const emailDisabled = await emailInput.isDisabled().catch(() => true)
    const passwordDisabled = await passwordInput.isDisabled().catch(() => true)

    if (emailDisabled || passwordDisabled) {
      throw new Error('Login form fields are disabled')
    }

    console.log('✅ Login form loaded and ready')

    // Compila il form in modo affidabile (fill + breve pausa) e riutilizzabile per eventuali retry
    console.log('📝 Filling login form...')
    const fillCredentials = async () => {
      await emailInput.fill('', { timeout: 5000 }).catch(() => {})
      await passwordInput.fill('', { timeout: 5000 }).catch(() => {})
      await emailInput.fill(TEST_CREDENTIALS.athlete.email)
      await passwordInput.fill(TEST_CREDENTIALS.athlete.password)
      await page.waitForTimeout(300)
    }
    await fillCredentials()

    // Verifica che i valori siano stati inseriti
    const emailValue = await emailInput.inputValue()
    const passwordValue = await passwordInput.inputValue()

    if (emailValue !== TEST_CREDENTIALS.athlete.email) {
      throw new Error(
        `Email not set correctly. Expected: ${TEST_CREDENTIALS.athlete.email}, Got: ${emailValue}`,
      )
    }

    if (!passwordValue || passwordValue.length === 0) {
      throw new Error('Password not set correctly')
    }

    console.log('✅ Form values verified')

    // Aspetta che il form sia valido e il submit sia abilitato
    await page.waitForTimeout(1000)

    // Verifica che il submit sia abilitato
    const isSubmitDisabled = await submitButton.isDisabled()
    if (isSubmitDisabled) {
      console.warn('⚠️ Submit button is disabled, waiting...')
      await page
        .waitForFunction(
          () => {
            const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement
            return btn && !btn.disabled
          },
          { timeout: 5000 },
        )
        .catch(() => {
          throw new Error('Submit button remains disabled after filling form')
        })
    }

    console.log('✅ Form filled and validated')

    // Clicca il button submit per triggerare l'handler JavaScript
    console.log('🔑 Submitting login form...')

    // Aspetta che la navigazione inizi dopo il submit
    const navigationPromise = page.waitForURL('**/home', { timeout: 30000 }).catch(async () => {
      // Se non va a /home, verifica se c'è un errore
      const currentUrl = page.url()
      return { url: currentUrl, success: false }
    })

    // Aspetta anche una richiesta POST a Supabase auth
    let authRequestPromise = page
      .waitForRequest((request) => request.url().includes('auth') && request.method() === 'POST', {
        timeout: 10000,
      })
      .catch(() => {
        console.warn('⚠️ No auth POST request detected')
        return null
      })

    // Clicca il button submit (questo triggera l'handler onSubmit)
    await submitButton.click()

    // Aspetta che la richiesta auth venga inviata
    await authRequestPromise

    // Aspetta un momento per vedere se ci sono errori o se inizia la navigazione
    await page.waitForTimeout(2000)

    // Verifica se ci sono errori prima di aspettare il redirect
    const errorSelectors = [
      '[role="alert"]',
      '.error',
      '.text-red-500',
      '.text-destructive',
      '.text-state-error',
      '[class*="error"]',
    ]

    // Se il form ha mostrato errori di validazione client-side, riprova una volta riempiendo di nuovo
    const retryLoginIfValidationError = async () => {
      const validationMessages = ['email è richiesta', 'password è richiesta']
      for (const selector of errorSelectors) {
        const errorElement = page.locator(selector).first()
        const isVisible = await errorElement.isVisible({ timeout: 500 }).catch(() => false)
        if (!isVisible) continue
        const text = (await errorElement.textContent())?.toLowerCase().trim() || ''
        if (validationMessages.some((msg) => text.includes(msg))) {
          console.warn('⚠️ Validation error detected, retrying fill+submit')
          await fillCredentials()
          authRequestPromise = page
            .waitForRequest(
              (request) => request.url().includes('auth') && request.method() === 'POST',
              { timeout: 10000 },
            )
            .catch(() => null)
          await submitButton.click()
          await authRequestPromise
          await page.waitForTimeout(1000)
          break
        }
      }
    }

    await retryLoginIfValidationError()

    for (const selector of errorSelectors) {
      try {
        const errorElement = page.locator(selector).first()
        const isVisible = await errorElement.isVisible({ timeout: 1000 }).catch(() => false)
        if (isVisible) {
          const errorText = await errorElement.textContent()
          if (errorText && errorText.trim()) {
            // Escludi messaggi di benvenuto o successo
            const lowerText = errorText.toLowerCase()
            const isWelcomeMessage =
              lowerText.includes('benvenuto') ||
              lowerText.includes('welcome') ||
              lowerText.includes('successo') ||
              lowerText.includes('success') ||
              lowerText.includes('✅') ||
              lowerText.includes('✓')

            if (!isWelcomeMessage) {
              console.error(`❌ Login error found (${selector}): ${errorText}`)
              // Cattura screenshot per debug
              await page.screenshot({ path: 'login-error.png', fullPage: true }).catch(() => {})
              throw new Error(`Login failed: ${errorText}`)
            }
          }
        }
      } catch {
        // Ignora errori nel cercare selettori
      }
    }

    // Aspetta il redirect con timeout più lungo
    console.log('⏳ Waiting for redirect after login...')
    try {
      const result = await navigationPromise
      if (result && typeof result === 'object' && 'success' in result && !result.success) {
        const currentUrl = result.url
        console.log(`⚠️ Current URL after login attempt: ${currentUrl}`)

        // Se siamo ancora su /login, verifica meglio gli errori
        if (currentUrl.includes('/login')) {
          // Aspetta un po' di più per vedere se appare un errore
          await page.waitForTimeout(2000)

          // Cerca errori più accuratamente
          const pageContent = await page.content()

          // Cattura screenshot per debug
          await page.screenshot({ path: 'login-failed.png', fullPage: true }).catch(() => {})
          console.error('❌ Login failed - still on login page')
          console.error('Page content preview:', pageContent.substring(0, 500))

          throw new Error(
            'Login did not redirect - still on login page. Check login-failed.png for details.',
          )
        }

        // Se siamo su un'altra pagina, va bene
        console.log(`✅ Redirected to: ${currentUrl}`)
      } else {
        console.log('✅ Redirected to /home')
      }
    } catch {
      // Se navigationPromise ha fallito, verifica manualmente
      const currentUrl = page.url()
      console.log(`⚠️ Navigation error, current URL: ${currentUrl}`)

      if (currentUrl.includes('/login')) {
        await page.waitForTimeout(2000)
        await page.screenshot({ path: 'login-failed.png', fullPage: true }).catch(() => {})
        const pageContent = await page.content()
        console.error('❌ Login failed - still on login page')
        console.error('Page content preview:', pageContent.substring(0, 500))
        throw new Error(
          'Login did not redirect - still on login page. Check login-failed.png for details.',
        )
      }

      // Se siamo su un'altra pagina, va bene
      console.log(`✅ Redirected to: ${currentUrl}`)
    }

    await page.waitForLoadState('domcontentloaded')
    console.log(`✅ Final URL: ${page.url()}`)

    // Salva lo stato di autenticazione
    const storageStatePath = join(storageDir, 'athlete-auth.json')
    await context.storageState({ path: storageStatePath })

    console.log(`✅ Authentication state saved to ${storageStatePath}`)

    // Login come PT (per test che richiedono ruolo PT) - opzionale
    try {
      console.log('🔐 Setting up PT authentication...')
      const ptContext = await browser.newContext()
      const ptPage = await ptContext.newPage()

      // Intercetta console per PT
      ptPage.on('console', (msg) => {
        const text = msg.text()
        if (text.includes('LOGIN') || text.includes('Reindirizzamento') || msg.type() === 'error') {
          console.log(`🖥️ PT Console: ${msg.type()} ${text.substring(0, 200)}`)
        }
      })

      await ptPage.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await ptPage.waitForSelector('#email', { timeout: 15000, state: 'visible' })
      await ptPage.waitForSelector('#password', { timeout: 15000, state: 'visible' })

      const ptEmailInput = ptPage.locator('#email').first()
      const ptPasswordInput = ptPage.locator('#password').first()
      const ptSubmitButton = ptPage.locator('button[type="submit"]').first()

      // Usa type() per triggerare correttamente gli eventi React
      await ptEmailInput.fill(TEST_CREDENTIALS.pt.email)
      await ptPasswordInput.fill(TEST_CREDENTIALS.pt.password)
      await ptPage.waitForTimeout(200)

      // Aspetta la navigazione con pattern più flessibile
      const ptNavigationPromise = Promise.race([
        ptPage.waitForURL('**/dashboard', { timeout: 30000 }),
        ptPage.waitForURL('**/dashboard/**', { timeout: 30000 }),
        ptPage.waitForURL('**/home', { timeout: 30000 }),
      ]).catch(async () => {
        const currentUrl = ptPage.url()
        console.log(`⚠️ PT Current URL: ${currentUrl}`)
        return { url: currentUrl, success: false }
      })

      await ptSubmitButton.click()

      // Aspetta un momento per vedere se inizia la navigazione
      await ptPage.waitForTimeout(2000)

      const ptResult = await ptNavigationPromise
      if (ptResult && typeof ptResult === 'object' && 'success' in ptResult && !ptResult.success) {
        const currentUrl = ptResult.url
        console.log(`⚠️ PT navigation failed, current URL: ${currentUrl}`)
        // Se siamo su /login, potrebbe essere un errore
        if (currentUrl.includes('/login')) {
          throw new Error(`PT login failed - still on login page. URL: ${currentUrl}`)
        }
        // Altrimenti accetta qualsiasi redirect
        console.log(`✅ PT redirected to: ${currentUrl}`)
      }

      await ptPage.waitForLoadState('domcontentloaded')

      const ptStorageStatePath = join(storageDir, 'pt-auth.json')
      await ptContext.storageState({ path: ptStorageStatePath })

      console.log(`✅ PT authentication state saved to ${ptStorageStatePath}`)
      await ptContext.close()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn('⚠️ PT login failed, skipping:', errorMessage)
    }

    // Login come Admin (per test che richiedono ruolo admin) - opzionale
    try {
      console.log('🔐 Setting up Admin authentication...')
      const adminContext = await browser.newContext()
      const adminPage = await adminContext.newPage()

      // Intercetta console e richieste per Admin
      adminPage.on('console', (msg) => {
        const text = msg.text()
        console.log(`🖥️ Admin Console [${msg.type()}]: ${text.substring(0, 300)}`)
      })

      adminPage.on('request', (request) => {
        if (request.url().includes('auth') || request.url().includes('login')) {
          console.log(`🌐 Admin Request: ${request.method()} ${request.url()}`)
        }
      })

      adminPage.on('response', (response) => {
        if (response.url().includes('auth') || response.url().includes('login')) {
          console.log(`📥 Admin Response: ${response.status()} ${response.url()}`)
        }
      })

      await adminPage.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await adminPage.waitForSelector('#email', { timeout: 15000, state: 'visible' })
      await adminPage.waitForSelector('#password', { timeout: 15000, state: 'visible' })

      const adminEmailInput = adminPage.locator('#email').first()
      const adminPasswordInput = adminPage.locator('#password').first()
      const adminSubmitButton = adminPage.locator('button[type="submit"]').first()

      // Usa type() per triggerare correttamente gli eventi React
      await adminEmailInput.fill(TEST_CREDENTIALS.admin.email)
      await adminPasswordInput.fill(TEST_CREDENTIALS.admin.password)
      await adminPage.waitForTimeout(200)

      // Verifica che i valori siano stati inseriti
      const adminEmailValue = await adminEmailInput.inputValue()
      const adminPasswordValue = await adminPasswordInput.inputValue()
      console.log(
        `📝 Admin form values - Email: ${adminEmailValue.substring(0, 20)}..., Password: ${
          adminPasswordValue ? '***' : 'empty'
        }`,
      )

      if (!adminEmailValue || adminEmailValue !== TEST_CREDENTIALS.admin.email) {
        throw new Error(
          `Admin email not set correctly. Expected: ${TEST_CREDENTIALS.admin.email}, Got: ${adminEmailValue}`,
        )
      }

      if (!adminPasswordValue || adminPasswordValue.length === 0) {
        throw new Error('Admin password not set correctly')
      }

      const adminNavigationPromise = Promise.race([
        adminPage.waitForURL('**/dashboard/admin', { timeout: 30000 }),
        adminPage.waitForURL('**/dashboard', { timeout: 30000 }),
        adminPage.waitForURL('**/dashboard/**', { timeout: 30000 }),
        adminPage.waitForURL('**/home', { timeout: 30000 }),
        adminPage.waitForURL('**/post-login', { timeout: 30000 }),
      ]).catch(async () => {
        const currentUrl = adminPage.url()
        console.log(`⚠️ Admin navigation error, current URL: ${currentUrl}`)
        return { url: currentUrl, success: false }
      })

      // Verifica che il submit sia abilitato
      const isAdminSubmitDisabled = await adminSubmitButton.isDisabled()
      if (isAdminSubmitDisabled) {
        console.warn('⚠️ Admin submit button is disabled, waiting...')
        await adminPage
          .waitForFunction(
            () => {
              const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement
              return btn && !btn.disabled
            },
            { timeout: 5000 },
          )
          .catch(() => {
            throw new Error('Admin submit button remains disabled')
          })
      }

      console.log('🔑 Admin submitting form...')
      await adminSubmitButton.click()

      // Aspetta un momento per vedere se inizia la navigazione o se appare un errore
      await adminPage.waitForTimeout(3000)

      // Verifica se c'è stata una richiesta auth
      const adminAuthRequest = await adminPage
        .waitForRequest(
          (request) => request.url().includes('auth') && request.method() === 'POST',
          { timeout: 5000 },
        )
        .catch(() => {
          console.warn('⚠️ No Admin auth POST request detected')
          return null
        })

      if (adminAuthRequest) {
        console.log(`✅ Admin auth request sent: ${adminAuthRequest.url()}`)
      }

      const adminResult = await adminNavigationPromise
      if (
        adminResult &&
        typeof adminResult === 'object' &&
        'success' in adminResult &&
        !adminResult.success
      ) {
        const currentUrl = adminResult.url
        console.log(`⚠️ Admin navigation result, current URL: ${currentUrl}`)

        // Se siamo ancora su /login dopo 5 secondi, verifica errori
        if (currentUrl.includes('/login')) {
          // Aspetta ancora un po' per vedere se appare un errore
          await adminPage.waitForTimeout(2000)

          // Verifica se ci sono errori
          const errorSelectors = [
            '[role="alert"]',
            '.error',
            '.text-red-500',
            '.text-destructive',
            '.text-state-error',
          ]

          for (const selector of errorSelectors) {
            try {
              const errorElement = adminPage.locator(selector).first()
              const isVisible = await errorElement.isVisible({ timeout: 1000 }).catch(() => false)
              if (isVisible) {
                const errorText = await errorElement.textContent()
                if (errorText && errorText.trim()) {
                  const lowerText = errorText.toLowerCase()
                  const isWelcomeMessage =
                    lowerText.includes('benvenuto') ||
                    lowerText.includes('welcome') ||
                    lowerText.includes('successo') ||
                    lowerText.includes('success')

                  if (!isWelcomeMessage) {
                    throw new Error(`Admin login failed: ${errorText}`)
                  }
                }
              }
            } catch {
              // Ignora
            }
          }

          // Se non ci sono errori visibili, potrebbe essere un problema di timing
          // Prova a verificare se siamo ancora su /login dopo più tempo
          await adminPage.waitForTimeout(3000)
          const finalUrl = adminPage.url()
          if (finalUrl.includes('/login')) {
            throw new Error(
              `Admin login failed - still on login page after 8 seconds. URL: ${finalUrl}`,
            )
          }
          console.log(`✅ Admin redirected to: ${finalUrl}`)
        } else {
          // Altrimenti accetta qualsiasi redirect
          console.log(`✅ Admin redirected to: ${currentUrl}`)
        }
      } else {
        console.log('✅ Admin navigation successful')
      }

      await adminPage.waitForLoadState('domcontentloaded')

      const adminStorageStatePath = join(storageDir, 'admin-auth.json')
      await adminContext.storageState({ path: adminStorageStatePath })

      console.log(`✅ Admin authentication state saved to ${adminStorageStatePath}`)
      await adminContext.close()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn('⚠️ Admin login failed, skipping:', errorMessage)
    }
  } catch (error) {
    console.error('❌ Failed to setup authentication state:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
}

export default globalSetupAuth
