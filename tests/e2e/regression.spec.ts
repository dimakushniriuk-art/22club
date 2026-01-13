import { test, expect } from '@playwright/test'
import { loginAsPT } from './helpers/auth'

test.describe('Regression Tests', () => {
  test.setTimeout(60000)

  test('should maintain login functionality after updates', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    // Test login form still works
    await expect(page.getByText(/Accedi|Login/i)).toBeVisible({ timeout: 10000 })
    
    const emailInput = page.locator('#email, input[name="email"]').first()
    const passwordInput = page.locator('#password, input[name="password"]').first()
    
    await expect(emailInput).toBeVisible({ timeout: 5000 })
    await expect(passwordInput).toBeVisible({ timeout: 5000 })
  })

  test('should maintain dashboard layout after login', async ({ page }) => {
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

    // Verify core dashboard elements still exist (at least one)
    const dashboardTexts = [
      /Dashboard/i,
      /Clienti/i,
      /Appuntamenti/i,
      /Azioni Rapide/i,
    ]

    let foundElement = false
    for (const text of dashboardTexts) {
      const isVisible = await page.getByText(text).first().isVisible({ timeout: 3000 }).catch(() => false)
      if (isVisible) {
        foundElement = true
        break
      }
    }

    expect(foundElement).toBeTruthy()
  })

  test('should maintain appointment functionality after updates', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsPT(page)
    await page.waitForURL(/post-login|dashboard|home/, { timeout: 30000 }).catch(() => {})

    // Navigate to appointments
    await page.goto('/dashboard/appuntamenti', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})

    // Verify appointment page loads
    const heading = page.getByRole('heading', { name: /Appuntamenti/i })
    await expect(heading).toBeVisible({ timeout: 15000 })
  })

  test('should maintain client list functionality', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsPT(page)
    await page.waitForURL(/post-login|dashboard|home/, { timeout: 30000 }).catch(() => {})

    // Navigate to clients
    await page.goto('/dashboard/clienti', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})

    // Verify clients page loads
    const heading = page.getByRole('heading', { name: /Clienti/i })
    await expect(heading).toBeVisible({ timeout: 15000 })
  })

  test('should maintain navigation functionality', async ({ page }) => {
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

    // Verify sidebar navigation exists
    const navigation = page.locator('nav, [role="navigation"], aside')
    await expect(navigation.first()).toBeVisible({ timeout: 10000 })
  })

  test('should maintain responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    // Verify page is still usable on mobile
    const loginButton = page.locator('button[type="submit"]')
    await expect(loginButton).toBeVisible({ timeout: 10000 })

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()
    await expect(loginButton).toBeVisible({ timeout: 10000 })
  })
})
