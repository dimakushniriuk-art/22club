// ============================================================
// Componente Item Appuntamento (FASE C - Split File Lunghi)
// ============================================================
// Estratto da appuntamenti/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar'
import { User, Dumbbell, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import type { AppointmentTable } from '@/types/appointment'

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
}: AppointmentItemProps) {
  const router = useRouter()
  const { time, dateStr } = formatDateTime(appointment.starts_at)
  const { time: endTime } = formatDateTime(appointment.ends_at)

  return (
    <div
      key={appointment.id}
      className={`group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-lg border ${getStatusColorClasses(appointment.status)}`}
      style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards',
      }}
    >
      <div className="flex items-center gap-4 p-4">
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
        <div className="flex-shrink-0 flex items-center gap-1.5">
          <Button
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('Segnare questo appuntamento come completato?')) {
                onComplete(appointment)
              }
            }}
            className="rounded-full p-3 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Segna come completato"
            disabled={appointment.status === 'completato' || appointment.status === 'annullato'}
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
            disabled={appointment.status === 'completato' || appointment.status === 'annullato'}
          >
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex items-center gap-1.5">
          <Button
            variant="ghost"
            onClick={() => onView(appointment)}
            className="rounded-full p-3 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Visualizza dettagli"
          >
            <User className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              router.push(`/dashboard/schede?athlete_id=${appointment.athlete_id}`)
            }}
            className="rounded-full p-3 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Visualizza schede"
          >
            <Dumbbell className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            onClick={() => onEdit(appointment)}
            className="rounded-full p-3 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Modifica appuntamento"
          >
            <Edit className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            onClick={() => {
              if (confirm('Sei sicuro di voler eliminare questo appuntamento?')) {
                onDelete(appointment)
              }
            }}
            className="rounded-full p-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200 flex items-center justify-center flex-shrink-0"
            title="Elimina appuntamento"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
