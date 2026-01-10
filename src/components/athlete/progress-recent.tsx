'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { useIcon } from '@/components/ui/professional-icons'
import { ApiState, SectionSkeleton } from '@/components/ui/api-state'
import { useProgressAnalytics } from '@/hooks/use-progress-analytics'
import { useAuth } from '@/providers/auth-provider'
import { Weight } from 'lucide-react'
import Link from 'next/link'

export function ProgressRecent() {
  const { user } = useAuth()
  const { data, isLoading: loading, error, refetch } = useProgressAnalytics(user?.id || null)

  // Prepara le icone
  const chartIcon = useIcon('📊', { size: 32, className: 'text-teal-400' })

  return (
    <ApiState
      loading={loading}
      error={error?.message || (error ? 'Errore nel caricamento dei progressi' : null)}
      onRetry={() => refetch?.()}
      skeleton={<SectionSkeleton />}
    >
      {!data ? (
        <Card className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <CardHeader className="relative">
            <CardTitle
              size="md"
              className="flex items-center gap-2 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
            >
              <Weight className="text-teal-400 h-5 w-5" />
              Progressi Recenti
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="py-8 text-center">
              <div className="mb-2 flex justify-center">{chartIcon}</div>
              <p className="text-text-primary font-medium mb-2">Nessun dato di progresso</p>
              <p className="text-text-secondary text-sm mb-4">
                Inizia a tracciare il tuo peso per vedere i cambiamenti!
              </p>
              <Link href="/home/progressi">
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-105 transition-all duration-200"
                >
                  Inizia a tracciare
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <CardHeader className="relative">
            <CardTitle
              size="md"
              className="flex items-center gap-2 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
            >
              <Weight className="text-teal-400 h-5 w-5" />
              Progressi Recenti
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-text-primary">
                    {data.ultimiProgressi?.length || 0}
                  </p>
                  <p className="text-xs text-text-secondary">Misurazioni</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-text-primary">
                    {data.pesoAttuale ? `${data.pesoAttuale.toFixed(1)}kg` : 'N/A'}
                  </p>
                  <p className="text-xs text-text-secondary">Peso medio</p>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/home/progressi">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-105 transition-all duration-200"
                  >
                    Vedi tutti i progressi
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </ApiState>
  )
}
