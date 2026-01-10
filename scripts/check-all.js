import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

// Colori per output (cross-platform)
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

const log = {
  info: (msg) => console.log(`${colors.cyan}🔍${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  section: (msg) =>
    console.log(
      `\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${'='.repeat(60)}\n`,
    ),
}

const runCommand = (command, description, optional = false) => {
  log.info(`${description}...`)
  try {
    execSync(command, {
      cwd: projectRoot,
      stdio: 'pipe',
      encoding: 'utf8',
    })
    log.success(`${description} - PASSED`)
    return { success: true, optional }
  } catch (error) {
    if (optional) {
      log.warning(`${description} - SKIPPED (optional)`)
      if (error.message) {
        console.log(`${colors.gray}   ${error.message.split('\n')[0]}${colors.reset}`)
      }
      return { success: true, optional: true } // Optional failures don't count
    } else {
      log.error(`${description} - FAILED`)
      if (error.message) {
        console.error(`${colors.red}   ${error.message.split('\n')[0]}${colors.reset}`)
      }
      return { success: false, optional }
    }
  }
}

const main = () => {
  log.section('🚀 22Club - Check Completo Pre-Deploy')

  const results = []

  // ============================================
  // CATEGORIA 1: Formattazione e Lint
  // ============================================
  log.section('📝 CATEGORIA 1: Formattazione e Lint')

  results.push(runCommand('npm run format:check', 'Format Check (Prettier)'))
  results.push(runCommand('npm run lint', 'ESLint Validation'))
  results.push(runCommand('npm run lint:fix', 'ESLint Fix (auto)', true))

  // ============================================
  // CATEGORIA 2: TypeScript
  // ============================================
  log.section('📘 CATEGORIA 2: TypeScript')

  results.push(runCommand('npm run typecheck', 'TypeScript Check'))

  // ============================================
  // CATEGORIA 3: Test
  // ============================================
  log.section('🧪 CATEGORIA 3: Test')

  results.push(runCommand('npm run test:run', 'Unit Tests'))

  // ============================================
  // CATEGORIA 4: Build
  // ============================================
  log.section('🏗️ CATEGORIA 4: Build')

  results.push(runCommand('npm run build', 'Production Build'))

  // ============================================
  // CATEGORIA 5: Database/Supabase (Opzionali - Solo Verifica)
  // ============================================
  log.section('🗄️ CATEGORIA 5: Database/Supabase (Verifica - Safe)')

  // Verifica che .env.local esista
  const envPath = path.join(projectRoot, '.env.local')
  const envExists = fs.existsSync(envPath)

  if (envExists) {
    log.info('.env.local trovato - eseguendo verifiche database...')
    results.push(runCommand('npm run db:verify-config', 'DB Verify Config', true))
    results.push(runCommand('npm run db:analyze-complete', 'DB Analyze Complete', true))
    results.push(runCommand('npm run db:verify-data-deep', 'DB Verify Data Deep', true))
  } else {
    log.warning('.env.local non trovato - saltando verifiche database')
    log.info('Le verifiche database richiedono .env.local con variabili Supabase')
  }

  // NOTA: supabase db diff richiede Docker Desktop - escluso per default
  // Se necessario, eseguire manualmente: npx supabase db diff

  // ============================================
  // CATEGORIA 6: Servizi
  // ============================================
  log.section('🌐 CATEGORIA 6: Servizi')

  if (envExists) {
    results.push(runCommand('npm run verify:all', 'Verify All Services', true))
  } else {
    log.warning('Saltando verify:all (richiede .env.local)')
  }

  // ============================================
  // CATEGORIA 7: Pre-Deploy Check (Finale)
  // ============================================
  log.section('🎯 CATEGORIA 7: Pre-Deploy Check Finale')

  results.push(runCommand('npm run pre-deploy', 'Pre-Deploy Check Completo'))

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

  console.log(`\n${'='.repeat(60)}`)

  if (requiredPassed === requiredTotal) {
    console.log(`\n${colors.green}🎉 TUTTI I CONTROLLI OBBLIGATORI PASSATI!${colors.reset}`)
    console.log(`${colors.green}✅ Progetto pronto per il deploy${colors.reset}\n`)
    process.exit(0)
  } else {
    console.log(`\n${colors.red}❌ ALCUNI CONTROLLI OBBLIGATORI SONO FALLITI${colors.reset}`)
    console.log(
      `${colors.yellow}⚠️ Risolvi gli errori prima di procedere con il deploy${colors.reset}\n`,
    )
    process.exit(1)
  }
}

main()
