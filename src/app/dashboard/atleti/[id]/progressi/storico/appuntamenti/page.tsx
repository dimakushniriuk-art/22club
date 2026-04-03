'use client'

import { AthleteWorkoutsTab } from '@/components/dashboard/athlete-profile/athlete-workouts-tab'
import { useStoricoAtleta } from '../storico-atleta-context'

export default function StaffAtletaStoricoAppuntamentiPage() {
  const { athleteProfileId, displayName, schedeAttive } = useStoricoAtleta()

  return (
    <AthleteWorkoutsTab
      hubSection="appuntamenti"
      athleteId={athleteProfileId}
      schedeAttive={schedeAttive}
      athleteDisplayName={displayName || undefined}
    />
  )
}
