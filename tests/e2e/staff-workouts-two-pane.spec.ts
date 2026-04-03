import { test, expect } from '@playwright/test'

// Sessione PT generata dal global setup
test.use({ storageState: 'tests/e2e/.auth/pt-auth.json' })

test.describe.configure({ timeout: 60000 })

test.describe('Staff Workouts two-pane (no iframe)', () => {
  test('apre atleta in slot e naviga scheda senza uscire da Workouts', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/workouts')
    await expect(page).toHaveURL(/\/dashboard\/workouts/, { timeout: 20000 })

    // Verifica che non ci siano iframe (two-pane nativo)
    await expect(page.locator('iframe')).toHaveCount(0)

    const openBtns = page.getByRole('button', { name: /Apri vista allenamenti/i })
    if (!(await openBtns.count())) {
      test.skip(true, 'Nessun evento agenda cliccabile disponibile')
      return
    }

    await openBtns.first().click()

    await expect
      .poll(async () => new URL(page.url()).searchParams.get('p1') || '', { timeout: 15000 })
      .not.toBe('')

    // Tenta navigazione interna: scheda (se presente almeno un link scheda)
    const schedaLink = page.locator('a[href*="p1view=scheda"]').first()
    if (await schedaLink.count()) {
      await schedaLink.click()
      await expect(page).toHaveURL(/\/dashboard\/workouts.*p1view=scheda/, { timeout: 15000 })
    }
  })
})

