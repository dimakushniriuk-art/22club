import { expect, test, type Page } from '@playwright/test'
import { dismissCookieBanner, loginAsAthlete } from './helpers/auth'

type AppointmentRow = {
  id: string
  starts_at: string
  ends_at: string
  notes?: string | null
  athlete_id?: string | null
  cancelled_at?: string | null
  status?: string | null
  created_by_role?: 'athlete' | 'trainer' | 'admin' | null
  is_open_booking_day?: boolean | null
}

const isAuthFlakyProject = (name: string) => {
  const n = name?.toLowerCase() || ''
  return n.includes('webkit') || n.includes('safari') || n.includes('mobile')
}

const toastAlert = (page: Page) =>
  page.getByRole('region', { name: 'Notifiche' }).getByRole('alert').last()

const parseMaxPerSlot = async (page: Page) => {
  const text = await page
    .getByText(/Libera prenotazione:\s*max\s*\d+\s*prenotazioni/i)
    .first()
    .textContent()
    .catch(() => null)
  const m = text?.match(/max\s*(\d+)/i)
  return m ? Number(m[1]) : 4
}

const overlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
  const as = new Date(aStart).getTime()
  const ae = new Date(aEnd).getTime()
  const bs = new Date(bStart).getTime()
  const be = new Date(bEnd).getTime()
  return as < be && ae > bs
}

const pad2 = (n: number) => String(n).padStart(2, '0')

function computeBookableStartLabel(slotStartIso: string, slotEndIso: string) {
  const slotStart = new Date(slotStartIso)
  const slotEnd = new Date(slotEndIso)
  if (Number.isNaN(slotStart.getTime()) || Number.isNaN(slotEnd.getTime())) return null

  const durationMs = 90 * 60 * 1000
  const startMs = slotStart.getTime() + 5 * 60 * 1000
  const rounded = Math.ceil(startMs / (15 * 60 * 1000)) * 15 * 60 * 1000
  const endCandidate = rounded + durationMs
  if (endCandidate > slotEnd.getTime()) return null

  const d = new Date(rounded)
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  const hh = pad2(d.getHours())
  const mm = pad2(d.getMinutes())
  return { date: `${y}-${m}-${day}`, startLabel: `${hh}:${mm}` }
}

async function waitAppointmentsGet(page: Page) {
  const resp = await page.waitForResponse(
    (r) =>
      r.request().method() === 'GET' &&
      r.status() === 200 &&
      r.url().includes('/appointments?select='),
    { timeout: 30000 },
  )
  const json = (await resp.json()) as unknown
  return (Array.isArray(json) ? json : []) as AppointmentRow[]
}

async function openAthleteAppointments(page: Page) {
  await page.goto('/home/appuntamenti', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/home\/appuntamenti/, { timeout: 20000 })
}

test.describe.serial('Athlete open booking', () => {
  test.beforeEach(async ({ page, browserName }) => {
    test.skip(isAuthFlakyProject(browserName), 'Auth WebKit/Mobile non affidabile in locale')
    await page.addInitScript(() => localStorage.setItem('cookie-consent', 'true'))
    await loginAsAthlete(page)
    await dismissCookieBanner(page)
  })

  test('accesso atleta e caricamento pagina appuntamenti', async ({ page }) => {
    await openAthleteAppointments(page)
    await expect(page.getByRole('heading', { name: 'I miei Appuntamenti' })).toBeVisible({
      timeout: 20000,
    })

    const hasBlockedState = await page
      .getByText(/Non hai accesso al calendario/i)
      .isVisible()
      .catch(() => false)
    const hasTrainerMissingState = await page
      .getByText(/Non hai ancora un trainer assegnato/i)
      .isVisible()
      .catch(() => false)
    const hasCalendar = await page
      .locator('.fc, .fc-view')
      .first()
      .isVisible()
      .catch(() => false)

    expect(hasBlockedState || hasTrainerMissingState || hasCalendar).toBeTruthy()
  })

  test('create prenotazione atleta + refetch coerente (solo con slot affidabile)', async ({
    page,
  }) => {
    await openAthleteAppointments(page)

    const blocked = await page
      .getByText(/Non hai accesso al calendario/i)
      .isVisible()
      .catch(() => false)
    if (blocked) {
      await expect(page.getByText(/Non hai accesso al calendario/i)).toBeVisible()
      return
    }

    const noTrainer = await page
      .getByText(/Non hai ancora un trainer assegnato/i)
      .isVisible()
      .catch(() => false)
    if (noTrainer) {
      await expect(page.getByText(/Non hai ancora un trainer assegnato/i)).toBeVisible()
      return
    }

    const appointments = await waitAppointmentsGet(page)
    const maxPerSlot = await parseMaxPerSlot(page)
    const now = Date.now()
    const openSlots = appointments.filter(
      (a) =>
        a.is_open_booking_day === true &&
        !!a.starts_at &&
        !!a.ends_at &&
        new Date(a.ends_at).getTime() > now,
    )

    let chosen: { slot: AppointmentRow; date: string; startLabel: string } | undefined

    for (const slot of openSlots) {
      const start = computeBookableStartLabel(slot.starts_at, slot.ends_at)
      if (!start) continue
      const startIso = new Date(`${start.date}T${start.startLabel}:00`).toISOString()
      const endIso = new Date(new Date(startIso).getTime() + 90 * 60 * 1000).toISOString()
      const activeInSlot = appointments.filter(
        (r) =>
          !!r.athlete_id &&
          !r.cancelled_at &&
          r.status !== 'annullato' &&
          overlap(r.starts_at, r.ends_at, slot.starts_at, slot.ends_at),
      ).length
      const inside = overlap(startIso, endIso, slot.starts_at, slot.ends_at)
      if (inside && activeInSlot < maxPerSlot) {
        chosen = { slot, date: start.date, startLabel: start.startLabel }
        break
      }
    }

    if (!chosen) {
      await expect(page.locator('.fc, .fc-view').first()).toBeVisible()
      return
    }

    const note = `e2e-athlete-open-booking-${Date.now()}`
    await page.getByRole('button', { name: /Nuovo appuntamento/i }).click()
    await expect(page.getByTestId('appointment-form-overlay')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('appointment-form')).toBeVisible()

    const form = page.getByTestId('appointment-form')
    await form.locator('input[type="date"]').fill(chosen.date)
    await form.getByTestId('appointment-start-time-trigger').click()
    await page.getByTestId(`appointment-start-time-option-${chosen.startLabel}`).click()
    await form.getByPlaceholder('Note (opz.)').fill(note)
    await form.getByTestId('appointment-form-submit').click()

    await expect(page.getByTestId('appointment-form')).toBeHidden({ timeout: 25000 })

    await page.reload({ waitUntil: 'domcontentloaded' })
    await openAthleteAppointments(page)
    const afterRefetch = await waitAppointmentsGet(page)
    const created = afterRefetch.find(
      (a) => a.notes === note && a.created_by_role === 'athlete' && !a.cancelled_at,
    )
    expect(created).toBeTruthy()
  })

  test('caso non valido gestito: prenotazione fuori slot senza crash', async ({ page }) => {
    await openAthleteAppointments(page)

    const blocked = await page
      .getByText(/Non hai accesso al calendario/i)
      .isVisible()
      .catch(() => false)
    const noTrainer = await page
      .getByText(/Non hai ancora un trainer assegnato/i)
      .isVisible()
      .catch(() => false)
    if (blocked || noTrainer) {
      await expect(page.getByRole('heading', { name: 'I miei Appuntamenti' })).toBeVisible()
      return
    }

    await page.getByRole('button', { name: /Nuovo appuntamento/i }).click()
    await expect(page.getByTestId('appointment-form')).toBeVisible({ timeout: 10000 })

    const d = new Date()
    d.setDate(d.getDate() + 2)
    const ymd = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
    const form = page.getByTestId('appointment-form')
    await form.locator('input[type="date"]').fill(ymd)
    await form.getByTestId('appointment-start-time-trigger').click()
    await page.getByTestId('appointment-start-time-option-03:00').click()
    await form.getByTestId('appointment-form-submit').click()

    await expect(toastAlert(page)).toContainText(/orario.*slot|slot pieno|errore/i, {
      timeout: 15000,
    })
    await expect(page.getByRole('region', { name: 'Notifiche' })).not.toContainText(
      /Appuntamento creato|Salvataggio completato/i,
    )
    await expect(page.getByRole('heading', { name: 'I miei Appuntamenti' })).toBeVisible()
    await expect(page).toHaveURL(/\/home\/appuntamenti/)
  })
})
