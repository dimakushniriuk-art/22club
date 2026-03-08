// ============================================================
// Componente Item Appuntamento (FASE C - Split File Lunghi)
// ============================================================
// Estratto da appuntamenti/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar'
import { User, Dumbbell, Edit, Trash2, CheckCircle2, XCircle, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AppointmentTable } from '@/types/appointment'
import { EmailToAthleteModal } from './email-to-athlete-modal'

interface AppointmentItemProps {
  appointment: AppointmentTable
  index: number
  onView: (appointment: AppointmentTable) => void
  onEdit: (appointment: AppointmentTable) => void
  onDelete: (appointment: AppointmentTable) => void
  onComplete: (appointment: AppointmentTable) => void
  onCancel: (appointment: AppointmentTable) => void
  formatDateTime: (isoString: string) => { time: string; dateStr: string }
  getStatusColorClasses: (status: string) => string
  getAppointmentType: (apt: AppointmentTable) => string
  /** Lezioni rimanenti atleta (solo numero in lista) */
  lessonsRemaining?: number
  /** Email atleta (per modal invio email) */
  athleteEmail?: string | null
}

export function AppointmentItem({
  appointment,
  index,
  onView,
  onEdit,
  onDelete,
  onComplete,
  onCancel,
  formatDateTime,
  getStatusColorClasses,
  getAppointmentType,
  lessonsRemaining,
  athleteEmail,
}: AppointmentItemProps) {
  const router = useRouter()
  const [showEmailModal, setShowEmailModal] = useState(false)
  const { time, dateStr } = formatDateTime(appointment.starts_at)
  const { time: endTime } = formatDateTime(appointment.ends_at)
  const status = appointment.status?.toLowerCase() || 'attivo'
  const isActive = status === 'attivo' || status === 'active'
  const statusLabel =
    status === 'completato' || status === 'completed'
      ? 'Completata'
      : status === 'annullato' || status === 'cancelled'
        ? 'Annullata'
        : 'Attiva'
  const statusPillClass = isActive
    ? 'rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-medium px-3 py-1 shrink-0'
    : 'rounded-full bg-background-tertiary/50 border border-white/10 text-text-tertiary text-xs font-medium px-3 py-1 shrink-0'

  const isLocked = status === 'completato' || status === 'annullato'

  return (
    <div
      key={appointment.id}
      className={`group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-lg border ${getStatusColorClasses(appointment.status)}`}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards',
      }}
    >
      <div className="relative flex items-center gap-4 p-4">
        {/* Rimasti - centrato orizzontalmente e verticalmente nella riga */}
        {typeof lessonsRemaining === 'number' && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <span
              className={cn(
                'text-2xl font-bold tabular-nums',
                lessonsRemaining >= 6 && 'text-[#00C781]',
                lessonsRemaining >= 2 &&
                  lessonsRemaining <= 4 &&
                  'text-[#FFC107]',
                lessonsRemaining <= 1 && 'text-[#FF3B30]',
              )}
            >
              {lessonsRemaining}
            </span>
          </div>
        )}

        {/* Time section */}
        <div className="flex min-w-[120px] flex-col items-start">
          <div className="text-text-secondary text-xs mb-1">{dateStr}</div>
          <div className="font-mono text-lg font-bold text-blue-400">
            {time} - {endTime}
          </div>
        </div>

        {/* Separator verticale */}
        <div className="h-12 w-px bg-border/30"></div>

        {/* Content section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex-shrink-0">
              <div className="relative inline-block">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-blue-500/60 via-purple-500/60 to-cyan-500/60 blur-[2px]" />
                <div className="relative">
                  <Avatar
                    src={null}
                    alt={appointment.athlete_name || 'Atleta'}
                    fallbackText={
                      appointment.athlete_name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2) || '?'
                    }
                    size="md"
                  />
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-bold text-text-primary truncate">
                {appointment.athlete_name || 'Atleta'}
              </div>
              <div className="text-sm text-text-secondary truncate">
                {getAppointmentType(appointment)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Status */}
        <div className="relative z-10 flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Segnare questo appuntamento come completato? Verrà scalato un allenamento all\'atleta.')) {
                onComplete(appointment)
              }
            }}
            className="rounded-full p-3 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Segna come completato"
            disabled={isLocked}
          >
            <CheckCircle2 className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Annullare questo appuntamento?')) {
                onCancel(appointment)
              }
            }}
            className="rounded-full p-3 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Annulla appuntamento"
            disabled={isLocked}
          >
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Action Buttons - bloccati se completato/annullato */}
        <div className={cn('relative z-10 flex shrink-0 items-center gap-1.5', isLocked && 'pointer-events-none opacity-60')}>
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              if (appointment.athlete_id) setShowEmailModal(true)
            }}
            className="rounded-full p-3 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Invia email all'atleta"
            disabled={isLocked || !appointment.athlete_id}
          >
            <Mail className="h-5 w-5" />
          </Button>
          {appointment.athlete_id && (
            <EmailToAthleteModal
              open={showEmailModal}
              onOpenChange={setShowEmailModal}
              athleteId={appointment.athlete_id}
              athleteName={appointment.athlete_name || 'Atleta'}
              athleteEmail={athleteEmail}
            />
          )}

          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              if (appointment.athlete_id) {
                router.push(`/dashboard/atleti/${appointment.athlete_id}`)
              } else {
                onView(appointment)
              }
            }}
            className="rounded-full p-3 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Visualizza profilo atleta"
            disabled={isLocked}
          >
            <User className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/dashboard/schede?athlete_id=${appointment.athlete_id}`)
            }}
            className="rounded-full p-3 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Visualizza schede"
            disabled={isLocked}
          >
            <Dumbbell className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(appointment)
            }}
            className="rounded-full p-3 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Modifica appuntamento"
            disabled={isLocked}
          >
            <Edit className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(appointment)
            }}
            className="rounded-full p-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Elimina appuntamento"
            disabled={isLocked}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <span className={statusPillClass}>{statusLabel}</span>
        </div>
      </div>
    </div>
  )
}
