// ============================================================
// Componente Step 1 - Info Generali (FASE C - Split File Lunghi)
// ============================================================
// Estratto da workout-wizard.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Input } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { SimpleSelect } from '@/components/ui/simple-select'
import { Card, CardContent } from '@/components/ui'
import type { WorkoutWizardData } from '@/types/workout'
import { WORKOUT_OBJECTIVES } from '@/lib/constants/workout-objectives'

interface WorkoutWizardStep1Props {
  wizardData: WorkoutWizardData
  athletes: Array<{ id: string; name: string; email: string }>
  onWizardDataChange: (data: Partial<WorkoutWizardData>) => void
}

export function WorkoutWizardStep1({
  wizardData,
  athletes,
  onWizardDataChange,
}: WorkoutWizardStep1Props) {
  return (
    <Card variant="trainer" className="border-surface-300/30 bg-background-secondary/50 shadow-sm">
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-6">
          <div className="mb-6">
            <h3 className="text-text-primary mb-2 text-xl font-bold">Informazioni generali</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Definisci il nome, le note e seleziona l&apos;atleta per la scheda di allenamento
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Input
                label="Nome scheda *"
                placeholder="Es: Scheda Forza - Settimana 1"
                value={wizardData.title}
                onChange={(e) => onWizardDataChange({ title: e.target.value })}
                className="w-full text-base"
              />
              <p className="text-text-tertiary mt-2 text-sm leading-relaxed">
                Scegli un nome descrittivo per identificare facilmente questa scheda
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-text-primary mb-2 block text-sm font-medium">
                Obiettivo scheda *
              </label>
              <SimpleSelect
                value={wizardData.objective || ''}
                onValueChange={(value) => onWizardDataChange({ objective: value || undefined })}
                options={[{ value: '', label: 'Seleziona un obiettivo' }, ...WORKOUT_OBJECTIVES]}
                placeholder="Seleziona un obiettivo"
              />
              <p className="text-text-tertiary mt-2 text-sm leading-relaxed">
                Seleziona l&apos;obiettivo principale di questa scheda di allenamento
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-text-primary mb-2 block text-sm font-medium">Atleta *</label>
              <SimpleSelect
                value={wizardData.athlete_id}
                onValueChange={(value) => onWizardDataChange({ athlete_id: value })}
                options={[
                  { value: '', label: 'Seleziona un atleta' },
                  ...athletes.map((athlete) => ({
                    value: athlete.id,
                    label: athlete.name,
                  })),
                ]}
                placeholder="Seleziona un atleta"
              />
              <p className="text-text-tertiary mt-2 text-sm leading-relaxed">
                L&apos;atleta selezionato avrà accesso a questa scheda di allenamento
              </p>
            </div>

            <div className="space-y-2">
              <Textarea
                label="Note (opzionali)"
                placeholder="Aggiungi note, obiettivi o istruzioni per l'atleta..."
                value={wizardData.notes}
                onChange={(e) => onWizardDataChange({ notes: e.target.value })}
                rows={2}
                className="w-full text-base min-h-[40px]"
              />
              <p className="text-text-tertiary mt-2 text-sm leading-relaxed">
                Queste note saranno visibili all&apos;atleta quando visualizza la scheda
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
