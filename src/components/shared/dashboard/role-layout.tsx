'use client'
import React from 'react'
import { Sidebar } from './sidebar'
import { TransitionWrapper, FadeInWrapper } from '@/components/shared/ui/transition-wrapper'

type Props = {
  role: 'atleta' | 'staff'
  children: React.ReactNode
}

export const RoleLayout: React.FC<Props> = ({ role, children }) => {
  return (
    <TransitionWrapper>
      <div
        className="flex min-h-screen bg-background text-text-primary transition-all duration-300"
        suppressHydrationWarning
      >
        {role === 'staff' && (
          <FadeInWrapper delay={0.1}>
            <Sidebar role={role} />
          </FadeInWrapper>
        )}

        <main className="flex-1 flex flex-col min-h-0" suppressHydrationWarning>
          {/* Main Content - KPI gestite direttamente dalle pagine children */}
          <FadeInWrapper delay={0.2}>
            <div className="flex-1 overflow-auto" suppressHydrationWarning>
              {children}
            </div>
          </FadeInWrapper>
        </main>
      </div>
    </TransitionWrapper>
  )
}
