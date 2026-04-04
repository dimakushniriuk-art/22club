#!/usr/bin/env node
/**
 * Script Pre-Push Completo - 22Club
 * Esegue tutti i controlli necessari prima di fare push, inclusi test hooks
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Colori per output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
}

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ️${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  section: (msg) => {
    console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`)
    console.log(`${colors.blue}${msg}${colors.reset}`)
    console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`)
  },
}

function runCommand(command, description, optional = false, extraEnv = null) {
  try {
    log.info(`${description}...`)
    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      ...(extraEnv ? { env: { ...process.env, ...extraEnv } } : {}),
    })
    log.success(`${description} - OK`)
    return { success: true, optional }
  } catch {
    if (optional) {
      log.warning(`${description} - SKIPPED (opzionale)`)
      return { success: true, optional: true }
    } else {
      log.error(`${description} - FALLITO`)
      return { success: false, optional }
    }
  }
}

function countHookTests() {
  const testDirs = [
    path.join(process.cwd(), 'src/hooks/__tests__'),
    path.join(process.cwd(), 'src/hooks/athlete-profile/__tests__'),
    path.join(process.cwd(), 'tests/unit'),
    path.join(process.cwd(), 'tests/integration'),
  ]

  let count = 0
  testDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true })
      count += files.filter(
        (f) => f.includes('hook') || f.endsWith('.test.ts') || f.endsWith('.test.tsx'),
      ).length
    }
  })

  return count
}

function main() {
  log.section('🚀 Pre-Push Check Completo - 22Club')
  console.log('Questo controllo include:\n')
  console.log('  • Test unitari (inclusi test hooks)')
  console.log('  • Build produzione')
  console.log('  • Verifica servizi (opzionale)')
  console.log('  • Check pre-deploy finale\n')

  const results = []

  // ============================================
  // CATEGORIA 1: Test (inclusi test hooks)
  // ============================================
  log.section('🧪 CATEGORIA 1: Test (inclusi test hooks)')

  const hookTestsCount = countHookTests()
  log.info(`Test hooks rilevati: ${hookTestsCount} file`)

  results.push(runCommand('npm run test:run', 'Test Unitari (inclusi test hooks)', false))

  // ============================================
  // CATEGORIA 2: Build
  // ============================================
  log.section('🏗️ CATEGORIA 2: Build Produzione')

  results.push(runCommand('npm run build', 'Build Produzione', false))

  // ============================================
  // CATEGORIA 3: Servizi (Opzionale)
  // ============================================
  log.section('🌐 CATEGORIA 3: Verifica Servizi (Opzionale)')

  const envPath = path.join(process.cwd(), '.env.local')
  const envExists = fs.existsSync(envPath)

  if (envExists) {
    results.push(runCommand('npm run verify:all', 'Verifica Servizi', true))
  } else {
    log.warning('.env.local non trovato - saltando verifica servizi')
  }

  // ============================================
  // CATEGORIA 4: Pre-Deploy Check (Finale)
  // ============================================
  log.section('🎯 CATEGORIA 4: Pre-Deploy Check Finale')

  results.push(
    runCommand('npm run pre-deploy', 'Pre-Deploy Check Completo', false, {
      PRE_DEPLOY_SKIP_BUILD: '1',
    }),
  )

  // ============================================
  // RIEPILOGO FINALE
  // ============================================
  log.section('📊 RIEPILOGO FINALE')

  const required = results.filter((r) => !r.optional)
  const optional = results.filter((r) => r.optional)

  const requiredPassed = required.filter((r) => r.success).length
  const requiredTotal = required.length

  const optionalPassed = optional.filter((r) => r.success).length
  const optionalTotal = optional.length

  console.log(`\n${colors.cyan}Controlli Obbligatori:${colors.reset}`)
  console.log(`  ${colors.green}✅ Passati: ${requiredPassed}/${requiredTotal}${colors.reset}`)
  if (requiredPassed < requiredTotal) {
    console.log(`  ${colors.red}❌ Falliti: ${requiredTotal - requiredPassed}${colors.reset}`)
  }

  if (optionalTotal > 0) {
    console.log(`\n${colors.cyan}Controlli Opzionali:${colors.reset}`)
    console.log(`  ${colors.green}✅ Passati: ${optionalPassed}/${optionalTotal}${colors.reset}`)
    if (optionalPassed < optionalTotal) {
      console.log(
        `  ${colors.yellow}⚠️ Saltati/Falliti: ${optionalTotal - optionalPassed}${colors.reset}`,
      )
    }
  }

  console.log(`\n${'='.repeat(60)}\n`)

  if (requiredPassed === requiredTotal) {
    console.log(`${colors.green}🎉 TUTTI I CONTROLLI OBBLIGATORI PASSATI!${colors.reset}`)
    console.log(`${colors.green}✅ Push consentito${colors.reset}\n`)
    process.exit(0)
  } else {
    console.log(`${colors.red}❌ ALCUNI CONTROLLI OBBLIGATORI SONO FALLITI${colors.reset}`)
    console.log(`${colors.yellow}⚠️ Risolvi gli errori prima di fare push${colors.reset}\n`)
    process.exit(1)
  }
}

main()
