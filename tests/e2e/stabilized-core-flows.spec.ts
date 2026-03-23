import { test, expect } from '@playwright/test'

const isUnsupportedProject = (name: string) => {
  const n = name.toLowerCase()
  return n.includes('webkit') || n.includes('safari') || n.includes('mobile')
}

test.describe('Stabilized Core - Auth e Guard', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('utente anonimo su route protetta viene reindirizzato al login', async ({
    browserName,
    page,
  }) => {
    test.skip(isUnsupportedProject(browserName), 'Skip WebKit/Mobile per affidabilita auth')
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login(\?|$)/, { timeout: 15000 })
    await expect(page).toHaveURL(/redirectedFrom=%2Fdashboard/, { timeout: 15000 })
  })
})

test.describe('Stabilized Core - Redirect ruolo atleta', () => {
  test.use({ storageState: 'tests/e2e/.auth/athlete-auth.json' })

  test('atleta resta su /home e non puo entrare in /dashboard/admin', async ({
    browserName,
    page,
  }) => {
    test.skip(isUnsupportedProject(browserName), 'Skip WebKit/Mobile per affidabilita auth')
    await page.goto('/home')
    await expect(page).toHaveURL(/\/home/, { timeout: 20000 })
    await page.goto('/dashboard/admin')
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 })
  })
})

test.describe('Stabilized Core - Redirect ruolo trainer', () => {
  test.use({ storageState: 'tests/e2e/.auth/pt-auth.json' })

  test('trainer su /home viene riportato in /dashboard', async ({ browserName, page }) => {
    test.skip(isUnsupportedProject(browserName), 'Skip WebKit/Mobile per affidabilita auth')
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 })
    await page.goto('/home')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
  })
})

test.describe('Stabilized Core - Redirect ruolo admin', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin-auth.json' })

  test('admin puo accedere ad area admin', async ({ browserName, page }) => {
    test.skip(isUnsupportedProject(browserName), 'Skip WebKit/Mobile per affidabilita auth')
    await page.goto('/dashboard/admin')
    await expect(page).toHaveURL(/\/dashboard\/admin/, { timeout: 15000 })
  })
})

test.describe('Stabilized Core - Trainer appointment lifecycle', () => {
  test.use({ storageState: 'tests/e2e/.auth/pt-auth.json' })

  test('trainer apre il flusso appuntamento', async ({ browserName, page }) => {
    test.setTimeout(60_000)
    test.skip(isUnsupportedProject(browserName), 'Skip WebKit/Mobile per affidabilita auth')
    await page.goto('/dashboard/appuntamenti', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Appuntamenti/i })).toBeVisible({
      timeout: 15000,
    })
    await page.waitForLoadState('networkidle')
    await page.getByTestId('appointment-open-new').click()
    await expect(page.getByTestId('appointment-form-overlay')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('appointment-form')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('appointment-form-submit')).toBeVisible()
    await page
      .getByTestId('appointment-form')
      .getByRole('button', { name: /^Annulla$/i })
      .click()
    await expect(page.getByTestId('appointment-form')).toHaveCount(0)
  })

  test('trainer crea-modifica-annulla con side effects coerenti', async ({ browserName, page }) => {
    test.setTimeout(90_000)
    test.skip(isUnsupportedProject(browserName), 'Skip WebKit/Mobile per affidabilita auth')
    await page.goto('/dashboard/appuntamenti', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Appuntamenti/i })).toBeVisible({
      timeout: 15000,
    })
    await page.waitForLoadState('networkidle')

    const collectRowTestIds = () =>
      page
        .locator('[data-testid^="appointment-row-"]')
        .evaluateAll((els) =>
          els.map((e) => e.getAttribute('data-testid')).filter((t): t is string => !!t),
        )
    const idsBefore = new Set(await collectRowTestIds())

    await page.getByTestId('appointment-open-new').click()
    await expect(page.getByTestId('appointment-form-overlay')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('appointment-form')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('appointment-form')).toHaveAttribute('data-state', 'idle', {
      timeout: 15_000,
    })

    await page.getByTestId('appointment-athlete-trigger').click()
    await expect(page.getByTestId('appointment-athlete-listbox')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('appointment-athlete-listbox')).toBeHidden()

    await page.getByTestId('appointment-start-time-trigger').click()
    await expect(page.getByTestId('appointment-start-time-listbox')).toBeVisible()
    await page.getByTestId('appointment-start-time-option-10:00').click()
    await expect(page.getByTestId('appointment-start-time-listbox')).toBeHidden()

    await page.getByTestId('appointment-end-time-trigger').click()
    await expect(page.getByTestId('appointment-end-time-listbox')).toBeVisible()
    await page.getByTestId('appointment-end-time-option-11:30').click()
    await expect(page.getByTestId('appointment-end-time-listbox')).toBeHidden()

    await page.getByTestId('appointment-athlete-trigger').click()
    await expect(page.getByTestId('appointment-athlete-listbox')).toBeVisible()
    const athleteOptionBtns = page
      .getByTestId('appointment-athlete-listbox')
      .locator('button[data-testid^="appointment-athlete-option-"]')
    const nOpts = await athleteOptionBtns.count()
    let athletePicked = false
    for (let i = 0; i < nOpts; i++) {
      const tid = await athleteOptionBtns.nth(i).getAttribute('data-testid')
      if (tid && tid !== 'appointment-athlete-option-empty') {
        await athleteOptionBtns.nth(i).click()
        athletePicked = true
        break
      }
    }
    if (!athletePicked) {
      await page.keyboard.press('Escape')
    }

    await expect(page.getByTestId('appointment-form-submit')).toBeVisible()
    await expect(page.getByTestId('appointment-form-submit')).toHaveAttribute(
      'data-state',
      'idle',
      {
        timeout: 15_000,
      },
    )
    test.skip(
      !athletePicked,
      'Nessun atleta associato al trainer nel DB: creazione non verificabile.',
    )

    await page.getByTestId('appointment-form-submit').click()
    await expect(page.getByTestId('appointment-form')).toBeHidden({ timeout: 20000 })

    let createdRowTestId: string | undefined
    await expect(async () => {
      const ids = await collectRowTestIds()
      const newIds = ids.filter((id) => !idsBefore.has(id))
      for (const tid of newIds) {
        const t = await page.getByTestId(tid).textContent()
        if (t?.includes('10:00') && t?.includes('11:30')) {
          createdRowTestId = tid
          break
        }
      }
      expect(createdRowTestId).toBeTruthy()
    }).toPass({ timeout: 25_000 })
    const aptId = createdRowTestId!.replace('appointment-row-', '')
    const row = page.getByTestId(`appointment-row-${aptId}`)
    await expect(row).toBeVisible()
    await expect(row).toContainText('10:00', { timeout: 10_000 })
    await expect(row).toContainText('11:30', { timeout: 10_000 })

    await page.getByTestId(`appointment-open-edit-${aptId}`).click()
    await expect(page.getByTestId('appointment-form-overlay')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('appointment-form')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('appointment-form')).toHaveAttribute('data-state', 'idle', {
      timeout: 15_000,
    })

    // Re-seleziona orari finché restano applicati (il form può risincronizzarsi al load delle impostazioni).
    await expect(async () => {
      await page.getByTestId('appointment-start-time-trigger').click()
      await expect(page.getByTestId('appointment-start-time-listbox')).toBeVisible()
      await page.getByTestId('appointment-start-time-option-14:00').click()
      await expect(page.getByTestId('appointment-start-time-listbox')).toBeHidden()
      await page.getByTestId('appointment-end-time-trigger').click()
      await expect(page.getByTestId('appointment-end-time-listbox')).toBeVisible()
      await page.getByTestId('appointment-end-time-option-15:30').click()
      await expect(page.getByTestId('appointment-end-time-listbox')).toBeHidden()
      const st = await page.getByTestId('appointment-start-time-trigger').textContent()
      const et = await page.getByTestId('appointment-end-time-trigger').textContent()
      expect(st).toContain('14:00')
      expect(et).toContain('15:30')
    }).toPass({ timeout: 25_000 })

    await expect(page.getByTestId('appointment-form-submit')).toHaveAttribute(
      'data-state',
      'idle',
      {
        timeout: 15_000,
      },
    )
    await page.getByTestId('appointment-form-submit').click()
    await expect(page.getByTestId('appointment-form')).toBeHidden({ timeout: 20000 })
    await expect(row).toContainText('14:00', { timeout: 15_000 })
    await expect(row).toContainText('15:30', { timeout: 15_000 })

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByTestId(`appointment-open-cancel-${aptId}`).click()
    await expect(page.getByTestId('appointment-confirm-dialog-confirm')).toBeVisible({
      timeout: 15000,
    })
    await page.getByTestId('appointment-confirm-dialog-confirm').click()
    await expect(row).toContainText('Annullata', { timeout: 25_000 })
  })
})
