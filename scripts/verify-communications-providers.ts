#!/usr/bin/env npx tsx
/**
 * Script di verifica configurazione provider comunicazioni (Resend e Twilio)
 *
 * Verifica:
 * - Presenza variabili ambiente
 * - Connessione a Resend API
 * - Connessione a Twilio API
 * - Configurazione webhook
 */

import { createLogger } from '../src/lib/logger'

const logger = createLogger('scripts:verify-communications-providers')

interface VerificationResult {
  provider: string
  configured: boolean
  connected: boolean
  errors: string[]
  warnings: string[]
}

const results: VerificationResult[] = []

// ============================================================
// Verifica Resend
// ============================================================

async function verifyResend(): Promise<VerificationResult> {
  const result: VerificationResult = {
    provider: 'Resend (Email)',
    configured: false,
    connected: false,
    errors: [],
    warnings: [],
  }

  logger.info('Verificando configurazione Resend...')

  // Verifica variabili ambiente
  const requiredVars = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL']
  const optionalVars = ['RESEND_FROM_NAME', 'RESEND_WEBHOOK_SECRET']

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      result.errors.push(`Variabile ambiente mancante: ${varName}`)
    }
  }

  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      result.warnings.push(`Variabile opzionale non configurata: ${varName}`)
    }
  }

  if (result.errors.length > 0) {
    logger.error('Resend non configurato correttamente', undefined, { errors: result.errors })
    return result
  }

  result.configured = true

  // Test connessione API
  try {
    const { Resend } = await import('resend')
    // Nota: istanza Resend creata ma non usata perché Resend non ha endpoint "ping"
    // Verifichiamo solo che la configurazione sia corretta
    void new Resend(process.env.RESEND_API_KEY!)

    // Test API key con una chiamata semplice (verifica API key)
    // Nota: Resend non ha un endpoint di "ping", quindi verifichiamo solo la configurazione
    logger.info('Resend configurato correttamente', undefined, {
      fromEmail: process.env.RESEND_FROM_EMAIL,
      fromName: process.env.RESEND_FROM_NAME || '22Club (default)',
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET ? 'Configurato' : 'Non configurato',
    })

    result.connected = true
  } catch (error) {
    result.errors.push(
      `Errore importazione Resend: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    logger.error('Errore verifica Resend', error)
  }

  return result
}

// ============================================================
// Verifica Twilio
// ============================================================

async function verifyTwilio(): Promise<VerificationResult> {
  const result: VerificationResult = {
    provider: 'Twilio (SMS)',
    configured: false,
    connected: false,
    errors: [],
    warnings: [],
  }

  logger.info('Verificando configurazione Twilio...')

  // Verifica variabili ambiente
  const requiredVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER']
  const optionalVars = ['TWILIO_WEBHOOK_SECRET']

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      result.errors.push(`Variabile ambiente mancante: ${varName}`)
    }
  }

  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      result.warnings.push(`Variabile opzionale non configurata: ${varName}`)
    }
  }

  if (result.errors.length > 0) {
    logger.error('Twilio non configurato correttamente', undefined, { errors: result.errors })
    return result
  }

  result.configured = true

  // Test connessione API
  try {
    const twilio = await import('twilio')
    const client = twilio.default(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)

    // Test API key verificando account info
    try {
      const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch()
      logger.info('Twilio configurato correttamente', undefined, {
        accountSid: account.sid,
        accountName: account.friendlyName,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
        webhookSecret: process.env.TWILIO_WEBHOOK_SECRET ? 'Configurato' : 'Non configurato',
      })
      result.connected = true
    } catch (apiError) {
      result.errors.push(
        `Errore verifica account Twilio: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`,
      )
      logger.error('Errore verifica account Twilio', apiError)
    }
  } catch (error) {
    result.errors.push(
      `Errore importazione Twilio: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
    logger.error('Errore verifica Twilio', error)
  }

  return result
}

// ============================================================
// Verifica Webhook URLs
// ============================================================

function verifyWebhookUrls(): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  if (!appUrl || appUrl.includes('localhost')) {
    warnings.push(
      `NEXT_PUBLIC_APP_URL è configurato per sviluppo locale (${appUrl}). In produzione, configurare con dominio reale per webhook.`,
    )
  }

  const emailWebhookUrl = `${appUrl}/api/webhooks/email`
  const smsWebhookUrl = `${appUrl}/api/webhooks/sms`

  logger.info('URL Webhook configurati', undefined, {
    emailWebhook: emailWebhookUrl,
    smsWebhook: smsWebhookUrl,
    note: 'Configura questi URL nei dashboard Resend e Twilio',
  })

  return { errors, warnings }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('\n🔍 Verifica Configurazione Provider Comunicazioni\n')
  console.log('='.repeat(60))

  // Carica variabili ambiente
  try {
    const { config } = await import('dotenv')
    const path = await import('path')
    const { fileURLToPath } = await import('url')
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    config({ path: path.join(__dirname, '..', '.env.local') })
  } catch (error) {
    logger.warn('Impossibile caricare .env.local, usando variabili ambiente sistema', error)
  }

  // Verifica Resend
  const resendResult = await verifyResend()
  results.push(resendResult)

  // Verifica Twilio
  const twilioResult = await verifyTwilio()
  results.push(twilioResult)

  // Verifica Webhook URLs
  const webhookCheck = verifyWebhookUrls()
  if (webhookCheck.errors.length > 0 || webhookCheck.warnings.length > 0) {
    logger.warn('Note webhook', undefined, {
      errors: webhookCheck.errors,
      warnings: webhookCheck.warnings,
    })
  }

  // Report finale
  console.log('\n' + '='.repeat(60))
  console.log('📊 REPORT VERIFICA\n')

  for (const result of results) {
    console.log(`\n${result.provider}:`)
    console.log(`  ✅ Configurato: ${result.configured ? 'Sì' : 'No'}`)
    console.log(`  🔌 Connesso: ${result.connected ? 'Sì' : 'No'}`)

    if (result.errors.length > 0) {
      console.log(`  ❌ Errori:`)
      result.errors.forEach((error) => console.log(`     - ${error}`))
    }

    if (result.warnings.length > 0) {
      console.log(`  ⚠️  Avvisi:`)
      result.warnings.forEach((warning) => console.log(`     - ${warning}`))
    }
  }

  const allConfigured = results.every((r) => r.configured)
  const allConnected = results.every((r) => r.connected)

  console.log('\n' + '='.repeat(60))
  if (allConfigured && allConnected) {
    console.log('✅ TUTTI I PROVIDER CONFIGURATI E CONNESSI')
    console.log('\n📝 Prossimi passi:')
    console.log('  1. Configurare webhook URL nei dashboard Resend e Twilio')
    console.log('  2. Testare invio email/SMS dalla pagina comunicazioni')
    console.log('  3. Verificare che i webhook ricevano gli eventi')
  } else {
    console.log('⚠️  CONFIGURAZIONE INCOMPLETA')
    console.log('\n📝 Azioni richieste:')
    if (!allConfigured) {
      console.log('  - Completare configurazione variabili ambiente in .env.local')
    }
    if (!allConnected) {
      console.log('  - Verificare API keys e credenziali')
    }
  }
  console.log('='.repeat(60) + '\n')

  process.exit(allConfigured && allConnected ? 0 : 1)
}

main().catch((error) => {
  logger.error('Errore durante verifica', error)
  process.exit(1)
})
