import { test, expect } from '@playwright/test'

test.describe('Workflow Tests', () => {
  test('should complete PT onboarding workflow', async ({ page }) => {
    // Step 1: Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Step 2: Complete profile setup
    await page.click('a[href="/dashboard/profilo"]')
    await page.fill('input[name="name"]', 'Mario Rossi')
    await page.fill('input[name="phone"]', '+39 123 456 7890')
    await page.fill('textarea[name="bio"]', 'Personal trainer esperto')
    await page.click('button:has-text("Salva")')

    // Step 3: Create first appointment
    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.click('button:has-text("Nuovo appuntamento")')
    await page.fill('input[name="client"]', 'Luigi Bianchi')
    await page.fill('input[name="date"]', '2024-12-25')
    await page.fill('input[name="time"]', '10:00')
    await page.fill('textarea[name="notes"]', 'Prima sessione')
    await page.click('button:has-text("Crea")')

    // Step 4: Upload document
    await page.click('a[href="/dashboard/documenti"]')
    await page.click('button:has-text("Carica documento")')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-document.pdf')
    await page.fill('input[name="name"]', 'Programma Allenamento')
    await page.click('button:has-text("Carica")')

    // Step 5: View statistics
    await page.click('a[href="/dashboard/statistiche"]')
    await expect(page.getByText('Trend Allenamenti')).toBeVisible()
  })

  test('should complete athlete onboarding workflow', async ({ page }) => {
    // Step 1: Login as athlete
    await page.goto('/login')
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    // Step 2: Complete profile setup
    await page.click('a[href="/home/profilo"]')
    await page.fill('input[name="name"]', 'Luigi Bianchi')
    await page.fill('input[name="phone"]', '+39 987 654 3210')
    await page.fill('textarea[name="bio"]', 'Atleta amatoriale')
    await page.click('button:has-text("Salva")')

    // Step 3: View workout schedule
    await page.click('a[href="/home/allenamenti"]')
    await expect(page.getByText('I tuoi allenamenti')).toBeVisible()

    // Step 4: View upcoming appointments
    await page.click('a[href="/home/appuntamenti"]')
    await expect(page.getByText('Prossimi appuntamenti')).toBeVisible()
  })

  test('should complete appointment management workflow', async ({ page }) => {
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
    await page.fill('textarea[name="notes"]', 'Allenamento personalizzato')
    await page.click('button:has-text("Crea")')

    // Edit appointment
    await page.click('button:has-text("Modifica")')
    await page.fill('textarea[name="notes"]', 'Note aggiornate')
    await page.click('button:has-text("Salva")')

    // Cancel appointment
    await page.click('button:has-text("Cancella")')
    await page.click('button:has-text("Conferma")')
  })

  test('should complete document management workflow', async ({ page }) => {
    // Login as PT
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Upload document
    await page.click('a[href="/dashboard/documenti"]')
    await page.click('button:has-text("Carica documento")')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-document.pdf')
    await page.fill('input[name="name"]', 'Programma Allenamento')
    await page.fill('textarea[name="description"]', 'Programma di allenamento personalizzato')
    await page.click('button:has-text("Carica")')

    // View document
    await page.click('button:has-text("Visualizza")')
    await expect(page.getByText('Programma Allenamento')).toBeVisible()

    // Download document
    await page.click('button:has-text("Scarica")')

    // Delete document
    await page.click('button:has-text("Elimina")')
    await page.click('button:has-text("Conferma")')
  })

  test('should complete statistics analysis workflow', async ({ page }) => {
    // Login as PT
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // View statistics
    await page.click('a[href="/dashboard/statistiche"]')
    await expect(page.getByText('Trend Allenamenti')).toBeVisible()

    // Filter by period
    await page.selectOption('select[name="period"]', 'month')
    await expect(page.getByText('Ultimo mese')).toBeVisible()

    // Export data
    await page.click('button:has-text("Esporta")')
    await page.click('button:has-text("Esporta come PDF")')
  })

  test('should complete profile management workflow', async ({ page }) => {
    // Login as PT
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Update profile
    await page.click('a[href="/dashboard/profilo"]')
    await page.fill('input[name="name"]', 'Mario Rossi')
    await page.fill('input[name="phone"]', '+39 123 456 7890')
    await page.fill('textarea[name="bio"]', 'Personal trainer esperto')
    await page.click('button:has-text("Salva")')

    // Change password
    await page.click('button:has-text("Cambia password")')
    await page.fill('input[name="currentPassword"]', '123456')
    await page.fill('input[name="newPassword"]', 'newpassword123')
    await page.fill('input[name="confirmPassword"]', 'newpassword123')
    await page.click('button:has-text("Cambia")')

    // Upload profile picture
    await page.click('button:has-text("Carica foto")')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/profile-picture.jpg')
    await page.click('button:has-text("Carica")')
  })
})
