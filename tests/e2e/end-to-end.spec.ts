import { test, expect } from '@playwright/test'
import { loginAsPT, loginAsAthlete, dismissCookieBanner } from './helpers/auth'

test.describe('End-to-End Tests', () => {
  test.setTimeout(90000)

  test('should complete full PT workflow from login to navigation', async ({ page }) => {
    // Complete PT workflow: Login → Dashboard → Key pages

    // Step 1: Login
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

    // Step 2: Dashboard overview
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    
    // Cerca heading "Azioni Rapide" (più specifico)
    const headingAzioniRapide = page.getByRole('heading', { name: /Azioni Rapide/i })
    await expect(headingAzioniRapide).toBeVisible({ timeout: 15000 })

    // Step 3: Navigate to appointments
    await page.goto('/dashboard/appuntamenti', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    
    const appointmentsHeading = page.getByRole('heading', { name: /Appuntamenti/i })
    await expect(appointmentsHeading).toBeVisible({ timeout: 15000 })

    // Step 4: View statistics
    await page.goto('/dashboard/statistiche', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    
    const statsHeading = page.getByRole('heading', { name: /Statistiche/i })
    await expect(statsHeading).toBeVisible({ timeout: 15000 })

    // Step 5: View profile
    await page.goto('/dashboard/profilo', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    
    const profileHeading = page.getByRole('heading', { name: /Profilo/i })
    await expect(profileHeading).toBeVisible({ timeout: 15000 })
  })

  test('should complete full athlete workflow', async ({ page }) => {
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

    // Verify athlete home page
    // Attendi che la pagina sia completamente caricata
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
    // Cerca heading "Benvenuto" (più specifico)
    const headingBenvenuto = page.getByRole('heading', { name: /benvenuto/i })
    await expect(headingBenvenuto).toBeVisible({ timeout: 15000 })
  })

  test('should handle role-based access control', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard')
    
    // Should redirect to login
    await page.waitForURL(/login/, { timeout: 10000 }).catch(() => {})
    const redirectedToLogin = page.url().includes('login')
    expect(redirectedToLogin).toBeTruthy()
  })

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Imposta cookie consent PRIMA di navigare per prevenire il banner
    await page.addInitScript(() => {
      localStorage.setItem('cookie-consent', 'true')
    })
    
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    
    // Chiudi il cookie banner se presente (critico per Mobile Chrome/Safari)
    await dismissCookieBanner(page)

    // Enter invalid credentials
    const emailInput = page.locator('#email, input[name="email"]').first()
    await emailInput.waitFor({ state: 'visible', timeout: 10000 })
    await emailInput.fill('invalid@example.com')
    
    // Verifica che il banner non blocchi prima di cliccare password
    await dismissCookieBanner(page)
    const passwordInput = page.locator('#password, input[name="password"]').first()
    await passwordInput.fill('wrongpassword')
    
    // Verifica che il banner non blocchi prima di cliccare submit
    await dismissCookieBanner(page)
    await page.click('button[type="submit"]', { force: true })
    await page.waitForTimeout(2000)

    // Should show error or stay on login
    const isOnLogin = page.url().includes('login')
    expect(isOnLogin).toBeTruthy()
  })

  test('should support navigation between main sections', async ({ page }) => {
    // Login as PT
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

    // Test rapid navigation between sections
    const sections = [
      '/dashboard',
      '/dashboard/clienti',
      '/dashboard/appuntamenti',
      '/dashboard/statistiche',
    ]

    for (const section of sections) {
      await page.goto(section, { waitUntil: 'domcontentloaded' })
      // Verify we're not redirected to login
      expect(page.url()).not.toContain('/login')
    }
  })
})
