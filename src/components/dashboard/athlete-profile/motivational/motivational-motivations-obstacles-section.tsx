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
  if (isEditing) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          variant="trainer"
          className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
        >
          <CardHeader>
            <CardTitle className="text-lg">Motivazioni Secondarie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
              <Button onClick={() => newMotivazione && onMotivazioneAdd(newMotivazione)}>
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

        <Card
          variant="trainer"
          className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
        >
          <CardHeader>
            <CardTitle className="text-lg">Ostacoli Percepiti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
              <Button onClick={() => newOstacolo && onOstacoloAdd(newOstacolo)}>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <CardTitle className="text-lg">Motivazioni Secondarie</CardTitle>
        </CardHeader>
        <CardContent>
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

      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <CardTitle className="text-lg">Ostacoli Percepiti</CardTitle>
        </CardHeader>
        <CardContent>
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
