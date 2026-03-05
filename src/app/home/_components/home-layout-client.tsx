'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { ErrorBoundary } from '@/components/shared/ui/error-boundary'
import { LogoRefresh } from '@/components/athlete/logo-refresh'
import { NotificationToast } from '@/components/shared/ui/notification-toast'

interface HomeLayoutClientProps {
  children: ReactNode
}

/** Banner periodo di prova per atleti con stato trial */
function TrialBanner() {
  const { user, role } = useAuth()
  if (role !== 'athlete' || user?.stato !== 'trial') return null
  return (
    <div
      className="shrink-0 border-b border-primary/30 bg-primary/10 px-3 py-2 text-center text-sm text-primary"
      role="status"
    >
      <span className="font-medium">Periodo di prova</span>
      {' — '}
      <Link href="/home/profilo" className="underline hover:no-underline">
        Completa il profilo
      </Link>
    </div>
  )
}

/** Client Component wrapper per il layout home */
export function HomeLayoutClient({ children }: HomeLayoutClientProps) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      {/* Header fisso in alto — area di lavoro min atleta 393×852px */}
      <header
        className="sticky top-0 z-50 shrink-0 safe-area-inset-top backdrop-blur-xl"
        style={{
          borderBottom: '1px solid rgba(2, 179, 191, 0.35)',
          background: 'linear-gradient(180deg, rgba(16,16,18,0.92) 0%, rgba(16,16,18,0.85) 100%)',
          boxShadow: '0 1px 0 0 rgba(2,179,191,0.08)',
        }}
      >
        <div className="flex items-center justify-between px-3 sm:px-4 min-[834px]:px-6 py-2.5 sm:py-3 min-[834px]:py-3">
          <LogoRefresh />
          <div className="flex-1" />
        </div>
      </header>

      <TrialBanner />

      {/* Main: area scrollabile + eventuale footer fisso gestiti dalla pagina */}
      <main className="relative z-10 flex min-h-0 flex-1 flex-col bg-background">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      {/* Notifications */}
      <NotificationToast />
    </div>
  )
}
