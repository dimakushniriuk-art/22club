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
import { AlertCircle, Plus, Trash2, Calendar } from 'lucide-react'
import { sanitizeString, sanitizeNumber } from '@/lib/sanitize'
import type { AbbandonoStorico } from '@/types/athlete-profile'

/** Evita shift timezone su stringhe `YYYY-MM-DD` da input date / JSON. */
function formatAbbandonoDateIt(isoDate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim())
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('it-IT')
  }
  const d = new Date(isoDate)
  return Number.isNaN(d.getTime()) ? isoDate : d.toLocaleDateString('it-IT')
}

interface MotivationalAbandonmentsSectionProps {
  isEditing: boolean
  showAbbandonoForm: boolean
  newAbbandono: Partial<AbbandonoStorico>
  /** Lista mostrata: in modifica deve provenire da form draft, altrimenti da query. */
  storicoAbbandoni: AbbandonoStorico[]
  onShowAbbandonoFormChange: (show: boolean) => void
  onNewAbbandonoChange: (abbandono: Partial<AbbandonoStorico>) => void
  onAbbandonoAdd: () => void
  onAbbandonoRemove: (index: number) => void
}

export function MotivationalAbandonmentsSection({
  isEditing,
  showAbbandonoForm,
  newAbbandono,
  storicoAbbandoni,
  onShowAbbandonoFormChange,
  onNewAbbandonoChange,
  onAbbandonoAdd,
  onAbbandonoRemove,
}: MotivationalAbandonmentsSectionProps) {
  return (
    <Card variant="default" className="overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 min-w-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
              <AlertCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden />
              Storico Abbandoni
            </CardTitle>
            <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
          </div>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowAbbandonoFormChange(true)}
              className="flex items-center gap-1.5 h-8 text-xs shrink-0 self-start"
            >
              <Plus className="h-3.5 w-3.5" />
              Aggiungi Abbandono
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-6 px-6">
        {storicoAbbandoni.length > 0 ? (
          <div className="space-y-3">
            {storicoAbbandoni.map((abbandono, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/[0.02]"
              >
                <div>
                  <p className="text-text-primary font-semibold">{abbandono.motivo}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <Calendar className="h-4 w-4" />
                      {formatAbbandonoDateIt(abbandono.data)}
                    </div>
                    {abbandono.durata_mesi != null && abbandono.durata_mesi > 0 && (
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
          <div className="mt-4 p-4 rounded-lg border border-white/10 bg-white/[0.02] space-y-3">
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
                    motivo: sanitizeString(e.target.value, 500, { trim: false }) || '',
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
                value={newAbbandono.durata_mesi ?? ''}
                onChange={(e) =>
                  onNewAbbandonoChange({
                    ...newAbbandono,
                    durata_mesi: sanitizeNumber(e.target.value, 0, 120) ?? undefined,
                  })
                }
                placeholder="Durata in mesi"
              />
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShowAbbandonoFormChange(false)}
                className="h-9 text-xs border-white/10 hover:border-primary/20"
              >
                Annulla
              </Button>
              <Button variant="default" size="sm" className="h-9 text-xs" onClick={onAbbandonoAdd}>
                Aggiungi
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
