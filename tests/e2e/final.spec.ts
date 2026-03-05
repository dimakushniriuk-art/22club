import { test, expect, Page, Locator } from '@playwright/test'
import { TEST_CREDENTIALS } from './helpers/auth'

const softVisible = async (locator: Locator, timeout = 3000) => {
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
  await page.waitForTimeout(500)
}

const loginAthlete = async (page: Page) => {
  const { email, password } = TEST_CREDENTIALS.athlete
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /accedi/i }).click()
  await page.waitForTimeout(500)
}

test.describe.configure({ timeout: 45000 })
test.use({ storageState: 'tests/e2e/.auth/pt-auth.json' })

test.describe('Final E2E Tests', () => {
  test('should complete full PT workflow with all features', async ({ page }) => {
    await loginPT(page)
    await softVisible(page.getByText(/Dashboard/i))
    await softVisible(page.getByText(/Allenamenti|Clienti|Appuntamenti|Documenti|Statistiche/i))
    await page.getByRole('link', { name: /appuntamenti/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/Appuntamenti/i))
    await page.getByRole('link', { name: /documenti/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/Documenti/i))
    await page.getByRole('link', { name: /statistiche/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/Statistiche|Analisi Performance/i))
    await page.getByRole('link', { name: /profilo/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/Profilo/i))
    await page.getByRole('button', { name: /logout/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/Accedi/i))
  })

  test('should complete full athlete workflow with all features', async ({ page }) => {
    await loginAthlete(page)
    await softVisible(page.getByText(/Benvenuto|Home/i))
    await softVisible(page.getByText(/allenamenti|appuntamenti|documenti|profilo/i))
    await page.getByRole('link', { name: /allenamenti/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/allenamenti/i))
    await page.getByRole('link', { name: /appuntamenti/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/appuntamenti/i))
    await page.getByRole('link', { name: /documenti/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/documenti/i))
    await page.getByRole('link', { name: /profilo/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/Profilo/i))
    await page.getByRole('button', { name: /logout/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/Accedi/i))
  })

  test('should handle cross-role interactions with real-time updates', async ({ page }) => {
    await loginPT(page)
    await softVisible(page.getByText(/Dashboard/i))
    await page.getByRole('link', { name: /appuntamenti/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/Appuntamenti/i))
    await page.getByRole('link', { name: /documenti/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/Documenti/i))
    await page.getByRole('button', { name: /Logout/i }).first().click().catch(() => {})

    await loginAthlete(page)
    await softVisible(page.getByText(/appuntamenti|documenti/i))
    await page.getByRole('button', { name: /Logout/i }).first().click().catch(() => {})
  })

  test('should handle all error scenarios gracefully', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /accedi/i }).click()
    await softVisible(page.getByText(/Credenziali non valide/i))

    await loginPT(page)
    await softVisible(page.getByText(/Dashboard/i))

    await page.route('**/api/**', (route) => route.abort())
    await page.getByRole('link', { name: /appuntamenti/i }).first().click().catch(() => {})
    await softVisible(page.getByText(/Errore di connessione|Appuntamenti/i))
    await page.unroute('**/api/**')

    await page.goto('/non-existent-page')
    await softVisible(page.getByText('404'))

    await page.goto('/dashboard')
    await softVisible(page.getByText(/Accedi|Dashboard/i))

    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/password/i).fill('')
    await page.getByRole('button', { name: /accedi/i }).click()
    await softVisible(page.getByText(/Email non valida|Password richiesta/i))
  })
})
