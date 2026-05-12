import { Suspense, type ReactNode } from 'react'
import { StaffDashboardSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { WorkoutsShell } from '@/features/staff-workouts'

type Props = {
  children: ReactNode
  slot1: ReactNode
  slot2: ReactNode
}

export default function WorkoutsLayout({ children, slot1, slot2 }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={<StaffDashboardSegmentSkeleton />}>
        <WorkoutsShell slot1={slot1} slot2={slot2} />
        {children}
      </Suspense>
    </div>
  )
}
