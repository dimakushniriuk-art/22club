// ============================================================
// Componente Sezione Preferenze Ambiente e Compagnia (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-motivational-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <CardTitle className="text-lg">Preferenze Ambiente</CardTitle>
        </CardHeader>
        <CardContent>
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
          ) : (
            <div className="flex flex-wrap gap-2">
              {motivational?.preferenze_ambiente && motivational.preferenze_ambiente.length > 0 ? (
                motivational.preferenze_ambiente.map((ambiente, index) => (
                  <Badge key={index} variant="secondary">
                    {ambiente.charAt(0).toUpperCase() + ambiente.slice(1)}
                  </Badge>
                ))
              ) : (
                <p className="text-text-secondary text-sm">Nessuna preferenza ambiente</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <CardTitle className="text-lg">Preferenze Compagnia</CardTitle>
        </CardHeader>
        <CardContent>
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
          ) : (
            <div className="flex flex-wrap gap-2">
              {motivational?.preferenze_compagnia &&
              motivational.preferenze_compagnia.length > 0 ? (
                motivational.preferenze_compagnia.map((compagnia, index) => (
                  <Badge key={index} variant="secondary">
                    {compagnia.charAt(0).toUpperCase() + compagnia.slice(1)}
                  </Badge>
                ))
              ) : (
                <p className="text-text-secondary text-sm">Nessuna preferenza compagnia</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
