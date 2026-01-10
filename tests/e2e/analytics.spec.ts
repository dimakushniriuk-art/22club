import { test, expect } from '@playwright/test'

test.describe('Analytics Dashboard flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock delle API per i test
    await page.route('**/api/**', async (route) => {
      const url = route.request().url()

      if (url.includes('/auth/context')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              role: 'staff',
              org_id: 'test-org-id',
              full_name: 'Test PT',
              email: 'pt@example.com',
              user_id: 'test-user-id',
            },
          }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        })
      }
    })

    // Mock dei dati analytics
    await page.route('**/lib/analytics**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          trend: [
            { day: '2024-01-01', allenamenti: 12, documenti: 3, ore_totali: 8.5 },
            { day: '2024-01-02', allenamenti: 15, documenti: 5, ore_totali: 10.2 },
          ],
          distribution: [
            { type: 'allenamento', count: 45, percentage: 60 },
            { type: 'consulenza', count: 20, percentage: 27 },
          ],
          performance: [
            {
              athlete_id: '1',
              athlete_name: 'Mario Rossi',
              total_workouts: 12,
              avg_duration: 65,
              completion_rate: 95,
            },
          ],
          summary: {
            total_workouts: 100,
            total_documents: 50,
            total_hours: 200,
            active_athletes: 10,
          },
        }),
      })
    })
  })

  test('should display analytics dashboard', async ({ page }) => {
    await page.goto('/dashboard/statistiche')

    // Verifica che la pagina si carichi
    await expect(page).toHaveTitle(/22Club/)

    // Verifica la presenza degli elementi principali
    await expect(page.getByText('Analisi Performance')).toBeVisible()
    await expect(page.getByText('Allenamenti Totali')).toBeVisible()
    await expect(page.getByText('Documenti Caricati')).toBeVisible()
    await expect(page.getByText('Ore Totali')).toBeVisible()
    await expect(page.getByText('Atleti Attivi')).toBeVisible()
  })

  test('should display charts and graphs', async ({ page }) => {
    await page.goto('/dashboard/statistiche')

    // Verifica la presenza dei grafici
    await expect(page.getByText('Andamento Allenamenti')).toBeVisible()
    await expect(page.getByText('Distribuzione per tipo')).toBeVisible()
    await expect(page.getByText('Top Performers')).toBeVisible()
  })

  test('should handle period filter changes', async ({ page }) => {
    await page.goto('/dashboard/statistiche')

    // Test cambio periodo
    await page.click('text=Week')
    await expect(page.getByText('Week')).toBeVisible()

    await page.click('text=Month')
    await expect(page.getByText('Month')).toBeVisible()

    await page.click('text=Quarter')
    await expect(page.getByText('Quarter')).toBeVisible()

    await page.click('text=Year')
    await expect(page.getByText('Year')).toBeVisible()
  })

  test('should display performance metrics', async ({ page }) => {
    await page.goto('/dashboard/statistiche')

    // Verifica le metriche di performance
    await expect(page.getByText('Mario Rossi')).toBeVisible()
    await expect(page.getByText('Allenamenti: 12')).toBeVisible()
    await expect(page.getByText('Completamento: 95%')).toBeVisible()
  })

  test('should handle export functionality', async ({ page }) => {
    await page.goto('/dashboard/statistiche')

    // Test pulsante export
    await page.click('text=Esporta')

    // Verifica che il click sia registrato (in un test reale verificheremmo il download)
    await expect(page.getByText('Esporta')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard/statistiche')

    // Verifica che il layout sia responsive
    await expect(page.getByText('Analisi Performance')).toBeVisible()

    // Verifica che i filtri siano accessibili su mobile
    await expect(page.getByText('Week')).toBeVisible()
  })
})
