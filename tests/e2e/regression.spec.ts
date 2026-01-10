import { test, expect } from '@playwright/test'

test.describe('Regression Tests', () => {
  test('should maintain login functionality after updates', async ({ page }) => {
    await page.goto('/login')

    // Test login form still works
    await expect(page.getByText('Accedi')).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()

    // Test login process
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Verify dashboard still loads
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('should maintain dashboard layout after UI changes', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Verify core dashboard elements still exist
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Allenamenti')).toBeVisible()
    await expect(page.getByText('Clienti')).toBeVisible()
    await expect(page.getByText('Appuntamenti')).toBeVisible()
    await expect(page.getByText('Documenti')).toBeVisible()
    await expect(page.getByText('Statistiche')).toBeVisible()
  })

  test('should maintain appointment functionality after updates', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Navigate to appointments
    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.waitForURL('**/appuntamenti')

    // Verify appointment functionality still works
    await expect(page.getByText('Appuntamenti')).toBeVisible()
    await expect(page.getByText('Nuovo appuntamento')).toBeVisible()
    await expect(page.getByText('Calendario')).toBeVisible()
  })

  test('should maintain document upload functionality', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Navigate to documents
    await page.click('a[href="/dashboard/documenti"]')
    await page.waitForURL('**/documenti')

    // Verify document functionality still works
    await expect(page.getByText('Documenti')).toBeVisible()
    await expect(page.getByText('Carica documento')).toBeVisible()

    // Test upload modal
    await page.click('button:has-text("Carica documento")')
    await expect(page.getByText('Seleziona file')).toBeVisible()
  })

  test('should maintain statistics functionality', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Navigate to statistics
    await page.click('a[href="/dashboard/statistiche"]')
    await page.waitForURL('**/statistiche')

    // Verify statistics functionality still works
    await expect(page.getByText('Statistiche')).toBeVisible()
    await expect(page.getByText('Trend Allenamenti')).toBeVisible()
    await expect(page.getByText('Distribuzione per tipo')).toBeVisible()
  })

  test('should maintain profile functionality', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Navigate to profile
    await page.click('a[href="/dashboard/profilo"]')
    await page.waitForURL('**/profilo')

    // Verify profile functionality still works
    await expect(page.getByText('Profilo')).toBeVisible()
    await expect(page.getByText('Informazioni personali')).toBeVisible()
    await expect(page.getByText('Salva')).toBeVisible()
  })

  test('should maintain mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Verify mobile layout still works
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.locator('button[aria-label="Menu"]')).toBeVisible()
  })

  test('should maintain accessibility features', async ({ page }) => {
    await page.goto('/login')

    // Verify accessibility features still work
    await expect(page.getByText('Accedi')).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeFocused()
  })

  test('should maintain performance after updates', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/login')
    const loadTime = Date.now() - startTime

    // Page should still load quickly
    expect(loadTime).toBeLessThan(3000)

    // Test dashboard load time
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')

    const dashboardStartTime = Date.now()
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
    const dashboardLoadTime = Date.now() - dashboardStartTime

    // Dashboard should still load quickly
    expect(dashboardLoadTime).toBeLessThan(2000)
  })
})
