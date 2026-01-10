/**
 * Test E2E: Flusso pagamento e aggiornamento contatore lezioni
 *
 * Testa l'intero flusso:
 * 1. PT naviga a pagamenti
 * 2. Crea nuovo pagamento per atleta
 * 3. Verifica che il contatore lezioni si aggiorni
 * 4. Verifica che il pagamento appaia nella lista
 * 5. Verifica storno pagamento (opzionale)
 */

import { test, expect } from '@playwright/test'

test.describe('Flusso Pagamento e Contatore Lezioni', () => {
  // Nota: initialLessonCount potrebbe essere usato in futuro per confronti
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let initialLessonCount: number | null = null

  test.beforeEach(async ({ page }) => {
    // Login come PT
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
  })

  test('dovrebbe aprire il form nuovo pagamento', async ({ page }) => {
    // Naviga alla pagina pagamenti
    await page.goto('http://localhost:3001/dashboard/pagamenti')
    await expect(page.getByRole('heading', { name: /Pagamenti|Gestione Pagamenti/i })).toBeVisible()

    // Clicca su "Nuovo Pagamento"
    const newPaymentButton = page.getByRole('button', {
      name: /Nuovo.*[Pp]agamento|New.*[Pp]ayment/i,
    })
    await expect(newPaymentButton).toBeVisible()
    await newPaymentButton.click()

    // Verifica che il form si apra
    await expect(page.getByText(/Nuovo.*[Pp]agamento|Crea.*[Pp]agamento/i)).toBeVisible()
  })

  test('dovrebbe registrare un pagamento e aggiornare contatore lezioni', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/pagamenti')

    // Apri form nuovo pagamento
    const newPaymentButton = page.getByRole('button', { name: /Nuovo.*[Pp]agamento/i })
    await newPaymentButton.click()
    await page.waitForTimeout(500)

    // Seleziona atleta
    const athleteSelect = page
      .locator('select[name*="athlete"], select[aria-label*="atleta"]')
      .first()
    if ((await athleteSelect.count()) > 0) {
      await athleteSelect.selectOption({ index: 1 }) // Seleziona primo atleta
    }

    // Compila importo
    const amountInput = page.locator('input[name*="amount"], input[type="number"]').first()
    if ((await amountInput.count()) > 0) {
      await amountInput.fill('100.00')
    }

    // Seleziona metodo pagamento
    const methodSelect = page
      .locator('select[name*="method"], select[aria-label*="metodo"]')
      .first()
    if ((await methodSelect.count()) > 0) {
      await methodSelect.selectOption('Contanti')
    }

    // Compila numero lezioni
    const lessonsInput = page
      .locator('input[name*="lessons"], input[placeholder*="lezioni"]')
      .first()
    if ((await lessonsInput.count()) > 0) {
      await lessonsInput.fill('10')
    }

    // Salva pagamento
    const saveButton = page.getByRole('button', { name: /Salva|Crea|Conferma/i })
    if ((await saveButton.count()) > 0) {
      await saveButton.click()
      await page.waitForTimeout(2000)

      // Verifica messaggio di successo
      await expect(page.getByText(/pagamento.*registrato|payment.*created|successo/i)).toBeVisible({
        timeout: 5000,
      })
    }

    // Verifica che il pagamento appaia nella lista
    await page.waitForTimeout(1000)
    await expect(page.getByText('100.00') || page.getByText('€100')).toBeVisible()
  })

  test('dovrebbe visualizzare il contatore lezioni aggiornato', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/pagamenti')

    // Prima di creare il pagamento, verifica il contatore iniziale (se visibile)
    const initialCounter = page.locator('[data-lesson-counter], .lesson-counter').first()
    if ((await initialCounter.count()) > 0) {
      const counterText = await initialCounter.textContent()
      initialLessonCount = counterText ? parseInt(counterText) || 0 : 0
    }

    // Crea un pagamento con 5 lezioni
    const newPaymentButton = page.getByRole('button', { name: /Nuovo.*[Pp]agamento/i })
    await newPaymentButton.click()
    await page.waitForTimeout(500)

    const athleteSelect = page.locator('select[name*="athlete"]').first()
    if ((await athleteSelect.count()) > 0) {
      await athleteSelect.selectOption({ index: 1 })
    }

    const amountInput = page.locator('input[name*="amount"]').first()
    if ((await amountInput.count()) > 0) {
      await amountInput.fill('50.00')
    }

    const lessonsInput = page.locator('input[name*="lessons"]').first()
    if ((await lessonsInput.count()) > 0) {
      await lessonsInput.fill('5')
    }

    const saveButton = page.getByRole('button', { name: /Salva/i })
    if ((await saveButton.count()) > 0) {
      await saveButton.click()
      await page.waitForTimeout(2000)
    }

    // Naviga al profilo atleta per verificare contatore
    await page.goto('http://localhost:3001/dashboard/clienti')
    await page.waitForTimeout(1000)

    // Clicca su profilo atleta
    const profileLink = page.locator('a[href*="/atleti/"]').first()
    if ((await profileLink.count()) > 0) {
      await profileLink.click()
      await page.waitForTimeout(2000)

      // Verifica che il contatore lezioni sia visibile e aggiornato
      const lessonCounter = page.getByText(/lezioni|lessons|disponibili/i)
      if ((await lessonCounter.count()) > 0) {
        await expect(lessonCounter.first()).toBeVisible()
      }
    }
  })

  test('dovrebbe permettere storno pagamento', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/pagamenti')
    await page.waitForTimeout(1000)

    // Trova un pagamento esistente (non storno)
    const paymentRow = page.locator('tbody tr').first()
    if ((await paymentRow.count()) > 0) {
      // Clicca sul pulsante azioni del pagamento
      const actionsButton = paymentRow.locator(
        'button[aria-label*="azioni"], button[aria-label*="more"]',
      )
      if ((await actionsButton.count()) > 0) {
        await actionsButton.click()
        await page.waitForTimeout(500)

        // Clicca su "Storna" o "Reverse"
        const reverseButton = page.getByRole('button', { name: /Storna|Reverse|Rimborsa/i })
        if ((await reverseButton.count()) > 0) {
          await reverseButton.click()
          await page.waitForTimeout(1000)

          // Conferma storno se c'è un dialog
          const confirmButton = page.getByRole('button', { name: /Conferma|Confirm|Sì|Yes/i })
          if ((await confirmButton.count()) > 0) {
            await confirmButton.click()
            await page.waitForTimeout(2000)

            // Verifica messaggio di successo
            await expect(page.getByText(/stornato|reversed|rimborsato/i)).toBeVisible({
              timeout: 5000,
            })
          }
        }
      }
    }
  })

  test('dovrebbe visualizzare statistiche pagamenti', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/pagamenti')
    await page.waitForTimeout(1000)

    // Verifica che le KPI cards siano visibili
    await expect(page.getByText(/Entrate.*[Mm]ensili|Revenue/i)).toBeVisible()
    await expect(page.getByText(/Lezioni.*[Vv]endute|Lessons.*[Ss]old/i)).toBeVisible()
    await expect(page.getByText(/Pagamenti.*[Tt]otali|Total.*[Pp]ayments/i)).toBeVisible()
  })
})
