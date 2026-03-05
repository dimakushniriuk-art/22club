import { test, expect } from '@playwright/test'
import { loginAsPT, loginAsAthlete, dismissCookieBanner } from './helpers/auth'

test.describe('Complete E2E Tests', () => {
  test.setTimeout(90000)

  test('should complete full application lifecycle as PT', async ({ page }) => {
    // Complete application lifecycle: Login → Dashboard → Navigation → Key pages
    
    // Step 1: Login as PT
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsPT(page)
    await page.waitForURL(/post-login|dashboard|home/, { timeout: 30000 }).catch(() => {})
    // Attendi che la pagina sia completamente caricata dopo redirect
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

    // Step 2: Navigate to dashboard
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})

    // Step 3: Verify dashboard elements
    // Attendi che la pagina sia completamente caricata
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    // Cerca heading "Azioni Rapide" (più specifico)
    const headingAzioniRapide = page.getByRole('heading', { name: /Azioni Rapide/i })
    await expect(headingAzioniRapide).toBeVisible({ timeout: 15000 })

    // Step 4: Test navigation to key pages
    const pages = [
      { path: '/dashboard/appuntamenti', name: /Appuntamenti/i },
      { path: '/dashboard/clienti', name: /Clienti/i },
      { path: '/dashboard/statistiche', name: /Statistiche/i },
    ]

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' })
      await page.waitForLoadState('networkidle').catch(() => {})
      // Usa .first() per evitare strict mode violation quando ci sono più heading con lo stesso nome
      const heading = page.getByRole('heading', { name: pageInfo.name }).first()
      await expect(heading).toBeVisible({ timeout: 15000 })
    }
  })

  test('should complete full application lifecycle as Athlete', async ({ page }) => {
    // Login as Athlete
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsAthlete(page)
    await page.waitForURL(/post-login|home|dashboard/, { timeout: 30000 }).catch(() => {})
    // Attendi che la pagina sia completamente caricata dopo redirect
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

    // Verify athlete home
    // Attendi che la pagina sia completamente caricata
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    // Cerca heading "Benvenuto" (più specifico, case-insensitive)
    const headingBenvenuto = page.getByRole('heading', { name: /benvenuto/i })
    await expect(headingBenvenuto).toBeVisible({ timeout: 15000 })
  })

  test('should handle cross-role navigation protection', async ({ page }) => {
    // Try to access PT-only pages without login
    await page.goto('/dashboard/admin')
    
    // Should redirect to login
    await page.waitForURL(/login/, { timeout: 10000 }).catch(() => {})
    const isProtected = page.url().includes('login')
    expect(isProtected).toBeTruthy()
  })

  test('should handle form validation on login', async ({ page }) => {
    // Imposta cookie consent PRIMA di navigare per prevenire il banner
    await page.addInitScript(() => {
      localStorage.setItem('cookie-consent', 'true')
    })
    
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    
    // Chiudi il cookie banner se presente (critico per Mobile Chrome/Safari)
    await dismissCookieBanner(page)

    // Try to submit empty form
    await page.click('button[type="submit"]', { force: true })
    await page.waitForTimeout(500)

    // Should show validation or stay on login
    const isOnLogin = page.url().includes('login')
    expect(isOnLogin).toBeTruthy()
  })

  test('should maintain session across navigation', async ({ page }) => {
    // Login
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsPT(page)
    await page.waitForURL(/post-login|dashboard|home/, { timeout: 30000 }).catch(() => {})
    // Attendi che la pagina sia completamente caricata dopo redirect
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

    // Navigate to multiple pages
    await page.goto('/dashboard/appuntamenti', { waitUntil: 'domcontentloaded' })
    await page.goto('/dashboard/clienti', { waitUntil: 'domcontentloaded' })
    await page.goto('/dashboard/statistiche', { waitUntil: 'domcontentloaded' })

    // Should still be logged in (not redirected to login)
    const isStillLoggedIn = !page.url().includes('login')
    expect(isStillLoggedIn).toBeTruthy()
  })
})
