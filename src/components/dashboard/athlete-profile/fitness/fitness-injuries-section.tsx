// ============================================================
// Componente Sezione Infortuni Pregressi (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-fitness-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Badge } from '@/components/ui'
import { AlertCircle, Plus, Trash2 } from 'lucide-react'
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
  // Nota: infortuni potrebbe essere usato in futuro per visualizzazione lista
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  infortuni,
  showInfortunioForm,
  newInfortunio,
  fitness,
  onShowInfortunioFormChange,
  onNewInfortunioChange,
  onInfortunioAdd,
  onInfortunioRemove,
}: FitnessInjuriesSectionProps) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-teal-400" />
            Infortuni Pregressi
          </CardTitle>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowInfortunioFormChange(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Aggiungi Infortunio
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {fitness?.infortuni_pregressi && fitness.infortuni_pregressi.length > 0 ? (
          <div className="space-y-3">
            {fitness.infortuni_pregressi.map((infortunio, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-background-tertiary/30 rounded-lg border border-teal-500/10"
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
                  <Button variant="outline" size="sm" onClick={() => onInfortunioRemove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-4">Nessun infortunio pregresso</p>
        )}

        {/* Form Aggiungi Infortunio */}
        {showInfortunioForm && (
          <div className="mt-4 p-4 bg-background-tertiary/30 rounded-lg border border-teal-500/10 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="infortunio-data">Data</Label>
              <Input
                id="infortunio-data"
                type="date"
                value={newInfortunio.data || ''}
                onChange={(e) => onNewInfortunioChange({ ...newInfortunio, data: e.target.value })}
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
                    tipo: sanitizeString(e.target.value, 100) || '',
                  })
                }
                placeholder="Es. Distorsione caviglia"
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
                    note: sanitizeString(e.target.value, 500) || '',
                  })
                }
                placeholder="Note aggiuntive..."
                rows={2}
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => onShowInfortunioFormChange(false)}>
                Annulla
              </Button>
              <Button onClick={onInfortunioAdd}>Aggiungi</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
