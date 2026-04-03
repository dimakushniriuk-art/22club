import { Suspense, type ReactNode } from 'react'
import { StaffDashboardSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { WorkoutsShell } from '@/app/dashboard/workouts/_components/workouts-shell'

type Props = {
  children: ReactNode
  slot1: ReactNode
  slot2: ReactNode
}

export default function WorkoutsLayout({ children, slot1, slot2 }: Props) {
  return (
    <Suspense fallback={<StaffDashboardSegmentSkeleton />}>
      <WorkoutsShell slot1={slot1} slot2={slot2} />
      {children}
    </Suspense>
  )
}
