import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login form', async ({ page }) => {
    await expect(page.getByText('Accedi')).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Accedi' })).toBeVisible()
  })

  test('should login as personal trainer', async ({ page }) => {
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/dashboard')
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('should login as athlete', async ({ page }) => {
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/home')
    await expect(page.getByText('Benvenuto')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Wait for error message
    await expect(page.getByText('Credenziali non valide')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.click('button[type="submit"]')

    // Check for validation messages
    await expect(page.getByText('Email è richiesta')).toBeVisible()
    await expect(page.getByText('Password è richiesta')).toBeVisible()
  })
})
