import { test, expect } from '@playwright/test'

/**
 * Marketing Secure Layer: atleti e KPI.
 * - Admin/marketing apre /dashboard/marketing/athletes e vede KPI (dati da view safe, no raw).
 * - La pagina usa GET /api/marketing/athletes (solo view marketing_athletes).
 */
test.describe('Marketing: pagina Atleti e KPI', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin-auth.json' })

  test('pagina atleti si carica e mostra sezione KPI o tabella', async ({ page }) => {
    await page.goto('/dashboard/marketing/athletes')
    await expect(page).toHaveURL(/\/dashboard\/marketing\/athletes/)

    await expect(page.getByRole('heading', { level: 1, name: /Atleti/i })).toBeVisible({
      timeout: 10000,
    })

    const totAtleti = page.getByText(/Totale atleti/i)
    const workoutTrainer = page.getByText(/Workout con trainer/i)
    const workoutSolo = page.getByText(/Workout da solo/i)
    const inattivi = page.getByText(/Inattivi/i)

    const hasKpiCards =
      (await totAtleti.isVisible().catch(() => false)) ||
      (await workoutTrainer.isVisible().catch(() => false)) ||
      (await workoutSolo.isVisible().catch(() => false)) ||
      (await inattivi.isVisible().catch(() => false))

    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false)
    expect(hasKpiCards || hasTable).toBeTruthy()
  })
})
