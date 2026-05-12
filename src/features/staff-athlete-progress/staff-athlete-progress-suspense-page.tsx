'use client'

import { Suspense, type ReactNode } from 'react'
import { StaffAthleteSegmentSkeleton } from '@/components/layout/route-loading-skeletons'

export function StaffAthleteProgressSuspensePage<T extends { id: string }>({
  params,
  children,
}: {
  params: Promise<T>
  children: (props: { routeParams: Promise<T> }) => ReactNode
}) {
  return (
    <Suspense fallback={<StaffAthleteSegmentSkeleton />}>
      {children({ routeParams: params })}
    </Suspense>
  )
}
