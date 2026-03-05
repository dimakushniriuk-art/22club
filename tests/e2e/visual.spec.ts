import { test, expect } from '@playwright/test'
import { loginAsPT, loginAsAthlete } from './helpers/auth'

test.describe('Visual Regression Tests', () => {
  test.setTimeout(60000)

  test('should match login page screenshot', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle').catch(() => {})
    await expect(page).toHaveScreenshot('login-page.png', { maxDiffPixels: 100 })
  })

  test('should match dashboard screenshot', async ({ page }) => {
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

    await expect(page).toHaveScreenshot('dashboard.png', { maxDiffPixels: 500 })
  })

  test('should match appointments page screenshot', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsPT(page)
    await page.waitForURL(/post-login|dashboard|home/, { timeout: 30000 }).catch(() => {})

    await page.goto('/dashboard/appuntamenti', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})

    await expect(page).toHaveScreenshot('appointments-page.png', { maxDiffPixels: 500 })
  })

  test('should match statistics page screenshot', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsPT(page)
    await page.waitForURL(/post-login|dashboard|home/, { timeout: 30000 }).catch(() => {})

    await page.goto('/dashboard/statistiche', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})

    await expect(page).toHaveScreenshot('statistics-page.png', { maxDiffPixels: 500 })
  })

  test('should match profile page screenshot', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsPT(page)
    await page.waitForURL(/post-login|dashboard|home/, { timeout: 30000 }).catch(() => {})

    await page.goto('/dashboard/profilo', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle').catch(() => {})

    await expect(page).toHaveScreenshot('profile-page.png', { maxDiffPixels: 500 })
  })

  test('should match athlete home screenshot', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsAthlete(page)
    await page.waitForURL(/post-login|home|dashboard/, { timeout: 30000 }).catch(() => {})

    await page.waitForLoadState('networkidle').catch(() => {})

    await expect(page).toHaveScreenshot('athlete-home.png', { maxDiffPixels: 500 })
  })

  test('should match mobile layout screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/login')
    await page.waitForLoadState('networkidle').catch(() => {})
    await expect(page).toHaveScreenshot('login-mobile.png', { maxDiffPixels: 100 })
  })

  test('should match error page screenshots', async ({ page }) => {
    await page.goto('/non-existent-page')
    await page.waitForLoadState('networkidle').catch(() => {})
    await expect(page).toHaveScreenshot('404-page.png', { maxDiffPixels: 100 })
  })

  test('should match form validation screenshots', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle').catch(() => {})

    // Submit empty form
    await page.click('button[type="submit"]')
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('login-validation.png', { maxDiffPixels: 100 })
  })
})
