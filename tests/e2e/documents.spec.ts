import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('Documents Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login pulito come Admin (documenti è sezione staff)
    await page.goto('/login', { waitUntil: 'commit' })
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await loginAsAdmin(page)
    if (page.url().includes('/login')) {
      await page.reload()
      await loginAsAdmin(page)
    }
    await page.waitForURL('**/dashboard**', { timeout: 20000 })
  })

  test('should navigate to documents page', async ({ page }) => {
    await page.click('a[href="/dashboard/documenti"]').catch(async () => {
      await page.goto('/dashboard/documenti', { waitUntil: 'domcontentloaded' })
    })
    await page.waitForURL('**/documenti**', { timeout: 15000 })

    await expect(page.getByText(/Documenti/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Carica documento/i)).toBeVisible({ timeout: 10000 })
  })

  test('should upload a document', async ({ page }) => {
    await page.goto('/dashboard/documenti', { waitUntil: 'domcontentloaded' })
    await page.waitForURL('**/documenti**', { timeout: 15000 })

    // Click upload button
    const uploadBtn = page.getByRole('button', { name: /Carica documento/i })
    await uploadBtn.click()

    // Wait for upload modal
    await expect(page.getByText(/Seleziona file/i)).toBeVisible({ timeout: 8000 })

    // Upload file (mock)
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-document.pdf')

    // Fill document details
    await page.fill('input[name="name"]', 'Test Document')
    await page.fill('textarea[name="description"]', 'Test document description')

    // Submit upload
    await page.getByRole('button', { name: /Carica/i }).click()

    // Verify success message
    await expect(page.getByText(/Documento caricato con successo/i)).toBeVisible({
      timeout: 10000,
    })
  })

  test('should view document list', async ({ page }) => {
    await page.goto('/dashboard/documenti', { waitUntil: 'domcontentloaded' })
    await page.waitForURL('**/documenti**', { timeout: 15000 })

    // Verify document list elements
    await expect(page.getByText(/Nome/i)).toBeVisible()
    await expect(page.getByText(/Tipo/i)).toBeVisible()
    await expect(page.getByText(/Data caricamento/i)).toBeVisible()
    await expect(page.getByText(/Azioni/i)).toBeVisible()
  })

  test('should download a document', async ({ page }) => {
    await page.goto('/dashboard/documenti', { waitUntil: 'domcontentloaded' })
    await page.waitForURL('**/documenti**', { timeout: 15000 })

    // Click download button for first document
    const downloadButton = page.getByRole('button', { name: /Scarica/i }).first()
    await downloadButton.click()

    // Verify download started
    await expect(page.getByText(/Download iniziato/i)).toBeVisible({ timeout: 8000 })
  })
})
