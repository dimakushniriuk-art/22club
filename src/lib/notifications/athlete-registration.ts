import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'

const supabase = createClient()
const logger = createLogger('lib:notifications:athlete-registration')

interface AthleteRegistrationNotificationData {
  athleteId: string
  athleteName: string
  athleteEmail: string
  ptId: string
  ptName: string
  ptEmail: string
}

/**
 * Invia notifica al PT quando un atleta completa la registrazione
 */
export async function sendAthleteRegistrationNotification(
  data: AthleteRegistrationNotificationData,
) {
  const { athleteId, athleteName, athleteEmail, ptId, ptName, ptEmail } = data

  try {
    // Crea notifica per il PT
    const { error: notificationError } = await supabase.from('notifications').insert({
      user_id: ptId,
      title: '🎉 Nuovo atleta registrato',
      body: `${athleteName} ha completato la registrazione ed è stato assegnato a te`,
      link: `/dashboard/clienti/${athleteId}`,
      type: 'athlete_registration',
      sent_at: new Date().toISOString(),
    })

    if (notificationError) {
      logger.error('Error creating notification', notificationError, { athleteId, ptId })
      return { success: false, error: notificationError.message }
    }

    // Invia email di conferma al PT (opzionale)
    try {
      await sendPTEmailNotification({
        ptName,
        ptEmail,
        athleteName,
        athleteEmail,
        athleteId,
      })
    } catch (emailError) {
      logger.error('Error sending email notification', emailError, { athleteId, ptId, ptEmail })
      // Non bloccare il processo se l'email fallisce
    }

    // Invia notifica push se abilitata
    try {
      await sendPushNotification(ptId, {
        title: '🎉 Nuovo atleta registrato',
        body: `${athleteName} ha completato la registrazione`,
        data: {
          type: 'athlete_registration',
          athlete_id: athleteId,
          link: `/dashboard/clienti/${athleteId}`,
        },
      })
    } catch (pushError) {
      logger.error('Error sending push notification', pushError, { athleteId, ptId })
      // Non bloccare il processo se la push fallisce
    }

    return { success: true }
  } catch (error) {
    logger.error('Error in athlete registration notification', error, { athleteId, ptId })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Invia email di conferma al PT
 */
async function sendPTEmailNotification(data: {
  ptName: string
  ptEmail: string
  athleteName: string
  athleteEmail: string
  athleteId: string
}) {
  // Nota: athleteEmail potrebbe essere usato in futuro per notifiche email
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ptName, ptEmail, athleteName, athleteEmail, athleteId } = data

  // In un'implementazione reale, useresti un servizio email come SendGrid, Resend, etc.
  // Per ora, logghiamo l'email che verrebbe inviata
  logger.debug('Email notification to PT', undefined, {
    to: ptEmail,
    subject: `🎉 Nuovo atleta registrato - ${athleteName}`,
    athleteId,
    athleteName,
    ptName,
  })

  // Simula invio email
  return { success: true }
}

/**
 * Invia notifica push
 */
async function sendPushNotification(
  userId: string,
  notification: {
    title: string
    body: string
    data?: Record<string, unknown>
  },
) {
  // In un'implementazione reale, useresti il servizio push notifications
  // Per ora, logghiamo la notifica che verrebbe inviata
  logger.debug('Push notification', undefined, { userId, notification })

  return { success: true }
}

/**
 * Crea notifica di benvenuto per l'atleta
 */
export async function sendAthleteWelcomeNotification(
  athleteId: string,
  athleteName: string,
  ptName: string,
) {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: athleteId,
      title: '🎉 Benvenuto in 22Club!',
      body: `Ciao ${athleteName}! Il tuo PT ${ptName} ti ha preparato un percorso personalizzato. Inizia subito!`,
      link: '/home',
      type: 'welcome',
      sent_at: new Date().toISOString(),
    })

    if (error) {
      logger.error('Error creating welcome notification', error, { athleteId })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error in athlete welcome notification', error, { athleteId })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
