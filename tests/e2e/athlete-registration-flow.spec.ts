/**
 * Test E2E: Flusso completo registrazione nuovo atleta
 *
 * Testa l'intero flusso dall'invito alla registrazione:
 * 1. PT crea invito
 * 2. Atleta riceve invito (via codice o QR)
 * 3. Atleta si registra con codice invito
 * 4. Verifica completamento profilo
 */

import { test, expect } from '@playwright/test'

test.describe('Flusso Registrazione Nuovo Atleta', () => {
  let invitationCode: string
  let athleteEmail: string

  test.beforeEach(async ({ page }) => {
    // Login come PT
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
  })

  test('PT: dovrebbe creare un invito per nuovo atleta', async ({ page }) => {
    // Naviga alla pagina invita atleta
    await page.goto('http://localhost:3001/dashboard/invita-atleta')
    await expect(page.getByRole('heading', { name: 'Invita Atleta' })).toBeVisible()

    // Clicca su "Nuovo Invito"
    await page.getByRole('button', { name: 'Nuovo Invito' }).click()
    await expect(page.getByText('Nuovo Invito Atleta')).toBeVisible()

    // Compila il form
    athleteEmail = `test-athlete-${Date.now()}@example.com`
    await page.getByPlaceholder('Mario Rossi').fill('Test Atleta E2E')
    await page.getByPlaceholder('mario.rossi@example.com').fill(athleteEmail)

    // Seleziona validità 14 giorni
    await page.locator('select').first().selectOption('14')

    // Crea invito
    await page.getByRole('button', { name: /Crea/ }).click()

    // Attendi che il dialog si chiuda
    await page.waitForTimeout(1000)

    // Verifica che l'invito sia stato creato
    await expect(page.getByText('Test Atleta E2E')).toBeVisible()

    // Estrai il codice invito dalla lista
    const codeElement = page.locator('[aria-label="Copia codice"]').first()
    if ((await codeElement.count()) > 0) {
      const codeText = (await codeElement.getAttribute('data-code')) || ''
      invitationCode = codeText
    }
  })

  test('Atleta: dovrebbe registrarsi con codice invito', async ({ page }) => {
    // Assumiamo che il codice invito sia disponibile (potrebbe essere mockato)
    // Per un test reale, dovremmo estrarre il codice dal test precedente

    // Naviga alla pagina di registrazione
    await page.goto('http://localhost:3001/welcome')

    // Se c'è un form di registrazione con codice invito
    const codeInput = page.locator('input[placeholder*="codice"], input[name*="code"]').first()
    if ((await codeInput.count()) > 0) {
      await codeInput.fill(invitationCode || 'TEST-CODE-123')

      // Compila i dati di registrazione
      await page.fill('input[name="nome"]', 'Test')
      await page.fill('input[name="cognome"]', 'Atleta')
      await page.fill('input[name="email"]', athleteEmail)
      await page.fill('input[name="password"]', 'password123')
      await page.fill('input[name="confirmPassword"]', 'password123')

      // Accetta termini e condizioni se presente
      const termsCheckbox = page.locator('input[type="checkbox"][name*="terms"]').first()
      if ((await termsCheckbox.count()) > 0) {
        await termsCheckbox.check()
      }

      // Submit registrazione
      await page.getByRole('button', { name: /Registra|Crea account|Conferma/ }).click()

      // Verifica redirect o messaggio di successo
      await page.waitForTimeout(2000)
      await expect(
        page.getByText(/benvenuto|registrazione completata|account creato/i),
      ).toBeVisible()
    }
  })

  test('Atleta: dovrebbe completare il profilo dopo registrazione', async ({ page }) => {
    // Login come atleta appena registrato
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', athleteEmail)
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Attendi redirect (potrebbe andare a /welcome o /home)
    await page.waitForTimeout(2000)

    // Se c'è una pagina welcome, completa i passaggi
    if (page.url().includes('/welcome')) {
      // Completa i passaggi del welcome
      const nextButton = page.getByRole('button', { name: /Avanti|Continua|Next/i })
      if ((await nextButton.count()) > 0) {
        await nextButton.click()
        await page.waitForTimeout(500)
      }
    }

    // Verifica che l'atleta possa accedere al dashboard
    await expect(page.getByText(/home|dashboard|benvenuto/i)).toBeVisible()
  })

  test('PT: dovrebbe vedere il nuovo atleta nella lista clienti', async ({ page }) => {
    // Login come PT
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Naviga alla pagina clienti
    await page.goto('http://localhost:3001/dashboard/clienti')

    // Cerca il nuovo atleta
    const searchInput = page.getByPlaceholder('Cerca per nome o email...')
    await searchInput.fill('Test Atleta E2E')
    await page.waitForTimeout(500)

    // Verifica che l'atleta appaia nella lista
    await expect(page.getByText('Test Atleta E2E')).toBeVisible()
  })
})
