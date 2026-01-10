import { test, expect } from '@playwright/test'

test.describe('User Journey Tests', () => {
  test('should complete full PT user journey', async ({ page }) => {
    // Journey: Login → Dashboard → Create Appointment → Upload Document → View Statistics → Update Profile

    // Step 1: Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Step 2: View dashboard overview
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Allenamenti')).toBeVisible()
    await expect(page.getByText('Clienti')).toBeVisible()

    // Step 3: Create new appointment
    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.click('button:has-text("Nuovo appuntamento")')
    await page.fill('input[name="client"]', 'Luigi Bianchi')
    await page.fill('input[name="date"]', '2024-12-25')
    await page.fill('input[name="time"]', '10:00')
    await page.fill('textarea[name="notes"]', 'Prima sessione di allenamento')
    await page.click('button:has-text("Crea")')

    // Step 4: Upload training document
    await page.click('a[href="/dashboard/documenti"]')
    await page.click('button:has-text("Carica documento")')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-document.pdf')
    await page.fill('input[name="name"]', 'Programma Allenamento Luigi')
    await page.fill('textarea[name="description"]', 'Programma personalizzato per Luigi')
    await page.click('button:has-text("Carica")')

    // Step 5: View statistics and analytics
    await page.click('a[href="/dashboard/statistiche"]')
    await expect(page.getByText('Trend Allenamenti')).toBeVisible()
    await expect(page.getByText('Distribuzione per tipo')).toBeVisible()

    // Step 6: Update profile information
    await page.click('a[href="/dashboard/profilo"]')
    await page.fill('input[name="name"]', 'Mario Rossi')
    await page.fill('input[name="phone"]', '+39 123 456 7890')
    await page.fill('textarea[name="bio"]', 'Personal trainer esperto con 10 anni di esperienza')
    await page.click('button:has-text("Salva")')

    // Step 7: Logout
    await page.click('button:has-text("Logout")')
    await page.waitForURL('**/login')
    await expect(page.getByText('Accedi')).toBeVisible()
  })

  test('should complete full athlete user journey', async ({ page }) => {
    // Journey: Login → Home → View Schedule → Check Appointments → Update Profile

    // Step 1: Login as athlete
    await page.goto('/login')
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    // Step 2: View home dashboard
    await expect(page.getByText('Benvenuto')).toBeVisible()
    await expect(page.getByText('I tuoi allenamenti')).toBeVisible()
    await expect(page.getByText('Prossimi appuntamenti')).toBeVisible()

    // Step 3: View workout schedule
    await page.click('a[href="/home/allenamenti"]')
    await expect(page.getByText('Calendario allenamenti')).toBeVisible()
    await expect(page.getByText('Prossimi appuntamenti')).toBeVisible()

    // Step 4: Check upcoming appointments
    await page.click('a[href="/home/appuntamenti"]')
    await expect(page.getByText('I tuoi appuntamenti')).toBeVisible()

    // Step 5: Update profile
    await page.click('a[href="/home/profilo"]')
    await page.fill('input[name="name"]', 'Luigi Bianchi')
    await page.fill('input[name="phone"]', '+39 987 654 3210')
    await page.fill('textarea[name="bio"]', 'Atleta amatoriale appassionato di fitness')
    await page.click('button:has-text("Salva")')

    // Step 6: Logout
    await page.click('button:has-text("Logout")')
    await page.waitForURL('**/login')
    await expect(page.getByText('Accedi')).toBeVisible()
  })

  test('should handle PT client management journey', async ({ page }) => {
    // Journey: Login → View Clients → Create Appointment → Upload Document → Send Notification

    // Step 1: Login as PT
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Step 2: View client list
    await page.click('a[href="/dashboard/clienti"]')
    await expect(page.getByText('Clienti')).toBeVisible()
    await expect(page.getByText('Aggiungi cliente')).toBeVisible()

    // Step 3: Create appointment for client
    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.click('button:has-text("Nuovo appuntamento")')
    await page.fill('input[name="client"]', 'Giulia Verdi')
    await page.fill('input[name="date"]', '2024-12-26')
    await page.fill('input[name="time"]', '14:00')
    await page.fill('textarea[name="notes"]', 'Sessione di potenziamento')
    await page.click('button:has-text("Crea")')

    // Step 4: Upload training plan
    await page.click('a[href="/dashboard/documenti"]')
    await page.click('button:has-text("Carica documento")')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-document.pdf')
    await page.fill('input[name="name"]', 'Piano Allenamento Giulia')
    await page.fill('textarea[name="description"]', 'Piano di allenamento per Giulia')
    await page.click('button:has-text("Carica")')

    // Step 5: Send notification to client
    await page.click('button:has-text("Invia notifica")')
    await page.fill('textarea[name="message"]', 'Ho caricato il tuo nuovo piano di allenamento')
    await page.click('button:has-text("Invia")')
  })

  test('should handle athlete training journey', async ({ page }) => {
    // Journey: Login → View Schedule → Check Documents → Update Progress → Contact Trainer

    // Step 1: Login as athlete
    await page.goto('/login')
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    // Step 2: View training schedule
    await page.click('a[href="/home/allenamenti"]')
    await expect(page.getByText('Calendario allenamenti')).toBeVisible()

    // Step 3: Check training documents
    await page.click('a[href="/home/documenti"]')
    await expect(page.getByText('I tuoi documenti')).toBeVisible()

    // Step 4: Update training progress
    await page.click('a[href="/home/progressi"]')
    await page.fill('textarea[name="notes"]', 'Sessione completata con successo')
    await page.selectOption('select[name="difficulty"]', 'medium')
    await page.click('button:has-text("Salva")')

    // Step 5: Contact trainer
    await page.click('a[href="/home/messaggi"]')
    await page.fill('textarea[name="message"]', 'Ho completato la sessione di oggi')
    await page.click('button:has-text("Invia")')
  })

  test('should handle error recovery journey', async ({ page }) => {
    // Journey: Login → Encounter Error → Retry → Success

    // Step 1: Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Step 2: Simulate error
    await page.route('**/api/**', (route) => route.abort())

    // Step 3: Try to perform action
    await page.click('a[href="/dashboard/appuntamenti"]')

    // Step 4: Handle error
    await expect(page.getByText('Errore di connessione')).toBeVisible()

    // Step 5: Retry
    await page.unroute('**/api/**')
    await page.click('button:has-text("Riprova")')

    // Step 6: Verify success
    await page.waitForURL('**/appuntamenti')
    await expect(page.getByText('Appuntamenti')).toBeVisible()
  })
})
