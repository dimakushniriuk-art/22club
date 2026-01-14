'use client'

import { useMemo } from 'react'
import Image from 'next/image'
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
  'vita-addome': ['vita', 'addome', 'abs', 'core'],
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
  { id: 'vita-addome', label: 'Vita', dbValue: 'vita' },
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
  'vita-addome': '/icons/muscle-groups/vita-addome.svg',
}

interface MuscleGroupFilterProps {
  selectedGroup: string
  onSelect: (groupId: MuscleGroupFilterType | null) => void
  className?: string
}

export function MuscleGroupFilter({ selectedGroup, onSelect, className }: MuscleGroupFilterProps) {
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
    <div className={cn('flex flex-wrap gap-2', className)}>
      {MUSCLE_GROUP_OPTIONS.map((option) => {
        const isSelected = selectedFilterId === option.id

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleClick(option)}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 transition-all duration-200',
              'w-[90px] h-[92px] cursor-pointer',
              isSelected
                ? 'border-teal-500 bg-teal-500/20 shadow-md shadow-teal-500/20'
                : 'border-border bg-background-secondary/50 hover:border-teal-500/50 hover:bg-background-secondary',
            )}
          >
            {/* Icona SVG o testo speciale per Multipli */}
            <div
              className={cn(
                'h-[45px] w-[45px] flex items-center justify-center rounded-lg overflow-hidden relative',
                isSelected ? 'bg-teal-500/20' : 'bg-background-tertiary/50',
              )}
            >
              {option.id === 'multipli' ? (
                <span className={cn(
                  'text-base font-bold',
                  isSelected ? 'text-teal-400' : 'text-text-secondary'
                )}>
                  MIX
                </span>
              ) : (
                <Image
                  src={MUSCLE_GROUP_ICONS[option.id]}
                  alt={option.label}
                  width={45}
                  height={45}
                  className="object-contain"
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
                'text-xs font-medium text-center',
                isSelected ? 'text-teal-400' : 'text-text-secondary',
              )}
            >
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Funzione helper per convertire l'ID filtro al valore del database
export function muscleGroupFilterToDbValue(filterId: MuscleGroupFilterType | null): string {
  if (!filterId) return ''

  const option = MUSCLE_GROUP_OPTIONS.find((opt) => opt.id === filterId)
  return option?.dbValue || ''
}

// Funzione helper per verificare se un valore del database corrisponde a un filtro
export function dbValueMatchesFilter(
  dbValue: string,
  filterId: MuscleGroupFilterType | null,
): boolean {
  if (!filterId || !dbValue) return false

  const normalizedDbValue = dbValue.toLowerCase().trim()
  const mapping = MUSCLE_GROUP_MAPPING[filterId]

  return mapping.some((val) => normalizedDbValue === val.toLowerCase())
}
