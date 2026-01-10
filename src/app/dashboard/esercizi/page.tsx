'use client'

import { useEffect, useMemo, useState, useCallback, lazy, Suspense } from 'react'
import Image from 'next/image'
import { createLogger } from '@/lib/logger'
import { ExerciseMedia } from '@/components/dashboard/exercise-media'

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
import { useToast } from '@/components/ui/toast'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import {
  MuscleGroupFilter,
  muscleGroupFilterToDbValue,
  dbValueMatchesFilter,
  type MuscleGroupFilterType,
} from '@/components/dashboard/muscle-group-filter'
import { EQUIPMENT } from '@/lib/exercises-data'
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

import type { Exercise } from '@/types/exercise'

// Lazy load ExerciseFormModal per ridurre bundle size iniziale
const ExerciseFormModal = lazy(() =>
  import('@/components/dashboard/exercise-form-modal').then((mod) => ({
    default: mod.ExerciseFormModal,
  })),
)

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

export default function EserciziPage() {
  const { addToast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [items, setItems] = useState<Exercise[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Exercise | null | undefined>(null)
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [sortField, setSortField] = useState<
    'name' | 'muscle_group' | 'equipment' | 'difficulty' | 'updated_at'
  >('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Filtri a pill
  const [difficultyFilter, setDifficultyFilter] = useState<Exercise['difficulty'] | ''>('')
  const [groupFilter, setGroupFilter] = useState<string>('')
  const [equipmentFilter, setEquipmentFilter] = useState<string>('')
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<MuscleGroupFilterType | null>(null)
  const [showFilters, setShowFilters] = useState(true) // Filtri visibili di default

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = items.filter((e) => {
      if (difficultyFilter && e.difficulty !== difficultyFilter) return false
      if (groupFilter && (e.muscle_group || '').toLowerCase() !== groupFilter.toLowerCase())
        return false
      if (equipmentFilter && (e.equipment || '').toLowerCase() !== equipmentFilter.toLowerCase())
        return false
      // Filtro visuale gruppi muscolari
      if (muscleGroupFilter && !dbValueMatchesFilter(e.muscle_group || '', muscleGroupFilter))
        return false
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        (e.muscle_group || '').toLowerCase().includes(q) ||
        (e.equipment || '').toLowerCase().includes(q)
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
          const diffOrder: Record<Exercise['difficulty'], number> = { bassa: 1, media: 2, alta: 3 }
          aVal = diffOrder[a.difficulty || 'media'] ?? 2
          bVal = diffOrder[b.difficulty || 'media'] ?? 2
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
  }, [
    items,
    query,
    difficultyFilter,
    groupFilter,
    equipmentFilter,
    muscleGroupFilter,
    sortField,
    sortDirection,
  ])

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
    try {
      const res = await fetch('/api/exercises')
      if (!res.ok) {
        // Proteggi da risposte vuote
        const text = await res.text()
        const errorData = text && text.trim().length > 0 ? JSON.parse(text) : {}
        const errorMessage =
          errorData.error?.message || errorData.error || 'Impossibile caricare esercizi'
        addToast({
          title: 'Errore',
          message:
            typeof errorMessage === 'string' ? errorMessage : 'Errore durante il caricamento',
          variant: 'error',
        })
        setLoading(false)
        return
      }
      // Proteggi da risposte vuote che causano "Unexpected end of JSON input"
      const text = await res.text()
      if (!text || text.trim().length === 0) {
        logger.warn('Risposta vuota da /api/exercises')
        setItems([])
        setLoading(false)
        return
      }
      const json = JSON.parse(text) as { data: (Exercise & { difficulty?: string | null })[] }
      const normalized = (json.data || []).map((item) => ({
        ...item,
        difficulty: normalizeDifficulty(item.difficulty),
      }))
      setItems(normalized)
    } catch (err) {
      logger.error('Errore nel caricamento esercizi', err)
      addToast({
        title: 'Errore',
        message: err instanceof Error ? err.message : 'Errore durante il caricamento',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  const handleDelete = (exercise: Exercise) => {
    setExerciseToDelete(exercise)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!exerciseToDelete) return

    setIsDeleting(true)
    try {
      const res = await fetch('/api/exercises', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: exerciseToDelete.id }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMessage =
          errorData.error || errorData.error?.message || "Errore durante l'eliminazione"
        throw new Error(
          typeof errorMessage === 'string' ? errorMessage : "Errore durante l'eliminazione",
        )
      }

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
  }

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: typeof sortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 opacity-30" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    )
  }

  // Verifica se ci sono filtri attivi
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      query.trim() || difficultyFilter || equipmentFilter || muscleGroupFilter || groupFilter,
    )
  }, [query, difficultyFilter, equipmentFilter, muscleGroupFilter, groupFilter])

  // Reset di tutti i filtri
  const handleResetFilters = () => {
    setQuery('')
    setDifficultyFilter('')
    setEquipmentFilter('')
    setMuscleGroupFilter(null)
    setGroupFilter('')
  }

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Esercizi
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Catalogo esercizi per piani di allenamento
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={load}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200"
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
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Esercizio
            </Button>
          </div>
        </div>

        {/* Ricerca e Filtri */}
        <div className="relative p-4">
          {/* Header filtri con toggle e vista */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtri
              </Button>
              {hasActiveFilters && (
                <Button
                  onClick={handleResetFilters}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reset filtri
                </Button>
              )}
            </div>

            {/* Toolbar Vista */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={view === 'grid' ? 'primary' : 'outline'}
                className={`${view === 'grid' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30' : 'border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50'}`}
                onClick={() => setView('grid')}
              >
                <Grid3x3 className="mr-2 h-4 w-4" />
                Griglia
              </Button>
              <Button
                size="sm"
                variant={view === 'table' ? 'primary' : 'outline'}
                className={`${view === 'table' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30' : 'border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50'}`}
                onClick={() => setView('table')}
              >
                <TableIcon className="mr-2 h-4 w-4" />
                Tabella
              </Button>
            </div>
          </div>

          {/* Filtri collapsibili */}
          {showFilters && (
            <Card
              variant="trainer"
              className="relative overflow-hidden border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-teal-500/5 backdrop-blur-xl mb-4"
            >
              <CardContent className="relative p-4 space-y-4">
                {/* Filtro visuale gruppi muscolari */}
                <div>
                  <label className="text-text-secondary text-sm font-medium mb-2 block">
                    Gruppi muscolari
                  </label>
                  <MuscleGroupFilter
                    selectedGroup={
                      muscleGroupFilter ? muscleGroupFilterToDbValue(muscleGroupFilter) : ''
                    }
                    onSelect={(filterId) => {
                      setMuscleGroupFilter(filterId)
                      // Sincronizza con il filtro dropdown esistente
                      if (filterId) {
                        setGroupFilter(muscleGroupFilterToDbValue(filterId))
                      } else {
                        setGroupFilter('')
                      }
                    }}
                  />
                </div>

                {/* Toolbar con altri filtri */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center pt-4 border-t border-surface-300/30">
                  <div className="flex flex-wrap gap-3 flex-1">
                    {/* Input di ricerca */}
                    <div className="w-full sm:w-auto min-w-[240px] flex-1">
                      <Input
                        placeholder="Cerca per nome, gruppo muscolare o attrezzo"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        leftIcon={<Search className="h-4 w-4" />}
                        className="bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50"
                      />
                    </div>

                    {/* Filtro Difficoltà */}
                    <div className="w-full sm:w-auto min-w-[160px] flex-1">
                      <SimpleSelect
                        value={difficultyFilter || 'all'}
                        onValueChange={(value) =>
                          setDifficultyFilter(
                            value === 'all' ? '' : (value as Exercise['difficulty']),
                          )
                        }
                        placeholder="Tutte le difficoltà"
                        options={[
                          { value: 'all', label: 'Tutte le difficoltà' },
                          { value: 'bassa', label: 'Principiante' },
                          { value: 'media', label: 'Intermedio' },
                          { value: 'alta', label: 'Avanzato' },
                        ]}
                        className="w-full"
                      />
                    </div>

                    {/* Filtro Attrezzo */}
                    <div className="w-full sm:w-auto min-w-[160px] flex-1">
                      <SimpleSelect
                        value={equipmentFilter || 'all'}
                        onValueChange={(value) => setEquipmentFilter(value === 'all' ? '' : value)}
                        placeholder="Tutti gli attrezzi"
                        options={[
                          { value: 'all', label: 'Tutti gli attrezzi' },
                          ...equipments.map((eq) => ({ value: eq, label: eq })),
                        ]}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Loading State */}
        {loading && items.length === 0 ? (
          <LoadingState message="Caricamento esercizi..." />
        ) : (
          <>
            {view === 'grid' ? (
              <div className="relative p-4">
                <div className="mb-4">
                  <h3 className="text-text-primary text-base font-semibold">Libreria</h3>
                  <p className="text-text-secondary text-sm">
                    {filtered.length}{' '}
                    {filtered.length === 1 ? 'esercizio trovato' : 'esercizi trovati'}
                  </p>
                </div>
                {filtered.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mb-6 flex justify-center">
                      <div className="bg-teal-500/20 text-teal-400 rounded-full p-6">
                        <Search className="h-12 w-12" />
                      </div>
                    </div>
                    <h3 className="text-text-primary mb-2 text-xl font-semibold">
                      Nessun esercizio trovato
                    </h3>
                    <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">
                      {query || difficultyFilter || groupFilter || equipmentFilter
                        ? 'Prova a modificare i filtri di ricerca per trovare gli esercizi che stai cercando.'
                        : 'Inizia creando il tuo primo esercizio nel catalogo.'}
                    </p>
                    {!query && !difficultyFilter && !groupFilter && !equipmentFilter && (
                      <Button
                        onClick={() => {
                          setEditing(null)
                          setShowForm(true)
                        }}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Crea primo esercizio
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((e) => (
                      <Card
                        key={e.id}
                        variant="trainer"
                        className="group relative overflow-hidden rounded-lg border-2 border-teal-500/30 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary shadow-lg shadow-teal-500/5 hover:border-teal-500/60 hover:shadow-teal-500/20 transition-all duration-300 cursor-pointer"
                      >
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-transparent to-cyan-500/0 group-hover:from-teal-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />

                        <CardContent className="p-0 relative">
                          {/* Immagine/Video section - Full width */}
                          <ExerciseMedia exercise={e} />

                          {/* Content section */}
                          <div className="p-4 space-y-3">
                            {/* Nome esercizio */}
                            <div>
                              <h3 className="text-white text-lg font-bold line-clamp-1 transition-colors">
                                {e.name}
                              </h3>
                            </div>

                            {/* Info badges */}
                            <div className="flex flex-wrap items-center gap-2">
                              {e.muscle_group && (
                                <div className="flex items-center gap-1.5 rounded-lg bg-purple-500/15 px-2.5 py-1 text-xs text-white">
                                  <Dumbbell className="h-3 w-3" />
                                  <span className="font-medium">{e.muscle_group}</span>
                                </div>
                              )}
                              {e.equipment && (
                                <div className="flex items-center gap-1.5 rounded-lg bg-cyan-500/15 px-2.5 py-1 text-xs text-white">
                                  <Dumbbell className="h-3 w-3" />
                                  <span className="font-medium">{e.equipment}</span>
                                </div>
                              )}
                              {e.duration_seconds && (
                                <div className="flex items-center gap-1.5 rounded-lg bg-teal-500/15 px-2.5 py-1 text-xs text-white">
                                  <Clock className="h-3 w-3" />
                                  <span className="font-medium">{e.duration_seconds}s</span>
                                </div>
                              )}
                            </div>

                            {/* Descrizione breve (se presente) */}
                            {e.description && (
                              <p className="text-white line-clamp-2 text-xs leading-relaxed">
                                {e.description}
                              </p>
                            )}

                            {/* Action buttons */}
                            <div className="relative z-10 flex items-center justify-end gap-2 pt-2 border-t border-background-tertiary/50">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="relative z-10 h-8 gap-1.5 border border-teal-500/30 bg-teal-500/10 text-white hover:bg-teal-500/20 hover:border-teal-500/50 transition-all duration-200"
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
                                className="relative z-10 h-8 gap-1.5 border border-red-500/30 bg-red-500/10 text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
                                onClick={(ev) => {
                                  ev.stopPropagation()
                                  handleDelete(e)
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
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
                <div className="mb-4">
                  <h3 className="text-text-primary text-base font-semibold">Elenco esercizi</h3>
                  <p className="text-text-secondary text-sm">
                    {filtered.length}{' '}
                    {filtered.length === 1 ? 'esercizio trovato' : 'esercizi trovati'}
                  </p>
                </div>
                {filtered.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mb-6 flex justify-center">
                      <div className="bg-teal-500/20 text-teal-400 rounded-full p-6">
                        <Search className="h-12 w-12" />
                      </div>
                    </div>
                    <h3 className="text-text-primary mb-2 text-xl font-semibold">
                      Nessun esercizio trovato
                    </h3>
                    <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">
                      {query || difficultyFilter || groupFilter || equipmentFilter
                        ? 'Prova a modificare i filtri di ricerca per trovare gli esercizi che stai cercando.'
                        : 'Inizia creando il tuo primo esercizio nel catalogo.'}
                    </p>
                    {!query && !difficultyFilter && !groupFilter && !equipmentFilter && (
                      <Button
                        onClick={() => {
                          setEditing(null)
                          setShowForm(true)
                        }}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Crea primo esercizio
                      </Button>
                    )}
                  </div>
                ) : (
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
                      {filtered.map((e) => (
                        <TableRow key={e.id}>
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
                                className="border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200"
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
                                className="border-red-500/30 text-white hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200"
                                onClick={() => handleDelete(e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </>
        )}

        {/* Modal per creare/modificare esercizio - Lazy loaded solo quando aperto */}
        {showForm && (
          <Suspense fallback={<LoadingState message="Caricamento form esercizio..." />}>
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
            onOpenChange={setDeleteDialogOpen}
            title="Elimina esercizio"
            description={`Sei sicuro di voler eliminare "${exerciseToDelete.name}"? Questa azione non può essere annullata.`}
            confirmText="Elimina"
            cancelText="Annulla"
            variant="destructive"
            onConfirm={handleDeleteConfirm}
            loading={isDeleting}
          />
        )}
      </div>
    </div>
  )
}
