'use client'

import Link from 'next/link'
import { useResolvedParams } from '@/lib/next/use-resolved-params'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { useStaffDashboardGuard } from '@/hooks/use-staff-dashboard-guard'
import { useMassaggiatoreClienteDetail } from '@/hooks/use-massaggiatore-cliente-detail'
import { useAuth } from '@/hooks/use-auth'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffDashboardGuardSkeleton } from '@/components/layout/route-loading-skeletons'
import { Button } from '@/components/ui'

export function MassaggiatoreClienteDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolved = useResolvedParams(params)
  const id = typeof resolved.id === 'string' ? resolved.id : null
  const { showLoader } = useStaffDashboardGuard('massaggiatore')
  const { user } = useAuth()
  const {
    profile,
    accessMode,
    loading,
    error: loadError,
  } = useMassaggiatoreClienteDetail(user?.id, id)

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
