// ============================================================
// Componente Step 2 - Giorni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-wizard.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Badge } from '@/components/ui'
import { SimpleSelect } from '@/components/ui'
import type { SimpleSelectOption } from '@/components/ui/simple-select'
import { Calendar, Repeat2, X } from 'lucide-react'
import type { WorkoutWizardData } from '@/types/workout'

const SESSIONS_SELECT_MAX = 30

function buildSessionsUntilRefreshOptions(
  current: number | null | undefined,
): SimpleSelectOption[] {
  const empty: SimpleSelectOption = { value: '', label: '—' }
  const standard: SimpleSelectOption[] = Array.from({ length: SESSIONS_SELECT_MAX }, (_, i) => {
    const n = i + 1
    return { value: String(n), label: String(n) }
  })
  if (
    typeof current === 'number' &&
    Number.isFinite(current) &&
    Number.isInteger(current) &&
    current >= 1 &&
    current > SESSIONS_SELECT_MAX
  ) {
    return [
      empty,
      { value: String(current), label: `${current} (attuale)` },
      ...standard,
    ]
  }
  return [empty, ...standard]
}

interface WorkoutWizardStep2Props {
  wizardData: WorkoutWizardData
  onAddDay: () => void
  onUpdateDay: (index: number, data: Partial<WorkoutWizardData['days'][0]>) => void
  onRemoveDay: (index: number) => void
}

export function WorkoutWizardStep2({
  wizardData,
  onAddDay,
  onUpdateDay,
  onRemoveDay,
}: WorkoutWizardStep2Props) {
  return (
    <Card variant="default" className="relative overflow-hidden transition-all duration-200">
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-text-primary mb-2 text-xl font-bold">Giorni di allenamento</h3>
              <p className="text-text-secondary text-sm">
                Organizza i giorni della settimana per questa scheda
              </p>
            </div>
            <Button
              onClick={onAddDay}
              size="sm"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 border-0"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Aggiungi giorno
            </Button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {wizardData.days.map((day, index) => (
              <Card
                key={index}
                variant="default"
                className="relative overflow-hidden hover:border-white/20 transition-all duration-200"
              >
                <CardContent className="space-y-4 p-4 sm:p-5">
                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 min-w-0">
                    <Badge
                      variant="outline"
                      size="sm"
                      className="border-0 bg-primary/10 text-primary tabular-nums justify-self-start"
                    >
                      Giorno {day.day_number}
                    </Badge>
                    <Input
                      aria-label={`Nome allenamento giorno ${day.day_number}`}
                      value={day.title}
                      onChange={(e) => onUpdateDay(index, { title: e.target.value })}
                      className="min-w-0"
                      placeholder="Nome giorno (es. Spinta, Gambe…)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveDay(index)}
                      aria-label={`Rimuovi giorno ${day.day_number}`}
                      className="h-9 w-9 shrink-0 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="rounded-xl bg-white/[0.04] p-4 ring-1 ring-inset ring-white/[0.08]">
                    {/* Grid: evita w-full sul select in row flex che ruba tutta la larghezza e comprime il testo */}
                    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_10.5rem] sm:items-start sm:gap-x-6 sm:gap-y-3">
                      <div className="flex min-w-0 gap-3">
                        <div
                          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20"
                          aria-hidden
                        >
                          <Repeat2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className="text-sm font-medium leading-snug text-text-primary">
                            Sessioni prima della revisione
                            <span className="font-normal text-text-tertiary"> · opzionale</span>
                          </p>
                          <p className="text-xs leading-relaxed text-text-tertiary">
                            Quante volte ripetere questo giorno nel ciclo prima di aggiornare esercizi
                            o carico.
                          </p>
                        </div>
                      </div>
                      <div className="min-w-0 space-y-1.5 sm:justify-self-stretch">
                        <span className="block text-xs font-medium uppercase tracking-wide text-text-secondary">
                          N. sessioni
                        </span>
                        <SimpleSelect
                          value={
                            day.sessions_until_refresh != null &&
                            day.sessions_until_refresh >= 1
                              ? String(day.sessions_until_refresh)
                              : ''
                          }
                          onValueChange={(value) => {
                            if (value === '') {
                              onUpdateDay(index, { sessions_until_refresh: null })
                              return
                            }
                            const n = parseInt(value, 10)
                            if (!Number.isFinite(n) || n < 1) return
                            onUpdateDay(index, { sessions_until_refresh: n })
                          }}
                          placeholder="—"
                          options={buildSessionsUntilRefreshOptions(day.sessions_until_refresh)}
                          className="w-full"
                          triggerTestId={`workout-wizard-sessions-trigger-${index}`}
                          dropdownTestId={`workout-wizard-sessions-dropdown-${index}`}
                          optionTestIdPrefix={`workout-wizard-sessions-opt-${index}`}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {wizardData.days.length === 0 && (
              <Card variant="default" className="shadow-sm">
                <CardContent className="py-12 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="bg-primary/10 text-primary border border-primary/25 rounded-full p-4">
                      <Calendar className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-text-primary mb-2 text-lg font-semibold">
                    Nessun giorno aggiunto
                  </h3>
                  <p className="text-text-secondary mb-6 text-sm">
                    Aggiungi almeno un giorno per organizzare la scheda di allenamento
                  </p>
                  <Button
                    onClick={onAddDay}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 border-0"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Aggiungi primo giorno
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
