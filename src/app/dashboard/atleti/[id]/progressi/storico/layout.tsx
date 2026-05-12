'use client'

import {
  StaffAthleteProgressBootstrap,
  StaffAthleteProgressSubpageFrame,
} from '@/features/staff-athlete-progress'
import { StoricoAtletaProvider } from './storico-atleta-context'

export default function StoricoAllenamentiLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  return (
    <StaffAthleteProgressBootstrap routeParams={params}>
      {({ profileId, displayName, stats, tabBackHref }) => (
        <StaffAthleteProgressSubpageFrame
          variant="storico"
          header={{
            backHref: tabBackHref,
            backAriaLabel: 'Torna ai progressi',
            title: `Allenamenti e storico — ${displayName || 'Atleta'}`,
            description: 'Panoramica, schede, sessioni, appuntamenti e storico completati.',
          }}
        >
          <StoricoAtletaProvider
            value={{
              athleteProfileId: profileId,
              displayName,
              schedeAttive: stats.schede_attive,
            }}
          >
            {children}
          </StoricoAtletaProvider>
        </StaffAthleteProgressSubpageFrame>
      )}
    </StaffAthleteProgressBootstrap>
  )
}
