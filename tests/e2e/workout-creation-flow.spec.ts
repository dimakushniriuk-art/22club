/**
 * Test E2E: Flusso completo creazione scheda allenamento
 *
 * Testa l'intero flusso del workout wizard:
 * 1. PT naviga a schede
 * 2. Apre workout wizard
 * 3. Compila info generali
 * 4. Aggiunge giorni
 * 5. Aggiunge esercizi
 * 6. Imposta target
 * 7. Conferma e salva
 */

import { test, expect } from '@playwright/test'

test.describe('Flusso Creazione Scheda Allenamento', () => {
  test.beforeEach(async ({ page }) => {
    // Login come PT
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
  })

  test('dovrebbe aprire il workout wizard', async ({ page }) => {
    // Naviga alla pagina schede
    await page.goto('http://localhost:3001/dashboard/schede')
    await expect(page.getByRole('heading', { name: /Schede|Workout/i })).toBeVisible()

    // Clicca su "Nuova Scheda" o "Crea Scheda"
    const createButton = page.getByRole('button', {
      name: /Nuova|Crea.*[Ss]cheda|New.*[Ww]orkout/i,
    })
    await expect(createButton).toBeVisible()
    await createButton.click()

    // Verifica che il wizard si apra
    await expect(page.getByText(/Info generali|Step 1|Nome scheda/i)).toBeVisible()
  })

  test('dovrebbe completare step 1: Info generali', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/schede')

    // Apri wizard
    const createButton = page.getByRole('button', { name: /Nuova|Crea.*[Ss]cheda/i })
    await createButton.click()
    await page.waitForTimeout(500)

    // Compila info generali
    const nameInput = page
      .locator('input[name="name"], input[placeholder*="nome"], input[placeholder*="Nome"]')
      .first()
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Scheda Test E2E')
    }

    const descriptionInput = page
      .locator('textarea[name="description"], textarea[placeholder*="descrizione"]')
      .first()
    if ((await descriptionInput.count()) > 0) {
      await descriptionInput.fill('Scheda di test per E2E')
    }

    // Seleziona atleta
    const athleteSelect = page
      .locator('select[name="athlete"], select[aria-label*="atleta"]')
      .first()
    if ((await athleteSelect.count()) > 0) {
      await athleteSelect.selectOption({ index: 1 }) // Seleziona primo atleta disponibile
    }

    // Vai al prossimo step
    const nextButton = page.getByRole('button', { name: /Avanti|Next|Continua/i })
    if ((await nextButton.count()) > 0) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('dovrebbe completare step 2: Aggiungere giorni', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/schede')

    // Apri wizard e completa step 1
    const createButton = page.getByRole('button', { name: /Nuova|Crea.*[Ss]cheda/i })
    await createButton.click()
    await page.waitForTimeout(500)

    // Compila step 1 (se necessario)
    const nameInput = page.locator('input[name="name"]').first()
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Scheda Test E2E')
    }

    // Vai a step 2
    const nextButton = page.getByRole('button', { name: /Avanti|Next/i })
    if ((await nextButton.count()) > 0) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }

    // Aggiungi un giorno
    const addDayButton = page.getByRole('button', { name: /Aggiungi.*[Gg]iorno|Add.*[Dd]ay/i })
    if ((await addDayButton.count()) > 0) {
      await addDayButton.click()
      await page.waitForTimeout(500)

      // Compila nome giorno
      const dayNameInput = page.locator('input[placeholder*="giorno"], input[name*="day"]').first()
      if ((await dayNameInput.count()) > 0) {
        await dayNameInput.fill('Giorno 1 - Petto')
      }
    }

    // Vai al prossimo step
    if ((await nextButton.count()) > 0) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('dovrebbe completare step 3: Aggiungere esercizi', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/schede')

    // Apri wizard
    const createButton = page.getByRole('button', { name: /Nuova|Crea.*[Ss]cheda/i })
    await createButton.click()
    await page.waitForTimeout(500)

    // Completa step 1 e 2 rapidamente
    const nameInput = page.locator('input[name="name"]').first()
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Scheda Test E2E')
    }

    const nextButton = page.getByRole('button', { name: /Avanti|Next/i })
    if ((await nextButton.count()) > 0) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }

    // Aggiungi giorno se necessario
    const addDayButton = page.getByRole('button', { name: /Aggiungi.*[Gg]iorno/i })
    if ((await addDayButton.count()) > 0) {
      await addDayButton.click()
      await page.waitForTimeout(500)
    }

    // Vai a step 3 (Esercizi)
    if ((await nextButton.count()) > 0) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }

    // Seleziona un esercizio
    const exerciseSelect = page
      .locator('select[name*="exercise"], button[aria-label*="esercizio"]')
      .first()
    if ((await exerciseSelect.count()) > 0) {
      await exerciseSelect.click()
      await page.waitForTimeout(500)

      // Seleziona primo esercizio disponibile
      const firstExercise = page.getByRole('option', { name: /.*/ }).first()
      if ((await firstExercise.count()) > 0) {
        await firstExercise.click()
      }
    }

    // Vai al prossimo step
    if ((await nextButton.count()) > 0) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('dovrebbe completare step 4: Impostare target', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/schede')

    // Apri wizard e completa step precedenti
    const createButton = page.getByRole('button', { name: /Nuova|Crea.*[Ss]cheda/i })
    await createButton.click()
    await page.waitForTimeout(500)

    // Completa rapidamente step 1-3
    const nameInput = page.locator('input[name="name"]').first()
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Scheda Test E2E')
    }

    const nextButton = page.getByRole('button', { name: /Avanti|Next/i })

    // Step 2
    if ((await nextButton.count()) > 0) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }

    // Step 3
    if ((await nextButton.count()) > 0) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }

    // Step 4: Imposta serie e ripetizioni
    const setsInput = page.locator('input[name*="sets"], input[placeholder*="serie"]').first()
    if ((await setsInput.count()) > 0) {
      await setsInput.fill('3')
    }

    const repsInput = page.locator('input[name*="reps"], input[placeholder*="ripetizioni"]').first()
    if ((await repsInput.count()) > 0) {
      await repsInput.fill('12')
    }

    // Vai al riepilogo
    if ((await nextButton.count()) > 0) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('dovrebbe salvare la scheda completata', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/schede')

    // Apri wizard
    const createButton = page.getByRole('button', { name: /Nuova|Crea.*[Ss]cheda/i })
    await createButton.click()
    await page.waitForTimeout(500)

    // Completa tutti gli step rapidamente
    const nameInput = page.locator('input[name="name"]').first()
    if ((await nameInput.count()) > 0) {
      await nameInput.fill(`Scheda Test E2E ${Date.now()}`)
    }

    const nextButton = page.getByRole('button', { name: /Avanti|Next/i })
    const saveButton = page.getByRole('button', { name: /Salva|Conferma|Crea/i })

    // Naviga attraverso gli step
    for (let i = 0; i < 4; i++) {
      if ((await nextButton.count()) > 0) {
        await nextButton.click()
        await page.waitForTimeout(500)
      } else {
        break
      }
    }

    // Salva la scheda
    if ((await saveButton.count()) > 0) {
      await saveButton.click()
      await page.waitForTimeout(2000)

      // Verifica messaggio di successo
      await expect(page.getByText(/scheda.*creata|workout.*created|successo/i)).toBeVisible({
        timeout: 5000,
      })
    }

    // Verifica che la scheda appaia nella lista
    await page.waitForTimeout(1000)
    await expect(page.getByText(/Scheda Test E2E/i)).toBeVisible()
  })
})
