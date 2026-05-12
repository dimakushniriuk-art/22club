'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorState } from '@/components/dashboard/error-state'
import { StaffAthleteSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { useAthleteProfileData } from '@/hooks/athlete-profile/use-athlete-profile-data'
import { useResolvedParams } from '@/lib/next/use-resolved-params'
import type { Cliente } from '@/types/cliente'
import {
  formatStaffAthleteDisplayName,
  staffAthleteProgressBasePath,
  staffAthleteProgressTabBackHref,
} from './staff-athlete-progress-paths'

export type StaffAthleteProgressBootstrapStats = {
  allenamenti_totali: number
  allenamenti_mese: number
  schede_attive: number
  documenti_scadenza: number
  ultimo_accesso: string | null
  peso_attuale: number | null
  lessons_remaining: number | null
}

export type StaffAthleteProgressReadyContext = {
  profileId: string
  athlete: Cliente
  athleteUserId: string | null
  stats: StaffAthleteProgressBootstrapStats
  statsError: string | null
  displayName: string
  tabBackHref: string
  progressiBasePath: string
  loadAthleteData: () => void
  loadAthleteStats: () => void
}

type StaffAthleteProgressRouteParams = Promise<{ id: string } & Record<string, string | undefined>>

export function StaffAthleteProgressBootstrap({
  routeParams,
  children,
}: {
  routeParams: StaffAthleteProgressRouteParams
  children: (context: StaffAthleteProgressReadyContext) => ReactNode
}) {
  const resolved = useResolvedParams(routeParams)
  const router = useRouter()
  const profileId = typeof resolved.id === 'string' ? resolved.id : null

  const {
    athlete,
    athleteUserId,
    stats,
    statsError,
    loading,
    error,
    loadAthleteData,
    loadAthleteStats,
  } = useAthleteProfileData(profileId ?? '')

  if (!profileId) {
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

  const displayName = formatStaffAthleteDisplayName(athlete)

  return (
    <>
      {children({
        profileId,
        athlete,
        athleteUserId,
        stats,
        statsError,
        displayName,
        tabBackHref: staffAthleteProgressTabBackHref(profileId),
        progressiBasePath: staffAthleteProgressBasePath(profileId),
        loadAthleteData,
        loadAthleteStats,
      })}
    </>
  )
}
