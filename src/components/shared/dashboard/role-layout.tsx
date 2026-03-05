'use client'
import React from 'react'
import { Sidebar } from './sidebar'
import { DashboardMobileNav } from './dashboard-mobile-nav'
import { TransitionWrapper, FadeInWrapper } from '@/components/shared/ui/transition-wrapper'

type Props = {
  role: 'athlete' | 'staff'
  children: React.ReactNode
}

export const RoleLayout: React.FC<Props> = ({ role, children }) => {
  return (
    <TransitionWrapper className="w-full min-w-0">
      <div
        className="flex flex-col md:flex-row min-h-screen w-full min-w-0 bg-background text-text-primary transition-all duration-300"
        suppressHydrationWarning
      >
        {role === 'staff' && (
          <>
            <DashboardMobileNav />
            <FadeInWrapper delay={0.1}>
              <Sidebar role={role} />
            </FadeInWrapper>
          </>
        )}

        <main
          className="flex-1 flex flex-col min-h-0 min-w-0 w-full pt-[env(safe-area-inset-top,0px)]"
          style={{ paddingLeft: 'max(0px, env(safe-area-inset-left))', paddingRight: 'max(0px, env(safe-area-inset-right))' }}
          suppressHydrationWarning
        >
          <FadeInWrapper delay={0.2} className="flex-1 flex flex-col min-h-0 min-w-0 w-full">
            <div
              className="flex-1 min-h-0 min-w-0 w-full flex flex-col overflow-auto pb-[env(safe-area-inset-bottom,0px)]"
              suppressHydrationWarning
            >
              {children}
            </div>
          </FadeInWrapper>
        </main>
      </div>
    </TransitionWrapper>
  )
}
