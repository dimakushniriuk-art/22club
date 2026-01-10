'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { FadeIn } from '@/components/ui/animations'

export default function PostLoginPage() {
  const { loading, user, role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Attendi che AuthProvider finisca di caricare
    if (!loading) {
      if (!user || !role) {
        // Se non c'è utente o ruolo, redirect a login
        router.replace('/login')
        return
      }

      // Redirect role-based
      if (role === 'admin') {
        router.replace('/dashboard/admin')
      } else if (role === 'trainer') {
        router.replace('/dashboard')
      } else if (role === 'athlete') {
        router.replace('/home')
      } else {
        // Ruolo non riconosciuto, redirect a login
        router.replace('/login')
      }
    }
  }, [loading, user, role, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-brand/5 animate-pulse-glow" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(2, 179, 191, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(2, 179, 191, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <FadeIn>
        <div className="text-center relative z-10">
          <div className="mb-6 flex justify-center">
            <svg
              className="animate-spin h-12 w-12 text-brand"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Accesso in corso...</h2>
          <p className="text-text-secondary text-sm">Caricamento profilo utente</p>
        </div>
      </FadeIn>
    </div>
  )
}
