'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { createLogger } from '@/lib/logger'
import { validateWeight } from '@/lib/utils/validation'

const logger = createLogger('components:athlete:progress-flash')
import { Button } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface ProgressData {
  type: 'weight' | 'workouts' | 'strength'
  current: number
  previous: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  period: string
}

interface ProgressFlashProps {
  progress?: ProgressData
  loading?: boolean
  onWeightUpdate?: (weight: number) => void
}

/**
 * Valida che ProgressData sia valido e completo
 * Centralizza logica di validazione per evitare duplicazioni
 */
function isValidProgressData(progress: ProgressData | null | undefined): progress is ProgressData {
  if (!progress) return false

  // Valida che i campi obbligatori esistano
  if (
    typeof progress.current !== 'number' ||
    typeof progress.previous !== 'number' ||
    !progress.unit ||
    !progress.trend ||
    !progress.period
  ) {
    return false
  }

  // Valida che i pesi siano numeri validi e positivi (range 40-150 kg)
  const currentValidation = validateWeight(progress.current, { min: 40, max: 150 })
  const previousValidation = validateWeight(progress.previous, { min: 40, max: 150 })

  if (!currentValidation.valid || !previousValidation.valid) {
    return false
  }

  return true
}

/**
 * Componente wrapper per stato vuoto/dati invalidi
 * Unifica logica duplicata per gestire progress === null o invalido
 */
function EmptyProgressState({ onOpenDialog }: { onOpenDialog: () => void }) {
  return (
    <Card className="relative border border-teal-500/30 bg-transparent">
      <CardHeader className="relative">
        <CardTitle
          size="md"
          className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Flash progressi
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="py-6 text-center">
          <div className="mb-4 text-6xl opacity-50">⚖️</div>
          <h3 className="text-text-primary mb-2 text-lg font-medium">
            Inizia oggi il tuo percorso
          </h3>
          <p className="text-text-secondary mb-4 text-sm">
            Inserisci il tuo peso per iniziare a tracciare i tuoi progressi
          </p>
          <Button
            onClick={onOpenDialog}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40"
          >
            Inserisci il tuo peso
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Genera array di pesi per il picker (da 40 a 150 kg con step di 0.1)
// Definito fuori dal componente per evitare problemi di TDZ e per performance
const WEIGHT_OPTIONS = Array.from({ length: 1101 }, (_, i) => 40 + i * 0.1)

export function ProgressFlash({ progress, loading = false, onWeightUpdate }: ProgressFlashProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Valida progress con funzione centralizzata
  const isValidProgress = useMemo(() => isValidProgressData(progress), [progress])

  // Calcola defaultWeight con validazione centralizzata
  const defaultWeight = useMemo(() => {
    if (isValidProgress && progress && progress.current > 0) {
      return progress.current
    }
    return 76 // Default fallback
  }, [isValidProgress, progress])

  const [selectedWeight, setSelectedWeight] = useState(defaultWeight)
  const [targetWeight, setTargetWeight] = useState(70) // Obiettivo di default
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [animatedWeight, setAnimatedWeight] = useState(defaultWeight)
  const [graphAnimation, setGraphAnimation] = useState(false)
  // Ref per tracciare il timer di animazione e assicurare cleanup corretto
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Handler centralizzato per aprire dialog
  const handleOpenDialog = () => {
    setIsDialogOpen(true)
    setSelectedWeight(defaultWeight)
  }

  // Handler per salvare peso (dichiarato prima di essere usato nel JSX)
  const handleSaveWeight = useCallback(() => {
    try {
      // Valida peso prima di salvare con range realistico (40-150 kg) e messaggi specifici
      const weightValidation = validateWeight(selectedWeight, { min: 40, max: 150 })
      if (!weightValidation.valid) {
        logger.warn('Peso non valido per salvataggio', undefined, {
          selectedWeight,
          error: weightValidation.error,
        })
        // Notifica errore all'utente con messaggio specifico
        return
      }

      // Chiama callback parent per salvare peso
      if (onWeightUpdate) {
        onWeightUpdate(selectedWeight)
      }

      // Chiudi dialog dopo salvataggio
      setIsDialogOpen(false)
    } catch (err) {
      logger.error('Errore nel salvataggio peso', err, { selectedWeight })
    }
  }, [selectedWeight, onWeightUpdate])

  // Scroll al peso corrente quando si apre il dialog
  useEffect(() => {
    if (
      isDialogOpen &&
      scrollContainerRef.current &&
      isValidProgress &&
      progress?.current !== undefined
    ) {
      // Valida peso prima di usarlo (range 40-150 kg)
      const weightValidation = validateWeight(progress.current, { min: 40, max: 150 })
      if (!weightValidation.valid) {
        logger.warn('Peso non valido per scroll', undefined, { current: progress.current })
        return
      }

      // Trova l'indice del peso corrente
      const currentIndex = WEIGHT_OPTIONS.findIndex((w) => Math.abs(w - progress.current) < 0.05)

      if (currentIndex !== -1) {
        // Calcola la posizione di scroll per centrare l'elemento
        const itemHeight = 56 // h-14 = 56px
        const containerHeight = 256 // h-64 = 256px
        const scrollPosition = currentIndex * itemHeight - containerHeight / 2 + itemHeight / 2

        // Scroll dopo un piccolo delay per permettere al DOM di renderizzare
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollPosition
          }
        }, 100)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDialogOpen, isValidProgress])

  // Animazione del peso e del grafico (ottimizzata con cleanup corretto)
  useEffect(() => {
    // Pulisci timer precedente se esiste (evita accumulo)
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current)
      animationTimerRef.current = null
    }

    if (!isValidProgress || !progress) {
      return undefined
    }

    try {
      // Valida con funzione centralizzata (range 40-150 kg)
      const startWeightValidation = validateWeight(progress.previous, { min: 40, max: 150 })
      const endWeightValidation = validateWeight(progress.current, { min: 40, max: 150 })

      if (!startWeightValidation.valid || !endWeightValidation.valid) {
        logger.warn('Valori peso non validi per animazione', undefined, {
          previous: progress.previous,
          current: progress.current,
          previousError: startWeightValidation.error,
          currentError: endWeightValidation.error,
        })
        return undefined
      }

      const startWeight = Number(progress.previous)
      const endWeight = Number(progress.current)

      // Valida che i valori siano numeri validi prima di animare
      if (isNaN(startWeight) || isNaN(endWeight)) {
        logger.warn('Valori peso NaN per animazione', undefined, {
          previous: progress.previous,
          current: progress.current,
        })
        return undefined
      }

      // Anima il contatore del peso
      const duration = 1500
      const steps = 60
      const increment = (endWeight - startWeight) / steps
      let currentStep = 0

      // Usa ref per tracciare il timer e assicurare cleanup corretto
      animationTimerRef.current = setInterval(() => {
        currentStep++
        const newWeight = startWeight + increment * currentStep

        // Valida che il nuovo peso sia un numero valido
        if (!isNaN(newWeight)) {
          setAnimatedWeight(newWeight)
        }

        if (currentStep >= steps) {
          setAnimatedWeight(endWeight)
          if (animationTimerRef.current) {
            clearInterval(animationTimerRef.current)
            animationTimerRef.current = null
          }
        }
      }, duration / steps)

      // Attiva animazione grafico
      setGraphAnimation(true)

      // Cleanup: pulisce il timer quando il componente unmount o le dipendenze cambiano
      return () => {
        if (animationTimerRef.current) {
          clearInterval(animationTimerRef.current)
          animationTimerRef.current = null
        }
      }
    } catch (err) {
      logger.error("Errore nell'animazione peso", err, { progress })
      // Pulisci timer in caso di errore
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current)
        animationTimerRef.current = null
      }
      return undefined
    }
  }, [isValidProgress, progress])

  if (loading) {
    return (
      <Card className="relative border border-teal-500/30 bg-transparent">
        <CardHeader className="relative">
          <div className="animate-pulse">
            <div className="bg-background-tertiary h-6 w-32 rounded" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="animate-pulse space-y-4">
            <div className="bg-background-tertiary h-8 w-24 rounded" />
            <div className="bg-background-tertiary h-3 w-full rounded" />
            <div className="bg-background-tertiary h-4 w-32 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Unificato: gestisce sia progress === null che progress invalido
  if (!isValidProgress) {
    return (
      <>
        <EmptyProgressState onOpenDialog={handleOpenDialog} />

        {/* Dialog per inserire il primo peso */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[90vw] max-w-md bg-background-secondary/95 backdrop-blur-2xl border-teal-400/60 shadow-2xl shadow-teal-500/20 animate-scale-in">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-500/10 rounded-lg">
                  <span className="text-2xl">⚖️</span>
                </div>
                <div>
                  <DialogTitle className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent text-xl">
                    Inserisci il tuo peso
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="text-text-secondary">
                Inserisci il tuo peso attuale per iniziare a tracciare i tuoi progressi
              </DialogDescription>
            </DialogHeader>

            {/* Picker con scroll - Peso Attuale */}
            <div className="py-4">
              <div className="text-text-secondary text-xs font-medium mb-2 px-2">Peso Attuale</div>
              <div className="relative h-48 overflow-hidden rounded-xl bg-background-tertiary/30">
                {/* Gradiente superiore e inferiore */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background-secondary to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background-secondary to-transparent z-10 pointer-events-none" />

                {/* Linea centrale di selezione con glow */}
                <div className="absolute left-0 right-0 top-1/2 h-12 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="absolute inset-0 border-t-2 border-b-2 border-teal-400/60" />
                  <div className="absolute inset-0 border-t-2 border-b-2 border-teal-400/30 blur-sm" />
                </div>

                {/* Lista scrollabile dei pesi */}
                <div
                  className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                  ref={scrollContainerRef}
                >
                  <div className="py-20">
                    {WEIGHT_OPTIONS.map((weight) => {
                      const distance = Math.abs(weight - selectedWeight)
                      const isSelected = distance < 0.1
                      const isNear = distance < 0.5

                      return (
                        <div
                          key={weight}
                          className="snap-center h-12 flex items-center justify-center cursor-pointer transition-all duration-200"
                          onClick={() => setSelectedWeight(weight)}
                        >
                          <span
                            className={`transition-all duration-200 ${
                              isSelected
                                ? 'text-teal-400 font-bold text-2xl scale-110'
                                : isNear
                                  ? 'text-text-primary text-lg'
                                  : 'text-text-tertiary text-sm'
                            }`}
                          >
                            {weight.toFixed(1)}
                          </span>
                          <span
                            className={`ml-1 transition-all duration-200 ${
                              isSelected
                                ? 'text-teal-400/70 font-semibold text-base'
                                : isNear
                                  ? 'text-text-secondary text-sm'
                                  : 'text-text-tertiary text-xs'
                            }`}
                          >
                            kg
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Peso selezionato */}
              <div className="mt-4 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {selectedWeight.toFixed(1)} kg
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-teal-500/50 text-white hover:bg-teal-500/10 hover:border-teal-400 flex-1"
              >
                Annulla
              </Button>
              <Button
                onClick={handleSaveWeight}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 flex-1"
              >
                ✓ Salva
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // A questo punto, progress è garantito valido grazie al type guard
  if (!progress) {
    // TypeScript guard - non dovrebbe mai arrivare qui, ma aggiungiamo per sicurezza
    return <EmptyProgressState onOpenDialog={handleOpenDialog} />
  }

  // Simulazione dati 5 mesi (150 giorni) - usa validazione centralizzata
  const generateWeightHistory = () => {
    try {
      // Valida con funzione centralizzata (range 40-150 kg)
      const startWeightValidation = validateWeight(progress.previous, { min: 40, max: 150 })
      const endWeightValidation = validateWeight(progress.current, { min: 40, max: 150 })

      if (!startWeightValidation.valid || !endWeightValidation.valid) {
        logger.warn('Valori peso non validi per generare storico', undefined, {
          previous: progress.previous,
          current: progress.current,
          previousError: startWeightValidation.error,
          currentError: endWeightValidation.error,
        })
        return []
      }

      const startWeight = Number(progress.previous)
      const endWeight = Number(progress.current)

      const days = 150
      const data = []

      for (let i = 0; i <= days; i++) {
        const progressValue = i / days
        // Curva di perdita peso (più veloce all'inizio, più lenta alla fine)
        const curve = 1 - Math.pow(1 - progressValue, 2)
        const weight = startWeight - (startWeight - endWeight) * curve
        data.push({
          day: i,
          weight: Math.round(weight * 10) / 10,
          date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
        })
      }
      return data
    } catch (err) {
      logger.error('Errore nella generazione storico peso', err, { progress })
      return []
    }
  }

  const weightHistory = generateWeightHistory()

  // Valida che abbiamo dati validi - usa componente wrapper unificato
  if (weightHistory.length === 0) {
    return <EmptyProgressState onOpenDialog={handleOpenDialog} />
  }

  const minWeight = Math.min(...weightHistory.map((d) => d.weight)) - 2
  const maxWeight = Math.max(...weightHistory.map((d) => d.weight)) + 2
  const weightRange = maxWeight - minWeight

  // Calcola statistiche con validazione centralizzata (progress è già validato)
  const startWeight = Number(progress.previous)
  const endWeight = Number(progress.current)
  const totalLost = startWeight - endWeight
  const percentageLostNum = startWeight > 0 ? (totalLost / startWeight) * 100 : 0
  const percentageLost = percentageLostNum.toFixed(1)
  const weeks = Math.floor(150 / 7)
  const avgPerWeek = weeks > 0 ? (totalLost / weeks).toFixed(2) : '0.00'

  // Calcola progresso verso obiettivo (con validazione)
  const progressToGoal =
    progress && progress.previous && progress.previous > 0 && targetWeight > 0
      ? ((progress.previous - selectedWeight) / (progress.previous - targetWeight)) * 100
      : 0
  const remainingToGoal = selectedWeight - targetWeight

  return (
    <>
      <Card
        className="relative border-0 bg-transparent cursor-pointer transition-all duration-200"
        onClick={() => {
          if (progress?.type === 'weight') {
            setSelectedWeight(progress.current)
            setIsDialogOpen(true)
          }
        }}
      >
        <CardContent className="relative p-4 sm:p-5">
          {/* Peso animato */}
          <div className="text-center mb-4 sm:mb-3">
            <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-pulse-glow">
              {animatedWeight.toFixed(1)}
              {progress.unit}
            </div>
          </div>

          {/* Statistiche */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-3">
            <div className="bg-background-tertiary/50 rounded-lg p-2.5 sm:p-3 text-center min-h-[56px] sm:min-h-[60px] flex flex-col justify-center">
              <div className="text-red-400 text-lg sm:text-xl font-bold leading-tight">
                -{totalLost.toFixed(1)}
              </div>
              <div className="text-text-tertiary text-xs sm:text-sm mt-0.5">kg persi</div>
            </div>
            <div className="bg-background-tertiary/50 rounded-lg p-2.5 sm:p-3 text-center min-h-[56px] sm:min-h-[60px] flex flex-col justify-center">
              <div className="text-green-400 text-lg sm:text-xl font-bold leading-tight">
                {percentageLost}%
              </div>
              <div className="text-text-tertiary text-xs sm:text-sm mt-0.5">obiettivo</div>
            </div>
            <div className="bg-background-tertiary/50 rounded-lg p-2.5 sm:p-3 text-center min-h-[56px] sm:min-h-[60px] flex flex-col justify-center">
              <div className="text-cyan-400 text-lg sm:text-xl font-bold leading-tight">
                {avgPerWeek}
              </div>
              <div className="text-text-tertiary text-xs sm:text-sm mt-0.5">kg/sett</div>
            </div>
          </div>

          {/* Grafico 5 mesi */}
          {progress.type === 'weight' && (
            <div className="bg-background-tertiary/30 rounded-xl p-3 sm:p-2.5">
              <div className="flex items-center justify-between mb-2 sm:mb-1.5">
                <div className="text-text-secondary text-sm sm:text-xs font-medium">
                  Andamento 5 mesi
                </div>
                <div className="text-text-tertiary text-xs sm:text-[10px]">
                  {progress.previous.toFixed(1)}kg → {progress.current.toFixed(1)}kg
                </div>
              </div>

              {/* Grafico SVG con curva completa */}
              <div className="relative h-14 sm:h-12 w-full">
                <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
                  {/* Griglia di sfondo */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        opacity="0.1"
                      />
                    </pattern>
                    <linearGradient id="weightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <rect width="300" height="80" fill="url(#grid)" />

                  {/* Curva del peso con animazione */}
                  {graphAnimation && (
                    <path
                      d={`M ${weightHistory
                        .map(
                          (d, i) =>
                            `${i * (300 / weightHistory.length)},${80 - ((d.weight - minWeight) / weightRange) * 80}`,
                        )
                        .join(' L ')}`}
                      fill="none"
                      stroke="url(#weightGradient)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-draw-path"
                      style={{
                        strokeDasharray: 1000,
                        strokeDashoffset: graphAnimation ? 0 : 1000,
                        transition: 'stroke-dashoffset 2s ease-in-out',
                      }}
                    />
                  )}

                  {/* Punto iniziale */}
                  <circle
                    cx="0"
                    cy={80 - ((progress.previous - minWeight) / weightRange) * 80}
                    r="3"
                    fill="#6b7280"
                    stroke="currentColor"
                    strokeWidth="1"
                  />

                  {/* Punto finale con glow */}
                  <circle
                    cx="300"
                    cy={80 - ((progress.current - minWeight) / weightRange) * 80}
                    r="4"
                    fill="#10b981"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="animate-pulse"
                  >
                    <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>

              {/* Timeline labels */}
              <div className="flex justify-between mt-2 sm:mt-1.5 text-text-tertiary text-xs sm:text-[10px]">
                <span>5 mesi fa</span>
                <span>Oggi</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog per selezionare il peso */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[90vw] max-w-md bg-background-secondary/95 backdrop-blur-2xl border-teal-400/60 shadow-2xl shadow-teal-500/20 animate-scale-in">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <span className="text-2xl">⚖️</span>
              </div>
              <div>
                <DialogTitle className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent text-xl">
                  Aggiorna Peso
                </DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-text-secondary">
              Seleziona il tuo peso attuale e imposta l&apos;obiettivo
            </DialogDescription>
          </DialogHeader>

          {/* Statistiche rapide */}
          {progress && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-background-tertiary/50 rounded-lg p-2 text-center">
                <div className="text-text-tertiary text-[10px] mb-1">Precedente</div>
                <div className="text-text-secondary text-sm font-medium">
                  {progress.previous} kg
                </div>
              </div>
              <div className="bg-background-tertiary/50 rounded-lg p-2 text-center border-2 border-teal-400/50">
                <div className="text-text-tertiary text-[10px] mb-1">Attuale</div>
                <div className="text-teal-400 text-sm font-bold">
                  {selectedWeight.toFixed(1)} kg
                </div>
              </div>
              <div className="bg-background-tertiary/50 rounded-lg p-2 text-center">
                <div className="text-text-tertiary text-[10px] mb-1">Obiettivo</div>
                <div className="text-green-400 text-sm font-medium">{targetWeight} kg</div>
              </div>
            </div>
          )}

          {/* Picker con scroll - Peso Attuale */}
          <div className="py-4">
            <div className="text-text-secondary text-xs font-medium mb-2 px-2">Peso Attuale</div>
            <div className="relative h-48 overflow-hidden rounded-xl bg-background-tertiary/30">
              {/* Gradiente superiore e inferiore */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background-secondary to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background-secondary to-transparent z-10 pointer-events-none" />

              {/* Linea centrale di selezione con glow */}
              <div className="absolute left-0 right-0 top-1/2 h-12 -translate-y-1/2 z-20 pointer-events-none">
                <div className="absolute inset-0 border-t-2 border-b-2 border-teal-400/60" />
                <div className="absolute inset-0 border-t-2 border-b-2 border-teal-400/30 blur-sm" />
              </div>

              {/* Lista scrollabile dei pesi */}
              <div
                className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                ref={scrollContainerRef}
              >
                <div className="py-20">
                  {WEIGHT_OPTIONS.map((weight) => {
                    const distance = Math.abs(weight - selectedWeight)
                    const isSelected = distance < 0.1
                    const isNear = distance < 0.5

                    return (
                      <div
                        key={weight}
                        className="snap-center h-12 flex items-center justify-center cursor-pointer transition-all duration-200"
                        onClick={() => setSelectedWeight(weight)}
                      >
                        <span
                          className={`transition-all duration-200 ${
                            isSelected
                              ? 'text-teal-400 font-bold text-2xl scale-110'
                              : isNear
                                ? 'text-text-primary text-lg'
                                : 'text-text-tertiary text-sm'
                          }`}
                        >
                          {weight.toFixed(1)}
                        </span>
                        <span
                          className={`ml-1 transition-all duration-200 ${
                            isSelected
                              ? 'text-teal-400/70 font-semibold text-base'
                              : isNear
                                ? 'text-text-secondary text-sm'
                                : 'text-text-tertiary text-xs'
                          }`}
                        >
                          kg
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Peso selezionato con differenza */}
            <div className="mt-4 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                {selectedWeight.toFixed(1)} kg
              </div>
              {progress && (
                <div className="flex items-center justify-center gap-2">
                  {(() => {
                    const diff = selectedWeight - progress.previous
                    const absDiff = Math.abs(diff)
                    if (absDiff < 0.1) return null

                    return (
                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          diff > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        <span>{diff > 0 ? '↑' : '↓'}</span>
                        <span>{absDiff.toFixed(1)} kg</span>
                      </div>
                    )
                  })()}

                  {/* Progresso verso obiettivo */}
                  {remainingToGoal > 0 && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400">
                      <span>🎯</span>
                      <span>{remainingToGoal.toFixed(1)} kg</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Imposta Obiettivo */}
          <div className="mt-4">
            <div className="text-text-secondary text-xs font-medium mb-2 px-2">Obiettivo Peso</div>
            <div className="bg-background-tertiary/30 rounded-xl p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="text-text-primary text-sm mb-1">Peso obiettivo</div>
                  <div className="text-text-tertiary text-xs">Verso cui vuoi arrivare</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Number(e.target.value))}
                    min="40"
                    max="150"
                    step="0.5"
                    className="w-20 px-2 py-1.5 bg-background-secondary border border-teal-500/30 rounded-lg text-teal-400 text-center font-bold focus:border-teal-400 focus:outline-none"
                  />
                  <span className="text-text-secondary text-sm">kg</span>
                </div>
              </div>

              {/* Barra di progresso verso obiettivo */}
              {progress && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-text-tertiary mb-1">
                    <span>Progresso obiettivo</span>
                    <span className="text-teal-400 font-medium">
                      {Math.max(0, Math.min(100, progressToGoal)).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(0, Math.min(100, progressToGoal))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-teal-500/50 text-white hover:bg-teal-500/10 hover:border-teal-400 flex-1"
            >
              Annulla
            </Button>
            <Button
              onClick={handleSaveWeight}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 flex-1"
            >
              ✓ Salva
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
