'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { validateDate } from '@/lib/utils/validation'
import { notifyError } from '@/lib/notifications'

const logger = createLogger('app:home:progressi:nuovo:page')
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { PageHeaderFixed } from '@/components/layout'
import {
  Save,
  Scale,
  Ruler,
  Calculator,
  Activity,
  Dna,
  Layers,
  Target,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-white/20 transition-all duration-200'
const CARD_HEADER = 'relative z-10 pb-2.5 border-b border-white/10'
const CARD_TITLE_ROW = 'text-sm font-bold text-text-primary flex items-center gap-2'
const ICON_BOX = 'p-1.5 rounded-lg border border-white/10 bg-white/5'
const ICON_CYAN = 'h-3.5 w-3.5 text-cyan-400'

interface FormData {
  // Valori principali
  peso_kg: string
  massa_grassa_percentuale: string
  massa_grassa_kg: string
  massa_magra_kg: string
  massa_muscolare_kg: string
  massa_muscolare_scheletrica_kg: string

  // Misure antropometriche aggiuntive
  statura_allungata_cm: string
  statura_seduto_cm: string
  apertura_braccia_cm: string

  // Composizione corporea aggiuntiva
  massa_ossea_kg: string
  massa_residuale_kg: string

  // Circonferenze
  collo_cm: string
  spalle_cm: string
  torace_cm: string
  torace_inspirazione_cm: string
  braccio_rilassato_cm: string
  braccio_contratto_cm: string
  avambraccio_cm: string
  polso_cm: string
  vita_alta_cm: string
  vita_cm: string
  addome_basso_cm: string
  fianchi_cm: string
  glutei_cm: string
  coscia_alta_cm: string
  coscia_media_cm: string
  coscia_bassa_cm: string
  ginocchio_cm: string
  polpaccio_cm: string
  caviglia_cm: string

  // Perimetri corretti
  braccio_corretto_cm: string
  coscia_corretta_cm: string
  gamba_corretta_cm: string

  // Indici principali
  imc: string
  indice_vita_fianchi: string
  indice_adiposo_muscolare: string
  indice_muscolo_osseo: string
  indice_conicita: string
  indice_manouvrier: string
  indice_cormico: string
  area_superficie_corporea_m2: string

  // Metabolismo
  metabolismo_basale_kcal: string
  dispendio_energetico_totale_kcal: string
  livello_attivita: string

  // Somatotipo
  endomorfia: string
  mesomorfia: string
  ectomorfia: string

  // Pliche cutanee (mm)
  plica_tricipite_mm: string
  plica_sottoscapolare_mm: string
  plica_bicipite_mm: string
  plica_cresta_iliaca_mm: string
  plica_sopraspinale_mm: string
  plica_addominale_mm: string
  plica_coscia_mm: string
  plica_gamba_mm: string

  // Diametri ossei (cm)
  diametro_omero_cm: string
  diametro_bistiloideo_cm: string
  diametro_femore_cm: string

  // Osservazioni cliniche
  rischio_cardiometabolico: string
  adiposita_centrale: string
  struttura_muscolo_scheletrica: string
  capacita_dispersione_calore: string

  // Note
  note: string
  date: string
}

export default function NuovoProgressoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [loadingLastMeasurement, setLoadingLastMeasurement] = useState(true)

  // Inizializza formData con tutti i campi vuoti
  const [formData, setFormData] = useState<FormData>({
    // Valori principali
    peso_kg: '',
    massa_grassa_percentuale: '',
    massa_grassa_kg: '',
    massa_magra_kg: '',
    massa_muscolare_kg: '',
    massa_muscolare_scheletrica_kg: '',

    // Misure antropometriche aggiuntive
    statura_allungata_cm: '',
    statura_seduto_cm: '',
    apertura_braccia_cm: '',

    // Composizione corporea aggiuntiva
    massa_ossea_kg: '',
    massa_residuale_kg: '',

    // Circonferenze
    collo_cm: '',
    spalle_cm: '',
    torace_cm: '',
    torace_inspirazione_cm: '',
    braccio_rilassato_cm: '',
    braccio_contratto_cm: '',
    avambraccio_cm: '',
    polso_cm: '',
    vita_alta_cm: '',
    vita_cm: '',
    addome_basso_cm: '',
    fianchi_cm: '',
    glutei_cm: '',
    coscia_alta_cm: '',
    coscia_media_cm: '',
    coscia_bassa_cm: '',
    ginocchio_cm: '',
    polpaccio_cm: '',
    caviglia_cm: '',

    // Perimetri corretti
    braccio_corretto_cm: '',
    coscia_corretta_cm: '',
    gamba_corretta_cm: '',

    // Indici principali
    imc: '',
    indice_vita_fianchi: '',
    indice_adiposo_muscolare: '',
    indice_muscolo_osseo: '',
    indice_conicita: '',
    indice_manouvrier: '',
    indice_cormico: '',
    area_superficie_corporea_m2: '',

    // Metabolismo
    metabolismo_basale_kcal: '',
    dispendio_energetico_totale_kcal: '',
    livello_attivita: '',

    // Somatotipo
    endomorfia: '',
    mesomorfia: '',
    ectomorfia: '',

    // Pliche cutanee
    plica_tricipite_mm: '',
    plica_sottoscapolare_mm: '',
    plica_bicipite_mm: '',
    plica_cresta_iliaca_mm: '',
    plica_sopraspinale_mm: '',
    plica_addominale_mm: '',
    plica_coscia_mm: '',
    plica_gamba_mm: '',

    // Diametri ossei
    diametro_omero_cm: '',
    diametro_bistiloideo_cm: '',
    diametro_femore_cm: '',

    // Osservazioni cliniche
    rischio_cardiometabolico: '',
    adiposita_centrale: '',
    struttura_muscolo_scheletrica: '',
    capacita_dispersione_calore: '',

    // Note
    note: '',
    date: new Date().toISOString().split('T')[0],
  })

  // Funzione helper per convertire un valore numerico in stringa (per il form)
  const numberToString = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return ''
    return value.toString()
  }

  // Carica l'ultima misurazione salvata per precompilare il form
  useEffect(() => {
    const loadLastMeasurement = async () => {
      try {
        setLoadingLastMeasurement(true)

        // Ottieni auth.uid()
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          logger.debug('Utente non autenticato, form vuoto', authError)
          setLoadingLastMeasurement(false)
          return
        }

        // Stesso filtro RLS del client: se la policy SELECT usa profiles.id = athlete_id invece di athlete_id = auth.uid(), la lista è vuota finché non si applica la migrazione progress_logs SELECT.
        const res = await fetch('/api/athlete/progress-logs?limit=50', {
          credentials: 'same-origin',
        })
        if (!res.ok) {
          const errBody = (await res.json().catch(() => ({}))) as { error?: string; code?: string }
          logger.warn('Errore nel caricare ultima misurazione', errBody, {
            authUserId: authUser.id,
            status: res.status,
          })
          setLoadingLastMeasurement(false)
          return
        }

        const json = (await res.json()) as { data?: unknown[] }
        const measurementHistory = json.data

        if (!measurementHistory || measurementHistory.length === 0) {
          logger.debug('Nessuna misurazione precedente trovata, form vuoto')
          setLoadingLastMeasurement(false)
          return
        }

        const firstRow = measurementHistory[0] as Record<string, unknown>
        const mergedMeasurement = measurementHistory.reduce<Record<string, unknown>>(
          (acc, current) => {
            const result = { ...acc }
            for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
              if (
                (result[key] === null || result[key] === undefined) &&
                value !== null &&
                value !== undefined
              ) {
                result[key] = value
              }
            }
            return result
          },
          { ...firstRow },
        )

        logger.debug('Ultima misurazione caricata con successo', undefined, {
          measurementId: firstRow.id,
          date: firstRow.date,
          historyCount: measurementHistory.length,
          authUserId: authUser.id,
        })

        // Mappa i dati dal database al formato del form
        setFormData({
          // Valori principali
          peso_kg: numberToString(mergedMeasurement.weight_kg as number | null | undefined),
          massa_grassa_percentuale: numberToString(
            mergedMeasurement.massa_grassa_percentuale as number | null | undefined,
          ),
          massa_grassa_kg: numberToString(
            mergedMeasurement.massa_grassa_kg as number | null | undefined,
          ),
          massa_magra_kg: numberToString(
            mergedMeasurement.massa_magra_kg as number | null | undefined,
          ),
          massa_muscolare_kg: numberToString(
            mergedMeasurement.massa_muscolare_kg as number | null | undefined,
          ),
          massa_muscolare_scheletrica_kg: numberToString(
            mergedMeasurement.massa_muscolare_scheletrica_kg as number | null | undefined,
          ),

          // Misure antropometriche aggiuntive
          statura_allungata_cm: numberToString(
            mergedMeasurement.statura_allungata_cm as number | null | undefined,
          ),
          statura_seduto_cm: numberToString(
            mergedMeasurement.statura_seduto_cm as number | null | undefined,
          ),
          apertura_braccia_cm: numberToString(
            mergedMeasurement.apertura_braccia_cm as number | null | undefined,
          ),

          // Composizione corporea aggiuntiva
          massa_ossea_kg: numberToString(
            mergedMeasurement.massa_ossea_kg as number | null | undefined,
          ),
          massa_residuale_kg: numberToString(
            mergedMeasurement.massa_residuale_kg as number | null | undefined,
          ),

          // Circonferenze
          collo_cm: numberToString(mergedMeasurement.collo_cm as number | null | undefined),
          spalle_cm: numberToString(mergedMeasurement.spalle_cm as number | null | undefined),
          torace_cm: numberToString(mergedMeasurement.chest_cm as number | null | undefined),
          torace_inspirazione_cm: numberToString(
            mergedMeasurement.torace_inspirazione_cm as number | null | undefined,
          ),
          braccio_rilassato_cm: numberToString(
            mergedMeasurement.braccio_rilassato_cm as number | null | undefined,
          ),
          braccio_contratto_cm: numberToString(
            mergedMeasurement.braccio_contratto_cm as number | null | undefined,
          ),
          avambraccio_cm: numberToString(
            mergedMeasurement.avambraccio_cm as number | null | undefined,
          ),
          polso_cm: numberToString(mergedMeasurement.polso_cm as number | null | undefined),
          vita_alta_cm: numberToString(mergedMeasurement.vita_alta_cm as number | null | undefined),
          vita_cm: numberToString(mergedMeasurement.waist_cm as number | null | undefined),
          addome_basso_cm: numberToString(
            mergedMeasurement.addome_basso_cm as number | null | undefined,
          ),
          fianchi_cm: numberToString(mergedMeasurement.hips_cm as number | null | undefined),
          glutei_cm: numberToString(mergedMeasurement.glutei_cm as number | null | undefined),
          coscia_alta_cm: numberToString(
            mergedMeasurement.coscia_alta_cm as number | null | undefined,
          ),
          coscia_media_cm: numberToString(
            (mergedMeasurement.coscia_media_cm as number | null | undefined) ||
              (mergedMeasurement.thighs_cm as number | null | undefined),
          ),
          coscia_bassa_cm: numberToString(
            mergedMeasurement.coscia_bassa_cm as number | null | undefined,
          ),
          ginocchio_cm: numberToString(mergedMeasurement.ginocchio_cm as number | null | undefined),
          polpaccio_cm: numberToString(mergedMeasurement.polpaccio_cm as number | null | undefined),
          caviglia_cm: numberToString(mergedMeasurement.caviglia_cm as number | null | undefined),

          // Perimetri corretti
          braccio_corretto_cm: numberToString(
            mergedMeasurement.braccio_corretto_cm as number | null | undefined,
          ),
          coscia_corretta_cm: numberToString(
            mergedMeasurement.coscia_corretta_cm as number | null | undefined,
          ),
          gamba_corretta_cm: numberToString(
            mergedMeasurement.gamba_corretta_cm as number | null | undefined,
          ),

          // Indici principali
          imc: numberToString(mergedMeasurement.imc as number | null | undefined),
          indice_vita_fianchi: numberToString(
            mergedMeasurement.indice_vita_fianchi as number | null | undefined,
          ),
          indice_adiposo_muscolare: numberToString(
            mergedMeasurement.indice_adiposo_muscolare as number | null | undefined,
          ),
          indice_muscolo_osseo: numberToString(
            mergedMeasurement.indice_muscolo_osseo as number | null | undefined,
          ),
          indice_conicita: numberToString(
            mergedMeasurement.indice_conicita as number | null | undefined,
          ),
          indice_manouvrier: numberToString(
            mergedMeasurement.indice_manouvrier as number | null | undefined,
          ),
          indice_cormico: numberToString(
            mergedMeasurement.indice_cormico as number | null | undefined,
          ),
          area_superficie_corporea_m2: numberToString(
            mergedMeasurement.area_superficie_corporea_m2 as number | null | undefined,
          ),

          // Metabolismo
          metabolismo_basale_kcal: numberToString(
            mergedMeasurement.metabolismo_basale_kcal as number | null | undefined,
          ),
          dispendio_energetico_totale_kcal: numberToString(
            mergedMeasurement.dispendio_energetico_totale_kcal as number | null | undefined,
          ),
          livello_attivita: (mergedMeasurement.livello_attivita as string | null | undefined) || '',

          // Somatotipo
          endomorfia: numberToString(mergedMeasurement.endomorfia as number | null | undefined),
          mesomorfia: numberToString(mergedMeasurement.mesomorfia as number | null | undefined),
          ectomorfia: numberToString(mergedMeasurement.ectomorfia as number | null | undefined),

          // Pliche cutanee
          plica_tricipite_mm: numberToString(
            mergedMeasurement.plica_tricipite_mm as number | null | undefined,
          ),
          plica_sottoscapolare_mm: numberToString(
            mergedMeasurement.plica_sottoscapolare_mm as number | null | undefined,
          ),
          plica_bicipite_mm: numberToString(
            mergedMeasurement.plica_bicipite_mm as number | null | undefined,
          ),
          plica_cresta_iliaca_mm: numberToString(
            mergedMeasurement.plica_cresta_iliaca_mm as number | null | undefined,
          ),
          plica_sopraspinale_mm: numberToString(
            mergedMeasurement.plica_sopraspinale_mm as number | null | undefined,
          ),
          plica_addominale_mm: numberToString(
            mergedMeasurement.plica_addominale_mm as number | null | undefined,
          ),
          plica_coscia_mm: numberToString(
            mergedMeasurement.plica_coscia_mm as number | null | undefined,
          ),
          plica_gamba_mm: numberToString(
            mergedMeasurement.plica_gamba_mm as number | null | undefined,
          ),

          // Diametri ossei
          diametro_omero_cm: numberToString(
            mergedMeasurement.diametro_omero_cm as number | null | undefined,
          ),
          diametro_bistiloideo_cm: numberToString(
            mergedMeasurement.diametro_bistiloideo_cm as number | null | undefined,
          ),
          diametro_femore_cm: numberToString(
            mergedMeasurement.diametro_femore_cm as number | null | undefined,
          ),

          // Osservazioni cliniche
          rischio_cardiometabolico:
            (mergedMeasurement.rischio_cardiometabolico as string | null | undefined) || '',
          adiposita_centrale:
            (mergedMeasurement.adiposita_centrale as string | null | undefined) || '',
          struttura_muscolo_scheletrica:
            (mergedMeasurement.struttura_muscolo_scheletrica as string | null | undefined) || '',
          capacita_dispersione_calore:
            (mergedMeasurement.capacita_dispersione_calore as string | null | undefined) || '',

          // Note
          note: (mergedMeasurement.note as string | null | undefined) || '',

          // Data: mantieni la data odierna (non quella della misurazione precedente)
          date: new Date().toISOString().split('T')[0],
        })

        setLoadingLastMeasurement(false)
      } catch (error) {
        logger.error('Errore nel caricare ultima misurazione', error)
        setLoadingLastMeasurement(false)
      }
    }

    loadLastMeasurement()
  }, [supabase])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const parseNumber = (value: string): number | null => {
    if (!value || value.trim() === '') return null
    const parsed = parseFloat(value)
    return isNaN(parsed) ? null : parsed
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // progress_logs.athlete_id è FK a profiles.user_id; serve auth.uid() per query e insert
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      logger.error('Errore autenticazione', authError, { hasUser: !!authUser })
      notifyError('Errore', 'Utente non autenticato')
      return
    }

    logger.debug('Auth user ottenuto', {
      userId: authUser.id,
      email: authUser.email,
    })

    // Verifica che esista un profilo con user_id = auth.uid()
    // Usa .single() invece di .maybeSingle() per avere un errore piÃ¹ chiaro
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, email, nome, cognome, role')
      .eq('user_id', authUser.id)
      .single()

    if (profileError) {
      logger.error('Errore verifica profilo', profileError, {
        userId: authUser.id,
        errorCode: profileError.code,
        errorMessage: profileError.message,
        errorDetails: profileError.details,
        errorHint: profileError.hint,
      })

      // Se il profilo non esiste (PGRST116), mostra un messaggio piÃ¹ chiaro
      if (profileError.code === 'PGRST116') {
        notifyError(
          'Errore',
          "Il tuo profilo non Ã¨ stato trovato nel sistema. Contatta l'amministratore.",
        )
      } else {
        notifyError('Errore', `Errore nel verificare il profilo: ${profileError.message}`)
      }
      return
    }

    if (!profile) {
      logger.error('Profilo null dopo query', undefined, { userId: authUser.id })
      notifyError('Errore', 'Profilo utente non trovato nel sistema')
      return
    }

    logger.debug('Profilo verificato con successo', {
      profileId: profile.id,
      userId: profile.user_id,
      email: profile.email,
      nome: profile.nome,
      cognome: profile.cognome,
      role: profile.role,
    })

    // Validazione dati obbligatori
    const validationErrors: string[] = []

    // Validazione data
    const dateValidation = validateDate(formData.date)
    if (!dateValidation.valid) {
      validationErrors.push(dateValidation.error || 'Data non valida')
    }

    if (validationErrors.length > 0) {
      notifyError('Errore validazione', validationErrors.join(', '))
      return
    }

    setLoading(true)
    try {
      // Prepara i dati per l'inserimento
      // progress_logs.athlete_id → profiles.user_id (auth uid). created_by_profile_id richiesto da molte policy RLS.
      const insertData: Record<string, unknown> = {
        athlete_id: profile.user_id ?? authUser.id,
        created_by_profile_id: profile.id,
        date: formData.date,
        // Valori principali - mappa peso_kg a weight_kg per compatibilitÃ
        weight_kg: parseNumber(formData.peso_kg),
        massa_grassa_percentuale: parseNumber(formData.massa_grassa_percentuale),
        massa_grassa_kg: parseNumber(formData.massa_grassa_kg),
        massa_magra_kg: parseNumber(formData.massa_magra_kg),
        massa_muscolare_kg: parseNumber(formData.massa_muscolare_kg),
        massa_muscolare_scheletrica_kg: parseNumber(formData.massa_muscolare_scheletrica_kg),

        // Misure antropometriche aggiuntive
        statura_allungata_cm: parseNumber(formData.statura_allungata_cm),
        statura_seduto_cm: parseNumber(formData.statura_seduto_cm),
        apertura_braccia_cm: parseNumber(formData.apertura_braccia_cm),

        // Composizione corporea aggiuntiva
        massa_ossea_kg: parseNumber(formData.massa_ossea_kg),
        massa_residuale_kg: parseNumber(formData.massa_residuale_kg),

        // Circonferenze - mappa torace_cm a chest_cm, vita_cm a waist_cm, fianchi_cm a hips_cm per compatibilitÃ
        collo_cm: parseNumber(formData.collo_cm),
        spalle_cm: parseNumber(formData.spalle_cm),
        chest_cm: parseNumber(formData.torace_cm), // Mappa a chest_cm esistente
        torace_inspirazione_cm: parseNumber(formData.torace_inspirazione_cm),
        braccio_rilassato_cm: parseNumber(formData.braccio_rilassato_cm),
        braccio_contratto_cm: parseNumber(formData.braccio_contratto_cm),
        biceps_cm: parseNumber(formData.braccio_contratto_cm), // Mappa anche a biceps_cm per compatibilitÃ
        avambraccio_cm: parseNumber(formData.avambraccio_cm),
        polso_cm: parseNumber(formData.polso_cm),
        vita_alta_cm: parseNumber(formData.vita_alta_cm),
        waist_cm: parseNumber(formData.vita_cm), // Mappa a waist_cm esistente
        addome_basso_cm: parseNumber(formData.addome_basso_cm),
        hips_cm: parseNumber(formData.fianchi_cm), // Mappa a hips_cm esistente
        glutei_cm: parseNumber(formData.glutei_cm),
        coscia_alta_cm: parseNumber(formData.coscia_alta_cm),
        coscia_media_cm: parseNumber(formData.coscia_media_cm),
        thighs_cm: parseNumber(formData.coscia_media_cm), // Mappa anche a thighs_cm per compatibilitÃ
        coscia_bassa_cm: parseNumber(formData.coscia_bassa_cm),
        ginocchio_cm: parseNumber(formData.ginocchio_cm),
        polpaccio_cm: parseNumber(formData.polpaccio_cm),
        caviglia_cm: parseNumber(formData.caviglia_cm),

        // Perimetri corretti
        braccio_corretto_cm: parseNumber(formData.braccio_corretto_cm),
        coscia_corretta_cm: parseNumber(formData.coscia_corretta_cm),
        gamba_corretta_cm: parseNumber(formData.gamba_corretta_cm),

        // Indici principali
        imc: parseNumber(formData.imc),
        indice_vita_fianchi: parseNumber(formData.indice_vita_fianchi),
        indice_adiposo_muscolare: parseNumber(formData.indice_adiposo_muscolare),
        indice_muscolo_osseo: parseNumber(formData.indice_muscolo_osseo),
        indice_conicita: parseNumber(formData.indice_conicita),
        indice_manouvrier: parseNumber(formData.indice_manouvrier),
        indice_cormico: parseNumber(formData.indice_cormico),
        area_superficie_corporea_m2: parseNumber(formData.area_superficie_corporea_m2),

        // Metabolismo
        metabolismo_basale_kcal: parseNumber(formData.metabolismo_basale_kcal)
          ? parseInt(formData.metabolismo_basale_kcal)
          : null,
        dispendio_energetico_totale_kcal: parseNumber(formData.dispendio_energetico_totale_kcal)
          ? parseInt(formData.dispendio_energetico_totale_kcal)
          : null,
        livello_attivita: formData.livello_attivita || null,

        // Somatotipo
        endomorfia: parseNumber(formData.endomorfia),
        mesomorfia: parseNumber(formData.mesomorfia),
        ectomorfia: parseNumber(formData.ectomorfia),

        // Pliche cutanee
        plica_tricipite_mm: parseNumber(formData.plica_tricipite_mm),
        plica_sottoscapolare_mm: parseNumber(formData.plica_sottoscapolare_mm),
        plica_bicipite_mm: parseNumber(formData.plica_bicipite_mm),
        plica_cresta_iliaca_mm: parseNumber(formData.plica_cresta_iliaca_mm),
        plica_sopraspinale_mm: parseNumber(formData.plica_sopraspinale_mm),
        plica_addominale_mm: parseNumber(formData.plica_addominale_mm),
        plica_coscia_mm: parseNumber(formData.plica_coscia_mm),
        plica_gamba_mm: parseNumber(formData.plica_gamba_mm),

        // Diametri ossei
        diametro_omero_cm: parseNumber(formData.diametro_omero_cm),
        diametro_bistiloideo_cm: parseNumber(formData.diametro_bistiloideo_cm),
        diametro_femore_cm: parseNumber(formData.diametro_femore_cm),

        // Osservazioni cliniche
        rischio_cardiometabolico: formData.rischio_cardiometabolico || null,
        adiposita_centrale: formData.adiposita_centrale || null,
        struttura_muscolo_scheletrica: formData.struttura_muscolo_scheletrica || null,
        capacita_dispersione_calore: formData.capacita_dispersione_calore || null,

        // Note
        note: formData.note || null,
      }

      // Filtra i campi null/undefined per evitare errori di inserimento
      const filteredInsertData = Object.fromEntries(
        Object.entries(insertData).filter(([, value]) => value !== null && value !== undefined),
      )

      logger.debug('Inserting progress log (API)', {
        athleteId: authUser.id,
        profileId: profile.id,
        date: formData.date,
        fieldsCount: Object.keys(filteredInsertData).length,
      })

      const apiRes = await fetch('/api/athlete/progress-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ payload: filteredInsertData }),
      })

      const apiJson = (await apiRes.json().catch(() => ({}))) as {
        error?: string
        code?: string
        details?: string | null
        hint?: string
      }

      if (!apiRes.ok) {
        const errCode = apiJson.code
        const errMsg = apiJson.error || 'Errore nel salvataggio'
        logger.error('Error saving progress (API)', new Error(errMsg), {
          athleteId: authUser.id,
          status: apiRes.status,
          errorCode: errCode,
          apiJson,
        })

        let errorMessage = errMsg
        if (apiJson.hint) {
          errorMessage = `${errMsg}\n${apiJson.hint}`
        } else if (
          errCode === '42501' ||
          errMsg.includes('permission') ||
          errMsg.includes('row-level security')
        ) {
          errorMessage =
            'Non hai i permessi per salvare i progressi. Verifica le policy RLS in Supabase.'
        } else if (errCode === '23503' || errMsg.includes('foreign key')) {
          errorMessage = "Errore di riferimento: verifica che l'atleta esista nel sistema."
        } else if (errCode === '23505' || errMsg.includes('unique')) {
          errorMessage = 'Esiste già un progresso per questa data.'
        } else if (errCode === '23502' || errMsg.includes('not null')) {
          errorMessage = 'Alcuni campi obbligatori sono mancanti.'
        } else if (apiJson.details) {
          errorMessage = `${errMsg}. Dettagli: ${apiJson.details}`
        }

        notifyError('Errore nel salvare i progressi', errorMessage)
        return
      }

      logger.debug('Progress saved successfully', undefined, { athleteId: authUser.id })
      router.push('/home/progressi')
    } catch (error) {
      logger.error('Error saving progress', error, { athleteId: authUser?.id })
      notifyError(
        'Errore nel salvare i progressi',
        error instanceof Error ? error.message : 'Errore sconosciuto',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleBack = useCallback(() => router.push('/home/progressi'), [router])

  if (loadingLastMeasurement) {
    return (
      <div className="min-h-0 flex-1 flex flex-col bg-background overflow-auto">
        <div className="space-y-4 px-3 pb-24 py-4 sm:px-4 min-[834px]:px-6">
          <PageHeaderFixed
            variant="chat"
            title="Nuova Misurazione"
            subtitle="Caricamento ultima misurazione..."
            onBack={handleBack}
          />
          <Card className={`relative overflow-hidden ${CARD_DS}`}>
            <CardContent className="p-12 text-center relative z-10">
              <div className="mb-3 text-4xl opacity-50">ðŸ“Š</div>
              <p className="text-text-secondary text-sm font-medium">Caricamento dati...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-0 flex-1 flex flex-col bg-background overflow-auto">
      <div className="space-y-4 px-3 pb-24 py-4 sm:px-4 min-[834px]:px-6">
        <PageHeaderFixed
          variant="chat"
          title="Nuova Misurazione"
          subtitle={
            formData.peso_kg
              ? 'Registra i tuoi progressi completi (precompilato)'
              : 'Registra i tuoi progressi completi'
          }
          onBack={handleBack}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className={CARD_TITLE_ROW}>
                <div className={ICON_BOX}>
                  <Ruler className={ICON_CYAN} />
                </div>
                <span className="truncate">Data Misurazione</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <Input
                label="Data"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </CardContent>
          </Card>

          {/* Valori Principali */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className={CARD_TITLE_ROW}>
                <div className={ICON_BOX}>
                  <Scale className={ICON_CYAN} />
                </div>
                <span className="truncate">Valori Principali</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 pt-2.5">
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Peso (kg)"
                  type="number"
                  step="0.1"
                  value={formData.peso_kg}
                  onChange={(e) => handleInputChange('peso_kg', e.target.value)}
                  placeholder="es. 75.5"
                />

                <Input
                  label="Massa Grassa (%)"
                  type="number"
                  step="0.1"
                  value={formData.massa_grassa_percentuale}
                  onChange={(e) => handleInputChange('massa_grassa_percentuale', e.target.value)}
                  placeholder="es. 15.5"
                />

                <Input
                  label="Massa Grassa (kg)"
                  type="number"
                  step="0.1"
                  value={formData.massa_grassa_kg}
                  onChange={(e) => handleInputChange('massa_grassa_kg', e.target.value)}
                  placeholder="es. 11.6"
                />

                <Input
                  label="Massa Magra (kg)"
                  type="number"
                  step="0.1"
                  value={formData.massa_magra_kg}
                  onChange={(e) => handleInputChange('massa_magra_kg', e.target.value)}
                  placeholder="es. 63.9"
                />

                <Input
                  label="Massa Muscolare (kg)"
                  type="number"
                  step="0.1"
                  value={formData.massa_muscolare_kg}
                  onChange={(e) => handleInputChange('massa_muscolare_kg', e.target.value)}
                  placeholder="es. 58.5"
                />

                <Input
                  label="Massa Muscolare Scheletrica (kg)"
                  type="number"
                  step="0.1"
                  value={formData.massa_muscolare_scheletrica_kg}
                  onChange={(e) =>
                    handleInputChange('massa_muscolare_scheletrica_kg', e.target.value)
                  }
                  placeholder="es. 30.2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Circonferenze */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className={CARD_TITLE_ROW}>
                <div className={ICON_BOX}>
                  <Ruler className={ICON_CYAN} />
                </div>
                <span className="truncate">Circonferenze (cm)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 pt-2.5">
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Collo"
                  type="number"
                  step="0.1"
                  value={formData.collo_cm}
                  onChange={(e) => handleInputChange('collo_cm', e.target.value)}
                  placeholder="es. 38.5"
                />

                <Input
                  label="Spalle"
                  type="number"
                  step="0.1"
                  value={formData.spalle_cm}
                  onChange={(e) => handleInputChange('spalle_cm', e.target.value)}
                  placeholder="es. 110.0"
                />

                <Input
                  label="Torace"
                  type="number"
                  step="0.1"
                  value={formData.torace_cm}
                  onChange={(e) => handleInputChange('torace_cm', e.target.value)}
                  placeholder="es. 100.0"
                />

                <Input
                  label="Torace in Inspirazione"
                  type="number"
                  step="0.1"
                  value={formData.torace_inspirazione_cm}
                  onChange={(e) => handleInputChange('torace_inspirazione_cm', e.target.value)}
                  placeholder="es. 105.0"
                />

                <Input
                  label="Braccio Rilassato"
                  type="number"
                  step="0.1"
                  value={formData.braccio_rilassato_cm}
                  onChange={(e) => handleInputChange('braccio_rilassato_cm', e.target.value)}
                  placeholder="es. 32.0"
                />

                <Input
                  label="Braccio Contratto"
                  type="number"
                  step="0.1"
                  value={formData.braccio_contratto_cm}
                  onChange={(e) => handleInputChange('braccio_contratto_cm', e.target.value)}
                  placeholder="es. 36.5"
                />

                <Input
                  label="Avambraccio"
                  type="number"
                  step="0.1"
                  value={formData.avambraccio_cm}
                  onChange={(e) => handleInputChange('avambraccio_cm', e.target.value)}
                  placeholder="es. 28.0"
                />

                <Input
                  label="Polso"
                  type="number"
                  step="0.1"
                  value={formData.polso_cm}
                  onChange={(e) => handleInputChange('polso_cm', e.target.value)}
                  placeholder="es. 17.0"
                />

                <Input
                  label="Vita Alta"
                  type="number"
                  step="0.1"
                  value={formData.vita_alta_cm}
                  onChange={(e) => handleInputChange('vita_alta_cm', e.target.value)}
                  placeholder="es. 80.0"
                />

                <Input
                  label="Vita"
                  type="number"
                  step="0.1"
                  value={formData.vita_cm}
                  onChange={(e) => handleInputChange('vita_cm', e.target.value)}
                  placeholder="es. 82.0"
                />

                <Input
                  label="Addome Basso"
                  type="number"
                  step="0.1"
                  value={formData.addome_basso_cm}
                  onChange={(e) => handleInputChange('addome_basso_cm', e.target.value)}
                  placeholder="es. 85.0"
                />

                <Input
                  label="Fianchi"
                  type="number"
                  step="0.1"
                  value={formData.fianchi_cm}
                  onChange={(e) => handleInputChange('fianchi_cm', e.target.value)}
                  placeholder="es. 95.0"
                />

                <Input
                  label="Glutei"
                  type="number"
                  step="0.1"
                  value={formData.glutei_cm}
                  onChange={(e) => handleInputChange('glutei_cm', e.target.value)}
                  placeholder="es. 98.0"
                />

                <Input
                  label="Coscia Alta"
                  type="number"
                  step="0.1"
                  value={formData.coscia_alta_cm}
                  onChange={(e) => handleInputChange('coscia_alta_cm', e.target.value)}
                  placeholder="es. 58.0"
                />

                <Input
                  label="Coscia Media"
                  type="number"
                  step="0.1"
                  value={formData.coscia_media_cm}
                  onChange={(e) => handleInputChange('coscia_media_cm', e.target.value)}
                  placeholder="es. 56.0"
                />

                <Input
                  label="Coscia Bassa"
                  type="number"
                  step="0.1"
                  value={formData.coscia_bassa_cm}
                  onChange={(e) => handleInputChange('coscia_bassa_cm', e.target.value)}
                  placeholder="es. 54.0"
                />

                <Input
                  label="Ginocchio"
                  type="number"
                  step="0.1"
                  value={formData.ginocchio_cm}
                  onChange={(e) => handleInputChange('ginocchio_cm', e.target.value)}
                  placeholder="es. 38.0"
                />

                <Input
                  label="Polpaccio"
                  type="number"
                  step="0.1"
                  value={formData.polpaccio_cm}
                  onChange={(e) => handleInputChange('polpaccio_cm', e.target.value)}
                  placeholder="es. 38.5"
                />

                <Input
                  label="Caviglia"
                  type="number"
                  step="0.1"
                  value={formData.caviglia_cm}
                  onChange={(e) => handleInputChange('caviglia_cm', e.target.value)}
                  placeholder="es. 22.0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Misure Antropometriche Aggiuntive */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className={CARD_TITLE_ROW}>
                <div className={ICON_BOX}>
                  <Ruler className={ICON_CYAN} />
                </div>
                <span className="truncate">Misure Antropometriche Aggiuntive</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 pt-2.5">
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Statura Allungata (cm)"
                  type="number"
                  step="0.1"
                  value={formData.statura_allungata_cm}
                  onChange={(e) => handleInputChange('statura_allungata_cm', e.target.value)}
                  placeholder="es. 182.2"
                />
                <Input
                  label="Statura da Seduto (cm)"
                  type="number"
                  step="0.1"
                  value={formData.statura_seduto_cm}
                  onChange={(e) => handleInputChange('statura_seduto_cm', e.target.value)}
                  placeholder="es. 95.0"
                />
                <Input
                  label="Apertura Braccia (cm)"
                  type="number"
                  step="0.1"
                  value={formData.apertura_braccia_cm}
                  onChange={(e) => handleInputChange('apertura_braccia_cm', e.target.value)}
                  placeholder="es. 180.0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Composizione Corporea Aggiuntiva */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className={CARD_TITLE_ROW}>
                <div className={ICON_BOX}>
                  <Layers className={ICON_CYAN} />
                </div>
                <span className="truncate">Composizione Corporea (4 Componenti)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 pt-2.5">
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Massa Ossea (kg)"
                  type="number"
                  step="0.1"
                  value={formData.massa_ossea_kg}
                  onChange={(e) => handleInputChange('massa_ossea_kg', e.target.value)}
                  placeholder="es. 14.22"
                />
                <Input
                  label="Massa Residuale (kg)"
                  type="number"
                  step="0.1"
                  value={formData.massa_residuale_kg}
                  onChange={(e) => handleInputChange('massa_residuale_kg', e.target.value)}
                  placeholder="es. 15.89"
                />
              </div>
            </CardContent>
          </Card>

          {/* Perimetri Corretti */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className={CARD_TITLE_ROW}>
                <div className={ICON_BOX}>
                  <Ruler className={ICON_CYAN} />
                </div>
                <span className="truncate">Perimetri Corretti (cm)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 pt-2.5">
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Braccio Corretto"
                  type="number"
                  step="0.1"
                  value={formData.braccio_corretto_cm}
                  onChange={(e) => handleInputChange('braccio_corretto_cm', e.target.value)}
                  placeholder="es. 29.7"
                />
                <Input
                  label="Coscia Corretta"
                  type="number"
                  step="0.1"
                  value={formData.coscia_corretta_cm}
                  onChange={(e) => handleInputChange('coscia_corretta_cm', e.target.value)}
                  placeholder="es. 48.63"
                />
                <Input
                  label="Gamba Corretta"
                  type="number"
                  step="0.1"
                  value={formData.gamba_corretta_cm}
                  onChange={(e) => handleInputChange('gamba_corretta_cm', e.target.value)}
                  placeholder="es. 36.59"
                />
              </div>
            </CardContent>
          </Card>

          {/* Indici Principali */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className={CARD_TITLE_ROW}>
                <div className={ICON_BOX}>
                  <Calculator className={ICON_CYAN} />
                </div>
                <span className="truncate">Indici Principali</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 pt-2.5">
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="IMC (kg/mÂ²)"
                  type="number"
                  step="0.1"
                  value={formData.imc}
                  onChange={(e) => handleInputChange('imc', e.target.value)}
                  placeholder="es. 32.1"
                />
                <Input
                  label="Indice Vita/Fianchi"
                  type="number"
                  step="0.01"
                  value={formData.indice_vita_fianchi}
                  onChange={(e) => handleInputChange('indice_vita_fianchi', e.target.value)}
                  placeholder="es. 0.84"
                />
                <Input
                  label="Indice Adiposo-Muscolare"
                  type="number"
                  step="0.01"
                  value={formData.indice_adiposo_muscolare}
                  onChange={(e) => handleInputChange('indice_adiposo_muscolare', e.target.value)}
                  placeholder="es. 1.17"
                />
                <Input
                  label="Indice Muscolo/Osseo"
                  type="number"
                  step="0.01"
                  value={formData.indice_muscolo_osseo}
                  onChange={(e) => handleInputChange('indice_muscolo_osseo', e.target.value)}
                  placeholder="es. 2.48"
                />
                <Input
                  label="Indice di ConicitÃ "
                  type="number"
                  step="0.01"
                  value={formData.indice_conicita}
                  onChange={(e) => handleInputChange('indice_conicita', e.target.value)}
                  placeholder="es. 1.16"
                />
                <Input
                  label="Indice Manouvrier"
                  type="number"
                  step="0.01"
                  value={formData.indice_manouvrier}
                  onChange={(e) => handleInputChange('indice_manouvrier', e.target.value)}
                  placeholder="es. -2.0"
                />
                <Input
                  label="Indice Cormico"
                  type="number"
                  step="0.01"
                  value={formData.indice_cormico}
                  onChange={(e) => handleInputChange('indice_cormico', e.target.value)}
                  placeholder="es. 52.0"
                />
                <Input
                  label="Area Superficie Corporea (mÂ²)"
                  type="number"
                  step="0.01"
                  value={formData.area_superficie_corporea_m2}
                  onChange={(e) => handleInputChange('area_superficie_corporea_m2', e.target.value)}
                  placeholder="es. 2.28"
                />
              </div>
            </CardContent>
          </Card>

          {/* Metabolismo */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className={CARD_TITLE_ROW}>
                <div className={ICON_BOX}>
                  <Activity className={ICON_CYAN} />
                </div>
                <span className="truncate">Metabolismo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 pt-2.5">
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Metabolismo Basale (kcal)"
                  type="number"
                  step="1"
                  value={formData.metabolismo_basale_kcal}
                  onChange={(e) => handleInputChange('metabolismo_basale_kcal', e.target.value)}
                  placeholder="es. 2235"
                />
                <Input
                  label="Dispendio Energetico Totale (kcal)"
                  type="number"
                  step="1"
                  value={formData.dispendio_energetico_totale_kcal}
                  onChange={(e) =>
                    handleInputChange('dispendio_energetico_totale_kcal', e.target.value)
                  }
                  placeholder="es. 3352"
                />
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Livello AttivitÃ 
                  </label>
                  <select
                    className="flex w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    value={formData.livello_attivita}
                    onChange={(e) => handleInputChange('livello_attivita', e.target.value)}
                  >
                    <option value="">Seleziona...</option>
                    <option value="sedentario">Sedentario</option>
                    <option value="leggero">Leggero</option>
                    <option value="moderato">Moderato</option>
                    <option value="attivo">Attivo</option>
                    <option value="molto_attivo">Molto Attivo</option>
                    <option value="estremamente_attivo">Estremamente Attivo</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Somatotipo (Heath-Carter) */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className={CARD_TITLE_ROW}>
                <div className={ICON_BOX}>
                  <Dna className={ICON_CYAN} />
                </div>
                <span className="truncate">Somatotipo (Heath-Carter)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 pt-2.5">
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Endomorfia"
                  type="number"
                  step="0.01"
                  value={formData.endomorfia}
                  onChange={(e) => handleInputChange('endomorfia', e.target.value)}
                  placeholder="es. 7.10"
                />
                <Input
                  label="Mesomorfia"
                  type="number"
                  step="0.01"
                  value={formData.mesomorfia}
                  onChange={(e) => handleInputChange('mesomorfia', e.target.value)}
                  placeholder="es. 7.25"
                />
                <Input
                  label="Ectomorfia"
                  type="number"
                  step="0.01"
                  value={formData.ectomorfia}
                  onChange={(e) => handleInputChange('ectomorfia', e.target.value)}
                  placeholder="es. 0.16"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pliche Cutanee */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className={CARD_TITLE_ROW}>
                <div className={ICON_BOX}>
                  <Target className={ICON_CYAN} />
                </div>
                <span className="truncate">Pliche Cutanee (mm)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 pt-2.5">
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Tricipite"
                  type="number"
                  step="0.1"
                  value={formData.plica_tricipite_mm}
                  onChange={(e) => handleInputChange('plica_tricipite_mm', e.target.value)}
                  placeholder="es. 28"
                />
                <Input
                  label="Sottoscapolare"
                  type="number"
                  step="0.1"
                  value={formData.plica_sottoscapolare_mm}
                  onChange={(e) => handleInputChange('plica_sottoscapolare_mm', e.target.value)}
                  placeholder="es. 25"
                />
                <Input
                  label="Bicipite"
                  type="number"
                  step="0.1"
                  value={formData.plica_bicipite_mm}
                  onChange={(e) => handleInputChange('plica_bicipite_mm', e.target.value)}
                  placeholder="es. 14"
                />
                <Input
                  label="Cresta Iliaca"
                  type="number"
                  step="0.1"
                  value={formData.plica_cresta_iliaca_mm}
                  onChange={(e) => handleInputChange('plica_cresta_iliaca_mm', e.target.value)}
                  placeholder="es. 39"
                />
                <Input
                  label="Sopraspinale"
                  type="number"
                  step="0.1"
                  value={formData.plica_sopraspinale_mm}
                  onChange={(e) => handleInputChange('plica_sopraspinale_mm', e.target.value)}
                  placeholder="es. 30"
                />
                <Input
                  label="Addominale"
                  type="number"
                  step="0.1"
                  value={formData.plica_addominale_mm}
                  onChange={(e) => handleInputChange('plica_addominale_mm', e.target.value)}
                  placeholder="es. 38"
                />
                <Input
                  label="Coscia"
                  type="number"
                  step="0.1"
                  value={formData.plica_coscia_mm}
                  onChange={(e) => handleInputChange('plica_coscia_mm', e.target.value)}
                  placeholder="es. 33"
                />
                <Input
                  label="Gamba"
                  type="number"
                  step="0.1"
                  value={formData.plica_gamba_mm}
                  onChange={(e) => handleInputChange('plica_gamba_mm', e.target.value)}
                  placeholder="es. 22"
                />
              </div>
            </CardContent>
          </Card>

          {/* Diametri Ossei */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className={CARD_TITLE_ROW}>
                <div className={ICON_BOX}>
                  <Ruler className={ICON_CYAN} />
                </div>
                <span className="truncate">Diametri Ossei (cm)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 pt-2.5">
              <div className="grid grid-cols-1 gap-3">
                <Input
                  label="Omero"
                  type="number"
                  step="0.1"
                  value={formData.diametro_omero_cm}
                  onChange={(e) => handleInputChange('diametro_omero_cm', e.target.value)}
                  placeholder="es. 7.8"
                />
                <Input
                  label="Bistiloideo"
                  type="number"
                  step="0.1"
                  value={formData.diametro_bistiloideo_cm}
                  onChange={(e) => handleInputChange('diametro_bistiloideo_cm', e.target.value)}
                  placeholder="es. 6.2"
                />
                <Input
                  label="Femore"
                  type="number"
                  step="0.1"
                  value={formData.diametro_femore_cm}
                  onChange={(e) => handleInputChange('diametro_femore_cm', e.target.value)}
                  placeholder="es. 10.7"
                />
              </div>
            </CardContent>
          </Card>

          {/* Osservazioni Cliniche */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className={CARD_TITLE_ROW}>
                <div className={ICON_BOX}>
                  <AlertTriangle className={ICON_CYAN} />
                </div>
                <span className="truncate">Osservazioni Cliniche</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3 pt-2.5">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Rischio Cardiometabolico
                  </label>
                  <select
                    className="flex w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    value={formData.rischio_cardiometabolico}
                    onChange={(e) => handleInputChange('rischio_cardiometabolico', e.target.value)}
                  >
                    <option value="">Seleziona...</option>
                    <option value="basso">Basso</option>
                    <option value="medio">Medio</option>
                    <option value="alto">Alto</option>
                    <option value="molto_alto">Molto Alto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    AdipositÃ  Centrale
                  </label>
                  <select
                    className="flex w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    value={formData.adiposita_centrale}
                    onChange={(e) => handleInputChange('adiposita_centrale', e.target.value)}
                  >
                    <option value="">Seleziona...</option>
                    <option value="normale">Normale</option>
                    <option value="moderata">Moderata</option>
                    <option value="elevata">Elevata</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Struttura Muscolo-Scheletrica
                  </label>
                  <textarea
                    className="bg-white/[0.04] text-text-primary placeholder:text-text-tertiary w-full rounded-lg border border-white/10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-200"
                    rows={3}
                    value={formData.struttura_muscolo_scheletrica}
                    onChange={(e) =>
                      handleInputChange('struttura_muscolo_scheletrica', e.target.value)
                    }
                    placeholder="es. Buona struttura muscolo-scheletrica"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    CapacitÃ  di Dispersione del Calore
                  </label>
                  <textarea
                    className="bg-white/[0.04] text-text-primary placeholder:text-text-tertiary w-full rounded-lg border border-white/10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-200"
                    rows={3}
                    value={formData.capacita_dispersione_calore}
                    onChange={(e) =>
                      handleInputChange('capacita_dispersione_calore', e.target.value)
                    }
                    placeholder="es. CapacitÃ  di dispersione del calore elevata"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          <Card variant="default" className={`group relative overflow-hidden ${CARD_DS}`}>
            <CardHeader className={CARD_HEADER}>
              <CardTitle size="sm" className="text-sm font-bold text-text-primary">
                Note (opzionale)
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <textarea
                className="bg-white/[0.04] text-text-primary placeholder:text-text-tertiary w-full rounded-lg border border-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-200"
                rows={3}
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                placeholder="Aggiungi note o osservazioni sulla misurazione..."
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              loading={loading}
              className="w-full gap-1.5 h-10 min-h-[44px] text-sm rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            >
              <Save className="h-3.5 w-3.5" />
              Salva Misurazione
            </Button>
            <Link href="/home/progressi" className="w-full">
              <Button
                variant="outline"
                className="w-full h-10 min-h-[44px] text-sm rounded-lg border border-white/10 text-text-primary hover:bg-white/5"
              >
                Annulla
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
