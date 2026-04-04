'use client'

import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import {
  bodyMetricDeltaSentimentTextColorClass,
  getBodyMetricDeltaSentiment,
} from '@/lib/body-metrics/body-metric-trend-rules'
import { supabase } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input, Label } from '@/components/ui'
import { useToast } from '@/components/ui/toast'

export type WorkoutExerciseSessionRow = {
  date: string
  value: number
  workoutLogId: string | null
  workoutDayExerciseId: string | null
}

function pctVsPrevious(
  current: number,
  previous: number | undefined,
): { pct: number; label: string } | null {
  if (previous === undefined || !Number.isFinite(previous) || previous === 0) return null
  const pct = ((current - previous) / previous) * 100
  if (!Number.isFinite(pct)) return null
  const sign = pct > 0 ? '+' : ''
  const label = `${sign}${pct.toFixed(1).replace('.', ',')}%`
  return { pct, label }
}

function formatDateFull(raw: string) {
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatCellValue(kind: 'weight' | 'reps' | 'time', v: number, valueSuffix: string): string {
  if (kind === 'weight') return `${v.toFixed(1)}${valueSuffix}`
  return `${Math.round(v)}${valueSuffix}`
}

function rowCanEdit(row: WorkoutExerciseSessionRow): boolean {
  return Boolean(row.workoutDayExerciseId && row.workoutDayExerciseId.trim().length > 0)
}

/** RLS su `workout_sets`: l’elimina richiede `workout_log_id` valorizzato sulla riga. */
function rowCanDelete(row: WorkoutExerciseSessionRow): boolean {
  return Boolean(
    row.workoutLogId &&
    row.workoutLogId.trim().length > 0 &&
    row.workoutDayExerciseId &&
    row.workoutDayExerciseId.trim().length > 0,
  )
}

/** Fascia `completed_at` per giorno locale (stessa data `YYYY-MM-DD` del punto). */
function completedAtLocalDayBounds(dateStr: string): { start: string; end: string } {
  const parts = dateStr.split('T')[0]?.split('-').map(Number) ?? []
  const y = parts[0]
  const m = parts[1]
  const d = parts[2]
  if (!y || !m || !d) {
    const t = new Date(dateStr)
    return {
      start: new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0, 0).toISOString(),
      end: new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59, 999).toISOString(),
    }
  }
  return {
    start: new Date(y, m - 1, d, 0, 0, 0, 0).toISOString(),
    end: new Date(y, m - 1, d, 23, 59, 59, 999).toISOString(),
  }
}

/**
 * Lista sessioni come `MisurazioneValoriByDateList`: data, valore, % vs sessione precedente, modifica/elimina su `workout_sets`.
 */
export function WorkoutExerciseSessioniByDateList({
  rows,
  valueSuffix,
  sentimentField,
  metricKind,
  actionsUnlocked,
  athleteUserId,
  exerciseLabel,
}: {
  rows: WorkoutExerciseSessionRow[]
  valueSuffix: string
  sentimentField: string
  metricKind: 'weight' | 'reps' | 'time'
  actionsUnlocked: boolean
  athleteUserId: string | null
  exerciseLabel: string
}) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [editRow, setEditRow] = useState<WorkoutExerciseSessionRow | null>(null)
  const [editText, setEditText] = useState('')
  const [deleteRow, setDeleteRow] = useState<WorkoutExerciseSessionRow | null>(null)
  const [busy, setBusy] = useState(false)

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [rows])

  const invalidate = () => {
    if (athleteUserId) {
      void queryClient.invalidateQueries({ queryKey: ['workout-exercise-stats', athleteUserId] })
    }
  }

  const openEdit = (row: WorkoutExerciseSessionRow) => {
    setEditRow(row)
    if (metricKind === 'weight') {
      setEditText(row.value.toFixed(1))
    } else {
      setEditText(String(Math.round(row.value)))
    }
  }

  const saveEdit = async () => {
    if (!editRow || !rowCanEdit(editRow)) return
    const n = Number.parseFloat(editText.replace(',', '.'))
    if (!Number.isFinite(n)) {
      addToast({
        title: 'Valore non valido',
        message: 'Inserisci un numero valido',
        variant: 'error',
      })
      return
    }
    const patch =
      metricKind === 'weight'
        ? { weight_kg: n }
        : metricKind === 'reps'
          ? { reps: Math.round(n) }
          : { execution_time_sec: Math.round(n) }

    setBusy(true)
    try {
      const wde = editRow.workoutDayExerciseId!.trim()
      let query = supabase.from('workout_sets').update(patch).eq('workout_day_exercise_id', wde)
      if (editRow.workoutLogId && editRow.workoutLogId.trim().length > 0) {
        query = query.eq('workout_log_id', editRow.workoutLogId.trim())
      } else {
        const { start, end } = completedAtLocalDayBounds(editRow.date)
        query = query.gte('completed_at', start).lte('completed_at', end)
      }
      const { error } = await query.not('completed_at', 'is', null)
      if (error) throw new Error(error.message)
      addToast({
        title: 'Salvato',
        message: 'Serie aggiornate per questa sessione',
        variant: 'success',
      })
      setEditRow(null)
      invalidate()
    } catch (e) {
      addToast({
        title: 'Errore',
        message: e instanceof Error ? e.message : 'Operazione fallita',
        variant: 'error',
      })
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteRow || !rowCanDelete(deleteRow)) return
    setBusy(true)
    try {
      const { error } = await supabase
        .from('workout_sets')
        .delete()
        .eq('workout_log_id', deleteRow.workoutLogId!.trim())
        .eq('workout_day_exercise_id', deleteRow.workoutDayExerciseId!.trim())
      if (error) throw new Error(error.message)
      addToast({ title: 'Eliminato', message: 'Serie della sessione rimosse', variant: 'success' })
      setDeleteRow(null)
      invalidate()
    } catch (e) {
      addToast({
        title: 'Errore',
        message: e instanceof Error ? e.message : 'Eliminazione fallita',
        variant: 'error',
      })
    } finally {
      setBusy(false)
    }
  }

  if (sorted.length === 0) {
    return <p className="text-text-tertiary text-sm py-8 text-center">Nessun valore registrato.</p>
  }

  const inputStep = metricKind === 'weight' ? '0.1' : '1'

  return (
    <>
      <ul className="space-y-3">
        {sorted.map((row, index) => {
          const older = sorted[index + 1]
          const delta = pctVsPrevious(row.value, older?.value)
          const canEdit = rowCanEdit(row)
          const canDelete = rowCanDelete(row)
          return (
            <li
              key={`${row.date}-${row.workoutLogId ?? 'nolog'}-${row.workoutDayExerciseId ?? 'nowde'}-${index}`}
              className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 min-[834px]:px-4"
            >
              <span className="text-text-secondary text-sm capitalize min-w-0 text-left">
                {formatDateFull(row.date)}
              </span>
              <span className="text-text-primary font-semibold tabular-nums text-center px-1">
                {formatCellValue(metricKind, row.value, valueSuffix)}
              </span>
              <div className="flex items-center justify-end gap-2 min-w-0">
                {delta ? (
                  <span
                    className={`text-sm font-medium tabular-nums shrink-0 ${bodyMetricDeltaSentimentTextColorClass(
                      getBodyMetricDeltaSentiment(sentimentField, delta.pct),
                    )}`}
                    title={
                      older
                        ? `Rispetto alla sessione precedente (${formatDateFull(older.date)}): ${delta.label}`
                        : undefined
                    }
                  >
                    {delta.label}
                  </span>
                ) : (
                  <span className="text-text-tertiary text-sm tabular-nums shrink-0">—</span>
                )}
                {actionsUnlocked && (
                  <div className="flex items-center gap-1 border-l border-white/10 pl-2 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-primary disabled:opacity-40"
                      disabled={!canEdit}
                      title={
                        canEdit
                          ? `Modifica valore ${exerciseLabel}`
                          : 'Manca lo slot esercizio (workout_day_exercise): modifica non disponibile'
                      }
                      aria-label={`Modifica valore ${exerciseLabel}`}
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-red-400 hover:text-red-300 disabled:opacity-40"
                      disabled={!canDelete}
                      title={
                        canDelete
                          ? `Elimina serie sessione ${exerciseLabel}`
                          : 'Eliminazione non disponibile senza sessione log collegata (workout_log_id)'
                      }
                      aria-label={`Elimina serie sessione ${exerciseLabel}`}
                      onClick={() => setDeleteRow(row)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <Dialog open={editRow !== null} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica {exerciseLabel}</DialogTitle>
            <DialogDescription>
              Data: {editRow ? formatDateFull(editRow.date) : ''}. Il valore verrà applicato a tutte
              le serie di questa sessione per l&apos;esercizio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="wo-ex-val">
              Valore (
              {valueSuffix.trim() ||
                (metricKind === 'weight' ? 'kg' : metricKind === 'reps' ? 'reps' : 's')}
              )
            </Label>
            <Input
              id="wo-ex-val"
              type="number"
              inputMode="decimal"
              step={inputStep}
              value={editText}
              onChange={(ev) => setEditText(ev.target.value)}
              className="max-w-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRow(null)} disabled={busy}>
              Annulla
            </Button>
            <Button onClick={() => void saveEdit()} disabled={busy} loading={busy}>
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteRow !== null} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare le serie di questa sessione?</AlertDialogTitle>
            <AlertDialogDescription>
              Verranno rimosse tutte le serie registrate per {exerciseLabel} nella sessione del{' '}
              {deleteRow ? formatDateFull(deleteRow.date) : ''}. Azione irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              className="border-red-500/80 bg-red-600 text-white hover:bg-red-500"
              onClick={() => void confirmDelete()}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
