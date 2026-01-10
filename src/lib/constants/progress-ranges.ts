/**
 * Range minimo e massimo per tutti i valori delle misurazioni corporee
 * Basato su standard antropometrici e fisiologici
 */

export interface ValueRange {
  min: number
  max: number
  unit?: string
  note?: string
}

export interface ProgressRanges {
  valoriPrincipali: {
    peso_kg: ValueRange
    massa_grassa_percentuale: ValueRange
    massa_grassa_kg: ValueRange
    massa_magra_kg: ValueRange
    massa_muscolare_kg: ValueRange
    massa_muscolare_scheletrica_kg: ValueRange
  }
  circonferenze: {
    collo_cm: ValueRange
    spalle_cm: ValueRange
    torace_cm: ValueRange
    torace_inspirazione_cm: ValueRange
    braccio_rilassato_cm: ValueRange
    braccio_contratto_cm: ValueRange
    avambraccio_cm: ValueRange
    polso_cm: ValueRange
    vita_alta_cm: ValueRange
    vita_cm: ValueRange
    addome_basso_cm: ValueRange
    fianchi_cm: ValueRange
    glutei_cm: ValueRange
    coscia_alta_cm: ValueRange
    coscia_media_cm: ValueRange
    coscia_bassa_cm: ValueRange
    ginocchio_cm: ValueRange
    polpaccio_cm: ValueRange
    caviglia_cm: ValueRange
  }
  misureAntropometriche: {
    statura_allungata_cm: ValueRange
    statura_da_seduto_cm: ValueRange
    apertura_braccia_cm: ValueRange
  }
  composizioneCorporea: {
    massa_ossea_kg: ValueRange
    massa_residuale_kg: ValueRange
  }
  perimetriCorretti: {
    braccio_corretto_cm: ValueRange
    coscia_corretta_cm: ValueRange
    gamba_corretta_cm: ValueRange
  }
  indici: {
    imc: ValueRange
    vita_fianchi: ValueRange
    indice_adiposo_muscolare: ValueRange
    indice_muscolo_osseo: ValueRange
    indice_conicita: ValueRange
    indice_manouvrier: ValueRange
    indice_cormico: ValueRange
    area_superficie_corporea_m2: ValueRange
  }
  metabolismo: {
    metabolismo_basale_kcal: ValueRange
    dispendio_totale_kcal: ValueRange
  }
  somatotipo: {
    endomorfia: ValueRange
    mesomorfia: ValueRange
    ectomorfia: ValueRange
  }
  plicheCutanee: {
    tricipite_mm: ValueRange
    sottoscapolare_mm: ValueRange
    bicipite_mm: ValueRange
    cresta_iliaca_mm: ValueRange
    sopraspinale_mm: ValueRange
    addominale_mm: ValueRange
    coscia_mm: ValueRange
    gamba_mm: ValueRange
  }
  diametriOssei: {
    omero_cm: ValueRange
    bistiloideo_cm: ValueRange
    femore_cm: ValueRange
  }
}

export const PROGRESS_RANGES: ProgressRanges = {
  valoriPrincipali: {
    peso_kg: { min: 60, max: 120, unit: 'kg', note: 'Dipende da statura' },
    massa_grassa_percentuale: { min: 8, max: 25, unit: '%', note: '<10 atleta, >25 alto' },
    massa_grassa_kg: { min: 5, max: 35, unit: 'kg', note: 'Dipende dal peso' },
    massa_magra_kg: { min: 45, max: 85, unit: 'kg', note: 'Include muscoli + ossa' },
    massa_muscolare_kg: { min: 35, max: 65, unit: 'kg', note: 'Allenamento dipendente' },
    massa_muscolare_scheletrica_kg: { min: 25, max: 45, unit: 'kg', note: 'Ottimo indicatore PT' },
  },
  circonferenze: {
    collo_cm: { min: 34, max: 45, unit: 'cm' },
    spalle_cm: { min: 95, max: 130, unit: 'cm' },
    torace_cm: { min: 85, max: 130, unit: 'cm' },
    torace_inspirazione_cm: { min: 3, max: 10, unit: 'cm', note: '+3 a +10 rispetto a torace' },
    braccio_rilassato_cm: { min: 26, max: 45, unit: 'cm' },
    braccio_contratto_cm: { min: 30, max: 50, unit: 'cm' },
    avambraccio_cm: { min: 24, max: 36, unit: 'cm' },
    polso_cm: { min: 15, max: 21, unit: 'cm' },
    vita_alta_cm: { min: 65, max: 110, unit: 'cm' },
    vita_cm: { min: 65, max: 120, unit: 'cm' },
    addome_basso_cm: { min: 70, max: 125, unit: 'cm' },
    fianchi_cm: { min: 80, max: 130, unit: 'cm' },
    glutei_cm: { min: 85, max: 130, unit: 'cm' },
    coscia_alta_cm: { min: 45, max: 75, unit: 'cm' },
    coscia_media_cm: { min: 40, max: 70, unit: 'cm' },
    coscia_bassa_cm: { min: 35, max: 65, unit: 'cm' },
    ginocchio_cm: { min: 32, max: 45, unit: 'cm' },
    polpaccio_cm: { min: 30, max: 50, unit: 'cm' },
    caviglia_cm: { min: 19, max: 26, unit: 'cm' },
  },
  misureAntropometriche: {
    statura_allungata_cm: { min: 155, max: 200, unit: 'cm' },
    statura_da_seduto_cm: { min: 75, max: 105, unit: 'cm' },
    apertura_braccia_cm: { min: 155, max: 210, unit: 'cm', note: '= altezza +10' },
  },
  composizioneCorporea: {
    massa_ossea_kg: { min: 10, max: 18, unit: 'kg' },
    massa_residuale_kg: { min: 12, max: 20, unit: 'kg' },
  },
  perimetriCorretti: {
    braccio_corretto_cm: { min: 24, max: 38, unit: 'cm' },
    coscia_corretta_cm: { min: 40, max: 65, unit: 'cm' },
    gamba_corretta_cm: { min: 30, max: 45, unit: 'cm' },
  },
  indici: {
    imc: { min: 18.5, max: 24.9, unit: '', note: 'Stato ottimale: 20–23' },
    vita_fianchi: { min: 0.8, max: 0.95, unit: '', note: 'Stato ottimale: <0.90' },
    indice_adiposo_muscolare: { min: 0.8, max: 2.5, unit: '', note: 'Stato ottimale: <1.5' },
    indice_muscolo_osseo: { min: 1.8, max: 3.5, unit: '', note: 'Stato ottimale: >2.2' },
    indice_conicita: { min: 1.0, max: 1.3, unit: '', note: 'Stato ottimale: <1.20' },
    indice_manouvrier: { min: -5, max: 5, unit: '', note: 'Stato ottimale: ~0' },
    indice_cormico: { min: 48, max: 55, unit: '', note: 'Stato ottimale: 50–53' },
    area_superficie_corporea_m2: { min: 1.6, max: 2.5, unit: 'm²' },
  },
  metabolismo: {
    metabolismo_basale_kcal: { min: 1400, max: 2500, unit: 'kcal' },
    dispendio_totale_kcal: { min: 1800, max: 4500, unit: 'kcal' },
  },
  somatotipo: {
    endomorfia: { min: 1, max: 9, unit: '' },
    mesomorfia: { min: 1, max: 9, unit: '' },
    ectomorfia: { min: 0.1, max: 7, unit: '' },
  },
  plicheCutanee: {
    tricipite_mm: { min: 6, max: 30, unit: 'mm' },
    sottoscapolare_mm: { min: 8, max: 35, unit: 'mm' },
    bicipite_mm: { min: 4, max: 20, unit: 'mm' },
    cresta_iliaca_mm: { min: 10, max: 45, unit: 'mm' },
    sopraspinale_mm: { min: 8, max: 40, unit: 'mm' },
    addominale_mm: { min: 10, max: 50, unit: 'mm' },
    coscia_mm: { min: 10, max: 45, unit: 'mm' },
    gamba_mm: { min: 6, max: 30, unit: 'mm' },
  },
  diametriOssei: {
    omero_cm: { min: 6.5, max: 8.5, unit: 'cm' },
    bistiloideo_cm: { min: 5.5, max: 7.5, unit: 'cm' },
    femore_cm: { min: 8.5, max: 11.5, unit: 'cm' },
  },
}

/**
 * Helper per ottenere il range di un valore specifico
 */
export function getValueRange(
  category: keyof ProgressRanges,
  field: string,
): ValueRange | undefined {
  const categoryData = PROGRESS_RANGES[category] as Record<string, ValueRange>
  return categoryData[field]
}

/**
 * Helper per verificare se un valore è nel range
 */
export function isValueInRange(
  category: keyof ProgressRanges,
  field: string,
  value: number | null | undefined,
): boolean {
  if (value === null || value === undefined) return false
  const range = getValueRange(category, field)
  if (!range) return true // Se non c'è range definito, accetta qualsiasi valore
  return value >= range.min && value <= range.max
}

/**
 * Helper per ottenere il colore in base al range (verde = ok, giallo = warning, rosso = out of range)
 */
export function getRangeColor(
  category: keyof ProgressRanges,
  field: string,
  value: number | null | undefined,
): 'success' | 'warning' | 'error' | 'default' {
  if (value === null || value === undefined) return 'default'
  const range = getValueRange(category, field)
  if (!range) return 'default'

  const percentage = ((value - range.min) / (range.max - range.min)) * 100

  if (percentage < 10 || percentage > 90) return 'error'
  if (percentage < 20 || percentage > 80) return 'warning'
  return 'success'
}
