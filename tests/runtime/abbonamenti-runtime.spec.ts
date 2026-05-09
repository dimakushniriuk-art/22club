import { test, expect, type Browser, type BrowserContext, type Page } from '@playwright/test'
import { loginAsPT } from '../e2e/helpers/auth'

const LOGIN_TIMEOUT = 90_000

const isSafariProject = (name: string) =>
  name?.toLowerCase().includes('webkit') || name?.toLowerCase().includes('safari')

function isBenignBrowserConsoleNoise(text: string): boolean {
  if (text.includes('TypeError: Failed to fetch')) return true
  if (text.includes('Failed to load resource: net::ERR_FAILED')) return true
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

function mainLocator(page: Page) {
  return page.locator('main').first()
}

async function goToAbbonamenti(page: Page) {
  await page.goto('/dashboard/abbonamenti', { waitUntil: 'domcontentloaded' })
  await page
    .locator('[aria-label="Area principale dashboard"]')
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 })
    .catch(() => {})
  await expect(mainLocator(page)).toBeVisible({ timeout: 40_000 })
  await expect(page).toHaveURL(/\/dashboard\/abbonamenti/i, { timeout: 40_000 })
  await expect(page.getByRole('heading', { level: 1, name: /Abbonamenti/i })).toBeVisible({
    timeout: 40_000,
  })
}

test.describe.serial('Abbonamenti runtime', () => {
  test('page loads cleanly', async ({ browser, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanPage(browser)
    const guards = attachRuntimeGuards(page)

    try {
      await loginAsPT(page)
      await goToAbbonamenti(page)
      guards.assertClean()
    } finally {
      await context.close()
    }
  })

  test('loading resolves to stable UI', async ({ browser, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanPage(browser)
    const guards = attachRuntimeGuards(page)

    try {
      await loginAsPT(page)
      await goToAbbonamenti(page)
      const main = mainLocator(page)

      await expect(main).not.toHaveAttribute('aria-busy', 'true', { timeout: 60_000 })
      await expect(page.getByRole('heading', { level: 1, name: /Abbonamenti/i })).toBeVisible()

      if (browserName === 'chromium') {
        await expect(page).toHaveScreenshot('abbonamenti-main.png', {
          timeout: 15_000,
          animations: 'disabled',
        })
      }

      guards.assertClean()
    } finally {
      await context.close()
    }
  })

  test('main interactions work', async ({ browser, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanPage(browser)
    const guards = attachRuntimeGuards(page)

    try {
      await loginAsPT(page)
      await goToAbbonamenti(page)

      const searchInput = page.locator('input[placeholder*="nome atleta" i]')
      if ((await searchInput.count()) > 0) {
        await expect(searchInput).toBeVisible({ timeout: 60_000 })
        await searchInput.fill('zzzz__unlikely__athlete__name')
      }

      const serviceTab = page
        .getByRole('button', { name: /Allenamenti|Nutrizione|Massaggi/i })
        .first()
      if ((await serviceTab.count()) > 0) {
        await expect(serviceTab).toBeVisible({ timeout: 20_000 })
        await serviceTab.click()
        await expect(page).toHaveURL(/service=/i, { timeout: 20_000 })
      }

      const firstAthleteLink = page
        .locator('tbody tr td:first-child button, button:has-text("Vai al dettaglio")')
        .first()
      const hasRows = (await firstAthleteLink.count()) > 0
      if (hasRows) {
        await firstAthleteLink.click()
        await expect(page).toHaveURL(/\/dashboard\/pagamenti\/atleta\//i, {
          timeout: 20_000,
        })
        await page.goBack({ waitUntil: 'domcontentloaded' })
        await expect(page).toHaveURL(/\/dashboard\/abbonamenti/i, { timeout: 20_000 })
      }

      const openPaymentModalBtn = page.getByRole('button', { name: /Nuovo Pagamento/i })
      if ((await openPaymentModalBtn.count()) > 0) {
        await openPaymentModalBtn.click()
        await expect(
          page.getByRole('dialog').getByRole('heading', { name: /Nuovo Pagamento/i }),
        ).toBeVisible({
          timeout: 20_000,
        })
      }

      guards.assertClean()
    } finally {
      await context.close()
    }
  })

  test('error safety keeps UI alive', async ({ browser, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanPage(browser)
    const guards = attachRuntimeGuards(page)

    try {
      await loginAsPT(page)
      await page.route('**/rest/v1/payments**', async (route) => {
        await route.abort('failed')
      })

      await goToAbbonamenti(page)
      await expect(mainLocator(page)).toBeVisible({ timeout: 25_000 })

      const errorCard = page.getByRole('button', { name: /Riprova/i })
      const emptyState = page.getByRole('heading', { level: 3, name: /Nessun abbonamento/i })
      await expect(
        errorCard
          .or(emptyState)
          .or(page.getByRole('heading', { level: 1, name: /Abbonamenti/i }))
          .first(),
      ).toBeVisible({ timeout: 60_000 })

      guards.assertClean()
    } finally {
      await context.close()
    }
  })
})
