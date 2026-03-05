#!/usr/bin/env npx tsx
/**
 * Script di test invio email e SMS tramite provider configurati
 *
 * Testa:
 * - Invio email tramite Resend
 * - Invio SMS tramite Twilio
 * - Verifica risposte API
 */

import { createLogger } from '../src/lib/logger'

const logger = createLogger('scripts:test-communications-providers')

// ============================================================
// Test Resend Email
// ============================================================

async function testResendEmail() {
  logger.info('🧪 Test invio email tramite Resend...')

  try {
    const { isResendConfigured, sendEmailViaResend } = await import(
      '../src/lib/communications/email-resend-client'
    )

    if (!isResendConfigured()) {
      logger.error('❌ Resend non configurato')
      return { success: false, error: 'Resend non configurato' }
    }

    // Email di test
    // Per sviluppo, puoi usare il dominio di test di Resend: onboarding@resend.dev
    const testEmail = process.env.TEST_EMAIL || 'onboarding@resend.dev'
    const testSubject = '🧪 Test Configurazione Resend - 22Club'
    const testHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Configurazione Resend</h2>
          <p>Questa è un'email di test per verificare la configurazione di Resend.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Provider:</strong> Resend</p>
          <p><strong>Sistema:</strong> 22Club</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Se ricevi questa email, la configurazione Resend funziona correttamente! ✅</p>
        </body>
      </html>
    `

    logger.info('Invio email di test...', undefined, {
      to: testEmail,
      subject: testSubject,
    })

    const result = await sendEmailViaResend(testEmail, testSubject, testHtml)

    if (result.success) {
      logger.info('✅ Email inviata con successo!', undefined, {
        emailId: result.emailId,
        to: testEmail,
      })
      return { success: true, emailId: result.emailId }
    } else {
      logger.error('❌ Errore invio email', undefined, { error: result.error })
      return { success: false, error: result.error }
    }
  } catch (error) {
    logger.error('❌ Errore durante test Resend', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============================================================
// Test Twilio SMS
// ============================================================

async function testTwilioSMS() {
  logger.info('🧪 Test invio SMS tramite Twilio...')

  try {
    // Importa funzione da sms.ts (import necessario per verificare che il modulo esista)
    await import('../src/lib/communications/sms')

    // Verifica configurazione Twilio
    const twilioConfigured =
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER

    if (!twilioConfigured) {
      logger.error('❌ Twilio non configurato')
      return { success: false, error: 'Twilio non configurato' }
    }

    // Test SMS
    const twilio = await import('twilio')
    const client = twilio.default(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)

    // Numero telefono di test
    // IMPORTANTE: Per account Twilio trial, devi verificare il numero destinatario
    // oppure usare un numero Twilio acquistato come mittente
    const testPhoneNumber = process.env.TEST_PHONE_NUMBER
    if (!testPhoneNumber) {
      logger.warn('⚠️  TEST_PHONE_NUMBER non configurato. Configura in .env.local per test SMS')
      return {
        success: false,
        error:
          'TEST_PHONE_NUMBER non configurato. Aggiungi TEST_PHONE_NUMBER=+39XXXXXXXXX in .env.local',
      }
    }
    const testMessage = `🧪 Test 22Club - Configurazione Twilio OK! Timestamp: ${new Date().toISOString()}`

    logger.info('Invio SMS di test...', undefined, {
      to: testPhoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      messageLength: testMessage.length,
    })

    const message = await client.messages.create({
      body: testMessage,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: testPhoneNumber,
    })

    logger.info('✅ SMS inviato con successo!', undefined, {
      messageSid: message.sid,
      status: message.status,
      to: testPhoneNumber,
    })

    return { success: true, messageSid: message.sid, status: message.status }
  } catch (error) {
    logger.error('❌ Errore durante test Twilio', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('\n🧪 Test Invio Comunicazioni - Provider Esterni\n')
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

  const results: Array<{ provider: string; success: boolean; error?: string; details?: unknown }> =
    []

  // Test Resend
  console.log('\n📧 Test Resend (Email)...')
  const resendResult = await testResendEmail()
  results.push({
    provider: 'Resend (Email)',
    success: resendResult.success,
    error: resendResult.error,
    details: resendResult.emailId ? { emailId: resendResult.emailId } : undefined,
  })

  // Test Twilio
  console.log('\n📱 Test Twilio (SMS)...')
  const twilioResult = await testTwilioSMS()
  results.push({
    provider: 'Twilio (SMS)',
    success: twilioResult.success,
    error: twilioResult.error,
    details: twilioResult.messageSid
      ? { messageSid: twilioResult.messageSid, status: twilioResult.status }
      : undefined,
  })

  // Report finale
  console.log('\n' + '='.repeat(60))
  console.log('📊 REPORT TEST\n')

  for (const result of results) {
    console.log(`\n${result.provider}:`)
    if (result.success) {
      console.log(`  ✅ Test completato con successo!`)
      if (result.details) {
        console.log(`  📋 Dettagli:`)
        Object.entries(result.details).forEach(([key, value]) => {
          console.log(`     - ${key}: ${value}`)
        })
      }
    } else {
      console.log(`  ❌ Test fallito`)
      if (result.error) {
        console.log(`  ⚠️  Errore: ${result.error}`)
      }
    }
  }

  const allSuccess = results.every((r) => r.success)

  console.log('\n' + '='.repeat(60))
  if (allSuccess) {
    console.log('✅ TUTTI I TEST COMPLETATI CON SUCCESSO!')
    console.log('\n📝 Prossimi passi:')
    console.log('  1. Verificare che email/SMS siano stati ricevuti')
    console.log('  2. Controllare dashboard provider per log invio')
    console.log('  3. Testare invio dalla pagina comunicazioni UI')
    console.log('  4. Verificare webhook ricevano eventi (opzionale)')
  } else {
    console.log('⚠️  ALCUNI TEST FALLITI')
    console.log('\n📝 Azioni richieste:')
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - Verificare configurazione ${r.provider}`)
        if (r.error) {
          console.log(`    Errore: ${r.error}`)
        }
      })
  }
  console.log('='.repeat(60) + '\n')

  process.exit(allSuccess ? 0 : 1)
}

main().catch((error) => {
  logger.error('Errore durante test', error)
  process.exit(1)
})
