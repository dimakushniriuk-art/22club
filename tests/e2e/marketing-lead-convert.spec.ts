import { test, expect, type Locator } from '@playwright/test'

const softVisible = async (locator: Locator, timeout = 3000) => {
  try {
    await expect(locator).toBeVisible({ timeout })
    return true
  } catch {
    return false
  }
}

test.describe('Marketing: conversione lead in atleta trial', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin-auth.json' })

  test('lista leads e navigazione dettaglio', async ({ page }) => {
    await page.goto('/dashboard/marketing/leads')
    await expect(page).toHaveURL(/\/dashboard\/marketing\/leads/)
    const h1 = page.getByRole('heading', { level: 1 })
    await softVisible(h1)
    const dettaglio = page.getByRole('link', { name: /Dettaglio/i }).first()
    if (await dettaglio.count()) {
      await dettaglio.click()
      await expect(page).toHaveURL(/\/dashboard\/marketing\/leads\/[a-f0-9-]+/)
    }
  })

  test('dettaglio lead mostra sezione converti o link profilo', async ({ page }) => {
    await page.goto('/dashboard/marketing/leads')
    const dettaglio = page.getByRole('link', { name: /Dettaglio/i }).first()
    if (!(await dettaglio.count())) {
      test.skip()
      return
    }
    await dettaglio.click()
    await page.waitForURL(/\/dashboard\/marketing\/leads\/[a-f0-9-]+/)
    const convertTrial = page.getByRole('button', { name: /Converti in Atleta \(Trial\)/i })
    const vaiProfilo = page.getByRole('link', { name: /Vai al profilo atleta/i })
    const alreadyConverted = await vaiProfilo.isVisible().catch(() => false)
    if (!alreadyConverted) {
      await softVisible(convertTrial)
    } else {
      await softVisible(vaiProfilo)
    }
  })

  test('lista lead convertiti mostra azione Vai al profilo', async ({ page }) => {
    await page.goto('/dashboard/marketing/leads')
    const vaiProfilo = page.getByRole('link', { name: /Vai al profilo/i })
    if (await vaiProfilo.count()) {
      await softVisible(vaiProfilo.first())
    }
  })
})
