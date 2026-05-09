// ============================================================
// Componente Sezione Preferenze Ambiente e Compagnia (FASE C - Split File Lunghi)
// ============================================================
// Allineato a FitnessTrainingProgramSection (preferenze orario): Label + toggle, niente Card interne.
// ============================================================

'use client'

import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Label } from '@/components/ui'
import type { AthleteMotivationalDataUpdate } from '@/types/athlete-profile'

interface MotivationalPreferencesSectionProps {
  isEditing: boolean
  formData: AthleteMotivationalDataUpdate
  motivational: {
    preferenze_ambiente: string[]
    preferenze_compagnia: string[]
  } | null
  onTogglePreferenza: (field: 'preferenze_ambiente' | 'preferenze_compagnia', value: string) => void
}

const PREFERENZE_AMBIENTE = ['palestra', 'casa', 'outdoor', 'misto']
const PREFERENZE_COMPAGNIA = ['solo', 'partner', 'gruppo', 'misto']

export function MotivationalPreferencesSection({
  isEditing,
  formData,
  motivational,
  onTogglePreferenza,
}: MotivationalPreferencesSectionProps) {
  const preferenzeAmbienteList = formData.preferenze_ambiente || []
  const preferenzeCompagniaList = formData.preferenze_compagnia || []

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Preferenze ambiente</Label>
        {isEditing ? (
          <div className="flex flex-wrap gap-2">
            {PREFERENZE_AMBIENTE.map((ambiente) => {
              const isSelected = preferenzeAmbienteList.includes(ambiente)
              return (
                <Button
                  key={ambiente}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTogglePreferenza('preferenze_ambiente', ambiente)}
                >
                  {ambiente.charAt(0).toUpperCase() + ambiente.slice(1)}
                </Button>
              )
            })}
          </div>
        ) : motivational?.preferenze_ambiente && motivational.preferenze_ambiente.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {motivational.preferenze_ambiente.map((ambiente, index) => (
              <Badge key={index} variant="secondary">
                {ambiente.charAt(0).toUpperCase() + ambiente.slice(1)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Nessuna preferenza ambiente</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Preferenze compagnia</Label>
        {isEditing ? (
          <div className="flex flex-wrap gap-2">
            {PREFERENZE_COMPAGNIA.map((compagnia) => {
              const isSelected = preferenzeCompagniaList.includes(compagnia)
              return (
                <Button
                  key={compagnia}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onTogglePreferenza('preferenze_compagnia', compagnia)}
                >
                  {compagnia.charAt(0).toUpperCase() + compagnia.slice(1)}
                </Button>
              )
            })}
          </div>
        ) : motivational?.preferenze_compagnia && motivational.preferenze_compagnia.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {motivational.preferenze_compagnia.map((compagnia, index) => (
              <Badge key={index} variant="secondary">
                {compagnia.charAt(0).toUpperCase() + compagnia.slice(1)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Nessuna preferenza compagnia</p>
        )}
      </div>
    </div>
  )
}
