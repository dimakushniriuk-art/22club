import { test, expect } from '@playwright/test'

test.describe('Marketing staff: pipeline lead', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin-auth.json' })

  test('lista e pipeline senza errori console', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message)
    })

    await page.goto('/dashboard/marketing/leads', { waitUntil: 'load' })
    await expect(page).toHaveURL(/\/dashboard\/marketing\/leads/)
    await expect(page.getByRole('tab', { name: /Lista/i })).toBeVisible({ timeout: 25_000 })
    await expect(page.getByRole('heading', { level: 1, name: /Leads/i })).toBeVisible({
      timeout: 25_000,
    })

    await page.getByRole('tab', { name: /Pipeline/i }).click()
    await expect(page.getByRole('region', { name: /Pipeline lead per fase/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Pipeline/i })).toHaveAttribute(
      'data-state',
      'active',
    )

    await page.getByRole('tab', { name: /Lista/i }).click()
    await expect(page.getByRole('tab', { name: /Lista/i })).toHaveAttribute('data-state', 'active')

    expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([])
  })
})
