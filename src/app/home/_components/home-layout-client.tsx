'use client'

import { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/shared/ui/error-boundary'
import { LogoRefresh } from '@/components/athlete/logo-refresh'
import { NotificationToast } from '@/components/shared/ui/notification-toast'

interface HomeLayoutClientProps {
  children: ReactNode
}

/** Client Component wrapper per il layout home */
export function HomeLayoutClient({ children }: HomeLayoutClientProps) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-black/80 border-b border-teal-500/20">
        <div className="flex items-center justify-between px-4 py-3">
          <LogoRefresh />
          <div className="flex-1" />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 bg-black">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      {/* Notifications */}
      <NotificationToast />
    </div>
  )
}
