'use client'

import { createContext, useContext, type ReactNode } from 'react'

export type AthleteAllenamentiPreviewValue = {
  /** profiles.id dell'atleta di cui si mostra la vista (embed / preview trainer). */
  subjectProfileId: string
  /** Base path senza slash finale, es. `/embed/athlete-allenamenti/{uuid}`. */
  pathBase: string
}

const AthleteAllenamentiPreviewContext = createContext<AthleteAllenamentiPreviewValue | null>(null)

export function AthleteAllenamentiPreviewProvider({
  value,
  children,
}: {
  value: AthleteAllenamentiPreviewValue
  children: ReactNode
}) {
  return (
    <AthleteAllenamentiPreviewContext.Provider value={value}>
      {children}
    </AthleteAllenamentiPreviewContext.Provider>
  )
}

/** Contesto preview embed: null fuori da `/embed/athlete-allenamenti/...`. */
export function useAthleteAllenamentiPreviewOptional(): AthleteAllenamentiPreviewValue | null {
  return useContext(AthleteAllenamentiPreviewContext)
}

export function useAthleteAllenamentiPaths() {
  const ctx = useContext(AthleteAllenamentiPreviewContext)
  const pathBase = ctx?.pathBase ?? '/home/allenamenti'
  const subjectProfileId = ctx?.subjectProfileId ?? null
  const isPreview = ctx != null
  return { pathBase, subjectProfileId, isPreview }
}
