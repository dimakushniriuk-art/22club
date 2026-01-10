import { test, expect } from '@playwright/test'

test.describe('Dashboard PT Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
  })

  test('should login and view KPI dashboard', async ({ page }) => {
    // Fill login form
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard')

    // Verify dashboard elements
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Allenamenti')).toBeVisible()
    await expect(page.getByText('Clienti')).toBeVisible()
    await expect(page.getByText('Prossimi Appuntamenti')).toBeVisible()
  })

  test('should navigate to statistics page', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Navigate to statistics
    await page.click('a[href="/dashboard/statistiche"]')
    await page.waitForURL('**/statistiche')

    // Verify statistics page
    await expect(page.getByText('Statistiche')).toBeVisible()
    await expect(page.getByText('Trend Allenamenti')).toBeVisible()
  })

  test('should display sidebar navigation', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Verify sidebar elements
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Appuntamenti')).toBeVisible()
    await expect(page.getByText('Clienti')).toBeVisible()
    await expect(page.getByText('Documenti')).toBeVisible()
    await expect(page.getByText('Statistiche')).toBeVisible()
  })
})
