// ============================================================
// Componente Sezione Motivazioni Secondarie e Ostacoli (FASE C - Split File Lunghi)
// ============================================================
// Allineato a FitnessActivitiesZonesSection: griglia + micro-intestazioni, niente Card interne.
// ============================================================

'use client'

import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Plus, X } from 'lucide-react'

interface MotivationalMotivationsObstaclesSectionProps {
  isEditing: boolean
  motivazioniSecondarie: string[]
  ostacoliPercepiti: string[]
  newMotivazione: string
  newOstacolo: string
  motivational: {
    motivazioni_secondarie: string[]
    ostacoli_percepiti: string[]
  } | null
  onMotivazioneAdd: (value: string) => void
  onMotivazioneRemove: (index: number) => void
  onOstacoloAdd: (value: string) => void
  onOstacoloRemove: (index: number) => void
  onNewMotivazioneChange: (value: string) => void
  onNewOstacoloChange: (value: string) => void
}

export function MotivationalMotivationsObstaclesSection({
  isEditing,
  motivazioniSecondarie,
  ostacoliPercepiti,
  newMotivazione,
  newOstacolo,
  motivational,
  onMotivazioneAdd,
  onMotivazioneRemove,
  onOstacoloAdd,
  onOstacoloRemove,
  onNewMotivazioneChange,
  onNewOstacoloChange,
}: MotivationalMotivationsObstaclesSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
          Motivazioni secondarie
        </p>
        {isEditing ? (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi motivazione"
                value={newMotivazione}
                onChange={(e) => onNewMotivazioneChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newMotivazione) {
                    onMotivazioneAdd(newMotivazione)
                  }
                }}
                className="border-white/10 bg-white/[0.04] text-xs"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => newMotivazione && onMotivazioneAdd(newMotivazione)}
                className="h-9 shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {motivazioniSecondarie.map((motivazione, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {motivazione}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onMotivazioneRemove(index)}
                  />
                </Badge>
              ))}
            </div>
          </>
        ) : motivational?.motivazioni_secondarie &&
          motivational.motivazioni_secondarie.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {motivational.motivazioni_secondarie.map((motivazione, index) => (
              <Badge key={index} variant="secondary">
                {motivazione}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Nessuna motivazione secondaria</p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
          Ostacoli percepiti
        </p>
        {isEditing ? (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi ostacolo"
                value={newOstacolo}
                onChange={(e) => onNewOstacoloChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newOstacolo) {
                    onOstacoloAdd(newOstacolo)
                  }
                }}
                className="border-white/10 bg-white/[0.04] text-xs"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => newOstacolo && onOstacoloAdd(newOstacolo)}
                className="h-9 shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ostacoliPercepiti.map((ostacolo, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {ostacolo}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onOstacoloRemove(index)} />
                </Badge>
              ))}
            </div>
          </>
        ) : motivational?.ostacoli_percepiti && motivational.ostacoli_percepiti.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {motivational.ostacoli_percepiti.map((ostacolo, index) => (
              <Badge key={index} variant="secondary">
                {ostacolo}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Nessun ostacolo percepito</p>
        )}
      </div>
    </div>
  )
}
