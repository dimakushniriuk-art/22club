import { NextRequest, NextResponse } from 'next/server'
import { runDailyNotifications, testNotifications } from '@/lib/notifications/scheduler'
import { processScheduledCommunications } from '@/lib/communications/scheduler'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:cron:notifications')

// =====================================================
// API Route per Cronjob Notifiche
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const test = searchParams.get('test')
    const auth = request.headers.get('authorization')

    // Verifica autorizzazione per cronjob
    const expectedAuth = process.env.CRON_SECRET
    if (!expectedAuth) {
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
    }
    if (auth !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Esegui test o notifiche reali
    if (test === 'true') {
      logger.info('Running test notifications')
      const result = await testNotifications()

      return NextResponse.json({
        success: result.success,
        message: result.success
          ? 'Test notification sent successfully'
          : 'Test notification failed',
        error: result.error,
        timestamp: new Date().toISOString(),
      })
    } else {
      logger.info('Running daily notifications')
      const notificationsResult = await runDailyNotifications()

      // Processa anche comunicazioni programmate
      logger.info('Processing scheduled communications')
      const communicationsResult = await processScheduledCommunications()

      // Aggiorna scadenze documenti/inviti/abbonamenti (FASE B2)
      logger.info('Updating document/invite/subscription expirations')
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      // Aggiorna stati documenti
      const { error: docError } = await supabase.rpc('update_document_statuses')
      if (docError) {
        logger.error('Error updating document statuses', docError)
      }

      // Aggiorna inviti scaduti
      const { error: inviteError } = await supabase.rpc('update_expired_invites')
      if (inviteError) {
        logger.error('Error updating expired invites', inviteError)
      }

      return NextResponse.json({
        success: notificationsResult.success && communicationsResult.success,
        message: 'Daily notifications and scheduled communications completed',
        notifications: {
          success: notificationsResult.success,
          totalNotifications: notificationsResult.totalNotifications,
          results: notificationsResult.results,
        },
        communications: {
          success: communicationsResult.success,
          processed: communicationsResult.processed,
          sent: communicationsResult.sent,
          failed: communicationsResult.failed,
          errors: communicationsResult.errors,
        },
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    logger.error('Error in notifications cronjob', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, title, message, type, link, actionText } = body

    // Verifica autorizzazione
    const auth = request.headers.get('authorization')
    const expectedAuth = process.env.CRON_SECRET
    if (!expectedAuth) {
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
    }
    if (auth !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    switch (action) {
      case 'send_manual':
        if (!userId || !title || !message || !type) {
          return NextResponse.json(
            { error: 'Missing required fields: userId, title, message, type' },
            { status: 400 },
          )
        }

        // Crea notifica manuale
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        const { data, error } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title,
            body: message,
            type,
            link,
            action_text: actionText,
          })
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Manual notification sent successfully',
          notification: data,
          timestamp: new Date().toISOString(),
        })

      case 'test':
        const testResult = await testNotifications()
        return NextResponse.json({
          success: testResult.success,
          message: testResult.success
            ? 'Test notification sent successfully'
            : 'Test notification failed',
          error: testResult.error,
          timestamp: new Date().toISOString(),
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: send_manual, test' },
          { status: 400 },
        )
    }
  } catch (error) {
    logger.error('Error in notifications API', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
