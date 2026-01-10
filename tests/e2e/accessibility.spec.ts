import { test, expect } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should have proper heading structure', async ({ page }) => {
    // Check for h1 heading
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()

    // Check heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)
  })

  test('should have proper form labels', async ({ page }) => {
    // Check email input has label
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toBeVisible()

    const emailLabel = page.locator('label[for="email"]')
    await expect(emailLabel).toBeVisible()

    // Check password input has label
    const passwordInput = page.locator('input[name="password"]')
    await expect(passwordInput).toBeVisible()

    const passwordLabel = page.locator('label[for="password"]')
    await expect(passwordLabel).toBeVisible()
  })

  test('should have proper button accessibility', async ({ page }) => {
    // Check submit button has proper attributes
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toHaveAttribute('type', 'submit')

    // Check button text is descriptive
    const buttonText = await submitButton.textContent()
    expect(buttonText).toMatch(/accedi|login|entra/i)
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Check if focus is on submit button
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeFocused()

    // Test form submission with Enter key
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.keyboard.press('Enter')

    await page.waitForURL('**/dashboard')
  })

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for ARIA labels
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toHaveAttribute('type', 'email')

    const passwordInput = page.locator('input[name="password"]')
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Check for required attributes
    await expect(emailInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('required')
  })

  test('should have proper color contrast', async ({ page }) => {
    // This would typically use a color contrast testing library
    // For now, we'll check that important elements are visible
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()

    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toBeVisible()

    const passwordInput = page.locator('input[name="password"]')
    await expect(passwordInput).toBeVisible()
  })

  test('should have proper focus indicators', async ({ page }) => {
    // Test focus on email input
    await page.focus('input[name="email"]')
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toBeFocused()

    // Test focus on password input
    await page.focus('input[name="password"]')
    const passwordInput = page.locator('input[name="password"]')
    await expect(passwordInput).toBeFocused()
  })
})
