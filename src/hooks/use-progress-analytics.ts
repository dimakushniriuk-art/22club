'use client'

import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useRealtimeChannel } from '@/hooks/useRealtimeChannel'
import type { SupabaseDatabase } from '@/types/supabase'
import { getProfileIdFromUserId } from '@/lib/utils/profile-id-utils'

const logger = createLogger('hooks:use-progress-analytics')

// Tipo esteso per progress_logs che include campi legacy/aggiuntivi non nel tipo generato
type ProgressLogExtended = SupabaseDatabase['public']['Tables']['progress_logs']['Row'] & {
  // Campi composizione corporea
  massa_grassa_percentuale?: number | null
  massa_grassa_kg?: number | null
  massa_magra_kg?: number | null
  massa_muscolare_kg?: number | null
  massa_muscolare_scheletrica_kg?: number | null
  // Campi circonferenze aggiuntive (dalla migrazione 20250201)
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

export interface ProgressKPI {
  // Valori base
  pesoAttuale: number | null
  variazionePeso7gg: number | null
  forzaMassima: number | null
  percentualeCompletamento: number
  streak: number

  // Dataset per grafici base
  datasetPeso: Array<{ date: string; peso: number }>
  datasetForza: Array<{ date: string; forza: number }>
  datasetCompletamento: Array<{ date: string; percentuale: number }>

  // 1️⃣ COMPOSIZIONE CORPOREA
  datasetComposizioneCorporea: Array<{
    date: string
    massa_grassa_percentuale: number | null
    massa_grassa_kg: number | null
    massa_magra_kg: number | null
    massa_muscolare_kg: number | null
    massa_muscolare_scheletrica_kg: number | null
  }>
  valoriComposizioneAttuali: {
    massa_grassa_percentuale: number | null
    massa_grassa_kg: number | null
    massa_magra_kg: number | null
    massa_muscolare_kg: number | null
    massa_muscolare_scheletrica_kg: number | null
    rapporto_massa_magra_peso: number | null
  }

  // 2️⃣ CIRCONFERENZE
  datasetCirconferenze: Array<{
    date: string
    // Braccia
    braccio_contratto_cm: number | null
    braccio_rilassato_cm: number | null
    avambraccio_cm: number | null
    // Tronco
    collo_cm: number | null
    spalle_cm: number | null
    torace_cm: number | null
    torace_inspirazione_cm: number | null
    vita_cm: number | null
    vita_alta_cm: number | null
    addome_basso_cm: number | null
    fianchi_cm: number | null
    glutei_cm: number | null
    // Gambe
    coscia_alta_cm: number | null
    coscia_media_cm: number | null
    coscia_bassa_cm: number | null
    ginocchio_cm: number | null
    polpaccio_cm: number | null
    caviglia_cm: number | null
    // Altri
    polso_cm: number | null
    biceps_cm: number | null
  }>
  valoriCirconferenzeAttuali: {
    // Braccia
    braccio_contratto_cm: number | null
    braccio_rilassato_cm: number | null
    avambraccio_cm: number | null
    // Tronco
    collo_cm: number | null
    spalle_cm: number | null
    torace_cm: number | null
    torace_inspirazione_cm: number | null
    vita_cm: number | null
    vita_alta_cm: number | null
    addome_basso_cm: number | null
    fianchi_cm: number | null
    glutei_cm: number | null
    // Gambe
    coscia_alta_cm: number | null
    coscia_media_cm: number | null
    coscia_bassa_cm: number | null
    ginocchio_cm: number | null
    polpaccio_cm: number | null
    caviglia_cm: number | null
    // Altri
    polso_cm: number | null
    biceps_cm: number | null
  }

  // 3️⃣ FORZA DETTAGLIATA
  datasetForzaDettagliata: Array<{
    date: string
    max_bench_kg: number | null
    max_squat_kg: number | null
    max_deadlift_kg: number | null
  }>
  valoriForzaAttuali: {
    max_bench_kg: number | null
    max_squat_kg: number | null
    max_deadlift_kg: number | null
  }

  // Timeline progressi
  ultimiProgressi: Array<{
    id: string
    date: string
    weight_kg: number | null
    max_bench_kg: number | null
    max_squat_kg: number | null
    max_deadlift_kg: number | null
    note: string | null
  }>
}

export function useProgressAnalytics(athleteId: string | null) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const fetchProgressData = useCallback(async (): Promise<ProgressKPI> => {
    // Verifica sessione prima di fare la query
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    console.log('[use-progress-analytics] ========== VERIFICA SESSIONE ==========')
    console.log('[use-progress-analytics] hasSession:', !!session)
    console.log('[use-progress-analytics] sessionError:', sessionError)
    if (session) {
      console.log('[use-progress-analytics] session.user.id:', session.user.id)
      console.log('[use-progress-analytics] session.user.email:', session.user.email)
    }
    console.log('[use-progress-analytics] athleteId passato:', athleteId)
    console.log(
      '[use-progress-analytics] corrispondenza session.user.id === athleteId:',
      session?.user.id === athleteId,
    )
    console.log('[use-progress-analytics] ======================================')

    if (!athleteId) {
      logger.warn('Athlete ID is null, returning empty data', undefined, {
        athleteId,
        hasSession: !!session,
      })
      // Restituisci dati vuoti invece di lanciare errore
      return {
        pesoAttuale: null,
        variazionePeso7gg: null,
        forzaMassima: null,
        percentualeCompletamento: 0,
        streak: 0,
        datasetPeso: [],
        datasetForza: [],
        datasetCompletamento: [],
        datasetComposizioneCorporea: [],
        valoriComposizioneAttuali: {
          massa_grassa_percentuale: null,
          massa_grassa_kg: null,
          massa_magra_kg: null,
          massa_muscolare_kg: null,
          massa_muscolare_scheletrica_kg: null,
          rapporto_massa_magra_peso: null,
        },
        datasetCirconferenze: [],
        valoriCirconferenzeAttuali: {
          // Braccia
          braccio_contratto_cm: null,
          braccio_rilassato_cm: null,
          avambraccio_cm: null,
          // Tronco
          collo_cm: null,
          spalle_cm: null,
          torace_cm: null,
          torace_inspirazione_cm: null,
          vita_cm: null,
          vita_alta_cm: null,
          addome_basso_cm: null,
          fianchi_cm: null,
          glutei_cm: null,
          // Gambe
          coscia_alta_cm: null,
          coscia_media_cm: null,
          coscia_bassa_cm: null,
          ginocchio_cm: null,
          polpaccio_cm: null,
          caviglia_cm: null,
          // Altri
          polso_cm: null,
          biceps_cm: null,
        },
        datasetForzaDettagliata: [],
        valoriForzaAttuali: {
          max_bench_kg: null,
          max_squat_kg: null,
          max_deadlift_kg: null,
        },
        ultimiProgressi: [],
      }
    }

    // Fetch progress logs for the last 60 days
    // progress_logs.athlete_id è FK a profiles.user_id, quindi athleteId dovrebbe essere user_id
    // workout_plans.athlete_id è FK a profiles.id, quindi dobbiamo convertire se necessario
    // Select esplicito per ridurre payload (solo campi necessari)
    console.log('[use-progress-analytics] ========== INIZIO QUERY ==========')
    console.log('[use-progress-analytics] Querying progress_logs with athleteId:', athleteId)
    console.log('[use-progress-analytics] athleteId type:', typeof athleteId)
    console.log('[use-progress-analytics] athleteId value:', JSON.stringify(athleteId))
    console.log('[use-progress-analytics] athleteId length:', athleteId?.length)

    // Verifica che athleteId sia un UUID valido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (athleteId && !uuidRegex.test(athleteId)) {
      console.error('[use-progress-analytics] ERRORE: athleteId non è un UUID valido!', athleteId)
    }

    // Query esplicita con logging dettagliato
    console.log('[use-progress-analytics] Eseguendo query Supabase...')
    console.log('[use-progress-analytics] Query params:', {
      table: 'progress_logs',
      filter: { athlete_id: athleteId },
      order: ['date DESC', 'created_at DESC'],
      limit: 100,
    })

    const queryBuilder = supabase
      .from('progress_logs')
      .select(
        `
        id,
        date,
        weight_kg,
        max_bench_kg,
        max_squat_kg,
        max_deadlift_kg,
        note,
        created_at,
        updated_at,
        -- Circonferenze base (esistenti)
        chest_cm,
        waist_cm,
        hips_cm,
        biceps_cm,
        thighs_cm,
        -- Composizione corporea
        massa_grassa_percentuale,
        massa_grassa_kg,
        massa_magra_kg,
        massa_muscolare_kg,
        massa_muscolare_scheletrica_kg,
        -- Circonferenze aggiuntive (dalla migrazione 20250201)
        collo_cm,
        spalle_cm,
        torace_inspirazione_cm,
        braccio_rilassato_cm,
        braccio_contratto_cm,
        avambraccio_cm,
        polso_cm,
        vita_alta_cm,
        addome_basso_cm,
        glutei_cm,
        coscia_alta_cm,
        coscia_media_cm,
        coscia_bassa_cm,
        ginocchio_cm,
        polpaccio_cm,
        caviglia_cm
      `,
      )
      .eq('athlete_id', athleteId) // athleteId è user_id per progress_logs
      // Recupera le ultime 100 misurazioni (non filtriamo per data, solo limite)
      .order('date', { ascending: false }) // Ordina per data discendente (più recenti prima)
      .order('created_at', { ascending: false }) // In caso di stessa data, ordina per creazione
      .limit(100) // Limite massimo di 100 misurazioni

    console.log('[use-progress-analytics] Query builder creato, eseguendo...')

    // Test diretto: verifica che la query funzioni
    const testQuery = await supabase
      .from('progress_logs')
      .select('id, date, weight_kg, athlete_id')
      .eq('athlete_id', athleteId)
      .limit(1)

    console.log('[use-progress-analytics] Test query diretta:', {
      hasData: !!testQuery.data,
      dataLength: testQuery.data?.length || 0,
      hasError: !!testQuery.error,
      error: testQuery.error,
      firstRecord: testQuery.data?.[0],
    })

    const { data: progressLogsRaw, error: progressError } = await queryBuilder

    console.log('[use-progress-analytics] Query completa eseguita, risultato:', {
      hasData: !!progressLogsRaw,
      dataLength: progressLogsRaw?.length || 0,
      hasError: !!progressError,
      error: progressError,
      errorCode: progressError?.code,
      errorMessage: progressError?.message,
      errorDetails: progressError?.details,
      errorHint: progressError?.hint,
    })

    const progressLogs = progressLogsRaw as ProgressLogExtended[] | null

    // Log per debug: verifica cosa viene recuperato
    console.log('[use-progress-analytics] ========== RISULTATO QUERY ==========')
    console.log('[use-progress-analytics] athleteId:', athleteId)
    console.log('[use-progress-analytics] hasError:', !!progressError)
    if (progressError) {
      console.error('[use-progress-analytics] ERROR:', {
        code: progressError.code,
        message: progressError.message,
        details: progressError.details,
        hint: progressError.hint,
      })
    }
    console.log('[use-progress-analytics] rawDataLength:', progressLogsRaw?.length || 0)
    console.log('[use-progress-analytics] totalLogs:', progressLogs?.length || 0)
    if (progressLogs && progressLogs.length > 0) {
      console.log('[use-progress-analytics] ✅ DATI RECUPERATI!')
      console.log('[use-progress-analytics] First log (raw):', progressLogs[0])
      console.log(
        '[use-progress-analytics] First log (JSON):',
        JSON.stringify(progressLogs[0], null, 2),
      )
      console.log('[use-progress-analytics] First log weight_kg:', progressLogs[0].weight_kg)
      console.log(
        '[use-progress-analytics] First log massa_grassa_percentuale:',
        progressLogs[0].massa_grassa_percentuale,
      )
      console.log('[use-progress-analytics] First log chest_cm:', progressLogs[0].chest_cm)
      if (progressLogs.length > 1) {
        console.log('[use-progress-analytics] All logs count:', progressLogs.length)
        console.log(
          '[use-progress-analytics] Sample logs (primi 3):',
          progressLogs.slice(0, 3).map((log) => ({
            date: log.date,
            weight_kg: log.weight_kg,
            massa_grassa_percentuale: log.massa_grassa_percentuale,
          })),
        )
      }
    } else {
      console.warn('[use-progress-analytics] ⚠️ Nessun log recuperato!')
      console.warn(
        '[use-progress-analytics] Verifica che athlete_id in progress_logs corrisponda a user_id in profiles',
      )
      console.warn(
        '[use-progress-analytics] Esegui: docs/sql/VERIFICA_ATHLETE_ID_CORRETTO.sql per verificare',
      )
    }
    console.log('[use-progress-analytics] ======================================')

    logger.debug('Progress logs recuperati', undefined, {
      totalLogs: progressLogs?.length || 0,
      athleteId,
      hasError: !!progressError,
      sampleLog: progressLogs?.[0],
    })

    // Gestione errori migliorata: invece di lanciare, restituisci valori di default
    if (progressError) {
      // Se è un errore di permessi o RLS, logga come warning (non critico)
      if (
        progressError.code === '42501' ||
        progressError.message?.includes('permission') ||
        progressError.message?.includes('row-level security')
      ) {
        logger.warn(
          'RLS/Permission error fetching progress logs, returning default values',
          progressError,
          {
            athleteId,
            errorCode: progressError.code,
            errorMessage: progressError.message,
          },
        )
      } else {
        // Per altri errori, logga come warning (gestito, non blocca l'app)
        logger.warn(
          'Error fetching progress logs (non-critical), returning default values',
          progressError,
          {
            athleteId,
            errorCode: progressError.code,
            errorMessage: progressError.message,
            errorDetails: progressError.details,
            errorHint: progressError.hint,
          },
        )
      }

      // Restituisci valori di default invece di lanciare l'errore
      return {
        pesoAttuale: null,
        variazionePeso7gg: null,
        forzaMassima: null,
        percentualeCompletamento: 0,
        streak: 0,
        datasetPeso: [],
        datasetForza: [],
        datasetCompletamento: [],
        datasetComposizioneCorporea: [],
        valoriComposizioneAttuali: {
          massa_grassa_percentuale: null,
          massa_grassa_kg: null,
          massa_magra_kg: null,
          massa_muscolare_kg: null,
          massa_muscolare_scheletrica_kg: null,
          rapporto_massa_magra_peso: null,
        },
        datasetCirconferenze: [],
        valoriCirconferenzeAttuali: {
          // Braccia
          braccio_contratto_cm: null,
          braccio_rilassato_cm: null,
          avambraccio_cm: null,
          // Tronco
          collo_cm: null,
          spalle_cm: null,
          torace_cm: null,
          torace_inspirazione_cm: null,
          vita_cm: null,
          vita_alta_cm: null,
          addome_basso_cm: null,
          fianchi_cm: null,
          glutei_cm: null,
          // Gambe
          coscia_alta_cm: null,
          coscia_media_cm: null,
          coscia_bassa_cm: null,
          ginocchio_cm: null,
          polpaccio_cm: null,
          caviglia_cm: null,
          // Altri
          polso_cm: null,
          biceps_cm: null,
        },
        datasetForzaDettagliata: [],
        valoriForzaAttuali: {
          max_bench_kg: null,
          max_squat_kg: null,
          max_deadlift_kg: null,
        },
        ultimiProgressi: [],
      }
    }

    // Fetch workouts for completion percentage calculation
    // workout_plans.athlete_id è FK a profiles.id, non profiles.user_id
    // Converti athleteId (user_id) a profile_id se necessario
    let workoutAthleteId = athleteId
    try {
      const profileId = await getProfileIdFromUserId(athleteId || '')
      if (profileId) {
        workoutAthleteId = profileId
        logger.debug('Converted user_id to profile_id for workout_plans query', undefined, {
          userId: athleteId,
          profileId,
        })
      }
    } catch (conversionError) {
      logger.warn('Errore conversione user_id a profile_id per workout_plans', conversionError, {
        athleteId,
      })
      // Continua con athleteId originale (potrebbe fallire la query)
    }

    // Query ottimizzata: limit su workout_plans e solo campi necessari per calcolo completion
    // NOTA: Supabase non supporta limit su nested relations, quindi limitiamo i workout_plans
    // e accettiamo che i nested possano essere molti. Per ottimizzazione futura, considerare
    // una RPC function che fa aggregazione lato DB.
    const { data: workouts, error: workoutsError } = await supabase
      .from('workout_plans')
      .select(
        `
        id,
        is_active,
        created_at
      `,
      )
      .eq('athlete_id', workoutAthleteId) // Usa profile_id per workout_plans
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50) // Limite esplicito su workout_plans per prevenire payload enormi

    if (workoutsError) {
      // Errore workouts non è bloccante - possiamo calcolare KPI senza
      logger.warn('Could not fetch workouts data', workoutsError, { athleteId })
    }

    // Ensure workouts is never undefined (fallback to empty array)
    const safeWorkouts = workouts || []

    // Calculate KPIs
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Inverti l'array per avere ordine cronologico (più vecchie prima, più recenti dopo)
    // progressLogs è ordinato per data discendente (più recenti prima), quindi invertiamo
    const progressLogsSorted = progressLogs ? [...progressLogs].reverse() : []

    // Current weight (ultima entry, che è la più recente)
    const pesoAttuale =
      progressLogsSorted?.length > 0
        ? progressLogsSorted[progressLogsSorted.length - 1].weight_kg
        : null

    console.log('[use-progress-analytics] pesoAttuale calcolato:', pesoAttuale)

    // Weight variation in last 7 days
    const peso7GiorniFa = progressLogsSorted?.find(
      (log) => new Date(log.date) <= sevenDaysAgo,
    )?.weight_kg
    const variazionePeso7gg = pesoAttuale && peso7GiorniFa ? pesoAttuale - peso7GiorniFa : null

    // Maximum strength (latest bench press, squat, or deadlift)
    const latestLog = progressLogsSorted?.[progressLogsSorted.length - 1]
    const forzaMassima = latestLog
      ? Math.max(
          latestLog.max_bench_kg || 0,
          latestLog.max_squat_kg || 0,
          latestLog.max_deadlift_kg || 0,
        )
      : null

    // Calculate completion percentage for last 30 days
    const totalWorkouts = safeWorkouts.length || 0
    const completedWorkouts = safeWorkouts.filter((workout) => !workout.is_active).length || 0
    const percentualeCompletamento =
      totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0

    // Calculate streak (consecutive days with completed workouts)
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const hasWorkoutOnDate = safeWorkouts.some((workout) => {
        const workoutDate = new Date(workout.created_at)
        workoutDate.setHours(0, 0, 0, 0)
        return workoutDate.getTime() === checkDate.getTime() && !workout.is_active
      })

      if (hasWorkoutOnDate) {
        streak++
      } else {
        break
      }
    }

    // Prepare datasets for charts (usa progressLogsSorted per avere ordine cronologico)
    const datasetPeso =
      progressLogsSorted
        ?.filter((log) => log.weight_kg !== null)
        .map((log) => ({
          date: log.date,
          peso: log.weight_kg!,
        })) || []

    const datasetForza =
      progressLogsSorted
        ?.filter((log) => log.max_bench_kg || log.max_squat_kg || log.max_deadlift_kg)
        .map((log) => ({
          date: log.date,
          forza: Math.max(log.max_bench_kg || 0, log.max_squat_kg || 0, log.max_deadlift_kg || 0),
        })) || []

    // Calculate completion percentage by week
    const datasetCompletamento = []
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)

      const weekWorkouts = safeWorkouts.filter((workout) => {
        const workoutDate = new Date(workout.created_at)
        return workoutDate >= weekStart && workoutDate < weekEnd
      })

      const completedWeekWorkouts = weekWorkouts.filter((workout) => !workout.is_active).length

      const weekPercentage =
        weekWorkouts.length > 0
          ? Math.round((completedWeekWorkouts / weekWorkouts.length) * 100)
          : 0

      datasetCompletamento.unshift({
        date: weekStart.toISOString().split('T')[0],
        percentuale: weekPercentage,
      })
    }

    // 1️⃣ COMPOSIZIONE CORPOREA - Dataset e valori attuali
    const datasetComposizioneCorporea =
      progressLogsSorted?.map((log) => {
        const extendedLog = log as ProgressLogExtended
        return {
          date: log.date,
          massa_grassa_percentuale: extendedLog.massa_grassa_percentuale ?? null,
          massa_grassa_kg: extendedLog.massa_grassa_kg ?? null,
          massa_magra_kg: extendedLog.massa_magra_kg ?? null,
          massa_muscolare_kg: extendedLog.massa_muscolare_kg ?? null,
          massa_muscolare_scheletrica_kg: extendedLog.massa_muscolare_scheletrica_kg ?? null,
        }
      }) || []

    // Filtra solo le entry che hanno almeno un valore di composizione corporea non null
    // NOTA: != null include sia null che undefined, ma esclude 0 (che è un valore valido)
    const datasetComposizioneCorporeaFiltered = datasetComposizioneCorporea.filter(
      (entry) =>
        entry.massa_grassa_percentuale != null ||
        entry.massa_grassa_kg != null ||
        entry.massa_magra_kg != null ||
        entry.massa_muscolare_kg != null ||
        entry.massa_muscolare_scheletrica_kg != null,
    )

    console.log('[use-progress-analytics] Filtro composizione corporea:', {
      prima: datasetComposizioneCorporea.length,
      dopo: datasetComposizioneCorporeaFiltered.length,
      differenza: datasetComposizioneCorporea.length - datasetComposizioneCorporeaFiltered.length,
      samplePrima: datasetComposizioneCorporea[0],
      sampleDopo: datasetComposizioneCorporeaFiltered[0],
    })

    // Log per debug
    console.log('[use-progress-analytics] Dataset composizione corporea:', {
      totalEntries: datasetComposizioneCorporea.length,
      filteredEntries: datasetComposizioneCorporeaFiltered.length,
      sampleEntry: datasetComposizioneCorporeaFiltered[0],
      allEntries: datasetComposizioneCorporea,
      filteredEntriesFull: datasetComposizioneCorporeaFiltered,
    })

    logger.debug('Dataset composizione corporea', undefined, {
      totalEntries: datasetComposizioneCorporea.length,
      filteredEntries: datasetComposizioneCorporeaFiltered.length,
      sampleEntry: datasetComposizioneCorporeaFiltered[0],
    })

    const latestLogForComposition =
      progressLogsSorted && progressLogsSorted.length > 0
        ? (progressLogsSorted[progressLogsSorted.length - 1] as ProgressLogExtended)
        : null
    const pesoAttualeForRatio = latestLogForComposition?.weight_kg ?? null
    const massaMagraAttuale = latestLogForComposition?.massa_magra_kg ?? null
    const rapportoMassaMagraPeso =
      pesoAttualeForRatio && massaMagraAttuale && pesoAttualeForRatio > 0
        ? Number((massaMagraAttuale / pesoAttualeForRatio).toFixed(3))
        : null

    const valoriComposizioneAttuali = {
      massa_grassa_percentuale: latestLogForComposition?.massa_grassa_percentuale ?? null,
      massa_grassa_kg: latestLogForComposition?.massa_grassa_kg ?? null,
      massa_magra_kg: massaMagraAttuale,
      massa_muscolare_kg: latestLogForComposition?.massa_muscolare_kg ?? null,
      massa_muscolare_scheletrica_kg:
        latestLogForComposition?.massa_muscolare_scheletrica_kg ?? null,
      rapporto_massa_magra_peso: rapportoMassaMagraPeso,
    }

    // 2️⃣ CIRCONFERENZE - Dataset e valori attuali
    // NOTA: I campi nella tabella sono: chest_cm, waist_cm, hips_cm (non torace_cm, vita_cm, fianchi_cm)
    // Per coerenza con l'interfaccia, mappiamo chest_cm -> torace_cm, waist_cm -> vita_cm, hips_cm -> fianchi_cm
    const datasetCirconferenze =
      progressLogsSorted?.map((log) => {
        const extendedLog = log as ProgressLogExtended
        return {
          date: log.date,
          // Braccia
          braccio_contratto_cm: extendedLog.braccio_contratto_cm ?? null,
          braccio_rilassato_cm: extendedLog.braccio_rilassato_cm ?? null,
          avambraccio_cm: extendedLog.avambraccio_cm ?? null,
          // Tronco
          collo_cm: extendedLog.collo_cm ?? null,
          spalle_cm: extendedLog.spalle_cm ?? null,
          torace_cm: log.chest_cm ?? null, // chest_cm -> torace_cm per coerenza UI
          torace_inspirazione_cm: extendedLog.torace_inspirazione_cm ?? null,
          vita_cm: log.waist_cm ?? null, // waist_cm -> vita_cm per coerenza UI
          vita_alta_cm: extendedLog.vita_alta_cm ?? null,
          addome_basso_cm: extendedLog.addome_basso_cm ?? null,
          fianchi_cm: log.hips_cm ?? null, // hips_cm -> fianchi_cm per coerenza UI
          glutei_cm: extendedLog.glutei_cm ?? null,
          // Gambe
          coscia_alta_cm: extendedLog.coscia_alta_cm ?? null,
          coscia_media_cm: extendedLog.coscia_media_cm ?? log.thighs_cm ?? null,
          coscia_bassa_cm: extendedLog.coscia_bassa_cm ?? null,
          ginocchio_cm: extendedLog.ginocchio_cm ?? null,
          polpaccio_cm: extendedLog.polpaccio_cm ?? null,
          caviglia_cm: extendedLog.caviglia_cm ?? null,
          // Altri
          polso_cm: extendedLog.polso_cm ?? null,
          biceps_cm: log.biceps_cm ?? null, // Manteniamo anche il campo originale per retrocompatibilità
        }
      }) || []

    const valoriCirconferenzeAttuali = latestLogForComposition
      ? {
          // Braccia
          braccio_contratto_cm: latestLogForComposition.braccio_contratto_cm ?? null,
          braccio_rilassato_cm: latestLogForComposition.braccio_rilassato_cm ?? null,
          avambraccio_cm: latestLogForComposition.avambraccio_cm ?? null,
          // Tronco
          collo_cm: latestLogForComposition.collo_cm ?? null,
          spalle_cm: latestLogForComposition.spalle_cm ?? null,
          torace_cm: latestLogForComposition.chest_cm ?? null,
          torace_inspirazione_cm: latestLogForComposition.torace_inspirazione_cm ?? null,
          vita_cm: latestLogForComposition.waist_cm ?? null,
          vita_alta_cm: latestLogForComposition.vita_alta_cm ?? null,
          addome_basso_cm: latestLogForComposition.addome_basso_cm ?? null,
          fianchi_cm: latestLogForComposition.hips_cm ?? null,
          glutei_cm: latestLogForComposition.glutei_cm ?? null,
          // Gambe
          coscia_alta_cm: latestLogForComposition.coscia_alta_cm ?? null,
          coscia_media_cm:
            latestLogForComposition.coscia_media_cm ?? latestLogForComposition.thighs_cm ?? null,
          coscia_bassa_cm: latestLogForComposition.coscia_bassa_cm ?? null,
          ginocchio_cm: latestLogForComposition.ginocchio_cm ?? null,
          polpaccio_cm: latestLogForComposition.polpaccio_cm ?? null,
          caviglia_cm: latestLogForComposition.caviglia_cm ?? null,
          // Altri
          polso_cm: latestLogForComposition.polso_cm ?? null,
          biceps_cm: latestLogForComposition.biceps_cm ?? null,
        }
      : {
          // Braccia
          braccio_contratto_cm: null,
          braccio_rilassato_cm: null,
          avambraccio_cm: null,
          // Tronco
          collo_cm: null,
          spalle_cm: null,
          torace_cm: null,
          torace_inspirazione_cm: null,
          vita_cm: null,
          vita_alta_cm: null,
          addome_basso_cm: null,
          fianchi_cm: null,
          glutei_cm: null,
          // Gambe
          coscia_alta_cm: null,
          coscia_media_cm: null,
          coscia_bassa_cm: null,
          ginocchio_cm: null,
          polpaccio_cm: null,
          caviglia_cm: null,
          // Altri
          polso_cm: null,
          biceps_cm: null,
        }

    // 3️⃣ FORZA DETTAGLIATA - Dataset e valori attuali
    const datasetForzaDettagliata =
      progressLogsSorted
        ?.filter(
          (log) =>
            log.max_bench_kg !== null || log.max_squat_kg !== null || log.max_deadlift_kg !== null,
        )
        .map((log) => ({
          date: log.date,
          max_bench_kg: log.max_bench_kg,
          max_squat_kg: log.max_squat_kg,
          max_deadlift_kg: log.max_deadlift_kg,
        })) || []

    const valoriForzaAttuali = latestLogForComposition
      ? {
          max_bench_kg: latestLogForComposition.max_bench_kg ?? null,
          max_squat_kg: latestLogForComposition.max_squat_kg ?? null,
          max_deadlift_kg: latestLogForComposition.max_deadlift_kg ?? null,
        }
      : {
          max_bench_kg: null,
          max_squat_kg: null,
          max_deadlift_kg: null,
        }

    // Get last 10 progress entries (le più recenti, che sono alla fine di progressLogsSorted)
    const ultimiProgressi =
      progressLogsSorted
        ?.slice(-10)
        .reverse()
        .map((log) => ({
          id: log.id,
          date: log.date,
          weight_kg: log.weight_kg,
          max_bench_kg: log.max_bench_kg,
          max_squat_kg: log.max_squat_kg,
          max_deadlift_kg: log.max_deadlift_kg,
          note: log.note,
        })) || []

    return {
      pesoAttuale,
      variazionePeso7gg,
      forzaMassima,
      percentualeCompletamento,
      streak,
      datasetPeso,
      datasetForza,
      datasetCompletamento,
      datasetComposizioneCorporea: datasetComposizioneCorporeaFiltered,
      valoriComposizioneAttuali,
      datasetCirconferenze,
      valoriCirconferenzeAttuali,
      datasetForzaDettagliata,
      valoriForzaAttuali,
      ultimiProgressi,
    }
  }, [athleteId, supabase])

  const query = useQuery({
    queryKey: ['progress-analytics', athleteId],
    queryFn: fetchProgressData,
    enabled: !!athleteId,
    staleTime: 10 * 1000, // 10 secondi (ridotto per aggiornamenti più frequenti)
    refetchOnMount: 'always', // Ricarica sempre quando il componente viene montato
    refetchOnWindowFocus: true, // Ricarica quando la finestra torna in focus
    gcTime: 5 * 60 * 1000, // 5 minuti (ex cacheTime)
  })

  // Realtime subscription per progress_logs
  useRealtimeChannel('progress_logs', (payload) => {
    // Invalida query quando ci sono cambiamenti (INSERT, UPDATE, DELETE)
    queryClient.invalidateQueries({ queryKey: ['progress-analytics', athleteId] })
    logger.debug('Realtime progress_logs event received', undefined, {
      eventType: payload.eventType,
      new: payload.new,
      old: payload.old,
    })
  })

  // Realtime subscription per workout_plans (influisce su percentuale completamento)
  useRealtimeChannel('workout_plans', (payload) => {
    // Invalida query quando ci sono cambiamenti (INSERT, UPDATE, DELETE)
    queryClient.invalidateQueries({ queryKey: ['progress-analytics', athleteId] })
    logger.debug('Realtime workout_plans event received', undefined, {
      eventType: payload.eventType,
      new: payload.new,
      old: payload.old,
    })
  })

  return query
}

// Helper function for KPI calculations
export function getKPIProgress(athleteId: string) {
  // This function can be used server-side or in other contexts
  // For now, we'll use the hook version above
  logger.warn('getKPIProgress non è ancora implementato', undefined, { athleteId })
  return null
}
