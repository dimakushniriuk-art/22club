// ============================================================
// Componente Header Profilo Atleta Home (FASE C - Split File Lunghi)
// ============================================================
// Estratto da home/profilo/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar'
import { AvatarUploader } from '@/components/settings/avatar-uploader'
import { Calendar, Camera, Mail, Phone, User } from 'lucide-react'
import { formatSafeDate } from './utils'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/user'

const ROLE_LABEL: Record<UserRole, string> = {
  athlete: 'Atleta',
  trainer: 'Personal trainer',
  admin: 'Amministratore',
  marketing: 'Marketing',
  nutrizionista: 'Nutrizionista',
  massaggiatore: 'Massaggiatore',
}

function statoDisplay(stato: string | null | undefined): { label: string; className: string } | null {
  if (stato == null || stato === '') return null
  const s = stato.toLowerCase()
  const map: Record<string, { label: string; className: string }> = {
    trial: {
      label: 'Prova',
      className:
        'border-amber-500/25 bg-amber-500/12 text-amber-200',
    },
    attivo: {
      label: 'Attivo',
      className:
        'border-emerald-500/25 bg-emerald-500/12 text-emerald-200',
    },
    sospeso: {
      label: 'Sospeso',
      className: 'border-amber-500/25 bg-amber-500/10 text-amber-100',
    },
    archiviato: {
      label: 'Archiviato',
      className: 'border-white/15 bg-white/[0.06] text-text-secondary',
    },
  }
  return map[s] ?? {
    label: stato.charAt(0).toUpperCase() + stato.slice(1),
    className: 'border-white/15 bg-white/[0.06] text-text-secondary',
  }
}

interface AthleteProfileHeaderHomeProps {
  user: {
    id: string
    nome?: string | null
    cognome?: string | null
    full_name?: string | null
    email: string
    phone?: string | null
    role?: UserRole
    stato?: string | null
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
    router.refresh()
    setShowUploader(false)
  }

  const cardClass =
    'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.5)] hover:border-white/15 transition-colors duration-200'

  const displayName = useMemo(() => {
    const fromParts = [user.nome, user.cognome].filter(Boolean).join(' ').trim()
    if (fromParts) return fromParts
    const fn = user.full_name?.trim()
    if (fn) return fn
    return user.email
  }, [user.nome, user.cognome, user.full_name, user.email])

  const memberSince = user.data_iscrizione ?? user.created_at ?? null
  const statoChip = statoDisplay(user.stato)
  const roleLabel = ROLE_LABEL[user.role ?? 'athlete']

  return (
    <Card variant="default" className={cn('relative overflow-hidden p-0', cardClass)}>
      <CardContent className="relative px-4 py-5 sm:px-5 sm:py-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-5 sm:text-left">
          <div className="relative h-[5.25rem] w-[5.25rem] shrink-0 sm:h-20 sm:w-20">
            <Avatar
              src={user.avatar_url || user.avatar}
              alt={displayName}
              fallbackText={avatarInitials}
              size="xl"
              className="h-full w-full min-h-0 min-w-0 text-2xl ring-2 ring-white/15 shadow-lg sm:text-xl"
            />
            <button
              type="button"
              onClick={() => setShowUploader(true)}
              className="absolute bottom-1 left-1/2 z-10 flex min-h-[44px] min-w-[44px] -translate-x-1/2 touch-manipulation items-end justify-center border-0 bg-transparent px-3 pb-1 pt-3 text-cyan-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] transition-colors hover:text-cyan-200 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:bottom-0.5 sm:px-2 sm:pb-0.5 sm:pt-2"
              aria-label="Cambia foto profilo"
            >
              <Camera className="h-5 w-5 shrink-0 sm:h-[1.2rem] sm:w-[1.2rem]" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center sm:items-stretch">
            <h2 className="max-w-full truncate text-center text-xl font-semibold tracking-tight text-text-primary sm:text-left sm:text-lg min-[834px]:text-xl">
              {displayName}
            </h2>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <p className="flex items-center gap-1.5 text-sm text-text-secondary">
                <User className="h-3.5 w-3.5 shrink-0 text-text-tertiary" aria-hidden />
                {roleLabel}
              </p>
              {statoChip != null ? (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                    statoChip.className,
                  )}
                >
                  {statoChip.label}
                </span>
              ) : null}
            </div>
            <a
              href={`mailto:${user.email}`}
              className="mt-3 flex max-w-full items-center gap-2 text-sm text-text-secondary transition-colors hover:text-cyan-300"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-text-tertiary" aria-hidden />
              <span className="min-w-0 truncate">{user.email}</span>
            </a>
            {user.phone?.trim() ? (
              <a
                href={`tel:${user.phone.replace(/\s/g, '')}`}
                className="mt-2 flex max-w-full items-center gap-2 text-sm text-text-secondary transition-colors hover:text-cyan-300"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-text-tertiary" aria-hidden />
                <span className="min-w-0 truncate">{user.phone.trim()}</span>
              </a>
            ) : null}
            <div className="mt-3 flex items-start gap-2 text-sm text-text-secondary">
              <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-tertiary" aria-hidden />
              <span>
                Membro dal{' '}
                <span className="font-medium text-text-primary">{formatSafeDate(memberSince)}</span>
              </span>
            </div>
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
