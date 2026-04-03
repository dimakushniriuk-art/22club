'use client'

import { AthleteWorkoutsTab } from '@/components/dashboard/athlete-profile/athlete-workouts-tab'
import { useStoricoAtleta } from '../storico-atleta-context'

export default function StaffAtletaStoricoSessioniApertePage() {
  const { athleteProfileId, displayName, schedeAttive } = useStoricoAtleta()

  return (
    <AthleteWorkoutsTab
      hubSection="sessioni-aperte"
      athleteId={athleteProfileId}
      schedeAttive={schedeAttive}
      athleteDisplayName={displayName || undefined}
    />
  )
}
