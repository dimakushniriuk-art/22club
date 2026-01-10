'use client'

// Componente per loading state durante la navigazione

import { useEffect, useState } from 'react'
import { Loader2, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { Progress } from '@/components/ui'

interface NavigationLoadingProps {
  isLoading: boolean
  loadingDuration: number
  isSlow?: boolean
  targetPath?: string
  className?: string
}

export function NavigationLoading({
  isLoading,
  loadingDuration,
  isSlow = false,
  targetPath,
  className = '',
}: NavigationLoadingProps) {
  const [progress, setProgress] = useState(0)

  // Simula progress bar durante il loading
  useEffect(() => {
    if (!isLoading) {
      setProgress(0)
      return
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90 // Non arrivare mai al 100% fino al completamento
        return prev + Math.random() * 10
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center ${className}`}
    >
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            {/* Icona di loading */}
            <div className="relative">
              <Loader2 className="h-12 w-12 text-teal-500 animate-spin" />
              {isSlow && (
                <div className="absolute -top-2 -right-2">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                </div>
              )}
            </div>

            {/* Testo principale */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-text-primary">
                {isSlow ? 'Navigazione lenta' : 'Caricamento...'}
              </h3>
              <p className="text-sm text-text-secondary">
                {targetPath ? `Caricamento ${targetPath}` : 'Preparazione della pagina'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-text-tertiary">
                <span>{Math.round(progress)}%</span>
                <span>{Math.round(loadingDuration / 1000)}s</span>
              </div>
            </div>

            {/* Messaggio per navigazione lenta */}
            {isSlow && (
              <div className="flex items-center space-x-2 text-orange-600 text-sm">
                <Clock className="h-4 w-4" />
                <span>La navigazione sta impiegando più tempo del solito</span>
              </div>
            )}

            {/* Suggerimenti per navigazione lenta */}
            {isSlow && loadingDuration > 5000 && (
              <div className="text-xs text-text-tertiary space-y-1">
                <p>Suggerimenti:</p>
                <ul className="text-left space-y-1">
                  <li>• Verifica la connessione internet</li>
                  <li>• Ricarica la pagina se necessario</li>
                  <li>• Contatta il supporto se il problema persiste</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente per loading state minimale (solo spinner)
export function NavigationSpinner({
  isLoading,
  className = '',
}: {
  isLoading: boolean
  className?: string
}) {
  if (!isLoading) return null

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <Loader2 className="h-5 w-5 text-teal-500 animate-spin" />
      </div>
    </div>
  )
}

// Componente per loading state nella sidebar
export function SidebarNavigationLoading({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-10">
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
        <span className="text-xs text-text-secondary">Caricamento...</span>
      </div>
    </div>
  )
}
