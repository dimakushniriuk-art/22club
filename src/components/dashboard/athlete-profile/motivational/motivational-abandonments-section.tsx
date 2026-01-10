// ============================================================
// Componente Sezione Storico Abbandoni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-motivational-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
// Nota: Badge potrebbe essere usato in futuro per display status
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Badge } from '@/components/ui'
import { AlertCircle, Plus, Trash2, Calendar } from 'lucide-react'
import { sanitizeString, sanitizeNumber } from '@/lib/sanitize'
import type { AbbandonoStorico } from '@/types/athlete-profile'

interface MotivationalAbandonmentsSectionProps {
  isEditing: boolean
  showAbbandonoForm: boolean
  newAbbandono: Partial<AbbandonoStorico>
  motivational: {
    storico_abbandoni: AbbandonoStorico[]
  } | null
  onShowAbbandonoFormChange: (show: boolean) => void
  onNewAbbandonoChange: (abbandono: Partial<AbbandonoStorico>) => void
  onAbbandonoAdd: () => void
  onAbbandonoRemove: (index: number) => void
}

export function MotivationalAbandonmentsSection({
  isEditing,
  showAbbandonoForm,
  newAbbandono,
  motivational,
  onShowAbbandonoFormChange,
  onNewAbbandonoChange,
  onAbbandonoAdd,
  onAbbandonoRemove,
}: MotivationalAbandonmentsSectionProps) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-teal-400" />
            Storico Abbandoni
          </CardTitle>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowAbbandonoFormChange(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Aggiungi Abbandono
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {motivational?.storico_abbandoni && motivational.storico_abbandoni.length > 0 ? (
          <div className="space-y-3">
            {motivational.storico_abbandoni.map((abbandono, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-background-tertiary/30 rounded-lg border border-teal-500/10"
              >
                <div>
                  <p className="text-text-primary font-semibold">{abbandono.motivo}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(abbandono.data).toLocaleDateString('it-IT')}
                    </div>
                    {abbandono.durata_mesi && (
                      <p className="text-text-secondary text-sm">
                        Durata: {abbandono.durata_mesi} mesi
                      </p>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={() => onAbbandonoRemove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-4">Nessun abbandono storico</p>
        )}

        {/* Form Aggiungi Abbandono */}
        {showAbbandonoForm && (
          <div className="mt-4 p-4 bg-background-tertiary/30 rounded-lg border border-teal-500/10 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="abbandono-data">Data</Label>
              <Input
                id="abbandono-data"
                type="date"
                value={newAbbandono.data || ''}
                onChange={(e) => onNewAbbandonoChange({ ...newAbbandono, data: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abbandono-motivo">Motivo</Label>
              <Input
                id="abbandono-motivo"
                value={newAbbandono.motivo || ''}
                onChange={(e) =>
                  onNewAbbandonoChange({
                    ...newAbbandono,
                    motivo: sanitizeString(e.target.value, 500) || '',
                  })
                }
                placeholder="Motivo dell'abbandono"
                maxLength={500}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abbandono-durata">Durata (mesi, opzionale)</Label>
              <Input
                id="abbandono-durata"
                type="number"
                min="1"
                value={newAbbandono.durata_mesi || ''}
                onChange={(e) =>
                  onNewAbbandonoChange({
                    ...newAbbandono,
                    durata_mesi: sanitizeNumber(e.target.value, 0, 120) ?? undefined,
                  })
                }
                placeholder="Durata in mesi"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => onShowAbbandonoFormChange(false)}>
                Annulla
              </Button>
              <Button onClick={onAbbandonoAdd}>Aggiungi</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
