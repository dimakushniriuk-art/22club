import { test, expect } from '@playwright/test'

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('should display mobile navigation', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Verify mobile menu button
    await expect(page.locator('button[aria-label="Menu"]')).toBeVisible()

    // Click mobile menu
    await page.click('button[aria-label="Menu"]')

    // Verify mobile menu items
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Appuntamenti')).toBeVisible()
    await expect(page.getByText('Clienti')).toBeVisible()
  })

  test('should display mobile dashboard layout', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Verify mobile layout elements
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Allenamenti')).toBeVisible()

    // Check if KPI cards are stacked vertically
    const kpiCards = page.locator('[data-testid="kpi-card"]')
    await expect(kpiCards).toHaveCount(4)
  })

  test('should handle mobile forms', async ({ page }) => {
    await page.goto('/login')

    // Verify mobile form layout
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()

    // Test form interaction
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/dashboard')
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('should display mobile calendar', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Navigate to appointments
    await page.click('a[href="/dashboard/appuntamenti"]')

    // Verify mobile calendar
    await expect(page.getByText('Calendario')).toBeVisible()

    // Check if calendar is responsive
    const calendar = page.locator('[data-testid="calendar"]')
    await expect(calendar).toBeVisible()
  })

  test('should handle mobile touch interactions', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Test touch interactions
    const kpiCard = page.locator('[data-testid="kpi-card"]').first()
    await kpiCard.tap()

    // Verify touch feedback
    await expect(kpiCard).toHaveClass(/active/)
  })
})
