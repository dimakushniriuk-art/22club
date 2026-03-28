'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type AthleteTopBarConfig = {
  title: string
  subtitle?: string
  backHref?: string
  onBack?: () => void
  icon?: ReactNode
  /** Seconda riga sotto titolo/logo (es. selettore destinatari chat) */
  secondaryRow?: ReactNode
}

type AthleteTopBarContextValue = {
  config: AthleteTopBarConfig | null
  setConfig: (next: AthleteTopBarConfig | null) => void
}

export const AthleteTopBarContext = createContext<AthleteTopBarContextValue | null>(null)

export function AthleteTopBarProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AthleteTopBarConfig | null>(null)
  const value = useMemo(() => ({ config, setConfig }), [config, setConfig])
  return <AthleteTopBarContext.Provider value={value}>{children}</AthleteTopBarContext.Provider>
}

export function useAthleteTopBarConfig(): AthleteTopBarConfig | null {
  return useContext(AthleteTopBarContext)?.config ?? null
}

export function useAthleteTopBarSetter() {
  const ctx = useContext(AthleteTopBarContext)
  return (next: AthleteTopBarConfig | null) => {
    ctx?.setConfig(next)
  }
}
