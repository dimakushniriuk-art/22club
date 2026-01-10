import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Accedi')).toBeVisible()
  })

  test('should load dashboard after login', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('should load athlete home after login', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'atleta@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/home')
    await expect(page.getByText('Benvenuto')).toBeVisible()
  })

  test('should navigate to appointments page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await page.click('a[href="/dashboard/appuntamenti"]')
    await page.waitForURL('**/appuntamenti')
    await expect(page.getByText('Appuntamenti')).toBeVisible()
  })

  test('should navigate to documents page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await page.click('a[href="/dashboard/documenti"]')
    await page.waitForURL('**/documenti')
    await expect(page.getByText('Documenti')).toBeVisible()
  })

  test('should navigate to statistics page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await page.click('a[href="/dashboard/statistiche"]')
    await page.waitForURL('**/statistiche')
    await expect(page.getByText('Statistiche')).toBeVisible()
  })

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await page.click('a[href="/dashboard/profilo"]')
    await page.waitForURL('**/profilo')
    await expect(page.getByText('Profilo')).toBeVisible()
  })

  test('should handle logout', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Logout
    await page.click('button:has-text("Logout")')
    await page.waitForURL('**/login')
    await expect(page.getByText('Accedi')).toBeVisible()
  })

  test('should handle 404 page', async ({ page }) => {
    await page.goto('/non-existent-page')
    await expect(page.getByText('404')).toBeVisible()
  })

  test('should handle protected routes', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login')
    await expect(page.getByText('Accedi')).toBeVisible()
  })
})
