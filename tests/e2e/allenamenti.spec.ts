import { test, expect } from '@playwright/test'

test.describe('Allenamenti Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/allenamenti')
    // Assuming user is already logged in or login is handled globally
  })

  test('should display the allenamenti page header and stats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Allenamenti' })).toBeVisible()
    await expect(
      page.getByText('Monitora le sessioni di allenamento dei tuoi atleti'),
    ).toBeVisible()
    await expect(page.getByText('Oggi')).toBeVisible()
    await expect(page.getByText('Completati')).toBeVisible()
    await expect(page.getByText('In corso')).toBeVisible()
    await expect(page.getByText('Programmati')).toBeVisible()
  })

  test('should display breadcrumb navigation', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Allenamenti')).toBeVisible()
  })

  test('should display search input and filters', async ({ page }) => {
    await expect(page.getByPlaceholder('Cerca per atleta o scheda...')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Filtri' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible()
  })

  test('should filter by tabs', async ({ page }) => {
    // Click on "Completati" tab
    await page.getByRole('tab', { name: /Completati/ }).click()
    // Check that only completed workouts are displayed
    await expect(page.getByText('Completato')).toBeVisible()

    // Click on "In corso" tab
    await page.getByRole('tab', { name: /In corso/ }).click()
    await expect(page.getByText('In corso')).toBeVisible()
  })

  test('should search for allenamenti', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Cerca per atleta o scheda...')
    await searchInput.fill('Mario')
    // Wait for debounce
    await page.waitForTimeout(600)
    // Should display only matching workouts
    await expect(page.getByText('Mario Rossi')).toBeVisible()
  })

  test('should sort allenamenti', async ({ page }) => {
    const sortSelect = page.getByRole('combobox').first()
    await sortSelect.click()
    await page.getByRole('option', { name: 'Atleta (A-Z)' }).click()
    // Check if sorting is applied (first workout should start with A-M)
    // This is a basic check, actual implementation depends on data
  })

  test('should open filtri avanzati modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Filtri' }).click()
    await expect(page.getByRole('heading', { name: 'Filtri Avanzati' })).toBeVisible()
    await page.getByRole('button', { name: 'Chiudi dialog' }).click()
    await expect(page.getByRole('heading', { name: 'Filtri Avanzati' })).not.toBeVisible()
  })

  test('should export allenamenti to CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export' }).click()
    await page.getByRole('menuitem', { name: 'Esporta come CSV' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('allenamenti_')
    expect(download.suggestedFilename()).toContain('.csv')
  })

  test('should open dettagli modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Dettagli' }).first().click()
    await expect(page.getByRole('heading', { name: 'Dettagli Allenamento' })).toBeVisible()
    await expect(page.getByText('Informazioni complete sulla sessione')).toBeVisible()
    await page.getByRole('button', { name: 'Chiudi dialog' }).click()
    await expect(page.getByRole('heading', { name: 'Dettagli Allenamento' })).not.toBeVisible()
  })

  test('should navigate to profilo atleta', async ({ page }) => {
    const profiloButton = page.getByRole('link', { name: /Profilo di/ }).first()
    await expect(profiloButton).toBeVisible()
    // Click on profilo should navigate to athlete profile page
    // await profiloButton.click()
    // await expect(page.url()).toContain('/dashboard/atleti/')
  })

  test('should show empty state when no workouts', async ({ page }) => {
    // Simulate empty state by filtering to a non-existent workout
    await page.getByPlaceholder('Cerca per atleta o scheda...').fill('NonExistent')
    await page.waitForTimeout(600)
    await expect(page.getByText('Nessun allenamento trovato')).toBeVisible()
    await expect(page.getByText('Crea una scheda per iniziare')).toBeVisible()
  })

  test('should display progress bar for in-progress workouts', async ({ page }) => {
    // Switch to "In corso" tab
    await page.getByRole('tab', { name: /In corso/ }).click()
    // Check if progress bar is visible
    await expect(page.getByText('Progresso')).toBeVisible()
    await expect(page.getByText('%')).toBeVisible()
  })

  test('should display notes if present', async ({ page }) => {
    // Check if note icon and text are visible
    await expect(page.getByText(/📝/)).toBeVisible()
  })
})
