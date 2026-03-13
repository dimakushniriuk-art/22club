// ============================================================
// Componente Card Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da schede/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { User, Target, Calendar, Trash2, Goal } from 'lucide-react'
import type { Workout } from '@/types/workout'
import { getObjectiveLabel } from '@/lib/constants/workout-objectives'

interface WorkoutCardProps {
  workout: Workout
  viewMode?: 'grid' | 'list'
  onWorkoutClick: (workout: Workout) => void
  onViewClick: (workout: Workout) => void
  onDeleteClick?: (workout: Workout) => void
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
  formatDate: (dateString: string) => string
}

export function WorkoutCard({
  workout,
  viewMode = 'grid',
  onWorkoutClick,
  onViewClick,
  onDeleteClick,
  getStatusColor,
  getStatusText,
  formatDate,
}: WorkoutCardProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const statusColor = getStatusColor(workout.status || 'attivo')
  const isActive = statusColor === 'success'
  const statusBadgeClass = isActive
    ? 'rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-2.5 py-0.5 shrink-0'
    : 'rounded-md bg-white/5 border border-white/10 text-text-tertiary text-xs font-medium px-2.5 py-0.5 shrink-0'

  const cardClass =
    'group relative overflow-hidden cursor-pointer rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/20'
  const iconClass = 'h-4 w-4 shrink-0 text-text-tertiary'
  const labelClass = 'text-xs text-text-tertiary font-medium'
  const valueClass = 'text-sm text-text-primary'

  if (viewMode === 'list') {
    return (
      <>
        <Card
          className={cardClass}
          onClick={() => onWorkoutClick(workout)}
        >
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-4">
                <div>
                  <p className="text-base font-semibold text-text-primary underline decoration-border underline-offset-2">
                    {workout.name}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className={labelClass}>Assegnata a</span>
                    <span className={`${valueClass} text-right`}>{workout.athlete_name || '—'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className={labelClass}>Obiettivo</span>
                    <span className={`${valueClass} text-right`}>
                      {workout.objective ? getObjectiveLabel(workout.objective) : '—'}
                    </span>
                  </div>
                </div>
                {workout.description && (
                  <p className="text-sm text-text-tertiary line-clamp-2">{workout.description}</p>
                )}
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className={labelClass}>Creata da</span>
                    <span className={`${valueClass} text-right`}>{workout.staff_name || '—'}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className={labelClass}>Data</span>
                    <span className={`${valueClass} text-right`}>{formatDate(workout.created_at)}</span>
                  </div>
                  <div className="flex justify-end">
                    <span className={statusBadgeClass}>{getStatusText(workout.status || 'attivo')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onViewClick(workout) }}>
                Visualizza
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/schede/${workout.id}/modifica`) }}>
                Modifica
              </Button>
              {onDeleteClick && (
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); setDeleteDialogOpen(true) }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        {onDeleteClick && (
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title="Elimina scheda"
            description={`Sei sicuro di voler eliminare la scheda "${workout.name}"? Questa azione non può essere annullata.`}
            confirmText="Elimina"
            cancelText="Annulla"
            variant="destructive"
            loading={isDeleting}
            onConfirm={async () => {
              setIsDeleting(true)
              try {
                await onDeleteClick(workout)
                setDeleteDialogOpen(false)
              } finally {
                setIsDeleting(false)
              }
            }}
          />
        )}
      </>
    )
  }

  return (
    <>
      <Card
        className={`${cardClass} h-full flex flex-col`}
        onClick={() => onWorkoutClick(workout)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle size="sm" className="line-clamp-2 text-base font-semibold text-text-primary underline decoration-border underline-offset-2">
              {workout.name}
            </CardTitle>
            <span className={statusBadgeClass}>{getStatusText(workout.status || 'attivo')}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end space-y-0">
          <div className="space-y-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Goal className={iconClass} />
              <span className={`text-sm line-clamp-1 ${workout.objective ? 'text-text-primary' : 'text-text-tertiary italic'}`}>
                {workout.objective ? getObjectiveLabel(workout.objective) : 'Obiettivo non specificato'}
              </span>
            </div>
          </div>
          <div className="space-y-2 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Target className={iconClass} />
              <span className={valueClass}>{workout.staff_name || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className={iconClass} />
              <span className={valueClass}>{workout.athlete_name || '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className={iconClass} />
              <span className="text-sm text-text-tertiary">{formatDate(workout.created_at)}</span>
            </div>
          </div>
          {workout.description && (
            <p className="text-text-tertiary line-clamp-2 text-xs py-2">{workout.description}</p>
          )}
          <div className="flex gap-2 pt-3">
            <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onViewClick(workout) }}>
              Visualizza
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/schede/${workout.id}/modifica`) }}>
              Modifica
            </Button>
            {onDeleteClick && (
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); setDeleteDialogOpen(true) }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {onDeleteClick && (
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Elimina scheda"
          description={`Sei sicuro di voler eliminare la scheda "${workout.name}"? Questa azione non può essere annullata.`}
          confirmText="Elimina"
          cancelText="Annulla"
          variant="destructive"
          loading={isDeleting}
          onConfirm={async () => {
            setIsDeleting(true)
            try {
              await onDeleteClick(workout)
              setDeleteDialogOpen(false)
            } finally {
              setIsDeleting(false)
            }
          }}
        />
      )}
    </>
  )
}
