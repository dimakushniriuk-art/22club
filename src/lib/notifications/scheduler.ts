// =====================================================
// STEP 11: Scheduler Notifiche Automatiche
// =====================================================

import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'

const logger = createLogger('lib:notifications:scheduler')

// Configurazione Supabase per server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// =====================================================
// Funzioni per notifiche automatiche
// =====================================================

/**
 * Notifica documenti in scadenza
 */
export async function notifyExpiringDocuments() {
  logger.debug('Checking for expiring documents')

  try {
    const { data, error } = await supabase.rpc('notify_expiring_documents')

    if (error) {
      logger.error('Error notifying expiring documents', error)
      return { success: false, count: 0, error: error.message }
    }

    logger.info('Sent notifications for expiring documents', undefined, { count: data })
    return { success: true, count: data, error: null }
  } catch (err) {
    logger.error('Error in notifyExpiringDocuments', err)
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Notifica progressi mancanti
 */
export async function notifyMissingProgress() {
  logger.debug('Checking for missing progress updates')

  try {
    const { data, error } = await supabase.rpc('notify_missing_progress')

    if (error) {
      logger.error('Error notifying missing progress', error)
      return { success: false, count: 0, error: error.message }
    }

    logger.info('Sent notifications for missing progress', undefined, { count: data })
    return { success: true, count: data, error: null }
  } catch (err) {
    logger.error('Error in notifyMissingProgress', err)
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Notifica lezioni residue basse
 */
export async function notifyLowLessonBalance() {
  logger.debug('Checking for low lesson balances')

  try {
    const { data, error } = await supabase.rpc('notify_low_lesson_balance')

    if (error) {
      logger.error('Error notifying low lesson balance', error)
      return { success: false, count: 0, error: error.message }
    }

    logger.info('Sent notifications for low lesson balance', undefined, { count: data })
    return { success: true, count: data, error: null }
  } catch (err) {
    logger.error('Error in notifyLowLessonBalance', err)
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Notifica nessuna scheda attiva
 */
export async function notifyNoActiveWorkouts() {
  logger.debug('Checking for athletes without active workouts')

  try {
    const { data, error } = await supabase.rpc('notify_no_active_workouts')

    if (error) {
      logger.error('Error notifying no active workouts', error)
      return { success: false, count: 0, error: error.message }
    }

    logger.info('Sent notifications for no active workouts', undefined, { count: data })
    return { success: true, count: data, error: null }
  } catch (err) {
    logger.error('Error in notifyNoActiveWorkouts', err)
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Notifica allenamenti saltati
 */
export async function notifySkippedWorkouts() {
  logger.debug('Checking for skipped workouts')

  try {
    // Trova atleti che non hanno completato allenamenti da 3+ giorni
    const { data: athletes, error: fetchError } = await supabase
      .from('profiles')
      .select(
        `
        user_id,
        nome,
        cognome
      `,
      )
      .eq('role', 'atleta')
      .not(
        'user_id',
        'in',
        `(
        SELECT DISTINCT wp.athlete_id 
        FROM workout_plans wp 
        WHERE wp.is_active = false 
          AND wp.updated_at > NOW() - INTERVAL '3 days'
      )`,
      )

    if (fetchError) {
      logger.error('Error fetching athletes for skipped workouts', fetchError)
      return { success: false, count: 0, error: fetchError.message }
    }

    let notificationCount = 0

    for (const athlete of athletes || []) {
      // Verifica che non abbia già ricevuto questa notifica di recente
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', athlete.user_id)
        .eq('type', 'allenamento')
        .like('body', '%Hai saltato gli allenamenti%')
        .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (existingNotification) continue

      // Crea notifica
      const { error: insertError } = await supabase.from('notifications').insert({
        user_id: athlete.user_id,
        title: 'Hai saltato gli allenamenti da 3 giorni • Torna a muoverti!',
        body: 'La costanza è la chiave del successo. Riprendi il tuo percorso oggi!',
        type: 'allenamento',
        link: '/home/allenamenti',
        action_text: 'Vai agli allenamenti',
      })

      if (insertError) {
        logger.error('Error creating notification for athlete', insertError, {
          athleteId: athlete.user_id,
        })
        continue
      }

      notificationCount++
    }

    logger.info('Sent notifications for skipped workouts', undefined, { count: notificationCount })
    return { success: true, count: notificationCount, error: null }
  } catch (err) {
    logger.error('Error in notifySkippedWorkouts', err)
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Notifica foto progressi mancanti
 */
export async function notifyMissingProgressPhotos() {
  logger.debug('Checking for missing progress photos')

  try {
    // Trova atleti che non hanno caricato foto da 14+ giorni
    const { data: athletes, error: fetchError } = await supabase
      .from('profiles')
      .select(
        `
        user_id,
        nome,
        cognome
      `,
      )
      .eq('role', 'atleta')
      .not(
        'user_id',
        'in',
        `(
        SELECT DISTINCT pp.athlete_id 
        FROM progress_photos pp 
        WHERE pp.date > NOW() - INTERVAL '14 days'
      )`,
      )

    if (fetchError) {
      logger.error('Error fetching athletes for missing photos', fetchError)
      return { success: false, count: 0, error: fetchError.message }
    }

    let notificationCount = 0

    for (const athlete of athletes || []) {
      // Verifica che non abbia già ricevuto questa notifica di recente
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', athlete.user_id)
        .eq('type', 'progressi')
        .like('body', '%Carica nuove foto%')
        .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (existingNotification) continue

      // Crea notifica
      const { error: insertError } = await supabase.from('notifications').insert({
        user_id: athlete.user_id,
        title: 'Carica nuove foto per vedere il tuo cambiamento 📸',
        body: 'Non carichi foto di progresso da 14 giorni • Mostra i tuoi risultati!',
        type: 'progressi',
        link: '/home/progressi',
        action_text: 'Aggiungi foto',
      })

      if (insertError) {
        logger.error('Error creating notification for athlete', insertError, {
          athleteId: athlete.user_id,
        })
        continue
      }

      notificationCount++
    }

    logger.info('Sent notifications for missing progress photos', undefined, {
      count: notificationCount,
    })
    return { success: true, count: notificationCount, error: null }
  } catch (err) {
    logger.error('Error in notifyMissingProgressPhotos', err)
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

// =====================================================
// Funzione master per eseguire tutte le notifiche
// =====================================================

export async function runDailyNotifications() {
  logger.info('Starting daily notifications scheduler', undefined, {
    timestamp: new Date().toISOString(),
  })

  const results = {
    documents: await notifyExpiringDocuments(),
    progress: await notifyMissingProgress(),
    lessons: await notifyLowLessonBalance(),
    workouts: await notifyNoActiveWorkouts(),
    skippedWorkouts: await notifySkippedWorkouts(),
    progressPhotos: await notifyMissingProgressPhotos(),
  }

  const totalNotifications = Object.values(results).reduce((sum, result) => sum + result.count, 0)
  const hasErrors = Object.values(results).some((result) => !result.success)

  logger.info('Daily notifications summary', undefined, {
    documents: results.documents.count,
    progress: results.progress.count,
    lessons: results.lessons.count,
    workouts: results.workouts.count,
    skippedWorkouts: results.skippedWorkouts.count,
    progressPhotos: results.progressPhotos.count,
    total: totalNotifications,
    hasErrors,
  })

  if (hasErrors) {
    logger.warn('Some notifications failed to send', undefined, {
      errors: Object.entries(results)
        .filter(([, result]) => !result.success)
        .map(([key, result]) => ({ key, error: result.error })),
    })
  }

  return {
    success: !hasErrors,
    totalNotifications,
    results,
  }
}

// =====================================================
// Funzione per test (sviluppo)
// =====================================================

export async function testNotifications() {
  logger.debug('Testing notifications')

  try {
    // Crea una notifica di test per l'admin
    const { data: admin } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('role', 'admin')
      .single()

    const adminProfile = admin as { user_id?: string } | null
    if (adminProfile?.user_id) {
      const { error } = await supabase.from('notifications').insert({
        user_id: adminProfile.user_id,
        title: 'Test Notifiche 🧪',
        body: 'Questo è un test del sistema di notifiche automatiche',
        type: 'sistema',
        link: '/dashboard/statistiche',
        action_text: 'Vai alle statistiche',
      })

      if (error) {
        logger.error('Error creating test notification', error)
        return { success: false, error: error.message }
      }

      logger.info('Test notification created successfully', undefined, {
        adminId: adminProfile.user_id,
      })
      return { success: true, error: null }
    } else {
      logger.warn('No admin user found for test')
      return { success: false, error: 'No admin user found' }
    }
  } catch (err) {
    logger.error('Error in testNotifications', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
