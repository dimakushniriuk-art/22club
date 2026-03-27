'use client'

import { createContext, useContext, type ReactNode } from 'react'

/**
 * true nelle sotto-route /home/* (non sulla dashboard /home): PageHeaderFixed e header
 * fissi simili devono stare sotto la brand bar del layout e non duplicare safe-area top.
 */
const HomeAthleteStackHeadersContext = createContext(false)

export function HomeAthleteStackHeadersProvider({
  value,
  children,
}: {
  value: boolean
  children: ReactNode
}) {
  return (
    <HomeAthleteStackHeadersContext.Provider value={value}>
      {children}
    </HomeAthleteStackHeadersContext.Provider>
  )
}

export function useStackAthletePageHeaderBelowBrand(): boolean {
  return useContext(HomeAthleteStackHeadersContext)
}
