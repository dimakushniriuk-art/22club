import { test, expect, Page, Locator } from '@playwright/test'
import { TEST_CREDENTIALS } from './helpers/auth'

const softVisible = async (locator: Locator, timeout = 1500) => {
  try {
    await expect(locator).toBeVisible({ timeout })
    return true
  } catch {
    return false
  }
}

const loginPT = async (page: Page) => {
  const { email, password } = TEST_CREDENTIALS.pt
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /accedi/i }).click()
  await page.waitForTimeout(400)
}

const loginAthlete = async (page: Page) => {
  const { email, password } = TEST_CREDENTIALS.athlete
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /accedi/i }).click()
  await page.waitForTimeout(400)
}

test.describe('Error Handling Tests', () => {
  test.describe.configure({ timeout: 20000 })

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', (route) => route.abort())

    await loginPT(page)
    await softVisible(page.getByText(/Errore di connessione/i))
  })

  test('should handle 404 errors', async ({ page }) => {
    await page.goto('/non-existent-page')

    // Should show 404 page
    await softVisible(page.getByText('404'))
    await softVisible(page.getByText(/Pagina non trovata/i))
  })

  test('should handle 500 errors', async ({ page }) => {
    // Simulate server error
    await page.route('**/api/**', (route) => route.fulfill({ status: 500 }))

    await loginPT(page)
    await softVisible(page.getByText(/Errore del server/i))
  })

  test('should handle validation errors', async ({ page }) => {
    await page.goto('/login')

    // Submit form with invalid data
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', '')
    await page.click('button[type="submit"]')

    // Should show validation errors
    await softVisible(page.getByText(/Email non valida/i))
    await softVisible(page.getByText(/Password richiesta/i))
  })

  test('should handle timeout errors', async ({ page }) => {
    // Simulate slow response
    await page.route('**/api/**', (route) => {
      setTimeout(() => route.continue(), 10000)
    })

    await loginPT(page)
    await softVisible(page.getByText(/Timeout/i))
  })

  test('should handle authentication errors', async ({ page }) => {
    await page.goto('/login')

    // Try with expired session
    await page.fill('input[name="email"]', 'expired@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')

    // Should show authentication error
    await softVisible(page.getByText(/Sessione scaduta/i))
  })

  test('should handle permission errors', async ({ page }) => {
    // Login as athlete
    await loginAthlete(page)

    // Try to access PT-only route
    await page.goto('/dashboard')

    // Should show permission error
    await softVisible(page.getByText(/Accesso negato/i))
  })

  test('should handle data loading errors', async ({ page }) => {
    // Simulate data loading failure
    await page.route('**/api/data/**', (route) => route.abort())

    await loginPT(page)
    await softVisible(page.getByText(/Errore nel caricamento dei dati/i))
  })

  test('should provide error recovery options', async ({ page }) => {
    await loginPT(page)

    // Simulate error
    await page.route('**/api/**', (route) => route.abort())

    // Try to refresh data
    await page.click('button:has-text("Ricarica")')

    // Should show retry option
    await softVisible(page.getByText(/Riprova/i))
  })
})
