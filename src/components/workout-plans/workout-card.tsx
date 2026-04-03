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
  onDuplicateClick?: (workout: Workout) => void | Promise<void>
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
  onDuplicateClick,
  getStatusColor,
  getStatusText,
  formatDate,
}: WorkoutCardProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const status = workout.status ?? 'attivo'
  const statusColor = getStatusColor(status)
  const isBozza = status === 'bozza' || status === 'draft'
  const actionButtonCount = 2 + (onDuplicateClick ? 1 : 0) + (onDeleteClick ? 1 : 0)
  const actionGridClass =
    actionButtonCount >= 4
      ? 'grid grid-cols-2 gap-2 pt-3 w-full min-w-0 sm:grid-cols-4'
      : actionButtonCount === 3
        ? 'grid grid-cols-3 gap-2 pt-3 w-full min-w-0'
        : 'grid grid-cols-2 gap-2 pt-3 w-full min-w-0'

  const statusBadgeClass =
    statusColor === 'success'
      ? 'rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-2.5 py-0.5 shrink-0'
      : isBozza || statusColor === 'warning'
        ? 'rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-medium px-2.5 py-0.5 shrink-0'
        : 'rounded-md bg-white/5 border border-white/10 text-text-tertiary text-xs font-medium px-2.5 py-0.5 shrink-0'

  const cardClass =
    'group relative overflow-hidden cursor-pointer rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 sm:p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/20'
  const iconClass = 'h-4 w-4 shrink-0 text-text-tertiary'
  const labelClass = 'text-xs text-text-tertiary font-medium'
  const valueClass = 'text-sm text-text-primary'
  const actionBtnBaseClass =
    'min-w-0 w-full min-h-[44px] sm:min-h-0 whitespace-nowrap justify-center'

  const creationNum = workout.creation_order_number
  const titleWithOrder = (
    <>
      {typeof creationNum === 'number' && (
        <span className="tabular-nums text-text-tertiary font-medium">#{creationNum}</span>
      )}
      {typeof creationNum === 'number' && <span className="text-text-tertiary/80"> · </span>}
      <span className="min-w-0">{workout.name}</span>
    </>
  )

  const sessionsPreview = workout.workout_days_sessions_preview
  const sessionsPreviewBlock =
    sessionsPreview && sessionsPreview.length > 0 ? (
      <div className="min-w-0 space-y-2 py-2">
        <p className={labelClass}>Sessioni per giorno (obiettivo vs eseguite)</p>
        <div className="overflow-x-auto rounded-md ring-1 ring-white/10">
          <table className="w-full min-w-[200px] border-collapse text-left text-xs tabular-nums">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-[11px] uppercase tracking-wide text-text-tertiary">
                <th className="px-2 py-1.5 font-medium">Giorno</th>
                <th className="px-2 py-1.5 text-right font-medium">Previste</th>
                <th className="px-2 py-1.5 text-right font-medium">Eseguite</th>
              </tr>
            </thead>
            <tbody>
              {sessionsPreview.map((d) => (
                <tr
                  key={d.workout_day_id ?? `dn-${d.day_number}`}
                  className="border-b border-white/[0.06] last:border-0"
                  title={d.title ?? undefined}
                >
                  <td className="px-2 py-1.5 text-text-primary">G{d.day_number}</td>
                  <td className="px-2 py-1.5 text-right text-text-primary">
                    {d.sessions_until_refresh != null && d.sessions_until_refresh >= 1
                      ? d.sessions_until_refresh
                      : '—'}
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium text-cyan-400/95">
                    {d.sessions_completed_count ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : null

  if (viewMode === 'list') {
    return (
      <>
        <Card className={cardClass} onClick={() => onWorkoutClick(workout)}>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-4">
                <div>
                  <p className="flex flex-wrap items-baseline gap-x-1.5 text-base font-semibold text-text-primary underline decoration-border underline-offset-2">
                    {titleWithOrder}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <span className={labelClass}>Assegnata a</span>
                    <span className={`${valueClass} text-right`}>
                      {workout.athlete_name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className={labelClass}>Obiettivo</span>
                    <span className={`${valueClass} text-right`}>
                      {workout.objective ? getObjectiveLabel(workout.objective) : '—'}
                    </span>
                  </div>
                </div>
                {sessionsPreviewBlock && (
                  <div className="border-t border-white/10">{sessionsPreviewBlock}</div>
                )}
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
                    <span className={`${valueClass} text-right`}>
                      {formatDate(workout.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <span className={statusBadgeClass}>{getStatusText(status)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                className={actionBtnBaseClass}
                onClick={(e) => {
                  e.stopPropagation()
                  onViewClick(workout)
                }}
              >
                Visualizza
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={actionBtnBaseClass}
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/dashboard/schede/${workout.id}/modifica`)
                }}
              >
                Modifica
              </Button>
              {onDuplicateClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={actionBtnBaseClass}
                  disabled={isDuplicating}
                  onClick={(e) => {
                    e.stopPropagation()
                    void (async () => {
                      setIsDuplicating(true)
                      try {
                        await onDuplicateClick(workout)
                      } finally {
                        setIsDuplicating(false)
                      }
                    })()
                  }}
                >
                  Duplica
                </Button>
              )}
              {onDeleteClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${actionBtnBaseClass} text-red-400 hover:text-red-300 hover:bg-red-500/10`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
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
      <Card className={`${cardClass} h-full flex flex-col`} onClick={() => onWorkoutClick(workout)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle
              size="sm"
              className="line-clamp-2 text-base font-semibold text-text-primary underline decoration-border underline-offset-2"
            >
              <span className="flex flex-wrap items-baseline gap-x-1.5">{titleWithOrder}</span>
            </CardTitle>
            <span className={statusBadgeClass}>{getStatusText(status)}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end space-y-0">
          <div className="space-y-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Goal className={iconClass} />
              <span
                className={`text-sm line-clamp-1 ${workout.objective ? 'text-text-primary' : 'text-text-tertiary italic'}`}
              >
                {workout.objective
                  ? getObjectiveLabel(workout.objective)
                  : 'Obiettivo non specificato'}
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
              <span
                className={`text-sm line-clamp-1 font-bold ${workout.athlete_name ? 'text-cyan-400' : 'text-text-tertiary font-normal italic'}`}
              >
                {workout.athlete_name || '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className={iconClass} />
              <span className="text-sm text-text-tertiary">{formatDate(workout.created_at)}</span>
            </div>
          </div>
          {sessionsPreviewBlock && (
            <div className="border-b border-white/10">{sessionsPreviewBlock}</div>
          )}
          {workout.description && (
            <p className="text-text-tertiary line-clamp-2 text-xs py-2">{workout.description}</p>
          )}
          <div className={actionGridClass}>
            <Button
              variant="outline"
              size="sm"
              className={actionBtnBaseClass}
              onClick={(e) => {
                e.stopPropagation()
                onViewClick(workout)
              }}
            >
              Visualizza
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={actionBtnBaseClass}
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/dashboard/schede/${workout.id}/modifica`)
              }}
            >
              Modifica
            </Button>
            {onDuplicateClick && (
              <Button
                variant="ghost"
                size="sm"
                className={actionBtnBaseClass}
                disabled={isDuplicating}
                onClick={(e) => {
                  e.stopPropagation()
                  void (async () => {
                    setIsDuplicating(true)
                    try {
                      await onDuplicateClick(workout)
                    } finally {
                      setIsDuplicating(false)
                    }
                  })()
                }}
              >
                Duplica
              </Button>
            )}
            {onDeleteClick && (
              <Button
                variant="ghost"
                size="sm"
                className={`${actionBtnBaseClass} text-red-400 hover:text-red-300 hover:bg-red-500/10`}
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
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
