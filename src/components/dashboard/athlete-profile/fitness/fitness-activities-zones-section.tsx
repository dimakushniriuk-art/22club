// ============================================================
// Componente Sezione Attività Precedenti e Zone Problematiche (FASE C - Split File Lunghi)
// ============================================================
// Contenuto interno: usare dentro shell Card profilo (tab fitness).
// ============================================================

'use client'

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
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
          Attività precedenti
        </p>
        {isEditing ? (
          <>
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
                className="border-white/10 bg-white/[0.04] text-xs"
              />
              <Button
                size="icon"
                onClick={() => newAttivita && onAttivitaAdd(newAttivita)}
                className="h-9 shrink-0"
              >
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
          </>
        ) : fitness?.attivita_precedenti && fitness.attivita_precedenti.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {fitness.attivita_precedenti.map((attivita, index) => (
              <Badge key={index} variant="secondary">
                {attivita}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Nessuna attività precedente</p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
          Zone problematiche
        </p>
        {isEditing ? (
          <>
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
                className="border-white/10 bg-white/[0.04] text-xs"
              />
              <Button
                size="icon"
                onClick={() => newZona && onZonaAdd(newZona)}
                className="h-9 shrink-0"
              >
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
          </>
        ) : fitness?.zone_problematiche && fitness.zone_problematiche.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {fitness.zone_problematiche.map((zona, index) => (
              <Badge key={index} variant="secondary">
                {zona}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Nessuna zona problematica</p>
        )}
      </div>
    </div>
  )
}
