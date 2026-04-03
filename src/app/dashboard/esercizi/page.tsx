'use client'

import { useEffect, useMemo, useState, useCallback, lazy, Suspense, useRef } from 'react'
import Image from 'next/image'
import { createLogger } from '@/lib/logger'
import { ExerciseMedia } from '@/components/dashboard/exercise-media'
import { apiGet, apiDelete } from '@/lib/api-client'
import { supabase } from '@/lib/supabase/client'

const logger = createLogger('app:dashboard:esercizi:page')
import {
  Card,
  CardContent,
  Button,
  Input,
  SimpleSelect,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { StaffLazyChunkFallback } from '@/components/layout/route-loading-skeletons'
import { useToast } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import {
  MuscleGroupFilter,
  muscleGroupFilterToDbValue,
  exerciseMatchesMuscleGroupFilter,
  type MuscleGroupFilterType,
} from '@/components/dashboard/muscle-group-filter'
import { EQUIPMENT } from '@/lib/exercises-data'
import { designColorato } from '@/lib/design-tokens'
import {
  Search,
  Grid3x3,
  TableIcon,
  Plus,
  RefreshCw,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Dumbbell,
  Edit2,
  Clock,
  XCircle,
  Filter,
} from 'lucide-react'
import { ViewModeToggle } from '@/components/shared/ui/view-mode-toggle'

import type { Exercise } from '@/types/exercise'

// Lazy load ExerciseFormModal per ridurre bundle size iniziale
const ExerciseFormModal = lazy(() =>
  import('@/components/dashboard/exercise-form-modal').then((mod) => ({
    default: mod.ExerciseFormModal,
  })),
)

const ESERCIZI_VIEW_KEY = 'esercizi-page-view'
const ESERCIZI_SORT_KEY = 'esercizi-page-sort'

function getStoredView(): 'grid' | 'table' {
  if (typeof window === 'undefined') return 'grid'
  const v = localStorage.getItem(ESERCIZI_VIEW_KEY)
  return v === 'table' ? 'table' : 'grid'
}

function getStoredSort(): {
  field: 'name' | 'muscle_group' | 'equipment' | 'difficulty' | 'updated_at'
  direction: 'asc' | 'desc'
} {
  if (typeof window === 'undefined') return { field: 'name', direction: 'asc' }
  try {
    const raw = localStorage.getItem(ESERCIZI_SORT_KEY)
    if (!raw) return { field: 'name', direction: 'asc' }
    const parsed = JSON.parse(raw) as { field?: string; direction?: string }
    const field = ['name', 'muscle_group', 'equipment', 'difficulty', 'updated_at'].includes(
      parsed?.field as string,
    )
      ? (parsed.field as 'name' | 'muscle_group' | 'equipment' | 'difficulty' | 'updated_at')
      : 'name'
    const direction = parsed?.direction === 'desc' ? 'desc' : 'asc'
    return { field, direction }
  } catch {
    return { field: 'name', direction: 'asc' }
  }
}

const normalizeDifficulty = (value: string | null | undefined): Exercise['difficulty'] => {
  if (!value) return 'media'
  switch (value) {
    case 'bassa':
    case 'media':
    case 'alta':
      return value
    case 'easy':
    case 'beginner':
      return 'bassa'
    case 'medium':
      return 'media'
    case 'hard':
    case 'advanced':
      return 'alta'
    default:
      return 'media'
  }
}

const getDifficultyLabel = (difficulty: Exercise['difficulty'] | null | undefined): string => {
  if (!difficulty) return '-'
  switch (difficulty) {
    case 'bassa':
      return 'Principiante'
    case 'media':
      return 'Intermedio'
    case 'alta':
      return 'Avanzato'
    default:
      return difficulty
  }
}

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Tutte le difficoltà' },
  { value: 'bassa', label: 'Principiante' },
  { value: 'media', label: 'Intermedio' },
  { value: 'alta', label: 'Avanzato' },
] as const

const DIFF_ORDER: Record<Exercise['difficulty'], number> = { bassa: 1, media: 2, alta: 3 }

function EserciziEmptyState({
  hasActiveFilters,
  onOpenForm,
}: {
  hasActiveFilters: boolean
  onOpenForm: () => void
}) {
  return (
    <div className="py-16 text-center">
      <div className="mb-6 flex justify-center">
        <div className="bg-primary/20 text-primary rounded-full p-6 animate-[pulse_2s_ease-in-out_infinite]">
          <Search className="h-12 w-12" />
        </div>
      </div>
      <h3 className="text-text-primary mb-2 text-xl font-semibold">Nessun esercizio trovato</h3>
      <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">
        {hasActiveFilters
          ? 'Prova a modificare i filtri di ricerca per trovare gli esercizi che stai cercando.'
          : 'Inizia creando il tuo primo esercizio nel catalogo.'}
      </p>
      {!hasActiveFilters && (
        <Button
          onClick={onOpenForm}
          className="bg-primary text-black font-semibold shadow-[0_0_18px_rgba(0,255,200,0.35)] hover:shadow-[0_0_28px_rgba(0,255,200,0.55)] hover:scale-[1.02] transition-all duration-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Crea primo esercizio
        </Button>
      )}
    </div>
  )
}

export default function EserciziPage() {
  const { addToast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [items, setItems] = useState<Exercise[]>([])
  const [loadError, setLoadError] = useState<Error | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Exercise | null | undefined>(null)
  const [view, setView] = useState<'grid' | 'table'>(getStoredView)
  const [sortField, setSortField] = useState<
    'name' | 'muscle_group' | 'equipment' | 'difficulty' | 'updated_at'
  >(getStoredSort().field)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(getStoredSort().direction)

  // Filtri a pill
  const [difficultyFilter, setDifficultyFilter] = useState<Exercise['difficulty'] | ''>('')
  const [equipmentFilter, setEquipmentFilter] = useState<string>('')
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<MuscleGroupFilterType | null>(
    'multipli',
  )
  const [showFilters, setShowFilters] = useState(false)
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [tableScrollTop, setTableScrollTop] = useState(0)
  const [tableContainerHeight, setTableContainerHeight] = useState(400)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const TABLE_ROW_HEIGHT = 56
  const VIRTUAL_THRESHOLD = 80

  useEffect(() => {
    const onScroll = () => setShowBackToTop(typeof window !== 'undefined' && window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = items.filter((e) => {
      if (difficultyFilter && e.difficulty !== difficultyFilter) return false
      if (equipmentFilter && (e.equipment || '').toLowerCase() !== equipmentFilter.toLowerCase())
        return false
      if (!exerciseMatchesMuscleGroupFilter(e.muscle_group || '', muscleGroupFilter)) return false
      if (!q) return true
      // Ricerca per parole: ogni parola deve essere contenuta in nome, gruppo o attrezzo
      const words = q.split(/\s+/).filter(Boolean)
      const nameLower = e.name.toLowerCase()
      const muscleLower = (e.muscle_group || '').toLowerCase()
      const equipmentLower = (e.equipment || '').toLowerCase()
      return words.every(
        (word) =>
          nameLower.includes(word) || muscleLower.includes(word) || equipmentLower.includes(word),
      )
    })

    // Applica sorting
    const sorted = [...base].sort((a, b) => {
      let aVal: string | number | undefined
      let bVal: string | number | undefined

      switch (sortField) {
        case 'name':
          aVal = a.name?.toLowerCase() || ''
          bVal = b.name?.toLowerCase() || ''
          break
        case 'muscle_group':
          aVal = a.muscle_group?.toLowerCase() || ''
          bVal = b.muscle_group?.toLowerCase() || ''
          break
        case 'equipment':
          aVal = a.equipment?.toLowerCase() || ''
          bVal = b.equipment?.toLowerCase() || ''
          break
        case 'difficulty':
          aVal = DIFF_ORDER[a.difficulty || 'media'] ?? 2
          bVal = DIFF_ORDER[b.difficulty || 'media'] ?? 2
          break
        case 'updated_at':
          aVal = a.updated_at ? new Date(a.updated_at).getTime() : 0
          bVal = b.updated_at ? new Date(b.updated_at).getTime() : 0
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [items, query, difficultyFilter, equipmentFilter, muscleGroupFilter, sortField, sortDirection])

  // Usa la lista completa degli attrezzi e aggiungi quelli già presenti nel DB
  const equipments = useMemo(() => {
    const extractedEquipments = Array.from(
      new Set(items.map((i) => (i.equipment || '').trim()).filter(Boolean)),
    )
    // Unisci lista completa con quelli esistenti nel DB
    const allEquipments = Array.from(new Set([...EQUIPMENT, ...extractedEquipments])).sort()
    return allEquipments
  }, [items])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      // Usa API route su web, Supabase client su mobile
      const response = await apiGet<{ data: (Exercise & { difficulty?: string | null })[] }>(
        '/api/exercises',
        {},
        // Fallback Supabase (usato su mobile o se API fallisce)
        async () => {
          const { data: exercises, error } = await supabase
            .from('exercises')
            .select('*')
            .order('name', { ascending: true })

          if (error) throw error

          return { data: (exercises || []) as (Exercise & { difficulty?: string | null })[] }
        },
      )

      // apiGet estrae già data.data (riga 106 di api-client.ts), quindi response è già l'array
      // Ma il tipo generico dice { data: [...] }, quindi verifichiamo entrambi i casi
      const exercisesArray = Array.isArray(response) ? response : response?.data || []

      const normalized = exercisesArray.map((item) => ({
        ...item,
        difficulty: normalizeDifficulty(item.difficulty),
      }))
      setItems(normalized)
      setLoadError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      logger.error('Errore nel caricamento esercizi', err)
      setLoadError(error)
      addToast({
        title: 'Errore',
        message: error.message,
        variant: 'error',
      })
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const handleDelete = useCallback((exercise: Exercise) => {
    setExerciseToDelete(exercise)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!exerciseToDelete) return

    setIsDeleting(true)
    try {
      // Usa API route su web, Supabase client su mobile
      await apiDelete(
        `/api/exercises?id=${exerciseToDelete.id}`,
        // Fallback Supabase (usato su mobile o se API fallisce)
        async () => {
          const { error } = await supabase.from('exercises').delete().eq('id', exerciseToDelete.id)
          if (error) throw error
          return { success: true }
        },
      )

      addToast({
        title: 'Eliminato',
        message: `Esercizio "${exerciseToDelete.name}" eliminato con successo`,
        variant: 'success',
      })

      await load()
      setDeleteDialogOpen(false)
      setExerciseToDelete(null)
    } catch (err) {
      addToast({
        title: 'Errore',
        message: err instanceof Error ? err.message : "Errore durante l'eliminazione",
        variant: 'error',
      })
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
      setExerciseToDelete(null)
    }
  }, [exerciseToDelete, addToast, load])

  const handleSort = useCallback(
    (field: typeof sortField) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      } else {
        setSortField(field)
        setSortDirection('asc')
      }
    },
    [sortField, sortDirection],
  )

  const getSortIcon = useCallback(
    (field: typeof sortField) => {
      if (sortField !== field) {
        return <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />
      }
      return sortDirection === 'asc' ? (
        <ArrowUp className="ml-1 h-4 w-4" />
      ) : (
        <ArrowDown className="ml-1 h-4 w-4" />
      )
    },
    [sortField, sortDirection],
  )

  // Verifica se ci sono filtri attivi
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      query.trim() ||
      difficultyFilter ||
      equipmentFilter ||
      muscleGroupFilter == null ||
      muscleGroupFilter !== 'multipli',
    )
  }, [query, difficultyFilter, equipmentFilter, muscleGroupFilter])

  // Reset di tutti i filtri
  const handleResetFilters = useCallback(() => {
    setQuery('')
    setDifficultyFilter('')
    setEquipmentFilter('')
    setMuscleGroupFilter('multipli')
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Prefetch form modal al mount
  useEffect(() => {
    import('@/components/dashboard/exercise-form-modal')
  }, [])

  // Persistenza vista e ordinamento
  useEffect(() => {
    localStorage.setItem(ESERCIZI_VIEW_KEY, view)
  }, [view])
  useEffect(() => {
    localStorage.setItem(
      ESERCIZI_SORT_KEY,
      JSON.stringify({ field: sortField, direction: sortDirection }),
    )
  }, [sortField, sortDirection])

  // Misura altezza container tabella per virtualizzazione
  useEffect(() => {
    const el = tableScrollRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setTableContainerHeight(el.clientHeight))
    ro.observe(el)
    setTableContainerHeight(el.clientHeight)
    return () => ro.disconnect()
  }, [view])

  const useVirtualTable = filtered.length > VIRTUAL_THRESHOLD
  const virtualStart = useVirtualTable
    ? Math.max(0, Math.floor(tableScrollTop / TABLE_ROW_HEIGHT) - 2)
    : 0
  const virtualEnd = useVirtualTable
    ? Math.min(
        filtered.length,
        virtualStart + Math.ceil(tableContainerHeight / TABLE_ROW_HEIGHT) + 4,
      )
    : filtered.length
  const virtualSlice = useVirtualTable ? filtered.slice(virtualStart, virtualEnd) : filtered

  return (
    <StaffContentLayout
      title="Esercizi"
      description="Catalogo esercizi per costruire e aggiornare le schede."
      theme="teal"
      actions={
        <div className="flex gap-2">
          <Button
            onClick={load}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-white/10 hover:border-primary/20"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          <Button
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
            size="sm"
            variant="primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Esercizio
          </Button>
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Banner errore caricamento con retry */}
        {loadError && (
          <Card variant="trainer" className="border-red-500/30 bg-red-500/10">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-red-200">
                Errore durante il caricamento: {loadError.message}
              </p>
              <Button
                onClick={() => void load()}
                variant="outline"
                size="sm"
                className="border-red-500/40 text-red-200 hover:bg-red-500/20 shrink-0"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Riprova
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Ricerca e Filtri - stessa card compatta del wizard Catalogo Esercizi */}
        <div className="relative p-4">
          <Card
            variant="default"
            className="rounded-lg p-4 text-text-primary transition-all duration-200 border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:outline-none"
          >
            <CardContent className="p-0 space-y-3">
              {/* Riga 1: Titolo + Filtri + Griglia/Tabella */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <h3 className="text-text-primary text-lg font-bold">Libreria</h3>
                  <p className="text-text-secondary text-sm">
                    Filtra gli esercizi per gruppo muscolare, difficoltà e attrezzo
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
                    value={view}
                    onChange={setView}
                    options={[
                      { value: 'grid', ariaLabel: 'Vista griglia', Icon: Grid3x3 },
                      { value: 'table', ariaLabel: 'Vista tabella', Icon: TableIcon },
                    ]}
                  />
                </div>
              </div>

              {/* Riga 2: Gruppi muscolari sempre visibili (una riga, responsive) */}
              <div className="min-w-0">
                <label className="text-text-secondary text-xs font-medium mb-1.5 block">
                  Gruppi muscolari
                </label>
                <div className="overflow-x-auto py-1 scrollbar-thin -mx-0.5">
                  <MuscleGroupFilter
                    selectedGroup={
                      muscleGroupFilter ? muscleGroupFilterToDbValue(muscleGroupFilter) : ''
                    }
                    onSelect={(filterId) => {
                      setMuscleGroupFilter(filterId)
                    }}
                    responsive
                  />
                </div>
              </div>

              {/* Riga 3: Ricerca + Difficoltà + Attrezzi + Reset (quando "Filtri" aperto) */}
              {showFilters && (
                <div className="flex flex-row items-center gap-3 pt-3 border-t border-white/10 w-full flex-nowrap min-w-0">
                  <div className="flex-1 min-w-0">
                    <Input
                      placeholder="Cerca per nome, gruppo muscolare o attrezzo"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      leftIcon={<Search className="h-4 w-4" />}
                      className="w-full bg-white/[0.04] border-white/10 placeholder:text-white/35 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 transition-colors"
                    />
                  </div>
                  <SimpleSelect
                    value={difficultyFilter || 'all'}
                    onValueChange={(value) =>
                      setDifficultyFilter(value === 'all' ? '' : (value as Exercise['difficulty']))
                    }
                    placeholder="Tutte le difficoltà"
                    options={[
                      DIFFICULTY_OPTIONS[0],
                      ...DIFFICULTY_OPTIONS.slice(1)
                        .map((o) => ({ value: o.value, label: o.label }))
                        .sort((a, b) => a.label.localeCompare(b.label, 'it')),
                    ]}
                    className="w-[180px] shrink-0 [&_button]:bg-white/[0.04] [&_button]:border-white/10 [&_button]:hover:bg-white/[0.06] [&_button]:focus:ring-primary [&_button]:focus:border-primary"
                  />
                  <SimpleSelect
                    value={equipmentFilter || 'all'}
                    onValueChange={(value) => setEquipmentFilter(value === 'all' ? '' : value)}
                    placeholder="Tutti gli attrezzi"
                    options={[
                      { value: 'all', label: 'Tutti gli attrezzi' },
                      ...equipments
                        .map((eq) => ({ value: eq, label: eq }))
                        .sort((a, b) => a.label.localeCompare(b.label, 'it')),
                    ]}
                    className="w-[180px] shrink-0 [&_button]:bg-white/[0.04] [&_button]:border-white/10 [&_button]:hover:bg-white/[0.06] [&_button]:focus:ring-primary [&_button]:focus:border-primary"
                  />
                  {hasActiveFilters && (
                    <Button
                      onClick={handleResetFilters}
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reset filtri
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && items.length === 0 ? null : (
          <>
            <div role="status" aria-live="polite" className="sr-only">
              {filtered.length === 1
                ? '1 esercizio trovato'
                : `${filtered.length} esercizi trovati`}
            </div>
            {view === 'grid' ? (
              <div className="relative p-4">
                <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-text-primary">
                  <span className="text-sm font-medium">Libreria</span>
                  <span className="text-white font-semibold">
                    {filtered.length}{' '}
                    {filtered.length === 1 ? 'esercizio trovato' : 'esercizi trovati'}
                  </span>
                </div>
                {filtered.length === 0 ? (
                  <EserciziEmptyState
                    hasActiveFilters={hasActiveFilters}
                    onOpenForm={() => {
                      setEditing(null)
                      setShowForm(true)
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((e) => (
                      <Card
                        key={e.id}
                        variant="default"
                        className="group relative flex min-h-0 flex-col overflow-hidden hover:border-white/20 transition-all duration-300 cursor-pointer"
                      >
                        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                          <ExerciseMedia exercise={e} />
                          <div className="relative flex min-h-0 flex-1 flex-col p-4">
                            <div className="space-y-3">
                              <h3 className="text-white text-lg font-semibold line-clamp-1 transition-colors group-hover:text-primary">
                                {e.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2">
                                {e.muscle_group && (
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${designColorato.palette.teal.border} ${designColorato.palette.teal.bg} ${designColorato.palette.teal.text}`}
                                  >
                                    <Dumbbell className="h-3 w-3" />
                                    {e.muscle_group}
                                  </span>
                                )}
                                {e.equipment && (
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${designColorato.palette.blue.border} ${designColorato.palette.blue.bg} ${designColorato.palette.blue.text}`}
                                  >
                                    <Dumbbell className="h-3 w-3" />
                                    {e.equipment}
                                  </span>
                                )}
                                {e.duration_seconds && (
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${designColorato.palette.green.border} ${designColorato.palette.green.bg} ${designColorato.palette.green.text}`}
                                  >
                                    <Clock className="h-3 w-3" />
                                    {e.duration_seconds}s
                                  </span>
                                )}
                              </div>
                              {e.description && (
                                <p className="text-white/70 line-clamp-2 text-xs leading-relaxed">
                                  {e.description}
                                </p>
                              )}
                            </div>
                            <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium border ${
                                  e.difficulty === 'bassa'
                                    ? `${designColorato.palette.green.border} ${designColorato.palette.green.bg} ${designColorato.palette.green.text}`
                                    : e.difficulty === 'alta'
                                      ? 'border-red-500/40 bg-red-500/20 text-red-400'
                                      : `${designColorato.palette.yellow.border} ${designColorato.palette.yellow.bg} ${designColorato.palette.yellow.text}`
                                }`}
                              >
                                {e.difficulty === 'bassa'
                                  ? 'Principiante'
                                  : e.difficulty === 'alta'
                                    ? 'Avanzato'
                                    : 'Intermedio'}
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 gap-1.5 border border-white/10 text-text-primary hover:bg-primary/10 hover:border-primary/20 transition-all duration-200"
                                  onClick={(ev) => {
                                    ev.stopPropagation()
                                    setEditing(e)
                                    setShowForm(true)
                                  }}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                  <span className="text-xs font-medium">Modifica</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200"
                                  onClick={(ev) => {
                                    ev.stopPropagation()
                                    handleDelete(e)
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative p-4">
                <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-text-primary">
                  <span className="text-sm font-medium">Elenco esercizi</span>
                  <span className="text-white font-semibold">
                    {filtered.length}{' '}
                    {filtered.length === 1 ? 'esercizio trovato' : 'esercizi trovati'}
                  </span>
                </div>
                {filtered.length === 0 ? (
                  <EserciziEmptyState
                    hasActiveFilters={hasActiveFilters}
                    onOpenForm={() => {
                      setEditing(null)
                      setShowForm(true)
                    }}
                  />
                ) : (
                  <div
                    ref={view === 'table' ? tableScrollRef : undefined}
                    onScroll={
                      useVirtualTable
                        ? (e) => setTableScrollTop(e.currentTarget.scrollTop)
                        : undefined
                    }
                    className={
                      useVirtualTable
                        ? 'max-h-[60vh] overflow-y-auto rounded-lg border border-white/5'
                        : undefined
                    }
                  >
                    <div
                      style={
                        useVirtualTable
                          ? { minHeight: filtered.length * TABLE_ROW_HEIGHT }
                          : undefined
                      }
                    >
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Video</TableHead>
                            <TableHead
                              className="cursor-pointer select-none hover:text-text-primary"
                              onClick={() => handleSort('name')}
                            >
                              <div className="flex items-center">
                                Nome
                                {getSortIcon('name')}
                              </div>
                            </TableHead>
                            <TableHead
                              className="cursor-pointer select-none hover:text-text-primary"
                              onClick={() => handleSort('muscle_group')}
                            >
                              <div className="flex items-center">
                                Gruppo
                                {getSortIcon('muscle_group')}
                              </div>
                            </TableHead>
                            <TableHead
                              className="cursor-pointer select-none hover:text-text-primary"
                              onClick={() => handleSort('equipment')}
                            >
                              <div className="flex items-center">
                                Attrezzo
                                {getSortIcon('equipment')}
                              </div>
                            </TableHead>
                            <TableHead
                              className="cursor-pointer select-none hover:text-text-primary"
                              onClick={() => handleSort('difficulty')}
                            >
                              <div className="flex items-center">
                                Difficoltà
                                {getSortIcon('difficulty')}
                              </div>
                            </TableHead>
                            <TableHead
                              className="cursor-pointer select-none hover:text-text-primary"
                              onClick={() => handleSort('updated_at')}
                            >
                              <div className="flex items-center">
                                Aggiornato
                                {getSortIcon('updated_at')}
                              </div>
                            </TableHead>
                            <TableHead className="text-right">Azioni</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {useVirtualTable && virtualStart > 0 && (
                            <TableRow style={{ height: virtualStart * TABLE_ROW_HEIGHT }}>
                              <TableCell colSpan={8} className="p-0 border-0 h-0" />
                            </TableRow>
                          )}
                          {virtualSlice.map((e) => (
                            <TableRow
                              key={e.id}
                              style={useVirtualTable ? { height: TABLE_ROW_HEIGHT } : undefined}
                            >
                              <TableCell>
                                {e.thumb_url ? (
                                  <Image
                                    src={e.thumb_url}
                                    alt={e.name}
                                    width={80}
                                    height={48}
                                    className="h-12 w-20 rounded object-cover"
                                    unoptimized={e.thumb_url.startsWith('http')}
                                  />
                                ) : e.video_url ? (
                                  <div className="relative h-12 w-20 rounded overflow-hidden bg-background-tertiary">
                                    <video
                                      src={e.video_url}
                                      className="h-full w-full object-cover rounded"
                                      preload="metadata"
                                      muted
                                      playsInline
                                      style={{ display: 'block' }}
                                      onMouseEnter={(e) => {
                                        const video = e.currentTarget
                                        video.play().catch(() => {
                                          // Ignora errori di autoplay
                                        })
                                      }}
                                      onMouseLeave={(e) => {
                                        const video = e.currentTarget
                                        video.pause()
                                        video.currentTime = 0
                                      }}
                                      onError={() => {
                                        // In caso di errore, mostra un placeholder
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="bg-background-tertiary h-12 w-20 rounded" />
                                )}
                              </TableCell>
                              <TableCell>{e.name}</TableCell>
                              <TableCell>{e.muscle_group || '-'}</TableCell>
                              <TableCell>{e.equipment || '-'}</TableCell>
                              <TableCell>{getDifficultyLabel(e.difficulty)}</TableCell>
                              <TableCell>
                                {e.updated_at ? new Date(e.updated_at).toLocaleDateString() : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-background-secondary/30 border border-white/5 text-text-primary hover:bg-primary/10 hover:border-primary/20 transition-all duration-200"
                                    onClick={() => {
                                      setEditing(e)
                                      setShowForm(true)
                                    }}
                                  >
                                    Modifica
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200"
                                    onClick={() => handleDelete(e)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {useVirtualTable && virtualEnd < filtered.length && (
                            <TableRow
                              style={{
                                height: (filtered.length - virtualEnd) * TABLE_ROW_HEIGHT,
                              }}
                            >
                              <TableCell colSpan={8} className="p-0 border-0 h-0" />
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal per creare/modificare esercizio - Lazy loaded solo quando aperto */}
        {showForm && (
          <Suspense
            fallback={<StaffLazyChunkFallback className="min-h-[280px] max-w-lg mx-auto" label="Caricamento modulo…" />}
          >
            <ExerciseFormModal
              open={showForm}
              onOpenChange={(open) => {
                setShowForm(open)
                if (!open) {
                  setEditing(null)
                }
              }}
              editing={editing}
              onSuccess={load}
            />
          </Suspense>
        )}

        {/* Dialog conferma eliminazione esercizio */}
        {exerciseToDelete && (
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (!open) setExerciseToDelete(null)
            }}
            title="Elimina esercizio"
            description={`Sei sicuro di voler eliminare "${exerciseToDelete.name}"? Questa azione non può essere annullata.`}
            confirmText="Elimina"
            cancelText="Annulla"
            variant="destructive"
            onConfirm={handleDeleteConfirm}
            loading={isDeleting}
          />
        )}

        {/* Torna su - bottone rotondo fisso in basso a destra */}
        {showBackToTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Torna su"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
    </StaffContentLayout>
  )
}
