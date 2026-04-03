'use client'

import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/components/ui'
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
import { useToast } from '@/components/ui/toast'
import { supabase } from '@/lib/supabase/client'
import { bodyMetricDeltaSentimentTextColorClass, getBodyMetricDeltaSentiment } from '@/lib/body-metrics/body-metric-trend-rules'
import {
  type MisurazioneLogListItem,
  getProgressLogsDbColumnForMisurazioneField,
} from '@/lib/progressi/misurazione-progress-log-row'
import type { Database } from '@/lib/supabase/types'

type ProgressLogsUpdate = Database['public']['Tables']['progress_logs']['Update']

async function patchLogValue(
  logId: string,
  misurazioneField: string,
  value: number,
  variant: 'athlete' | 'staff',
) {
  const dbCol = getProgressLogsDbColumnForMisurazioneField(misurazioneField)
  if (!dbCol) {
    throw new Error('Campo non supportato')
  }
  const patchPayload: ProgressLogsUpdate = { [dbCol]: value } as ProgressLogsUpdate
  if (misurazioneField === 'coscia_media_cm') {
    patchPayload.thighs_cm = value
  }

  if (variant === 'athlete') {
    const { error } = await supabase.from('progress_logs').update(patchPayload).eq('id', logId)
    if (error) {
      throw new Error(error.message)
    }
    return
  }

  const res = await fetch(`/api/staff/progress-logs/${logId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ misurazioneField, value }),
  })
  const j = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) {
    throw new Error(typeof j.error === 'string' ? j.error : 'Aggiornamento non riuscito')
  }
}

async function deleteLogRow(logId: string, variant: 'athlete' | 'staff') {
  if (variant === 'athlete') {
    const { error } = await supabase.from('progress_logs').delete().eq('id', logId)
    if (error) {
      throw new Error(error.message)
    }
    return
  }
  const res = await fetch(`/api/staff/progress-logs/${logId}`, { method: 'DELETE' })
  const j = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) {
    throw new Error(typeof j.error === 'string' ? j.error : 'Eliminazione non riuscita')
  }
}

export function MisurazioneValoriByDateList({
  rows,
  valueSuffix,
  actionsUnlocked,
  variant,
  misurazioneField,
  analyticsUserId,
  misurazioneLabel,
}: {
  rows: MisurazioneLogListItem[]
  valueSuffix: string
  actionsUnlocked: boolean
  variant: 'athlete' | 'staff'
  misurazioneField: string
  analyticsUserId: string | undefined
  misurazioneLabel: string
}) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [editRow, setEditRow] = useState<MisurazioneLogListItem | null>(null)
  const [editText, setEditText] = useState('')
  const [deleteRow, setDeleteRow] = useState<MisurazioneLogListItem | null>(null)
  const [busy, setBusy] = useState(false)

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [rows])

  const formatDateFull = (raw: string) => {
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    return d.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const pctVsPrevious = (
    current: number,
    previous: number | undefined,
  ): { pct: number; label: string } | null => {
    if (previous === undefined || !Number.isFinite(previous) || previous === 0) return null
    const pct = ((current - previous) / previous) * 100
    if (!Number.isFinite(pct)) return null
    const sign = pct > 0 ? '+' : ''
    const label = `${sign}${pct.toFixed(1).replace('.', ',')}%`
    return { pct, label }
  }

  const invalidate = () => {
    if (analyticsUserId) {
      void queryClient.invalidateQueries({ queryKey: ['progress-analytics', analyticsUserId] })
    }
  }

  const openEdit = (row: MisurazioneLogListItem) => {
    setEditRow(row)
    setEditText(String(row.value))
  }

  const saveEdit = async () => {
    if (!editRow) return
    const n = Number.parseFloat(editText.replace(',', '.'))
    if (!Number.isFinite(n)) {
      addToast({ title: 'Valore non valido', message: 'Inserisci un numero valido', variant: 'error' })
      return
    }
    setBusy(true)
    try {
      await patchLogValue(editRow.logId, misurazioneField, n, variant)
      addToast({ title: 'Salvato', message: 'Valore aggiornato', variant: 'success' })
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
    if (!deleteRow) return
    setBusy(true)
    try {
      await deleteLogRow(deleteRow.logId, variant)
      addToast({ title: 'Eliminato', message: 'Misurazione rimossa', variant: 'success' })
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

  return (
    <>
      <ul className="space-y-3">
        {sorted.map((row, index) => {
          const older = sorted[index + 1]
          const delta = pctVsPrevious(row.value, older?.value)
          return (
            <li
              key={row.logId}
              className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 min-[834px]:px-4"
            >
              <span className="text-text-secondary text-sm capitalize min-w-0 text-left">
                {formatDateFull(row.date)}
              </span>
              <span className="text-text-primary font-semibold tabular-nums text-center px-1">
                {row.value.toFixed(1)}
                {valueSuffix}
              </span>
              <div className="flex items-center justify-end gap-2 min-w-0">
                {delta ? (
                  <span
                    className={`text-sm font-medium tabular-nums shrink-0 ${bodyMetricDeltaSentimentTextColorClass(
                      getBodyMetricDeltaSentiment(misurazioneField, delta.pct),
                    )}`}
                    title={
                      older
                        ? `Rispetto al precedente (${formatDateFull(older.date)}): ${delta.label}`
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
                      className="h-8 w-8 text-primary"
                      aria-label={`Modifica valore ${misurazioneLabel}`}
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                      aria-label={`Elimina misurazione ${misurazioneLabel}`}
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
            <DialogTitle>Modifica {misurazioneLabel}</DialogTitle>
            <DialogDescription>
              Data: {editRow ? formatDateFull(editRow.date) : ''}. Aggiorna il valore nel registro
              misurazione.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="mis-val">Valore ({valueSuffix.trim() || '—'})</Label>
            <Input
              id="mis-val"
              type="number"
              inputMode="decimal"
              step="0.1"
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
            <AlertDialogTitle>Eliminare questa misurazione?</AlertDialogTitle>
            <AlertDialogDescription>
              Verrà eliminato l&apos;intero record del {deleteRow ? formatDateFull(deleteRow.date) : ''}{' '}
              (tutti i valori salvati in quella rilevazione). Azione irreversibile.
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
