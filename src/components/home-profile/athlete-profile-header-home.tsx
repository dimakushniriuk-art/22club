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

  return (
    <Card
      variant="default"
      className="relative border-teal-500/30 bg-transparent [background-image:none!important]"
    >
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar
                src={user.avatar_url || user.avatar}
                alt={`${user.nome} ${user.cognome}`}
                fallbackText={avatarInitials}
                size="xl"
                className="ring-2 ring-teal-500/30"
              />
              <button
                onClick={() => setShowUploader(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full cursor-pointer"
                aria-label="Cambia foto profilo"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>
            <div>
              <h1 className="text-text-primary text-2xl font-bold text-white">
                {user.nome} {user.cognome}
              </h1>
              <p className="text-text-secondary flex items-center gap-2">
                <User className="h-4 w-4" />
                Atleta
              </p>
              <Badge variant="primary" size="sm" className="mt-1">
                Membro da {formatSafeDate(user.data_iscrizione || user.created_at)}
              </Badge>
            </div>
          </div>
        </div>
        {showUploader && (
          <div className="mt-4 pt-4 border-t border-teal-500/20">
            <AvatarUploader userId={user.id} onUploaded={handleAvatarUploaded} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
