'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Input } from '@/components/ui'

interface RestTimerProps {
  initialSeconds?: number
  onComplete?: () => void
  onNextExercise?: () => void
  className?: string
  title?: string
  subtitle?: string
  color?: 'default' | 'orange-red' // default = brand (teal), orange-red = arancione/quasi rosso
}

export function RestTimer({
  initialSeconds = 60,
  onComplete,
  onNextExercise,
  className = '',
  title = 'Timer Recupero',
  subtitle = 'Riposati prima del prossimo esercizio',
  color = 'default',
}: RestTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [customSeconds, setCustomSeconds] = useState(initialSeconds)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Calcola la percentuale per l'animazione del cerchio
  const progress = ((initialSeconds - seconds) / initialSeconds) * 100
  const circumference = 2 * Math.PI * 45 // raggio 45px
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Formatta il tempo in MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Avvia il timer
  const startTimer = () => {
    setIsRunning(true)
    setIsCompleted(false)
    setSeconds(customSeconds)
  }

  // Pausa il timer
  const pauseTimer = () => {
    setIsRunning(false)
  }

  // Reset del timer
  const resetTimer = () => {
    setIsRunning(false)
    setIsCompleted(false)
    setSeconds(customSeconds)
  }

  // Effetto per il countdown
  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsCompleted(true)
            onComplete?.()

            // Vibrazione se supportata
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200])
            }

            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, seconds, onComplete])

  // Cleanup al unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <Card className={`mx-auto w-full max-w-md ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-6 text-center">
          {/* Titolo */}
          <div>
            <h3 className="text-text-primary text-lg font-semibold">{title}</h3>
            <p className="text-text-secondary text-sm">
              {isCompleted ? `${title} completato!` : subtitle}
            </p>
          </div>

          {/* Cerchio animato */}
          <div className="relative mx-auto h-32 w-32">
            <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
              {/* Cerchio di sfondo */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-background-tertiary"
              />
              {/* Cerchio di progresso */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-1000 ease-linear ${
                  isCompleted
                    ? 'text-state-valid'
                    : color === 'orange-red'
                      ? 'text-orange-600'
                      : 'text-brand'
                }`}
                strokeLinecap="round"
              />
            </svg>

            {/* Tempo al centro */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    isCompleted ? 'text-state-valid' : 'text-text-primary'
                  }`}
                >
                  {formatTime(seconds)}
                </div>
                {isCompleted && <div className="text-state-valid text-sm font-medium">💪</div>}
              </div>
            </div>
          </div>

          {/* Controlli */}
          {!isCompleted && (
            <div className="space-y-4">
              {/* Input per secondi personalizzati */}
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(Number(e.target.value))}
                  className="w-20 text-center"
                  min="10"
                  max="600"
                  disabled={isRunning}
                />
                <span className="text-text-secondary text-sm">secondi</span>
              </div>

              {/* Pulsanti */}
              <div className="flex justify-center gap-2">
                {!isRunning ? (
                  <Button
                    onClick={startTimer}
                    className={
                      color === 'orange-red'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-brand hover:bg-brand/90'
                    }
                  >
                    {seconds === customSeconds ? 'Avvia' : 'Riavvia'}
                  </Button>
                ) : (
                  <Button
                    onClick={pauseTimer}
                    variant="outline"
                    className={
                      color === 'orange-red'
                        ? 'border-orange-600 text-orange-600 hover:bg-orange-600/10'
                        : 'border-brand text-brand hover:bg-brand/10'
                    }
                  >
                    Pausa
                  </Button>
                )}

                <Button onClick={resetTimer} variant="ghost" disabled={isRunning}>
                  Reset
                </Button>
              </div>
            </div>
          )}

          {/* Messaggio di completamento */}
          {isCompleted && (
            <div className="space-y-4">
              <Badge variant="success" size="lg" className="text-sm">
                Recupero terminato! 💪
              </Badge>

              {onNextExercise && (
                <Button onClick={onNextExercise} className="bg-brand hover:bg-brand/90 w-full">
                  Passa al prossimo esercizio
                </Button>
              )}

              <Button onClick={resetTimer} variant="outline" className="w-full">
                Nuovo timer
              </Button>
            </div>
          )}

          {/* Suggerimenti */}
          {!isCompleted && !isRunning && (
            <div className="text-text-tertiary space-y-1 text-xs">
              <p>💡 Usa questo tempo per:</p>
              <p>• Bere acqua</p>
              <p>• Respirare profondamente</p>
              <p>• Preparare il prossimo esercizio</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
