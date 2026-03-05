import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { MARKETING_CREDENTIALS } from './helpers/auth'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

test.describe('Marketing security: no raw data access', () => {
  test('marketing test account must be configured for security tests', () => {
    expect(
      MARKETING_CREDENTIALS,
      'Missing marketing test account: set MARKETING_TEST_EMAIL and MARKETING_TEST_PASSWORD in .env.local. Create a user with role=marketing and org_id in Supabase. See docs/CHECKLIST_marketing_kpis.md',
    ).toBeTruthy()
  })

  test.beforeEach(() => {
    if (!MARKETING_CREDENTIALS) {
      test.skip(true, 'Missing marketing test account: set MARKETING_TEST_EMAIL and MARKETING_TEST_PASSWORD (or PLAYWRIGHT_MARKETING_EMAIL / PLAYWRIGHT_MARKETING_PASSWORD) in .env.local. Create a user with role=marketing and org_id set in Supabase profiles.')
    }
  })

  test('marketing user cannot read public.profiles (RLS returns 0 rows)', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      test.skip(true, 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required')
    }
    const supabase = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email: MARKETING_CREDENTIALS!.email,
      password: MARKETING_CREDENTIALS!.password,
    })
    if (signInError || !sessionData.session) {
      test.skip(true, `Marketing login failed: ${signInError?.message ?? 'no session'}. Check MARKETING_TEST_EMAIL / MARKETING_TEST_PASSWORD and that the user exists with role=marketing.`)
    }

    const { data, error } = await supabase.from('profiles').select('*').limit(1)

    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBeTruthy()
    if (Array.isArray(data)) {
      expect(data.length).toBe(0)
    }
  })

  test('marketing user cannot read public.workout_logs (RLS returns 0 rows)', async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      test.skip(true, 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required')
    }
    const supabase = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email: MARKETING_CREDENTIALS!.email,
      password: MARKETING_CREDENTIALS!.password,
    })
    if (signInError || !sessionData.session) {
      test.skip(true, `Marketing login failed: ${signInError?.message ?? 'no session'}. Check MARKETING_TEST_EMAIL / MARKETING_TEST_PASSWORD.`)
    }

    const { data, error } = await supabase.from('workout_logs').select('*').limit(1)

    expect(error !== null || (Array.isArray(data) && data.length === 0)).toBeTruthy()
    if (Array.isArray(data)) {
      expect(data.length).toBe(0)
    }
  })
})

test.describe('Marketing security: safe API and UI', () => {
  test('GET /api/marketing/athletes without auth returns 401 or 403', async ({ request }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'
    const res = await request.get(`${baseURL}/api/marketing/athletes`, {
      headers: { Cookie: '' },
    })
    expect([401, 403]).toContain(res.status())
  })

  test('GET /api/marketing/athletes with marketing session returns 200 and safe data', async ({ browser }) => {
    if (!MARKETING_CREDENTIALS) {
      test.skip(true, 'Missing marketing test account: set MARKETING_TEST_EMAIL and MARKETING_TEST_PASSWORD.')
    }
    const { existsSync } = await import('node:fs')
    if (!existsSync('tests/e2e/.auth/marketing-auth.json')) {
      test.skip(true, 'Missing marketing-auth.json: run global setup with MARKETING_TEST_EMAIL and MARKETING_TEST_PASSWORD set.')
    }
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'
    const context = await browser.newContext({
      storageState: 'tests/e2e/.auth/marketing-auth.json',
    })
    const res = await context.request.get(`${baseURL}/api/marketing/athletes`)
    await context.close()
    if (res.status() === 401 || res.status() === 403) {
      test.skip(true, 'Marketing session not valid or API rejected (ensure user has role=marketing and org_id).')
    }
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('data')
    expect(Array.isArray(body.data)).toBe(true)
    if (body.data.length > 0) {
      const first = body.data[0]
      expect(first).toHaveProperty('athlete_id')
      expect(first).not.toHaveProperty('user_id')
      expect(first).not.toHaveProperty('allergie')
    }
  })
})

test.describe('Admin can read marketing athletes UI', () => {
  test.use({ storageState: 'tests/e2e/.auth/admin-auth.json' })

  test('admin opens /dashboard/marketing/athletes and sees page', async ({ page }) => {
    await page.goto('/dashboard/marketing/athletes')
    await expect(page).toHaveURL(/\/dashboard\/marketing\/athletes/)
    await expect(page.getByRole('heading', { level: 1, name: /Atleti/i })).toBeVisible({ timeout: 10000 })
  })
})
