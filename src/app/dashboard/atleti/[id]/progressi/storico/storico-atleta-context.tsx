'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface StoricoAtletaContextValue {
  athleteProfileId: string
  displayName: string
  schedeAttive: number
}

const StoricoAtletaContext = createContext<StoricoAtletaContextValue | null>(null)

export function useStoricoAtleta() {
  const v = useContext(StoricoAtletaContext)
  if (!v) {
    throw new Error('useStoricoAtleta deve essere usato dentro il layout di /progressi/storico')
  }
  return v
}

export function StoricoAtletaProvider({
  value,
  children,
}: {
  value: StoricoAtletaContextValue
  children: ReactNode
}) {
  return <StoricoAtletaContext.Provider value={value}>{children}</StoricoAtletaContext.Provider>
}
