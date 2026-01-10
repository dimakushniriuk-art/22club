import { test, expect } from '@playwright/test'

test.describe('Statistics Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as PT first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
  })

  test('should navigate to statistics page', async ({ page }) => {
    await page.click('a[href="/dashboard/statistiche"]')
    await page.waitForURL('**/statistiche')

    await expect(page.getByText('Statistiche')).toBeVisible()
    await expect(page.getByText('Trend Allenamenti')).toBeVisible()
  })

  test('should display KPI metrics', async ({ page }) => {
    await page.goto('/dashboard/statistiche')

    // Verify KPI cards
    await expect(page.getByText('Allenamenti totali')).toBeVisible()
    await expect(page.getByText('Clienti attivi')).toBeVisible()
    await expect(page.getByText('Fatturato mensile')).toBeVisible()
    await expect(page.getByText('Soddisfazione clienti')).toBeVisible()
  })

  test('should display trend charts', async ({ page }) => {
    await page.goto('/dashboard/statistiche')

    // Verify chart elements
    await expect(page.getByText('Trend Allenamenti')).toBeVisible()
    await expect(page.getByText('Distribuzione per tipo')).toBeVisible()
    await expect(page.getByText('Performance Top 5')).toBeVisible()
  })

  test('should filter data by period', async ({ page }) => {
    await page.goto('/dashboard/statistiche')

    // Select different time period
    await page.click('select[name="period"]')
    await page.selectOption('select[name="period"]', 'month')

    // Verify data updates
    await expect(page.getByText('Ultimo mese')).toBeVisible()
  })

  test('should export statistics data', async ({ page }) => {
    await page.goto('/dashboard/statistiche')

    // Click export button
    await page.click('button:has-text("Esporta")')

    // Verify export options
    await expect(page.getByText('Esporta come PDF')).toBeVisible()
    await expect(page.getByText('Esporta come Excel')).toBeVisible()
  })
})
