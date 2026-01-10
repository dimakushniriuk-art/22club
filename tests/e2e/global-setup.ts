import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(_config: FullConfig) {
  void _config
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Setup iniziale per i test E2E
    console.log('🚀 Setting up E2E test environment...')

    // Verifica che l'applicazione sia accessibile
    const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')

    console.log('✅ Application is accessible')
  } catch (error) {
    console.error('❌ Failed to setup E2E environment:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
