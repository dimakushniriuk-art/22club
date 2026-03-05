import { test, expect, type Page } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

const gotoClienti = async (page: Page) => {
  // login pulito come admin (no storage state)
  await page.goto('/login', { waitUntil: 'commit' })
  await page.context().clearCookies()
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await loginAsAdmin(page)
  if (page.url().includes('/login')) {
    await page.reload()
    await loginAsAdmin(page)
  }

  // naviga a clienti e attendi heading
  await page.goto('http://localhost:3001/dashboard/clienti', { waitUntil: 'domcontentloaded' })
  await page.waitForURL('**/dashboard/clienti**', { timeout: 20000 })
  const heading = page.getByRole('heading', { name: /Clienti/i }).first()
  await expect(heading).toBeVisible({ timeout: 10000 })
}

const switchToTableView = async (page: Page) => {
  const tableBtn = page.getByLabel('Vista tabella')
  await tableBtn.click()
  await expect(page.locator('table')).toBeVisible()
}

test.describe('Pagina Clienti', () => {
  test.beforeEach(async ({ page }) => {
    await gotoClienti(page)
  })

  test('should display clienti page with stats', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Clienti' })).toBeVisible()
    await expect(page.getByText(/clienti trovati/i)).toBeVisible()

    // Verifica cards KPI
    await expect(page.getByText('Clienti Totali')).toBeVisible()
    await expect(page.getByText('Clienti Attivi')).toBeVisible()
    await expect(page.getByText('Nuovi Questo Mese')).toBeVisible()
    await expect(page.getByText('Documenti in Scadenza')).toBeVisible()
  })

  test('should filter clienti by search', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Cerca per nome o email...')
    await searchInput.fill('silvia')

    await expect(searchInput).toHaveValue('silvia')
    await expect(page.getByText(/clienti trovati/i)).toBeVisible()
  })

  test('should filter by stato', async ({ page }) => {
    const attivi = page.getByRole('button', { name: 'Filtra per clienti attivi' })
    await attivi.click()
    await expect(attivi).toHaveAttribute('aria-pressed', 'true')
  })

  test('should open filtri avanzati modal', async ({ page }) => {
    await page.getByLabel('Mostra filtri avanzati').click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Filtri Avanzati')).toBeVisible()
    await dialog.getByRole('button', { name: /Applica Filtri/i }).click()
  })

  test('should toggle between table and grid view', async ({ page }) => {
    const gridBtn = page.getByLabel('Vista griglia')
    const tableBtn = page.getByLabel('Vista tabella')

    await tableBtn.click()
    await expect(page.locator('table')).toBeVisible()

    await gridBtn.click()
    await expect(page.locator('table')).toBeHidden()
  })

  test('should sort table by clicking column headers', async ({ page }) => {
    await switchToTableView(page)

    const nomeHeader = page.getByRole('button', { name: /Ordina per nome/i })
    await nomeHeader.click()
    await expect(nomeHeader).toBeVisible()
  })

  test('should select multiple clienti', async ({ page }) => {
    await switchToTableView(page)

    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]')
    await firstCheckbox.click()

    await expect(page.getByText(/cliente selezionato/i)).toBeVisible()
  })

  test('should export clienti', async ({ page }) => {
    const exportBtn = page.getByLabel('Esporta dati clienti')
    await exportBtn.click()

    await expect(page.getByText('Esporta come CSV')).toBeVisible()
    await expect(page.getByText('Esporta come PDF')).toBeVisible()
  })

  test('should navigate to cliente profilo', async ({ page }) => {
    await switchToTableView(page)

    const profiloButton = page.locator('tbody tr').first().getByRole('link', { name: 'Profilo' })
    await profiloButton.click()

    await expect(page).toHaveURL(/\/dashboard\/atleti\//, { timeout: 10000 })
  })

  test('should open dropdown menu on more button click', async ({ page }) => {
    await switchToTableView(page)

    const moreButton = page
      .locator('tbody tr')
      .first()
      .getByRole('button', { name: /Altre azioni per/i })
    await moreButton.click()

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
})
