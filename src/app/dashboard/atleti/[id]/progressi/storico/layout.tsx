'use client'

import { useParams, useRouter } from 'next/navigation'
import { StaffAthleteSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { StaffAthleteSubpageHeader } from '@/components/shared/dashboard/staff-athlete-subpage-header'
import { ErrorState } from '@/components/dashboard/error-state'
import { useAthleteProfileData } from '@/hooks/athlete-profile/use-athlete-profile-data'
import { StoricoAtletaProvider } from './storico-atleta-context'

export default function StoricoAllenamentiLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : null

  const { athlete, stats, loading, error, loadAthleteData } = useAthleteProfileData(id ?? '')

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
    return <StaffAthleteSegmentSkeleton />
  }

  if (error || !athlete) {
    return (
      <div className="p-6">
        <ErrorState message={error ?? 'Atleta non trovato'} onRetry={() => loadAthleteData()} />
      </div>
    )
  }

  const backHref = `/dashboard/atleti/${id}?tab=progressi`
  const name = [athlete.nome, athlete.cognome].filter(Boolean).join(' ').trim()

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
      <StaffAthleteSubpageHeader
        backHref={backHref}
        backAriaLabel="Torna ai progressi"
        title={`Allenamenti e storico — ${name || 'Atleta'}`}
        description="Panoramica, schede, sessioni, appuntamenti e storico completati."
      />

      <StoricoAtletaProvider
        value={{
          athleteProfileId: id,
          displayName: name,
          schedeAttive: stats.schede_attive,
        }}
      >
        {children}
      </StoricoAtletaProvider>
    </div>
  )
}
