'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:dashboard:exercise-form-modal')
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SimpleSelect } from '@/components/ui/simple-select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { useSupabase } from '@/hooks/use-supabase'
import {
  MUSCLE_GROUPS,
  // EQUIPMENT, // Non utilizzato in questo componente
  EQUIPMENT_BY_CATEGORY,
  EQUIPMENT_CATEGORIES,
} from '@/lib/exercises-data'
import {
  validateVideoFile,
  validateImageFile,
  generateUniqueFileName,
  // Nota: formatFileSize potrebbe essere usato in futuro per display dimensioni file
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formatFileSize,
} from '@/lib/exercise-upload-utils'
import { isValidVideoUrl, VIDEO_URL_ERROR_MESSAGE } from '@/lib/validations/video-url'
import {
  Video,
  Image as ImageIcon,
  Clock,
  Save,
  X,
  CheckCircle2,
  Loader2,
  Dumbbell,
  Target,
} from 'lucide-react'

import type { Exercise } from '@/types/exercise'

interface ExerciseFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: Exercise | null
  onSuccess?: () => void
}

export function ExerciseFormModal({
  open,
  onOpenChange,
  editing,
  onSuccess,
}: ExerciseFormModalProps) {
  const { addToast } = useToast()
  const { supabase, user } = useSupabase()
  const [form, setForm] = useState<Partial<Exercise>>({ difficulty: 'media' })
  const [loading, setLoading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [dragVideo, setDragVideo] = useState(false)
  const [dragThumb, setDragThumb] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [equipmentCategory, setEquipmentCategory] = useState<string>('')
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (open) {
      if (editing) {
        setForm(editing)
        // Parsa gli attrezzi dalla stringa (separati da virgole)
        if (editing.equipment) {
          const equipmentList = editing.equipment.split(',').map((e) => e.trim()).filter(Boolean)
          setSelectedEquipment(equipmentList)
          // Determina la categoria dal primo attrezzo selezionato
          if (equipmentList.length > 0) {
            const firstEquipment = equipmentList[0] as string
            const category = EQUIPMENT_CATEGORIES.find((cat) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((EQUIPMENT_BY_CATEGORY as any)[cat] as string[]).includes(
                firstEquipment,
              ),
            )
            setEquipmentCategory(category || '')
          } else {
            setEquipmentCategory('')
          }
        } else {
          setSelectedEquipment([])
          setEquipmentCategory('')
        }
      } else {
        setForm({ difficulty: 'media' })
        setEquipmentCategory('')
        setSelectedEquipment([])
      }
      setVideoError(false)
      setVideoLoading(false)
    } else {
      setForm({ difficulty: 'media' })
      setEquipmentCategory('')
      setSelectedEquipment([])
      setVideoError(false)
      setVideoLoading(false)
    }
  }, [open, editing])

  // Aggiorna form.equipment quando cambia selectedEquipment
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      equipment: selectedEquipment.length > 0 ? selectedEquipment.join(', ') : undefined,
    }))
  }, [selectedEquipment])

  // Ottieni gli attrezzi filtrati per categoria
  const getFilteredEquipment = () => {
    if (!equipmentCategory) {
      return []
    }
    return EQUIPMENT_BY_CATEGORY[equipmentCategory as keyof typeof EQUIPMENT_BY_CATEGORY] || []
  }

  const handleVideoUpload = async (file: File) => {
    if (!user) {
      return
    }

    // Validazione formato e dimensione file
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      addToast({
        title: 'Errore validazione video',
        message: validation.error || 'File video non valido',
        variant: 'error',
      })
      return
    }

    setUploadingVideo(true)

    try {
      const fileName = generateUniqueFileName(user.id, file.name)

      const { error } = await supabase.storage.from('exercise-videos').upload(fileName, file, {
        upsert: true,
        cacheControl: '3600',
      })

      if (error) {
        throw error
      }

      const { data } = supabase.storage.from('exercise-videos').getPublicUrl(fileName)

      // Genera thumbnail automaticamente dal video
      const generateThumbnail = async (videoUrl: string): Promise<string | null> => {
        return new Promise((resolve) => {
          // Estrai il path del file dall'URL pubblico
          // URL format: https://project.supabase.co/storage/v1/object/public/bucket/path/to/file.mp4
          const urlMatch = videoUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
          if (!urlMatch) {
            resolve(null)
            return
          }

          const bucket = urlMatch[1]
          const filePath = urlMatch[2]

          // Usa Supabase client per scaricare il file (gestisce autenticazione e CORS)
          supabase.storage
            .from(bucket)
            .download(filePath)
            .then(({ data: blob, error: downloadError }) => {
              if (downloadError || !blob) {
                resolve(null)
                return
              }

              const blobUrl = URL.createObjectURL(blob)
              const video = document.createElement('video')
              video.src = blobUrl
              video.preload = 'metadata'
              video.muted = true
              video.playsInline = true

              // Timeout per evitare attese infinite
              const timeout = setTimeout(() => {
                logger.warn('Timeout generazione thumbnail')
                URL.revokeObjectURL(blobUrl)
                video.remove()
                resolve(null)
              }, 10000) // 10 secondi

              const cleanup = () => {
                clearTimeout(timeout)
                URL.revokeObjectURL(blobUrl)
                video.remove()
              }

              video.onloadedmetadata = () => {
                try {
                  // Verifica che il video abbia una durata valida
                  if (!video.duration || isNaN(video.duration) || video.duration <= 0) {
                    logger.warn('Video senza durata valida per generazione thumbnail', {
                      duration: video.duration,
                      videoWidth: video.videoWidth,
                      videoHeight: video.videoHeight,
                    })
                    cleanup()
                    resolve(null)
                    return
                  }
                  const seekTime = Math.min(0.5, video.duration / 2)
                  video.currentTime = seekTime
                } catch (err) {
                  logger.error('Errore impostazione currentTime', err)
                  cleanup()
                  resolve(null)
                }
              }

              video.onseeked = async () => {
                try {
                  // Verifica dimensioni video valide
                  if (
                    !video.videoWidth ||
                    !video.videoHeight ||
                    video.videoWidth === 0 ||
                    video.videoHeight === 0
                  ) {
                    logger.warn(
                      'Video senza dimensioni valide per generazione thumbnail',
                      undefined,
                      {
                        width: video.videoWidth,
                        height: video.videoHeight,
                      },
                    )
                    cleanup()
                    resolve(null)
                    return
                  }

                  const canvas = document.createElement('canvas')
                  canvas.width = video.videoWidth
                  canvas.height = video.videoHeight
                  const ctx = canvas.getContext('2d')
                  if (!ctx) {
                    logger.warn('Impossibile ottenere contesto canvas')
                    cleanup()
                    resolve(null)
                    return
                  }

                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

                  canvas.toBlob(
                    async (blob) => {
                      if (!blob || !user) {
                        logger.warn('Blob non generato o utente non disponibile')
                        cleanup()
                        resolve(null)
                        return
                      }

                      try {
                        const thumbPath = fileName.replace(/\.(mp4|mov|avi|webm)$/i, '.jpg')

                        const { error: thumbError } = await supabase.storage
                          .from('exercise-thumbs')
                          .upload(thumbPath, blob, { upsert: true })

                        if (thumbError) {
                          logger.error('Errore upload thumbnail', thumbError)
                          cleanup()
                          resolve(null)
                          return
                        }

                        const { data: thumbData } = supabase.storage
                          .from('exercise-thumbs')
                          .getPublicUrl(thumbPath)

                        cleanup()
                        resolve(thumbData.publicUrl)
                      } catch (err) {
                        logger.error('Errore durante upload thumbnail', err)
                        cleanup()
                        resolve(null)
                      }
                    },
                    'image/jpeg',
                    0.8,
                  )
                } catch (err) {
                  logger.error('Errore generazione thumbnail', err)
                  cleanup()
                  resolve(null)
                }
              }

              video.onerror = () => {
                // L'oggetto evento non contiene info utili, usiamo video.error invece
                const error = video.error
                if (error) {
                  // Non loggare errori comuni (formato non supportato, source non accessibile, caricamento interrotto)
                  // NOT_SUPPORTED_SOURCE (code 9) = video non supportato o non accessibile
                  // MEDIA_ERR_SRC_NOT_SUPPORTED (code 4) = formato non supportato
                  // MEDIA_ERR_ABORTED (code 1) = caricamento interrotto (non critico)
                  if (error.code === 9 || error.code === 4 || error.code === 1) {
                    // Errori comuni - non loggare, gestiti silenziosamente
                    logger.debug(
                      'Video non supportato o non accessibile per thumbnail',
                      undefined,
                      {
                        code: error.code,
                        videoUrl: videoUrl.substring(0, 100) + '...',
                      },
                    )
                  } else if (error.code === 2 || error.code === 3) {
                    // MEDIA_ERR_NETWORK (2) o MEDIA_ERR_DECODE (3) - errori critici
                    const errorMessages: Record<number, string> = {
                      2: 'MEDIA_ERR_NETWORK - Errore di rete',
                      3: 'MEDIA_ERR_DECODE - Errore decodifica video',
                    }
                    const errorMsg =
                      errorMessages[error.code] || `Errore sconosciuto (codice: ${error.code})`
                    logger.error('Errore critico caricamento video per thumbnail', error, {
                      errorMsg,
                      code: error.code,
                      videoUrl: videoUrl.substring(0, 100) + '...',
                    })
                  } else {
                    // Altri errori sconosciuti - log come debug
                    logger.debug('Errore video sconosciuto per thumbnail', undefined, {
                      code: error.code,
                      videoUrl: videoUrl.substring(0, 100) + '...',
                    })
                  }
                } else {
                  // Possibile errore CORS o altro - non loggare come errore
                  logger.debug(
                    'Errore caricamento video per thumbnail (possibile CORS o formato non supportato)',
                    undefined,
                    {
                      videoUrl: videoUrl.substring(0, 100) + '...',
                    },
                  )
                }
                cleanup()
                resolve(null)
              }
            })
            .catch((err) => {
              logger.error('Errore download video per thumbnail', err)
              resolve(null)
            })
        })
      }

      const thumbUrl = await generateThumbnail(data.publicUrl)

      setForm((prev) => {
        return {
          ...prev,
          video_url: data.publicUrl,
          thumb_url: thumbUrl || prev.thumb_url,
          duration_seconds: undefined,
        }
      })
      // Reset video loading state when new video is uploaded
      setVideoLoading(true)
      setVideoError(false)

      if (thumbUrl) {
        addToast({
          title: 'Video caricato',
          message: 'Video e thumbnail caricati con successo',
          variant: 'success',
        })
      } else {
        addToast({
          title: 'Video caricato',
          message:
            'Video caricato con successo. Thumbnail non generata automaticamente (puoi caricarla manualmente)',
          variant: 'warning',
        })
      }
    } catch (err) {
      addToast({
        title: 'Errore upload',
        message: err instanceof Error ? err.message : 'Errore durante il caricamento',
        variant: 'error',
      })
    } finally {
      setUploadingVideo(false)
    }
  }

  const handleThumbnailUpload = async (file: File) => {
    if (!user) return

    // Validazione formato e dimensione file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      addToast({
        title: 'Errore validazione immagine',
        message: validation.error || 'File immagine non valido',
        variant: 'error',
      })
      return
    }

    setUploadingThumb(true)

    try {
      const fileName = generateUniqueFileName(user.id, file.name)

      const { error } = await supabase.storage.from('exercise-thumbs').upload(fileName, file, {
        upsert: true,
        cacheControl: '3600',
      })

      if (error) {
        throw error
      }

      const { data } = supabase.storage.from('exercise-thumbs').getPublicUrl(fileName)
      const publicUrl = data.publicUrl

      logger.info('Thumbnail caricata con successo', undefined, {
        fileName,
        publicUrl,
        fileSize: file.size,
        fileType: file.type,
      })

      setForm((prev) => ({ ...prev, thumb_url: publicUrl }))

      addToast({
        title: 'Thumbnail caricata',
        message: 'Thumbnail caricata con successo',
        variant: 'success',
      })
    } catch (err) {
      addToast({
        title: 'Errore upload',
        message: err instanceof Error ? err.message : 'Errore durante il caricamento',
        variant: 'error',
      })
    } finally {
      setUploadingThumb(false)
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.muscle_group) {
      addToast({
        title: 'Errore',
        message: 'Compila tutti i campi obbligatori',
        variant: 'error',
      })
      return
    }

    // Validazione formato URL video (P4-006)
    if (form.video_url && !isValidVideoUrl(form.video_url)) {
      addToast({
        title: 'Errore validazione',
        message: VIDEO_URL_ERROR_MESSAGE,
        variant: 'error',
      })
      return
    }

    setLoading(true)
    try {
      const method = editing ? 'PUT' : 'POST'
      // Rimuovi campi non necessari per l'API (mantieni thumb_url perché è necessario)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, created_at, updated_at, org_id, duration_seconds, ...formData } = form

      // Converti undefined in null per video_url e thumb_url (per gestire correttamente la rimozione)
      const normalizedFormData = {
        ...formData,
        video_url: formData.video_url ?? null,
        thumb_url: formData.thumb_url ?? null,
      }

      // Aggiungi duration_seconds solo se ha un valore (potrebbe non esistere nel DB)
      const requestBody = editing
        ? {
            id: editing.id,
            ...normalizedFormData,
            ...(duration_seconds !== null && duration_seconds !== undefined
              ? { duration_seconds }
              : {}),
          }
        : {
            ...normalizedFormData,
            ...(duration_seconds !== null && duration_seconds !== undefined
              ? { duration_seconds }
              : {}),
          }

      logger.info("Invio dati esercizio all'API", undefined, {
        method,
        hasThumbUrl: !!requestBody.thumb_url,
        thumbUrl: requestBody.thumb_url,
        hasVideoUrl: !!requestBody.video_url,
        editing: !!editing,
      })

      const res = await fetch('/api/exercises', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error?.message || errorData.error || 'Salvataggio fallito')
      }

      addToast({
        title: 'Salvato',
        message: 'Esercizio salvato correttamente',
        variant: 'success',
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (e) {
      addToast({
        title: 'Errore',
        message: e instanceof Error ? e.message : 'Errore',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] relative overflow-hidden rounded-xl border border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-teal-500/10 p-0 flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="relative z-10 p-6 overflow-y-auto flex-1">
          {/* Header con icona */}
          <DialogHeader className="pb-4 border-b border-teal-500/20 mb-0">
            <div className="flex items-center gap-3">
              <div className="bg-teal-500/20 text-teal-400 rounded-lg p-2">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {editing ? 'Modifica esercizio' : 'Nuovo esercizio'}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Completa i campi richiesti e salva
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-6 relative z-10">
            {/* Informazioni Base */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                <Target className="h-4 w-4 text-teal-400" />
                Informazioni Base
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Nome esercizio *"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Es: Squat con Bilanciere"
                  leftIcon={<Dumbbell className="h-4 w-4" />}
                />
                <div>
                  <label className="text-text-primary mb-2 block text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-400" />
                    Gruppo muscolare *
                  </label>
                  <SimpleSelect
                    value={form.muscle_group || ''}
                    onValueChange={(value) => setForm({ ...form, muscle_group: value })}
                    placeholder="Seleziona gruppo muscolare"
                    options={MUSCLE_GROUPS.map((g) => ({ value: g, label: g }))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-text-primary mb-2 block text-sm font-medium flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-cyan-400" />
                      Categoria
                    </label>
                    <SimpleSelect
                      value={equipmentCategory}
                      onValueChange={(value) => {
                        setEquipmentCategory(value)
                        // Non resettare gli attrezzi già selezionati quando cambia categoria
                      }}
                      placeholder="Seleziona categoria"
                      options={EQUIPMENT_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
                    />
                  </div>
                  <div>
                    <label className="text-text-primary mb-2 block text-sm font-medium flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-cyan-400" />
                      Aggiungi Attrezzo
                    </label>
                    <SimpleSelect
                      value=""
                      onValueChange={(value) => {
                        if (value && !selectedEquipment.includes(value)) {
                          setSelectedEquipment([...selectedEquipment, value])
                        }
                      }}
                      placeholder={
                        equipmentCategory
                          ? 'Seleziona attrezzo da aggiungere'
                          : 'Seleziona prima una categoria'
                      }
                      disabled={!equipmentCategory}
                      options={getFilteredEquipment()
                        .filter((e) => !selectedEquipment.includes(e))
                        .map((e) => ({ value: e, label: e }))}
                    />
                  </div>
                </div>
                {selectedEquipment.length > 0 && (
                  <div>
                    <label className="text-text-primary mb-2 block text-sm font-medium">
                      Attrezzi Selezionati ({selectedEquipment.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedEquipment.map((equipment, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-400 text-sm"
                        >
                          <span>{equipment}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEquipment(selectedEquipment.filter((_, i) => i !== index))
                            }}
                            className="hover:text-red-400 transition-colors"
                            aria-label={`Rimuovi ${equipment}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-text-primary mb-2 block text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-400" />
                    Difficoltà
                  </label>
                  <SimpleSelect
                    value={form.difficulty || 'media'}
                    onValueChange={(value) =>
                      setForm({ ...form, difficulty: value as Exercise['difficulty'] })
                    }
                    placeholder="Seleziona difficoltà"
                    options={[
                      { value: 'bassa', label: 'Principiante' },
                      { value: 'media', label: 'Intermedio' },
                      { value: 'alta', label: 'Avanzato' },
                    ]}
                  />
                </div>
                <div />
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                <Video className="h-4 w-4 text-teal-400" />
                Media (Video e Immagine)
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Video Upload */}
                <div className="space-y-2">
                  <label className="text-text-primary mb-2 block text-sm font-medium">
                    Video MP4 *
                  </label>
                  <div
                    className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
                      dragVideo
                        ? 'border-teal-500 bg-teal-500/20'
                        : form.video_url
                          ? 'border-green-500 bg-green-900'
                          : 'border-teal-500/30 bg-background-tertiary hover:border-teal-500/50'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragVideo(true)
                    }}
                    onDragLeave={() => setDragVideo(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragVideo(false)
                      const file = e.dataTransfer.files?.[0]
                      if (file) {
                        handleVideoUpload(file)
                      }
                    }}
                  >
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) handleVideoUpload(file)
                      }}
                      className="hidden"
                      id="video-upload"
                      disabled={uploadingVideo}
                    />
                    {form.video_url ? (
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm font-medium">Video caricato</span>
                        </div>
                        {videoError && form.thumb_url ? (
                          <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-background-secondary">
                            <Image
                              src={form.thumb_url}
                              alt="Video preview"
                              fill
                              className="object-cover"
                              unoptimized={form.thumb_url.startsWith('http')}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <p className="text-white text-sm">Video non disponibile</p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-background-secondary">
                            {videoLoading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background-secondary/80 z-10">
                                <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                              </div>
                            )}
                            <video
                              src={form.video_url}
                              className="w-full h-full object-contain rounded-lg"
                              controls
                              muted
                              playsInline
                              preload="metadata"
                              onLoadStart={() => {
                                setVideoLoading(true)
                                setVideoError(false)
                              }}
                              onCanPlay={() => {
                                setVideoLoading(false)
                              }}
                              onError={(e) => {
                                const video = e.currentTarget
                                const error = video.error
                                setVideoLoading(false)
                                // Non loggare errori comuni (formato non supportato, source non accessibile)
                                if (
                                  error &&
                                  error.code !== 9 &&
                                  error.code !== 4 &&
                                  error.code !== 1
                                ) {
                                  console.warn('Errore caricamento video:', {
                                    code: error.code,
                                    message: error.message,
                                    src: video.src,
                                  })
                                }
                                setVideoError(true)
                              }}
                              onLoadedMetadata={() => {
                                setVideoError(false)
                                setVideoLoading(false)
                              }}
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-text-secondary">
                          <span className="truncate flex-1">{form.video_url.split('/').pop()}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setForm({ ...form, video_url: undefined, thumb_url: undefined })
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="video-upload"
                        className="flex flex-col items-center justify-center p-6 cursor-pointer"
                      >
                        <div className="mb-3 bg-teal-500/20 text-teal-400 rounded-full p-3">
                          {uploadingVideo ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <Video className="h-6 w-6" />
                          )}
                        </div>
                        <p className="text-text-primary text-sm font-medium mb-1">
                          {uploadingVideo
                            ? 'Caricamento in corso...'
                            : 'Trascina video o clicca per selezionare'}
                        </p>
                        <p className="text-text-tertiary text-xs">
                          MP4, WebM, OGG, MOV, AVI • Max 50MB
                        </p>
                      </label>
                    )}
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div className="space-y-2">
                  <label className="text-text-primary mb-2 block text-sm font-medium">
                    Thumbnail (opzionale)
                  </label>
                  <div
                    className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
                      dragThumb
                        ? 'border-purple-500 bg-purple-900'
                        : form.thumb_url
                          ? 'border-green-500 bg-green-900'
                          : 'border-purple-500 bg-background-tertiary hover:border-purple-400'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragThumb(true)
                    }}
                    onDragLeave={() => setDragThumb(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setDragThumb(false)
                      const file = e.dataTransfer.files?.[0]
                      if (file) {
                        handleThumbnailUpload(file)
                      }
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleThumbnailUpload(file)
                      }}
                      className="hidden"
                      id="thumb-upload"
                    />
                    {form.thumb_url ? (
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-sm font-medium">Thumbnail caricata</span>
                        </div>
                        <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-background-secondary">
                          <Image
                            src={form.thumb_url}
                            alt="Thumbnail"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-secondary">
                          <span className="truncate flex-1">{form.thumb_url.split('/').pop()}</span>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, thumb_url: undefined })}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : form.video_url ? (
                      <div className="p-4 space-y-3">
                        <label
                          htmlFor="thumb-upload"
                          className="block cursor-pointer"
                        >
                          <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-background-secondary group">
                            <video
                              src={form.video_url}
                              className="w-full h-full object-contain rounded-lg"
                              preload="metadata"
                              muted
                              playsInline
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-200 flex items-center justify-center">
                              <div className="flex flex-col items-center gap-2 text-white">
                                <div className="bg-purple-500/80 group-hover:bg-purple-500 rounded-full p-2">
                                  <ImageIcon className="h-5 w-5" />
                                </div>
                                <p className="text-xs font-medium">Clicca per aggiungere thumbnail</p>
                              </div>
                            </div>
                          </div>
                        </label>
                        <p className="text-text-tertiary text-xs text-center">JPG, PNG, WEBP • Max 5MB</p>
                      </div>
                    ) : (
                      <label
                        htmlFor="thumb-upload"
                        className="flex flex-col items-center justify-center p-6 cursor-pointer"
                      >
                        <div className="mb-3 bg-purple-900 text-purple-400 rounded-full p-3">
                          {uploadingThumb ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <ImageIcon className="h-6 w-6" />
                          )}
                        </div>
                        <p className="text-text-primary text-sm font-medium mb-1">
                          {uploadingThumb
                            ? 'Caricamento in corso...'
                            : 'Trascina immagine o clicca per selezionare'}
                        </p>
                        <p className="text-text-tertiary text-xs">JPG, PNG, WEBP • Max 5MB</p>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Altri campi */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-2">
                <Clock className="h-4 w-4 text-teal-400" />
                Dettagli aggiuntivi
              </div>
              <Textarea
                label="Descrizione"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Istruzioni di esecuzione, note e suggerimenti..."
                rows={4}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-teal-500/20 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || uploadingVideo || uploadingThumb}
              className="border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200"
            >
              <X className="mr-2 h-4 w-4" />
              Annulla
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || uploadingVideo || uploadingThumb}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salva esercizio
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
