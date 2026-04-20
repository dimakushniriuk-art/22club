'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'
import { Button } from '@/components/ui'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:dashboard:massaggiatore:clienti:detail')

type ProfileView = {
  id: string
  nome: string | null
  cognome: string | null
  email: string | null
  phone: string | null
  role: string | null
  created_at: string | null
}

export default function MassaggiatoreClienteProfiloPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : null
  const { showLoader } = useStaffDashboardGuard('massaggiatore')
  const { user } = useAuth()
  const supabase = useSupabaseClient()
  const [profile, setProfile] = useState<ProfileView | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  /** Cliente già in staff_atleti attivo, oppure solo invito email in attesa da parte tua. */
  const [accessMode, setAccessMode] = useState<'active' | 'pending_invite' | null>(null)

  const load = useCallback(async () => {
    const staffId = user?.id ?? null
    if (!staffId || !id) {
      setLoading(false)
      return
    }
    setLoadError(null)
    setLoading(true)
    setAccessMode(null)
    try {
      const { data: link, error: linkErr } = await supabase
        .from('staff_atleti')
        .select('id')
        .eq('staff_id', staffId)
        .eq('atleta_id', id)
        .eq('staff_type', 'massaggiatore')
        .eq('status', 'active')
        .maybeSingle()

      if (linkErr) {
        setLoadError(linkErr.message)
        setProfile(null)
        return
      }

      if (link) {
        setAccessMode('active')
      } else {
        const { data: inv, error: invErr } = await supabase
          .from('inviti_cliente')
          .select('id')
          .eq('staff_id', staffId)
          .eq('atleta_id', id)
          .eq('stato', 'in_attesa')
          .maybeSingle()

        if (invErr || !inv) {
          setLoadError(
            'Cliente non trovato: non risulti collegato né hai un invito in attesa per questo profilo.',
          )
          setProfile(null)
          return
        }
        setAccessMode('pending_invite')
      }

      const { data: p, error: pErr } = await supabase
        .from('profiles')
        .select('id, nome, cognome, email, phone, role, created_at')
        .eq('id', id)
        .maybeSingle()

      if (pErr || !p) {
        setLoadError('Impossibile caricare il profilo.')
        setProfile(null)
        return
      }

      setProfile(p as ProfileView)
    } catch (e) {
      logger.error('Profilo cliente massaggiatore', e)
      setLoadError(e instanceof Error ? e.message : 'Errore')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id, id, supabase])

  useEffect(() => {
    void load()
  }, [load])

  if (showLoader) {
    return <StaffDashboardGuardSkeleton />
  }

  const displayName =
    profile != null
      ? [profile.nome, profile.cognome].filter(Boolean).join(' ').trim() || 'Cliente'
      : 'Cliente'

  return (
    <StaffContentLayout
      title={loading ? 'Profilo cliente' : displayName}
      description={
        accessMode === 'pending_invite'
          ? 'Invito inviato: in attesa di accettazione in Home da parte del cliente.'
          : 'Dati anagrafici del cliente collegato a te.'
      }
      theme="teal"
      actions={
        <Button variant="outline" size="sm" className="min-h-[44px]" asChild>
          <Link href="/dashboard/massaggiatore/clienti" prefetch>
            <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" aria-hidden />
            Lista clienti
          </Link>
        </Button>
      }
    >
      {loadError && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
          {loadError}
        </div>
      )}

      {loading && !loadError ? (
        <div className="h-40 animate-pulse rounded-xl border border-white/5 bg-white/[0.04]" />
      ) : null}

      {!loading && profile && accessMode === 'pending_invite' && (
        <div
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-100/95"
          role="status"
        >
          Stato: <strong>invito in attesa</strong> — il cliente deve accettare (o rifiutare) dalla
          propria Home. Chat e altre funzioni possono restare limitate finché non accetta.
        </div>
      )}

      {!loading && profile && (
        <div className="space-y-4 rounded-xl border border-white/10 bg-black/25 p-4 sm:p-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-text-secondary">Nome</dt>
              <dd className="font-medium text-text-primary">{profile.nome ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Cognome</dt>
              <dd className="font-medium text-text-primary">{profile.cognome ?? '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-text-secondary">Email</dt>
              <dd className="font-medium text-text-primary break-all">{profile.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Telefono</dt>
              <dd className="font-medium text-text-primary">{profile.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Ruolo account</dt>
              <dd className="font-medium text-text-primary">{profile.role ?? '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-text-secondary">Profilo creato</dt>
              <dd className="text-text-primary">
                {profile.created_at ? new Date(profile.created_at).toLocaleString('it-IT') : '—'}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="primary" size="sm" className="min-h-[44px]" asChild>
              <Link
                href={`/dashboard/massaggiatore/chat?with=${encodeURIComponent(profile.id)}`}
                prefetch
              >
                <MessageSquare className="mr-1.5 h-4 w-4" />
                Apri chat
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="min-h-[44px]" asChild>
              <Link href="/dashboard/massaggiatore/calendario" prefetch>
                Calendario
              </Link>
            </Button>
          </div>
        </div>
      )}
    </StaffContentLayout>
  )
}
