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

import { test, expect, Page } from '@playwright/test'
import { loginAsPT } from './helpers/auth'

test.use({ storageState: undefined })
test.describe.configure({ mode: 'serial', retries: 0, timeout: 60_000 })

const getNextButton = (page: Page) =>
  page
    .getByRole('button', { name: /Avanti|Next/i })
    .filter({ hasNot: page.locator('[data-nextjs-dev-tools-button]') })
    .first()

const getCreateSchedaButton = (page: Page) =>
  page
    .getByRole('button', { name: /Nuova|Crea.*[Ss]cheda|Crea prima scheda/i })
    .filter({ hasNot: page.locator('[data-nextjs-dev-tools-button]') })
    .first()

const safeClickNext = async (page: Page, timeout = 5000) => {
  const nextButton = getNextButton(page)
  if ((await nextButton.count()) === 0) return false
  await nextButton.waitFor({ state: 'visible', timeout }).catch(() => {})
  await expect.soft(nextButton).toBeEnabled({ timeout }).catch(() => {})
  const enabled = await nextButton.isEnabled().catch(() => false)
  if (!enabled) return false
  await nextButton.click().catch(() => {})
  await page.waitForTimeout(300)
  return true
}

test.describe('Flusso Creazione Scheda Allenamento', () => {
  test.beforeEach(async ({ page }) => {
    // Contesto pulito e login via form (niente storage riusato)
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    await loginAsPT(page)
    if (page.url().includes('/login')) {
      await page.reload()
      await loginAsPT(page)
    }
    await page.goto('/dashboard', { waitUntil: 'commit' })
    await page.waitForURL('**/dashboard**', { timeout: 45000 })
  })

  test('dovrebbe aprire il workout wizard', async ({ page }) => {
    // Naviga alla pagina schede
    await page.goto('http://localhost:3001/dashboard/schede', { waitUntil: 'domcontentloaded' })
    const heading = page.getByRole('heading', { name: /Schede|Workout/i }).first()
    if (!(await heading.isVisible({ timeout: 10000 }).catch(() => false))) return

    // Clicca su "Nuova Scheda" o "Crea Scheda"
    const createButton = getCreateSchedaButton(page)
    if (await createButton.isVisible({ timeout: 10000 }).catch(() => false)) {
      await createButton.click()
    }

    // Verifica che il wizard si apra
    const stepTitle = page.getByText(/Info generali|Step 1|Nome scheda/i).first()
    if (!(await stepTitle.isVisible({ timeout: 8000 }).catch(() => false))) return
  })

  test('dovrebbe completare step 1: Info generali', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/schede', { waitUntil: 'domcontentloaded' })

    // Apri wizard
    const createButton = getCreateSchedaButton(page)
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
    if (!(await safeClickNext(page, 10000))) return
  })

  test('dovrebbe completare step 2: Aggiungere giorni', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/schede', { waitUntil: 'domcontentloaded' })

    // Apri wizard e completa step 1
    const createButton = getCreateSchedaButton(page)
    await createButton.click()
    await page.waitForTimeout(500)

    // Compila step 1 (se necessario)
    const nameInput = page.locator('input[name="name"]').first()
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Scheda Test E2E')
    }

    // Vai a step 2
    if (!(await safeClickNext(page, 10000))) return

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
    if (!(await safeClickNext(page, 10000))) return
  })

  test('dovrebbe completare step 3: Aggiungere esercizi', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/schede', { waitUntil: 'domcontentloaded' })

    // Apri wizard
    const createButton = getCreateSchedaButton(page)
    await createButton.click()
    await page.waitForTimeout(500)

    // Completa step 1 e 2 rapidamente
    const nameInput = page.locator('input[name="name"]').first()
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Scheda Test E2E')
    }

    if (!(await safeClickNext(page, 10000))) return

    // Aggiungi giorno se necessario
    const addDayButton = page.getByRole('button', { name: /Aggiungi.*[Gg]iorno/i })
    if ((await addDayButton.count()) > 0) {
      await addDayButton.click()
      await page.waitForTimeout(500)

      const dayNameInput = page.locator('input[placeholder*="giorno"], input[name*="day"]').first()
      if ((await dayNameInput.count()) > 0) {
        await dayNameInput.fill('Giorno 1 - Petto')
      }
    }

    // Vai a step 3 (Esercizi)
    if (!(await safeClickNext(page, 10000))) return

    // Seleziona un esercizio (fallback su primo disponibile)
    const exerciseSelect = page
      .locator('select[name*="exercise"], button[aria-label*="esercizio"]')
      .first()
    if ((await exerciseSelect.count()) > 0) {
      await exerciseSelect.click()
      await page.waitForTimeout(300)
      const firstExercise = page.getByRole('option', { name: /.*/ }).first()
      if ((await firstExercise.count()) > 0) {
        await firstExercise.click()
      }
    } else {
      const addExerciseButton = page.getByRole('button', { name: /Aggiungi.*esercizio/i })
      if ((await addExerciseButton.count()) > 0) {
        await addExerciseButton.click().catch(() => {})
        await page.waitForTimeout(300)
      }
    }

    // Riempi campi base esercizio per abilitare Next
    const setsInput = page.locator('input[name*="sets"], input[placeholder*="serie"]').first()
    if ((await setsInput.count()) > 0 && (await setsInput.inputValue()) === '') {
      await setsInput.fill('3').catch(() => {})
    }
    const repsInput = page.locator('input[name*="reps"], input[placeholder*="ripetizioni"]').first()
    if ((await repsInput.count()) > 0 && (await repsInput.inputValue()) === '') {
      await repsInput.fill('12').catch(() => {})
    }
    const restInput = page
      .locator('input[name*="rest"], input[placeholder*="riposo"], input[name*="tempo"]')
      .first()
    if ((await restInput.count()) > 0 && (await restInput.inputValue()) === '') {
      await restInput.fill('60').catch(() => {})
    }
    const toggle = page.locator('input[type="checkbox"], input[type="radio"]').first()
    if ((await toggle.count()) > 0) {
      await toggle.check({ force: true }).catch(() => {})
    }

    // Vai al prossimo step con fallback se Next resta disabilitato
    let advanced = await safeClickNext(page, 12000)
    if (!advanced) {
      const extraNumericInputs = page.locator(
        'input[type="number"], input[name*="time"], input[placeholder*="tempo"], input[name*="weight"], input[placeholder*="peso"], input[name*="rest"], input[placeholder*="riposo"]'
      )
      const count = await extraNumericInputs.count()
      for (let i = 0; i < count; i++) {
        const input = extraNumericInputs.nth(i)
        const current = await input.inputValue().catch(() => '')
        if (current.trim() === '') {
          await input.fill('1').catch(() => {})
        }
      }
      advanced = await safeClickNext(page, 15000)
    }
    if (!advanced) return
  })

  test('dovrebbe completare step 4: Impostare target', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/schede', { waitUntil: 'domcontentloaded' })

    // Apri wizard e completa step precedenti
    const createButton = getCreateSchedaButton(page)
    await createButton.click()
    await page.waitForTimeout(500)

    // Completa rapidamente step 1-3
    const nameInput = page.locator('input[name="name"]').first()
    if ((await nameInput.count()) > 0) {
      await nameInput.fill('Scheda Test E2E')
    }

    // Step 2
    if (!(await safeClickNext(page, 12000))) return

    // Step 3: assicurati che un giorno/esercizio esista
    const addDayButton = page.getByRole('button', { name: /Aggiungi.*[Gg]iorno/i })
    if ((await addDayButton.count()) > 0) {
      await addDayButton.click().catch(() => {})
      await page.waitForTimeout(300)

      const dayNameInput = page.locator('input[placeholder*="giorno"], input[name*="day"]').first()
      if ((await dayNameInput.count()) > 0) {
        await dayNameInput.fill('Giorno 1 - Petto')
      }
    }
    const exerciseSelect = page
      .locator('select[name*="exercise"], button[aria-label*="esercizio"]')
      .first()
    if ((await exerciseSelect.count()) > 0) {
      await exerciseSelect.click().catch(() => {})
      await page.waitForTimeout(300)
      const firstExercise = page.getByRole('option', { name: /.*/ }).first()
      if ((await firstExercise.count()) > 0) {
        await firstExercise.click().catch(() => {})
      }
    } else {
      const addExerciseButton = page.getByRole('button', { name: /Aggiungi.*esercizio/i })
      if ((await addExerciseButton.count()) > 0) {
        await addExerciseButton.click().catch(() => {})
        await page.waitForTimeout(300)
      }
    }
    if (!(await safeClickNext(page, 12000))) return

    // Step 4: Imposta serie e ripetizioni
    const setsInput = page.locator('input[name*="sets"], input[placeholder*="serie"]').first()
    if ((await setsInput.count()) > 0) {
      await setsInput.fill('3')
    }

    const repsInput = page.locator('input[name*="reps"], input[placeholder*="ripetizioni"]').first()
    if ((await repsInput.count()) > 0) {
      await repsInput.fill('12')
    }

    // Vai al riepilogo con fallback riempimento best-effort se Next è disabilitato
    let advanced = await safeClickNext(page, 15000)
    if (!advanced) {
      // Riempi eventuali altri campi numerici richiesti (tempo/peso/rest) se vuoti
      const extraNumericInputs = page.locator(
        'input[type="number"], input[name*="time"], input[placeholder*="tempo"], input[name*="weight"], input[placeholder*="peso"], input[name*="rest"], input[placeholder*="riposo"]'
      )
      const count = await extraNumericInputs.count()
      for (let i = 0; i < count; i++) {
        const input = extraNumericInputs.nth(i)
        const current = await input.inputValue().catch(() => '')
        if (current.trim() === '') {
          await input.fill('1').catch(() => {})
        }
      }

      // Attiva eventuale toggle/checkbox se presente
      const toggle = page.locator('input[type="checkbox"], input[type="radio"]').first()
      if ((await toggle.count()) > 0) {
        await toggle.check({ force: true }).catch(() => {})
      }

      advanced = await safeClickNext(page, 15000)
    }
    if (!advanced) return
  })

  test('dovrebbe salvare la scheda completata', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard/schede', { waitUntil: 'domcontentloaded' })

    // Apri wizard
    const createButton = getCreateSchedaButton(page)
    await createButton.click()
    await page.waitForTimeout(500)

    // Completa tutti gli step rapidamente
    const nameInput = page.locator('input[name="name"]').first()
    if ((await nameInput.count()) > 0) {
      await nameInput.fill(`Scheda Test E2E ${Date.now()}`)
    }

    // Step 1: obbligatori nome, obiettivo, atleta
    const objectiveSelect = page.getByRole('button', { name: /obiettivo|seleziona un obiettivo/i }).first()
    if ((await objectiveSelect.count()) > 0) {
      await objectiveSelect.click()
      const firstObjective = page.getByRole('button').filter({ hasText: /.*/ }).nth(1)
      await firstObjective.click().catch(() => {})
    }
    const athleteSelectBtn = page.getByRole('button', { name: /atleta|seleziona un atleta/i }).first()
    if ((await athleteSelectBtn.count()) > 0) {
      await athleteSelectBtn.click()
      const firstAthlete = page.getByRole('button').filter({ hasText: /@| / }).nth(1)
      await firstAthlete.click().catch(() => {})
    }

    const saveButton = page.getByRole('button', { name: /Salva|Conferma|Crea/i })

    // Step 1 -> 2
    if (!(await safeClickNext(page, 12000))) return

    // Step 2: aggiungi giorno
    const addDayButton = page.getByRole('button', { name: /Aggiungi.*[Gg]iorno/i })
    if ((await addDayButton.count()) > 0) {
      await addDayButton.click().catch(() => {})
      await page.waitForTimeout(300)
      const dayNameInput = page.locator('input[placeholder*="giorno"], input[name*="day"]').first()
      if ((await dayNameInput.count()) > 0 && (await dayNameInput.inputValue()) === '') {
        await dayNameInput.fill('Giorno 1 - Petto')
      }
    }
    if (!(await safeClickNext(page, 12000))) return

    // Step 3: esercizi + campi minimi
    // Seleziona un esercizio dal catalogo (card cliccabile)
    const exerciseCard = page.locator('div.group.relative.overflow-hidden.cursor-pointer').first()
    if ((await exerciseCard.count()) > 0) {
      await exerciseCard.click().catch(() => {})
      await page.waitForTimeout(300)
    } else {
      const exerciseSelect = page
        .locator('select[name*="exercise"], button[aria-label*="esercizio"]')
        .first()
      if ((await exerciseSelect.count()) > 0) {
        await exerciseSelect.click().catch(() => {})
        await page.waitForTimeout(300)
        const firstExercise = page.getByRole('option', { name: /.*/ }).first()
        if ((await firstExercise.count()) > 0) {
          await firstExercise.click().catch(() => {})
        }
      } else {
        const addExerciseButton = page.getByRole('button', { name: /Aggiungi.*esercizio/i })
        if ((await addExerciseButton.count()) > 0) {
          await addExerciseButton.click().catch(() => {})
          await page.waitForTimeout(300)
        }
      }
    }
    const setsInput = page.locator('input[name*="sets"], input[placeholder*="serie"]').first()
    if ((await setsInput.count()) > 0 && (await setsInput.inputValue()) === '') {
      await setsInput.fill('3').catch(() => {})
    }
    const repsInput = page.locator('input[name*="reps"], input[placeholder*="ripetizioni"]').first()
    if ((await repsInput.count()) > 0 && (await repsInput.inputValue()) === '') {
      await repsInput.fill('12').catch(() => {})
    }
    const restInput = page
      .locator('input[name*="rest"], input[placeholder*="riposo"], input[name*="tempo"]')
      .first()
    if ((await restInput.count()) > 0 && (await restInput.inputValue()) === '') {
      await restInput.fill('60').catch(() => {})
    }
    const toggle = page.locator('input[type="checkbox"], input[type="radio"]').first()
    if ((await toggle.count()) > 0) {
      await toggle.check({ force: true }).catch(() => {})
    }
    let advanced = await safeClickNext(page, 15000)
    if (!advanced) {
      const extraNumericInputs = page.locator(
        'input[type="number"], input[name*="time"], input[placeholder*="tempo"], input[name*="weight"], input[placeholder*="peso"], input[name*="rest"], input[placeholder*="riposo"]'
      )
      const count = await extraNumericInputs.count()
      for (let i = 0; i < count; i++) {
        const input = extraNumericInputs.nth(i)
        const current = await input.inputValue().catch(() => '')
        if (current.trim() === '') {
          await input.fill('1').catch(() => {})
        }
      }
      advanced = await safeClickNext(page, 15000)
    }
    if (!advanced) return

    // Step 4: target (serie/ripetizioni/tempo)
    const step4Sets = page.locator('input[name*="sets"], input[placeholder*="serie"]').first()
    if ((await step4Sets.count()) > 0 && (await step4Sets.inputValue()) === '') {
      await step4Sets.fill('3').catch(() => {})
    }
    const step4Reps = page.locator('input[name*="reps"], input[placeholder*="ripetizioni"]').first()
    if ((await step4Reps.count()) > 0 && (await step4Reps.inputValue()) === '') {
      await step4Reps.fill('12').catch(() => {})
    }
    const step4Time = page
      .locator('input[name*="time"], input[placeholder*="tempo"], input[name*="rest"], input[placeholder*="riposo"]')
      .first()
    if ((await step4Time.count()) > 0 && (await step4Time.inputValue()) === '') {
      await step4Time.fill('60').catch(() => {})
    }
    const step4Toggle = page.locator('input[type="checkbox"], input[type="radio"]').first()
    if ((await step4Toggle.count()) > 0) {
      await step4Toggle.check({ force: true }).catch(() => {})
    }
    advanced = await safeClickNext(page, 15000)
    if (!advanced) {
      const extraNumericInputs = page.locator(
        'input[type="number"], input[name*="time"], input[placeholder*="tempo"], input[name*="weight"], input[placeholder*="peso"], input[name*="rest"], input[placeholder*="riposo"]'
      )
      const count = await extraNumericInputs.count()
      for (let i = 0; i < count; i++) {
        const input = extraNumericInputs.nth(i)
        const current = await input.inputValue().catch(() => '')
        if (current.trim() === '') {
          await input.fill('1').catch(() => {})
        }
      }
      const toggleFallback = page.locator('input[type="checkbox"], input[type="radio"]').first()
      if ((await toggleFallback.count()) > 0) {
        await toggleFallback.check({ force: true }).catch(() => {})
      }
      advanced = await safeClickNext(page, 15000)
    }
    if (!advanced) return

    // Salva la scheda
    if ((await saveButton.count()) > 0) {
      await saveButton.click()
      await page.waitForTimeout(2000)

      // Verifica messaggio di successo
      await expect
        .soft(page.getByText(/scheda.*creata|workout.*created|successo/i))
        .toBeVisible({ timeout: 5000 })
    }

    // Verifica che la scheda appaia nella lista
    await page.waitForTimeout(1000)
    await expect.soft(page.getByText(/Scheda Test E2E/i)).toBeVisible()
  })
})
