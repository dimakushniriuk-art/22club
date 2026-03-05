'use client'

import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { X } from 'lucide-react'

/** Banner fisso in alto quando l'admin sta impersonando un utente */
export function ImpersonationBanner() {
  const { isImpersonating, effectiveProfile } = useAuth()
  const [stopping, setStopping] = useState(false)

  if (!isImpersonating || !effectiveProfile) return null

  const maskedLabel = effectiveProfile.full_name
    ? `${effectiveProfile.full_name.slice(0, 2)}***`
    : effectiveProfile.email
      ? `${effectiveProfile.email.slice(0, 3)}***`
      : 'Utente'

  const handleStop = async () => {
    setStopping(true)
    try {
      const res = await fetch('/api/admin/impersonation/stop', {
        method: 'POST',
        credentials: 'include',
      })
      if (res.ok) {
        window.location.href = '/dashboard/admin'
      }
    } finally {
      setStopping(false)
    }
  }

  return (
    <div
      className="sticky top-0 z-50 w-full bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 flex items-center justify-between gap-2 text-amber-200"
      role="banner"
    >
      <span className="text-sm font-medium">Impersonation: {maskedLabel}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStop}
        disabled={stopping}
        className="border-amber-500/50 text-amber-200 hover:bg-amber-500/20"
      >
        <X className="h-4 w-4 mr-1" />
        {stopping ? 'Stop...' : 'Stop impersonation'}
      </Button>
    </div>
  )
}
