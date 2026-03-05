import { useState } from 'react'
import { Filter, Calendar, Target, FileWarning } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Slider,
  Switch,
} from '@/components/ui'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import type { ClienteFilters } from '@/types/cliente'

interface ClientiFiltriAvanzatiProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: ClienteFilters
  onApply: (filters: Partial<ClienteFilters>) => void
}

export function ClientiFiltriAvanzati({
  open,
  onOpenChange,
  filters,
  onApply,
}: ClientiFiltriAvanzatiProps) {
  const [dataIscrizioneDa, setDataIscrizioneDa] = useState<Date | null>(
    filters.dataIscrizioneDa ? new Date(filters.dataIscrizioneDa) : null,
  )
  const [dataIscrizioneA, setDataIscrizioneA] = useState<Date | null>(
    filters.dataIscrizioneA ? new Date(filters.dataIscrizioneA) : null,
  )
  const [allenamentiMin, setAllenamentiMin] = useState(filters.allenamenti_min || 0)
  const [soloDocumentiScadenza, setSoloDocumentiScadenza] = useState(
    filters.solo_documenti_scadenza,
  )

  const handleApply = () => {
    onApply({
      dataIscrizioneDa: dataIscrizioneDa?.toISOString() || null,
      dataIscrizioneA: dataIscrizioneA?.toISOString() || null,
      allenamenti_min: allenamentiMin > 0 ? allenamentiMin : null,
      solo_documenti_scadenza: soloDocumentiScadenza,
    })
    onOpenChange(false)
  }

  const handleReset = () => {
    setDataIscrizioneDa(null)
    setDataIscrizioneA(null)
    setAllenamentiMin(0)
    setSoloDocumentiScadenza(false)
    onApply({
      dataIscrizioneDa: null,
      dataIscrizioneA: null,
      allenamenti_min: null,
      solo_documenti_scadenza: false,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background-secondary/95 backdrop-blur-xl border-teal-500/20">
        <DialogHeader className="border-b border-background-tertiary/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
              <Filter className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <DialogTitle className="text-text-primary">Filtri Avanzati</DialogTitle>
              <DialogDescription className="text-text-secondary">
                Applica filtri personalizzati per trovare i clienti che cerchi
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Data iscrizione */}
          <div className="rounded-xl border border-background-tertiary/50 bg-background-tertiary/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-400" />
              <label className="text-text-primary text-sm font-semibold">Data Iscrizione</label>
            </div>
            <DateRangePicker
              from={dataIscrizioneDa}
              to={dataIscrizioneA}
              onChange={(from, to) => {
                setDataIscrizioneDa(from)
                setDataIscrizioneA(to)
              }}
            />
          </div>

          {/* Allenamenti minimi */}
          <div className="rounded-xl border border-background-tertiary/50 bg-background-tertiary/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-teal-400" />
              <label className="text-text-primary text-sm font-semibold" htmlFor="allenamenti-min">
                Allenamenti Minimi: {allenamentiMin}
              </label>
            </div>
            <Slider min={0} max={30} step={1} value={allenamentiMin} onChange={setAllenamentiMin} />
            <p className="text-text-tertiary mt-2 text-xs">
              Mostra solo clienti con almeno {allenamentiMin} allenamenti questo mese
            </p>
          </div>

          {/* Solo documenti in scadenza */}
          <div className="rounded-xl border border-background-tertiary/50 bg-background-tertiary/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileWarning className="h-4 w-4 text-orange-400" />
                <div>
                  <label htmlFor="doc-scadenza" className="text-text-primary text-sm font-semibold">
                    Solo documenti in scadenza
                  </label>
                  <p className="text-text-secondary text-xs">
                    Mostra solo clienti con documenti in scadenza
                  </p>
                </div>
              </div>
              <Switch
                id="doc-scadenza"
                checked={soloDocumentiScadenza}
                onCheckedChange={setSoloDocumentiScadenza}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex flex-col gap-3 border-t border-background-tertiary/50 pt-4 sm:flex-row">
            <Button variant="outline" onClick={handleReset} className="flex-1 sm:flex-none">
              <span className="mr-2">↺</span>
              Reset
            </Button>
            <Button variant="primary" onClick={handleApply} className="flex-1 sm:flex-none">
              <span className="mr-2">✓</span>
              Applica Filtri
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
