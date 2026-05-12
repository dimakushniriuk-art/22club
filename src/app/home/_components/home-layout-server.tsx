import type { ReactNode } from 'react'
import { loadHomeAthleteSsrBootstrap } from '@/lib/auth/home-athlete-ssr'
import HomeLayoutAuth from './home-layout-auth'
import { HomeAthleteSsrHydrator } from './home-athlete-ssr-hydrator'

export default async function HomeLayoutServer({
  children,
}: {
  children: ReactNode
}) {
  const { profile } = await loadHomeAthleteSsrBootstrap()

  return (
    <>
      <HomeAthleteSsrHydrator profile={profile} />
      <HomeLayoutAuth>{children}</HomeLayoutAuth>
    </>
  )
}
