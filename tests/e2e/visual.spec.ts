import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test('should match login page screenshot', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveScreenshot('login-page.png')
  })

  test('should match dashboard screenshot', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await expect(page).toHaveScreenshot('dashboard.png')
  })

  test('should match appointments page screenshot', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.waitForURL('**/appuntamenti')

    await expect(page).toHaveScreenshot('appointments-page.png')
  })

  test('should match documents page screenshot', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await page.click('a[href="/dashboard/documenti"]')
    await page.waitForURL('**/documenti')

    await expect(page).toHaveScreenshot('documents-page.png')
  })

  test('should match statistics page screenshot', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await page.click('a[href="/dashboard/statistiche"]')
    await page.waitForURL('**/statistiche')

    await expect(page).toHaveScreenshot('statistics-page.png')
  })

  test('should match profile page screenshot', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await page.click('a[href="/dashboard/profilo"]')
    await page.waitForURL('**/profilo')

    await expect(page).toHaveScreenshot('profile-page.png')
  })

  test('should match athlete home screenshot', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    await expect(page).toHaveScreenshot('athlete-home.png')
  })

  test('should match mobile layout screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/login')
    await expect(page).toHaveScreenshot('login-mobile.png')

    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await expect(page).toHaveScreenshot('dashboard-mobile.png')
  })

  test('should match error page screenshots', async ({ page }) => {
    await page.goto('/non-existent-page')
    await expect(page).toHaveScreenshot('404-page.png')
  })

  test('should match form validation screenshots', async ({ page }) => {
    await page.goto('/login')

    // Submit empty form
    await page.click('button[type="submit"]')
    await expect(page).toHaveScreenshot('login-validation.png')

    // Fill invalid data
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', '')
    await page.click('button[type="submit"]')
    await expect(page).toHaveScreenshot('login-invalid.png')
  })
})
