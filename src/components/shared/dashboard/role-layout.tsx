'use client'
import React from 'react'
import { Sidebar } from './sidebar'
import { DashboardMobileNav } from './dashboard-mobile-nav'

// Nessun wrapper motion qui: il passaggio div→motion al mount di framer rimontava sidebar + main.
type Props = {
  role: 'athlete' | 'staff'
  children: React.ReactNode
}

export const RoleLayout: React.FC<Props> = ({ role, children }) => {
  return (
    <div className="w-full min-w-0">
      <div
        className="flex flex-col md:flex-row min-h-screen w-full min-w-0 text-text-primary transition-all duration-300"
        suppressHydrationWarning
      >
        {role === 'staff' && (
          <>
            <DashboardMobileNav />
            <Sidebar role={role} />
          </>
        )}

        <main
          className="flex-1 flex flex-col min-h-0 min-w-0 w-full pt-[env(safe-area-inset-top,0px)] bg-transparent"
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
