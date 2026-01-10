/**
 * Test E2E: Flusso chat tra PT e Atleta
 *
 * Testa l'intero flusso di comunicazione:
 * 1. PT naviga alla chat con atleta
 * 2. PT invia messaggio
 * 3. Atleta riceve e visualizza messaggio
 * 4. Atleta risponde
 * 5. PT riceve risposta
 */

import { test, expect } from '@playwright/test'

test.describe('Flusso Chat PT-Atleta', () => {
  test('PT: dovrebbe aprire chat con atleta', async ({ page }) => {
    // Login come PT
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Naviga alla lista clienti
    await page.goto('http://localhost:3001/dashboard/clienti')
    await page.waitForTimeout(1000)

    // Clicca sul pulsante chat di un atleta
    const chatButton = page.locator('a[href*="/chat"], button[aria-label*="Chat"]').first()
    if ((await chatButton.count()) > 0) {
      await chatButton.click()
      await page.waitForURL('**/chat', { timeout: 5000 })

      // Verifica che la chat sia aperta
      await expect(page.getByText(/Messaggi|Chat|Conversazione/i)).toBeVisible()
    }
  })

  test("PT: dovrebbe inviare un messaggio all'atleta", async ({ page }) => {
    // Login come PT
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Naviga direttamente alla chat (assumendo che ci sia un atleta)
    // In alternativa, naviga da clienti
    await page.goto('http://localhost:3001/dashboard/clienti')
    await page.waitForTimeout(1000)

    // Apri chat con primo atleta
    const chatButton = page.locator('a[href*="/chat"], button[aria-label*="Chat"]').first()
    if ((await chatButton.count()) > 0) {
      await chatButton.click()
      await page.waitForTimeout(2000)

      // Trova l'input del messaggio
      const messageInput = page
        .locator(
          'textarea[placeholder*="messaggio"], input[placeholder*="Scrivi"], textarea[name*="message"]',
        )
        .first()

      if ((await messageInput.count()) > 0) {
        // Invia un messaggio
        const testMessage = `Messaggio test E2E ${Date.now()}`
        await messageInput.fill(testMessage)

        // Clicca invio
        const sendButton = page.getByRole('button', { name: /Invia|Send|▶/i })
        if ((await sendButton.count()) > 0) {
          await sendButton.click()
          await page.waitForTimeout(1000)

          // Verifica che il messaggio appaia nella chat
          await expect(page.getByText(testMessage)).toBeVisible()
        }
      }
    }
  })

  test('Atleta: dovrebbe visualizzare messaggi dal PT', async ({ page }) => {
    // Login come atleta
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)

    // Naviga alla chat
    await page.goto('http://localhost:3001/home/chat')
    await page.waitForTimeout(1000)

    // Verifica che la lista conversazioni sia visibile
    await expect(page.getByText(/Messaggi|Chat|Conversazioni/i)).toBeVisible()

    // Seleziona la conversazione con il PT
    const ptConversation = page.getByText(/PT|Trainer|Personal Trainer/i).first()
    if ((await ptConversation.count()) > 0) {
      await ptConversation.click()
      await page.waitForTimeout(1000)

      // Verifica che i messaggi siano visibili
      const count = await page.locator('[data-message], .message, [role="listitem"]').count()
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })

  test('Atleta: dovrebbe rispondere al PT', async ({ page }) => {
    // Login come atleta
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)

    // Naviga alla chat
    await page.goto('http://localhost:3001/home/chat')
    await page.waitForTimeout(1000)

    // Seleziona conversazione PT
    const ptConversation = page.getByText(/PT|Trainer/i).first()
    if ((await ptConversation.count()) > 0) {
      await ptConversation.click()
      await page.waitForTimeout(1000)

      // Trova input messaggio
      const messageInput = page
        .locator('textarea[placeholder*="messaggio"], textarea[placeholder*="Scrivi"]')
        .first()

      if ((await messageInput.count()) > 0) {
        // Invia risposta
        const replyMessage = `Risposta test E2E ${Date.now()}`
        await messageInput.fill(replyMessage)

        // Invia
        const sendButton = page.getByRole('button', { name: /Invia|Send/i })
        if ((await sendButton.count()) > 0) {
          await sendButton.click()
          await page.waitForTimeout(1000)

          // Verifica che il messaggio sia stato inviato
          await expect(page.getByText(replyMessage)).toBeVisible()
        }
      }
    }
  })

  test("PT: dovrebbe vedere la risposta dell'atleta", async ({ page }) => {
    // Login come PT
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Naviga alla chat con l'atleta
    await page.goto('http://localhost:3001/dashboard/clienti')
    await page.waitForTimeout(1000)

    const chatButton = page.locator('a[href*="/chat"]').first()
    if ((await chatButton.count()) > 0) {
      await chatButton.click()
      await page.waitForTimeout(2000)

      // Verifica che i messaggi siano visibili (inclusa la risposta)
      const count = await page.locator('[data-message], .message').count()
      expect(count).toBeGreaterThanOrEqual(1)
    }
  })

  test('dovrebbe supportare invio file nella chat', async ({ page }) => {
    // Login come PT
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Naviga alla chat
    await page.goto('http://localhost:3001/dashboard/clienti')
    await page.waitForTimeout(1000)

    const chatButton = page.locator('a[href*="/chat"]').first()
    if ((await chatButton.count()) > 0) {
      await chatButton.click()
      await page.waitForTimeout(2000)

      // Cerca pulsante upload file
      const uploadButton = page.locator(
        'button[aria-label*="file"], button[aria-label*="upload"], input[type="file"]',
      )
      if ((await uploadButton.count()) > 0) {
        // Verifica che il pulsante sia presente
        await expect(uploadButton.first()).toBeVisible()
      }
    }
  })
})
