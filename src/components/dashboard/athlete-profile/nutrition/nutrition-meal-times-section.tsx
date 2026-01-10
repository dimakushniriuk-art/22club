// ============================================================
// Componente Sezione Preferenze Orari Pasti (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-nutrition-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Clock, Plus, X } from 'lucide-react'
import type { PreferenzeOrariPasti, AthleteNutritionDataUpdate } from '@/types/athlete-profile'

interface NutritionMealTimesSectionProps {
  isEditing: boolean
  formData: AthleteNutritionDataUpdate
  nutrition: {
    preferenze_orari_pasti: PreferenzeOrariPasti | null
  } | null
  newSpuntino: string
  onOrarioPastoUpdate: (
    pasto: keyof Omit<PreferenzeOrariPasti, 'spuntini'>,
    value: string | null,
  ) => void
  onSpuntinoAdd: (orario: string) => void
  onSpuntinoRemove: (index: number) => void
  onNewSpuntinoChange: (value: string) => void
}

export function NutritionMealTimesSection({
  isEditing,
  formData,
  nutrition,
  newSpuntino,
  onOrarioPastoUpdate,
  onSpuntinoAdd,
  onSpuntinoRemove,
  onNewSpuntinoChange,
}: NutritionMealTimesSectionProps) {
  const spuntiniList = formData.preferenze_orari_pasti?.spuntini || []

  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-400" />
          Preferenze Orari Pasti
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="colazione">Colazione</Label>
            {isEditing ? (
              <Input
                id="colazione"
                type="time"
                value={formData.preferenze_orari_pasti?.colazione || ''}
                onChange={(e) => onOrarioPastoUpdate('colazione', e.target.value || null)}
              />
            ) : (
              nutrition?.preferenze_orari_pasti?.colazione && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-text-tertiary" />
                  <p className="text-text-primary text-base">
                    {nutrition.preferenze_orari_pasti.colazione}
                  </p>
                </div>
              )
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pranzo">Pranzo</Label>
            {isEditing ? (
              <Input
                id="pranzo"
                type="time"
                value={formData.preferenze_orari_pasti?.pranzo || ''}
                onChange={(e) => onOrarioPastoUpdate('pranzo', e.target.value || null)}
              />
            ) : (
              nutrition?.preferenze_orari_pasti?.pranzo && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-text-tertiary" />
                  <p className="text-text-primary text-base">
                    {nutrition.preferenze_orari_pasti.pranzo}
                  </p>
                </div>
              )
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cena">Cena</Label>
            {isEditing ? (
              <Input
                id="cena"
                type="time"
                value={formData.preferenze_orari_pasti?.cena || ''}
                onChange={(e) => onOrarioPastoUpdate('cena', e.target.value || null)}
              />
            ) : (
              nutrition?.preferenze_orari_pasti?.cena && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-text-tertiary" />
                  <p className="text-text-primary text-base">
                    {nutrition.preferenze_orari_pasti.cena}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label>Spuntini</Label>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="time"
                  placeholder="Orario spuntino"
                  value={newSpuntino}
                  onChange={(e) => onNewSpuntinoChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSpuntino) {
                      onSpuntinoAdd(newSpuntino)
                    }
                  }}
                />
                <Button onClick={() => newSpuntino && onSpuntinoAdd(newSpuntino)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {spuntiniList.map((spuntino, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {spuntino}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => onSpuntinoRemove(index)} />
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {nutrition?.preferenze_orari_pasti?.spuntini &&
              nutrition.preferenze_orari_pasti.spuntini.length > 0 ? (
                nutrition.preferenze_orari_pasti.spuntini.map((spuntino, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {spuntino}
                  </Badge>
                ))
              ) : (
                <p className="text-text-secondary text-sm">Nessuno spuntino programmato</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
