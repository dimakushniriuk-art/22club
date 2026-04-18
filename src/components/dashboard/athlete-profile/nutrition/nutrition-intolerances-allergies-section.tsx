// ============================================================
// Componente Sezione Intolleranze e Allergie (FASE C - Split File Lunghi)
// Contenuto per shell Card tab nutrizione.
// ============================================================

'use client'

import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Plus, X } from 'lucide-react'
import { sanitizeString } from '@/lib/sanitize'

interface NutritionIntolerancesAllergiesSectionProps {
  isEditing: boolean
  intolleranze: string[]
  allergie: string[]
  newIntolleranza: string
  newAllergia: string
  nutrition: {
    intolleranze_alimentari: string[]
    allergie_alimentari: string[]
  } | null
  onIntolleranzaAdd: (value: string) => void
  onIntolleranzaRemove: (index: number) => void
  onAllergiaAdd: (value: string) => void
  onAllergiaRemove: (index: number) => void
  onNewIntolleranzaChange: (value: string) => void
  onNewAllergiaChange: (value: string) => void
}

export function NutritionIntolerancesAllergiesSection({
  isEditing,
  intolleranze,
  allergie,
  newIntolleranza,
  newAllergia,
  nutrition,
  onIntolleranzaAdd,
  onIntolleranzaRemove,
  onAllergiaAdd,
  onAllergiaRemove,
  onNewIntolleranzaChange,
  onNewAllergiaChange,
}: NutritionIntolerancesAllergiesSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
          Intolleranze alimentari
        </p>
        {isEditing ? (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi intolleranza"
                value={newIntolleranza}
                maxLength={100}
                onChange={(e) => {
                  const sanitized = sanitizeString(e.target.value, 100, { trim: false })
                  onNewIntolleranzaChange(sanitized || '')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newIntolleranza) {
                    onIntolleranzaAdd(newIntolleranza)
                  }
                }}
                className="border-white/10 bg-white/[0.04] text-xs"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => newIntolleranza && onIntolleranzaAdd(newIntolleranza)}
                className="h-9 shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {intolleranze.map((intolleranza, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {intolleranza}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onIntolleranzaRemove(index)}
                  />
                </Badge>
              ))}
            </div>
          </>
        ) : nutrition?.intolleranze_alimentari && nutrition.intolleranze_alimentari.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {nutrition.intolleranze_alimentari.map((intolleranza, index) => (
              <Badge key={index} variant="secondary">
                {intolleranza}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Nessuna intolleranza alimentare</p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
          Allergie alimentari
        </p>
        {isEditing ? (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi allergia"
                value={newAllergia}
                maxLength={100}
                onChange={(e) => {
                  const sanitized = sanitizeString(e.target.value, 100, { trim: false })
                  onNewAllergiaChange(sanitized || '')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newAllergia) {
                    onAllergiaAdd(newAllergia)
                  }
                }}
                className="border-white/10 bg-white/[0.04] text-xs"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => newAllergia && onAllergiaAdd(newAllergia)}
                className="h-9 shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergie.map((a, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {a}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onAllergiaRemove(index)} />
                </Badge>
              ))}
            </div>
          </>
        ) : nutrition?.allergie_alimentari && nutrition.allergie_alimentari.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {nutrition.allergie_alimentari.map((a, index) => (
              <Badge key={index} variant="secondary">
                {a}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Nessuna allergia alimentare</p>
        )}
      </div>
    </div>
  )
}
