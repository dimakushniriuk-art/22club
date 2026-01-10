'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error boundary per route dinamiche workout day
 * Isola errori in questa route senza buttare giù tutta l'app
 */
export default function WorkoutDayError({ error, reset }: ErrorPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const workoutPlanId = useParams().workout_plan_id as string

  useEffect(() => {
    // Log errore per debugging (solo in dev)
    if (process.env.NODE_ENV === 'development') {
      console.error('WorkoutDayError:', error)
    }
  }, [error])

  const handleReset = () => {
    // Refetch selettivo invece di hard reload
    queryClient.invalidateQueries()
    queryClient.refetchQueries()
    reset() // Reset error boundary
  }

  const handleGoBack = () => {
    if (workoutPlanId) {
      router.push(`/home/allenamenti/${workoutPlanId}`)
    } else {
      router.push('/home/allenamenti')
    }
  }

  const handleGoHome = () => {
    router.push('/home')
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-red-500/40 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <CardTitle className="text-xl text-white">Errore nel caricamento</CardTitle>
          <CardDescription className="text-gray-400">
            Si è verificato un errore durante il caricamento della giornata di allenamento.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error.message && (
            <div className="rounded-md bg-red-500/10 p-3 border border-red-500/20">
              <p className="text-sm font-medium text-red-400 mb-1">Dettagli errore:</p>
              <p className="text-sm text-gray-300 font-mono break-all">{error.message}</p>
            </div>
          )}

          {error.digest && (
            <div className="rounded-md bg-blue-500/10 p-3 border border-blue-500/20">
              <p className="text-sm text-blue-400">
                ID errore: <span className="font-mono">{error.digest}</span>
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleReset}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Riprova
            </Button>

            <Button variant="outline" onClick={handleGoBack} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna al piano
            </Button>

            <Button variant="outline" onClick={handleGoHome} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Torna alla home
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Se il problema persiste, contatta il supporto tecnico.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
