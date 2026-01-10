// ============================================================
// Componente Sezione Alimenti Preferiti e Evitati (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-nutrition-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Plus, X } from 'lucide-react'
import { sanitizeString } from '@/lib/sanitize'

interface NutritionFoodPreferencesSectionProps {
  isEditing: boolean
  alimentiPreferiti: string[]
  alimentiEvitati: string[]
  newAlimentoPreferito: string
  newAlimentoEvitato: string
  nutrition: {
    alimenti_preferiti: string[]
    alimenti_evitati: string[]
  } | null
  onAlimentoPreferitoAdd: (value: string) => void
  onAlimentoPreferitoRemove: (index: number) => void
  onAlimentoEvitatoAdd: (value: string) => void
  onAlimentoEvitatoRemove: (index: number) => void
  onNewAlimentoPreferitoChange: (value: string) => void
  onNewAlimentoEvitatoChange: (value: string) => void
}

export function NutritionFoodPreferencesSection({
  isEditing,
  alimentiPreferiti,
  alimentiEvitati,
  newAlimentoPreferito,
  newAlimentoEvitato,
  nutrition,
  onAlimentoPreferitoAdd,
  onAlimentoPreferitoRemove,
  onAlimentoEvitatoAdd,
  onAlimentoEvitatoRemove,
  onNewAlimentoPreferitoChange,
  onNewAlimentoEvitatoChange,
}: NutritionFoodPreferencesSectionProps) {
  if (isEditing) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          variant="trainer"
          className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
        >
          <CardHeader>
            <CardTitle className="text-lg">Alimenti Preferiti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi alimento"
                value={newAlimentoPreferito}
                maxLength={100}
                onChange={(e) => {
                  const sanitized = sanitizeString(e.target.value, 100)
                  onNewAlimentoPreferitoChange(sanitized || '')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newAlimentoPreferito) {
                    onAlimentoPreferitoAdd(newAlimentoPreferito)
                  }
                }}
              />
              <Button
                onClick={() => newAlimentoPreferito && onAlimentoPreferitoAdd(newAlimentoPreferito)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {alimentiPreferiti.map((alimento, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {alimento}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onAlimentoPreferitoRemove(index)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card
          variant="trainer"
          className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
        >
          <CardHeader>
            <CardTitle className="text-lg">Alimenti Evitati</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi alimento"
                value={newAlimentoEvitato}
                maxLength={100}
                onChange={(e) => {
                  const sanitized = sanitizeString(e.target.value, 100)
                  onNewAlimentoEvitatoChange(sanitized || '')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newAlimentoEvitato) {
                    onAlimentoEvitatoAdd(newAlimentoEvitato)
                  }
                }}
              />
              <Button
                onClick={() => newAlimentoEvitato && onAlimentoEvitatoAdd(newAlimentoEvitato)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {alimentiEvitati.map((alimento, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {alimento}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onAlimentoEvitatoRemove(index)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <CardTitle className="text-lg">Alimenti Preferiti</CardTitle>
        </CardHeader>
        <CardContent>
          {nutrition?.alimenti_preferiti && nutrition.alimenti_preferiti.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {nutrition.alimenti_preferiti.map((alimento, index) => (
                <Badge key={index} variant="secondary">
                  {alimento}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Nessun alimento preferito</p>
          )}
        </CardContent>
      </Card>

      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <CardTitle className="text-lg">Alimenti Evitati</CardTitle>
        </CardHeader>
        <CardContent>
          {nutrition?.alimenti_evitati && nutrition.alimenti_evitati.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {nutrition.alimenti_evitati.map((alimento, index) => (
                <Badge key={index} variant="secondary">
                  {alimento}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Nessun alimento evitato</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
