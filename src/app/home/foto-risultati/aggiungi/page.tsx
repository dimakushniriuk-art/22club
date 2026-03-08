'use client'

import type { ReactElement, RefObject } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageHeaderFixed } from '@/components/layout'
import {
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
} from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { useAuth } from '@/providers/auth-provider'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import { formatDate } from '@/lib/format'
import { useNotify } from '@/lib/ui/notify'
import type { ProgressPhoto } from '@/types/progress'

const BUCKET = 'progress-photos'

type Angle = 'fronte' | 'retro' | 'profilo'

const ANGLE_LABELS: Record<Angle, string> = { fronte: 'Davanti', retro: 'Dietro', profilo: 'Lato' }

const OPTIONS: { angle: Angle; label: string; Figure: (props?: { className?: string }) => ReactElement }[] = [
  {
    angle: 'fronte',
    label: 'Davanti',
    Figure: FigureDavanti,
  },
  {
    angle: 'retro',
    label: 'Dietro',
    Figure: FigureDietro,
  },
  {
    angle: 'profilo',
    label: 'Lato',
    Figure: FigureLato,
  },
]

/** Figura corpo vista da davanti (immagine in public/images/body-davanti.png) */
function FigureDavanti({ className }: { className?: string } = {}) {
  return (
    <Image
      src="/images/body-davanti.png"
      alt="Davanti"
      width={120}
      height={220}
      className={className ?? 'h-full w-auto max-h-full max-w-full'}
      style={{ objectFit: 'contain' }}
    />
  )
}

/** Figura corpo vista da dietro (immagine in public/images/body-dietro.png) */
function FigureDietro({ className }: { className?: string } = {}) {
  return (
    <Image
      src="/images/body-dietro.png"
      alt="Dietro"
      width={120}
      height={220}
      className={className ?? 'h-full w-auto max-h-full max-w-full'}
      style={{ objectFit: 'contain' }}
    />
  )
}

/** Figura corpo vista di lato (immagine in public/images/body-lato.png) */
function FigureLato({ className }: { className?: string } = {}) {
  return (
    <Image
      src="/images/body-lato.png"
      alt="Lato"
      width={80}
      height={220}
      className={className ?? 'h-full w-auto max-h-full max-w-full'}
      style={{ objectFit: 'contain' }}
    />
  )
}

const ALL_ANGLES: Angle[] = ['fronte', 'retro', 'profilo']

export default function AggiungiFotoPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  const { notify } = useNotify()
  const profileId = user?.id ?? null
  const authUserId = user?.user_id ?? null

  const [uploading, setUploading] = useState(false)
  const [choiceOpen, setChoiceOpen] = useState(false)
  const [selectedAngle, setSelectedAngle] = useState<Angle | null>(null)
  const [, setPhotosToday] = useState<ProgressPhoto[]>([])
  const [previewUrls, setPreviewUrls] = useState<Partial<Record<Angle, string>>>({})
  const [addedInThisSession, setAddedInThisSession] = useState<Set<Angle>>(new Set())
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const currentAngleRef = useRef<Angle | null>(null)
  const previewUrlsRef = useRef<Partial<Record<Angle, string>>>({})

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  useEffect(() => {
    if (!profileId) return
    let cancelled = false
    const load = async () => {
      const { data } = await supabase
        .from('progress_photos')
        .select('id, athlete_id, date, angle, image_url, created_at, updated_at')
        .eq('athlete_id', profileId)
        .eq('date', today)
      if (cancelled) return
      setPhotosToday((data ?? []) as ProgressPhoto[])
    }
    load()
    return () => {
      cancelled = true
    }
  }, [profileId, today, supabase])

  useEffect(() => {
    previewUrlsRef.current = previewUrls
    return () => {
      Object.values(previewUrlsRef.current).forEach((u) => {
        try {
          if (u) URL.revokeObjectURL(u)
        } catch {}
      })
    }
  }, [previewUrls])

  const handleCardClick = useCallback((angle: Angle) => {
    currentAngleRef.current = angle
    setSelectedAngle(angle)
    setChoiceOpen(true)
  }, [])

  const handleChooseGallery = useCallback(() => {
    setChoiceOpen(false)
    galleryInputRef.current?.click()
  }, [])

  const handleChooseCamera = useCallback(() => {
    setChoiceOpen(false)
    cameraInputRef.current?.click()
  }, [])

  const allThreeUploaded = useMemo(
    () => ALL_ANGLES.every((a) => addedInThisSession.has(a)),
    [addedInThisSession],
  )

  const handleSalvaLeFoto = useCallback(async () => {
    if (!profileId) return
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('progress_photos')
      .update({ session_saved_at: now })
      .eq('athlete_id', profileId)
      .eq('date', today)
      .is('session_saved_at', null)
    if (error) {
      notify(`Errore: ${error.message}`, 'error')
      return
    }
    notify(`Foto salvate per il ${formatDate(today)}`, 'success')
    router.push('/home/foto-risultati')
  }, [profileId, today, supabase, notify, router])

  const handleFileChange = useCallback(
    async (ref: RefObject<HTMLInputElement | null>) => {
      const file = ref.current?.files?.[0]
      const angle = currentAngleRef.current
      if (!file || !angle || !profileId || !authUserId) return
      if (!file.type.startsWith('image/')) {
        notify('Seleziona un\'immagine', 'error')
        return
      }

      setUploading(true)
      try {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${authUserId}/${today}-${angle}-${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: false })

        if (uploadError) {
          notify(`Errore caricamento: ${uploadError.message}`, 'error')
          return
        }

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
        const { data: newRow, error: insertError } = await supabase
          .from('progress_photos')
          .insert({
            athlete_id: profileId,
            date: today,
            angle,
            image_url: urlData.publicUrl,
            note: null,
          })
          .select('id, athlete_id, date, angle, image_url, created_at, updated_at')
          .single()

        if (insertError) {
          notify(`Errore salvataggio: ${insertError.message}`, 'error')
          return
        }

        setPhotosToday((prev) => [...prev, newRow as ProgressPhoto])
        setAddedInThisSession((prev) => new Set(prev).add(angle))
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrls((prev) => {
          if (prev[angle]) URL.revokeObjectURL(prev[angle]!)
          return { ...prev, [angle]: objectUrl }
        })
        notify(`Foto "${ANGLE_LABELS[angle]}" salvata`, 'success')
      } catch (e) {
        notify(e instanceof Error ? e.message : 'Errore durante l\'upload', 'error')
      } finally {
        setUploading(false)
        if (galleryInputRef.current) galleryInputRef.current.value = ''
        if (cameraInputRef.current) cameraInputRef.current.value = ''
        currentAngleRef.current = null
      }
    },
    [profileId, authUserId, today, supabase, notify],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-auto px-3 pt-24 pb-24 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 py-4 min-[834px]:py-5 space-y-4 min-[834px]:space-y-5">
        <PageHeaderFixed
          title="Aggiungi foto"
          subtitle="Scegli la vista e scatta: si aprirà la fotocamera"
          backHref="/home/foto-risultati"
          icon={<ImageIcon className="h-5 w-5 text-cyan-400" />}
        />

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={() => handleFileChange(galleryInputRef)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={() => handleFileChange(cameraInputRef)}
      />

      <Dialog open={choiceOpen} onOpenChange={setChoiceOpen}>
        <DialogContent className="bg-background border-cyan-500/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-text-primary">
              {selectedAngle ? OPTIONS.find((o) => o.angle === selectedAngle)?.label : 'Aggiungi foto'}
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              {selectedAngle && addedInThisSession.has(selectedAngle)
                ? 'Aggiungi un\'altra foto: carica da galleria o scatta.'
                : 'Carica un\'immagine dalla galleria o scatta una nuova foto.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleChooseGallery}
              className="w-full gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500 text-cyan-950 hover:bg-cyan-400"
            >
              <ImagePlus className="h-4 w-4" />
              Carica da galleria
            </Button>
            <Button
              onClick={handleChooseCamera}
              variant="outline"
              className="w-full gap-2 rounded-xl border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/20"
            >
              <Camera className="h-4 w-4" />
              Scatta foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* 3 pulsanti con figure */}
        <div className="grid grid-cols-3 gap-2 min-[834px]:gap-4">
          {OPTIONS.map(({ angle, label, Figure }) => (
            <button
              key={angle}
              type="button"
              onClick={() => handleCardClick(angle)}
              disabled={uploading}
              className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-background-secondary/50 backdrop-blur-sm p-3 min-[834px]:p-4 transition-all duration-300 hover:border-cyan-400/50 disabled:opacity-60 disabled:pointer-events-none min-h-[180px] min-[834px]:min-h-[200px]"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-cyan-500/40" />
              {addedInThisSession.has(angle) && (
                <div className="absolute top-2 right-2 z-20 rounded-full bg-state-valid/90 p-0.5" title="Aggiunta in questo inserimento">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 text-center flex-1 min-h-0 w-full">
                <div className="text-cyan-400/90 group-hover:text-cyan-300 transition-colors flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden rounded-lg [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:w-auto [&>img]:max-h-full [&>img]:max-w-full [&>img]:w-auto [&>img]:h-full [&>img]:object-cover relative">
                  {previewUrls[angle] ? (
                    <Image
                      src={previewUrls[angle]}
                      alt={label}
                      className="h-full w-full object-cover rounded-lg"
                      fill
                      unoptimized
                    />
                  ) : (
                    <Figure />
                  )}
                </div>
                <span className="font-semibold text-text-primary text-sm min-[834px]:text-base shrink-0">
                  {addedInThisSession.has(angle) ? `${label} · Tocca per aggiungere` : label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {uploading && (
          <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            Caricamento in corso...
          </div>
        )}

        <p className="text-text-tertiary text-xs min-[834px]:text-sm text-center px-2">
          Tocca una figura: potrai caricare un&apos;immagine dalla galleria o scattare una nuova foto. Verrà salvata come &quot;Davanti&quot;, &quot;Dietro&quot; o &quot;Lato&quot;.
        </p>

        {allThreeUploaded && (
          <div className="flex flex-col items-center gap-2 pt-2">
            <Button
              onClick={handleSalvaLeFoto}
              className="w-full max-w-xs min-h-[44px] min-[834px]:h-10 gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500 text-cyan-950 hover:bg-cyan-400 font-semibold text-sm min-[834px]:text-base"
            >
              <CheckCircle2 className="h-4 w-4 min-[834px]:h-5 min-[834px]:w-5" />
              Salva le foto
            </Button>
            <span className="text-text-tertiary text-[10px] min-[834px]:text-xs">
              Abbinate alla data odierna ({formatDate(today)})
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
