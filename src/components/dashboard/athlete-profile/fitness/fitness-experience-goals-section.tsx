// ============================================================
// Componente Sezione Esperienza e Obiettivi Fitness (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-fitness-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Button } from '@/components/ui'
import { Label } from '@/components/ui'
import { Badge } from '@/components/ui'
import type {
  LivelloEsperienzaEnum,
  ObiettivoFitnessEnum,
  AthleteFitnessDataUpdate,
} from '@/types/athlete-profile'

interface FitnessExperienceGoalsSectionProps {
  isEditing: boolean
  formData: AthleteFitnessDataUpdate
  fitness: {
    livello_esperienza: LivelloEsperienzaEnum | null
    obiettivo_primario: ObiettivoFitnessEnum | null
    obiettivi_secondari: ObiettivoFitnessEnum[]
  } | null
  onFormDataChange: (data: Partial<AthleteFitnessDataUpdate>) => void
  onToggleObiettivoSecondario: (obiettivo: ObiettivoFitnessEnum) => void
}

const LIVELLI_ESPERIENZA: { value: LivelloEsperienzaEnum; label: string }[] = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzato', label: 'Avanzato' },
  { value: 'professionista', label: 'Professionista' },
]

const OBIETTIVI_FITNESS: { value: ObiettivoFitnessEnum; label: string }[] = [
  { value: 'dimagrimento', label: 'Dimagrimento' },
  { value: 'massa_muscolare', label: 'Massa Muscolare' },
  { value: 'forza', label: 'Forza' },
  { value: 'resistenza', label: 'Resistenza' },
  { value: 'tonificazione', label: 'Tonificazione' },
  { value: 'riabilitazione', label: 'Riabilitazione' },
  { value: 'altro', label: 'Altro' },
]

export function FitnessExperienceGoalsSection({
  isEditing,
  formData,
  fitness,
  onFormDataChange,
  onToggleObiettivoSecondario,
}: FitnessExperienceGoalsSectionProps) {
  const obiettiviSecondariList = formData.obiettivi_secondari || []

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="livello_esperienza">Livello Esperienza</Label>
        {isEditing ? (
          <select
            id="livello_esperienza"
            value={formData.livello_esperienza || ''}
            onChange={(e) =>
              onFormDataChange({
                livello_esperienza: (e.target.value || null) as LivelloEsperienzaEnum | null,
              })
            }
            className="w-full px-3 py-2 rounded-md border border-white/10 bg-white/[0.04] text-text-primary"
          >
            <option value="">Non specificato</option>
            {LIVELLI_ESPERIENZA.map((livello) => (
              <option key={livello.value} value={livello.value}>
                {livello.label}
              </option>
            ))}
          </select>
        ) : (
          fitness?.livello_esperienza && (
            <p className="text-text-primary text-base capitalize">
              {LIVELLI_ESPERIENZA.find((l) => l.value === fitness.livello_esperienza)?.label ||
                fitness.livello_esperienza}
            </p>
          )
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="obiettivo_primario">Obiettivo Primario</Label>
        {isEditing ? (
          <select
            id="obiettivo_primario"
            value={formData.obiettivo_primario || ''}
            onChange={(e) =>
              onFormDataChange({
                obiettivo_primario: (e.target.value || null) as ObiettivoFitnessEnum | null,
              })
            }
            className="w-full px-3 py-2 rounded-md border border-white/10 bg-white/[0.04] text-text-primary"
          >
            <option value="">Non specificato</option>
            {OBIETTIVI_FITNESS.map((obiettivo) => (
              <option key={obiettivo.value} value={obiettivo.value}>
                {obiettivo.label}
              </option>
            ))}
          </select>
        ) : (
          fitness?.obiettivo_primario && (
            <p className="text-text-primary text-base">
              {OBIETTIVI_FITNESS.find((o) => o.value === fitness.obiettivo_primario)?.label ||
                fitness.obiettivo_primario}
            </p>
          )
        )}
      </div>

      <div className="space-y-2">
        <Label>Obiettivi Secondari</Label>
        {isEditing ? (
          <div className="flex flex-wrap gap-2">
            {OBIETTIVI_FITNESS.map((obiettivo) => {
              const isSelected = obiettiviSecondariList.includes(obiettivo.value)
              return (
                <Button
                  key={obiettivo.value}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onToggleObiettivoSecondario(obiettivo.value)}
                >
                  {obiettivo.label}
                </Button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {fitness?.obiettivi_secondari && fitness.obiettivi_secondari.length > 0 ? (
              fitness.obiettivi_secondari.map((obiettivo, index) => (
                <Badge key={index} variant="secondary">
                  {OBIETTIVI_FITNESS.find((o) => o.value === obiettivo)?.label || obiettivo}
                </Badge>
              ))
            ) : (
              <p className="text-text-secondary text-sm">Nessun obiettivo secondario</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
