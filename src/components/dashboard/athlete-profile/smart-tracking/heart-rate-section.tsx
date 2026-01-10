// ============================================================
// Componente Sezione Battito Cardiaco Smart Tracking (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-smart-tracking-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Heart } from 'lucide-react'
import { sanitizeNumber } from '@/lib/sanitize'

interface HeartRateSectionProps {
  isEditing: boolean
  battitoCardiacoMedio: number | null
  battitoCardiacoMax: number | null
  battitoCardiacoMin: number | null
  onBattitoCardiacoMedioChange: (value: number | null) => void
  onBattitoCardiacoMaxChange: (value: number | null) => void
  onBattitoCardiacoMinChange: (value: number | null) => void
}

export function HeartRateSection({
  isEditing,
  battitoCardiacoMedio,
  battitoCardiacoMax,
  battitoCardiacoMin,
  onBattitoCardiacoMedioChange,
  onBattitoCardiacoMaxChange,
  onBattitoCardiacoMinChange,
}: HeartRateSectionProps) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 text-teal-400" />
          Battito Cardiaco
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="battito_medio">Battito Medio (bpm)</Label>
            {isEditing ? (
              <Input
                id="battito_medio"
                type="number"
                min="30"
                max="250"
                value={battitoCardiacoMedio || ''}
                onChange={(e) => {
                  const sanitized = sanitizeNumber(
                    e.target.value ? parseInt(e.target.value) : null,
                    30,
                    250,
                  )
                  onBattitoCardiacoMedioChange(sanitized)
                }}
                placeholder="30-250"
              />
            ) : (
              battitoCardiacoMedio && (
                <p className="text-text-primary text-base font-semibold">
                  {battitoCardiacoMedio} bpm
                </p>
              )
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="battito_max">Battito Massimo (bpm)</Label>
            {isEditing ? (
              <Input
                id="battito_max"
                type="number"
                min="30"
                max="250"
                value={battitoCardiacoMax || ''}
                onChange={(e) => {
                  const sanitized = sanitizeNumber(
                    e.target.value ? parseInt(e.target.value) : null,
                    30,
                    250,
                  )
                  onBattitoCardiacoMaxChange(sanitized)
                }}
                placeholder="30-250"
              />
            ) : (
              battitoCardiacoMax && (
                <p className="text-text-primary text-base font-semibold">
                  {battitoCardiacoMax} bpm
                </p>
              )
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="battito_min">Battito Minimo (bpm)</Label>
            {isEditing ? (
              <Input
                id="battito_min"
                type="number"
                min="30"
                max="250"
                value={battitoCardiacoMin || ''}
                onChange={(e) => {
                  const sanitized = sanitizeNumber(
                    e.target.value ? parseInt(e.target.value) : null,
                    30,
                    250,
                  )
                  onBattitoCardiacoMinChange(sanitized)
                }}
                placeholder="30-250"
              />
            ) : (
              battitoCardiacoMin && (
                <p className="text-text-primary text-base font-semibold">
                  {battitoCardiacoMin} bpm
                </p>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
