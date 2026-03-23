'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MuscleGroupFilterType =
  | 'multipli'
  | 'cardio'
  | 'quadricipiti'
  | 'femorali'
  | 'anche-glutei'
  | 'schiena'
  | 'petto'
  | 'spalle'
  | 'tricipiti'
  | 'bicipiti'
  | 'avambracci'
  | 'polpacci'
  | 'tibiale'
  | 'vita-addome'

interface MuscleGroupOption {
  id: MuscleGroupFilterType
  label: string
  dbValue: string // Valore corrispondente nel database
}

// Mappatura tra ID filtro e valori nel database
const MUSCLE_GROUP_MAPPING: Record<MuscleGroupFilterType, string[]> = {
  multipli: ['multipli', 'multiple', 'full body', 'fullbody'],
  cardio: ['cardio'],
  quadricipiti: ['quadricipiti', 'quadriceps'],
  femorali: ['femorali', 'hamstrings'],
  'anche-glutei': ['anche', 'glutei', 'glutes', 'hips'],
  schiena: ['schiena', 'back'],
  petto: ['petto', 'chest'],
  spalle: ['spalle', 'shoulders'],
  tricipiti: ['tricipiti', 'triceps'],
  bicipiti: ['bicipiti', 'biceps'],
  avambracci: ['avambracci', 'forearms'],
  polpacci: ['polpacci', 'calves'],
  tibiale: ['tibiale', 'tibialis', 'tibialis anterior'],
  'vita-addome': ['vita', 'addome', 'addominali', 'abs', 'core'],
}

const MUSCLE_GROUP_OPTIONS: MuscleGroupOption[] = [
  { id: 'multipli', label: 'Multipli', dbValue: 'multipli' },
  { id: 'cardio', label: 'Cardio', dbValue: 'cardio' },
  { id: 'quadricipiti', label: 'Quadricipiti', dbValue: 'quadricipiti' },
  { id: 'femorali', label: 'Femorali', dbValue: 'femorali' },
  { id: 'anche-glutei', label: 'Glutei', dbValue: 'anche' },
  { id: 'schiena', label: 'Schiena', dbValue: 'schiena' },
  { id: 'petto', label: 'Petto', dbValue: 'petto' },
  { id: 'spalle', label: 'Spalle', dbValue: 'spalle' },
  { id: 'tricipiti', label: 'Tricipiti', dbValue: 'tricipiti' },
  { id: 'bicipiti', label: 'Bicipiti', dbValue: 'bicipiti' },
  { id: 'avambracci', label: 'Avambracci', dbValue: 'avambracci' },
  { id: 'polpacci', label: 'Polpacci', dbValue: 'polpacci' },
  { id: 'tibiale', label: 'Tibiale', dbValue: 'tibiale' },
  { id: 'vita-addome', label: 'Addominali', dbValue: 'addominali' },
]

// Mappatura tra ID filtro e percorso SVG
const MUSCLE_GROUP_ICONS: Record<MuscleGroupFilterType, string> = {
  multipli: '/icons/muscle-groups/multipli.svg',
  cardio: '/icons/muscle-groups/cardio.svg',
  quadricipiti: '/icons/muscle-groups/quadricipiti.svg',
  femorali: '/icons/muscle-groups/femorali.svg',
  'anche-glutei': '/icons/muscle-groups/anche-glutei.svg',
  schiena: '/icons/muscle-groups/schiena.svg',
  petto: '/icons/muscle-groups/petto.svg',
  spalle: '/icons/muscle-groups/spalle.svg',
  tricipiti: '/icons/muscle-groups/tricipiti.svg',
  bicipiti: '/icons/muscle-groups/bicipiti.svg',
  avambracci: '/icons/muscle-groups/avambracci.svg',
  polpacci: '/icons/muscle-groups/polpacci.svg',
  tibiale: '/icons/muscle-groups/polpacci.svg', // nessuna icona dedicata, riuso polpacci (gamba)
  'vita-addome': '/icons/muscle-groups/vita-addome.svg',
}

interface MuscleGroupFilterProps {
  selectedGroup: string
  onSelect: (groupId: MuscleGroupFilterType | null) => void
  className?: string
  /** Se true, i pulsanti si ridimensionano per restare in una riga entro il contenitore (nessuno scroll) */
  responsive?: boolean
  /**
   * Conteggio esercizi selezionati per ogni filtro (stessa logica di exerciseMatchesMuscleGroupFilter).
   * Se assente, non vengono mostrati badge.
   */
  selectionCountsByGroup?: Record<MuscleGroupFilterType, number>
  /** Totale esercizi selezionati, mostrato sul pulsante "Tutti" (solo se > 0). */
  totalSelectedCount?: number
}

export function MuscleGroupFilter({
  selectedGroup,
  onSelect,
  className,
  responsive,
  selectionCountsByGroup,
  totalSelectedCount,
}: MuscleGroupFilterProps) {
  // Trova quale filtro è selezionato in base al valore del database
  const selectedFilterId = useMemo(() => {
    if (!selectedGroup) return null

    const normalizedSelected = selectedGroup.toLowerCase().trim()

    for (const [filterId, dbValues] of Object.entries(MUSCLE_GROUP_MAPPING)) {
      if (dbValues.some((val) => normalizedSelected === val.toLowerCase())) {
        return filterId as MuscleGroupFilterType
      }
    }

    return null
  }, [selectedGroup])

  const handleClick = (option: MuscleGroupOption) => {
    if (selectedFilterId === option.id) {
      // Deseleziona se già selezionato
      onSelect(null)
    } else {
      onSelect(option.id)
    }
  }

  return (
    <div
      className={cn(
        'flex gap-2',
        responsive ? 'w-full min-w-0 flex-nowrap' : 'flex-wrap',
        className,
      )}
    >
      {MUSCLE_GROUP_OPTIONS.map((option) => {
        const isSelected = selectedFilterId === option.id

        const selectionCount = selectionCountsByGroup?.[option.id] ?? 0

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleClick(option)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 transition-all duration-200 cursor-pointer',
              responsive
                ? 'min-w-[56px] flex-1 max-w-[120px] basis-0 shrink'
                : 'w-[90px] h-[92px] shrink-0',
              !responsive && 'h-[92px]',
              responsive && 'min-h-[72px] max-h-[92px]',
              isSelected
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border border-cyan-400/80 shadow-md shadow-teal-500/20 text-white'
                : 'bg-background-secondary/25 border border-white/5 hover:bg-primary/8 hover:border-primary/20 hover:ring-inset hover:ring-1 hover:ring-primary/15',
            )}
          >
            {selectionCount > 0 && (
              <span
                className={cn(
                  'absolute top-1 right-1 z-10 inline-flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none tabular-nums',
                  isSelected
                    ? 'bg-white/25 text-white ring-1 ring-white/35'
                    : 'bg-cyan-500/90 text-white ring-1 ring-cyan-400/40',
                )}
                aria-label={`${selectionCount} esercizi selezionati in ${option.label}`}
              >
                {selectionCount > 99 ? '99+' : selectionCount}
              </span>
            )}
            {/* Icona SVG o testo speciale per Multipli */}
            <div
              className={cn(
                'flex items-center justify-center rounded-lg overflow-hidden relative shrink-0',
                responsive ? 'h-8 w-8 min-w-8 min-h-8' : 'h-[45px] w-[45px]',
                isSelected ? 'bg-white/20' : 'bg-background-tertiary/50',
              )}
            >
              {option.id === 'multipli' ? (
                <span
                  className={cn(
                    'font-bold',
                    responsive ? 'text-xs' : 'text-base',
                    isSelected ? 'text-white' : 'text-text-secondary',
                  )}
                >
                  MIX
                </span>
              ) : (
                <Image
                  src={MUSCLE_GROUP_ICONS[option.id]}
                  alt={option.label}
                  width={responsive ? 32 : 45}
                  height={responsive ? 32 : 45}
                  className={cn('object-contain', isSelected && 'brightness-0 invert')}
                  onError={(e) => {
                    // Fallback se l'immagine non esiste - mostra iniziale del gruppo
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('span')) {
                      const fallback = document.createElement('span')
                      fallback.className = 'text-sm font-bold text-text-secondary'
                      fallback.textContent = option.label.substring(0, 2).toUpperCase()
                      parent.appendChild(fallback)
                    }
                  }}
                />
              )}
            </div>
            <span
              className={cn(
                'font-medium text-center truncate w-full px-0.5',
                responsive ? 'text-[10px] leading-tight' : 'text-xs',
                isSelected ? 'text-white' : 'text-text-secondary',
              )}
            >
              {option.label}
            </span>
          </button>
        )
      })}
      {/* TUTTI: nessun filtro, visualizza tutti gli esercizi */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'relative flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 transition-all duration-200 cursor-pointer',
          responsive
            ? 'min-w-[56px] flex-1 max-w-[120px] basis-0 shrink'
            : 'w-[90px] h-[92px] shrink-0',
          !responsive && 'h-[92px]',
          responsive && 'min-h-[72px] max-h-[92px]',
          selectedFilterId === null
            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border border-cyan-400/80 shadow-md shadow-teal-500/20 text-white'
            : 'bg-background-secondary/25 border border-white/5 hover:bg-primary/8 hover:border-primary/20 hover:ring-inset hover:ring-1 hover:ring-primary/15',
        )}
      >
        {totalSelectedCount != null && totalSelectedCount > 0 && (
          <span
            className={cn(
              'absolute top-1 right-1 z-10 inline-flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none tabular-nums',
              selectedFilterId === null
                ? 'bg-white/25 text-white ring-1 ring-white/35'
                : 'bg-cyan-500/90 text-white ring-1 ring-cyan-400/40',
            )}
            aria-label={`${totalSelectedCount} esercizi selezionati in totale`}
          >
            {totalSelectedCount > 99 ? '99+' : totalSelectedCount}
          </span>
        )}
        <div
          className={cn(
            'flex items-center justify-center rounded-lg overflow-hidden relative shrink-0',
            responsive ? 'h-8 w-8 min-w-8 min-h-8' : 'h-[45px] w-[45px]',
            selectedFilterId === null ? 'bg-white/20' : 'bg-background-tertiary/50',
          )}
        >
          <LayoutGrid
            className={cn(
              'h-5 w-5',
              responsive && 'h-4 w-4',
              selectedFilterId === null ? 'text-white' : 'text-text-secondary',
            )}
          />
        </div>
        <span
          className={cn(
            'font-medium text-center truncate w-full px-0.5',
            responsive ? 'text-[10px] leading-tight' : 'text-xs',
            selectedFilterId === null ? 'text-white' : 'text-text-secondary',
          )}
        >
          Tutti
        </span>
      </button>
    </div>
  )
}

// Funzione helper per convertire l'ID filtro al valore del database
export function muscleGroupFilterToDbValue(filterId: MuscleGroupFilterType | null): string {
  if (!filterId) return ''

  const option = MUSCLE_GROUP_OPTIONS.find((opt) => opt.id === filterId)
  return option?.dbValue || ''
}

// Funzione helper per verificare se un valore del database corrisponde a un filtro.
// Il DB può memorizzare gruppi multipli come "Glutei, Femorali": si splitta per virgola/semicolon
// e si considera match se almeno un token corrisponde al mapping del filtro.
export function dbValueMatchesFilter(
  dbValue: string,
  filterId: MuscleGroupFilterType | null,
): boolean {
  if (!filterId || !dbValue) return false

  const tokens = dbValue
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  const mapping = MUSCLE_GROUP_MAPPING[filterId]
  const mappingLower = mapping.map((v) => v.toLowerCase())

  return tokens.some((token) => mappingLower.includes(token))
}

/** Token muscolari normalizzati (split su virgola / punto e virgola). */
export function parseMuscleGroupTokens(dbValue: string): string[] {
  return dbValue
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

/** True se l’esercizio ha più di un gruppo muscolare nel campo (es. "Spalle, Schiena"). */
export function exerciseHasMultipleMuscleGroups(dbValue: string): boolean {
  return parseMuscleGroupTokens(dbValue).length > 1
}

/**
 * Filtro catalogo: Tutti (null) = nessun filtro; Multipli = solo esercizi con 2+ gruppi;
 * altrimenti match solo sul gruppo principale (primo token).
 */
export function exerciseMatchesMuscleGroupFilter(
  dbValue: string,
  filterId: MuscleGroupFilterType | null,
): boolean {
  if (filterId == null) return true
  if (filterId === 'multipli') return exerciseHasMultipleMuscleGroups(dbValue)

  const tokens = parseMuscleGroupTokens(dbValue)
  const primary = tokens[0]
  if (!primary) return false

  const mapping = MUSCLE_GROUP_MAPPING[filterId]
  const mappingLower = mapping.map((v) => v.toLowerCase())
  return mappingLower.includes(primary)
}

/** Conta gli esercizi selezionati per ogni filtro gruppo (allineato a exerciseMatchesMuscleGroupFilter). */
export function countSelectionByMuscleGroupFilter(
  selectedIds: readonly string[],
  exercises: readonly { id: string; muscle_group?: string | null }[],
): {
  byGroup: Record<MuscleGroupFilterType, number>
  total: number
} {
  const idSet = new Set(selectedIds)
  const selected = exercises.filter((e) => idSet.has(e.id))
  const total = selected.length

  const byGroup = {} as Record<MuscleGroupFilterType, number>
  for (const opt of MUSCLE_GROUP_OPTIONS) {
    byGroup[opt.id] = selected.filter((e) =>
      exerciseMatchesMuscleGroupFilter(e.muscle_group ?? '', opt.id),
    ).length
  }

  return { byGroup, total }
}
