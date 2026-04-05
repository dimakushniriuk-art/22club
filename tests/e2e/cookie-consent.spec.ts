import { test, expect } from '@playwright/test'

test.describe('Cookie consent (anonimo)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.removeItem('22club-cookie-preferences')
        localStorage.removeItem('cookie-consent')
      } catch {
        /* ignore */
      }
    })
  })

  test('mostra banner e chiude con Solo necessari', async ({ page }) => {
    await page.goto('/login')
    const region = page.getByRole('region', { name: 'Consenso cookie' })
    await expect(region).toBeVisible()
    await page.getByRole('button', { name: 'Solo necessari' }).click()
    await expect(region).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Preferenze cookie' })).toBeVisible()
  })

  test('Preferenze cookie apre dialog accessibile', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Solo necessari' }).click()
    await page.getByRole('button', { name: 'Preferenze cookie' }).click()
    const dialog = page.getByRole('dialog', { name: /cookie e dati locali/i })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  })
})
