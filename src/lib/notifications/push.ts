// =====================================================
// STEP 11: Push Notifications (PWA-ready)
// =====================================================

import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase'

const logger = createLogger('lib:notifications:push')

// VAPID Keys per push notifications
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@22club.it'

// Type assertion manuale per user_push_tokens (tabella non presente nei tipi generati)
type PushTokenRow = {
  id?: string
  user_id?: string | null
  device_type?: 'web' | 'ios' | 'android' | null
  token?: string | null
  is_active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
  [key: string]: unknown
}

type PushTokenInfo = Pick<PushTokenRow, 'token' | 'device_type'>

const SUPABASE_HEADERS = {
  'Cache-Control': 'no-store',
}

let serviceClient: ReturnType<typeof createClient<Database>> | null = null

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

function getSupabaseClient() {
  if (!serviceClient) {
    serviceClient = createClient<Database>(
      requiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: SUPABASE_HEADERS,
        },
      },
    )
  }
  return serviceClient
}

interface PushResult<T = unknown> {
  success: boolean
  data?: T
  sent?: number
  total?: number
  processed?: number
  errors?: string[]
  error?: string
  message?: string
}

interface WebPushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, unknown>
}

// =====================================================
// Funzioni per gestione token push
// =====================================================

/**
 * Registra un token push per un utente
 */
export async function registerPushToken(
  userId: string,
  token: string,
  deviceType: 'web' | 'ios' | 'android' = 'web',
): Promise<PushResult<PushTokenRow>> {
  try {
    const supabase = getSupabaseClient()
    const payload = {
      user_id: userId,
      device_type: deviceType,
      token,
      is_active: true,
    }

    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('user_push_tokens') as any)
      .upsert(payload)
      .select('id, user_id, device_type, token, is_active, created_at, updated_at')
      .single()

    if (error) {
      logger.error('Error registering push token', error, { userId })
      return { success: false, error: error.message }
    }

    logger.info('Push token registered', undefined, { userId })
    return { success: true, data: data as PushTokenRow }
  } catch (err) {
    logger.error('Error in registerPushToken', err, { userId })
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Disattiva un token push
 */
export async function deactivatePushToken(userId: string, token: string) {
  try {
    const supabase = getSupabaseClient()
    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('user_push_tokens') as any)
      .update({ is_active: false } as Record<string, unknown>)
      .eq('user_id', userId)
      .eq('token', token)

    if (error) {
      logger.error('Error deactivating push token', error, { userId })
      return { success: false, error: error.message }
    }

    logger.info('Push token deactivated', undefined, { userId })
    return { success: true }
  } catch (err) {
    logger.error('Error in deactivatePushToken', err, { userId })
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Ottieni tutti i token attivi per un utente
 * Per web push, legge da push_subscriptions e costruisce oggetti subscription completi
 * Per altri device types, legge da user_push_tokens
 */
export async function getActivePushTokens(
  userId: string,
): Promise<{ success: boolean; tokens: PushTokenInfo[]; error?: string }> {
  try {
    const supabase = getSupabaseClient()
    const tokens: PushTokenInfo[] = []

    // Per web push, leggi da push_subscriptions se la tabella esiste
    // Nota: push_subscriptions potrebbe non esistere nel database, gestiamo come opzionale
    try {
      const { data: webSubscriptions, error: webError } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', userId)

      if (!webError && webSubscriptions && webSubscriptions.length > 0) {
        // Costruisci oggetti subscription completi per web push
        for (const sub of webSubscriptions as Array<{
          endpoint?: string
          p256dh?: string
          auth?: string
        }>) {
          if (sub.endpoint && sub.p256dh && sub.auth) {
            // Salva come JSON string della subscription completa (formato richiesto da web-push)
            const subscription = JSON.stringify({
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            })
            tokens.push({
              token: subscription,
              device_type: 'web',
            } as PushTokenInfo)
          }
        }
      } else if (webError) {
        // Non è critico, continua con user_push_tokens
        logger.warn('Error fetching web push subscriptions', webError, { userId })
      }
    } catch {
      // Tabella push_subscriptions non esiste, continua con user_push_tokens
      logger.debug('push_subscriptions table not found, using user_push_tokens only', undefined, {
        userId,
      })
    }

    // Per altri device types (iOS, Android), leggi da user_push_tokens
    const { data: otherTokens, error: tokensError } = await supabase
      .from('user_push_tokens')
      .select('token, device_type')
      .eq('user_id', userId)
      .eq('is_active', true)
      .neq('device_type', 'web') // Escludi web (già gestito sopra)

    if (!tokensError && otherTokens && otherTokens.length > 0) {
      tokens.push(...(otherTokens as PushTokenInfo[]))
    } else if (tokensError) {
      // Non è critico se non ci sono altri token
      logger.warn('Error fetching other push tokens', tokensError, { userId })
    }

    return { success: true, tokens }
  } catch (err) {
    logger.error('Error in getActivePushTokens', err, { userId })
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      tokens: [],
    }
  }
}

// =====================================================
// Funzioni per invio push notifications
// =====================================================

/**
 * Invia push notification a un utente specifico
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  icon?: string,
  badge?: string,
  data?: Record<string, unknown>,
): Promise<PushResult> {
  try {
    // Ottieni token attivi per l'utente
    const { tokens } = await getActivePushTokens(userId)

    if (tokens.length === 0) {
      logger.debug('No active push tokens for user', undefined, { userId })
      return { success: true, sent: 0, message: 'No active tokens' }
    }

    let sentCount = 0
    const errors: string[] = []
    const payload: WebPushPayload = { title, body, icon, badge, data }

    // Invia a tutti i token attivi
    for (const tokenInfo of tokens) {
      try {
        if (!tokenInfo.token) {
          continue
        }
        const result = await sendWebPushNotification(tokenInfo.token, payload)

        if (result.success) {
          sentCount++
        } else {
          errors.push(result.error || 'Unknown error')
        }
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    // Aggiorna lo stato della notifica
    const supabase = getSupabaseClient()
    // Workaround necessario per inferenza tipo Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('notifications') as any)
      .update({ is_push_sent: true } as Record<string, unknown>)
      .eq('user_id', userId)
      .eq('title', title)
      .eq('is_push_sent', false)

    logger.info('Push notification sent', undefined, {
      userId,
      sent: sentCount,
      total: tokens.length,
    })

    return {
      success: sentCount > 0,
      sent: sentCount,
      total: tokens.length,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (err) {
    logger.error('Error in sendPushNotification', err, { userId })
    return {
      success: false,
      sent: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Invia push notification web usando web-push library
 * Il token può essere:
 * - Una stringa JSON con l'intera subscription (endpoint + keys)
 * - Una stringa semplice (endpoint) - in questo caso deve essere combinata con keys dal DB
 * - Un oggetto PushSubscription completo
 */
async function sendWebPushNotification(
  token: string | { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: WebPushPayload,
) {
  try {
    // Verifica che le VAPID keys siano configurate
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      logger.warn('VAPID keys not configured, push notifications will be simulated', undefined, {
        hasPublicKey: !!VAPID_PUBLIC_KEY,
        hasPrivateKey: !!VAPID_PRIVATE_KEY,
      })
      // Fallback a simulazione se keys non configurate
      const tokenStr = typeof token === 'string' ? token : token.endpoint
      logger.debug('Simulating push notification', undefined, {
        tokenPreview: tokenStr.substring(0, 20),
        title: payload.title,
        body: payload.body,
      })
      await new Promise((resolve) => setTimeout(resolve, 100))
      return { success: true }
    }

    // Import dinamico di web-push (solo quando necessario, server-side)
    const webpush = await import('web-push')

    // Configura VAPID details
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

    // Normalizza il token alla struttura PushSubscription richiesta da web-push
    type PushSubscription = {
      endpoint: string
      keys: {
        p256dh: string
        auth: string
      }
    }
    let pushSubscription: PushSubscription

    if (typeof token === 'string') {
      // Prova a parsare come JSON (potrebbe essere una subscription completa)
      try {
        const parsed = JSON.parse(token)
        if (parsed.endpoint && parsed.keys) {
          pushSubscription = parsed as PushSubscription
        } else {
          // Se è solo una stringa endpoint, non possiamo inviare (serve anche keys)
          logger.error(
            'Token is missing subscription keys, cannot send push notification',
            undefined,
            { tokenType: typeof token },
          )
          return {
            success: false,
            error:
              'Token is missing subscription keys (p256dh, auth). Ensure push subscription is complete.',
          }
        }
      } catch {
        // Non è JSON, probabilmente è solo endpoint - serve anche keys dal DB
        logger.error(
          'Token format not recognized, expected PushSubscription object or JSON string',
          undefined,
          { tokenType: typeof token },
        )
        return {
          success: false,
          error: 'Token format invalid. Expected PushSubscription object with endpoint and keys.',
        }
      }
    } else {
      // È già un oggetto con endpoint e keys
      pushSubscription = token as PushSubscription
    }

    // Prepara il payload della notifica
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge-72x72.png',
      data: payload.data || {},
    })

    // Invia la notifica
    try {
      await webpush.sendNotification(pushSubscription, notificationPayload)
      const endpointStr =
        typeof token === 'string' ? token.substring(0, 20) : token.endpoint.substring(0, 20)
      logger.debug('Push notification sent successfully', undefined, {
        endpointPreview: endpointStr,
      })
      return { success: true }
    } catch (sendError: unknown) {
      // Gestisci errori specifici di web-push
      const errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error'

      // Se il token è invalido o scaduto, logga ma non fallisci completamente
      if (
        errorMessage.includes('expired') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('410') || // Gone status code
        errorMessage.includes('Gone') ||
        errorMessage.includes('expired subscription')
      ) {
        logger.warn('Push notification failed (token invalid/expired)', undefined, { errorMessage })
        return {
          success: false,
          error: `Token invalid or expired: ${errorMessage}`,
        }
      }

      // Per altri errori, logga e ritorna errore
      logger.error('Push notification failed', undefined, { errorMessage })
      return {
        success: false,
        error: errorMessage,
      }
    }
  } catch (err) {
    // Gestisci errori di import o configurazione
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    logger.error('Error in sendWebPushNotification', err)

    // Fallback a simulazione se web-push non è disponibile
    logger.warn('Falling back to simulation mode', undefined, { errorMessage })
    const tokenStr = typeof token === 'string' ? token : token.endpoint
    logger.debug('Simulating push notification (fallback)', undefined, {
      tokenPreview: tokenStr.substring(0, 20),
      title: payload.title,
      body: payload.body,
    })
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { success: true }
  }
}

/**
 * Invia push notification a tutti gli utenti
 */
export async function sendBroadcastPushNotification(
  title: string,
  body: string,
  userRole?: 'admin' | 'pt' | 'atleta',
  icon?: string,
  badge?: string,
  data?: Record<string, unknown>,
): Promise<PushResult> {
  try {
    const supabase = getSupabaseClient()
    let query = supabase.from('profiles').select('user_id').not('user_id', 'is', null)

    if (userRole) {
      query = query.eq('role', userRole)
    }

    const { data: users, error } = await query

    if (error) {
      logger.error('Error getting users for broadcast', error)
      return { success: false, error: error.message, sent: 0 }
    }

    let totalSent = 0
    const errors: string[] = []

    // Type assertion per users
    type UserRow = {
      user_id?: string | null
      [key: string]: unknown
    }

    const typedUsers = (users as UserRow[]) || []

    for (const user of typedUsers) {
      if (!user?.user_id) {
        continue
      }
      const result = await sendPushNotification(user.user_id, title, body, icon, badge, data)

      if (result.success && typeof result.sent === 'number') {
        totalSent += result.sent
      }

      if (result.errors) {
        errors.push(...result.errors)
      }
    }

    logger.info('Broadcast push notification sent', undefined, { totalSent })

    return {
      success: totalSent > 0,
      sent: totalSent,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (err) {
    logger.error('Error in sendBroadcastPushNotification', err)
    return {
      success: false,
      sent: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

// =====================================================
// Funzioni per notifiche automatiche con push
// =====================================================

/**
 * Processa notifiche non inviate e invia push
 */
export async function processUnsentNotifications() {
  try {
    logger.debug('Processing unsent push notifications')

    const supabase = getSupabaseClient()
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_push_sent', false)
      .not('user_id', 'is', null)

    if (error) {
      logger.error('Error fetching unsent notifications', error)
      return { success: false, error: error.message, processed: 0 }
    }

    let processedCount = 0
    const errors: string[] = []

    // Type assertion per notifications
    type NotificationRow = {
      user_id?: string | null
      title?: string | null
      body?: string | null
      link?: string | null
      type?: string | null
      action_text?: string | null
      [key: string]: unknown
    }

    const typedNotifications = (notifications as NotificationRow[]) || []

    for (const notification of typedNotifications) {
      if (!notification.user_id) continue
      try {
        const result = await sendPushNotification(
          notification.user_id,
          notification.title || '',
          notification.body || '',
          undefined, // icon
          undefined, // badge
          {
            link: notification.link || undefined,
            type: notification.type || undefined,
            actionText: notification.action_text || undefined,
          },
        )

        if (result.success) {
          processedCount++
        }

        if (result.errors) {
          errors.push(...result.errors)
        }
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    logger.info('Processed unsent notifications', undefined, {
      processed: processedCount,
      total: notifications?.length || 0,
    })

    return {
      success: processedCount > 0,
      processed: processedCount,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (err) {
    logger.error('Error in processUnsentNotifications', err)
    return {
      success: false,
      processed: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

// =====================================================
// Funzioni per configurazione PWA
// =====================================================

/**
 * Ottieni VAPID public key per il client
 */
export function getVAPIDPublicKey() {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error('VAPID_PUBLIC_KEY not configured')
  }
  return VAPID_PUBLIC_KEY
}

/**
 * Verifica se le push notifications sono supportate
 */
export function isPushNotificationSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
}

/**
 * Richiedi permessi per push notifications
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Not in browser environment' }
  }

  try {
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      return { success: true, permission }
    } else {
      return { success: false, permission, error: 'Permission denied' }
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
