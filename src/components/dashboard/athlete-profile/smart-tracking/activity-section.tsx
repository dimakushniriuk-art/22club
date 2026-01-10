// ============================================================
// Componente Sezione Attività Fisica Smart Tracking (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-smart-tracking-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { TrendingUp } from 'lucide-react'
import { sanitizeNumber } from '@/lib/sanitize'

interface ActivitySectionProps {
  isEditing: boolean
  passiGiornalieri: number | null
  calorieBruciate: number | null
  distanzaPercorsaKm: number | null
  attivitaMinuti: number | null
  onPassiGiornalieriChange: (value: number | null) => void
  onCalorieBruciateChange: (value: number | null) => void
  onDistanzaPercorsaKmChange: (value: number | null) => void
  onAttivitaMinutiChange: (value: number | null) => void
}

export function ActivitySection({
  isEditing,
  passiGiornalieri,
  calorieBruciate,
  distanzaPercorsaKm,
  attivitaMinuti,
  onPassiGiornalieriChange,
  onCalorieBruciateChange,
  onDistanzaPercorsaKmChange,
  onAttivitaMinutiChange,
}: ActivitySectionProps) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-teal-400" />
          Attività Fisica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="passi_giornalieri">Passi Giornalieri</Label>
            {isEditing ? (
              <Input
                id="passi_giornalieri"
                type="number"
                min="0"
                max="100000"
                value={passiGiornalieri || ''}
                onChange={(e) => {
                  const sanitized = sanitizeNumber(
                    e.target.value ? parseInt(e.target.value) : null,
                    0,
                    100000,
                  )
                  onPassiGiornalieriChange(sanitized)
                }}
                placeholder="0-100000"
              />
            ) : (
              passiGiornalieri && (
                <p className="text-text-primary text-base font-semibold">
                  {passiGiornalieri.toLocaleString('it-IT')} passi
                </p>
              )
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="calorie_bruciate">Calorie Bruciate</Label>
            {isEditing ? (
              <Input
                id="calorie_bruciate"
                type="number"
                min="0"
                max="20000"
                value={calorieBruciate || ''}
                onChange={(e) => {
                  const sanitized = sanitizeNumber(
                    e.target.value ? parseInt(e.target.value) : null,
                    0,
                    20000,
                  )
                  onCalorieBruciateChange(sanitized)
                }}
                placeholder="0-20000"
              />
            ) : (
              calorieBruciate && (
                <p className="text-text-primary text-base font-semibold">
                  {calorieBruciate.toLocaleString('it-IT')} kcal
                </p>
              )
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="distanza_percorsa">Distanza Percorsa (km)</Label>
            {isEditing ? (
              <Input
                id="distanza_percorsa"
                type="number"
                min="0"
                max="1000"
                step="0.1"
                value={distanzaPercorsaKm || ''}
                onChange={(e) => {
                  const sanitized = sanitizeNumber(
                    e.target.value ? parseFloat(e.target.value) : null,
                    0,
                    1000,
                  )
                  onDistanzaPercorsaKmChange(sanitized)
                }}
                placeholder="0-1000"
              />
            ) : (
              distanzaPercorsaKm && (
                <p className="text-text-primary text-base font-semibold">
                  {distanzaPercorsaKm.toFixed(2)} km
                </p>
              )
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="attivita_minuti">Minuti Attività</Label>
          {isEditing ? (
            <Input
              id="attivita_minuti"
              type="number"
              min="0"
              max="1440"
              value={attivitaMinuti || ''}
              onChange={(e) => {
                const sanitized = sanitizeNumber(
                  e.target.value ? parseInt(e.target.value) : null,
                  0,
                  1440,
                )
                onAttivitaMinutiChange(sanitized)
              }}
              placeholder="0-1440"
            />
          ) : (
            attivitaMinuti && <p className="text-text-primary text-base">{attivitaMinuti} minuti</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
