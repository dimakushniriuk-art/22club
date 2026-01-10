import { test, expect } from '@playwright/test'

test.describe('Athlete Home Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')
  })

  test('should login as athlete and view home dashboard', async ({ page }) => {
    // Fill login form as athlete
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for redirect to home
    await page.waitForURL('**/home')

    // Verify home elements
    await expect(page.getByText('Benvenuto')).toBeVisible()
    await expect(page.getByText('I tuoi allenamenti')).toBeVisible()
    await expect(page.getByText('Prossimi appuntamenti')).toBeVisible()
  })

  test('should navigate to profile page', async ({ page }) => {
    // Login as athlete
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    // Navigate to profile
    await page.click('a[href="/home/profilo"]')
    await page.waitForURL('**/profilo')

    // Verify profile page
    await expect(page.getByText('Profilo')).toBeVisible()
    await expect(page.getByText('Informazioni personali')).toBeVisible()
  })

  test('should display workout schedule', async ({ page }) => {
    // Login as athlete
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')

    // Verify workout schedule elements
    await expect(page.getByText('Calendario allenamenti')).toBeVisible()
    await expect(page.getByText('Prossimi appuntamenti')).toBeVisible()
  })
})
