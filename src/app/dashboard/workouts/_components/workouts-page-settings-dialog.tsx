'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Switch,
} from '@/components/ui'
import { cn } from '@/lib/utils'

type WorkoutsPageSettingsDialogProps = {
  hasDirtySlots: boolean
  onClearLocalState: () => void
  anagraficaStripVisible: boolean
  onToggleAnagraficaStrip: () => void
  columnsMode: 1 | 2
  onSetColumnsMode: (mode: 1 | 2) => void
}

export function WorkoutsPageSettingsDialog({
  hasDirtySlots,
  onClearLocalState,
  anagraficaStripVisible,
  onToggleAnagraficaStrip,
  columnsMode,
  onSetColumnsMode,
}: WorkoutsPageSettingsDialogProps) {
  const [open, setOpen] = useState(false)

  const handleClear = () => {
    const msg = hasDirtySlots
      ? 'Ci sono modifiche non salvate. Svuotando la memoria le colonne si chiudono e le modifiche andranno perse. Continuare?'
      : 'Rimuovere gli atleti dalle colonne e cancellare l’URL salvato in questa sessione?'
    if (!window.confirm(msg)) return
    onClearLocalState()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-text-secondary hover:bg-white/10 hover:text-text-primary"
          aria-label="Personalizza pagina"
          title="Personalizza pagina"
          onClick={() => setOpen(true)}
        >
          <Settings className="h-5 w-5" aria-hidden />
        </Button>
      </>
      <DialogContent className="w-full max-w-[min(36rem,calc(100vw-2rem))] max-h-[min(90dvh,52rem)] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-1 pr-8">
          <DialogTitle>Personalizza workouts</DialogTitle>
          <DialogDescription>
            Due colonne affiancate: in ciascuna apri scheda, giorno e sessione dell’atleta. Sotto,
            la fascia &quot;Seleziona atleta&quot; usa l’agenda di oggi per aprire o chiudere uno
            slot con un tap.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 pt-4 space-y-4">
          <section className="space-y-2" aria-labelledby="workouts-settings-layout-heading">
            <h2
              id="workouts-settings-layout-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary/90 sm:text-xs"
            >
              Layout
            </h2>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">Colonne</p>
                <p className="text-xs leading-relaxed text-text-tertiary">
                  Scegli se usare una o due colonne affiancate.
                </p>
              </div>
              <div
                className="flex shrink-0 items-center rounded-full border border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                role="group"
                aria-label="Numero colonne"
              >
                <button
                  type="button"
                  className={cn(
                    'min-h-[44px] px-3 sm:min-h-0 sm:h-9 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
                    columnsMode === 1
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-2 ring-primary/40'
                      : 'text-text-tertiary hover:text-text-secondary hover:bg-white/5',
                  )}
                  aria-pressed={columnsMode === 1}
                  onClick={() => onSetColumnsMode(1)}
                >
                  1
                </button>
                <button
                  type="button"
                  className={cn(
                    'min-h-[44px] px-3 sm:min-h-0 sm:h-9 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
                    columnsMode === 2
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-2 ring-primary/40'
                      : 'text-text-tertiary hover:text-text-secondary hover:bg-white/5',
                  )}
                  aria-pressed={columnsMode === 2}
                  onClick={() => onSetColumnsMode(2)}
                >
                  2
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">Atleti in anagrafica</p>
                <p className="text-xs leading-relaxed text-text-tertiary">
                  Mostra sotto la fascia agenda l’elenco atleti in anagrafica.
                </p>
              </div>
              <Switch
                checked={anagraficaStripVisible}
                onCheckedChange={onToggleAnagraficaStrip}
                aria-label={`Atleti in anagrafica, ${anagraficaStripVisible ? 'visibile' : 'nascosto'}`}
              />
            </div>
          </section>

          <section
            className="space-y-3 border-t border-white/[0.06] pt-4"
            aria-labelledby="workouts-settings-memory-heading"
          >
            <h2
              id="workouts-settings-memory-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary/90 sm:text-xs"
            >
              Memoria su questo dispositivo
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Gli atleti nelle colonne e i parametri del pannello (URL) possono essere ripresi dopo
              navigazione grazie a dati in sessione del browser. Puoi azzerarli se la pagina resta
              incollata a uno stato vecchio.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleClear}
            >
              Svuota colonne e memoria locale
            </Button>
          </section>
        </div>

        <DialogFooter className="mt-6 flex-col gap-2 border-t border-white/[0.06] pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="primary" size="sm" onClick={() => setOpen(false)}>
            Salva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
