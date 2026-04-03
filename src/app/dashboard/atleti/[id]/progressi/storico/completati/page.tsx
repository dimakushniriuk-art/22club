'use client'

import { AthleteWorkoutsTab } from '@/components/dashboard/athlete-profile/athlete-workouts-tab'
import { useStoricoAtleta } from '../storico-atleta-context'

export default function StaffAtletaStoricoCompletatiPage() {
  const { athleteProfileId, displayName, schedeAttive } = useStoricoAtleta()

  return (
    <AthleteWorkoutsTab
      hubSection="completati"
      athleteId={athleteProfileId}
      schedeAttive={schedeAttive}
      athleteDisplayName={displayName || undefined}
    />
  )
}
