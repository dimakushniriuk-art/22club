import { test, expect } from '@playwright/test'

test.describe('Final E2E Tests', () => {
  test('should complete full PT workflow with all features', async ({ page }) => {
    // Complete PT workflow with all features: Login → Dashboard → Appointments → Documents → Statistics → Profile → Logout

    // Step 1: Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Step 2: Dashboard overview
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Allenamenti')).toBeVisible()
    await expect(page.getByText('Clienti')).toBeVisible()
    await expect(page.getByText('Appuntamenti')).toBeVisible()
    await expect(page.getByText('Documenti')).toBeVisible()
    await expect(page.getByText('Statistiche')).toBeVisible()

    // Step 3: Manage appointments
    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.waitForURL('**/appuntamenti')
    await expect(page.getByText('Appuntamenti')).toBeVisible()

    // Create appointment
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

    // Step 4: Manage documents
    await page.click('a[href="/dashboard/documenti"]')
    await page.waitForURL('**/documenti')
    await expect(page.getByText('Documenti')).toBeVisible()

    // Upload document
    await page.click('button:has-text("Carica documento")')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-document.pdf')
    await page.fill('input[name="name"]', 'Programma Allenamento')
    await page.fill('textarea[name="description"]', 'Programma di allenamento personalizzato')
    await page.click('button:has-text("Carica")')

    // View document
    await page.click('button:has-text("Visualizza")')
    await expect(page.getByText('Programma Allenamento')).toBeVisible()

    // Step 5: View statistics
    await page.click('a[href="/dashboard/statistiche"]')
    await page.waitForURL('**/statistiche')
    await expect(page.getByText('Statistiche')).toBeVisible()
    await expect(page.getByText('Trend Allenamenti')).toBeVisible()
    await expect(page.getByText('Distribuzione per tipo')).toBeVisible()

    // Filter by period
    await page.selectOption('select[name="period"]', 'month')
    await expect(page.getByText('Ultimo mese')).toBeVisible()

    // Step 6: Update profile
    await page.click('a[href="/dashboard/profilo"]')
    await page.waitForURL('**/profilo')
    await expect(page.getByText('Profilo')).toBeVisible()

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

    // Step 7: Logout
    await page.click('button:has-text("Logout")')
    await page.waitForURL('**/login')
    await expect(page.getByText('Accedi')).toBeVisible()
  })

  test('should complete full athlete workflow with all features', async ({ page }) => {
    // Complete athlete workflow with all features: Login → Home → Schedule → Appointments → Documents → Profile → Logout

    // Step 1: Login as athlete
    await page.goto('/login')
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    // Step 2: Home dashboard
    await expect(page.getByText('Benvenuto')).toBeVisible()
    await expect(page.getByText('I tuoi allenamenti')).toBeVisible()
    await expect(page.getByText('Prossimi appuntamenti')).toBeVisible()

    // Step 3: View training schedule
    await page.click('a[href="/home/allenamenti"]')
    await page.waitForURL('**/allenamenti')
    await expect(page.getByText('Calendario allenamenti')).toBeVisible()

    // Step 4: Check appointments
    await page.click('a[href="/home/appuntamenti"]')
    await page.waitForURL('**/appuntamenti')
    await expect(page.getByText('I tuoi appuntamenti')).toBeVisible()

    // Step 5: View documents
    await page.click('a[href="/home/documenti"]')
    await page.waitForURL('**/documenti')
    await expect(page.getByText('I tuoi documenti')).toBeVisible()

    // Step 6: Update profile
    await page.click('a[href="/home/profilo"]')
    await page.waitForURL('**/profilo')
    await expect(page.getByText('Profilo')).toBeVisible()

    await page.fill('input[name="name"]', 'Luigi Bianchi')
    await page.fill('input[name="phone"]', '+39 987 654 3210')
    await page.fill('textarea[name="bio"]', 'Atleta amatoriale')
    await page.click('button:has-text("Salva")')

    // Step 7: Logout
    await page.click('button:has-text("Logout")')
    await page.waitForURL('**/login')
    await expect(page.getByText('Accedi')).toBeVisible()
  })

  test('should handle cross-role interactions with real-time updates', async ({ page }) => {
    // Test interactions between PT and athlete roles with real-time updates

    // Step 1: PT logs in
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Step 2: PT creates appointment
    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.click('button:has-text("Nuovo appuntamento")')
    await page.fill('input[name="client"]', 'Luigi Bianchi')
    await page.fill('input[name="date"]', '2024-12-25')
    await page.fill('input[name="time"]', '10:00')
    await page.fill('textarea[name="notes"]', 'Allenamento personalizzato')
    await page.click('button:has-text("Crea")')

    // Step 3: PT uploads document
    await page.click('a[href="/dashboard/documenti"]')
    await page.click('button:has-text("Carica documento")')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-document.pdf')
    await page.fill('input[name="name"]', 'Programma Luigi')
    await page.fill('textarea[name="description"]', 'Programma per Luigi')
    await page.click('button:has-text("Carica")')

    // Step 4: Simulate real-time update
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('appointment-created', {
          detail: { client: 'Luigi Bianchi', date: '2024-12-25' },
        }),
      )
    })

    // Step 5: Verify update is received
    await expect(page.getByText('Appuntamento creato')).toBeVisible()

    // Step 6: PT logs out
    await page.click('button:has-text("Logout")')
    await page.waitForURL('**/login')

    // Step 7: Athlete logs in and sees appointment
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    await expect(page.getByText('Prossimi appuntamenti')).toBeVisible()

    // Step 8: Athlete views documents
    await page.click('a[href="/home/documenti"]')
    await expect(page.getByText('Programma Luigi')).toBeVisible()

    // Step 9: Athlete logs out
    await page.click('button:has-text("Logout")')
    await page.waitForURL('**/login')
  })

  test('should handle all error scenarios gracefully', async ({ page }) => {
    // Test all error scenarios throughout the application

    // Step 1: Test invalid login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Credenziali non valide')).toBeVisible()

    // Step 2: Test valid login
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Step 3: Test network error
    await page.route('**/api/**', (route) => route.abort())

    await page.click('a[href="/dashboard/appuntamenti"]')
    await expect(page.getByText('Errore di connessione')).toBeVisible()

    // Step 4: Test recovery
    await page.unroute('**/api/**')
    await page.click('button:has-text("Riprova")')
    await page.waitForURL('**/appuntamenti')
    await expect(page.getByText('Appuntamenti')).toBeVisible()

    // Step 5: Test 404 error
    await page.goto('/non-existent-page')
    await expect(page.getByText('404')).toBeVisible()

    // Step 6: Test protected route
    await page.goto('/dashboard')
    await page.waitForURL('**/login')
    await expect(page.getByText('Accedi')).toBeVisible()

    // Step 7: Test validation errors
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', '')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Email non valida')).toBeVisible()
    await expect(page.getByText('Password richiesta')).toBeVisible()
  })

  test('should maintain performance and accessibility', async ({ page }) => {
    // Test performance and accessibility throughout the application

    // Step 1: Test page load performance
    const startTime = Date.now()
    await page.goto('/login')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(3000)

    // Step 2: Test accessibility
    await expect(page.getByText('Accedi')).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()

    // Step 3: Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeFocused()

    // Step 4: Test login performance
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')

    const loginStartTime = Date.now()
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
    const loginTime = Date.now() - loginStartTime

    expect(loginTime).toBeLessThan(2000)

    // Step 5: Test dashboard performance
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Allenamenti')).toBeVisible()
    await expect(page.getByText('Clienti')).toBeVisible()
    await expect(page.getByText('Appuntamenti')).toBeVisible()
    await expect(page.getByText('Documenti')).toBeVisible()
    await expect(page.getByText('Statistiche')).toBeVisible()

    // Step 6: Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.locator('button[aria-label="Menu"]')).toBeVisible()
  })
})
