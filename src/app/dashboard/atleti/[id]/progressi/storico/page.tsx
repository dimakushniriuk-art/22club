'use client'

import { AthleteWorkoutsTab } from '@/components/dashboard/athlete-profile/athlete-workouts-tab'
import { useStoricoAtleta } from './storico-atleta-context'

export default function StaffAtletaProgressiStoricoPage() {
  const { athleteProfileId, displayName, schedeAttive } = useStoricoAtleta()

  return (
    <AthleteWorkoutsTab
      hubSection="overview"
      athleteId={athleteProfileId}
      schedeAttive={schedeAttive}
      athleteDisplayName={displayName || undefined}
    />
  )
}
