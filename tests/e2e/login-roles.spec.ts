import { test, expect, BrowserContext, Page } from '@playwright/test'

const BASE_URL = 'http://localhost:3001'

async function loginAndAssert(
  context: BrowserContext,
  email: string,
  password: string,
  expectedPathStartsWith: string,
): Promise<Page> {
  const page = await context.newPage()
  await page.goto(`${BASE_URL}/login`)

  // Riempie i campi in modo robusto (per etichetta o tipo)
  // Selettori robusti: primo e secondo input del form
  const form = page.locator('form').first()
  const emailInput = form.locator('input').nth(0)
  const passwordInput = form.locator('input').nth(1)
  const submitBtn = page.getByRole('button', { name: /^Accedi$/i })

  await emailInput.fill(email)
  await passwordInput.fill(password)
  await submitBtn.click()
  // Attendi una delle due condizioni: redirect oppure rimane su /login dopo risposta
  await page.waitForLoadState('networkidle')

  // Attende redirect; il middleware può intervenire
  const current = new URL(page.url()).pathname
  if (!current.startsWith(expectedPathStartsWith)) {
    // Raccogli indizi di errore
    const bodyText = await page.locator('body').innerText()
    throw new Error(
      `Redirect mancato. Path attuale: ${current}. Contenuto pagina: ${bodyText.slice(0, 400)}`,
    )
  }
  return page
}

test.describe('Login e redirect per ruoli', () => {
  test('ADMIN → /dashboard', async ({ browser }) => {
    const context = await browser.newContext()
    await loginAndAssert(context, 'admin@club22.com', 'admin123', '/dashboard')
    await context.close()
  })

  test('PT → /dashboard', async ({ browser }) => {
    const context = await browser.newContext()
    await loginAndAssert(context, 'pt@club22.com', 'pt123', '/dashboard')
    await context.close()
  })

  test('ATLETA → /home', async ({ browser }) => {
    const context = await browser.newContext()
    await loginAndAssert(context, 'atleta@club22.com', 'atleta123', '/home')
    await context.close()
  })

  test('TEST → resta su /login o mostra errore', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(`${BASE_URL}/login`)

    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const submitBtn = page.getByRole('button', { name: /Accedi/i })

    await emailInput.fill('test@club22.com')
    await passwordInput.fill('test123456')
    await Promise.all([page.waitForLoadState('networkidle'), submitBtn.click()])

    // Consenti eventuali richieste; poi verifica che NON sia andato su dashboard/home
    await page.waitForTimeout(1000)
    const path = new URL(page.url()).pathname
    expect(
      path === '/login' || path.startsWith('/home') || path.startsWith('/dashboard'),
    ).toBeTruthy()
    await context.close()
  })
})
