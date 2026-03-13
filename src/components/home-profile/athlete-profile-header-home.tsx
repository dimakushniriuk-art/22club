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
    'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-white/20 transition-all duration-200'

  return (
    <Card variant="default" className={`relative overflow-hidden ${cardClass}`}>
      <CardContent className="relative p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <Avatar
              src={user.avatar_url || user.avatar}
              alt={`${user.nome} ${user.cognome}`}
              fallbackText={avatarInitials}
              size="xl"
              className="ring-2 ring-white/10"
            />
            <button
              onClick={() => setShowUploader(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full cursor-pointer"
              aria-label="Cambia foto profilo"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-text-primary">
              {user.nome} {user.cognome}
            </h2>
            <p className="text-text-secondary text-sm flex items-center gap-1.5 mt-0.5">
              <User className="h-3.5 w-3.5 shrink-0" />
              Atleta
            </p>
            <Badge variant="primary" size="sm" className="mt-2">
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
