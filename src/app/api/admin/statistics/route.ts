import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'

const logger = createLogger('api:admin:statistics')

/**
 * GET /api/admin/statistics
 * Ottiene statistiche globali del sistema (solo admin)
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica che l'utente sia admin
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    if (profileTyped.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin può accedere a questa risorsa' }, { status: 403 })
    }

    // Usa admin client per vedere tutte le statistiche
    const supabaseAdmin = createAdminClient()

    // Ottieni tutte le statistiche in parallelo
    const [
      profilesResult,
      paymentsResult,
      appointmentsResult,
      documentsResult,
      communicationsResult,
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, role, stato, created_at'),
      supabaseAdmin.from('payments').select('id, amount, payment_method, payment_date'),
      supabaseAdmin.from('appointments').select('id, status, starts_at'),
      supabaseAdmin.from('documents').select('id, status, expires_at'),
      supabaseAdmin.from('communications').select('id, status, sent_at, total_delivered, total_opened, total_failed'),
    ])

    const profiles = profilesResult.data || []
    const payments = paymentsResult.data || []
    const appointments = appointmentsResult.data || []
    const documents = documentsResult.data || []
    const communications = communicationsResult.data || []

    // Calcola statistiche utenti
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    const byRole: Record<string, number> = {}
    profiles.forEach((p) => {
      byRole[p.role] = (byRole[p.role] || 0) + 1
    })

    const stats = {
      users: {
        total: profiles.length,
        active: profiles.filter((p) => p.stato === 'attivo').length,
        byRole,
        growth: profiles.filter((p) => {
          if (!p.created_at) return false
          const created = new Date(p.created_at)
          return created >= sixMonthsAgo
        }).length,
      },
      payments: {
        total: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        byMethod: payments.reduce((acc, p) => {
          const method = p.payment_method || 'unknown'
          acc[method] = (acc[method] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        thisMonth: payments.filter((p) => {
          if (!p.payment_date) return false
          const date = new Date(p.payment_date)
          return date >= startOfMonth
        }).length,
      },
      appointments: {
        total: appointments.length,
        byStatus: appointments.reduce((acc, a) => {
          const status = a.status || 'unknown'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        thisMonth: appointments.filter((a) => {
          if (!a.starts_at) return false
          const date = new Date(a.starts_at)
          return date >= startOfMonth
        }).length,
      },
      documents: {
        total: documents.length,
        byStatus: documents.reduce((acc, d) => {
          const status = d.status || 'unknown'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        expiring: documents.filter((d) => {
          if (!d.expires_at) return false
          const expiry = new Date(d.expires_at)
          const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          return expiry <= thirtyDaysFromNow && expiry >= now
        }).length,
      },
      communications: {
        total: communications.length,
        sent: communications.filter((c) => c.status === 'sent' || c.sent_at).length,
        delivered: communications.filter((c) => (c.total_delivered ?? 0) > 0).length,
        opened: communications.filter((c) => (c.total_opened ?? 0) > 0).length,
        failed: communications.filter((c) => c.status === 'failed').length,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    logger.error('Errore durante il recupero delle statistiche', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}