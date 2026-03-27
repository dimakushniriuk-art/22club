'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { Textarea } from '@/components/ui/textarea'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useToast } from '@/components/ui/toast'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { ChevronDown, ChevronUp, Lock, Trash2 } from 'lucide-react'
import type { TablesInsert } from '@/types/supabase'

const logger = createLogger('workout:athlete-exercise-private-note')

export type AthleteWdeNoteRow = { id: string; note: string }

type Props = {
  workoutDayExerciseId: string
  athleteProfileId: string
  savedRow: AthleteWdeNoteRow | null | undefined
  onSaved: (workoutDayExerciseId: string, row: AthleteWdeNoteRow | null) => void
}

function notePreview(text: string, max = 52): string {
  const t = text.trim()
  if (!t) return ''
  return t.length <= max ? t : `${t.slice(0, max).trim()}…`
}

export function AthleteExercisePrivateNoteBlock({
  workoutDayExerciseId,
  athleteProfileId,
  savedRow,
  onSaved,
}: Props) {
  const supabase = useSupabaseClient()
  const { addToast } = useToast()
  const [draft, setDraft] = useState(savedRow?.note ?? '')
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setDraft(savedRow?.note ?? '')
  }, [workoutDayExerciseId, savedRow?.id, savedRow?.note])

  useEffect(() => {
    setOpen(false)
  }, [workoutDayExerciseId])

  const persistDelete = async (noteId: string) => {
    const { error } = await supabase
      .from('athlete_workout_day_exercise_notes')
      .delete()
      .eq('id', noteId)
    if (error) {
      logger.error('delete athlete note', error, { workoutDayExerciseId })
      notifyError('Errore', 'Impossibile eliminare la nota.')
      return false
    }
    return true
  }

  const handleSave = async () => {
    const trimmed = draft.trim()
    if (trimmed === '') {
      if (savedRow?.id) {
        setSaving(true)
        try {
          const ok = await persistDelete(savedRow.id)
          if (ok) {
            onSaved(workoutDayExerciseId, null)
            addToast({ title: 'Nota rimossa', message: '', variant: 'success' })
            setOpen(false)
          }
        } finally {
          setSaving(false)
        }
      }
      return
    }

    setSaving(true)
    try {
      const payload: TablesInsert<'athlete_workout_day_exercise_notes'> = {
        profile_id: athleteProfileId,
        workout_day_exercise_id: workoutDayExerciseId,
        note: trimmed,
      }
      const { data, error } = await supabase
        .from('athlete_workout_day_exercise_notes')
        .upsert(payload, {
          onConflict: 'profile_id,workout_day_exercise_id',
        })
        .select('id, note')
        .single()

      if (error) {
        logger.error('upsert athlete note', error, { workoutDayExerciseId })
        notifyError('Errore', 'Impossibile salvare la nota.')
        return
      }
      if (data) {
        onSaved(workoutDayExerciseId, { id: data.id, note: data.note ?? trimmed })
        addToast({ title: 'Nota salvata', message: '', variant: 'success' })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!savedRow?.id) {
      setDraft('')
      return
    }
    setSaving(true)
    try {
      const ok = await persistDelete(savedRow.id)
      if (ok) {
        setDraft('')
        onSaved(workoutDayExerciseId, null)
        addToast({ title: 'Nota eliminata', message: '', variant: 'success' })
        setOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setDraft(savedRow?.note ?? '')
    setOpen(false)
  }

  const dirty = draft.trim() !== (savedRow?.note ?? '').trim()
  const savedText = savedRow?.note?.trim() ?? ''
  const hasSaved = Boolean(savedText)
  const preview = hasSaved ? notePreview(savedRow?.note ?? '') : ''

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left transition-colors hover:border-white/15 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40"
          aria-expanded={false}
          aria-label={
            hasSaved ? 'Apri per modificare o eliminare la nota privata' : 'Apri per aggiungere una nota privata'
          }
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400/90" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-text-primary">
              {hasSaved ? 'Nota privata' : 'Aggiungi nota privata'}
            </span>
            {hasSaved ? (
              <span className="mt-0.5 block truncate text-[11px] text-text-tertiary">{preview}</span>
            ) : (
              <span className="mt-0.5 block text-[11px] text-text-tertiary">
                Solo tu la vedi, legata a questo esercizio
              </span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-text-tertiary" aria-hidden />
        </button>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400/90" aria-hidden />
              </span>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                  La tua nota privata
                </div>
                <p className="text-[11px] leading-snug text-text-tertiary">
                  Solo tu la vedi. Resta collegata a questo esercizio nella scheda.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex shrink-0 items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-medium text-text-tertiary transition-colors hover:bg-white/5 hover:text-text-primary"
              aria-label="Chiudi"
            >
              Chiudi
              <ChevronUp className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Aggiungi un promemoria (dolore, sensazioni, carico…)"
            className="min-h-[88px] resize-y rounded-xl border-white/10 bg-white/5 text-sm text-text-primary placeholder:text-text-tertiary/70"
            disabled={saving}
            maxLength={2000}
            aria-label="Nota privata esercizio"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-lg text-xs"
              onClick={handleSave}
              disabled={saving || !dirty}
            >
              {saving ? 'Salvataggio…' : 'Salva'}
            </Button>
            {(savedRow?.id || draft.trim() !== '') && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-lg text-xs text-text-tertiary hover:text-red-400"
                onClick={handleDelete}
                disabled={saving}
                aria-label="Elimina nota"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Elimina
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
