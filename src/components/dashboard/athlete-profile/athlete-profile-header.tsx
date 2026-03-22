// ============================================================
// Componente Header Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  MessageSquare,
  Edit,
  CheckCircle,
  AlertCircle,
  Dumbbell,
} from 'lucide-react'
import type { Cliente } from '@/types/cliente'

const DS_CARD =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)]'

interface AthleteProfileHeaderProps {
  athlete: Cliente
  athleteId: string
  stats: {
    ultimo_accesso: string | null
    /** Lezioni rimanenti (lesson_counters). Opzionale. */
    lessons_remaining?: number | null
  }
  avatarInitials: string
  onEditClick: () => void
  formatDate: (dateString: string | null) => string
  /** Se false, nasconde il pulsante Modifica (es. nutrizionista/massaggiatore in sola lettura). Default true. */
  showEditButton?: boolean
}

export function AthleteProfileHeader({
  athlete,
  athleteId,
  stats,
  avatarInitials,
  onEditClick,
  formatDate,
  showEditButton = true,
}: AthleteProfileHeaderProps) {
  const lessonsRemaining = stats.lessons_remaining ?? 0
  const kpiTone = lessonsRemaining === 0 ? 'neutral' : 'positive'

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clienti">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Profilo Atleta
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Dettagli completi e statistiche di {athlete.nome} {athlete.cognome}
            </p>
            <div className="mt-2 h-[3px] w-28 rounded-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/chat?with=${athleteId}`}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border border-white/10 text-text-primary hover:border-primary/20 hover:bg-white/[0.04] transition"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
          </Link>
          {showEditButton && (
            <Button variant="default" onClick={onEditClick} size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Modifica
            </Button>
          )}
        </div>
      </div>

      {/* Card profilo principale */}
      <div className={`relative overflow-hidden ${DS_CARD} p-6 sm:p-8`}>
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 min-[834px]:h-24 min-[834px]:w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
              <Avatar
                src={athlete.avatar_url}
                alt={`${athlete.nome} ${athlete.cognome}`}
                fallbackText={avatarInitials}
                size="xl"
                className="h-full w-full ring-0 border-0 rounded-full"
              />
            </div>
          </div>

          {/* Informazioni principali */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary">
                  {athlete.nome} {athlete.cognome}
                </h2>
                <div className="mt-2 h-[3px] w-28 rounded-full bg-gradient-to-r from-primary via-primary/60 to-transparent" />
              </div>
              {athlete.stato === 'attivo' ? (
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold bg-emerald-500/14 text-emerald-300 border border-emerald-500/22 shadow-[0_0_18px_rgba(16,185,129,0.16)]">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Attivo
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold bg-amber-500/14 text-amber-300 border border-amber-500/22">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {athlete.stato.charAt(0).toUpperCase() + athlete.stato.slice(1)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-text-secondary text-xs mb-0.5">Email</p>
                  <p className="text-text-primary text-sm font-medium truncate">{athlete.email}</p>
                </div>
              </div>

              {athlete.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-text-secondary text-xs mb-0.5">Telefono</p>
                    <p className="text-text-primary text-sm font-medium">{athlete.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-text-secondary text-xs mb-0.5">Iscritto dal</p>
                  <p className="text-text-primary text-sm font-medium">
                    {formatDate(athlete.data_iscrizione)}
                  </p>
                </div>
              </div>

              {stats.ultimo_accesso && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-text-secondary text-xs mb-0.5">Ultimo accesso</p>
                    <p className="text-text-primary text-sm font-medium">
                      {formatDate(stats.ultimo_accesso)}
                    </p>
                  </div>
                </div>
              )}

              {stats.lessons_remaining !== undefined && stats.lessons_remaining !== null && (
                <div
                  className={
                    kpiTone === 'positive'
                      ? 'flex items-center gap-3 p-4 rounded-lg border border-white/10 bg-white/[0.04]'
                      : 'flex items-center gap-3 p-4 rounded-lg border border-white/10 bg-white/[0.02]'
                  }
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-primary">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-text-tertiary mb-0.5 font-medium">
                      Allenamenti pagati rimanenti
                    </p>
                    <p
                      className={`text-4xl md:text-5xl font-extrabold tracking-tight tabular-nums text-text-primary ${kpiTone === 'positive' ? 'text-primary' : ''}`}
                    >
                      {stats.lessons_remaining}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
