// ============================================================
// Componente Sezione Intolleranze e Allergie (FASE C - Split File Lunghi)
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
  if (isEditing) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          variant="default"
        className="overflow-hidden"
        >
          <CardHeader>
            <CardTitle className="text-lg font-bold text-text-primary">Intolleranze Alimentari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi intolleranza"
                value={newIntolleranza}
                maxLength={100}
                onChange={(e) => {
                  const sanitized = sanitizeString(e.target.value, 100)
                  onNewIntolleranzaChange(sanitized || '')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newIntolleranza) {
                    onIntolleranzaAdd(newIntolleranza)
                  }
                }}
                className="text-base"
              />
              <Button onClick={() => newIntolleranza && onIntolleranzaAdd(newIntolleranza)} className="min-h-[44px] min-w-[44px]">
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
          </CardContent>
        </Card>

        <Card
          variant="default"
        className="overflow-hidden"
        >
          <CardHeader>
            <CardTitle className="text-lg font-bold text-text-primary">Allergie Alimentari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi allergia"
                value={newAllergia}
                maxLength={100}
                onChange={(e) => {
                  const sanitized = sanitizeString(e.target.value, 100)
                  onNewAllergiaChange(sanitized || '')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newAllergia) {
                    onAllergiaAdd(newAllergia)
                  }
                }}
                className="text-base"
              />
              <Button onClick={() => newAllergia && onAllergiaAdd(newAllergia)} className="min-h-[44px] min-w-[44px]">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergie.map((allergia, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {allergia}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onAllergiaRemove(index)} />
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
        variant="default"
        className="overflow-hidden"
      >
        <CardHeader>
          <CardTitle className="text-lg font-bold text-text-primary">Intolleranze Alimentari</CardTitle>
        </CardHeader>
        <CardContent>
          {nutrition?.intolleranze_alimentari && nutrition.intolleranze_alimentari.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {nutrition.intolleranze_alimentari.map((intolleranza, index) => (
                <Badge key={index} variant="secondary">
                  {intolleranza}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm md:text-base">Nessuna intolleranza alimentare</p>
          )}
        </CardContent>
      </Card>

      <Card
        variant="default"
        className="overflow-hidden"
      >
        <CardHeader>
          <CardTitle className="text-lg font-bold text-text-primary">Allergie Alimentari</CardTitle>
        </CardHeader>
        <CardContent>
          {nutrition?.allergie_alimentari && nutrition.allergie_alimentari.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {nutrition.allergie_alimentari.map((allergia, index) => (
                <Badge key={index} variant="secondary">
                  {allergia}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm md:text-base">Nessuna allergia alimentare</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
