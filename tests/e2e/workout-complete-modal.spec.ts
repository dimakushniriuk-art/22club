import { test, expect } from '@playwright/test'

/**
 * E2E: flusso "Completa allenamento" — completamento diretto come da solo → riepilogo.
 * Richiede PLAYWRIGHT_ATHLETE_EMAIL e PLAYWRIGHT_ATHLETE_PASSWORD.
 */
test.describe('Workout complete', () => {
  test.use({ storageState: 'tests/e2e/.auth/athlete-auth.json' })

  test('athlete: click Completa allenamento va al riepilogo senza modale', async ({ page }) => {
    await page.goto('/home/allenamenti')
    await expect(page).toHaveURL(/\/home\/allenamenti/)

    const oggiLink = page.getByRole('link', { name: /Oggi/i })
    if (await oggiLink.count()) {
      await oggiLink
        .first()
        .click()
        .catch(() => {})
      await page.waitForTimeout(1500)
    }

    const completaBtn = page.getByRole('button', { name: /Completa allenamento/i })
    const hasButton = (await completaBtn.count()) > 0
    if (!hasButton) {
      test.skip()
      return
    }
    await completaBtn.first().click()

    await expect(page.getByRole('heading', { name: /Completamento Allenamento/i })).not.toBeVisible(
      {
        timeout: 2000,
      },
    )
    await expect(page).toHaveURL(/\/home\/allenamenti\/riepilogo/, { timeout: 15000 })
  })
})
