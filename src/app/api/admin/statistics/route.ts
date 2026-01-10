import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/admin/statistics')

// GET - Statistiche avanzate per admin (solo admin)
export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const profileData = profile as { role?: string } | null
    const userRole = profileData?.role ?? ''
    if (!profileData || userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // 1. Statistiche Utenti
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, role, stato, created_at')

    if (usersError) throw usersError

    type UserItem = {
      id?: string
      role?: string | null
      stato?: string | null
      created_at?: string | null
    }

    const typedUsers = (allUsers || []) as UserItem[]

    const usersThisMonth = typedUsers.filter(
      (u) => u.created_at && new Date(u.created_at) >= startOfMonth,
    ).length

    const usersLastMonth = typedUsers.filter(
      (u) =>
        u.created_at &&
        new Date(u.created_at) >= startOfLastMonth &&
        new Date(u.created_at) <= endOfLastMonth,
    ).length

    const usersGrowth =
      usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0

    // Distribuzione per ruolo
    const roleDistribution: Record<string, number> = {}
    typedUsers.forEach((user) => {
      if (user.role) {
        roleDistribution[user.role] = (roleDistribution[user.role] || 0) + 1
      }
    })

    // Crescita utenti ultimi 6 mesi
    const usersByMonth: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
      usersByMonth[monthKey] = typedUsers.filter(
        (u) =>
          u.created_at &&
          new Date(u.created_at) <= new Date(now.getFullYear(), now.getMonth() - i + 1, 0),
      ).length
    }

    // 2. Statistiche Pagamenti
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, created_at, method_text, is_reversal')
      .order('created_at', { ascending: false })

    if (paymentsError) throw paymentsError

    type PaymentItem = {
      amount?: number | string | null
      created_at?: string | null
      method_text?: string | null
      is_reversal?: boolean | null
    }

    const typedPayments = (payments || []) as PaymentItem[]

    const totalRevenue = typedPayments
      .filter((p) => !p.is_reversal)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const revenueThisMonth = typedPayments
      .filter((p) => !p.is_reversal && p.created_at && new Date(p.created_at) >= startOfMonth)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const revenueLastMonth = typedPayments
      .filter(
        (p) =>
          !p.is_reversal &&
          p.created_at &&
          new Date(p.created_at) >= startOfLastMonth &&
          new Date(p.created_at) <= endOfLastMonth,
      )
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    const revenueGrowth =
      revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0

    // Distribuzione metodi di pagamento
    const paymentMethods: Record<string, number> = {}
    typedPayments
      .filter((p) => !p.is_reversal)
      .forEach((p) => {
        const method = p.method_text || 'Altro'
        paymentMethods[method] = (paymentMethods[method] || 0) + 1
      })

    // Revenue per mese (ultimi 6 mesi)
    const revenueByMonth: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      revenueByMonth[monthKey] = typedPayments
        .filter(
          (p) =>
            !p.is_reversal &&
            p.created_at &&
            new Date(p.created_at) >= monthDate &&
            new Date(p.created_at) <= monthEnd,
        )
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)
    }

    // 3. Statistiche Appuntamenti
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, status, starts_at, type')

    if (appointmentsError) throw appointmentsError

    type AppointmentItem = {
      id?: string
      status?: string | null
      starts_at?: string | null
      type?: string | null
    }

    const typedAppointments = (appointments || []) as AppointmentItem[]

    const appointmentsThisMonth = typedAppointments.filter(
      (a) => a.starts_at && new Date(a.starts_at) >= startOfMonth,
    ).length

    const appointmentsByStatus: Record<string, number> = {}
    typedAppointments.forEach((a) => {
      appointmentsByStatus[a.status || 'unknown'] =
        (appointmentsByStatus[a.status || 'unknown'] || 0) + 1
    })

    // 4. Statistiche Documenti
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('id, status, expires_at, created_at')

    if (documentsError) throw documentsError

    type DocumentItem = {
      id?: string
      status?: string | null
      expires_at?: string | null
      created_at?: string | null
    }

    const typedDocuments = (documents || []) as DocumentItem[]

    const documentsByStatus: Record<string, number> = {}
    typedDocuments.forEach((d) => {
      documentsByStatus[d.status || 'unknown'] = (documentsByStatus[d.status || 'unknown'] || 0) + 1
    })

    const expiredDocuments = typedDocuments.filter(
      (d) => d.expires_at && new Date(d.expires_at) < now && d.status !== 'scaduto',
    ).length

    // 5. Statistiche Comunicazioni
    const { data: communications, error: communicationsError } = await supabase
      .from('communications')
      .select(
        'id, type, status, created_at, total_sent, total_delivered, total_opened, total_failed',
      )

    if (communicationsError) {
      // Comunicazioni potrebbe non esistere, non è critico
      logger.warn('Tabella communications non trovata', { error: communicationsError })
    }

    type CommunicationItem = {
      id?: string
      type?: string | null
      status?: string | null
      created_at?: string | null
      total_sent?: number | null
      total_delivered?: number | null
      total_opened?: number | null
      total_failed?: number | null
    }

    const typedCommunications = (communications || []) as CommunicationItem[]

    const totalCommunications = typedCommunications.length || 0
    const totalSent = typedCommunications.reduce((sum, c) => sum + (c.total_sent || 0), 0)
    const totalDelivered = typedCommunications.reduce((sum, c) => sum + (c.total_delivered || 0), 0)
    const totalOpened = typedCommunications.reduce((sum, c) => sum + (c.total_opened || 0), 0)
    const totalFailed = typedCommunications.reduce((sum, c) => sum + (c.total_failed || 0), 0)

    return NextResponse.json({
      users: {
        total: typedUsers.length || 0,
        active: typedUsers.filter((u) => u.stato === 'attivo').length,
        thisMonth: usersThisMonth,
        growth: usersGrowth,
        byRole: roleDistribution,
        byMonth: Object.entries(usersByMonth).map(([month, count]) => ({ month, count })),
      },
      payments: {
        totalRevenue,
        thisMonth: revenueThisMonth,
        growth: revenueGrowth,
        byMethod: paymentMethods,
        byMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
      },
      appointments: {
        total: typedAppointments.length || 0,
        thisMonth: appointmentsThisMonth,
        byStatus: appointmentsByStatus,
      },
      documents: {
        total: typedDocuments.length || 0,
        byStatus: documentsByStatus,
        expired: expiredDocuments,
      },
      communications: {
        total: totalCommunications,
        totalSent,
        totalDelivered,
        totalOpened,
        totalFailed,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error('Errore nel recupero statistiche', error)
    return NextResponse.json(
      { error: error.message || 'Errore nel recupero statistiche' },
      { status: 500 },
    )
  }
}
