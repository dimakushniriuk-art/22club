import { test, expect, type Page } from '@playwright/test'
import {
  TEST_CREDENTIALS,
  dismissCookieBanner,
  LOGIN_EMAIL_FIELD,
  LOGIN_PASSWORD_FIELD,
} from './helpers/auth'

/** WebKit/Mobile: cookie Secure su HTTP — stesso criterio degli altri E2E auth. */
const isAuthFlakyProject = (name: string) => {
  const n = name?.toLowerCase() || ''
  return n.includes('webkit') || n.includes('safari') || n.includes('mobile')
}

const toastRegion = (page: Page) => page.getByRole('region', { name: 'Notifiche' })

async function loginWithCredentials(page: Page, email: string, password: string) {
  await page.addInitScript(() => localStorage.setItem('cookie-consent', 'true'))
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await dismissCookieBanner(page)
  const emailInput = page.locator(LOGIN_EMAIL_FIELD)
  const passwordInput = page.locator(LOGIN_PASSWORD_FIELD)
  await emailInput.waitFor({ state: 'visible', timeout: 15000 })
  await passwordInput.waitFor({ state: 'visible', timeout: 15000 })
  await emailInput.fill(email)
  await passwordInput.fill(password)
  await page.getByRole('button', { name: /^Accedi$/i }).click()
}

async function expectToastMatching(page: Page, pattern: RegExp) {
  await expect(toastRegion(page).getByRole('alert').filter({ hasText: pattern })).toBeVisible({
    timeout: 12000,
  })
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** Domani locale YYYY-MM-DD — meno collisioni con dati residui da E2E precedenti nello stesso giorno. */
function tomorrowYmd() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** Allinea ai soli slot da 15 min nel form */
function toQuarterHourTime(d: Date) {
  const h = d.getHours()
  const m = d.getMinutes()
  const q = Math.floor(m / 15) * 15
  return `${pad2(h)}:${pad2(q)}`
}

function addMinutes(d: Date, mins: number) {
  return new Date(d.getTime() + mins * 60 * 1000)
}

/** Slot pienamente dentro il blocco (durata ≥ 30 min se possibile) */
function pickSlotInsideBlock(block: { starts_at: string; ends_at: string }) {
  const bs = new Date(block.starts_at).getTime()
  const be = new Date(block.ends_at).getTime()
  if (Number.isNaN(bs) || Number.isNaN(be) || be <= bs) return null
  const duration = be - bs
  const startMs = bs + Math.min(5 * 60 * 1000, duration * 0.1)
  const endMs = Math.min(startMs + 45 * 60 * 1000, be - 60 * 1000)
  if (endMs <= startMs + 14 * 60 * 1000) return null
  return { start: new Date(startMs), end: new Date(endMs) }
}

async function readCalendarBlocksFromNextGet(page: Page) {
  try {
    const resp = await page.waitForResponse(
      (r) =>
        r.url().includes('calendar_blocks') && r.request().method() === 'GET' && r.status() === 200,
      { timeout: 25000 },
    )
    const json: unknown = await resp.json()
    const rows = Array.isArray(json) ? json : (json as { data?: unknown }).data
    if (!Array.isArray(rows)) return [] as { starts_at: string; ends_at: string }[]
    return rows.filter(
      (r: unknown) =>
        typeof r === 'object' &&
        r !== null &&
        'starts_at' in r &&
        'ends_at' in r &&
        typeof (r as { starts_at: string }).starts_at === 'string',
    ) as { starts_at: string; ends_at: string }[]
  } catch {
    return [] as { starts_at: string; ends_at: string }[]
  }
}

/** Stessa condizione di `appointmentSlotOverlapsAnyCalendarBlock` (senza importare il modulo app). */
function slotOverlapsCalendarBlocks(
  startsAtIso: string,
  endsAtIso: string,
  blocks: { starts_at: string; ends_at: string }[],
): boolean {
  const slotStart = new Date(startsAtIso).getTime()
  const slotEnd = new Date(endsAtIso).getTime()
  if (Number.isNaN(slotStart) || Number.isNaN(slotEnd)) return false
  return blocks.some((b) => {
    const bs = new Date(b.starts_at).getTime()
    const be = new Date(b.ends_at).getTime()
    if (Number.isNaN(bs) || Number.isNaN(be)) return false
    return slotStart < be && slotEnd > bs
  })
}

function localSlotToIso(ymd: string, hm: string) {
  return new Date(`${ymd}T${hm}:00`).toISOString()
}

/**
 * Primo slot da 15 min in fascia giorno (06:00–21:00) che non interseca blocchi né `excludeRanges`.
 */
function pickFreeSlotLabelsOnDay(
  ymd: string,
  blocks: { starts_at: string; ends_at: string }[],
  durationMinutes: number,
  excludeRanges: { starts_at: string; ends_at: string }[] = [],
): { start: string; end: string } | null {
  for (let slotMin = 6 * 60; slotMin <= 21 * 60; slotMin += 15) {
    const h = Math.floor(slotMin / 60)
    const m = slotMin % 60
    const start = new Date(`${ymd}T${pad2(h)}:${pad2(m)}:00`)
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000)
    if (end.getDate() !== start.getDate()) continue
    const startLabel = `${pad2(start.getHours())}:${pad2(start.getMinutes())}`
    const endLabel = `${pad2(end.getHours())}:${pad2(end.getMinutes())}`
    const starts_at = start.toISOString()
    const ends_at = end.toISOString()
    if (slotOverlapsCalendarBlocks(starts_at, ends_at, blocks)) continue
    const hitsExclude = excludeRanges.some((ex) =>
      slotOverlapsCalendarBlocks(starts_at, ends_at, [ex]),
    )
    if (hitsExclude) continue
    return { start: startLabel, end: endLabel }
  }
  return null
}

function overlapFollowUpLabels(ymd: string, primaryStart: string, durationMinutes: number) {
  const [ph, pm] = primaryStart.split(':').map(Number) as [number, number]
  const oStart = new Date(`${ymd}T${pad2(ph)}:${pad2(pm)}:00`)
  oStart.setMinutes(oStart.getMinutes() + 15)
  const oEnd = new Date(oStart.getTime() + durationMinutes * 60 * 1000)
  return {
    start: `${pad2(oStart.getHours())}:${pad2(oStart.getMinutes())}`,
    end: `${pad2(oEnd.getHours())}:${pad2(oEnd.getMinutes())}`,
  }
}

async function pickFirstAthleteInForm(page: Page) {
  await page.getByTestId('appointment-athlete-trigger').click()
  await expect(page.getByTestId('appointment-athlete-listbox')).toBeVisible()
  const opts = page
    .getByTestId('appointment-athlete-listbox')
    .locator('button[data-testid^="appointment-athlete-option-"]')
  const n = await opts.count()
  for (let i = 0; i < n; i++) {
    const tid = await opts.nth(i).getAttribute('data-testid')
    if (tid && tid !== 'appointment-athlete-option-empty') {
      await opts.nth(i).click()
      return true
    }
  }
  await page.keyboard.press('Escape')
  return false
}

async function setFormDateAndTimes(page: Page, ymd: string, startLabel: string, endLabel: string) {
  const form = page.getByTestId('appointment-form')
  await form.locator('input[type="date"]').fill(ymd)
  await form.getByTestId('appointment-start-time-trigger').click()
  // SimpleSelect renderizza la listbox in portal (non discendente di `form`)
  await expect(page.getByTestId('appointment-start-time-listbox')).toBeVisible({ timeout: 10_000 })
  await page.getByTestId(`appointment-start-time-option-${startLabel}`).click()
  await expect(page.getByTestId('appointment-start-time-listbox')).toBeHidden()
  await form.getByTestId('appointment-end-time-trigger').click()
  await expect(page.getByTestId('appointment-end-time-listbox')).toBeVisible({ timeout: 10_000 })
  await page.getByTestId(`appointment-end-time-option-${endLabel}`).click()
  await expect(page.getByTestId('appointment-end-time-listbox')).toBeHidden()
}

test.describe.serial('Core flows (minimo)', () => {
  test('login e redirect: trainer → dashboard, admin → area admin', async ({
    browser,
    browserName,
  }) => {
    test.skip(isAuthFlakyProject(browserName), 'Auth su WebKit/Mobile locale non affidabile')
    test.setTimeout(90_000)

    const ctxT = await browser.newContext()
    const pT = await ctxT.newPage()
    await loginWithCredentials(
      pT,
      TEST_CREDENTIALS.trainer.email,
      TEST_CREDENTIALS.trainer.password,
    )
    await expect
      .poll(() => new URL(pT.url()).pathname.replace(/\/$/, ''), { timeout: 45_000 })
      .toBe('/dashboard')
    await ctxT.close()

    const ctxA = await browser.newContext()
    const pA = await ctxA.newPage()
    await loginWithCredentials(pA, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password)
    await expect
      .poll(() => new URL(pA.url()).pathname, { timeout: 45_000 })
      .toMatch(/\/dashboard\/admin/)
    await ctxA.close()
  })

  test('appuntamenti: crea, lista, modifica, overlap; blocco calendar_block se presente in API', async ({
    page,
    browserName,
  }) => {
    test.skip(isAuthFlakyProject(browserName), 'Auth su WebKit/Mobile locale non affidabile')
    test.setTimeout(180_000)

    await loginWithCredentials(
      page,
      TEST_CREDENTIALS.trainer.email,
      TEST_CREDENTIALS.trainer.password,
    )
    await expect
      .poll(() => new URL(page.url()).pathname.replace(/\/$/, ''), { timeout: 45_000 })
      .toBe('/dashboard')

    const blocksPromise = readCalendarBlocksFromNextGet(page)
    await page.goto('/dashboard/appuntamenti', { waitUntil: 'domcontentloaded' })
    const blocksResp = await blocksPromise
    await expect(page.getByRole('heading', { name: /Appuntamenti/i })).toBeVisible({
      timeout: 20_000,
    })
    await page.waitForLoadState('networkidle').catch(() => {})

    const collectRowTestIds = () =>
      page
        .locator('[data-testid^="appointment-row-"]')
        .evaluateAll((els) =>
          els.map((e) => e.getAttribute('data-testid')).filter((t): t is string => !!t),
        )

    const idsBefore = new Set(await collectRowTestIds())
    const day = tomorrowYmd()
    const primaryPick = pickFreeSlotLabelsOnDay(day, blocksResp, 90)
    if (!primaryPick) {
      test.skip(true, 'Nessuno slot 90 min oggi libero da calendar_blocks (fascia 06:00–21:00).')
      return
    }
    const primary = primaryPick

    await page.getByTestId('appointment-open-new').click()
    await expect(page.getByTestId('appointment-form-overlay')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('appointment-form')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('appointment-form')).toHaveAttribute('data-state', 'idle', {
      timeout: 15_000,
    })

    const picked = await pickFirstAthleteInForm(page)
    test.skip(!picked, 'Nessun atleta associato al trainer: impossibile creare appuntamento.')

    await setFormDateAndTimes(page, day, primary.start, primary.end)

    await page.getByTestId('appointment-form-submit').click()
    await expect(page.getByTestId('appointment-form')).toBeHidden({ timeout: 25_000 })

    let createdRowTestId: string | undefined
    await expect(async () => {
      const ids = await collectRowTestIds()
      const newIds = ids.filter((id) => !idsBefore.has(id))
      for (const tid of newIds) {
        const t = await page.getByTestId(tid).textContent()
        if (t?.includes(primary.start) && t?.includes(primary.end)) {
          createdRowTestId = tid
          break
        }
      }
      expect(createdRowTestId).toBeTruthy()
    }).toPass({ timeout: 25_000 })

    const aptId = createdRowTestId!.replace('appointment-row-', '')
    const row = page.getByTestId(`appointment-row-${aptId}`)
    await expect(row).toBeVisible()

    await page.getByTestId('appointment-open-new').click()
    await expect(page.getByTestId('appointment-form')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('appointment-form')).toHaveAttribute('data-state', 'idle', {
      timeout: 15_000,
    })
    const picked2 = await pickFirstAthleteInForm(page)
    expect(picked2).toBeTruthy()
    const overlapTry = overlapFollowUpLabels(day, primary.start, 90)
    await setFormDateAndTimes(page, day, overlapTry.start, overlapTry.end)
    await page.getByTestId('appointment-form-submit').click()
    await expectToastMatching(page, /occupato|Non è disponibile|slot/i)
    await page
      .getByTestId('appointment-form')
      .getByRole('button', { name: /^Annulla$/i })
      .click()
    await expect(page.getByTestId('appointment-form')).toHaveCount(0)

    await page.getByTestId(`appointment-open-edit-${aptId}`).click()
    await expect(page.getByTestId('appointment-form')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('appointment-form')).toHaveAttribute('data-state', 'idle', {
      timeout: 15_000,
    })
    const createdRange = {
      starts_at: localSlotToIso(day, primary.start),
      ends_at: localSlotToIso(day, primary.end),
    }
    const editPick = pickFreeSlotLabelsOnDay(day, blocksResp, 90, [createdRange])
    if (!editPick) {
      test.skip(true, 'Nessuno slot libero per modifica (escluso appuntamento creato).')
      return
    }
    const editSlot = editPick
    await expect(async () => {
      await setFormDateAndTimes(page, day, editSlot.start, editSlot.end)
      const st = await page.getByTestId('appointment-start-time-trigger').textContent()
      const et = await page.getByTestId('appointment-end-time-trigger').textContent()
      expect(st).toContain(editSlot.start)
      expect(et).toContain(editSlot.end)
    }).toPass({ timeout: 25_000 })
    await page.getByTestId('appointment-form-submit').click()
    await expect(page.getByTestId('appointment-form')).toBeHidden({ timeout: 25_000 })
    await expect(row).toContainText(editSlot.start, { timeout: 15_000 })
    await expect(row).toContainText(editSlot.end, { timeout: 15_000 })

    const block = blocksResp[0]
    if (block) {
      const slot = pickSlotInsideBlock(block)
      if (slot) {
        const ymdBlock = `${slot.start.getFullYear()}-${pad2(slot.start.getMonth() + 1)}-${pad2(slot.start.getDate())}`
        const startLabel = toQuarterHourTime(slot.start)
        const endLabel = toQuarterHourTime(addMinutes(slot.start, 45))

        await page.getByTestId('appointment-open-new').click()
        await expect(page.getByTestId('appointment-form')).toBeVisible({ timeout: 15_000 })
        const picked3 = await pickFirstAthleteInForm(page)
        if (picked3) {
          await setFormDateAndTimes(page, ymdBlock, startLabel, endLabel)
          await page.getByTestId('appointment-form-submit').click()
          await expectToastMatching(page, /blocco calendario|ferie|chiusura/i)
          await page
            .getByTestId('appointment-form')
            .getByRole('button', { name: /^Annulla$/i })
            .click()
          await expect(page.getByTestId('appointment-form')).toHaveCount(0)
        }
      }
    }
  })

  test('atleta: route staff non accessibili → redirect su /home', async ({ page, browserName }) => {
    test.skip(isAuthFlakyProject(browserName), 'Auth su WebKit/Mobile locale non affidabile')
    test.setTimeout(60_000)

    await loginWithCredentials(
      page,
      TEST_CREDENTIALS.athlete.email,
      TEST_CREDENTIALS.athlete.password,
    )
    await expect
      .poll(() => new URL(page.url()).pathname.replace(/\/$/, ''), { timeout: 45_000 })
      .toBe('/home')

    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/home/, { timeout: 15_000 })

    await page.goto('/dashboard/calendario', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/home/, { timeout: 15_000 })
  })
})
