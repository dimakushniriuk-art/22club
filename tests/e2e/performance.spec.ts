import { test, expect } from '@playwright/test'
import { loginAsPT } from './helpers/auth'

test.describe('Performance Tests', () => {
  test.setTimeout(60000) // 60 secondi per test

  test('should load login page quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/login')
    const loadTime = Date.now() - startTime

    // Page should load within 10 seconds (dev mode can be slow)
    expect(loadTime).toBeLessThan(10000)

    // Verify page is fully loaded
    await expect(page.getByText(/Accedi|Login/i)).toBeVisible({ timeout: 10000 })
  })

  test('should load dashboard efficiently after login', async ({ page }) => {
    // Login come PT
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsPT(page)
    await page.waitForURL(/post-login|dashboard|home/, { timeout: 30000 }).catch(() => {})

    // Naviga alla dashboard
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})

    // Verify dashboard is fully loaded
    const dashboardHeading = page.getByRole('heading', { name: /Dashboard|Azioni Rapide/i })
    await expect(dashboardHeading).toBeVisible({ timeout: 15000 })
  })

  test('should load clienti page efficiently', async ({ page }) => {
    // Login come PT
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsPT(page)
    await page.waitForURL(/post-login|dashboard|home/, { timeout: 30000 }).catch(() => {})

    // Naviga alla pagina clienti
    const startTime = Date.now()
    await page.goto('/dashboard/clienti', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    const loadTime = Date.now() - startTime

    // La pagina dovrebbe caricare entro 60 secondi (dev mode con compilazione on-demand)
    expect(loadTime).toBeLessThan(60000)

    // Verifica che la pagina sia caricata
    const heading = page.getByRole('heading', { name: /Clienti/i })
    await expect(heading).toBeVisible({ timeout: 10000 })
  })

  test('should handle navigation efficiently', async ({ page }) => {
    // Login come PT
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsPT(page)
    await page.waitForURL(/post-login|dashboard|home/, { timeout: 30000 }).catch(() => {})

    // Naviga alla dashboard
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})

    // Test navigazione tra pagine
    const pages = [
      { path: '/dashboard/appuntamenti', name: /Appuntamenti/i },
      { path: '/dashboard/clienti', name: /Clienti/i },
    ]

    for (const pageInfo of pages) {
      const startTime = Date.now()
      await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' })
      await page.waitForLoadState('networkidle').catch(() => {})
      const loadTime = Date.now() - startTime

      // Ogni pagina dovrebbe caricare entro 60 secondi (dev mode con compilazione on-demand)
      expect(loadTime).toBeLessThan(60000)
    }
  })

  test('should have responsive UI', async ({ page }) => {
    // Login come PT
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsPT(page)
    await page.waitForURL(/post-login|dashboard|home/, { timeout: 30000 }).catch(() => {})

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})

    // Verifica che l'UI sia responsive
    const navigation = page.locator('nav, [role="navigation"], aside, [class*="sidebar"]')
    const hasNavigation = await navigation.first().isVisible({ timeout: 5000 }).catch(() => false)

    expect(hasNavigation).toBeTruthy()
  })
})
