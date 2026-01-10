import { test, expect } from '@playwright/test'

test.describe('Documents Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as PT first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
  })

  test('should navigate to documents page', async ({ page }) => {
    await page.click('a[href="/dashboard/documenti"]')
    await page.waitForURL('**/documenti')

    await expect(page.getByText('Documenti')).toBeVisible()
    await expect(page.getByText('Carica documento')).toBeVisible()
  })

  test('should upload a document', async ({ page }) => {
    await page.goto('/dashboard/documenti')

    // Click upload button
    await page.click('button:has-text("Carica documento")')

    // Wait for upload modal
    await expect(page.getByText('Seleziona file')).toBeVisible()

    // Upload file (mock)
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-document.pdf')

    // Fill document details
    await page.fill('input[name="name"]', 'Test Document')
    await page.fill('textarea[name="description"]', 'Test document description')

    // Submit upload
    await page.click('button:has-text("Carica")')

    // Verify success message
    await expect(page.getByText('Documento caricato con successo')).toBeVisible()
  })

  test('should view document list', async ({ page }) => {
    await page.goto('/dashboard/documenti')

    // Verify document list elements
    await expect(page.getByText('Nome')).toBeVisible()
    await expect(page.getByText('Tipo')).toBeVisible()
    await expect(page.getByText('Data caricamento')).toBeVisible()
    await expect(page.getByText('Azioni')).toBeVisible()
  })

  test('should download a document', async ({ page }) => {
    await page.goto('/dashboard/documenti')

    // Click download button for first document
    const downloadButton = page.locator('button:has-text("Scarica")').first()
    await downloadButton.click()

    // Verify download started
    await expect(page.getByText('Download iniziato')).toBeVisible()
  })
})
