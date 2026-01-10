import { test, expect } from '@playwright/test'

test.describe('Error Handling Tests', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', (route) => route.abort())

    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.getByText('Errore di connessione')).toBeVisible()
  })

  test('should handle 404 errors', async ({ page }) => {
    await page.goto('/non-existent-page')

    // Should show 404 page
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText('Pagina non trovata')).toBeVisible()
  })

  test('should handle 500 errors', async ({ page }) => {
    // Simulate server error
    await page.route('**/api/**', (route) => route.fulfill({ status: 500 }))

    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.getByText('Errore del server')).toBeVisible()
  })

  test('should handle validation errors', async ({ page }) => {
    await page.goto('/login')

    // Submit form with invalid data
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', '')
    await page.click('button[type="submit"]')

    // Should show validation errors
    await expect(page.getByText('Email non valida')).toBeVisible()
    await expect(page.getByText('Password richiesta')).toBeVisible()
  })

  test('should handle timeout errors', async ({ page }) => {
    // Simulate slow response
    await page.route('**/api/**', (route) => {
      setTimeout(() => route.continue(), 10000)
    })

    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')

    // Should show timeout message
    await expect(page.getByText('Timeout')).toBeVisible()
  })

  test('should handle authentication errors', async ({ page }) => {
    await page.goto('/login')

    // Try with expired session
    await page.fill('input[name="email"]', 'expired@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')

    // Should show authentication error
    await expect(page.getByText('Sessione scaduta')).toBeVisible()
  })

  test('should handle permission errors', async ({ page }) => {
    // Login as athlete
    await page.goto('/login')
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    // Try to access PT-only route
    await page.goto('/dashboard')

    // Should show permission error
    await expect(page.getByText('Accesso negato')).toBeVisible()
  })

  test('should handle data loading errors', async ({ page }) => {
    // Simulate data loading failure
    await page.route('**/api/data/**', (route) => route.abort())

    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Should show data loading error
    await expect(page.getByText('Errore nel caricamento dei dati')).toBeVisible()
  })

  test('should provide error recovery options', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Simulate error
    await page.route('**/api/**', (route) => route.abort())

    // Try to refresh data
    await page.click('button:has-text("Ricarica")')

    // Should show retry option
    await expect(page.getByText('Riprova')).toBeVisible()
  })
})
