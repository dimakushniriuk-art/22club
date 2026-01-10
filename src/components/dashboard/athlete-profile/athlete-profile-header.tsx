// ============================================================
// Componente Header Profilo Atleta (FASE C - Split File Lunghi)
// ============================================================
// Estratto da atleti/[id]/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
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
} from 'lucide-react'
import type { Cliente } from '@/types/cliente'

interface AthleteProfileHeaderProps {
  athlete: Cliente
  athleteId: string
  stats: {
    ultimo_accesso: string | null
  }
  avatarInitials: string
  onEditClick: () => void
  formatDate: (dateString: string | null) => string
}

export function AthleteProfileHeader({
  athlete,
  athleteId,
  stats,
  avatarInitials,
  onEditClick,
  formatDate,
}: AthleteProfileHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/clienti">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-teal-500/10 hover:text-teal-400 transition-colors"
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
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/atleti/${athleteId}/chat`}>
            <Button
              variant="outline"
              size="sm"
              className="border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
          </Link>
          <Button
            onClick={onEditClick}
            size="sm"
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Button>
        </div>
      </div>

      {/* Card profilo principale */}
      <div className="relative overflow-hidden border-teal-500/20 hover:border-teal-400/50 transition-all duration-200 !bg-transparent rounded-lg border p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
          {/* Avatar con bordo sfumato */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-teal-500/60 via-cyan-500/60 to-teal-500/60 blur-md opacity-75" />
            <div className="relative">
              <Avatar
                src={athlete.avatar_url}
                alt={`${athlete.nome} ${athlete.cognome}`}
                fallbackText={avatarInitials}
                size="xl"
                className="ring-2 ring-teal-500/30 shadow-xl"
              />
            </div>
          </div>

          {/* Informazioni principali */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="text-text-primary text-2xl sm:text-3xl font-bold">
                {athlete.nome} {athlete.cognome}
              </h2>
              <Badge
                variant={athlete.stato === 'attivo' ? 'success' : 'warning'}
                size="sm"
                className="shadow-lg"
              >
                {athlete.stato === 'attivo' ? (
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                )}
                {athlete.stato.charAt(0).toUpperCase() + athlete.stato.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-teal-500/10">
                <div className="bg-teal-500/20 text-teal-400 rounded-lg p-2">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-text-secondary text-xs mb-0.5">Email</p>
                  <p className="text-text-primary text-sm font-medium truncate">{athlete.email}</p>
                </div>
              </div>

              {athlete.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-teal-500/10">
                  <div className="bg-cyan-500/20 text-cyan-400 rounded-lg p-2">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-text-secondary text-xs mb-0.5">Telefono</p>
                    <p className="text-text-primary text-sm font-medium">{athlete.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg border border-teal-500/10">
                <div className="bg-teal-500/20 text-teal-400 rounded-lg p-2">
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
                <div className="flex items-center gap-3 p-3 rounded-lg border border-teal-500/10">
                  <div className="bg-cyan-500/20 text-cyan-400 rounded-lg p-2">
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
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
