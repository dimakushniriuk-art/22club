'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { Textarea } from '@/components/ui/textarea'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { useToast } from '@/components/ui/toast'
import { createLogger } from '@/lib/logger'
import { notifyError } from '@/lib/notifications'
import { Camera, ImagePlus, Trash2, X } from 'lucide-react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TablesInsert } from '@/types/supabase'
import type { Database } from '@/lib/supabase/types'
import { useAthleteAllenamentiPaths } from '@/contexts/athlete-allenamenti-preview-context'
import { useWorkoutsPaneOptional } from '@/contexts/workouts-pane-context'
import {
  STAFF_WORKOUTS_EMBED_DIRTY,
  STAFF_WORKOUTS_EMBED_SAVE_ERROR,
  STAFF_WORKOUTS_EMBED_SAVE_OK,
  STAFF_WORKOUTS_EMBED_SAVE_START,
} from '@/lib/embed/staff-workouts-embed-events'
import { ATHLETE_WDE_NOTE_IMAGE_MAX_BYTES } from '@/lib/storage/athlete-wde-note-images'
import { isMissingAthleteWdeNoteImageColumnError } from '@/lib/workout/athlete-wde-private-note-db'

const logger = createLogger('workout:athlete-exercise-private-note')

export type AthleteWdeNoteRow = {
  id: string
  note: string
  image_storage_path?: string | null
}

type Props = {
  workoutDayExerciseId: string
  athleteProfileId: string
  savedRow: AthleteWdeNoteRow | null | undefined
  onSaved: (workoutDayExerciseId: string, row: AthleteWdeNoteRow | null) => void
  /** Incrementato dal genitore per aprire il dialog nota (es. da menu sul numero set). */
  expandRequestSerial?: number
}

/** Messaggio API leggibile (evita testo tecnico tipo JWS in toast). */
function userFacingNoteImageApiError(raw: string | undefined): string {
  const s = (raw ?? '').trim()
  if (!s) return 'Operazione non riuscita.'
  const m = s.toLowerCase()
  if (
    m.includes('jws') ||
    m.includes('jwt') ||
    m.includes('malformed') ||
    m.includes('invalid compact')
  ) {
    return 'Sessione non valida o scaduta. Ricarica la pagina o effettua di nuovo il login.'
  }
  if (
    m.includes('non autenticato') ||
    m.includes('unauthorized') ||
    m.includes('not authenticated')
  ) {
    return 'Sessione non valida o scaduta. Ricarica la pagina o effettua di nuovo il login.'
  }
  return s
}

const WDE_NOTE_IMAGE_ACCESS_HEADER = 'x-22club-access-token'

async function bearerAuthHeaders(
  supabase: SupabaseClient<Database>,
): Promise<Record<string, string>> {
  let {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) {
    const { data } = await supabase.auth.refreshSession()
    session = data.session ?? null
  }
  if (!session?.access_token) return {}
  const t = session.access_token
  return {
    Authorization: `Bearer ${t}`,
    [WDE_NOTE_IMAGE_ACCESS_HEADER]: t,
  }
}

/** POST immagine: invia JWT in header (le cookie della route spesso sono rotte); su 401 refresh + retry. */
async function postWdeNoteImageWithAuthRetry(
  supabase: SupabaseClient<Database>,
  formData: () => FormData,
): Promise<Response> {
  const run = async () =>
    fetch('/api/athlete/wde-note-image', {
      method: 'POST',
      body: formData(),
      credentials: 'same-origin',
      headers: await bearerAuthHeaders(supabase),
    })
  const res = await run()
  if (res.status !== 401) return res
  const { error } = await supabase.auth.refreshSession()
  if (error) return res
  return run()
}

export function AthleteExercisePrivateNoteBlock({
  workoutDayExerciseId,
  athleteProfileId,
  savedRow,
  onSaved,
  expandRequestSerial = 0,
}: Props) {
  const supabase = useSupabaseClient()
  const { addToast } = useToast()
  const { isPreview } = useAthleteAllenamentiPaths()
  const workoutsPane = useWorkoutsPaneOptional()
  const [draft, setDraft] = useState(savedRow?.note ?? '')
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null)
  const [removedSavedImage, setRemovedSavedImage] = useState(false)
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(savedRow?.note ?? '')
  }, [workoutDayExerciseId, savedRow?.id, savedRow?.note])

  useEffect(() => {
    setDialogOpen(false)
  }, [workoutDayExerciseId])

  const expandSerialPairRef = React.useRef<{ id: string; s: number }>({
    id: workoutDayExerciseId,
    s: expandRequestSerial,
  })
  useEffect(() => {
    const s = expandRequestSerial
    if (workoutDayExerciseId !== expandSerialPairRef.current.id) {
      expandSerialPairRef.current = { id: workoutDayExerciseId, s }
      return
    }
    if (s > expandSerialPairRef.current.s) {
      setDialogOpen(true)
    }
    expandSerialPairRef.current = { id: workoutDayExerciseId, s }
  }, [workoutDayExerciseId, expandRequestSerial])

  useEffect(() => {
    if (!pendingImageFile) {
      setPendingPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    const url = URL.createObjectURL(pendingImageFile)
    setPendingPreviewUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [pendingImageFile])

  useEffect(() => {
    if (!dialogOpen || !savedRow?.image_storage_path || removedSavedImage || pendingImageFile) {
      setSignedImageUrl(null)
      return
    }
    let cancelled = false
    ;(async () => {
      const url = `/api/athlete/wde-note-image?path=${encodeURIComponent(savedRow.image_storage_path!)}`
      const load = async () =>
        fetch(url, {
          credentials: 'same-origin',
          headers: await bearerAuthHeaders(supabase),
        })
      try {
        const loadWithRefresh = async (): Promise<Response> => {
          let r = await load()
          if (r.status === 401) {
            const { error } = await supabase.auth.refreshSession()
            if (!error && !cancelled) r = await load()
          }
          return r
        }
        const res = await loadWithRefresh()
        const json = (await res.json()) as { signedUrl?: string; error?: string }
        if (!res.ok) {
          logger.warn('signed url wde note image api', {
            error: json.error,
            status: res.status,
            path: savedRow.image_storage_path,
          })
          return
        }
        if (!cancelled && json.signedUrl) setSignedImageUrl(json.signedUrl)
      } catch (e) {
        logger.warn('signed url wde note image fetch', e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [dialogOpen, savedRow?.image_storage_path, removedSavedImage, pendingImageFile, supabase])

  const postToParent = useCallback(
    (payload: Record<string, unknown>) => {
      if (!isPreview) return
      if (typeof window === 'undefined') return
      if (window.parent === window) return
      try {
        window.parent.postMessage(payload, window.location.origin)
      } catch {
        /* ignore */
      }
    },
    [isPreview],
  )

  const emitDirty = useCallback(
    (dirty: boolean) => {
      if (workoutsPane?.setDirty) {
        workoutsPane.setDirty(dirty)
        return
      }
      postToParent({ type: STAFF_WORKOUTS_EMBED_DIRTY, athleteProfileId, dirty })
    },
    [athleteProfileId, postToParent, workoutsPane],
  )

  const emitSaveStart = useCallback(() => {
    postToParent({ type: STAFF_WORKOUTS_EMBED_SAVE_START, athleteProfileId, scope: 'block' })
  }, [athleteProfileId, postToParent])

  const emitSaveOk = useCallback(() => {
    postToParent({ type: STAFF_WORKOUTS_EMBED_SAVE_OK, athleteProfileId, scope: 'block' })
  }, [athleteProfileId, postToParent])

  const emitSaveError = useCallback(
    (message: string) => {
      postToParent({
        type: STAFF_WORKOUTS_EMBED_SAVE_ERROR,
        athleteProfileId,
        scope: 'block',
        message,
      })
    },
    [athleteProfileId, postToParent],
  )

  const removeNoteImageApi = useCallback(
    async (path: string | null | undefined) => {
      if (!path) return
      try {
        const auth = await bearerAuthHeaders(supabase)
        const res = await fetch('/api/athlete/wde-note-image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', ...auth },
          credentials: 'same-origin',
          body: JSON.stringify({ path }),
        })
        if (!res.ok) {
          const json = (await res.json().catch(() => ({}))) as { error?: string }
          logger.warn('remove wde note image api', { error: json.error, status: res.status, path })
        }
      } catch (e) {
        logger.warn('remove wde note image fetch', e, { path })
      }
    },
    [supabase],
  )

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

  const resetFormToSaved = useCallback(() => {
    setDraft(savedRow?.note ?? '')
    setPendingImageFile(null)
    setRemovedSavedImage(false)
  }, [savedRow?.note])

  const discardAndClose = useCallback(() => {
    resetFormToSaved()
    setDialogOpen(false)
  }, [resetFormToSaved])

  const onPickFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > ATHLETE_WDE_NOTE_IMAGE_MAX_BYTES) {
      notifyError(
        'File troppo grande',
        `L'immagine supera ${ATHLETE_WDE_NOTE_IMAGE_MAX_BYTES / (1024 * 1024)} MB.`,
      )
      return
    }
    setPendingImageFile(file)
    setRemovedSavedImage(false)
  }

  const handleSave = async () => {
    const trimmed = draft.trim()
    const savedPath = savedRow?.image_storage_path ?? null

    let uploadedPath: string | null = null
    if (pendingImageFile) {
      emitSaveStart()
      setSaving(true)
      try {
        const authHeaders = await bearerAuthHeaders(supabase)
        if (!authHeaders.Authorization) {
          notifyError(
            'Accesso richiesto',
            'Sessione non disponibile per caricare la foto. Effettua di nuovo il login e riprova.',
          )
          emitSaveError('Nessun access_token per upload immagine.')
          return
        }
        const buildFormData = () => {
          const fd = new FormData()
          fd.append('file', pendingImageFile)
          fd.append('workoutDayExerciseId', workoutDayExerciseId)
          fd.append('athleteProfileId', athleteProfileId)
          return fd
        }
        const res = await postWdeNoteImageWithAuthRetry(supabase, buildFormData)
        const json = (await res.json()) as { path?: string; error?: string }
        if (!res.ok) {
          const rawMsg = json.error ?? 'Upload fallito'
          const msg = userFacingNoteImageApiError(rawMsg)
          if (res.status === 503) {
            notifyError(
              'Server storage',
              rawMsg ||
                'Aggiungi SUPABASE_SERVICE_ROLE_KEY in .env.local (stesso progetto Supabase di NEXT_PUBLIC_SUPABASE_URL). Il server crea il bucket e carica la foto.',
            )
            emitSaveError(rawMsg)
          } else {
            logger.warn('upload wde note image api', { msg: rawMsg, workoutDayExerciseId })
            notifyError('Errore', msg)
            emitSaveError('Upload immagine fallito.')
          }
          return
        }
        if (!json.path) {
          notifyError('Errore', 'Risposta upload non valida.')
          emitSaveError('Upload immagine fallito.')
          return
        }
        uploadedPath = json.path
      } finally {
        setSaving(false)
      }
    }

    let imagePath: string | null
    if (uploadedPath) {
      imagePath = uploadedPath
    } else if (removedSavedImage) {
      imagePath = null
    } else {
      imagePath = savedPath
    }

    const hasText = trimmed.length > 0
    const hasImage = Boolean(imagePath)

    if (!hasText && !hasImage) {
      if (!savedRow?.id) return
      emitSaveStart()
      setSaving(true)
      try {
        const ok = await persistDelete(savedRow.id)
        if (ok) {
          await removeNoteImageApi(savedPath)
          onSaved(workoutDayExerciseId, null)
          addToast({ title: 'Nota rimossa', message: '', variant: 'success' })
          emitDirty(false)
          emitSaveOk()
          resetFormToSaved()
          setDialogOpen(false)
        }
      } finally {
        setSaving(false)
      }
      return
    }

    emitSaveStart()
    setSaving(true)
    try {
      /** Senza migrazione DB la colonna non esiste: omettiamo il campo se non serve (solo testo). */
      const includeImageStoragePath =
        imagePath !== null || (removedSavedImage && Boolean(savedPath))

      const payload: TablesInsert<'athlete_workout_day_exercise_notes'> = {
        profile_id: athleteProfileId,
        workout_day_exercise_id: workoutDayExerciseId,
        note: trimmed,
        ...(includeImageStoragePath ? { image_storage_path: imagePath } : {}),
      }
      const { data, error } = await supabase
        .from('athlete_workout_day_exercise_notes')
        .upsert(payload, {
          onConflict: 'profile_id,workout_day_exercise_id',
        })
        .select('id, note')
        .single()

      if (error) {
        if (uploadedPath) await removeNoteImageApi(uploadedPath)
        if (isMissingAthleteWdeNoteImageColumnError(error)) {
          logger.warn('upsert athlete note: colonna image_storage_path assente sul DB', {
            workoutDayExerciseId,
            code: error.code,
          })
          notifyError(
            'Database da aggiornare',
            'Esegui sul progetto Supabase supabase/migrations/20260428123000_athlete_wde_note_images.sql (Dashboard → SQL). Senza la colonna image_storage_path non puoi salvare le foto in nota.',
          )
          emitSaveError('Colonna image_storage_path assente.')
        } else {
          logger.error('upsert athlete note', error, { workoutDayExerciseId })
          notifyError('Errore', 'Impossibile salvare la nota.')
          emitSaveError('Impossibile salvare la nota.')
        }
        return
      }
      if (data) {
        const nextImagePath = includeImageStoragePath
          ? imagePath
          : (savedRow?.image_storage_path ?? null)
        if (savedPath && savedPath !== nextImagePath) {
          await removeNoteImageApi(savedPath)
        }
        onSaved(workoutDayExerciseId, {
          id: data.id,
          note: data.note ?? trimmed,
          image_storage_path: nextImagePath,
        })
        addToast({ title: 'Nota salvata', message: '', variant: 'success' })
        emitDirty(false)
        emitSaveOk()
        resetFormToSaved()
        setDialogOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!savedRow?.id) {
      setDraft('')
      setPendingImageFile(null)
      setRemovedSavedImage(false)
      return
    }
    emitSaveStart()
    setSaving(true)
    try {
      const path = savedRow.image_storage_path ?? null
      const ok = await persistDelete(savedRow.id)
      if (ok) {
        await removeNoteImageApi(path)
        setDraft('')
        onSaved(workoutDayExerciseId, null)
        addToast({ title: 'Nota eliminata', message: '', variant: 'success' })
        emitDirty(false)
        emitSaveOk()
        resetFormToSaved()
        setDialogOpen(false)
      }
    } finally {
      setSaving(false)
    }
  }

  const savedNote = savedRow?.note ?? ''
  const savedPath = savedRow?.image_storage_path ?? null
  const dirty =
    draft.trim() !== savedNote.trim() ||
    Boolean(pendingImageFile) ||
    (removedSavedImage && Boolean(savedPath))

  useEffect(() => {
    if (!dialogOpen) return
    emitDirty(dirty)
  }, [dirty, emitDirty, dialogOpen])

  const displayImageUrl = pendingPreviewUrl ?? (!removedSavedImage ? signedImageUrl : null)

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          onPickFiles(e.target.files)
          e.target.value = ''
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          onPickFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(next) => {
          setDialogOpen(next)
          if (!next) resetFormToSaved()
        }}
      >
        <DialogContent className="flex w-full max-w-[min(94vw,36rem)] flex-col gap-5 overflow-hidden px-6 py-6 sm:max-w-2xl sm:gap-6 sm:px-8 sm:py-8 md:max-w-3xl">
          <DialogHeader className="space-y-2.5 pr-10 text-left sm:space-y-3">
            <DialogTitle className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
              La tua nota privata
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-text-secondary sm:text-base">
              Solo tu la vedi. Resta collegata a questo esercizio nella scheda. Puoi allegare una
              foto (galleria o fotocamera).
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-2 rounded-lg border-white/15 bg-white/5 text-xs sm:text-sm"
              onClick={() => cameraInputRef.current?.click()}
              disabled={saving}
            >
              <Camera className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Scatta foto
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-2 rounded-lg border-white/15 bg-white/5 text-xs sm:text-sm"
              onClick={() => galleryInputRef.current?.click()}
              disabled={saving}
            >
              <ImagePlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Scegli dalla galleria
            </Button>
          </div>

          {displayImageUrl ? (
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob / signed URL */}
              <img
                src={displayImageUrl}
                alt="Anteprima allegato"
                className="max-h-[min(40dvh,320px)] w-full object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setPendingImageFile(null)
                  setRemovedSavedImage(true)
                }}
                className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-black/70 text-white transition-colors hover:bg-black/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                aria-label="Rimuovi immagine"
                disabled={saving}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Aggiungi un promemoria (dolore, sensazioni, carico…)"
            className="min-h-[min(42dvh,220px)] resize-y rounded-xl border-white/10 bg-white/5 text-sm leading-relaxed text-text-primary placeholder:text-text-tertiary/70 sm:min-h-[min(48dvh,320px)] sm:text-base"
            disabled={saving}
            maxLength={2000}
            aria-label="Nota privata esercizio"
          />

          {savedRow?.id ? (
            <div className="flex justify-start">
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
                Elimina tutto
              </Button>
            </div>
          ) : null}

          <DialogFooter className="mt-0 flex-col gap-2 sm:flex-row sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              className="w-full border-white/15 bg-white/5 sm:flex-1"
              onClick={discardAndClose}
              disabled={saving}
            >
              Annulla
            </Button>
            <Button
              type="button"
              className="w-full sm:flex-1"
              onClick={handleSave}
              disabled={saving || !dirty}
            >
              {saving ? 'Salvataggio…' : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
