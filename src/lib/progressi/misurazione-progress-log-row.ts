/**
 * Righe progress_logs esposte da useProgressAnalytics per edit/delete lato dettaglio misurazione.
 * Colonne allineate allo schema DB ( chest_cm / waist_cm / hips_cm / thighs_cm ).
 */

export interface ProgressLogMeasurementRow {
  id: string
  date: string
  created_at: string | null
  weight_kg: number | null
  massa_grassa_percentuale: number | null
  massa_grassa_kg: number | null
  massa_magra_kg: number | null
  massa_muscolare_kg: number | null
  massa_muscolare_scheletrica_kg: number | null
  chest_cm: number | null
  waist_cm: number | null
  hips_cm: number | null
  thighs_cm: number | null
  collo_cm: number | null
  spalle_cm: number | null
  torace_inspirazione_cm: number | null
  braccio_rilassato_cm: number | null
  braccio_contratto_cm: number | null
  avambraccio_cm: number | null
  polso_cm: number | null
  vita_alta_cm: number | null
  addome_basso_cm: number | null
  glutei_cm: number | null
  coscia_alta_cm: number | null
  coscia_media_cm: number | null
  coscia_bassa_cm: number | null
  ginocchio_cm: number | null
  polpaccio_cm: number | null
  caviglia_cm: number | null
  biceps_cm: number | null
}

const MISURAZIONE_FIELD_TO_DB: Record<string, keyof ProgressLogMeasurementRow> = {
    peso_kg: 'weight_kg',
    massa_grassa_percentuale: 'massa_grassa_percentuale',
    massa_grassa_kg: 'massa_grassa_kg',
    massa_magra_kg: 'massa_magra_kg',
    massa_muscolare_kg: 'massa_muscolare_kg',
    massa_muscolare_scheletrica_kg: 'massa_muscolare_scheletrica_kg',
    collo_cm: 'collo_cm',
    spalle_cm: 'spalle_cm',
    torace_cm: 'chest_cm',
    torace_inspirazione_cm: 'torace_inspirazione_cm',
    braccio_rilassato_cm: 'braccio_rilassato_cm',
    braccio_contratto_cm: 'braccio_contratto_cm',
    avambraccio_cm: 'avambraccio_cm',
    polso_cm: 'polso_cm',
    vita_alta_cm: 'vita_alta_cm',
    vita_cm: 'waist_cm',
    addome_basso_cm: 'addome_basso_cm',
    fianchi_cm: 'hips_cm',
    glutei_cm: 'glutei_cm',
    coscia_alta_cm: 'coscia_alta_cm',
    coscia_media_cm: 'coscia_media_cm',
    coscia_bassa_cm: 'coscia_bassa_cm',
    ginocchio_cm: 'ginocchio_cm',
    polpaccio_cm: 'polpaccio_cm',
    caviglia_cm: 'caviglia_cm',
    biceps_cm: 'biceps_cm',
  }

/** Colonna reale su progress_logs (PostgREST). */
export function getProgressLogsDbColumnForMisurazioneField(field: string): string | null {
  const m = MISURAZIONE_FIELD_TO_DB[field]
  return m ? String(m) : null
}

export function readMisurazioneValueFromLogRow(
  log: ProgressLogMeasurementRow,
  misurazioneField: string,
): number | null {
  switch (misurazioneField) {
    case 'peso_kg':
      return log.weight_kg
    case 'torace_cm':
      return log.chest_cm
    case 'vita_cm':
      return log.waist_cm
    case 'fianchi_cm':
      return log.hips_cm
    case 'coscia_media_cm': {
      const v = log.coscia_media_cm ?? log.thighs_cm
      return v === null || v === undefined ? null : Number(v)
    }
    default: {
      const col = MISURAZIONE_FIELD_TO_DB[misurazioneField]
      if (!col) return null
      const v = log[col]
      if (v === null || v === undefined) return null
      return typeof v === 'number' ? v : Number(v)
    }
  }
}

export interface MisurazioneLogListItem {
  logId: string
  date: string
  value: number
}

function isLikelyUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim())
}

export function buildMisurazioneListItemsFromProgressLogs(
  logs: ProgressLogMeasurementRow[] | undefined,
  misurazioneField: string,
): MisurazioneLogListItem[] {
  if (!logs?.length) return []
  const out: MisurazioneLogListItem[] = []
  for (const log of logs) {
    if (!log.id?.trim() || !isLikelyUuid(log.id)) continue
    const raw = readMisurazioneValueFromLogRow(log, misurazioneField)
    if (raw === null || Number.isNaN(raw)) continue
    out.push({ logId: log.id.trim(), date: log.date, value: raw })
  }
  return out.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function progressLogListItemsToChartHistory(
  items: MisurazioneLogListItem[],
): Array<{ date: string; value: number }> {
  return [...items]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => ({ date: r.date, value: r.value }))
}

type RawLogLike = {
  id: string
  date: string
  created_at: string | null
  weight_kg: number | null
  chest_cm: number | null
  waist_cm: number | null
  hips_cm: number | null
  thighs_cm: number | null
  biceps_cm: number | null
  massa_grassa_percentuale?: number | null
  massa_grassa_kg?: number | null
  massa_magra_kg?: number | null
  massa_muscolare_kg?: number | null
  massa_muscolare_scheletrica_kg?: number | null
  collo_cm?: number | null
  spalle_cm?: number | null
  torace_inspirazione_cm?: number | null
  braccio_rilassato_cm?: number | null
  braccio_contratto_cm?: number | null
  avambraccio_cm?: number | null
  polso_cm?: number | null
  vita_alta_cm?: number | null
  addome_basso_cm?: number | null
  glutei_cm?: number | null
  coscia_alta_cm?: number | null
  coscia_media_cm?: number | null
  coscia_bassa_cm?: number | null
  ginocchio_cm?: number | null
  polpaccio_cm?: number | null
  caviglia_cm?: number | null
}

export function toProgressLogMeasurementRow(log: RawLogLike): ProgressLogMeasurementRow {
  return {
    id: log.id,
    date: log.date,
    created_at: log.created_at,
    weight_kg: log.weight_kg,
    massa_grassa_percentuale: log.massa_grassa_percentuale ?? null,
    massa_grassa_kg: log.massa_grassa_kg ?? null,
    massa_magra_kg: log.massa_magra_kg ?? null,
    massa_muscolare_kg: log.massa_muscolare_kg ?? null,
    massa_muscolare_scheletrica_kg: log.massa_muscolare_scheletrica_kg ?? null,
    chest_cm: log.chest_cm,
    waist_cm: log.waist_cm,
    hips_cm: log.hips_cm,
    thighs_cm: log.thighs_cm,
    collo_cm: log.collo_cm ?? null,
    spalle_cm: log.spalle_cm ?? null,
    torace_inspirazione_cm: log.torace_inspirazione_cm ?? null,
    braccio_rilassato_cm: log.braccio_rilassato_cm ?? null,
    braccio_contratto_cm: log.braccio_contratto_cm ?? null,
    avambraccio_cm: log.avambraccio_cm ?? null,
    polso_cm: log.polso_cm ?? null,
    vita_alta_cm: log.vita_alta_cm ?? null,
    addome_basso_cm: log.addome_basso_cm ?? null,
    glutei_cm: log.glutei_cm ?? null,
    coscia_alta_cm: log.coscia_alta_cm ?? null,
    coscia_media_cm: log.coscia_media_cm ?? null,
    coscia_bassa_cm: log.coscia_bassa_cm ?? null,
    ginocchio_cm: log.ginocchio_cm ?? null,
    polpaccio_cm: log.polpaccio_cm ?? null,
    caviglia_cm: log.caviglia_cm ?? null,
    biceps_cm: log.biceps_cm,
  }
}
