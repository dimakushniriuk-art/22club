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

    // Step 2: Dashboard overview
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})
    
    const hasDashboard = await softVisible(page.getByText(/Dashboard|Azioni Rapide/i))
    expect(hasDashboard).toBeTruthy()

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

    // Verify athlete home page
    const hasHome = await softVisible(page.getByText(/Home|Benvenuto|Allenamenti|Profilo/i))
    expect(hasHome).toBeTruthy()
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
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    // Enter invalid credentials
    const emailInput = page.locator('#email, input[name="email"]').first()
    await emailInput.waitFor({ state: 'visible', timeout: 10000 })
    await emailInput.fill('invalid@example.com')
    
    const passwordInput = page.locator('#password, input[name="password"]').first()
    await passwordInput.fill('wrongpassword')
    
    await page.click('button[type="submit"]')
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
