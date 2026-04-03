'use client'

import { useState, useMemo, useRef } from 'react'
import * as React from 'react'
import Image from 'next/image'
import { Filter, Grid3x3, List as ListIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { SimpleSelect } from '@/components/ui/simple-select'
import { useIcon } from '@/components/ui/professional-icons'
import { ViewModeToggle } from '@/components/shared/ui/view-mode-toggle'
import {
  MuscleGroupFilter,
  muscleGroupFilterToDbValue,
  exerciseMatchesMuscleGroupFilter,
  countSelectionByMuscleGroupFilter,
  type MuscleGroupFilterType,
} from '@/components/dashboard/muscle-group-filter'
import type { Exercise, ExerciseFilter, MuscleGroup, Equipment } from '@/types/workout'

function ExerciseImage({
  exercise,
  getMuscleGroupIcon,
  onImageClick,
  selectableCard = false,
  onSelectClick,
}: {
  exercise: Exercise
  getMuscleGroupIcon: (muscleGroup: string) => React.ReactNode
  onImageClick?: () => void
  /** Se true, usa overlay per toggle selezione (il click sul video non propaga bene) */
  selectableCard?: boolean
  /** Chiamato al click sull’area video quando selectableCard: toggle selezione */
  onSelectClick?: () => void
}) {
  const [imageError, setImageError] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // useRef deve essere chiamato sempre, non condizionalmente (regole degli Hooks)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Valida video URL
  const hasVideoUrl =
    exercise.video_url &&
    typeof exercise.video_url === 'string' &&
    exercise.video_url.trim() !== '' &&
    (exercise.video_url.startsWith('http://') || exercise.video_url.startsWith('https://'))

  // Poster (thumbnail) per il video
  const posterUrl = exercise.thumb_url || exercise.image_url || null

  // Priorità: video > immagine > placeholder
  // Se c'è un video URL valido, mostra il video (con poster se disponibile)
  if (hasVideoUrl && !videoError && exercise.video_url) {
    return (
      <div
        className="relative w-full h-full group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {selectableCard && onSelectClick && (
          <div
            className="absolute inset-0 z-10 cursor-pointer [clip-path:inset(0_0_48px_0)]"
            aria-hidden
            onClick={(e) => {
              if (e.detail === 2) return
              onSelectClick()
            }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onImageClick?.()
            }}
          />
        )}
        <video
          ref={videoRef}
          src={exercise.video_url}
          poster={posterUrl || undefined}
          className="h-full w-full rounded-[15px] object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
          muted
          loop
          playsInline
          preload="auto"
          controls
          style={{ display: 'block' }}
          onClick={(e) => {
            if (selectableCard) return
            e.stopPropagation()
            const video = videoRef.current
            if (!video) return

            const rect = video.getBoundingClientRect()
            const clickY = e.clientY - rect.top
            const videoHeight = rect.height
            const controlsHeight = 48
            if (clickY < videoHeight - controlsHeight) {
              if (video.paused) {
                video.play().catch(() => {})
              } else {
                video.pause()
              }
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation()
            if (onImageClick) {
              onImageClick()
            }
          }}
          onError={() => {
            setVideoError(true)
          }}
          onLoadedMetadata={() => {
            const video = videoRef.current
            if (video && isHovering && video.paused) {
              // Se stiamo facendo hover e il video è appena caricato, riproduci
              video.play().catch(() => {
                // Ignora errori di autoplay
              })
            }
          }}
          onCanPlay={() => {
            const video = videoRef.current
            if (video && isHovering && video.paused) {
              // Se stiamo facendo hover e il video è pronto, riproduci
              video.play().catch(() => {
                // Ignora errori di autoplay
              })
            }
          }}
          onMouseEnter={(ev) => {
            const video = ev.currentTarget as HTMLVideoElement
            // Riproduci se il video è pronto
            if (video.paused) {
              // Controlla direttamente readyState invece di aspettare videoReady
              // readyState >= 2 = HAVE_CURRENT_DATA (abbastanza dati per iniziare)
              if (video.readyState >= 2) {
                // Video pronto, riproduci immediatamente
                video.play().catch((err) => {
                  // Ignora errori di autoplay (normali nei browser moderni)
                  console.debug('Autoplay su hover non permesso:', err)
                })
              } else {
                // Video non ancora pronto, aspetta che lo sia
                const handleCanPlay = () => {
                  if (video.paused && isHovering) {
                    video.play().catch((err) => {
                      console.debug('Autoplay su hover non permesso:', err)
                    })
                  }
                }
                video.addEventListener('canplay', handleCanPlay, { once: true })
                // Forza il caricamento se non è già iniziato
                if (video.readyState === 0) {
                  video.load()
                }
              }
            }
          }}
          onMouseLeave={(ev) => {
            const video = ev.currentTarget as HTMLVideoElement
            // Non fermare se l'utente sta interagendo con i controlli o se ha cliccato play
            // Ferma solo se era in autoplay su hover
            if (!video.paused && document.activeElement !== video) {
              // Controlla se l'utente ha interagito manualmente (click su controlli)
              // Se non ha interagito, ferma il video
              const wasUserInteraction = video.getAttribute('data-user-interaction') === 'true'
              if (!wasUserInteraction) {
                video.pause()
                video.currentTime = 0
              }
            }
          }}
          onPlay={() => {
            // Marca che l'utente ha interagito se ha cliccato play manualmente
            const video = videoRef.current
            if (video) {
              video.setAttribute('data-user-interaction', 'true')
            }
          }}
        />
        {/* Fallback overlay se il video non si carica */}
        {videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-tertiary/80 rounded-[15px]">
            {posterUrl && !imageError ? (
              <Image
                src={posterUrl}
                alt={exercise.name}
                fill
                className="object-cover rounded-[15px]"
                unoptimized={posterUrl.startsWith('http')}
                onError={() => {
                  setImageError(true)
                }}
              />
            ) : (
              <>
                <div className="text-4xl opacity-50 mb-2">
                  {getMuscleGroupIcon(exercise.muscle_group)}
                </div>
                <div className="text-xs text-text-tertiary opacity-60">Video non disponibile</div>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  // Se non c'è video ma c'è un'immagine, mostrala
  const imageSrc = exercise.thumb_url || exercise.image_url || null
  if (imageSrc && !imageError) {
    return (
      <div className="relative w-full h-full">
        <Image
          src={imageSrc}
          alt={exercise.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 20vw"
          className="object-cover rounded-[15px] transition-transform duration-300 group-hover:scale-105"
          unoptimized={imageSrc.startsWith('http')}
          onError={() => {
            setImageError(true)
          }}
        />
      </div>
    )
  }

  // Placeholder se non c'è né immagine né video
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center p-4">
      <div className="text-5xl opacity-40 mb-2">{getMuscleGroupIcon(exercise.muscle_group)}</div>
      <div className="text-xs text-text-tertiary opacity-60">Nessuna immagine</div>
    </div>
  )
}

interface ExerciseCatalogProps {
  exercises: Exercise[]
  onExerciseSelect: (exercise: Exercise) => void
  selectedExercises: string[]
  className?: string
  /** Se true, mostra il numero di sequenza (1, 2, 3…) sulle card selezionate (es. modal circuito) */
  showSelectionOrder?: boolean
}

// Dati mock per gruppi muscolari e attrezzature
const muscleGroups: MuscleGroup[] = [
  { id: 'chest', name: 'Petto', icon: '💪' },
  { id: 'back', name: 'Schiena', icon: '🏋️' },
  { id: 'legs', name: 'Gambe', icon: '💪' },
  { id: 'shoulders', name: 'Spalle', icon: '💪' },
  { id: 'arms', name: 'Braccia', icon: '💪' },
  { id: 'core', name: 'Core', icon: '💪' },
  { id: 'cardio', name: 'Cardio', icon: '💪' },
]

const equipment: Equipment[] = [
  { id: 'barbell', name: 'Bilanciere', icon: '💪' },
  { id: 'dumbbell', name: 'Manubri', icon: '💪' },
  { id: 'bodyweight', name: 'Corpo libero', icon: '💪' },
  { id: 'machine', name: 'Macchine', icon: '⚙️' },
  { id: 'cable', name: 'Cavi', icon: '💪' },
  { id: 'kettlebell', name: 'Kettlebell', icon: '💪' },
  { id: 'resistance', name: 'Resistance band', icon: '🎯' },
]

const difficulties = [
  { id: 'bassa', name: 'Principiante', color: 'success' },
  { id: 'media', name: 'Intermedio', color: 'warning' },
  { id: 'alta', name: 'Avanzato', color: 'error' },
]

export function ExerciseCatalog({
  exercises,
  onExerciseSelect,
  selectedExercises,
  className = '',
  showSelectionOrder = false,
}: ExerciseCatalogProps) {
  // Prepara le icone di base
  const defaultMuscleIcon = useIcon('💪', { size: 16, className: 'text-teal-400' })
  const defaultEquipmentIcon = useIcon('🏋️', { size: 16, className: 'text-teal-400' })
  const [muscleGroupFilterId, setMuscleGroupFilterId] = useState<MuscleGroupFilterType | null>(
    'multipli',
  )
  const [filters, setFilters] = useState<ExerciseFilter>({
    search: '',
    muscle_group: 'all',
    equipment: 'all',
    difficulty: 'all',
  })
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; name: string } | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Gestisci chiusura modal con ESC
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedVideo) {
        setSelectedVideo(null)
      }
    }
    if (selectedVideo) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
    return undefined
  }, [selectedVideo])

  // Filtra gli esercizi
  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise: Exercise) => {
      const matchesSearch =
        !filters.search ||
        exercise.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(filters.search.toLowerCase())

      const matchesMuscleGroup = exerciseMatchesMuscleGroupFilter(
        exercise.muscle_group ?? '',
        muscleGroupFilterId,
      )

      const matchesEquipment =
        filters.equipment === 'all' || !filters.equipment
          ? true
          : exercise.equipment === filters.equipment

      const matchesDifficulty =
        filters.difficulty === 'all' || !filters.difficulty
          ? true
          : exercise.difficulty === filters.difficulty

      return matchesSearch && matchesMuscleGroup && matchesEquipment && matchesDifficulty
    })
  }, [exercises, filters, muscleGroupFilterId])

  const { byGroup: muscleGroupSelectionCounts } = useMemo(
    () => countSelectionByMuscleGroupFilter(selectedExercises, exercises),
    [selectedExercises, exercises],
  )

  const handleFilterChange = (key: keyof ExerciseFilter, value: string) => {
    setFilters((prev: ExerciseFilter) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setMuscleGroupFilterId(null)
    setFilters({
      search: '',
      muscle_group: 'all',
      equipment: 'all',
      difficulty: 'all',
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    const diff = difficulties.find((d) => d.id === difficulty)
    return diff?.color || 'default'
  }

  // Prepara tutte le icone per gruppi muscolari e attrezzature
  const muscleGroupIcons = {
    '💪': useIcon('💪', { size: 16, className: 'text-teal-400' }),
    '🏋️': useIcon('🏋️', { size: 16, className: 'text-teal-400' }),
  }

  const equipmentIcons = {
    '🏋️': useIcon('🏋️', { size: 16, className: 'text-teal-400' }),
    '🏃': useIcon('🏃', { size: 16, className: 'text-teal-400' }),
    '🏊': useIcon('🏊', { size: 16, className: 'text-teal-400' }),
  }

  // Funzione per mappare il valore muscle_group dal database all'ID del catalog
  const getMuscleGroupId = (muscleGroupValue: string | null | undefined): string | null => {
    if (!muscleGroupValue) return null

    const normalizedValue = muscleGroupValue.toLowerCase().trim()

    // Mapping diretto per valori comuni dal database
    const muscleGroupMap: Record<string, string> = {
      petto: 'chest',
      pettorali: 'chest',
      schiena: 'back',
      dorsali: 'back',
      gambe: 'legs',
      quadricipiti: 'legs',
      femorali: 'legs',
      polpacci: 'legs',
      glutei: 'legs',
      spalle: 'shoulders',
      deltoidi: 'shoulders',
      braccia: 'arms',
      bicipiti: 'arms',
      tricipiti: 'arms',
      avambracci: 'arms',
      core: 'core',
      addominali: 'core',
      obliqui: 'core',
      lombari: 'core',
      trapezio: 'back',
      romboidi: 'back',
      adduttori: 'legs',
      abduttori: 'legs',
      cardio: 'cardio',
      'full body': 'core',
    }

    // Prova prima con il mapping diretto
    const mappedId = muscleGroupMap[normalizedValue]
    if (mappedId) return mappedId

    // Prova a cercare per ID esatto (case-insensitive)
    const foundById = muscleGroups.find((g: MuscleGroup) => g.id.toLowerCase() === normalizedValue)
    if (foundById) return foundById.id

    // Prova a cercare per nome (case-insensitive, parziale)
    const foundByName = muscleGroups.find(
      (g: MuscleGroup) =>
        g.name.toLowerCase().includes(normalizedValue) ||
        normalizedValue.includes(g.name.toLowerCase()),
    )
    if (foundByName) return foundByName.id

    return null
  }

  // Funzione per ottenere il nome del gruppo muscolare dal database o dal catalog
  const getMuscleGroupName = (muscleGroupValue: string | null | undefined): string => {
    if (!muscleGroupValue) return ''

    const muscleGroupId = getMuscleGroupId(muscleGroupValue)
    if (muscleGroupId) {
      const group = muscleGroups.find((g: MuscleGroup) => g.id === muscleGroupId)
      if (group) return group.name
    }

    // Se non trovato, mostra il valore originale dal database (capitalizzato)
    return muscleGroupValue.charAt(0).toUpperCase() + muscleGroupValue.slice(1).toLowerCase()
  }

  const getMuscleGroupIcon = (muscleGroup: string | null | undefined) => {
    if (!muscleGroup) return defaultMuscleIcon

    const muscleGroupId = getMuscleGroupId(muscleGroup)
    if (!muscleGroupId) return defaultMuscleIcon

    const group = muscleGroups.find((g: MuscleGroup) => g.id === muscleGroupId)
    return group?.icon
      ? muscleGroupIcons[group.icon as keyof typeof muscleGroupIcons] || defaultMuscleIcon
      : defaultMuscleIcon
  }

  // Funzione per mappare il valore equipment dal database all'ID del catalog
  const getEquipmentId = (equipmentValue: string | null | undefined): string | null => {
    if (!equipmentValue) return null

    const normalizedValue = equipmentValue.toLowerCase().trim()

    // Mapping diretto per valori comuni dal database
    const equipmentMap: Record<string, string> = {
      bilanciere: 'barbell',
      manubrio: 'dumbbell',
      manubri: 'dumbbell',
      'corpo libero': 'bodyweight',
      'peso corporeo': 'bodyweight',
      macchine: 'machine',
      macchina: 'machine',
      cavi: 'cable',
      cavo: 'cable',
      kettlebell: 'kettlebell',
      'resistance band': 'resistance',
      'banda elastica': 'resistance',
      'banda di resistenza': 'resistance',
      elastici: 'resistance',
    }

    // Prova prima con il mapping diretto
    const mappedId = equipmentMap[normalizedValue]
    if (mappedId) return mappedId

    // Prova a cercare per ID esatto (case-insensitive)
    const foundById = equipment.find((e: Equipment) => e.id.toLowerCase() === normalizedValue)
    if (foundById) return foundById.id

    // Prova a cercare per nome (case-insensitive, parziale)
    const foundByName = equipment.find(
      (e: Equipment) =>
        e.name.toLowerCase().includes(normalizedValue) ||
        normalizedValue.includes(e.name.toLowerCase()),
    )
    if (foundByName) return foundByName.id

    return null
  }

  // Funzione per ottenere il nome dell'attrezzatura dal database o dal catalog
  const getEquipmentName = (equipmentValue: string | null | undefined): string => {
    if (!equipmentValue) return ''

    const equipmentId = getEquipmentId(equipmentValue)
    if (equipmentId) {
      const eq = equipment.find((e: Equipment) => e.id === equipmentId)
      if (eq) return eq.name
    }

    // Se non trovato, mostra il valore originale dal database (capitalizzato)
    return equipmentValue.charAt(0).toUpperCase() + equipmentValue.slice(1).toLowerCase()
  }

  const getEquipmentIcon = (equipmentType: string | null | undefined) => {
    if (!equipmentType) return defaultEquipmentIcon

    const equipmentId = getEquipmentId(equipmentType)
    if (!equipmentId) return defaultEquipmentIcon

    const eq = equipment.find((e: Equipment) => e.id === equipmentId)
    return eq?.icon
      ? equipmentIcons[eq.icon as keyof typeof equipmentIcons] || defaultEquipmentIcon
      : defaultEquipmentIcon
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Blocco unico: titolo + gruppi muscolari (una riga) + filtri estesi + view toggle */}
      <Card
        variant="default"
        className="rounded-lg p-4 text-text-primary transition-all duration-200 border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:outline-none"
      >
        <CardContent className="p-0 space-y-3">
          {/* Riga 1: Titolo + Filtri button + view toggle */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h3 className="text-text-primary text-lg font-bold">Catalogo Esercizi</h3>
              <p className="text-text-secondary text-sm">
                Scegli gli esercizi per il tuo allenamento
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="border-white/10 text-primary hover:bg-primary/10 hover:border-primary/25"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtri
              </Button>
              <ViewModeToggle
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { value: 'grid', ariaLabel: 'Vista griglia', Icon: Grid3x3 },
                  { value: 'list', ariaLabel: 'Vista lista', Icon: ListIcon },
                ]}
              />
            </div>
          </div>

          {/* Riga 2: filtri gruppo muscolare (una riga, scroll orizzontale se serve) */}
          <div className="min-w-0">
            <div className="overflow-x-auto py-1 scrollbar-thin -mx-0.5">
              <MuscleGroupFilter
                selectedGroup={
                  muscleGroupFilterId ? muscleGroupFilterToDbValue(muscleGroupFilterId) : ''
                }
                onSelect={setMuscleGroupFilterId}
                responsive
                selectionCountsByGroup={muscleGroupSelectionCounts}
                totalSelectedCount={selectedExercises.length}
              />
            </div>
          </div>

          {/* Riga 3: Ricerca + Difficoltà + Attrezzi + Reset (quando "Filtri" aperto) */}
          {showFilters && (
            <div className="flex w-full min-w-0 flex-col gap-3 pt-3 border-t border-white/10 sm:flex-row sm:items-center sm:flex-wrap">
              <div className="w-full min-w-0 sm:min-w-[180px] sm:max-w-[240px]">
                <Input
                  placeholder="Cerca esercizi..."
                  value={filters.search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleFilterChange('search', e.target.value)
                  }
                  leftIcon="🔍"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <SimpleSelect
                  value={filters.difficulty}
                  onValueChange={(value: string) => handleFilterChange('difficulty', value)}
                  placeholder="Tutte le difficoltà"
                  options={[
                    { value: 'all', label: 'Tutte le difficoltà' },
                    ...[...difficulties]
                      .sort((a, b) => a.name.localeCompare(b.name, 'it'))
                      .map((diff: { id: string; name: string }) => ({
                        value: diff.id,
                        label: diff.name,
                      })),
                  ]}
                />
                <SimpleSelect
                  value={filters.equipment}
                  onValueChange={(value: string) => handleFilterChange('equipment', value)}
                  placeholder="Tutti gli attrezzi"
                  options={[
                    { value: 'all', label: 'Tutti gli attrezzi' },
                    ...[...equipment]
                      .sort((a, b) => a.name.localeCompare(b.name, 'it'))
                      .map((eq: Equipment) => ({
                        value: eq.id,
                        label: eq.name,
                      })),
                  ]}
                />
                <Button onClick={clearFilters} variant="ghost" size="sm">
                  Reset filtri
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista esercizi - stesso layout della pagina Dashboard Esercizi */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredExercises.map((exercise) => {
            const isSelected = selectedExercises.includes(exercise.id)
            const selectionIndex =
              showSelectionOrder && isSelected ? selectedExercises.indexOf(exercise.id) + 1 : null

            return (
              <Card
                key={exercise.id}
                variant="default"
                className={cn(
                  'group relative flex min-h-0 flex-col overflow-hidden hover:border-white/20 transition-all duration-300 cursor-pointer rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:outline-none border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)]',
                  isSelected &&
                    'bg-cyan-500/15 border-cyan-400/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_4px_24px_-4px_rgba(0,0,0,0.5)]',
                )}
                onClick={() => onExerciseSelect(exercise)}
              >
                {selectionIndex != null && (
                  <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    <span className="inline-flex items-center transition-all duration-200 bg-green-500 text-white border border-green-500 px-2 py-1 text-xs font-medium rounded-lg shadow-sm">
                      {selectionIndex}
                    </span>
                  </div>
                )}
                <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                  {/* Media in alto - stessa altezza e stile della dashboard */}
                  <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-black/25 via-primary/5 to-transparent">
                    <ExerciseImage
                      exercise={exercise}
                      getMuscleGroupIcon={getMuscleGroupIcon}
                      onImageClick={
                        exercise.video_url &&
                        typeof exercise.video_url === 'string' &&
                        exercise.video_url.trim() !== ''
                          ? () =>
                              setSelectedVideo({ url: exercise.video_url!, name: exercise.name })
                          : undefined
                      }
                      selectableCard
                      onSelectClick={() => onExerciseSelect(exercise)}
                    />
                  </div>
                  <div className="relative flex min-h-0 flex-1 flex-col p-4">
                    <div className="space-y-3">
                      <h3 className="text-white text-lg font-semibold line-clamp-1 transition-colors group-hover:text-primary">
                        {exercise.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/40 bg-teal-500/20 px-2.5 py-1 text-xs font-medium text-teal-400">
                          {getMuscleGroupIcon(exercise.muscle_group)}
                          {getMuscleGroupName(exercise.muscle_group) || 'Non specificato'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-400">
                          {getEquipmentIcon(exercise.equipment)}
                          {getEquipmentName(exercise.equipment) || 'Non specificato'}
                        </span>
                        <span
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-medium',
                            exercise.difficulty === 'bassa' &&
                              'border-green-500/40 bg-green-500/20 text-green-400',
                            exercise.difficulty === 'alta' &&
                              'border-red-500/40 bg-red-500/20 text-red-400',
                            exercise.difficulty === 'media' &&
                              'border-amber-500/40 bg-amber-500/20 text-amber-400',
                          )}
                        >
                          {difficulties.find((d) => d.id === exercise.difficulty)?.name}
                        </span>
                      </div>
                      {exercise.description && (
                        <p className="text-white/70 line-clamp-2 text-xs leading-relaxed">
                          {exercise.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-3 mt-3">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/40 bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-400">
                          ✓ Selezionato
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExercises.map((exercise) => {
            const isSelected = selectedExercises.includes(exercise.id)
            const selectionIndex =
              showSelectionOrder && isSelected ? selectedExercises.indexOf(exercise.id) + 1 : null

            return (
              <Card
                key={exercise.id}
                variant="default"
                className={cn(
                  'group relative overflow-hidden cursor-pointer transition-all duration-200 border border-white/10 border-l-4 border-l-primary/30 hover:border-white/20 hover:border-l-primary/50 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
                  isSelected &&
                    'bg-cyan-500/15 border-cyan-400/40 border-l-cyan-400/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
                )}
                onClick={() => onExerciseSelect(exercise)}
              >
                {selectionIndex != null && (
                  <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    <span className="inline-flex items-center transition-all duration-200 bg-green-500 text-white border border-green-500 px-2 py-1 text-xs font-medium rounded-lg shadow-sm">
                      {selectionIndex}
                    </span>
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Video thumbnail o placeholder */}
                    <div className="relative bg-white/[0.04] border border-white/10 shrink-0 w-32 h-24 flex items-center justify-center rounded-lg overflow-hidden group-hover:shadow-lg transition-shadow">
                      <ExerciseImage
                        exercise={exercise}
                        getMuscleGroupIcon={getMuscleGroupIcon}
                        onImageClick={
                          exercise.video_url &&
                          typeof exercise.video_url === 'string' &&
                          exercise.video_url.trim() !== ''
                            ? () =>
                                setSelectedVideo({ url: exercise.video_url!, name: exercise.name })
                            : undefined
                        }
                        selectableCard
                        onSelectClick={() => onExerciseSelect(exercise)}
                      />
                    </div>

                    {/* Contenuto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="text-text-primary font-semibold text-lg">{exercise.name}</h4>
                        {isSelected && (
                          <Badge variant="success" size="sm" className="shadow-sm flex-shrink-0">
                            ✓ Selezionato
                          </Badge>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge
                          variant="info"
                          size="sm"
                          className="text-xs bg-blue-500 border-blue-500 text-white hover:bg-blue-500/90"
                        >
                          {getMuscleGroupName(exercise.muscle_group) || 'Non specificato'}
                        </Badge>

                        <Badge variant="warning" size="sm" className="text-xs">
                          {getEquipmentIcon(exercise.equipment)}{' '}
                          {getEquipmentName(exercise.equipment) || 'Non specificato'}
                        </Badge>

                        <Badge
                          variant={
                            getDifficultyColor(exercise.difficulty) as
                              | 'default'
                              | 'success'
                              | 'warning'
                              | 'error'
                              | 'info'
                              | 'outline'
                              | 'secondary'
                          }
                          size="sm"
                          className={cn(
                            'text-xs',
                            exercise.difficulty === 'media' &&
                              'bg-orange-500 text-white border-orange-500 hover:bg-orange-500/90',
                          )}
                        >
                          {difficulties.find((d) => d.id === exercise.difficulty)?.name}
                        </Badge>
                      </div>

                      {/* Descrizione */}
                      {exercise.description && (
                        <p className="text-text-secondary text-sm">{exercise.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {filteredExercises.length === 0 && (
        <Card variant="default" className="relative overflow-hidden">
          <CardContent className="py-12 text-center">
            <div className="mb-4 text-6xl opacity-50">🔍</div>
            <h3 className="text-text-primary mb-2 text-lg font-medium">Nessun esercizio trovato</h3>
            <p className="text-text-secondary mb-4 text-sm">
              Prova a modificare i filtri o la ricerca
            </p>
            <Button onClick={clearFilters} variant="outline">
              Cancella filtri
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal fullscreen video */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative max-h-full max-w-5xl w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedVideo(null)}
              className="absolute right-4 top-4 z-50 bg-black/50 text-white hover:bg-black/70 rounded-full"
              aria-label="Chiudi video"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
            <div
              className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={selectedVideo.url}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
              >
                Il tuo browser non supporta la riproduzione video.
              </video>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pointer-events-none">
                <h3 className="text-white text-lg font-semibold drop-shadow-lg">
                  {selectedVideo.name}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
