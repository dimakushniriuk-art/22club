import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { TEST_CREDENTIALS, dismissCookieBanner } from '../e2e/helpers/auth'

const TRAINER_EMAIL = TEST_CREDENTIALS.pt.email
const TRAINER_PASSWORD = TEST_CREDENTIALS.pt.password
const LOGIN_TIMEOUT = 45000

const isSafariProject = (name: string) =>
  name?.toLowerCase().includes('webkit') || name?.toLowerCase().includes('safari')

/** Rumore noto browser (es. Firefox + CF cookie su WS Supabase da localhost), non regressione app. */
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

async function loginAndReach(page: Page, target: string) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie-consent', 'true')
  })

  await dismissCookieBanner(page)

  await page.fill('input[name="email"]', TRAINER_EMAIL)
  await page.fill('input[name="password"]', TRAINER_PASSWORD)

  await dismissCookieBanner(page)

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 40000 }).catch(() => {}),
    page.click('button[type="submit"]', { force: true }),
  ])
  const reached = await expect
    .poll(async () => page.url(), { timeout: 35000, intervals: [500] })
    .toContain(target)
    .then(
      () => true,
      () => false,
    )
  if (!reached && (page.url().includes('/login') || page.url().includes('/post-login'))) {
    await page.goto(target)
    await expect(page).toHaveURL(new RegExp(target.replace('/', '\\/')), { timeout: 20000 })
  }
}

test.describe('Dashboard Runtime', () => {
  test('dashboard loads without errors', async ({ browser, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login PT')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanPage(browser)
    const guards = attachRuntimeGuards(page)

    try {
      await page.goto('/login')
      await loginAndReach(page, '/dashboard')

      await page.waitForSelector('[aria-label="Area principale dashboard"]', {
        state: 'visible',
      })

      const mainArea = page.locator('[aria-label="Area principale dashboard"]').first()
      await expect(mainArea).toBeVisible()

      const firstPanelHeading = mainArea.locator('h2').first()
      await expect(firstPanelHeading).toBeVisible()

      guards.assertClean()
    } finally {
      await context.close()
    }
  })

  test('dashboard visual state is stable after hydration', async ({ browser, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login PT')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanPage(browser)
    const guards = attachRuntimeGuards(page)

    try {
      await page.goto('/login')
      await loginAndReach(page, '/dashboard')

      await page.waitForSelector('[aria-label="Area principale dashboard"]', {
        state: 'visible',
      })

      const mainArea = page.locator('[aria-label="Area principale dashboard"]').first()
      await expect(mainArea).toBeVisible()

      await expect(mainArea).not.toHaveAttribute('aria-busy', 'true', { timeout: 25000 })

      const panelHeading = mainArea.getByRole('heading', { level: 2 }).filter({ hasText: /\S/ })
      const emptyLayout = mainArea.getByText('Nessun blocco pannello visibile', { exact: false })
      await expect(panelHeading.or(emptyLayout).first()).toBeVisible({ timeout: 25000 })

      // Baseline visivo solo su Chromium: Firefox può differire leggermente tra run (~1% pixel) su stesso stato.
      if (browserName === 'chromium') {
        await expect(mainArea).toHaveScreenshot('dashboard-main-area.png', {
          timeout: 15_000,
          animations: 'disabled',
        })
      }

      guards.assertClean()
    } finally {
      await context.close()
    }
  })

  test('dashboard settings dialog opens and closes cleanly', async ({ browser, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login PT')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanPage(browser)
    const guards = attachRuntimeGuards(page)

    try {
      await page.goto('/login')
      await loginAndReach(page, '/dashboard')

      await page.waitForSelector('[aria-label="Area principale dashboard"]', {
        state: 'visible',
      })

      const customizeBtn = page.getByRole('button', { name: 'Personalizza dashboard' })
      await expect(customizeBtn).toBeVisible({ timeout: 25000 })

      await customizeBtn.click()

      const dialog = page.getByRole('dialog').filter({
        has: page.getByRole('heading', { name: 'Personalizza dashboard' }),
      })
      await expect(dialog).toBeVisible()
      await expect(
        dialog.getByText('Salvato su questo dispositivo', { exact: false }),
      ).toBeVisible()
      await expect(dialog.getByRole('button', { name: 'Chiudi dialog' })).toBeFocused()

      if (browserName === 'chromium') {
        await expect(dialog).toHaveScreenshot('dashboard-settings-dialog.png', {
          timeout: 15_000,
          animations: 'disabled',
        })
      }

      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden({ timeout: 10_000 })

      guards.assertClean()
    } finally {
      await context.close()
    }
  })

  /**
   * Drawer staff mobile (`DashboardMobileNav`): role=dialog, Escape chiude (vedi `drawer.tsx`).
   */
  test('dashboard mobile nav drawer opens and closes with Escape', async ({
    browser,
    browserName,
  }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login PT')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanPage(browser)
    await page.setViewportSize({ width: 390, height: 844 })
    const guards = attachRuntimeGuards(page)

    try {
      await page.goto('/login')
      await loginAndReach(page, '/dashboard')

      await page.waitForSelector('[aria-label="Area principale dashboard"]', {
        state: 'visible',
      })

      await page.getByRole('button', { name: 'Apri menu' }).click()

      const drawer = page.getByRole('dialog')
      await expect(drawer).toBeVisible()
      await expect(drawer.getByRole('navigation')).toBeVisible()
      await expect(drawer.getByRole('link', { name: 'Dashboard' })).toBeVisible()

      await page.keyboard.press('Escape')
      await expect(drawer).toBeHidden({ timeout: 10_000 })

      guards.assertClean()
    } finally {
      await context.close()
    }
  })
})
