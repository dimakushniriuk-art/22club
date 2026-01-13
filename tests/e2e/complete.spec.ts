import { test, expect, Locator } from '@playwright/test'
import { loginAsPT, loginAsAthlete } from './helpers/auth'

const softVisible = async (locator: Locator, timeout = 5000) => {
  try {
    await expect(locator).toBeVisible({ timeout })
    return true
  } catch {
    return false
  }
}

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

    // Step 2: Navigate to dashboard
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})

    // Step 3: Verify dashboard elements
    const hasDashboard = await softVisible(page.getByText(/Dashboard|Azioni Rapide/i))
    expect(hasDashboard).toBeTruthy()

    // Step 4: Test navigation to key pages
    const pages = [
      { path: '/dashboard/appuntamenti', name: /Appuntamenti/i },
      { path: '/dashboard/clienti', name: /Clienti/i },
      { path: '/dashboard/statistiche', name: /Statistiche/i },
    ]

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' })
      await page.waitForLoadState('networkidle').catch(() => {})
      const heading = page.getByRole('heading', { name: pageInfo.name })
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

    // Verify athlete home
    const hasHome = await softVisible(page.getByText(/Home|Benvenuto|Allenamenti/i))
    expect(hasHome).toBeTruthy()
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
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    // Try to submit empty form
    await page.click('button[type="submit"]')
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

    // Navigate to multiple pages
    await page.goto('/dashboard/appuntamenti', { waitUntil: 'domcontentloaded' })
    await page.goto('/dashboard/clienti', { waitUntil: 'domcontentloaded' })
    await page.goto('/dashboard/statistiche', { waitUntil: 'domcontentloaded' })

    // Should still be logged in (not redirected to login)
    const isStillLoggedIn = !page.url().includes('login')
    expect(isStillLoggedIn).toBeTruthy()
  })
})
