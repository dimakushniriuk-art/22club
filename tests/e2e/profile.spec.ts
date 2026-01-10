import { test, expect } from '@playwright/test'

test.describe('Profile Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as PT first
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
  })

  test('should navigate to profile page', async ({ page }) => {
    await page.click('a[href="/dashboard/profilo"]')
    await page.waitForURL('**/profilo')

    await expect(page.getByText('Profilo')).toBeVisible()
    await expect(page.getByText('Informazioni personali')).toBeVisible()
  })

  test('should update personal information', async ({ page }) => {
    await page.goto('/dashboard/profilo')

    // Update name
    await page.fill('input[name="name"]', 'Mario Rossi')

    // Update phone
    await page.fill('input[name="phone"]', '+39 123 456 7890')

    // Update bio
    await page.fill('textarea[name="bio"]', 'Personal trainer esperto')

    // Save changes
    await page.click('button:has-text("Salva")')

    // Verify success message
    await expect(page.getByText('Profilo aggiornato')).toBeVisible()
  })

  test('should change password', async ({ page }) => {
    await page.goto('/dashboard/profilo')

    // Click change password button
    await page.click('button:has-text("Cambia password")')

    // Wait for password modal
    await expect(page.getByText('Cambia password')).toBeVisible()

    // Fill password fields
    await page.fill('input[name="currentPassword"]', '123456')
    await page.fill('input[name="newPassword"]', 'newpassword123')
    await page.fill('input[name="confirmPassword"]', 'newpassword123')

    // Submit password change
    await page.click('button:has-text("Cambia")')

    // Verify success message
    await expect(page.getByText('Password cambiata con successo')).toBeVisible()
  })

  test('should upload profile picture', async ({ page }) => {
    await page.goto('/dashboard/profilo')

    // Click upload picture button
    await page.click('button:has-text("Carica foto")')

    // Wait for upload modal
    await expect(page.getByText('Seleziona immagine')).toBeVisible()

    // Upload image (mock)
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/profile-picture.jpg')

    // Submit upload
    await page.click('button:has-text("Carica")')

    // Verify success message
    await expect(page.getByText('Foto aggiornata')).toBeVisible()
  })

  test('should view account settings', async ({ page }) => {
    await page.goto('/dashboard/profilo')

    // Click settings tab
    await page.click('button:has-text("Impostazioni")')

    // Verify settings elements
    await expect(page.getByText('Notifiche')).toBeVisible()
    await expect(page.getByText('Privacy')).toBeVisible()
    await expect(page.getByText('Sicurezza')).toBeVisible()
  })
})
