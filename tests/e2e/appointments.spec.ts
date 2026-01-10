import { test, expect } from '@playwright/test'

test.describe('Appointments Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as PT first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
  })

  test('should navigate to appointments page', async ({ page }) => {
    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.waitForURL('**/appuntamenti')

    await expect(page.getByText('Appuntamenti')).toBeVisible()
    await expect(page.getByText('Nuovo appuntamento')).toBeVisible()
  })

  test('should create a new appointment', async ({ page }) => {
    await page.goto('/dashboard/appuntamenti')

    // Click new appointment button
    await page.click('button:has-text("Nuovo appuntamento")')

    // Wait for appointment modal
    await expect(page.getByText('Crea appuntamento')).toBeVisible()

    // Fill appointment details
    await page.fill('input[name="client"]', 'Mario Rossi')
    await page.fill('input[name="date"]', '2024-12-25')
    await page.fill('input[name="time"]', '10:00')
    await page.fill('textarea[name="notes"]', 'Allenamento personalizzato')

    // Submit appointment
    await page.click('button:has-text("Crea")')

    // Verify success message
    await expect(page.getByText('Appuntamento creato con successo')).toBeVisible()
  })

  test('should view appointment calendar', async ({ page }) => {
    await page.goto('/dashboard/appuntamenti')

    // Verify calendar elements
    await expect(page.getByText('Calendario')).toBeVisible()
    await expect(page.getByText('Gennaio')).toBeVisible()
  })

  test('should edit an appointment', async ({ page }) => {
    await page.goto('/dashboard/appuntamenti')

    // Click edit button for first appointment
    const editButton = page.locator('button:has-text("Modifica")').first()
    await editButton.click()

    // Wait for edit modal
    await expect(page.getByText('Modifica appuntamento')).toBeVisible()

    // Update appointment details
    await page.fill('input[name="notes"]', 'Note aggiornate')

    // Submit changes
    await page.click('button:has-text("Salva")')

    // Verify success message
    await expect(page.getByText('Appuntamento aggiornato')).toBeVisible()
  })

  test('should cancel an appointment', async ({ page }) => {
    await page.goto('/dashboard/appuntamenti')

    // Click cancel button for first appointment
    const cancelButton = page.locator('button:has-text("Cancella")').first()
    await cancelButton.click()

    // Confirm cancellation
    await page.click('button:has-text("Conferma")')

    // Verify success message
    await expect(page.getByText('Appuntamento cancellato')).toBeVisible()
  })
})
