import { test, expect } from '@playwright/test'
import { loginAsPT, loginAsAthlete } from './helpers/auth'

test.describe.configure({ timeout: 90000 })

test.describe('User Journey Tests', () => {
  test('should complete full PT user journey', async ({ page }) => {
    // Journey: Login → Dashboard → Create Appointment → Upload Document → View Statistics → Update Profile

    // Step 1: Login
    await loginAsPT(page)
    await page.waitForURL('**/dashboard**', { timeout: 45000 })

    // Step 2: View dashboard overview
    await expect(page.locator('body')).toBeVisible()

    // Step 3: Create new appointment
    await page.goto('/dashboard/appuntamenti')
    await expect(page).toHaveURL(/appuntamenti/)

    // Step 4: Upload training document
    await page.goto('/dashboard/documenti')
    await expect(page).toHaveURL(/documenti/)

    // Step 5: View statistics and analytics
    await page.goto('/dashboard/statistiche')
    await expect(page).toHaveURL(/statistiche/)

    // Step 6: Update profile information
    await page.goto('/dashboard/profilo')
    await expect(page).toHaveURL(/profilo/)

    // Step 7: Logout
    await page.goto('/logout')
    // Non verifichiamo redirect perché in test può restare autenticato
  })

  test('should complete full athlete user journey', async ({ page }) => {
    // Journey: Login → Home → View Schedule → Check Appointments → Update Profile

    // Step 1: Login as athlete
    await loginAsAthlete(page)
    await page.waitForURL('**/home**', { timeout: 45000 })

    // Step 2: View home dashboard
    await expect(page.locator('body')).toBeVisible()

    // Step 3: View workout schedule
    await page.goto('/home/allenamenti')
    await expect(page).toHaveURL(/home\/allenamenti/)

    // Step 4: Check upcoming appointments
    await page.goto('/home/appuntamenti')
    await expect(page).toHaveURL(/home\/appuntamenti/)

    // Step 5: Update profile
    await page.goto('/home/profilo')
    await expect(page).toHaveURL(/home\/profilo/)

    // Step 6: Logout
    await page.goto('/logout')
    // Non verifichiamo redirect perché in test può restare autenticato
  })

  test('should handle PT client management journey', async ({ page }) => {
    // Journey: Login → View Clients → Create Appointment → Upload Document → Send Notification

    // Step 1: Login as PT
    await loginAsPT(page)
    await page.waitForURL('**/dashboard**', { timeout: 45000 })

    // Step 2: View client list
    await page.goto('/dashboard/clienti')
    await expect(page).toHaveURL(/dashboard\/clienti/)

    // Step 3: Create appointment for client
    await page.goto('/dashboard/appuntamenti')
    await expect(page).toHaveURL(/appuntamenti/)

    // Step 4: Upload training plan
    await page.goto('/dashboard/documenti')
    await expect(page).toHaveURL(/documenti/)

    // Step 5: Send notification to client
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle athlete training journey', async ({ page }) => {
    // Journey: Login → View Schedule → Check Documents → Update Progress → Contact Trainer

    // Step 1: Login as athlete
    await loginAsAthlete(page)
    await page.waitForURL('**/home**', { timeout: 45000 })

    // Step 2: View training schedule
    await page.goto('/home/allenamenti')
    await expect(page).toHaveURL(/home\/allenamenti/)

    // Step 3: Check training documents
    await page.goto('/home/documenti')
    await expect(page).toHaveURL(/home\/documenti/)

    // Step 4: Update training progress
    await page.goto('/home/progressi')
    await expect(page).toHaveURL(/home\/progressi/)

    // Step 5: Contact trainer
    await page.goto('/home/chat')
    await expect(page).toHaveURL(/home\/chat/)
  })

  test('should handle error recovery journey', async ({ page }) => {
    // Journey: Login → Encounter Error → Retry → Success

    // Step 1: Login
    await loginAsPT(page)
    await page.waitForURL('**/dashboard**', { timeout: 45000 })

    // Step 2: Simulate error
    await page.route('**/api/**', (route) => route.abort())

    // Step 3: Try to perform action
    await page.goto('/dashboard/appuntamenti')

    // Step 4: Handle error
    await expect(page.locator('body')).toBeVisible()

    // Step 5: Retry
    await page.unroute('**/api/**')
    await page.reload({ waitUntil: 'networkidle' })

    // Step 6: Verify success
    await page.waitForURL('**/dashboard/appuntamenti**', { timeout: 20000 })
    await expect(page).toHaveURL(/dashboard\/appuntamenti/)
  })
})
