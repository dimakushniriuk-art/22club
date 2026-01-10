'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { validateWeight, validateNumberRange, validateDate } from '@/lib/utils/validation'
import { notifyError } from '@/lib/notifications'
import { getValueRange, type ProgressRanges } from '@/lib/constants/progress-ranges'

const logger = createLogger('app:home:progressi:nuovo:page')
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import {
  ArrowLeft,
  Save,
  Scale,
  Ruler,
  Calculator,
  Activity,
  Dna,
  Layers,
  Target,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'

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

  // Stato per tracciare gli errori di validazione range per ogni campo
  const [fieldValidation, setFieldValidation] = useState<
    Record<string, { status: 'valid' | 'warning' | 'error' | null; message?: string }>
  >({})

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

        // Recupera l'ultima misurazione salvata (più recente per data)
        const { data: lastMeasurement, error: fetchError } = await supabase
          .from('progress_logs')
          .select('*')
          .eq('athlete_id', authUser.id)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (fetchError) {
          logger.warn('Errore nel caricare ultima misurazione', fetchError, {
            athleteId: authUser.id,
          })
          setLoadingLastMeasurement(false)
          return
        }

        if (!lastMeasurement) {
          logger.debug('Nessuna misurazione precedente trovata, form vuoto')
          setLoadingLastMeasurement(false)
          return
        }

        logger.debug('Ultima misurazione caricata con successo', undefined, {
          measurementId: lastMeasurement.id,
          date: lastMeasurement.date,
          athleteId: authUser.id,
        })

        // Mappa i dati dal database al formato del form
        setFormData({
          // Valori principali
          peso_kg: numberToString(lastMeasurement.weight_kg),
          massa_grassa_percentuale: numberToString(lastMeasurement.massa_grassa_percentuale),
          massa_grassa_kg: numberToString(lastMeasurement.massa_grassa_kg),
          massa_magra_kg: numberToString(lastMeasurement.massa_magra_kg),
          massa_muscolare_kg: numberToString(lastMeasurement.massa_muscolare_kg),
          massa_muscolare_scheletrica_kg: numberToString(
            lastMeasurement.massa_muscolare_scheletrica_kg,
          ),

          // Misure antropometriche aggiuntive
          statura_allungata_cm: numberToString(lastMeasurement.statura_allungata_cm),
          statura_seduto_cm: numberToString(lastMeasurement.statura_seduto_cm),
          apertura_braccia_cm: numberToString(lastMeasurement.apertura_braccia_cm),

          // Composizione corporea aggiuntiva
          massa_ossea_kg: numberToString(lastMeasurement.massa_ossea_kg),
          massa_residuale_kg: numberToString(lastMeasurement.massa_residuale_kg),

          // Circonferenze
          collo_cm: numberToString(lastMeasurement.collo_cm),
          spalle_cm: numberToString(lastMeasurement.spalle_cm),
          torace_cm: numberToString(lastMeasurement.chest_cm || lastMeasurement.torace_cm),
          torace_inspirazione_cm: numberToString(lastMeasurement.torace_inspirazione_cm),
          braccio_rilassato_cm: numberToString(lastMeasurement.braccio_rilassato_cm),
          braccio_contratto_cm: numberToString(lastMeasurement.braccio_contratto_cm),
          avambraccio_cm: numberToString(lastMeasurement.avambraccio_cm),
          polso_cm: numberToString(lastMeasurement.polso_cm),
          vita_alta_cm: numberToString(lastMeasurement.vita_alta_cm),
          vita_cm: numberToString(lastMeasurement.waist_cm || lastMeasurement.vita_cm),
          addome_basso_cm: numberToString(lastMeasurement.addome_basso_cm),
          fianchi_cm: numberToString(lastMeasurement.hips_cm || lastMeasurement.fianchi_cm),
          glutei_cm: numberToString(lastMeasurement.glutei_cm),
          coscia_alta_cm: numberToString(lastMeasurement.coscia_alta_cm),
          coscia_media_cm: numberToString(
            lastMeasurement.coscia_media_cm || lastMeasurement.thighs_cm,
          ),
          coscia_bassa_cm: numberToString(lastMeasurement.coscia_bassa_cm),
          ginocchio_cm: numberToString(lastMeasurement.ginocchio_cm),
          polpaccio_cm: numberToString(lastMeasurement.polpaccio_cm),
          caviglia_cm: numberToString(lastMeasurement.caviglia_cm),

          // Perimetri corretti
          braccio_corretto_cm: numberToString(lastMeasurement.braccio_corretto_cm),
          coscia_corretta_cm: numberToString(lastMeasurement.coscia_corretta_cm),
          gamba_corretta_cm: numberToString(lastMeasurement.gamba_corretta_cm),

          // Indici principali
          imc: numberToString(lastMeasurement.imc),
          indice_vita_fianchi: numberToString(lastMeasurement.indice_vita_fianchi),
          indice_adiposo_muscolare: numberToString(lastMeasurement.indice_adiposo_muscolare),
          indice_muscolo_osseo: numberToString(lastMeasurement.indice_muscolo_osseo),
          indice_conicita: numberToString(lastMeasurement.indice_conicita),
          indice_manouvrier: numberToString(lastMeasurement.indice_manouvrier),
          indice_cormico: numberToString(lastMeasurement.indice_cormico),
          area_superficie_corporea_m2: numberToString(lastMeasurement.area_superficie_corporea_m2),

          // Metabolismo
          metabolismo_basale_kcal: numberToString(lastMeasurement.metabolismo_basale_kcal),
          dispendio_energetico_totale_kcal: numberToString(
            lastMeasurement.dispendio_energetico_totale_kcal,
          ),
          livello_attivita: lastMeasurement.livello_attivita || '',

          // Somatotipo
          endomorfia: numberToString(lastMeasurement.endomorfia),
          mesomorfia: numberToString(lastMeasurement.mesomorfia),
          ectomorfia: numberToString(lastMeasurement.ectomorfia),

          // Pliche cutanee
          plica_tricipite_mm: numberToString(lastMeasurement.plica_tricipite_mm),
          plica_sottoscapolare_mm: numberToString(lastMeasurement.plica_sottoscapolare_mm),
          plica_bicipite_mm: numberToString(lastMeasurement.plica_bicipite_mm),
          plica_cresta_iliaca_mm: numberToString(lastMeasurement.plica_cresta_iliaca_mm),
          plica_sopraspinale_mm: numberToString(lastMeasurement.plica_sopraspinale_mm),
          plica_addominale_mm: numberToString(lastMeasurement.plica_addominale_mm),
          plica_coscia_mm: numberToString(lastMeasurement.plica_coscia_mm),
          plica_gamba_mm: numberToString(lastMeasurement.plica_gamba_mm),

          // Diametri ossei
          diametro_omero_cm: numberToString(lastMeasurement.diametro_omero_cm),
          diametro_bistiloideo_cm: numberToString(lastMeasurement.diametro_bistiloideo_cm),
          diametro_femore_cm: numberToString(lastMeasurement.diametro_femore_cm),

          // Osservazioni cliniche
          rischio_cardiometabolico: lastMeasurement.rischio_cardiometabolico || '',
          adiposita_centrale: lastMeasurement.adiposita_centrale || '',
          struttura_muscolo_scheletrica: lastMeasurement.struttura_muscolo_scheletrica || '',
          capacita_dispersione_calore: lastMeasurement.capacita_dispersione_calore || '',

          // Note
          note: lastMeasurement.note || '',

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

  // Mappa i nomi dei campi del form ai range definiti
  const getFieldRangeMapping = (
    field: keyof FormData,
  ): { category: keyof ProgressRanges; field: string } | null => {
    const mapping: Record<string, { category: keyof ProgressRanges; field: string }> = {
      // Valori principali
      peso_kg: { category: 'valoriPrincipali', field: 'peso_kg' },
      massa_grassa_percentuale: { category: 'valoriPrincipali', field: 'massa_grassa_percentuale' },
      massa_grassa_kg: { category: 'valoriPrincipali', field: 'massa_grassa_kg' },
      massa_magra_kg: { category: 'valoriPrincipali', field: 'massa_magra_kg' },
      massa_muscolare_kg: { category: 'valoriPrincipali', field: 'massa_muscolare_kg' },
      massa_muscolare_scheletrica_kg: {
        category: 'valoriPrincipali',
        field: 'massa_muscolare_scheletrica_kg',
      },
      // Circonferenze
      collo_cm: { category: 'circonferenze', field: 'collo_cm' },
      spalle_cm: { category: 'circonferenze', field: 'spalle_cm' },
      torace_cm: { category: 'circonferenze', field: 'torace_cm' },
      torace_inspirazione_cm: { category: 'circonferenze', field: 'torace_inspirazione_cm' },
      braccio_rilassato_cm: { category: 'circonferenze', field: 'braccio_rilassato_cm' },
      braccio_contratto_cm: { category: 'circonferenze', field: 'braccio_contratto_cm' },
      avambraccio_cm: { category: 'circonferenze', field: 'avambraccio_cm' },
      polso_cm: { category: 'circonferenze', field: 'polso_cm' },
      vita_alta_cm: { category: 'circonferenze', field: 'vita_alta_cm' },
      vita_cm: { category: 'circonferenze', field: 'vita_cm' },
      addome_basso_cm: { category: 'circonferenze', field: 'addome_basso_cm' },
      fianchi_cm: { category: 'circonferenze', field: 'fianchi_cm' },
      glutei_cm: { category: 'circonferenze', field: 'glutei_cm' },
      coscia_alta_cm: { category: 'circonferenze', field: 'coscia_alta_cm' },
      coscia_media_cm: { category: 'circonferenze', field: 'coscia_media_cm' },
      coscia_bassa_cm: { category: 'circonferenze', field: 'coscia_bassa_cm' },
      ginocchio_cm: { category: 'circonferenze', field: 'ginocchio_cm' },
      polpaccio_cm: { category: 'circonferenze', field: 'polpaccio_cm' },
      caviglia_cm: { category: 'circonferenze', field: 'caviglia_cm' },
      // Misure antropometriche
      statura_allungata_cm: { category: 'misureAntropometriche', field: 'statura_allungata_cm' },
      statura_seduto_cm: { category: 'misureAntropometriche', field: 'statura_da_seduto_cm' },
      apertura_braccia_cm: { category: 'misureAntropometriche', field: 'apertura_braccia_cm' },
      // Composizione corporea
      massa_ossea_kg: { category: 'composizioneCorporea', field: 'massa_ossea_kg' },
      massa_residuale_kg: { category: 'composizioneCorporea', field: 'massa_residuale_kg' },
      // Perimetri corretti
      braccio_corretto_cm: { category: 'perimetriCorretti', field: 'braccio_corretto_cm' },
      coscia_corretta_cm: { category: 'perimetriCorretti', field: 'coscia_corretta_cm' },
      gamba_corretta_cm: { category: 'perimetriCorretti', field: 'gamba_corretta_cm' },
      // Indici
      imc: { category: 'indici', field: 'imc' },
      indice_vita_fianchi: { category: 'indici', field: 'vita_fianchi' },
      indice_adiposo_muscolare: { category: 'indici', field: 'indice_adiposo_muscolare' },
      indice_muscolo_osseo: { category: 'indici', field: 'indice_muscolo_osseo' },
      indice_conicita: { category: 'indici', field: 'indice_conicita' },
      indice_manouvrier: { category: 'indici', field: 'indice_manouvrier' },
      indice_cormico: { category: 'indici', field: 'indice_cormico' },
      area_superficie_corporea_m2: { category: 'indici', field: 'area_superficie_corporea_m2' },
      // Metabolismo
      metabolismo_basale_kcal: { category: 'metabolismo', field: 'metabolismo_basale_kcal' },
      dispendio_energetico_totale_kcal: {
        category: 'metabolismo',
        field: 'dispendio_totale_kcal',
      },
      // Somatotipo
      endomorfia: { category: 'somatotipo', field: 'endomorfia' },
      mesomorfia: { category: 'somatotipo', field: 'mesomorfia' },
      ectomorfia: { category: 'somatotipo', field: 'ectomorfia' },
      // Pliche cutanee
      plica_tricipite_mm: { category: 'plicheCutanee', field: 'tricipite_mm' },
      plica_sottoscapolare_mm: { category: 'plicheCutanee', field: 'sottoscapolare_mm' },
      plica_bicipite_mm: { category: 'plicheCutanee', field: 'bicipite_mm' },
      plica_cresta_iliaca_mm: { category: 'plicheCutanee', field: 'cresta_iliaca_mm' },
      plica_sopraspinale_mm: { category: 'plicheCutanee', field: 'sopraspinale_mm' },
      plica_addominale_mm: { category: 'plicheCutanee', field: 'addominale_mm' },
      plica_coscia_mm: { category: 'plicheCutanee', field: 'coscia_mm' },
      plica_gamba_mm: { category: 'plicheCutanee', field: 'gamba_mm' },
      // Diametri ossei
      diametro_omero_cm: { category: 'diametriOssei', field: 'omero_cm' },
      diametro_bistiloideo_cm: { category: 'diametriOssei', field: 'bistiloideo_cm' },
      diametro_femore_cm: { category: 'diametriOssei', field: 'femore_cm' },
    }
    return mapping[field] || null
  }

  // Valida un campo contro il suo range
  const validateFieldRange = (field: keyof FormData, value: string) => {
    const mapping = getFieldRangeMapping(field)
    if (!mapping || !value || value.trim() === '') {
      setFieldValidation((prev) => ({ ...prev, [field]: { status: null } }))
      return
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      setFieldValidation((prev) => ({ ...prev, [field]: { status: null } }))
      return
    }

    const range = getValueRange(mapping.category, mapping.field)
    if (!range) {
      setFieldValidation((prev) => ({ ...prev, [field]: { status: null } }))
      return
    }

    const isInRange = numValue >= range.min && numValue <= range.max

    let status: 'valid' | 'warning' | 'error' | null = null
    let message: string | undefined

    if (isInRange) {
      status = 'valid'
    } else {
      // Calcola quanto è fuori range (percentuale)
      const rangeSize = range.max - range.min
      const distanceFromMin = Math.abs(numValue - range.min)
      const distanceFromMax = Math.abs(numValue - range.max)
      const minDistance = Math.min(distanceFromMin, distanceFromMax)
      const percentOut = (minDistance / rangeSize) * 100

      if (percentOut > 50) {
        status = 'error'
        message = `Valore molto fuori range (${range.min}-${range.max}${range.unit || ''})`
      } else {
        status = 'warning'
        message = `Valore fuori range ottimale (${range.min}-${range.max}${range.unit || ''})`
      }
    }

    setFieldValidation((prev) => ({ ...prev, [field]: { status, message } }))
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Valida il campo in tempo reale
    validateFieldRange(field, value)
  }

  // Helper per ottenere le props di validazione per un Input
  const getValidationProps = (field: keyof FormData) => {
    const validation = fieldValidation[field]
    if (!validation || validation.status === null) {
      return {
        variant: 'default' as const,
        errorMessage: undefined,
        rightIcon: undefined,
      }
    }

    return {
      variant:
        validation.status === 'error'
          ? ('error' as const)
          : validation.status === 'warning'
            ? ('warning' as const)
            : validation.status === 'valid'
              ? ('success' as const)
              : ('default' as const),
      errorMessage: validation.message,
      rightIcon:
        validation.status === 'valid' ? (
          <CheckCircle2 className="h-4 w-4 text-state-success" />
        ) : validation.status === 'error' || validation.status === 'warning' ? (
          <AlertTriangle className="h-4 w-4 text-state-error" />
        ) : undefined,
    }
  }

  const parseNumber = (value: string): number | null => {
    if (!value || value.trim() === '') return null
    const parsed = parseFloat(value)
    return isNaN(parsed) ? null : parsed
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Ottieni auth.uid() direttamente da Supabase per garantire che athlete_id sia corretto
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
    // Usa .single() invece di .maybeSingle() per avere un errore più chiaro
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

      // Se il profilo non esiste (PGRST116), mostra un messaggio più chiaro
      if (profileError.code === 'PGRST116') {
        notifyError(
          'Errore',
          "Il tuo profilo non è stato trovato nel sistema. Contatta l'amministratore.",
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

    // Validazione peso (se inserito)
    if (formData.peso_kg && formData.peso_kg.trim()) {
      const weightValue = parseFloat(formData.peso_kg)
      if (!isNaN(weightValue)) {
        // Valida peso con range realistico (40-150 kg) e messaggi specifici
        const weightValidation = validateWeight(weightValue, { min: 40, max: 150 })
        if (!weightValidation.valid) {
          validationErrors.push(
            weightValidation.error || 'Il peso deve essere compreso tra 40 e 150 kg',
          )
        }
      }
    }

    // Validazione circonferenze (se inserite) - range 0-200 cm
    const circumferenceFields = [
      { key: 'collo_cm', name: 'Collo' },
      { key: 'spalle_cm', name: 'Spalle' },
      { key: 'torace_cm', name: 'Torace' },
      { key: 'vita_cm', name: 'Vita' },
      { key: 'fianchi_cm', name: 'Fianchi' },
      { key: 'coscia_media_cm', name: 'Coscia' },
    ]

    for (const field of circumferenceFields) {
      const value = formData[field.key as keyof FormData] as string
      if (value && value.trim()) {
        const numValue = parseFloat(value)
        if (!isNaN(numValue)) {
          const rangeValidation = validateNumberRange(numValue, 0, 200, field.name)
          if (!rangeValidation.valid) {
            validationErrors.push(rangeValidation.error || `${field.name} non valido`)
          }
        }
      }
    }

    if (validationErrors.length > 0) {
      notifyError('Errore validazione', validationErrors.join(', '))
      return
    }

    setLoading(true)
    try {
      // Prepara i dati per l'inserimento
      // Usa auth.uid() direttamente per athlete_id (deve corrispondere a profiles.user_id)
      const insertData: Record<string, unknown> = {
        athlete_id: authUser.id, // auth.uid() corrisponde a profiles.user_id
        date: formData.date,
        // Valori principali - mappa peso_kg a weight_kg per compatibilità
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

        // Circonferenze - mappa torace_cm a chest_cm, vita_cm a waist_cm, fianchi_cm a hips_cm per compatibilità
        collo_cm: parseNumber(formData.collo_cm),
        spalle_cm: parseNumber(formData.spalle_cm),
        chest_cm: parseNumber(formData.torace_cm), // Mappa a chest_cm esistente
        torace_inspirazione_cm: parseNumber(formData.torace_inspirazione_cm),
        braccio_rilassato_cm: parseNumber(formData.braccio_rilassato_cm),
        braccio_contratto_cm: parseNumber(formData.braccio_contratto_cm),
        biceps_cm: parseNumber(formData.braccio_contratto_cm), // Mappa anche a biceps_cm per compatibilità
        avambraccio_cm: parseNumber(formData.avambraccio_cm),
        polso_cm: parseNumber(formData.polso_cm),
        vita_alta_cm: parseNumber(formData.vita_alta_cm),
        waist_cm: parseNumber(formData.vita_cm), // Mappa a waist_cm esistente
        addome_basso_cm: parseNumber(formData.addome_basso_cm),
        hips_cm: parseNumber(formData.fianchi_cm), // Mappa a hips_cm esistente
        glutei_cm: parseNumber(formData.glutei_cm),
        coscia_alta_cm: parseNumber(formData.coscia_alta_cm),
        coscia_media_cm: parseNumber(formData.coscia_media_cm),
        thighs_cm: parseNumber(formData.coscia_media_cm), // Mappa anche a thighs_cm per compatibilità
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

      logger.debug('Inserting progress log', {
        athleteId: authUser.id,
        profileId: profile.id,
        profileUserId: profile.user_id,
        date: formData.date,
        fieldsCount: Object.keys(filteredInsertData).length,
        athleteIdInData: filteredInsertData.athlete_id,
        sampleFields: Object.keys(filteredInsertData).slice(0, 10),
      })

      const { error } = await supabase
        .from('progress_logs')
        .insert(filteredInsertData as never)
        .select()

      if (error) {
        // Log completo dell'errore con tutti i dettagli
        console.error('=== ERRORE SUPABASE COMPLETO ===', {
          error: error,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
          athleteId: authUser.id,
          profileId: profile.id,
          profileUserId: profile.user_id,
          athleteIdInData: filteredInsertData.athlete_id,
          athleteIdMatch: authUser.id === filteredInsertData.athlete_id,
          profileUserIdMatch: profile.user_id === filteredInsertData.athlete_id,
          insertDataKeys: Object.keys(filteredInsertData),
          insertDataSample: Object.fromEntries(Object.entries(filteredInsertData).slice(0, 20)),
        })

        logger.error('Error saving progress', error, {
          athleteId: authUser.id,
          profileId: profile.id,
          profileUserId: profile.user_id,
          athleteIdInData: filteredInsertData.athlete_id,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
          insertDataKeys: Object.keys(filteredInsertData),
          insertDataSample: Object.fromEntries(
            Object.entries(filteredInsertData).slice(0, 15), // Aumentato per vedere athlete_id
          ),
        })

        // Messaggio di errore più dettagliato
        let errorMessage = error.message || 'Errore sconosciuto'
        if (
          error.code === '42501' ||
          error.message?.includes('permission') ||
          error.message?.includes('row-level security')
        ) {
          errorMessage =
            'Non hai i permessi per salvare i progressi. Verifica le policy RLS in Supabase.'
        } else if (error.code === '23503' || error.message?.includes('foreign key')) {
          errorMessage = "Errore di riferimento: verifica che l'atleta esista nel sistema."
        } else if (error.code === '23505' || error.message?.includes('unique')) {
          errorMessage = 'Esiste già un progresso per questa data.'
        } else if (error.code === '23502' || error.message?.includes('not null')) {
          errorMessage = 'Alcuni campi obbligatori sono mancanti.'
        } else if (error.details) {
          errorMessage = `${error.message}. Dettagli: ${error.details}`
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

  // Mostra un indicatore di caricamento mentre carica l'ultima misurazione
  if (loadingLastMeasurement) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        {/* Header - Design Moderno e Uniforme */}
        <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <div className="relative z-10 flex items-center gap-2">
            <Link href="/home/progressi">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
                Nuova Misurazione
              </h1>
              <p className="text-text-secondary text-xs">Caricamento ultima misurazione...</p>
            </div>
          </div>
        </div>
        <Card className="relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <CardContent className="p-12 text-center relative z-10">
            <div className="mb-3 text-4xl opacity-50">📊</div>
            <p className="text-text-secondary text-sm font-medium">Caricamento dati...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
      style={{ overflow: 'auto' }}
    >
      {/* Header - Design Moderno e Uniforme */}
      <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative z-10 flex items-center gap-2">
          <Link href="/home/progressi">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
              Nuova Misurazione
            </h1>
            <p className="text-text-secondary text-xs line-clamp-1">
              Registra i tuoi progressi completi
              {formData.peso_kg && <span className="ml-1 text-teal-300">(precompilato)</span>}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Data */}
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Ruler className="h-3.5 w-3.5 text-teal-300" />
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
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Scale className="h-3.5 w-3.5 text-teal-300" />
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
                min="20"
                max="300"
                value={formData.peso_kg}
                onChange={(e) => handleInputChange('peso_kg', e.target.value)}
                placeholder="es. 75.5"
                {...getValidationProps('peso_kg')}
              />

              <Input
                label="Massa Grassa (%)"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.massa_grassa_percentuale}
                onChange={(e) => handleInputChange('massa_grassa_percentuale', e.target.value)}
                placeholder="es. 15.5"
                {...getValidationProps('massa_grassa_percentuale')}
              />

              <Input
                label="Massa Grassa (kg)"
                type="number"
                step="0.1"
                min="0"
                value={formData.massa_grassa_kg}
                onChange={(e) => handleInputChange('massa_grassa_kg', e.target.value)}
                placeholder="es. 11.6"
                {...getValidationProps('massa_grassa_kg')}
              />

              <Input
                label="Massa Magra (kg)"
                type="number"
                step="0.1"
                min="0"
                value={formData.massa_magra_kg}
                onChange={(e) => handleInputChange('massa_magra_kg', e.target.value)}
                placeholder="es. 63.9"
                {...getValidationProps('massa_magra_kg')}
              />

              <Input
                label="Massa Muscolare (kg)"
                type="number"
                step="0.1"
                min="0"
                value={formData.massa_muscolare_kg}
                onChange={(e) => handleInputChange('massa_muscolare_kg', e.target.value)}
                placeholder="es. 58.5"
                {...getValidationProps('massa_muscolare_kg')}
              />

              <Input
                label="Massa Muscolare Scheletrica (kg)"
                type="number"
                step="0.1"
                min="0"
                value={formData.massa_muscolare_scheletrica_kg}
                onChange={(e) =>
                  handleInputChange('massa_muscolare_scheletrica_kg', e.target.value)
                }
                placeholder="es. 30.2"
                {...getValidationProps('massa_muscolare_scheletrica_kg')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Circonferenze */}
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Ruler className="h-3.5 w-3.5 text-teal-300" />
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
                min="0"
                value={formData.collo_cm}
                onChange={(e) => handleInputChange('collo_cm', e.target.value)}
                placeholder="es. 38.5"
                {...getValidationProps('collo_cm')}
              />

              <Input
                label="Spalle"
                type="number"
                step="0.1"
                min="0"
                value={formData.spalle_cm}
                onChange={(e) => handleInputChange('spalle_cm', e.target.value)}
                placeholder="es. 110.0"
                {...getValidationProps('spalle_cm')}
              />

              <Input
                label="Torace"
                type="number"
                step="0.1"
                min="0"
                value={formData.torace_cm}
                onChange={(e) => handleInputChange('torace_cm', e.target.value)}
                placeholder="es. 100.0"
                {...getValidationProps('torace_cm')}
              />

              <Input
                label="Torace in Inspirazione"
                type="number"
                step="0.1"
                min="0"
                value={formData.torace_inspirazione_cm}
                onChange={(e) => handleInputChange('torace_inspirazione_cm', e.target.value)}
                placeholder="es. 105.0"
                {...getValidationProps('torace_inspirazione_cm')}
              />

              <Input
                label="Braccio Rilassato"
                type="number"
                step="0.1"
                min="0"
                value={formData.braccio_rilassato_cm}
                onChange={(e) => handleInputChange('braccio_rilassato_cm', e.target.value)}
                placeholder="es. 32.0"
                {...getValidationProps('braccio_rilassato_cm')}
              />

              <Input
                label="Braccio Contratto"
                type="number"
                step="0.1"
                min="0"
                value={formData.braccio_contratto_cm}
                onChange={(e) => handleInputChange('braccio_contratto_cm', e.target.value)}
                placeholder="es. 36.5"
                {...getValidationProps('braccio_contratto_cm')}
              />

              <Input
                label="Avambraccio"
                type="number"
                step="0.1"
                min="0"
                value={formData.avambraccio_cm}
                onChange={(e) => handleInputChange('avambraccio_cm', e.target.value)}
                placeholder="es. 28.0"
                {...getValidationProps('avambraccio_cm')}
              />

              <Input
                label="Polso"
                type="number"
                step="0.1"
                min="0"
                value={formData.polso_cm}
                onChange={(e) => handleInputChange('polso_cm', e.target.value)}
                placeholder="es. 17.0"
                {...getValidationProps('polso_cm')}
              />

              <Input
                label="Vita Alta"
                type="number"
                step="0.1"
                min="0"
                value={formData.vita_alta_cm}
                onChange={(e) => handleInputChange('vita_alta_cm', e.target.value)}
                placeholder="es. 80.0"
                {...getValidationProps('vita_alta_cm')}
              />

              <Input
                label="Vita"
                type="number"
                step="0.1"
                min="0"
                value={formData.vita_cm}
                onChange={(e) => handleInputChange('vita_cm', e.target.value)}
                placeholder="es. 82.0"
                {...getValidationProps('vita_cm')}
              />

              <Input
                label="Addome Basso"
                type="number"
                step="0.1"
                min="0"
                value={formData.addome_basso_cm}
                onChange={(e) => handleInputChange('addome_basso_cm', e.target.value)}
                placeholder="es. 85.0"
                {...getValidationProps('addome_basso_cm')}
              />

              <Input
                label="Fianchi"
                type="number"
                step="0.1"
                min="0"
                value={formData.fianchi_cm}
                onChange={(e) => handleInputChange('fianchi_cm', e.target.value)}
                placeholder="es. 95.0"
                {...getValidationProps('fianchi_cm')}
              />

              <Input
                label="Glutei"
                type="number"
                step="0.1"
                min="0"
                value={formData.glutei_cm}
                onChange={(e) => handleInputChange('glutei_cm', e.target.value)}
                placeholder="es. 98.0"
                {...getValidationProps('glutei_cm')}
              />

              <Input
                label="Coscia Alta"
                type="number"
                step="0.1"
                min="0"
                value={formData.coscia_alta_cm}
                onChange={(e) => handleInputChange('coscia_alta_cm', e.target.value)}
                placeholder="es. 58.0"
                {...getValidationProps('coscia_alta_cm')}
              />

              <Input
                label="Coscia Media"
                type="number"
                step="0.1"
                min="0"
                value={formData.coscia_media_cm}
                onChange={(e) => handleInputChange('coscia_media_cm', e.target.value)}
                placeholder="es. 56.0"
                {...getValidationProps('coscia_media_cm')}
              />

              <Input
                label="Coscia Bassa"
                type="number"
                step="0.1"
                min="0"
                value={formData.coscia_bassa_cm}
                onChange={(e) => handleInputChange('coscia_bassa_cm', e.target.value)}
                placeholder="es. 54.0"
                {...getValidationProps('coscia_bassa_cm')}
              />

              <Input
                label="Ginocchio"
                type="number"
                step="0.1"
                min="0"
                value={formData.ginocchio_cm}
                onChange={(e) => handleInputChange('ginocchio_cm', e.target.value)}
                placeholder="es. 38.0"
                {...getValidationProps('ginocchio_cm')}
              />

              <Input
                label="Polpaccio"
                type="number"
                step="0.1"
                min="0"
                value={formData.polpaccio_cm}
                onChange={(e) => handleInputChange('polpaccio_cm', e.target.value)}
                placeholder="es. 38.5"
                {...getValidationProps('polpaccio_cm')}
              />

              <Input
                label="Caviglia"
                type="number"
                step="0.1"
                min="0"
                value={formData.caviglia_cm}
                onChange={(e) => handleInputChange('caviglia_cm', e.target.value)}
                placeholder="es. 22.0"
                {...getValidationProps('caviglia_cm')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Misure Antropometriche Aggiuntive */}
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Ruler className="h-3.5 w-3.5 text-teal-300" />
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
                min="0"
                value={formData.statura_allungata_cm}
                onChange={(e) => handleInputChange('statura_allungata_cm', e.target.value)}
                placeholder="es. 182.2"
                {...getValidationProps('statura_allungata_cm')}
              />
              <Input
                label="Statura da Seduto (cm)"
                type="number"
                step="0.1"
                min="0"
                value={formData.statura_seduto_cm}
                onChange={(e) => handleInputChange('statura_seduto_cm', e.target.value)}
                placeholder="es. 95.0"
                {...getValidationProps('statura_seduto_cm')}
              />
              <Input
                label="Apertura Braccia (cm)"
                type="number"
                step="0.1"
                min="0"
                value={formData.apertura_braccia_cm}
                onChange={(e) => handleInputChange('apertura_braccia_cm', e.target.value)}
                placeholder="es. 180.0"
                {...getValidationProps('apertura_braccia_cm')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Composizione Corporea Aggiuntiva */}
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Layers className="h-3.5 w-3.5 text-teal-300" />
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
                min="0"
                value={formData.massa_ossea_kg}
                onChange={(e) => handleInputChange('massa_ossea_kg', e.target.value)}
                placeholder="es. 14.22"
                {...getValidationProps('massa_ossea_kg')}
              />
              <Input
                label="Massa Residuale (kg)"
                type="number"
                step="0.1"
                min="0"
                value={formData.massa_residuale_kg}
                onChange={(e) => handleInputChange('massa_residuale_kg', e.target.value)}
                placeholder="es. 15.89"
                {...getValidationProps('massa_residuale_kg')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Perimetri Corretti */}
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Ruler className="h-3.5 w-3.5 text-teal-300" />
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
                min="0"
                value={formData.braccio_corretto_cm}
                onChange={(e) => handleInputChange('braccio_corretto_cm', e.target.value)}
                placeholder="es. 29.7"
                {...getValidationProps('braccio_corretto_cm')}
              />
              <Input
                label="Coscia Corretta"
                type="number"
                step="0.1"
                min="0"
                value={formData.coscia_corretta_cm}
                onChange={(e) => handleInputChange('coscia_corretta_cm', e.target.value)}
                placeholder="es. 48.63"
                {...getValidationProps('coscia_corretta_cm')}
              />
              <Input
                label="Gamba Corretta"
                type="number"
                step="0.1"
                min="0"
                value={formData.gamba_corretta_cm}
                onChange={(e) => handleInputChange('gamba_corretta_cm', e.target.value)}
                placeholder="es. 36.59"
                {...getValidationProps('gamba_corretta_cm')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Indici Principali */}
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Calculator className="h-3.5 w-3.5 text-teal-300" />
              </div>
              <span className="truncate">Indici Principali</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 space-y-3 pt-2.5">
            <div className="grid grid-cols-1 gap-3">
              <Input
                label="IMC (kg/m²)"
                type="number"
                step="0.1"
                min="0"
                value={formData.imc}
                onChange={(e) => handleInputChange('imc', e.target.value)}
                placeholder="es. 32.1"
                {...getValidationProps('imc')}
              />
              <Input
                label="Indice Vita/Fianchi"
                type="number"
                step="0.01"
                min="0"
                value={formData.indice_vita_fianchi}
                onChange={(e) => handleInputChange('indice_vita_fianchi', e.target.value)}
                placeholder="es. 0.84"
                {...getValidationProps('indice_vita_fianchi')}
              />
              <Input
                label="Indice Adiposo-Muscolare"
                type="number"
                step="0.01"
                min="0"
                value={formData.indice_adiposo_muscolare}
                onChange={(e) => handleInputChange('indice_adiposo_muscolare', e.target.value)}
                placeholder="es. 1.17"
                {...getValidationProps('indice_adiposo_muscolare')}
              />
              <Input
                label="Indice Muscolo/Osseo"
                type="number"
                step="0.01"
                min="0"
                value={formData.indice_muscolo_osseo}
                onChange={(e) => handleInputChange('indice_muscolo_osseo', e.target.value)}
                placeholder="es. 2.48"
                {...getValidationProps('indice_muscolo_osseo')}
              />
              <Input
                label="Indice di Conicità"
                type="number"
                step="0.01"
                min="0"
                value={formData.indice_conicita}
                onChange={(e) => handleInputChange('indice_conicita', e.target.value)}
                placeholder="es. 1.16"
                {...getValidationProps('indice_conicita')}
              />
              <Input
                label="Indice Manouvrier"
                type="number"
                step="0.01"
                value={formData.indice_manouvrier}
                onChange={(e) => handleInputChange('indice_manouvrier', e.target.value)}
                placeholder="es. -2.0"
                {...getValidationProps('indice_manouvrier')}
              />
              <Input
                label="Indice Cormico"
                type="number"
                step="0.01"
                min="0"
                value={formData.indice_cormico}
                onChange={(e) => handleInputChange('indice_cormico', e.target.value)}
                placeholder="es. 52.0"
                {...getValidationProps('indice_cormico')}
              />
              <Input
                label="Area Superficie Corporea (m²)"
                type="number"
                step="0.01"
                min="0"
                value={formData.area_superficie_corporea_m2}
                onChange={(e) => handleInputChange('area_superficie_corporea_m2', e.target.value)}
                placeholder="es. 2.28"
                {...getValidationProps('area_superficie_corporea_m2')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Metabolismo */}
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Activity className="h-3.5 w-3.5 text-teal-300" />
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
                min="0"
                value={formData.metabolismo_basale_kcal}
                onChange={(e) => handleInputChange('metabolismo_basale_kcal', e.target.value)}
                placeholder="es. 2235"
                {...getValidationProps('metabolismo_basale_kcal')}
              />
              <Input
                label="Dispendio Energetico Totale (kcal)"
                type="number"
                step="1"
                min="0"
                value={formData.dispendio_energetico_totale_kcal}
                onChange={(e) =>
                  handleInputChange('dispendio_energetico_totale_kcal', e.target.value)
                }
                placeholder="es. 3352"
                {...getValidationProps('dispendio_energetico_totale_kcal')}
              />
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Livello Attività
                </label>
                <select
                  className="flex w-full rounded-xl border border-teal-500/30 bg-background-secondary/50 px-3 py-2 text-xs text-white placeholder:text-gray-400 focus:border-teal-500/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
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
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Dna className="h-3.5 w-3.5 text-teal-300" />
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
                min="0"
                value={formData.endomorfia}
                onChange={(e) => handleInputChange('endomorfia', e.target.value)}
                placeholder="es. 7.10"
                {...getValidationProps('endomorfia')}
              />
              <Input
                label="Mesomorfia"
                type="number"
                step="0.01"
                min="0"
                value={formData.mesomorfia}
                onChange={(e) => handleInputChange('mesomorfia', e.target.value)}
                placeholder="es. 7.25"
                {...getValidationProps('mesomorfia')}
              />
              <Input
                label="Ectomorfia"
                type="number"
                step="0.01"
                min="0"
                value={formData.ectomorfia}
                onChange={(e) => handleInputChange('ectomorfia', e.target.value)}
                placeholder="es. 0.16"
                {...getValidationProps('ectomorfia')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pliche Cutanee */}
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Target className="h-3.5 w-3.5 text-teal-300" />
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
                min="0"
                value={formData.plica_tricipite_mm}
                onChange={(e) => handleInputChange('plica_tricipite_mm', e.target.value)}
                placeholder="es. 28"
                {...getValidationProps('plica_tricipite_mm')}
              />
              <Input
                label="Sottoscapolare"
                type="number"
                step="0.1"
                min="0"
                value={formData.plica_sottoscapolare_mm}
                onChange={(e) => handleInputChange('plica_sottoscapolare_mm', e.target.value)}
                placeholder="es. 25"
                {...getValidationProps('plica_sottoscapolare_mm')}
              />
              <Input
                label="Bicipite"
                type="number"
                step="0.1"
                min="0"
                value={formData.plica_bicipite_mm}
                onChange={(e) => handleInputChange('plica_bicipite_mm', e.target.value)}
                placeholder="es. 14"
                {...getValidationProps('plica_bicipite_mm')}
              />
              <Input
                label="Cresta Iliaca"
                type="number"
                step="0.1"
                min="0"
                value={formData.plica_cresta_iliaca_mm}
                onChange={(e) => handleInputChange('plica_cresta_iliaca_mm', e.target.value)}
                placeholder="es. 39"
                {...getValidationProps('plica_cresta_iliaca_mm')}
              />
              <Input
                label="Sopraspinale"
                type="number"
                step="0.1"
                min="0"
                value={formData.plica_sopraspinale_mm}
                onChange={(e) => handleInputChange('plica_sopraspinale_mm', e.target.value)}
                placeholder="es. 30"
                {...getValidationProps('plica_sopraspinale_mm')}
              />
              <Input
                label="Addominale"
                type="number"
                step="0.1"
                min="0"
                value={formData.plica_addominale_mm}
                onChange={(e) => handleInputChange('plica_addominale_mm', e.target.value)}
                placeholder="es. 38"
                {...getValidationProps('plica_addominale_mm')}
              />
              <Input
                label="Coscia"
                type="number"
                step="0.1"
                min="0"
                value={formData.plica_coscia_mm}
                onChange={(e) => handleInputChange('plica_coscia_mm', e.target.value)}
                placeholder="es. 33"
                {...getValidationProps('plica_coscia_mm')}
              />
              <Input
                label="Gamba"
                type="number"
                step="0.1"
                min="0"
                value={formData.plica_gamba_mm}
                onChange={(e) => handleInputChange('plica_gamba_mm', e.target.value)}
                placeholder="es. 22"
                {...getValidationProps('plica_gamba_mm')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Diametri Ossei */}
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <Ruler className="h-3.5 w-3.5 text-teal-300" />
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
                min="0"
                value={formData.diametro_omero_cm}
                onChange={(e) => handleInputChange('diametro_omero_cm', e.target.value)}
                placeholder="es. 7.8"
                {...getValidationProps('diametro_omero_cm')}
              />
              <Input
                label="Bistiloideo"
                type="number"
                step="0.1"
                min="0"
                value={formData.diametro_bistiloideo_cm}
                onChange={(e) => handleInputChange('diametro_bistiloideo_cm', e.target.value)}
                placeholder="es. 6.2"
                {...getValidationProps('diametro_bistiloideo_cm')}
              />
              <Input
                label="Femore"
                type="number"
                step="0.1"
                min="0"
                value={formData.diametro_femore_cm}
                onChange={(e) => handleInputChange('diametro_femore_cm', e.target.value)}
                placeholder="es. 10.7"
                {...getValidationProps('diametro_femore_cm')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Osservazioni Cliniche */}
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent flex items-center gap-2"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <AlertTriangle className="h-3.5 w-3.5 text-teal-300" />
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
                  className="flex w-full rounded-xl border border-teal-500/30 bg-background-secondary/50 px-3 py-2 text-xs text-white placeholder:text-gray-400 focus:border-teal-500/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
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
                  Adiposità Centrale
                </label>
                <select
                  className="flex w-full rounded-xl border border-teal-500/30 bg-background-secondary/50 px-3 py-2 text-xs text-white placeholder:text-gray-400 focus:border-teal-500/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors"
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
                  className="bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:ring-brand w-full rounded-xl border border-teal-500/40 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/60 transition-all duration-200"
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
                  Capacità di Dispersione del Calore
                </label>
                <textarea
                  className="bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:ring-brand w-full rounded-xl border border-teal-500/40 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/60 transition-all duration-200"
                  rows={3}
                  value={formData.capacita_dispersione_calore}
                  onChange={(e) => handleInputChange('capacita_dispersione_calore', e.target.value)}
                  placeholder="es. Capacità di dispersione del calore elevata"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Note */}
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="relative z-10 pb-2.5 border-b border-teal-500/20">
            <CardTitle
              size="sm"
              className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent"
            >
              Note (opzionale)
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <textarea
              className="bg-background-secondary text-text-primary placeholder:text-text-tertiary focus:ring-brand w-full rounded-xl border border-teal-500/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/60 transition-all duration-200"
              rows={3}
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              placeholder="Aggiungi note o osservazioni sulla misurazione..."
            />
          </CardContent>
        </Card>

        {/* Submit - Design Moderno e Uniforme */}
        <div className="flex flex-col gap-2.5 pt-3">
          <Button
            type="submit"
            loading={loading}
            className="w-full gap-1.5 h-10 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold transition-all duration-200 shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-[1.02]"
          >
            <Save className="h-3.5 w-3.5" />
            Salva Misurazione
          </Button>
          <Link href="/home/progressi" className="w-full">
            <Button
              variant="outline"
              className="w-full h-9 text-xs border-teal-500/30 text-white hover:border-teal-400 hover:bg-teal-500/10 transition-all duration-200"
            >
              Annulla
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
