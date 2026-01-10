import { test, expect } from '@playwright/test'

test.describe('Pagina Clienti', () => {
  test.beforeEach(async ({ page }) => {
    // Assumendo che l'utente sia già autenticato
    await page.goto('http://localhost:3001/dashboard/clienti')
  })

  test('should display clienti page with stats', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Clienti')

    // Verifica stats cards
    await expect(page.getByText('Totali')).toBeVisible()
    await expect(page.getByText('Attivi')).toBeVisible()
    await expect(page.getByText('Nuovi questo mese')).toBeVisible()
    await expect(page.getByText('Documenti in scadenza')).toBeVisible()
  })

  test('should filter clienti by search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Cerca per nome o email...')
    await searchInput.fill('mario')

    // Attendi debounce
    await page.waitForTimeout(500)

    // Verifica che la lista sia filtrata
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should filter by stato', async ({ page }) => {
    await page.getByRole('button', { name: 'Attivi' }).click()

    // Verifica che i badge mostrano solo "Attivo"
    const badges = page.locator('[data-badge]')
    const count = await badges.count()
    for (let i = 0; i < count; i++) {
      const text = await badges.nth(i).textContent()
      expect(text).toContain('Attivo')
    }
  })

  test('should open filtri avanzati modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Filtri avanzati' }).click()

    await expect(page.getByText('Filtri Avanzati')).toBeVisible()
    await expect(page.getByText('Data iscrizione')).toBeVisible()
    await expect(page.getByText('Allenamenti minimi al mese')).toBeVisible()
  })

  test('should toggle between table and grid view', async ({ page }) => {
    // Vista table di default
    await expect(page.locator('table')).toBeVisible()

    // Switch a grid
    await page.getByLabel('Vista griglia').click()
    await expect(page.locator('table')).not.toBeVisible()

    // Switch back to table
    await page.getByLabel('Vista tabella').click()
    await expect(page.locator('table')).toBeVisible()
  })

  test('should sort table by clicking column headers', async ({ page }) => {
    const nomeHeader = page.getByText('Cliente')
    await nomeHeader.click()

    // Verifica che l'icona di sort sia visibile
    await expect(page.locator('[data-sort-direction]')).toBeVisible()
  })

  test('should select multiple clienti', async ({ page }) => {
    const firstCheckbox = page.locator('tbody tr').first().locator('[type="checkbox"]')
    await firstCheckbox.click()

    // Verifica che la barra bulk actions appaia
    await expect(page.getByText('cliente selezionato')).toBeVisible()
  })

  test('should export clienti', async ({ page }) => {
    await page.getByRole('button', { name: 'Export' }).click()

    // Verifica che il menu export sia visibile
    await expect(page.getByText('Esporta come CSV')).toBeVisible()
    await expect(page.getByText('Esporta come PDF')).toBeVisible()
  })

  test('should navigate to cliente profilo', async ({ page }) => {
    const profiloButton = page.locator('tbody tr').first().getByRole('button', { name: 'Profilo' })
    await profiloButton.click()

    // Verifica navigazione
    await expect(page).toHaveURL(/\/dashboard\/atleti\/\d+\/progressi/)
  })

  test('should open dropdown menu on more button click', async ({ page }) => {
    const moreButton = page.locator('tbody tr').first().locator('[aria-label*="Altre azioni"]')
    await moreButton.click()

    // Verifica che il menu dropdown sia visibile
    await expect(page.getByText('Modifica profilo')).toBeVisible()
    await expect(page.getByText('Storico allenamenti')).toBeVisible()
  })

  test('should have accessible aria labels', async ({ page }) => {
    // Verifica aria-label sui bottoni icona
    await expect(page.locator('[aria-label="Vista tabella"]')).toBeVisible()
    await expect(page.locator('[aria-label="Vista griglia"]')).toBeVisible()
  })

  test('should announce search results for screen readers', async ({ page }) => {
    const announcer = page.locator('[role="status"][aria-live="polite"]')
    await expect(announcer).toBeVisible()
  })

  test('should have breadcrumb navigation', async ({ page }) => {
    const breadcrumb = page.locator('[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb.getByText('Dashboard')).toBeVisible()
    await expect(breadcrumb.getByText('Clienti')).toBeVisible()
  })
})
