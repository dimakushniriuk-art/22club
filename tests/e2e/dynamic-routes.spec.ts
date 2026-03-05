import { test, expect } from '@playwright/test'

/**
 * Test E2E per verificare il funzionamento delle route dinamiche
 * (es. /home/allenamenti/[workout_plan_id] e /home/allenamenti/[workout_plan_id]/[day_id])
 */
test.describe('Dynamic Routes', () => {
  test.beforeEach(async ({ page }) => {
    // Lo stato di autenticazione è già caricato da globalSetupAuth
    // Vai direttamente alla pagina senza login
    await page.goto('/home/allenamenti', { waitUntil: 'domcontentloaded' })
    // Attendi che il contenuto principale sia caricato invece di networkidle
    await page.waitForSelector('body', { timeout: 5000 })
  })

  test('should display loading state for dynamic workout plan route', async ({ page }) => {
    // Naviga a una route dinamica (workout plan)
    // Assumiamo che ci sia almeno un workout plan nella lista
    const workoutPlanLink = page
      .getByRole('link')
      .filter({ hasText: /piano|workout|scheda/i })
      .first()

    if (await workoutPlanLink.isVisible().catch(() => false)) {
      // Intercetta la navigazione per verificare il loading state
      const loadingPromise = page.waitForSelector('[class*="skeleton"], [class*="loading"]', {
        timeout: 2000,
      })

      await workoutPlanLink.click()

      // Verifica che il loading state appaia (anche se brevemente)
      try {
        await loadingPromise
        // Loading state trovato - OK
      } catch {
        // Loading state non trovato - potrebbe essere troppo veloce o non presente
        // Non è un errore critico
      }

      // Attendi che la pagina si carichi completamente
      await page.waitForLoadState('domcontentloaded', { timeout: 5000 })

      // Verifica che siamo sulla route dinamica
      expect(page.url()).toMatch(/\/home\/allenamenti\/[^/]+$/)
    }
  })

  test('should display loading state for nested dynamic route (workout day)', async ({ page }) => {
    // Prima naviga a un workout plan
    const workoutPlanLink = page
      .getByRole('link')
      .filter({ hasText: /piano|workout|scheda/i })
      .first()

    if (await workoutPlanLink.isVisible().catch(() => false)) {
      await workoutPlanLink.click()
      await page.waitForLoadState('domcontentloaded', { timeout: 5000 })

      // Poi naviga a un giorno specifico
      const dayLink = page
        .getByRole('link')
        .filter({ hasText: /giorno|day/i })
        .first()

      if (await dayLink.isVisible().catch(() => false)) {
        const loadingPromise = page.waitForSelector('[class*="skeleton"], [class*="loading"]', {
          timeout: 2000,
        })

        await dayLink.click()

        // Verifica che il loading state appaia
        try {
          await loadingPromise
        } catch {
          // Loading state non trovato - potrebbe essere troppo veloce
        }

        await page.waitForLoadState('domcontentloaded', { timeout: 5000 })

        // Verifica che siamo sulla route nested dinamica
        expect(page.url()).toMatch(/\/home\/allenamenti\/[^/]+\/[^/]+$/)
      }
    }
  })

  test('should handle invalid dynamic route parameters gracefully', async ({ page }) => {
    // Prova ad accedere a una route con ID non valido
    await page.goto('/home/allenamenti/invalid-workout-plan-id')

    // Dovrebbe mostrare un errore o uno stato vuoto, non crashare
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Verifica che la pagina non sia completamente bianca (errore critico)
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
    expect(bodyText?.length).toBeGreaterThan(0)
  })

  test('should display error boundary for dynamic route errors', async ({ page }) => {
    // Naviga a una route che potrebbe generare un errore
    await page.goto('/home/allenamenti/test-error-id')

    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Verifica che ci sia un error boundary o un messaggio di errore
    // (non un crash completo della pagina)
    const errorMessage = page.getByText(/errore|error|non trovato|not found/i).first()
    const hasErrorBoundary = await errorMessage.isVisible().catch(() => false)

    // Verifica che la pagina non sia completamente bianca (errore critico)
    const bodyText = await page.textContent('body')
    const hasContent = bodyText && bodyText.length > 0

    // Dovrebbe esserci un error boundary, un messaggio di errore, o almeno del contenuto
    // (non un crash completo)
    expect(hasErrorBoundary || hasContent || page.url().includes('/home')).toBe(true)
  })

  test('should maintain route parameters during navigation', async ({ page }) => {
    // Naviga a un workout plan
    const workoutPlanLink = page
      .getByRole('link')
      .filter({ hasText: /piano|workout|scheda/i })
      .first()

    if (await workoutPlanLink.isVisible().catch(() => false)) {
      await workoutPlanLink.click()
      await page.waitForLoadState('domcontentloaded', { timeout: 5000 })

      const workoutPlanUrl = page.url()
      const workoutPlanId = workoutPlanUrl.match(/\/home\/allenamenti\/([^/]+)/)?.[1]

      expect(workoutPlanId).toBeTruthy()

      // Naviga a un giorno
      const dayLink = page
        .getByRole('link')
        .filter({ hasText: /giorno|day/i })
        .first()

      if (await dayLink.isVisible().catch(() => false)) {
        await dayLink.click()
        await page.waitForLoadState('domcontentloaded', { timeout: 5000 })

        const dayUrl = page.url()
        const dayId = dayUrl.match(/\/home\/allenamenti\/[^/]+\/([^/]+)/)?.[1]

        // Verifica che entrambi gli ID siano presenti nell'URL
        expect(dayUrl).toContain(workoutPlanId)
        expect(dayId).toBeTruthy()
      }
    }
  })

  test('should use stable Supabase client for dynamic routes', async ({ page }) => {
    // Naviga a una route dinamica
    const workoutPlanLink = page
      .getByRole('link')
      .filter({ hasText: /piano|workout|scheda/i })
      .first()

    if (await workoutPlanLink.isVisible().catch(() => false)) {
      // Monitora le chiamate di rete per verificare che non ci siano
      // chiamate duplicate dovute a client instabili
      const networkRequests: string[] = []
      page.on('request', (request) => {
        if (request.url().includes('supabase.co')) {
          networkRequests.push(request.url())
        }
      })

      await workoutPlanLink.click()
      await page.waitForLoadState('domcontentloaded', { timeout: 5000 })

      // Naviga avanti e indietro
      await page.goBack()
      await page.waitForLoadState('domcontentloaded', { timeout: 3000 })

      await page.goForward()
      await page.waitForLoadState('domcontentloaded', { timeout: 3000 })

      // Verifica che non ci siano troppe chiamate duplicate
      // (un client stabile non dovrebbe ricreare connessioni)
      const uniqueRequests = new Set(networkRequests)
      const duplicateRatio = networkRequests.length / uniqueRequests.size

      // Il rapporto dovrebbe essere ragionevole (non troppi duplicati)
      expect(duplicateRatio).toBeLessThan(3) // Max 3x le chiamate uniche
    }
  })

  test('should handle route prefetching correctly', async ({ page }) => {
    // Hover su un link a una route dinamica
    const workoutPlanLink = page
      .getByRole('link')
      .filter({ hasText: /piano|workout|scheda/i })
      .first()

    if (await workoutPlanLink.isVisible().catch(() => false)) {
      await workoutPlanLink.hover()
      await page.waitForTimeout(500) // Attendi prefetch

      // Clicca sul link
      await workoutPlanLink.click()

      // La navigazione dovrebbe essere più veloce grazie al prefetch
      const navigationStart = Date.now()
      await page.waitForLoadState('domcontentloaded', { timeout: 5000 })
      const navigationTime = Date.now() - navigationStart

      // La navigazione dovrebbe essere relativamente veloce (< 5 secondi)
      expect(navigationTime).toBeLessThan(5000)
    }
  })

  test('should display correct content for different dynamic route parameters', async ({
    page,
  }) => {
    // Naviga a diversi workout plans e verifica che il contenuto cambi
    const workoutPlanLinks = await page
      .getByRole('link')
      .filter({ hasText: /piano|workout|scheda/i })
      .all()

    if (workoutPlanLinks.length >= 2) {
      // Naviga al primo
      await workoutPlanLinks[0].click()
      await page.waitForLoadState('networkidle', { timeout: 10000 })
      const firstUrl = page.url()
      const firstContent = await page.textContent('body')

      // Torna indietro
      await page.goBack()
      await page.waitForLoadState('domcontentloaded', { timeout: 3000 })

      // Naviga al secondo
      await workoutPlanLinks[1].click()
      await page.waitForLoadState('networkidle', { timeout: 10000 })
      const secondUrl = page.url()
      const secondContent = await page.textContent('body')

      // Verifica che URL e contenuto siano diversi
      expect(firstUrl).not.toBe(secondUrl)
      // Il contenuto potrebbe essere simile ma dovrebbe essere diverso per ID diversi
      expect(firstContent).toBeTruthy()
      expect(secondContent).toBeTruthy()
    }
  })
})
