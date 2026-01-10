'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { ModificaAtletaModal } from '@/components/dashboard/modifica-atleta-modal'
import { useAvatarInitials } from '@/components/ui/avatar'
import { useAthleteProfileData } from '@/hooks/athlete-profile/use-athlete-profile-data'
import { useAthleteTabPrefetch } from '@/hooks/athlete-profile/use-athlete-tab-prefetch'
import { AthleteProfileHeader } from '@/components/dashboard/athlete-profile/athlete-profile-header'
import { AthleteProfileTabs } from '@/components/dashboard/athlete-profile/athlete-profile-tabs'

export default function AthleteProfilePage() {
  // Estrai immediatamente il valore per evitare enumerazione di params (Next.js 15.5.9+)
  // Non memorizzare l'oggetto params per evitare enumerazione durante la serializzazione di React DevTools
  // Accedi direttamente alle proprietà senza memorizzare l'oggetto
  const athleteId = String(useParams().id || '')
  const [showEditModal, setShowEditModal] = useState(false)

  const { athlete, stats, loading, error, athleteUserId, loadAthleteData, loadAthleteStats } =
    useAthleteProfileData(athleteId)

  const { handlePrefetchTab } = useAthleteTabPrefetch(athleteUserId)

  const avatarInitials = useAvatarInitials(athlete?.nome || '', athlete?.cognome || '')

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  if (loading) {
    return <LoadingState message="Caricamento profilo atleta..." />
  }

  if (error || !athlete) {
    return (
      <div className="p-6">
        <ErrorState
          message={error || 'Atleta non trovato'}
          onRetry={() => {
            loadAthleteData()
          }}
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative">
        <AthleteProfileHeader
          athlete={athlete}
          athleteId={athleteId}
          stats={stats}
          avatarInitials={avatarInitials}
          onEditClick={() => setShowEditModal(true)}
          formatDate={formatDate}
        />

        {/* Tabs per sezioni dettaglio */}
        <Card
          variant="trainer"
          className="relative overflow-hidden border-teal-500/20 hover:border-teal-400/50 transition-all duration-200 !bg-transparent"
        >
          <CardContent className="p-6 relative z-10">
            <AthleteProfileTabs
              athleteId={athleteId}
              athleteUserId={athleteUserId}
              stats={stats}
              onPrefetchTab={handlePrefetchTab}
            />
          </CardContent>
        </Card>

        {/* Modal Modifica Atleta */}
        {athlete && (
          <ModificaAtletaModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            athlete={athlete}
            onSuccess={() => {
              // Ricarica i dati dell'atleta dopo la modifica
              loadAthleteData()
              loadAthleteStats()
            }}
          />
        )}
      </div>
    </div>
  )
}
