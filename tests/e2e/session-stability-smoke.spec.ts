import { test, expect, type Browser } from '@playwright/test'
import { TEST_CREDENTIALS, dismissCookieBanner } from './helpers/auth'

const LOGIN_TIMEOUT = 45_000

const isSafariProject = (name: string) =>
  name?.toLowerCase().includes('webkit') || name?.toLowerCase().includes('safari')

async function newCleanContext(browser: Browser) {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })
  await context.addInitScript(() => {
    localStorage.clear()
    sessionStorage.clear()
    localStorage.setItem('cookie-consent', 'true')
  })
  const page = await context.newPage()
  return { context, page }
}

async function loginTrainer(page: import('@playwright/test').Page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await dismissCookieBanner(page)
  await page.fill('input[name="email"]', TEST_CREDENTIALS.trainer.email)
  await page.fill('input[name="password"]', TEST_CREDENTIALS.trainer.password)
  await Promise.all([
    page.waitForURL(/\/(dashboard|post-login|home)/, { timeout: 40_000 }).catch(() => {}),
    page.click('button[type="submit"]', { force: true }),
  ])
}

test.describe('Session stability smoke (trainer + atleta)', () => {
  test('trainer raggiunge /dashboard/clienti senza errori pagina', async ({
    browser,
    browserName,
  }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanContext(browser)
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))

    try {
      await loginTrainer(page)
      await page.goto('/dashboard/clienti', { waitUntil: 'domcontentloaded', timeout: 30_000 })
      await expect(page).toHaveURL(/\/dashboard\/clienti/)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 25_000 })
      expect(errors, errors.join('\n')).toEqual([])
    } finally {
      await context.close()
    }
  })

  test('atleta raggiunge /home/allenamenti', async ({ browser, browserName }) => {
    test.skip(isSafariProject(browserName), 'Safari/WebKit su HTTP non affidabile per login')
    test.setTimeout(LOGIN_TIMEOUT)

    const { context, page } = await newCleanContext(browser)
    try {
      await page.goto('/login', { waitUntil: 'domcontentloaded' })
      await dismissCookieBanner(page)
      await page.fill('input[name="email"]', TEST_CREDENTIALS.athlete.email)
      await page.fill('input[name="password"]', TEST_CREDENTIALS.athlete.password)
      await Promise.all([
        page.waitForURL(/\/(home|post-login|dashboard)/, { timeout: 40_000 }).catch(() => {}),
        page.click('button[type="submit"]', { force: true }),
      ])
      await page.goto('/home/allenamenti', { waitUntil: 'domcontentloaded', timeout: 30_000 })
      await expect(page).toHaveURL(/\/home\/allenamenti/)
      await expect(page.locator('body')).toBeVisible()
    } finally {
      await context.close()
    }
  })
})

test.describe('Session stability smoke (admin marketing)', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin-auth.json' })

  test('segmenti marketing caricano shell', async ({ page }) => {
    await page.goto('/dashboard/marketing/segments', {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    })
    await expect(page).toHaveURL(/\/dashboard\/marketing\/segments/)
    await expect(page.locator('main, [role="main"]').first()).toBeVisible({ timeout: 25_000 })
  })
})

test.describe('Session stability smoke (embed)', () => {
  test('embed allenamenti risponde senza HTTP 5xx', async ({ page }) => {
    const res = await page.goto('/embed/athlete-allenamenti/00000000-0000-0000-0000-000000000000', {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    })
    expect(res?.status() ?? 0).toBeLessThan(500)
  })
})
