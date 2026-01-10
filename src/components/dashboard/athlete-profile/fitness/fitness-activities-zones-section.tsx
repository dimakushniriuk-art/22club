// ============================================================
// Componente Sezione Attività Precedenti e Zone Problematiche (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-fitness-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Plus, X } from 'lucide-react'

interface FitnessActivitiesZonesSectionProps {
  isEditing: boolean
  attivitaPrecedenti: string[]
  zoneProblematiche: string[]
  newAttivita: string
  newZona: string
  fitness: {
    attivita_precedenti: string[]
    zone_problematiche: string[]
  } | null
  onAttivitaAdd: (value: string) => void
  onAttivitaRemove: (index: number) => void
  onZonaAdd: (value: string) => void
  onZonaRemove: (index: number) => void
  onNewAttivitaChange: (value: string) => void
  onNewZonaChange: (value: string) => void
}

export function FitnessActivitiesZonesSection({
  isEditing,
  attivitaPrecedenti,
  zoneProblematiche,
  newAttivita,
  newZona,
  fitness,
  onAttivitaAdd,
  onAttivitaRemove,
  onZonaAdd,
  onZonaRemove,
  onNewAttivitaChange,
  onNewZonaChange,
}: FitnessActivitiesZonesSectionProps) {
  if (isEditing) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          variant="trainer"
          className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
        >
          <CardHeader>
            <CardTitle className="text-lg">Attività Precedenti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi attività"
                value={newAttivita}
                onChange={(e) => onNewAttivitaChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newAttivita) {
                    onAttivitaAdd(newAttivita)
                  }
                }}
              />
              <Button onClick={() => newAttivita && onAttivitaAdd(newAttivita)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {attivitaPrecedenti.map((attivita, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {attivita}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onAttivitaRemove(index)} />
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
            <CardTitle className="text-lg">Zone Problematiche</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Aggiungi zona"
                value={newZona}
                onChange={(e) => onNewZonaChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newZona) {
                    onZonaAdd(newZona)
                  }
                }}
              />
              <Button onClick={() => newZona && onZonaAdd(newZona)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {zoneProblematiche.map((zona, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {zona}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => onZonaRemove(index)} />
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
          <CardTitle className="text-lg">Attività Precedenti</CardTitle>
        </CardHeader>
        <CardContent>
          {fitness?.attivita_precedenti && fitness.attivita_precedenti.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {fitness.attivita_precedenti.map((attivita, index) => (
                <Badge key={index} variant="secondary">
                  {attivita}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Nessuna attività precedente</p>
          )}
        </CardContent>
      </Card>

      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <CardTitle className="text-lg">Zone Problematiche</CardTitle>
        </CardHeader>
        <CardContent>
          {fitness?.zone_problematiche && fitness.zone_problematiche.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {fitness.zone_problematiche.map((zona, index) => (
                <Badge key={index} variant="secondary">
                  {zona}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Nessuna zona problematica</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
