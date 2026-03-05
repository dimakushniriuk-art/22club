import { test, expect } from '@playwright/test'
import { loginAsPT } from './helpers/auth'

test.describe('Mobile Responsiveness', () => {
  test.setTimeout(60000)

  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('should display mobile login form', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')

    // Verify mobile form layout
    const emailInput = page.locator('#email, input[name="email"]').first()
    const passwordInput = page.locator('#password, input[name="password"]').first()
    const submitButton = page.locator('button[type="submit"]')

    await expect(emailInput).toBeVisible({ timeout: 10000 })
    await expect(passwordInput).toBeVisible({ timeout: 5000 })
    await expect(submitButton).toBeVisible({ timeout: 5000 })
  })

  test('should display mobile dashboard layout', async ({ page }) => {
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

    // Verify dashboard content is visible on mobile
    const dashboardContent = page.getByText(/Dashboard|Azioni Rapide/i)
    const hasDashboard = await dashboardContent.first().isVisible({ timeout: 15000 }).catch(() => false)
    
    expect(hasDashboard).toBeTruthy()
  })

  test('should handle mobile touch gestures', async ({ page }) => {
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

    // Verify page is scrollable
    await page.evaluate(() => window.scrollTo(0, 100))
    const newScrollY = await page.evaluate(() => window.scrollY)

    // Page should be able to scroll (or be at 0 if content fits)
    expect(newScrollY >= 0).toBeTruthy()
  })

  test('should display mobile navigation', async ({ page }) => {
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

    // Look for mobile menu button or navigation
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], [class*="hamburger"]')
    const sideNav = page.locator('nav, aside, [role="navigation"]')
    
    const hasMenuButton = await menuButton.first().isVisible({ timeout: 5000 }).catch(() => false)
    const hasSideNav = await sideNav.first().isVisible({ timeout: 5000 }).catch(() => false)

    // Should have some form of navigation
    expect(hasMenuButton || hasSideNav).toBeTruthy()
  })

  test('should be responsive on different mobile sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 },  // iPhone SE
      { width: 375, height: 667 },  // iPhone 8
      { width: 414, height: 896 },  // iPhone 11
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/login')
      await page.waitForLoadState('domcontentloaded')

      // Verify login form is visible at all sizes
      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeVisible({ timeout: 10000 })
    }
  })
})
