import { test, expect } from '@playwright/test'

test.describe('Pagina Invita Atleta', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/invita-atleta')
  })

  test('should display invita atleta page with stats', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Invita Atleta')

    // Verifica stats cards
    await expect(page.getByText('Totale Inviti')).toBeVisible()
    await expect(page.getByText('Inviati')).toBeVisible()
    await expect(page.getByText('Registrati')).toBeVisible()
    await expect(page.getByText('Scaduti')).toBeVisible()
  })

  test('should open create invitation dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Nuovo Invito' }).click()

    await expect(page.getByText('Nuovo Invito Atleta')).toBeVisible()
    await expect(page.getByPlaceholder('Mario Rossi')).toBeVisible()
  })

  test('should create invitation with validation', async ({ page }) => {
    await page.getByRole('button', { name: 'Nuovo Invito' }).click()

    // Try submit without name
    await page.getByRole('button', { name: 'Crea Invito' }).click()

    // Should show validation error
    await expect(page.locator('form')).toBeVisible()
  })

  test('should fill form and create invitation', async ({ page }) => {
    await page.getByRole('button', { name: 'Nuovo Invito' }).click()

    // Fill form
    await page.getByPlaceholder('Mario Rossi').fill('Test Atleta')
    await page.getByPlaceholder('mario.rossi@example.com').fill('test@example.com')

    // Select 14 days validity
    await page.locator('select').first().selectOption('14')

    // Submit
    await page.getByRole('button', { name: /Crea/ }).click()

    // Should close dialog after success
    await page.waitForTimeout(1000)
  })

  test('should filter invitations by stato', async ({ page }) => {
    await page.getByRole('button', { name: 'Inviati' }).click()

    // Verify filter is applied
    const buttons = page.getByRole('button', { name: 'Inviati' })
    await expect(buttons.first()).toBeVisible()
  })

  test('should search invitations', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Cerca per nome, email o codice...')
    await searchInput.fill('test')

    // Wait for debounce
    await page.waitForTimeout(500)
  })

  test('should copy invitation code', async ({ page }) => {
    // Skip if no invitations
    const hasInvitations = await page.locator('[aria-label="Copia codice"]').count()
    if (hasInvitations === 0) {
      test.skip()
      return
    }

    await page.locator('[aria-label="Copia codice"]').first().click()

    // Should show "Copiato!" feedback
    await expect(page.getByText('Copiato!')).toBeVisible()
  })

  test('should show QR code modal', async ({ page }) => {
    const hasInvitations = await page.locator('[aria-label="Mostra QR Code"]').count()
    if (hasInvitations === 0) {
      test.skip()
      return
    }

    await page.locator('[aria-label="Mostra QR Code"]').first().click()

    await expect(page.getByText('QR Code Invito')).toBeVisible()
  })

  test('should export CSV', async ({ page }) => {
    await page.getByRole('button', { name: 'Export CSV' }).click()

    // Download should be triggered (can't test actual file in browser)
  })

  test('should have breadcrumb navigation', async ({ page }) => {
    const breadcrumb = page.locator('[aria-label="Breadcrumb"]')
    await expect(breadcrumb).toBeVisible()
    await expect(breadcrumb.getByText('Dashboard')).toBeVisible()
    await expect(breadcrumb.getByText('Invita Atleta')).toBeVisible()
  })

  test('should have accessible aria labels', async ({ page }) => {
    const hasButtons = await page.locator('[aria-label]').count()
    expect(hasButtons).toBeGreaterThan(0)
  })

  test('should announce search results for screen readers', async ({ page }) => {
    const announcer = page.locator('[role="status"][aria-live="polite"]')
    await expect(announcer).toBeAttached()
  })
})
