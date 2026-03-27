// ============================================================
// Componente Sezione Preferenze Ambiente e Compagnia (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-motivational-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Trees, UsersRound } from 'lucide-react'
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      <Card variant="default" className="overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-6 space-y-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
            <Trees className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden />
            Preferenze Ambiente
          </CardTitle>
          <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6">
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

      <Card variant="default" className="overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-6 space-y-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
            <UsersRound className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden />
            Preferenze Compagnia
          </CardTitle>
          <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6">
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
