'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { DashboardMobileNav } from './dashboard-mobile-nav'

// Nessun wrapper motion qui: il passaggio div→motion al mount di framer rimontava sidebar + main.
type Props = {
  role: 'athlete' | 'staff'
  children: React.ReactNode
}

export const RoleLayout: React.FC<Props> = ({ role, children }) => {
  return (
    <div
      className={cn('w-full min-w-0', role === 'staff' && 'flex h-full min-h-0 flex-1 flex-col')}
    >
      <div
        className={cn(
          'flex w-full min-w-0 flex-1 min-h-0 flex-col text-text-primary transition-all duration-300 md:h-full md:flex-row',
        )}
        suppressHydrationWarning
      >
        {role === 'staff' && (
          <>
            <DashboardMobileNav />
            <Sidebar role={role} />
          </>
        )}

        <main
          className={cn(
            'flex flex-1 min-h-0 min-w-0 w-full flex-col bg-transparent md:h-full',
            /* Staff mobile: safe-top è già nell’header di DashboardMobileNav */
            role === 'staff'
              ? 'pt-0 md:pt-[env(safe-area-inset-top,0px)]'
              : 'pt-[env(safe-area-inset-top,0px)]',
          )}
          style={{
            paddingLeft: 'max(0px, env(safe-area-inset-left))',
            paddingRight: 'max(0px, env(safe-area-inset-right))',
          }}
          suppressHydrationWarning
        >
          <div className="flex-1 flex flex-col min-h-0 min-w-0 w-full">
            <div
              className="flex-1 min-h-0 min-w-0 w-full flex flex-col overflow-auto pb-[env(safe-area-inset-bottom,0px)]"
              suppressHydrationWarning
            >
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
