'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Hand,
  Users,
  CalendarCheck,
  FileText,
  BarChart2,
  ArrowRight,
  Calendar,
  MessageSquare,
} from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useAuth } from '@/hooks/use-auth'
import { createLogger } from '@/lib/logger'
import { Button } from '@/components/ui'
import {
  StaffDashboardGuardSkeleton,
  StaffStaffPageContentSkeleton,
} from '@/components/layout/route-loading-skeletons'

const logger = createLogger('app:dashboard:massaggiatore:statistiche')

type Stats = {
  clientiSeguiti: number
  massaggiEseguiti: number
  massaggiTotali: number
  fattureEmesse: number
  appuntamentiOggi: number
  appuntamentiSettimana: number
}

function KpiCard({
  label,
  value,
  icon: Icon,
  href,
  sublabel,
}: {
  label: string
  value: number
  icon: React.ElementType
  href?: string
  sublabel?: string
}) {
  const cardClass =
    'rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-amber-500/10 p-3 sm:p-5 text-left min-w-0 min-h-[44px] transition-all hover:shadow-xl hover:shadow-amber-500/20 hover:border-amber-500/50'
  const content = (
    <div className={cardClass}>
      <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
        <Icon className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
        {label}
      </div>
      <p className="text-xl font-bold text-text-primary tabular-nums">{value}</p>
      {sublabel != null && <p className="text-xs text-text-muted mt-0.5">{sublabel}</p>}
    </div>
  )
  if (href) {
    return (
      <Link
        href={href}
        className="block touch-manipulation focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
      >
        {content}
      </Link>
    )
  }
  return content
}

export default function MassaggiatoreStatistichePage() {
  const { showLoader } = useStaffDashboardGuard('massaggiatore')
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    clientiSeguiti: 0,
    massaggiEseguiti: 0,
    massaggiTotali: 0,
    fattureEmesse: 0,
    appuntamentiOggi: 0,
    appuntamentiSettimana: 0,
  })

  const loadData = useCallback(async () => {
    const profileId = user?.id ?? null
    if (!profileId) return
    setError(null)
    setLoading(true)
    try {
      const [clientiRes, appointmentsRes, paymentsRes, oggiRes, weekRes] = await Promise.all([
        supabase
          .from('staff_atleti')
          .select('id', { count: 'exact', head: true })
          .eq('staff_id', profileId)
          .eq('staff_type', 'massaggiatore')
          .eq('status', 'active'),
        supabase
          .from('appointments')
          .select('id, status')
          .eq('staff_id', profileId)
          .eq('type', 'massaggio'),
        supabase
          .from('payments')
          .select('id', { count: 'exact', head: true })
          .eq('created_by_staff_id', profileId),
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('staff_id', profileId)
          .eq('type', 'massaggio')
          .gte('starts_at', new Date().toISOString().split('T')[0] + 'T00:00:00.000Z')
          .lt(
            'starts_at',
            new Date(Date.now() + 86400000).toISOString().split('T')[0] + 'T00:00:00.000Z',
          )
          .neq('status', 'annullato'),
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('staff_id', profileId)
          .eq('type', 'massaggio')
          .gte('starts_at', new Date().toISOString())
          .lte('starts_at', new Date(Date.now() + 7 * 86400000).toISOString())
          .neq('status', 'annullato'),
      ])

      const clientiSeguiti = clientiRes.count ?? 0
      const appointments = appointmentsRes.data ?? []
      const massaggiEseguiti = appointments.filter((a) => a.status === 'completato').length
      const massaggiTotali = appointments.length
      const fattureEmesse = paymentsRes.count ?? 0
      const appuntamentiOggi = oggiRes.count ?? 0
      const appuntamentiSettimana = weekRes.count ?? 0

      setStats({
        clientiSeguiti,
        massaggiEseguiti,
        massaggiTotali,
        fattureEmesse,
        appuntamentiOggi,
        appuntamentiSettimana,
      })
    } catch (e) {
      logger.error('Errore caricamento statistiche massaggiatore', e)
      setError(e instanceof Error ? e.message : 'Errore nel caricamento')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    void loadData()
  }, [loadData])

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  return (
    <StaffContentLayout
      title="Statistiche"
      description="Clienti, trattamenti eseguiti, fatturazione e appuntamenti."
      icon={<BarChart2 className="w-6 h-6" />}
      theme="amber"
    >
      {error && (
        <div className="rounded-xl border-2 border-red-500/40 bg-red-500/10 px-3 py-2.5 sm:px-4 sm:py-3 text-red-200 text-sm flex items-center justify-between flex-wrap gap-2">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] touch-manipulation shrink-0"
            onClick={() => void loadData()}
          >
            Riprova
          </Button>
        </div>
      )}

      {loading && !error && <StaffStaffPageContentSkeleton />}

      {!loading && !error && (
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <KpiCard
              label="Clienti seguiti"
              value={stats.clientiSeguiti}
              icon={Users}
              href="/dashboard/massaggiatore/appuntamenti"
            />
            <KpiCard
              label="Massaggi eseguiti"
              value={stats.massaggiEseguiti}
              icon={Hand}
              sublabel={`di ${stats.massaggiTotali} totali`}
            />
            <KpiCard
              label="Fatture emesse"
              value={stats.fattureEmesse}
              icon={FileText}
              href="/dashboard/massaggiatore/abbonamenti"
            />
            <KpiCard
              label="Oggi"
              value={stats.appuntamentiOggi}
              icon={CalendarCheck}
              sublabel="appuntamenti"
              href="/dashboard/massaggiatore/appuntamenti"
            />
            <KpiCard
              label="Prossimi 7 giorni"
              value={stats.appuntamentiSettimana}
              icon={Calendar}
              sublabel="appuntamenti"
              href="/dashboard/massaggiatore/calendario"
            />
          </div>

          <div className="rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-background-secondary to-background-tertiary shadow-lg shadow-amber-500/10 px-3 sm:px-4 py-4 sm:py-5 space-y-4">
            <h3 className="font-semibold text-text-primary">Azioni rapide</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/massaggiatore/calendario"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border-2 border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 transition-colors touch-manipulation"
              >
                <Calendar className="h-4 w-4" />
                Calendario
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/massaggiatore/appuntamenti"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border-2 border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 transition-colors touch-manipulation"
              >
                <CalendarCheck className="h-4 w-4" />
                Appuntamenti
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/massaggiatore/chat"
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg border-2 border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 transition-colors touch-manipulation"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </StaffContentLayout>
  )
}
