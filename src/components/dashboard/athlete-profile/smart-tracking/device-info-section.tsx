// ============================================================
// Componente Sezione Dispositivo Smart Tracking (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-smart-tracking-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Calendar, Watch } from 'lucide-react'
import type { DispositivoTipoEnum } from '@/types/athlete-profile'
import { sanitizeString } from '@/lib/sanitize'

const DISPOSITIVI_TIPO: { value: DispositivoTipoEnum; label: string }[] = [
  { value: 'smartwatch', label: 'Smartwatch' },
  { value: 'fitness_tracker', label: 'Fitness Tracker' },
  { value: 'app_mobile', label: 'App Mobile' },
  { value: 'altro', label: 'Altro' },
]

interface DeviceInfoSectionProps {
  isEditing: boolean
  dataRilevazione: string
  dispositivoTipo: DispositivoTipoEnum | null
  dispositivoMarca: string | null
  onDataRilevazioneChange: (value: string) => void
  onDispositivoTipoChange: (value: DispositivoTipoEnum | null) => void
  onDispositivoMarcaChange: (value: string | null) => void
}

export function DeviceInfoSection({
  isEditing,
  dataRilevazione,
  dispositivoTipo,
  dispositivoMarca,
  onDataRilevazioneChange,
  onDispositivoTipoChange,
  onDispositivoMarcaChange,
}: DeviceInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Data Rilevazione */}
      <Card
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background-secondary/40 backdrop-blur-xl shadow-[0_0_30px_rgba(2,179,191,0.08)] hover:shadow-[0_0_40px_rgba(2,179,191,0.15)] transition-all duration-300"
      >
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Data Rilevazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="data_rilevazione">Data</Label>
                <Input
                  id="data_rilevazione"
                  type="date"
                  value={dataRilevazione}
                  onChange={(e) => onDataRilevazioneChange(e.target.value)}
                  required
                />
                <p className="text-text-secondary text-xs">
                  Seleziona la data per cui vuoi inserire/aggiornare i dati
                </p>
              </div>
            </div>
          ) : (
            dataRilevazione && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-text-tertiary" />
                <p className="text-text-primary text-base font-semibold">
                  {new Date(dataRilevazione).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Dispositivo */}
      <Card
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background-secondary/40 backdrop-blur-xl shadow-[0_0_30px_rgba(2,179,191,0.08)] hover:shadow-[0_0_40px_rgba(2,179,191,0.15)] transition-all duration-300"
      >
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Watch className="h-5 w-5 text-primary" />
            Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dispositivo_tipo">Tipo</Label>
            {isEditing ? (
              <select
                id="dispositivo_tipo"
                value={dispositivoTipo || ''}
                onChange={(e) =>
                  onDispositivoTipoChange((e.target.value || null) as DispositivoTipoEnum | null)
                }
                className="w-full px-3 py-2 bg-background-secondary border border-primary/20 rounded-lg text-text-primary"
              >
                <option value="">Non specificato</option>
                {DISPOSITIVI_TIPO.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            ) : (
              dispositivoTipo && (
                <p className="text-text-primary text-base">
                  {DISPOSITIVI_TIPO.find((d) => d.value === dispositivoTipo)?.label ||
                    dispositivoTipo}
                </p>
              )
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispositivo_marca">Marca</Label>
            {isEditing ? (
              <Input
                id="dispositivo_marca"
                value={dispositivoMarca || ''}
                maxLength={100}
                onChange={(e) => {
                  const sanitized = sanitizeString(e.target.value, 100)
                  onDispositivoMarcaChange(sanitized || null)
                }}
                placeholder="Es. Apple Watch, Fitbit, ecc."
              />
            ) : (
              dispositivoMarca && <p className="text-text-primary text-base">{dispositivoMarca}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
