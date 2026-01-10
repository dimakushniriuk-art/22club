// ============================================================
// Componente Sezione Sonno Smart Tracking (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-smart-tracking-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Moon } from 'lucide-react'
import type { QualitaSonnoEnum } from '@/types/athlete-profile'
import { sanitizeNumber } from '@/lib/sanitize'

const QUALITA_SONNO: { value: QualitaSonnoEnum; label: string }[] = [
  { value: 'ottima', label: 'Ottima' },
  { value: 'buona', label: 'Buona' },
  { value: 'media', label: 'Media' },
  { value: 'scarsa', label: 'Scarsa' },
]

interface SleepSectionProps {
  isEditing: boolean
  oreSonno: number | null
  qualitaSonno: QualitaSonnoEnum | null
  onOreSonnoChange: (value: number | null) => void
  onQualitaSonnoChange: (value: QualitaSonnoEnum | null) => void
}

export function SleepSection({
  isEditing,
  oreSonno,
  qualitaSonno,
  onOreSonnoChange,
  onQualitaSonnoChange,
}: SleepSectionProps) {
  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Moon className="h-5 w-5 text-teal-400" />
          Sonno
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="ore_sonno">Ore Sonno</Label>
            {isEditing ? (
              <Input
                id="ore_sonno"
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={oreSonno || ''}
                onChange={(e) => {
                  const sanitized = sanitizeNumber(
                    e.target.value ? parseFloat(e.target.value) : null,
                    0,
                    24,
                  )
                  onOreSonnoChange(sanitized)
                }}
                placeholder="0-24"
              />
            ) : (
              oreSonno && (
                <p className="text-text-primary text-base font-semibold">{oreSonno} ore</p>
              )
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualita_sonno">Qualità Sonno</Label>
            {isEditing ? (
              <select
                id="qualita_sonno"
                value={qualitaSonno || ''}
                onChange={(e) =>
                  onQualitaSonnoChange((e.target.value || null) as QualitaSonnoEnum | null)
                }
                className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-text-primary"
              >
                <option value="">Non specificato</option>
                {QUALITA_SONNO.map((qualita) => (
                  <option key={qualita.value} value={qualita.value}>
                    {qualita.label}
                  </option>
                ))}
              </select>
            ) : (
              qualitaSonno && (
                <p className="text-text-primary text-base">
                  {QUALITA_SONNO.find((q) => q.value === qualitaSonno)?.label || qualitaSonno}
                </p>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
