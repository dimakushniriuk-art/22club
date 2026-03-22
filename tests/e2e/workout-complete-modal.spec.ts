import { test, expect } from '@playwright/test'

/**
 * E2E: flusso "Completa allenamento" — modal obbligatoria Con trainer / Da solo.
 * Richiede PLAYWRIGHT_ATHLETE_EMAIL e PLAYWRIGHT_ATHLETE_PASSWORD.
 */
test.describe('Workout complete modal', () => {
  test.use({ storageState: 'tests/e2e/.auth/athlete-auth.json' })

  test('athlete: click Completa allenamento opens modal with Con trainer / Da solo', async ({
    page,
  }) => {
    await page.goto('/home/allenamenti')
    await expect(page).toHaveURL(/\/home\/allenamenti/)

    // Vai a "Oggi" o alla scheda di oggi se presente
    const oggiLink = page.getByRole('link', { name: /Oggi/i })
    if (await oggiLink.count()) {
      await oggiLink
        .first()
        .click()
        .catch(() => {})
      await page.waitForTimeout(1500)
    }

    // Se c’è il pulsante "Completa allenamento" (sessione in corso con tutti esercizi completati), cliccalo
    const completaBtn = page.getByRole('button', { name: /Completa allenamento/i })
    const hasButton = (await completaBtn.count()) > 0
    if (!hasButton) {
      test.skip()
      return
    }
    await completaBtn.first().click()

    // Modal obbligatoria: deve mostrare le due opzioni
    await expect(page.getByRole('heading', { name: /Completamento Allenamento/i })).toBeVisible({
      timeout: 5000,
    })
    await expect(page.getByRole('button', { name: /Eseguito con Trainer/i })).toBeVisible({
      timeout: 3000,
    })
    await expect(page.getByRole('button', { name: /Eseguito da Solo/i })).toBeVisible({
      timeout: 3000,
    })
  })
})
