import { test, expect } from '@playwright/test'

test.describe('Connection banner (offline/online)', () => {
  test('login page shows offline hint when browser goes offline', async ({ page, context }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await context.setOffline(true)
    await expect(page.getByText(/offline/i)).toBeVisible({ timeout: 10000 })
    await context.setOffline(false)
    await expect(page.getByText(/ripristinata|Connessione/i)).toBeVisible({ timeout: 10000 })
  })
})
