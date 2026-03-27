// ============================================================
// Componente Sezione Motivazioni Secondarie e Ostacoli (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-motivational-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Plus, X, ListOrdered, OctagonAlert } from 'lucide-react'

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
  if (isEditing) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <Card variant="default" className="overflow-hidden">
          <CardHeader className="pb-3 pt-4 px-6 space-y-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
              <ListOrdered className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden />
              Motivazioni Secondarie
            </CardTitle>
            <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-6 space-y-3">
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
              />
              <Button
                type="button"
                size="sm"
                className="shrink-0"
                onClick={() => newMotivazione && onMotivazioneAdd(newMotivazione)}
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
          </CardContent>
        </Card>

        <Card variant="default" className="overflow-hidden">
          <CardHeader className="pb-3 pt-4 px-6 space-y-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
              <OctagonAlert className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden />
              Ostacoli Percepiti
            </CardTitle>
            <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-6 space-y-3">
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
              />
              <Button
                type="button"
                size="sm"
                className="shrink-0"
                onClick={() => newOstacolo && onOstacoloAdd(newOstacolo)}
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
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      <Card variant="default" className="overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-6 space-y-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
            <ListOrdered className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden />
            Motivazioni Secondarie
          </CardTitle>
          <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6">
          {motivational?.motivazioni_secondarie &&
          motivational.motivazioni_secondarie.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {motivational.motivazioni_secondarie.map((motivazione, index) => (
                <Badge key={index} variant="secondary">
                  {motivazione}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Nessuna motivazione secondaria</p>
          )}
        </CardContent>
      </Card>

      <Card variant="default" className="overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-6 space-y-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
            <OctagonAlert className="h-3.5 w-3.5 text-primary flex-shrink-0" aria-hidden />
            Ostacoli Percepiti
          </CardTitle>
          <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
        </CardHeader>
        <CardContent className="pt-2 pb-6 px-6">
          {motivational?.ostacoli_percepiti && motivational.ostacoli_percepiti.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {motivational.ostacoli_percepiti.map((ostacolo, index) => (
                <Badge key={index} variant="secondary">
                  {ostacolo}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Nessun ostacolo percepito</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
