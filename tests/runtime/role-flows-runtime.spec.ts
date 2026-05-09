/**
 * Runtime validation — flussi principali per ruolo (trainer/staff, admin, atleta).
 *
 * Path effettivo post-login atleta: `/post-login` → `/home` (vedi `loginAsAthlete` in `e2e/helpers/auth.ts`).
 * Admin: redirect a `/dashboard/admin` (allineato a `core-flows.spec.ts`).
 *
 * Screenshot: Chromium only (`role-flows-*-chromium-win32.png` in `*-snapshots/`).
 * Home atleta: niente screenshot — saluto/inviti variabili; inoltre `TabBar` non è montata nel layout `/home` attuale.
 */
import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { loginAsAthlete, loginAsAdmin, loginAsPT } from '../e2e/helpers/auth'

const LOGIN_TIMEOUT = 45_000

const isSafariProject = (name: string) =>
  name?.toLowerCase().includes('webkit') || name?.toLowerCase().includes('safari')

function isBenignBrowserConsoleNoise(text: string): boolean {
  return text.includes('__cf_bm') && text.includes('invalid domain')
}

function attachRuntimeGuards(page: Page) {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!isBenignBrowserConsoleNoise(text)) {
        consoleErrors.push(text)
      }
    }
  })

  const http500plus: { url: string; status: number }[] = []
  page.on('response', (res) => {
    const status = res.status()
    if (status >= 500) {
      http500plus.push({ url: res.url(), status })
    }
  })

  return {
    assertClean: () => {
      expect(
        consoleErrors,
        consoleErrors.length ? `console.error:\n${consoleErrors.join('\n')}` : '',
      ).toEqual([])
      expect(
        http500plus,
        http500plus.length ? `HTTP >= 500:\n${JSON.stringify(http500plus, null, 2)}` : '',
      ).toEqual([])
    },
  }
}

async function newCleanPage(browser: Browser): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({
    storageState: { cookies: [], origins: [] },
  })
  await context.addInitScript(() => {
    localStorage.clear()
    sessionStorage.clear()
    localStorage.setItem('cookie-consent', 'true')
  })
  const page = await context.newPage()
  return { context, page }
}

function pathnameNoTrailingSlash(url: string): string {
  return new URL(url).pathname.replace(/\/$/, '') || '/'
}

async function ensureTrainerOnDashboardRoot(page: Page) {
  await expect
    .poll(() => pathnameNoTrailingSlash(page.url()), { timeout: 35_000, intervals: [500] })
    .toMatch(/\/dashboard|\/post-login/)
  const p = pathnameNoTrailingSlash(page.url())
  if (p === '/post-login' || !p.endsWith('/dashboard') || p.startsWith('/dashboard/admin')) {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
  }
  await expect
    .poll(() => pathnameNoTrailingSlash(page.url()), { timeout: 20_000, intervals: [200] })
    .toBe('/dashboard')
}

async function ensureAdminOnAdminDashboard(page: Page) {
  await expect
    .poll(() => pathnameNoTrailingSlash(page.url()), { timeout: 35_000, intervals: [500] })
    .toMatch(/\/dashboard|\/post-login/)
  const p = pathnameNoTrailingSlash(page.url())
  if (!p.startsWith('/dashboard/admin')) {
    await page.goto('/dashboard/admin', { waitUntil: 'domcontentloaded' })
  }
  await expect(page).toHaveURL(/\/dashboard\/admin/, { timeout: 20_000 })
}

async function ensureAthleteOnHome(page: Page) {
  await expect(page).toHaveURL(/\/post-login|\/home/, { timeout: 15_000 })
  const p = pathnameNoTrailingSlash(page.url())
  if (p === '/post-login' || !p.startsWith('/home')) {
    await page.goto('/home', { waitUntil: 'domcontentloaded' })
  }
  await expect(page).toHaveURL(/\/home/, { timeout: 20_000 })
}

test.describe('Role flows runtime', () => {
  test('trainer can reach dashboard runtime shell', async ({ browser, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanPage(browser)
    const guards = attachRuntimeGuards(page)

    try {
      await loginAsPT(page)
      await ensureTrainerOnDashboardRoot(page)

      await page.waitForSelector('[aria-label="Area principale dashboard"]', {
        state: 'visible',
      })
      const mainArea = page.locator('[aria-label="Area principale dashboard"]').first()
      await expect(mainArea).toBeVisible()
      await expect(mainArea.getByRole('heading', { level: 2 }).first()).toBeVisible({
        timeout: 25_000,
      })

      const desktopDashboardLink = page.locator('aside').getByRole('link', { name: /^Dashboard$/ })
      const mobileMenu = page.getByRole('button', { name: 'Apri menu' })
      await expect(desktopDashboardLink.or(mobileMenu).first()).toBeVisible({ timeout: 25_000 })

      if (browserName === 'chromium') {
        await expect(mainArea).not.toHaveAttribute('aria-busy', 'true', { timeout: 25_000 })
        const panelHeading = mainArea.getByRole('heading', { level: 2 }).filter({ hasText: /\S/ })
        const emptyLayout = mainArea.getByText('Nessun blocco pannello visibile', { exact: false })
        await expect(panelHeading.or(emptyLayout).first()).toBeVisible({ timeout: 25_000 })
        await expect(mainArea).toHaveScreenshot('role-flows-trainer-dashboard-main.png', {
          timeout: 15_000,
          animations: 'disabled',
        })
      }

      guards.assertClean()
    } finally {
      await context.close()
    }
  })

  test('admin can reach admin dashboard runtime shell', async ({ browser, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanPage(browser)
    const guards = attachRuntimeGuards(page)

    try {
      await loginAsAdmin(page)
      await ensureAdminOnAdminDashboard(page)

      const adminHeading = page.getByRole('heading', { name: /Dashboard Amministratore/i })
      await expect(adminHeading).toBeVisible({ timeout: 30_000 })
      await expect(
        page.getByText('Gestione completa del sistema 22Club', { exact: false }),
      ).toBeVisible()

      if (browserName === 'chromium') {
        await expect(adminHeading).toHaveScreenshot('role-flows-admin-dashboard-title.png', {
          timeout: 15_000,
          animations: 'disabled',
        })
      }

      guards.assertClean()
    } finally {
      await context.close()
    }
  })

  test('athlete can reach home runtime shell', async ({ browser, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanPage(browser)
    const guards = attachRuntimeGuards(page)

    try {
      await loginAsAthlete(page)
      await ensureAthleteOnHome(page)

      await expect(page.locator('main').first()).toBeVisible({ timeout: 25_000 })
      // `TabBar` esiste nel codice ma non è incluso nel layout `/home` attuale — non assertare quella nav.
      await expect(
        page.getByText('Gestisci i tuoi allenamenti, progressi e molto altro', { exact: false }),
      ).toBeVisible({ timeout: 25_000 })
      await expect(page.getByRole('link', { name: /Vai a SCHEDE/i })).toBeVisible({
        timeout: 25_000,
      })

      // Screenshot home atleta: differito — testo "Ciao" dipende dal profilo / inviti.

      guards.assertClean()
    } finally {
      await context.close()
    }
  })
})
