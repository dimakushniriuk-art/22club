'use client'

import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react'

interface ApiStateProps {
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  children: React.ReactNode
  skeleton?: React.ReactNode
}

export function ApiState({ loading, error, onRetry, children, skeleton }: ApiStateProps) {
  if (loading) {
    if (skeleton) {
      return <>{skeleton}</>
    }

    return (
      <Card variant="elevated">
        <CardContent padding="md" className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card variant="outlined" className="border-yellow-200 bg-yellow-50">
        <CardContent padding="md" className="text-center space-y-3">
          <div className="flex justify-center">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <p className="font-medium text-yellow-800">Errore di caricamento</p>
            <p className="text-sm text-yellow-600 mt-1">{error}</p>
          </div>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Riprova
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}

// Loading skeleton specifico per sezioni
export function SectionSkeleton() {
  return (
    <Card variant="elevated">
      <CardContent padding="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

// Error state per network offline
export function OfflineError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card variant="outlined" className="border-gray-200">
      <CardContent padding="md" className="text-center space-y-3">
        <div className="flex justify-center">
          <WifiOff className="h-8 w-8 text-gray-500" />
        </div>
        <div>
          <p className="font-medium text-gray-700">Connessione non disponibile</p>
          <p className="text-sm text-gray-500 mt-1">
            Controlla la tua connessione internet e riprova
          </p>
        </div>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Riprova
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
