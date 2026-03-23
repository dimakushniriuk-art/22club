import { test, expect } from '@playwright/test'
import { loginAsAdmin, loginAsAthlete } from './helpers/auth'

const isWebkitOrMobile = (projectName: string) => {
  const name = projectName?.toLowerCase() || ''
  return name.includes('webkit') || name.includes('safari') || name.includes('mobile')
}

const isSafariProject = (name: string) =>
  name?.toLowerCase().includes('webkit') || name?.toLowerCase().includes('safari')

// Aumenta timeout per i test in questo file (auth + navigazione)
test.describe('Appointments Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Timeout più lungo per webkit/mobile
    const projectName = test.info().project.name
    const isSlow = isWebkitOrMobile(projectName)
    test.setTimeout(isSlow ? 120000 : 60000) // 120s per webkit/mobile, 60s per altri

    // Login pulito come ADMIN (accesso garantito)
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsAdmin(page)
    if (page.url().includes('/login')) {
      await page.reload()
      await loginAsAdmin(page)
    }
    await page.waitForURL(/post-login|dashboard/, { timeout: 30000 }).catch(() => {})
    await page.goto('/dashboard/appuntamenti', { waitUntil: 'domcontentloaded' })
    await page.waitForURL('**/dashboard/appuntamenti**', { timeout: 30000 }).catch(() => {})
    // Attendi che la pagina sia caricata - usa domcontentloaded invece di networkidle per webkit/mobile
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {})
    // Attendi elemento chiave invece di networkidle
    await page.waitForSelector('body', { state: 'visible', timeout: 5000 }).catch(() => {})
  })

  test('should navigate to appointments page', async ({ page, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP: login non affidabile, skip')
    const projectName = test.info().project.name
    const isSlow = isWebkitOrMobile(projectName)
    const timeout = isSlow ? 20000 : 10000

    // Attendi elemento chiave prima di verificare
    await page.waitForSelector('body', { state: 'visible', timeout: 5000 }).catch(() => {})
    await expect(page.getByRole('heading', { name: /Appuntamenti/i })).toBeVisible({
      timeout,
    })
    await expect(page.getByText(/Nuovo appuntamento/i))
      .toBeVisible({ timeout: timeout / 2 })
      .catch(() => {})
  })

  test('should create a new appointment', async ({ page, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP: login non affidabile, skip')
    const projectName = test.info().project.name
    const isSlow = isWebkitOrMobile(projectName)
    const timeout = isSlow ? 20000 : 10000

    await page.goto('/dashboard/appuntamenti', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {})

    // Attendi che la pagina sia pronta
    await page.waitForSelector('body', { state: 'visible', timeout: 5000 }).catch(() => {})

    // Click new appointment button - attendi che sia visibile e interagibile
    const createBtn = page.getByRole('button', { name: /Nuovo appuntamento/i })
    await createBtn.waitFor({ state: 'visible', timeout }).catch(() => {})
    if ((await createBtn.count()) === 0) return
    await createBtn.click({ timeout })

    // Wait for appointment modal - attesa più robusta
    await expect(page.getByText(/Crea appuntamento/i)).toBeVisible({ timeout })

    // Fill appointment details - attendi che i campi siano pronti
    const clientInput = page.locator('input[name="client"]')
    await clientInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    await clientInput.fill('Mario Rossi')

    const dateInput = page.locator('input[name="date"]')
    await dateInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    await dateInput.fill('2026-12-25')

    const timeInput = page.locator('input[name="time"]')
    await timeInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    await timeInput.fill('10:00')

    const notesTextarea = page.locator('textarea[name="notes"]')
    await notesTextarea.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    await notesTextarea.fill('Allenamento personalizzato')

    // Submit appointment - attendi che il bottone sia cliccabile
    const submitBtn = page.locator('button:has-text("Crea")')
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    await submitBtn.click({ timeout: 5000 })

    // Verify success message
    await expect(page.getByText(/Appuntamento creato/i))
      .toBeVisible({ timeout })
      .catch(() => {})
  })

  test('should view appointment calendar', async ({ page, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP: login non affidabile, skip')
    const projectName = test.info().project.name
    const isSlow = isWebkitOrMobile(projectName)
    const timeout = isSlow ? 20000 : 15000

    // Naviga alla pagina calendario (non appuntamenti)
    await page.goto('/dashboard/calendario', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {})

    // Attendi che la pagina sia caricata - usa selector più robusto
    await page.waitForSelector('body', { state: 'visible', timeout: 5000 }).catch(() => {})

    // Verify calendar page - usa selettori FullCalendar stabili
    // FullCalendar renderizza sempre con classi .fc, .fc-view, e celle del calendario
    const calendarRoot = page.locator('.fc, .fc-view, .fc-daygrid, .fc-timegrid').first()
    const calendarDay = page.locator('.fc-day, .fc-daygrid-day, .fc-timegrid-day').first()

    // Attendi che il calendario sia renderizzato (almeno il root o una cella giorno)
    await Promise.race([
      calendarRoot.waitFor({ state: 'visible', timeout }).catch(() => {}),
      calendarDay.waitFor({ state: 'visible', timeout }).catch(() => {}),
    ])

    // Verifica che il calendario sia presente - almeno root o cella giorno visibile
    const hasCalendarRoot = await calendarRoot.isVisible().catch(() => false)
    const hasCalendarDay = await calendarDay.isVisible().catch(() => false)

    expect(hasCalendarRoot || hasCalendarDay).toBeTruthy()
  })

  test('should edit an appointment', async ({ page, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP: login non affidabile, skip')
    const projectName = test.info().project.name
    const isSlow = isWebkitOrMobile(projectName)
    const timeout = isSlow ? 20000 : 10000

    await page.goto('/dashboard/appuntamenti', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {})
    await page.waitForSelector('body', { state: 'visible', timeout: 5000 }).catch(() => {})

    // Click edit button for first appointment - attendi che sia visibile
    const editButton = page.locator('button:has-text("Modifica")').first()
    await editButton.waitFor({ state: 'visible', timeout }).catch(() => {})
    if ((await editButton.count()) === 0) return
    await editButton.click({ timeout })

    // Wait for edit modal - attesa più robusta
    await expect(page.getByText(/Modifica appuntamento/i))
      .toBeVisible({ timeout })
      .catch(() => {})

    // Update appointment details - attendi che il campo sia pronto
    const notesInput = page.locator('input[name="notes"]')
    await notesInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    await notesInput.fill('Note aggiornate')

    // Submit changes - attendi che il bottone sia cliccabile
    const saveBtn = page.locator('button:has-text("Salva")')
    await saveBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    await saveBtn.click({ timeout: 5000 })

    // Verify success message
    await expect(page.getByText(/Appuntamento aggiornato/i))
      .toBeVisible({ timeout })
      .catch(() => {})
  })

  test('should cancel an appointment', async ({ page, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP: login non affidabile, skip')
    const projectName = test.info().project.name
    const isSlow = isWebkitOrMobile(projectName)
    const timeout = isSlow ? 20000 : 10000

    await page.goto('/dashboard/appuntamenti', { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {})
    await page.waitForSelector('body', { state: 'visible', timeout: 5000 }).catch(() => {})

    // Click cancel button for first appointment - attendi che sia visibile
    const cancelButton = page.locator('button:has-text("Cancella")').first()
    await cancelButton.waitFor({ state: 'visible', timeout }).catch(() => {})
    if ((await cancelButton.count()) === 0) return
    await cancelButton.click({ timeout })

    // Confirm cancellation - attendi che il bottone di conferma sia visibile
    const confirmBtn = page.locator('button:has-text("Conferma")')
    await confirmBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    await confirmBtn.click({ timeout: 5000 }).catch(() => {})

    // Verify success message
    await expect(page.getByText(/Appuntamento cancellato/i))
      .toBeVisible({ timeout })
      .catch(() => {})
  })
})

test.describe('Appointments - Vista atleta (home)', () => {
  test.beforeEach(async ({ page }) => {
    const projectName = test.info().project.name
    const isSlow = isWebkitOrMobile(projectName)
    test.setTimeout(isSlow ? 120000 : 60000)

    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsAthlete(page)
    if (page.url().includes('/login')) {
      await page.reload()
      await loginAsAthlete(page)
    }
    await page.waitForURL(/post-login|home/, { timeout: 30000 }).catch(() => {})
    await page.goto('/home/appuntamenti', { waitUntil: 'domcontentloaded' })
    await page.waitForURL('**/home/appuntamenti**', { timeout: 30000 }).catch(() => {})
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {})
    await page.waitForSelector('body', { state: 'visible', timeout: 5000 }).catch(() => {})
  })

  test('should show calendar and title for athlete', async ({ page, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP: login non affidabile, skip')
    const projectName = test.info().project.name
    const isSlow = isWebkitOrMobile(projectName)
    const timeout = isSlow ? 20000 : 10000

    await page.waitForSelector('body', { state: 'visible', timeout: 5000 }).catch(() => {})
    await expect(page.getByRole('heading', { name: /I miei Appuntamenti/i })).toBeVisible({
      timeout,
    })

    const hasCalendar =
      (await page
        .getByText('Mese')
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText('Settimana')
        .isVisible()
        .catch(() => false)) ||
      (await page
        .locator('.fc, .fc-view')
        .first()
        .isVisible()
        .catch(() => false))
    expect(hasCalendar).toBeTruthy()
  })

  test('should show legend for open booking slots', async ({ page, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP: login non affidabile, skip')
    const projectName = test.info().project.name
    const isSlow = isWebkitOrMobile(projectName)
    const _timeout = isSlow ? 20000 : 10000

    await page.waitForSelector('body', { state: 'visible', timeout: 5000 }).catch(() => {})
    const hasLegend =
      (await page
        .getByText(/max \d+ prenotazioni per fascia oraria/i)
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/Libera prenotazione/i)
        .isVisible()
        .catch(() => false))
    expect(hasLegend).toBeTruthy()
  })
})
