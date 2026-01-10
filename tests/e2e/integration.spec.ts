import { test, expect } from '@playwright/test'

test.describe('Integration Tests', () => {
  test('should complete full PT workflow', async ({ page }) => {
    // Login as PT
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Create appointment
    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.click('button:has-text("Nuovo appuntamento")')
    await page.fill('input[name="client"]', 'Mario Rossi')
    await page.fill('input[name="date"]', '2024-12-25')
    await page.fill('input[name="time"]', '10:00')
    await page.fill('textarea[name="notes"]', 'Prima sessione')
    await page.click('button:has-text("Crea")')

    // Upload document
    await page.click('a[href="/dashboard/documenti"]')
    await page.click('button:has-text("Carica documento")')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-document.pdf')
    await page.fill('input[name="name"]', 'Programma Allenamento')
    await page.click('button:has-text("Carica")')

    // View statistics
    await page.click('a[href="/dashboard/statistiche"]')
    await expect(page.getByText('Trend Allenamenti')).toBeVisible()

    // Update profile
    await page.click('a[href="/dashboard/profilo"]')
    await page.fill('input[name="name"]', 'Mario Rossi')
    await page.click('button:has-text("Salva")')
  })

  test('should complete full athlete workflow', async ({ page }) => {
    // Login as athlete
    await page.goto('/login')
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    // View workout schedule
    await expect(page.getByText('I tuoi allenamenti')).toBeVisible()

    // View upcoming appointments
    await expect(page.getByText('Prossimi appuntamenti')).toBeVisible()

    // Update profile
    await page.click('a[href="/home/profilo"]')
    await page.fill('input[name="name"]', 'Luigi Bianchi')
    await page.click('button:has-text("Salva")')
  })

  test('should handle real-time updates', async ({ page }) => {
    // Login as PT
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Simulate real-time update
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('appointment-updated', {
          detail: { id: 1, status: 'confirmed' },
        }),
      )
    })

    // Should show notification
    await expect(page.getByText('Appuntamento aggiornato')).toBeVisible()
  })

  test('should handle data synchronization', async ({ page }) => {
    // Login as PT
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Create appointment
    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.click('button:has-text("Nuovo appuntamento")')
    await page.fill('input[name="client"]', 'Mario Rossi')
    await page.fill('input[name="date"]', '2024-12-25')
    await page.fill('input[name="time"]', '10:00')
    await page.click('button:has-text("Crea")')

    // Verify appointment appears in list
    await expect(page.getByText('Mario Rossi')).toBeVisible()

    // Edit appointment
    await page.click('button:has-text("Modifica")')
    await page.fill('input[name="notes"]', 'Note aggiornate')
    await page.click('button:has-text("Salva")')

    // Verify changes are reflected
    await expect(page.getByText('Note aggiornate')).toBeVisible()
  })

  test('should handle cross-browser compatibility', async ({ page }) => {
    // Test basic functionality across different browsers
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Verify core functionality works
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Allenamenti')).toBeVisible()

    // Test navigation
    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.waitForURL('**/appuntamenti')
    await expect(page.getByText('Appuntamenti')).toBeVisible()
  })

  test('should handle offline/online transitions', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Simulate offline
    await page.context().setOffline(true)

    // Try to perform action
    await page.click('a[href="/dashboard/appuntamenti"]')

    // Should show offline message
    await expect(page.getByText('Connessione offline')).toBeVisible()

    // Simulate online
    await page.context().setOffline(false)

    // Should recover
    await expect(page.getByText('Connessione ripristinata')).toBeVisible()
  })
})
