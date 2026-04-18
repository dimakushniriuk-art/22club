// ============================================================
// Componente Sezione Infortuni Pregressi (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-fitness-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Trash2 } from 'lucide-react'
import { sanitizeString } from '@/lib/sanitize'
import type { InfortunioPregresso } from '@/types/athlete-profile'

interface FitnessInjuriesSectionProps {
  isEditing: boolean
  infortuni: InfortunioPregresso[]
  showInfortunioForm: boolean
  newInfortunio: Partial<InfortunioPregresso>
  fitness: {
    infortuni_pregressi: InfortunioPregresso[]
  } | null
  onShowInfortunioFormChange: (show: boolean) => void
  onNewInfortunioChange: (infortunio: Partial<InfortunioPregresso>) => void
  onInfortunioAdd: () => void
  onInfortunioRemove: (index: number) => void
}

export function FitnessInjuriesSection({
  isEditing,
  infortuni,
  showInfortunioForm,
  newInfortunio,
  fitness,
  onShowInfortunioFormChange,
  onNewInfortunioChange,
  onInfortunioAdd,
  onInfortunioRemove,
}: FitnessInjuriesSectionProps) {
  const listaInfortuni = isEditing ? infortuni : (fitness?.infortuni_pregressi ?? [])

  return (
    <div className="space-y-3">
      {listaInfortuni.length > 0 ? (
        <div className="space-y-3">
          {listaInfortuni.map((infortunio, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-text-primary font-semibold">{infortunio.tipo}</p>
                <div className="text-text-secondary text-sm flex items-center gap-2">
                  <span>{new Date(infortunio.data).toLocaleDateString('it-IT')}</span>
                  {infortunio.recuperato && (
                    <Badge variant="success" size="sm">
                      Recuperato
                    </Badge>
                  )}
                </div>
                {infortunio.note && (
                  <p className="text-text-secondary text-sm mt-1">{infortunio.note}</p>
                )}
              </div>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-white/10 sm:self-center"
                  onClick={() => onInfortunioRemove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-text-secondary">Nessun infortunio pregresso</p>
      )}

      {showInfortunioForm && (
        <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <div className="space-y-2">
            <Label htmlFor="infortunio-data">Data</Label>
            <Input
              id="infortunio-data"
              type="date"
              value={newInfortunio.data || ''}
              onChange={(e) => onNewInfortunioChange({ ...newInfortunio, data: e.target.value })}
              className="border-white/10 bg-white/[0.04] text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="infortunio-tipo">Tipo</Label>
            <Input
              id="infortunio-tipo"
              value={newInfortunio.tipo || ''}
              onChange={(e) =>
                onNewInfortunioChange({
                  ...newInfortunio,
                  tipo: sanitizeString(e.target.value, 100, { trim: false }) || '',
                })
              }
              placeholder="Es. Distorsione caviglia"
              className="border-white/10 bg-white/[0.04] text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="infortunio-recuperato"
              checked={newInfortunio.recuperato || false}
              onChange={(e) =>
                onNewInfortunioChange({ ...newInfortunio, recuperato: e.target.checked })
              }
              className="rounded"
            />
            <Label htmlFor="infortunio-recuperato">Recuperato</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="infortunio-note">Note (opzionale)</Label>
            <Textarea
              id="infortunio-note"
              value={newInfortunio.note || ''}
              onChange={(e) =>
                onNewInfortunioChange({
                  ...newInfortunio,
                  note: sanitizeString(e.target.value, 500, { trim: false }) || '',
                })
              }
              placeholder="Note aggiuntive..."
              rows={2}
              className="border-white/10 bg-white/[0.04] text-xs"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onShowInfortunioFormChange(false)}
              className="border-white/10 hover:border-primary/20"
            >
              Annulla
            </Button>
            <Button variant="default" onClick={onInfortunioAdd}>
              Aggiungi
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
