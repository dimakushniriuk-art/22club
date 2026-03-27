// ============================================================
// Componente Header Profilo Atleta Home (FASE C - Split File Lunghi)
// ============================================================
// Estratto da home/profilo/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar'
import { AvatarUploader } from '@/components/settings/avatar-uploader'
import { User, Camera } from 'lucide-react'
import { formatSafeDate } from './utils'
import { useRouter } from 'next/navigation'

interface AthleteProfileHeaderHomeProps {
  user: {
    id: string
    nome?: string | null
    cognome?: string | null
    email: string
    phone?: string | null
    avatar_url?: string | null
    avatar?: string | null
    data_iscrizione?: string | null
    created_at?: string | null
  }
  avatarInitials: string
}

export function AthleteProfileHeaderHome({ user, avatarInitials }: AthleteProfileHeaderHomeProps) {
  const router = useRouter()
  const [showUploader, setShowUploader] = useState(false)

  const handleAvatarUploaded = () => {
    // Ricarica la pagina per mostrare il nuovo avatar
    router.refresh()
    setShowUploader(false)
  }

  const cardClass =
    'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.5)] hover:border-white/15 transition-colors duration-200'

  return (
    <Card variant="default" className={`relative overflow-hidden ${cardClass}`}>
      <CardContent className="relative px-4 py-5 sm:p-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5 sm:text-left">
          <div className="relative group shrink-0">
            <Avatar
              src={user.avatar_url || user.avatar}
              alt={`${user.nome} ${user.cognome}`}
              fallbackText={avatarInitials}
              size="xl"
              className="h-[5.25rem] w-[5.25rem] text-2xl ring-2 ring-white/15 shadow-lg sm:h-20 sm:w-20 sm:text-xl"
            />
            <button
              type="button"
              onClick={() => setShowUploader(true)}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-100 transition-opacity duration-200 hover:bg-black/65 active:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation cursor-pointer"
              aria-label="Cambia foto profilo"
            >
              <Camera className="h-5 w-5 text-white drop-shadow-sm" />
            </button>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center sm:items-start">
            <h2 className="max-w-full truncate text-center text-xl font-semibold tracking-tight text-text-primary sm:text-left sm:text-lg min-[834px]:text-xl">
              {user.nome} {user.cognome}
            </h2>
            <p className="text-text-secondary mt-1 flex items-center gap-1.5 text-sm">
              <User className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
              Atleta
            </p>
            <Badge variant="primary" size="sm" className="mt-3 shadow-sm sm:mt-2">
              Membro da {formatSafeDate(user.data_iscrizione || user.created_at)}
            </Badge>
          </div>
        </div>
        {showUploader && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <AvatarUploader userId={user.id} onUploaded={handleAvatarUploaded} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
