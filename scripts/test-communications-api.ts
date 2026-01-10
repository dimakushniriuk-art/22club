/**
 * Script di Test API Comunicazioni
 *
 * Esegui con: npx tsx scripts/test-communications-api.ts
 *
 * Questo script testa le API routes senza interagire con l'UI
 */

import { createClient } from '@supabase/supabase-js'

// Configurazione
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

// Creare client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

interface TestResult {
  test: string
  passed: boolean
  error?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any
}

const results: TestResult[] = []

// Helper per test
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runTest(name: string, testFn: () => Promise<any>): Promise<void> {
  try {
    console.log(`\n🧪 Test: ${name}`)
    const result = await testFn()
    results.push({ test: name, passed: true, details: result })
    console.log(`✅ PASSED: ${name}`)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    results.push({ test: name, passed: false, error: errorMsg })
    console.error(`❌ FAILED: ${name} - ${errorMsg}`)
  }
}

// Test 1: Verifica autenticazione
async function testAuth() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error) throw error
  if (!session) throw new Error('Non autenticato')
  return { userId: session.user.id }
}

// Test 2: Verifica lista comunicazioni
async function testListCommunications() {
  const response = await fetch(`${API_BASE_URL}/api/communications/list?limit=10&offset=0`)
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  const data = await response.json()
  if (!data.communications) throw new Error('Risposta non valida')
  return { count: data.communications.length, total: data.total }
}

// Test 3: Verifica conteggio destinatari
async function testCountRecipients() {
  const filter = { all_users: true }
  const response = await fetch(`${API_BASE_URL}/api/communications/count-recipients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filter }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = await response.json()
  if (typeof data.count !== 'number') throw new Error('Conteggio non valido')
  return { count: data.count }
}

// Test 4: Verifica lista atleti
async function testListAthletes() {
  const response = await fetch(`${API_BASE_URL}/api/communications/list-athletes`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const data = await response.json()
  if (!Array.isArray(data.athletes)) throw new Error('Risposta non valida')
  return { count: data.athletes.length }
}

// Esegui tutti i test
async function runAllTests() {
  console.log('🚀 Inizio Test API Comunicazioni\n')
  console.log(`📍 API Base URL: ${API_BASE_URL}`)
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`)

  // Test autenticazione (richiede login manuale prima)
  await runTest('Autenticazione', testAuth)

  // Test API (richiedono autenticazione)
  await runTest('Lista Comunicazioni', testListCommunications)
  await runTest('Conteggio Destinatari', testCountRecipients)
  await runTest('Lista Atleti', testListAthletes)

  // Report finale
  console.log('\n' + '='.repeat(60))
  console.log('📊 REPORT FINALE')
  console.log('='.repeat(60))

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length

  console.log(`\n✅ Test Passati: ${passed} / ${results.length}`)
  console.log(`❌ Test Falliti: ${failed} / ${results.length}`)

  if (failed > 0) {
    console.log('\n❌ Test Falliti:')
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.test}: ${r.error}`)
      })
  }

  console.log('\n' + '='.repeat(60))
}

// Esegui
runAllTests().catch(console.error)
