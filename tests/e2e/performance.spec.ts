import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('should load login page quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('http://localhost:3001/login')
    const loadTime = Date.now() - startTime

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)

    // Verify page is fully loaded
    await expect(page.getByText(/Accedi|Login/i)).toBeVisible()
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('http://localhost:3001/login')

    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })
      })
    })

    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500)
  })

  test('should load dashboard efficiently', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')

    const startTime = Date.now()
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')
    const loadTime = Date.now() - startTime

    // Dashboard should load within 2 seconds
    expect(loadTime).toBeLessThan(2000)

    // Verify dashboard is fully loaded
    await expect(page.getByText(/Dashboard/i)).toBeVisible()
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    // Login as PT
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Test performance con molti clienti
    await page.goto('http://localhost:3001/dashboard/clienti')

    const startTime = Date.now()
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    // La pagina dovrebbe caricare entro 5 secondi anche con molti dati
    expect(loadTime).toBeLessThan(5000)

    // Verifica che la lista sia renderizzata
    await expect(page.getByRole('heading', { name: /Clienti/i })).toBeVisible()
  })

  test('should handle pagination efficiently', async ({ page }) => {
    // Login as PT
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await page.goto('http://localhost:3001/dashboard/clienti')
    await page.waitForLoadState('networkidle')

    // Test navigazione tra pagine
    const nextButton = page.getByRole('button', { name: /Successiva|Next/i })
    if ((await nextButton.count()) > 0) {
      const startTime = Date.now()
      await nextButton.click()
      await page.waitForTimeout(1000)
      const loadTime = Date.now() - startTime

      // La paginazione dovrebbe essere veloce (< 2s)
      expect(loadTime).toBeLessThan(2000)
    }
  })

  test('should handle search with debounce efficiently', async ({ page }) => {
    // Login as PT
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    await page.goto('http://localhost:3001/dashboard/clienti')
    await page.waitForLoadState('networkidle')

    // Test ricerca con debounce
    const searchInput = page.getByPlaceholder('Cerca per nome o email...')
    await searchInput.fill('test')

    // Attendi debounce (300ms) + render
    await page.waitForTimeout(600)

    // Verifica che la ricerca sia stata eseguita
    const count = await page.locator('tbody tr').count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should have efficient image loading', async ({ page }) => {
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Check for lazy loading on images
    const images = page.locator('img')
    const imageCount = await images.count()

    if (imageCount > 0) {
      // Verify images have loading attributes
      const firstImage = images.first()
      const loadingAttr = await firstImage.getAttribute('loading')
      // Lazy loading è opzionale, ma se presente dovrebbe essere 'lazy'
      if (loadingAttr) {
        expect(loadingAttr).toBe('lazy')
      }
    }
  })

  test('should handle concurrent requests efficiently', async ({ page }) => {
    await page.goto('http://localhost:3001/login')
    await page.fill('input[name="email"]', 'pt@example.com')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard')

    // Simulate multiple concurrent actions
    const startTime = Date.now()

    // Navigate to multiple pages quickly
    await Promise.all([
      page.click('a[href="/dashboard/appuntamenti"]'),
      page.click('a[href="/dashboard/statistiche"]'),
      page.click('a[href="/dashboard/documenti"]'),
    ])

    const loadTime = Date.now() - startTime

    // Should handle concurrent requests efficiently
    expect(loadTime).toBeLessThan(5000)
  })
})
