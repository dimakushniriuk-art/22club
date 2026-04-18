// ============================================================
// Componente Sezione Alimenti Preferiti e Evitati (FASE C)
// Contenuto per shell Card tab nutrizione.
// ============================================================

'use client'

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
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
          Alimenti preferiti
        </p>
        {isEditing ? (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi alimento"
                value={newAlimentoPreferito}
                maxLength={100}
                onChange={(e) => {
                  const sanitized = sanitizeString(e.target.value, 100, { trim: false })
                  onNewAlimentoPreferitoChange(sanitized || '')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newAlimentoPreferito) {
                    onAlimentoPreferitoAdd(newAlimentoPreferito)
                  }
                }}
                className="border-white/10 bg-white/[0.04] text-xs"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => newAlimentoPreferito && onAlimentoPreferitoAdd(newAlimentoPreferito)}
                className="h-9 shrink-0"
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
          </>
        ) : nutrition?.alimenti_preferiti && nutrition.alimenti_preferiti.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {nutrition.alimenti_preferiti.map((alimento, index) => (
              <Badge key={index} variant="secondary">
                {alimento}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Nessun alimento preferito</p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
          Alimenti evitati
        </p>
        {isEditing ? (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi alimento"
                value={newAlimentoEvitato}
                maxLength={100}
                onChange={(e) => {
                  const sanitized = sanitizeString(e.target.value, 100, { trim: false })
                  onNewAlimentoEvitatoChange(sanitized || '')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newAlimentoEvitato) {
                    onAlimentoEvitatoAdd(newAlimentoEvitato)
                  }
                }}
                className="border-white/10 bg-white/[0.04] text-xs"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => newAlimentoEvitato && onAlimentoEvitatoAdd(newAlimentoEvitato)}
                className="h-9 shrink-0"
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
          </>
        ) : nutrition?.alimenti_evitati && nutrition.alimenti_evitati.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {nutrition.alimenti_evitati.map((alimento, index) => (
              <Badge key={index} variant="secondary">
                {alimento}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Nessun alimento evitato</p>
        )}
      </div>
    </div>
  )
}
