'use client'

import { useState, lazy, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { useAthleteProfileData } from '@/hooks/athlete-profile/use-athlete-profile-data'
import { AthleteProfileHeader, AthleteProfileTabs } from '@/components/dashboard/athlete-profile'
import { useAvatarInitials } from '@/components/ui/avatar'
import { useAuth } from '@/providers/auth-provider'
import type { Cliente } from '@/types/cliente'

const ModificaAtletaModal = lazy(() =>
  import('@/components/dashboard/modifica-atleta-modal').then((mod) => ({
    default: mod.ModificaAtletaModal,
  })),
)

function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default function AtletaPage() {
  const params = useParams()
  const router = useRouter()
  const { role } = useAuth()
  const id = typeof params?.id === 'string' ? params.id : null
  const [showModifica, setShowModifica] = useState(false)
  const canEdit = role === 'trainer' || role === 'admin'

  const { athlete, stats, loading, error, athleteUserId, loadAthleteData } = useAthleteProfileData(
    id ?? '',
  )
  const avatarInitials = useAvatarInitials(athlete?.nome ?? '', athlete?.cognome ?? '')

  if (!id) {
    return (
      <div className="p-6">
        <ErrorState
          message="ID atleta mancante"
          onRetry={() => router.push('/dashboard/clienti')}
        />
      </div>
    )
  }

  if (loading && !athlete) {
    return (
      <div className="p-6">
        <LoadingState message="Caricamento profilo atleta..." />
      </div>
    )
  }

  if (error || !athlete) {
    return (
      <div className="p-6">
        <ErrorState
          message={error ?? 'Atleta non trovato'}
          onRetry={() => {
            loadAthleteData()
          }}
        />
      </div>
    )
  }

  const tabStats = {
    allenamenti_totali: stats.allenamenti_totali,
    allenamenti_mese: stats.allenamenti_mese,
    schede_attive: stats.schede_attive,
    documenti_scadenza: stats.documenti_scadenza,
    peso_attuale: stats.peso_attuale,
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
      <AthleteProfileHeader
        athlete={athlete as Cliente}
        athleteId={id}
        stats={{
          ultimo_accesso: athlete.ultimo_accesso ?? null,
          lessons_remaining: stats.lessons_remaining,
        }}
        avatarInitials={avatarInitials}
        onEditClick={() => setShowModifica(true)}
        formatDate={formatDate}
        showEditButton={canEdit}
      />
      <AthleteProfileTabs
        athleteId={id}
        athleteUserId={athleteUserId}
        stats={tabStats}
        onPrefetchTab={() => {}}
      />

      {canEdit && showModifica && (
        <Suspense fallback={<LoadingState message="Caricamento..." />}>
          <ModificaAtletaModal
            open={showModifica}
            onOpenChange={setShowModifica}
            athlete={athlete as Cliente}
            onSuccess={() => {
              loadAthleteData()
              setShowModifica(false)
            }}
          />
        </Suspense>
      )}
    </div>
  )
}
