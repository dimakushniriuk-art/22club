export interface ProgressLog {
  id: string
  athlete_id: string
  date: string
  // Valori principali
  weight_kg?: number | null
  massa_grassa_percentuale?: number | null
  massa_grassa_kg?: number | null
  massa_magra_kg?: number | null
  massa_muscolare_kg?: number | null
  massa_muscolare_scheletrica_kg?: number | null
  // Misure antropometriche aggiuntive
  statura_allungata_cm?: number | null
  statura_seduto_cm?: number | null
  apertura_braccia_cm?: number | null
  // Composizione corporea aggiuntiva
  massa_ossea_kg?: number | null
  massa_residuale_kg?: number | null
  // Circonferenze
  collo_cm?: number | null
  spalle_cm?: number | null
  chest_cm?: number | null // torace_cm
  torace_inspirazione_cm?: number | null
  braccio_rilassato_cm?: number | null
  braccio_contratto_cm?: number | null
  biceps_cm?: number | null // compatibilità
  avambraccio_cm?: number | null
  polso_cm?: number | null
  vita_alta_cm?: number | null
  waist_cm?: number | null // vita_cm
  addome_basso_cm?: number | null
  hips_cm?: number | null // fianchi_cm
  glutei_cm?: number | null
  coscia_alta_cm?: number | null
  coscia_media_cm?: number | null
  coscia_bassa_cm?: number | null
  thighs_cm?: number | null // compatibilità
  ginocchio_cm?: number | null
  polpaccio_cm?: number | null
  caviglia_cm?: number | null
  // Perimetri corretti
  braccio_corretto_cm?: number | null
  coscia_corretta_cm?: number | null
  gamba_corretta_cm?: number | null
  // Indici principali
  imc?: number | null
  indice_vita_fianchi?: number | null
  indice_adiposo_muscolare?: number | null
  indice_muscolo_osseo?: number | null
  indice_conicita?: number | null
  indice_manouvrier?: number | null
  indice_cormico?: number | null
  area_superficie_corporea_m2?: number | null
  // Metabolismo
  metabolismo_basale_kcal?: number | null
  dispendio_energetico_totale_kcal?: number | null
  livello_attivita?:
    | 'sedentario'
    | 'leggero'
    | 'moderato'
    | 'attivo'
    | 'molto_attivo'
    | 'estremamente_attivo'
    | null
  // Somatotipo (Heath-Carter)
  endomorfia?: number | null
  mesomorfia?: number | null
  ectomorfia?: number | null
  // Pliche cutanee (mm)
  plica_tricipite_mm?: number | null
  plica_sottoscapolare_mm?: number | null
  plica_bicipite_mm?: number | null
  plica_cresta_iliaca_mm?: number | null
  plica_sopraspinale_mm?: number | null
  plica_addominale_mm?: number | null
  plica_coscia_mm?: number | null
  plica_gamba_mm?: number | null
  // Diametri ossei (cm)
  diametro_omero_cm?: number | null
  diametro_bistiloideo_cm?: number | null
  diametro_femore_cm?: number | null
  // Osservazioni cliniche
  rischio_cardiometabolico?: 'basso' | 'medio' | 'alto' | 'molto_alto' | null
  adiposita_centrale?: 'normale' | 'moderata' | 'elevata' | null
  struttura_muscolo_scheletrica?: string | null
  capacita_dispersione_calore?: string | null
  // Altri campi
  max_bench_kg?: number | null
  max_squat_kg?: number | null
  max_deadlift_kg?: number | null
  note?: string | null
  mood_text?: string | null
  created_at: string
  updated_at?: string | null
}

export interface ProgressPhoto {
  id: string
  athlete_id: string
  date: string
  angle: 'fronte' | 'profilo' | 'retro'
  image_url: string
  note?: string | null
  created_at: string
  updated_at: string
}

export interface ProgressStats {
  total_logs?: number
  avg_weight?: number
  total_photos?: number
  weight_change_30d?: number
  latest_measurements?: {
    chest_cm?: number | null
    waist_cm?: number | null
    hips_cm?: number | null
    biceps_cm?: number | null
    thighs_cm?: number | null
  }
}
