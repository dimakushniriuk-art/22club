'use client'

import { useCallback, useMemo } from 'react'
import { RangeStatusMeter } from '@/components/dashboard/range-status-meter'
import { getValueRange, PROGRESS_RANGES } from '@/lib/constants/progress-ranges'
import type { ProgressKPI } from '@/hooks/use-progress-analytics'

type CategoryKey = keyof typeof PROGRESS_RANGES

export interface MisurazioneFieldEntry {
  section: string
  category: CategoryKey
  field: string
  label: string
  getValue: (d: ProgressKPI) => number | null
}

export function getMisurazioniPointHistory(
  data: ProgressKPI,
  entry: MisurazioneFieldEntry,
): Array<{ date: string; value: number | null }> {
  if (entry.category === 'valoriPrincipali' && entry.field === 'peso_kg') {
    return data.datasetPeso.map((point) => ({ date: point.date, value: point.peso }))
  }

  if (entry.category === 'valoriPrincipali') {
    return data.datasetComposizioneCorporea.map((point) => ({
      date: point.date,
      value: point[entry.field as keyof typeof point] as number | null,
    }))
  }

  if (entry.category === 'circonferenze') {
    return data.datasetCirconferenze.map((point) => ({
      date: point.date,
      value: point[entry.field as keyof typeof point] as number | null,
    }))
  }

  return []
}

export const MISURAZIONI_ENTRIES: MisurazioneFieldEntry[] = [
  {
    section: 'Valori principali',
    category: 'valoriPrincipali',
    field: 'peso_kg',
    label: 'Peso',
    getValue: (d) => d.pesoAttuale,
  },
  {
    section: 'Composizione corporea',
    category: 'valoriPrincipali',
    field: 'massa_grassa_percentuale',
    label: 'Massa grassa %',
    getValue: (d) => d.valoriComposizioneAttuali.massa_grassa_percentuale,
  },
  {
    section: 'Composizione corporea',
    category: 'valoriPrincipali',
    field: 'massa_grassa_kg',
    label: 'Massa grassa',
    getValue: (d) => d.valoriComposizioneAttuali.massa_grassa_kg,
  },
  {
    section: 'Composizione corporea',
    category: 'valoriPrincipali',
    field: 'massa_magra_kg',
    label: 'Massa magra',
    getValue: (d) => d.valoriComposizioneAttuali.massa_magra_kg,
  },
  {
    section: 'Composizione corporea',
    category: 'valoriPrincipali',
    field: 'massa_muscolare_kg',
    label: 'Massa muscolare',
    getValue: (d) => d.valoriComposizioneAttuali.massa_muscolare_kg,
  },
  {
    section: 'Composizione corporea',
    category: 'valoriPrincipali',
    field: 'massa_muscolare_scheletrica_kg',
    label: 'Massa muscolare scheletrica',
    getValue: (d) => d.valoriComposizioneAttuali.massa_muscolare_scheletrica_kg,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'collo_cm',
    label: 'Collo',
    getValue: (d) => d.valoriCirconferenzeAttuali.collo_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'spalle_cm',
    label: 'Spalle',
    getValue: (d) => d.valoriCirconferenzeAttuali.spalle_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'torace_cm',
    label: 'Torace',
    getValue: (d) => d.valoriCirconferenzeAttuali.torace_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'torace_inspirazione_cm',
    label: 'Torace (insp.)',
    getValue: (d) => d.valoriCirconferenzeAttuali.torace_inspirazione_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'braccio_rilassato_cm',
    label: 'Braccio rilassato',
    getValue: (d) => d.valoriCirconferenzeAttuali.braccio_rilassato_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'braccio_contratto_cm',
    label: 'Braccio contratto',
    getValue: (d) => d.valoriCirconferenzeAttuali.braccio_contratto_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'avambraccio_cm',
    label: 'Avambraccio',
    getValue: (d) => d.valoriCirconferenzeAttuali.avambraccio_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'polso_cm',
    label: 'Polso',
    getValue: (d) => d.valoriCirconferenzeAttuali.polso_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'vita_alta_cm',
    label: 'Vita alta',
    getValue: (d) => d.valoriCirconferenzeAttuali.vita_alta_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'vita_cm',
    label: 'Vita',
    getValue: (d) => d.valoriCirconferenzeAttuali.vita_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'addome_basso_cm',
    label: 'Addome basso',
    getValue: (d) => d.valoriCirconferenzeAttuali.addome_basso_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'fianchi_cm',
    label: 'Fianchi',
    getValue: (d) => d.valoriCirconferenzeAttuali.fianchi_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'glutei_cm',
    label: 'Glutei',
    getValue: (d) => d.valoriCirconferenzeAttuali.glutei_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'coscia_alta_cm',
    label: 'Coscia alta',
    getValue: (d) => d.valoriCirconferenzeAttuali.coscia_alta_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'coscia_media_cm',
    label: 'Coscia media',
    getValue: (d) => d.valoriCirconferenzeAttuali.coscia_media_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'coscia_bassa_cm',
    label: 'Coscia bassa',
    getValue: (d) => d.valoriCirconferenzeAttuali.coscia_bassa_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'ginocchio_cm',
    label: 'Ginocchio',
    getValue: (d) => d.valoriCirconferenzeAttuali.ginocchio_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'polpaccio_cm',
    label: 'Polpaccio',
    getValue: (d) => d.valoriCirconferenzeAttuali.polpaccio_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'caviglia_cm',
    label: 'Caviglia',
    getValue: (d) => d.valoriCirconferenzeAttuali.caviglia_cm,
  },
  {
    section: 'Circonferenze',
    category: 'circonferenze',
    field: 'biceps_cm',
    label: 'Biceps',
    getValue: (d) => d.valoriCirconferenzeAttuali.biceps_cm,
  },
]

export function findMisurazioneEntryByField(field: string): MisurazioneFieldEntry | undefined {
  return MISURAZIONI_ENTRIES.find((e) => e.field === field)
}

export function MisurazioniValuesContent({
  data,
  measurementDetailBasePath,
}: {
  data: ProgressKPI
  /** Es. `/home/progressi/misurazioni` o `/dashboard/atleti/[id]/progressi/misurazioni` — apre `[base]/[field]`. */
  measurementDetailBasePath?: string
}) {
  const toHistory = useCallback(
    (entry: MisurazioneFieldEntry) => getMisurazioniPointHistory(data, entry),
    [data],
  )

  const sections = useMemo(() => {
    const bySection = new Map<string, MisurazioneFieldEntry[]>()
    for (const entry of MISURAZIONI_ENTRIES) {
      const list = bySection.get(entry.section) ?? []
      list.push(entry)
      bySection.set(entry.section, list)
    }
    return Array.from(bySection.entries())
  }, [])

  return (
    <div className="space-y-8">
      {sections.map(([sectionTitle, entries]) => (
        <div key={sectionTitle}>
          <h3 className="text-sm font-semibold text-text-primary mb-3 pb-1.5 border-b border-white/10">
            {sectionTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => {
              const value = entry.getValue(data)
              const range = getValueRange(entry.category, entry.field)
              if (!range) return null
              const unit = range.unit ? ` ${range.unit}` : ''
              const detailHref =
                measurementDetailBasePath !== undefined && measurementDetailBasePath.length > 0
                  ? `${measurementDetailBasePath.replace(/\/$/, '')}/${encodeURIComponent(entry.field)}`
                  : undefined
              return (
                <div
                  key={`${entry.category}-${entry.field}`}
                  className="min-w-0 rounded-lg border border-white/10 bg-white/[0.02] p-3"
                >
                  <RangeStatusMeter
                    value={value}
                    history={toHistory(entry)}
                    title={entry.label}
                    unit={unit}
                    showValue
                    height={150}
                    detailHref={detailHref}
                    misurazioneField={entry.field}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
