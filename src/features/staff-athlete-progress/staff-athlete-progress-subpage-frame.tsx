'use client'

import type { ReactNode } from 'react'
import {
  StaffAthleteSubpageHeader,
  type StaffAthleteSubpageHeaderProps,
} from '@/components/shared/dashboard/staff-athlete-subpage-header'
import { cn } from '@/lib/utils'

const FRAME_CLASS = {
  default:
    'flex-1 flex flex-col min-h-0 space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full',
  storico:
    'flex w-full flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto',
} as const

export type StaffAthleteProgressSubpageFrameVariant = keyof typeof FRAME_CLASS

export function StaffAthleteProgressSubpageFrame({
  header,
  variant = 'default',
  className,
  children,
}: {
  header: StaffAthleteSubpageHeaderProps
  variant?: StaffAthleteProgressSubpageFrameVariant
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn(FRAME_CLASS[variant], className)}>
      <StaffAthleteSubpageHeader {...header} />
      {children}
    </div>
  )
}
