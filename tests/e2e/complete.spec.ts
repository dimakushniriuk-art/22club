import { test, expect } from '@playwright/test'

test.describe('Complete E2E Tests', () => {
  test('should complete full application lifecycle', async ({ page }) => {
    // Complete application lifecycle: Login → Dashboard → All Features → Logout

    // Step 1: Login as PT
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Step 2: Verify dashboard
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Allenamenti')).toBeVisible()
    await expect(page.getByText('Clienti')).toBeVisible()
    await expect(page.getByText('Appuntamenti')).toBeVisible()
    await expect(page.getByText('Documenti')).toBeVisible()
    await expect(page.getByText('Statistiche')).toBeVisible()

    // Step 3: Test all navigation
    const navLinks = [
      { href: '/dashboard/appuntamenti', text: 'Appuntamenti' },
      { href: '/dashboard/clienti', text: 'Clienti' },
      { href: '/dashboard/documenti', text: 'Documenti' },
      { href: '/dashboard/statistiche', text: 'Statistiche' },
      { href: '/dashboard/profilo', text: 'Profilo' },
    ]

    for (const link of navLinks) {
      await page.click(`a[href="${link.href}"]`)
      await page.waitForURL(`**${link.href}`)
      await expect(page.getByText(link.text)).toBeVisible()
    }

    // Step 4: Test appointment management
    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.click('button:has-text("Nuovo appuntamento")')
    await page.fill('input[name="client"]', 'Mario Rossi')
    await page.fill('input[name="date"]', '2024-12-25')
    await page.fill('input[name="time"]', '10:00')
    await page.fill('textarea[name="notes"]', 'Allenamento personalizzato')
    await page.click('button:has-text("Crea")')

    // Step 5: Test document management
    await page.click('a[href="/dashboard/documenti"]')
    await page.click('button:has-text("Carica documento")')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-document.pdf')
    await page.fill('input[name="name"]', 'Programma Allenamento')
    await page.fill('textarea[name="description"]', 'Programma di allenamento personalizzato')
    await page.click('button:has-text("Carica")')

    // Step 6: Test statistics
    await page.click('a[href="/dashboard/statistiche"]')
    await expect(page.getByText('Trend Allenamenti')).toBeVisible()
    await expect(page.getByText('Distribuzione per tipo')).toBeVisible()

    // Step 7: Test profile management
    await page.click('a[href="/dashboard/profilo"]')
    await page.fill('input[name="name"]', 'Mario Rossi')
    await page.fill('input[name="phone"]', '+39 123 456 7890')
    await page.fill('textarea[name="bio"]', 'Personal trainer esperto')
    await page.click('button:has-text("Salva")')

    // Step 8: Logout
    await page.click('button:has-text("Logout")')
    await page.waitForURL('**/login')
    await expect(page.getByText('Accedi')).toBeVisible()
  })

  test('should complete full athlete lifecycle', async ({ page }) => {
    // Complete athlete lifecycle: Login → Home → All Features → Logout

    // Step 1: Login as athlete
    await page.goto('/login')
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    // Step 2: Verify home dashboard
    await expect(page.getByText('Benvenuto')).toBeVisible()
    await expect(page.getByText('I tuoi allenamenti')).toBeVisible()
    await expect(page.getByText('Prossimi appuntamenti')).toBeVisible()

    // Step 3: Test all navigation
    const navLinks = [
      { href: '/home/allenamenti', text: 'Allenamenti' },
      { href: '/home/appuntamenti', text: 'Appuntamenti' },
      { href: '/home/documenti', text: 'Documenti' },
      { href: '/home/profilo', text: 'Profilo' },
    ]

    for (const link of navLinks) {
      await page.click(`a[href="${link.href}"]`)
      await page.waitForURL(`**${link.href}`)
      await expect(page.getByText(link.text)).toBeVisible()
    }

    // Step 4: Test profile management
    await page.click('a[href="/home/profilo"]')
    await page.fill('input[name="name"]', 'Luigi Bianchi')
    await page.fill('input[name="phone"]', '+39 987 654 3210')
    await page.fill('textarea[name="bio"]', 'Atleta amatoriale')
    await page.click('button:has-text("Salva")')

    // Step 5: Logout
    await page.click('button:has-text("Logout")')
    await page.waitForURL('**/login')
    await expect(page.getByText('Accedi')).toBeVisible()
  })

  test('should handle cross-role interactions', async ({ page }) => {
    // Test interactions between PT and athlete roles

    // Step 1: PT creates appointment
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.click('button:has-text("Nuovo appuntamento")')
    await page.fill('input[name="client"]', 'Luigi Bianchi')
    await page.fill('input[name="date"]', '2024-12-25')
    await page.fill('input[name="time"]', '10:00')
    await page.fill('textarea[name="notes"]', 'Allenamento personalizzato')
    await page.click('button:has-text("Crea")')

    // Step 2: PT uploads document
    await page.click('a[href="/dashboard/documenti"]')
    await page.click('button:has-text("Carica documento")')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-document.pdf')
    await page.fill('input[name="name"]', 'Programma Luigi')
    await page.fill('textarea[name="description"]', 'Programma per Luigi')
    await page.click('button:has-text("Carica")')

    // Step 3: PT logs out
    await page.click('button:has-text("Logout")')
    await page.waitForURL('**/login')

    // Step 4: Athlete logs in and sees appointment
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    await expect(page.getByText('Prossimi appuntamenti')).toBeVisible()

    // Step 5: Athlete views documents
    await page.click('a[href="/home/documenti"]')
    await expect(page.getByText('Programma Luigi')).toBeVisible()

    // Step 6: Athlete logs out
    await page.click('button:has-text("Logout")')
    await page.waitForURL('**/login')
  })

  test('should handle real-time updates', async ({ page }) => {
    // Test real-time updates throughout the application

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

    // Step 3: Simulate real-time update
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('appointment-created', {
          detail: { client: 'Luigi Bianchi', date: '2024-12-25' },
        }),
      )
    })

    // Step 4: Verify update is received
    await expect(page.getByText('Appuntamento creato')).toBeVisible()

    // Step 5: PT logs out
    await page.click('button:has-text("Logout")')
    await page.waitForURL('**/login')

    // Step 6: Athlete logs in and sees appointment
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    await expect(page.getByText('Prossimi appuntamenti')).toBeVisible()
  })

  test('should handle error scenarios', async ({ page }) => {
    // Test error handling throughout the application

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
  })
})
