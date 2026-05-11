// ============================================================
// Componente Card Workout (FASE C - Split File Lunghi)
// ============================================================
// Estratto da schede/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState, type Dispatch, type SetStateAction } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { User, Calendar, Trash2, Goal, ListChecks, Menu, Eye, Pencil, Copy } from 'lucide-react'
import type { Workout } from '@/types/workout'
import { getObjectiveLabel } from '@/lib/constants/workout-objectives'
import { cn } from '@/lib/utils'

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

const workoutActionsMenuTriggerClass =
  'h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 rounded-full border-white/10 bg-background-secondary/40 hover:border-primary/25 hover:bg-primary/10'

interface WorkoutCardActionsMenuProps {
  workout: Workout
  router: ReturnType<typeof useRouter>
  onViewClick: (workout: Workout) => void
  onDuplicateClick?: (workout: Workout) => void | Promise<void>
  onDeleteClick?: (workout: Workout) => void
  isDuplicating: boolean
  setIsDuplicating: Dispatch<SetStateAction<boolean>>
  setDeleteDialogOpen: Dispatch<SetStateAction<boolean>>
}

function WorkoutCardActionsMenu({
  workout,
  router,
  onViewClick,
  onDuplicateClick,
  onDeleteClick,
  isDuplicating,
  setIsDuplicating,
  setDeleteDialogOpen,
}: WorkoutCardActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={workoutActionsMenuTriggerClass}
          aria-label={`Azioni sulla scheda ${workout.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewClick(workout)}>
          <Eye className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Visualizza
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/dashboard/schede/${workout.id}/modifica`)}>
          <Pencil className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          Modifica
        </DropdownMenuItem>
        {onDuplicateClick ? (
          <DropdownMenuItem
            disabled={isDuplicating}
            onClick={() => {
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
            <Copy className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            Duplica
          </DropdownMenuItem>
        ) : null}
        {onDeleteClick ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300 focus-visible:ring-red-500/30"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
              Elimina scheda
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
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

  const renderSessionsPreview = (comfortable: boolean) => {
    if (!sessionsPreview || sessionsPreview.length === 0) return null
    const cellY = comfortable ? 'px-2 py-1 text-xs' : 'px-2 py-1.5 text-xs'
    const headY = comfortable ? 'px-2 py-1 text-[10px]' : 'px-2 py-1.5 text-[11px]'
    const wrapClass = comfortable
      ? 'rounded-lg bg-white/[0.04] ring-1 ring-white/10 p-1.5'
      : 'rounded-md ring-1 ring-white/10'

    return (
      <div className={cn('min-w-0', comfortable ? 'space-y-1 py-0' : 'space-y-2 py-2')}>
        {comfortable ? (
          <p
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary"
            title="Per giorno: sessioni previste nel ciclo vs completate"
          >
            <ListChecks className="h-3.5 w-3.5 shrink-0 text-primary/90" aria-hidden />
            Progresso sessioni
          </p>
        ) : (
          <p className={labelClass}>Sessioni per giorno (obiettivo vs eseguite)</p>
        )}
        <div className={cn('overflow-x-auto', wrapClass)}>
          <table
            className={cn('w-full min-w-[200px] border-collapse text-left tabular-nums text-xs')}
          >
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] uppercase tracking-wide text-text-tertiary">
                <th scope="col" className={cn(headY, 'text-left font-semibold')}>
                  Giorno
                </th>
                <th
                  scope="col"
                  className={cn(headY, 'text-right font-semibold')}
                  title="Sessioni previste nel ciclo corrente"
                >
                  <span className="sm:hidden">Nel ciclo</span>
                  <span className="hidden sm:inline">Previste nel ciclo</span>
                </th>
                <th scope="col" className={cn(headY, 'text-right font-semibold')}>
                  Completate
                </th>
              </tr>
            </thead>
            <tbody>
              {sessionsPreview.map((d) => (
                <tr
                  key={d.workout_day_id ?? `dn-${d.day_number}`}
                  className="border-b border-white/[0.06] last:border-0"
                  title={d.title ?? undefined}
                >
                  <td className={cn(cellY, 'font-medium text-text-primary')}>G{d.day_number}</td>
                  <td className={cn(cellY, 'text-right text-text-primary')}>
                    {d.sessions_until_refresh != null && d.sessions_until_refresh >= 1
                      ? d.sessions_until_refresh
                      : '—'}
                  </td>
                  <td className={cn(cellY, 'text-right font-semibold text-cyan-400/95')}>
                    {d.sessions_completed_count ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const sessionsPreviewBlock = renderSessionsPreview(false)

  if (viewMode === 'list') {
    const sessionsListBlock = renderSessionsPreview(true)
    const metaRow =
      'flex items-center justify-between gap-3 border-b border-white/[0.06] py-1.5 last:border-b-0'
    const metaLabel =
      'flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-text-tertiary'

    return (
      <>
        <Card
          className={cn(cardClass, 'p-3 sm:p-4')}
          onClick={() => onWorkoutClick(workout)}
          role="article"
          aria-label={`Scheda ${workout.name}`}
        >
          <CardContent className="p-0">
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
              <p className="min-w-0 flex-1 pr-2 text-base font-semibold leading-tight text-text-primary sm:text-[1.05rem]">
                <span className="flex flex-wrap items-baseline gap-x-1.5">{titleWithOrder}</span>
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <span className={statusBadgeClass}>{getStatusText(status)}</span>
                <WorkoutCardActionsMenu
                  workout={workout}
                  router={router}
                  onViewClick={onViewClick}
                  onDuplicateClick={onDuplicateClick}
                  onDeleteClick={onDeleteClick}
                  isDuplicating={isDuplicating}
                  setIsDuplicating={setIsDuplicating}
                  setDeleteDialogOpen={setDeleteDialogOpen}
                />
              </div>
            </div>

            <div
              className={cn(
                'mt-3 grid grid-cols-1 items-stretch gap-3 lg:gap-4',
                sessionsListBlock ? 'lg:grid-cols-3' : 'lg:grid-cols-2',
              )}
            >
              <div className="min-w-0 space-y-0 rounded-lg bg-white/[0.02] px-2.5 py-2 ring-1 ring-white/[0.05]">
                <div className={metaRow}>
                  <span className={metaLabel}>
                    <User className="h-3.5 w-3.5 text-primary/80" aria-hidden />
                    Atleta
                  </span>
                  <span
                    className={cn(
                      'min-w-0 truncate text-right text-sm',
                      workout.athlete_name
                        ? 'font-semibold text-cyan-400/95'
                        : 'italic text-text-tertiary',
                    )}
                  >
                    {workout.athlete_name || 'Non assegnata'}
                  </span>
                </div>
                <div className={metaRow}>
                  <span className={metaLabel}>
                    <Goal className="h-3.5 w-3.5 text-primary/80" aria-hidden />
                    Obiettivo
                  </span>
                  <span
                    className={cn(
                      'min-w-0 truncate text-right text-sm',
                      workout.objective ? 'text-text-primary' : 'italic text-text-tertiary',
                    )}
                  >
                    {workout.objective ? getObjectiveLabel(workout.objective) : 'Non indicato'}
                  </span>
                </div>
              </div>

              {sessionsListBlock ? (
                <div className="min-w-0 overflow-x-auto rounded-lg bg-white/[0.02] px-2 py-2 ring-1 ring-white/[0.05]">
                  {sessionsListBlock}
                </div>
              ) : null}

              <div className="min-w-0 space-y-0 rounded-lg bg-white/[0.02] px-2.5 py-2 ring-1 ring-white/[0.05]">
                <div className={metaRow}>
                  <span className={metaLabel}>
                    <Calendar className="h-3.5 w-3.5 text-primary/80" aria-hidden />
                    Creata il
                  </span>
                  <span className="tabular-nums text-right text-sm text-text-primary">
                    {formatDate(workout.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {workout.description && (
              <p className="mt-2 line-clamp-2 rounded-md bg-white/[0.02] px-2 py-1 text-xs leading-snug text-text-tertiary ring-1 ring-white/[0.04]">
                {workout.description}
              </p>
            )}
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
            <div className="flex shrink-0 items-center gap-2">
              <span className={statusBadgeClass}>{getStatusText(status)}</span>
              <WorkoutCardActionsMenu
                workout={workout}
                router={router}
                onViewClick={onViewClick}
                onDuplicateClick={onDuplicateClick}
                onDeleteClick={onDeleteClick}
                isDuplicating={isDuplicating}
                setIsDuplicating={setIsDuplicating}
                setDeleteDialogOpen={setDeleteDialogOpen}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col space-y-0">
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
