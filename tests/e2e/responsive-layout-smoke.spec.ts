import { test, expect } from '@playwright/test'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

/** Tolleranza px per scrollbar / subpixel. */
const OVERFLOW_TOLERANCE = 3

const VIEWPORTS = [
  { width: 390, height: 844, label: 'mobile-390' },
  { width: 768, height: 1024, label: 'tablet-768' },
  { width: 1024, height: 768, label: 'tablet-landscape-1024' },
  { width: 1280, height: 800, label: 'desktop-1280' },
] as const

async function documentHorizontalOverflowPx(
  page: import('@playwright/test').Page,
): Promise<number> {
  return page.evaluate(() => {
    const d = document.documentElement
    return d.scrollWidth - d.clientWidth
  })
}

test.describe('Responsive layout smoke (overflow)', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`viewport ${vp.label} (${vp.width}×${vp.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
      })

      test('login — no horizontal overflow', async ({ page }) => {
        await page.goto('/login', { waitUntil: 'domcontentloaded' })
        await expect(page.locator('body')).toBeVisible({ timeout: 15000 })
        const delta = await documentHorizontalOverflowPx(page)
        expect(delta, `document overflow ${delta}px`).toBeLessThanOrEqual(OVERFLOW_TOLERANCE)
      })

      test('forgot-password — no horizontal overflow', async ({ page }) => {
        await page.goto('/forgot-password', { waitUntil: 'domcontentloaded' })
        await expect(page.locator('body')).toBeVisible({ timeout: 15000 })
        const delta = await documentHorizontalOverflowPx(page)
        expect(delta, `document overflow ${delta}px`).toBeLessThanOrEqual(OVERFLOW_TOLERANCE)
      })
    })
  }
})

const trainerAuthPath = join(process.cwd(), 'tests/e2e/.auth/trainer-auth.json')

if (existsSync(trainerAuthPath)) {
  test.describe('Responsive layout smoke (dashboard, storageState)', () => {
    test.use({ storageState: trainerAuthPath })

    for (const vp of VIEWPORTS) {
      test.describe(`viewport ${vp.label}`, () => {
        test.beforeEach(async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height })
        })

        test('dashboard — no horizontal overflow', async ({ page }) => {
          await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
          await expect(page.locator('body')).toBeVisible({ timeout: 20000 })
          const delta = await documentHorizontalOverflowPx(page)
          expect(delta, `document overflow ${delta}px`).toBeLessThanOrEqual(OVERFLOW_TOLERANCE)
        })
      })
    }
  })
}
