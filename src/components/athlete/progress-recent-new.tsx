'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { BarChartIcon } from '@/components/ui/professional-icons'
import { ApiState, SectionSkeleton } from '@/components/ui/api-state'
import { useProgressAnalytics } from '@/hooks/use-progress-analytics'
import { useAuth } from '@/providers/auth-provider'
import { Weight } from 'lucide-react'
import Link from 'next/link'

export function ProgressRecent() {
  const { user } = useAuth()
  const { data, isLoading: loading, error, refetch } = useProgressAnalytics(user?.id || null)

  return (
    <ApiState
      loading={loading}
      error={error?.message || (error ? 'Errore nel caricamento dei progressi' : null)}
      onRetry={() => refetch?.()}
      skeleton={<SectionSkeleton />}
    >
      {!data ? (
        <Card variant="default">
          <CardHeader>
            <CardTitle size="md" className="flex items-center gap-2">
              <Weight className="text-brand h-5 w-5" />
              Progressi Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <div className="mb-2 flex justify-center">
                <BarChartIcon size={32} className="text-teal-400" />
              </div>
              <p className="text-text-primary font-medium mb-2">Nessun dato di progresso</p>
              <p className="text-text-secondary text-sm mb-4">
                Inizia a tracciare il tuo peso per vedere i cambiamenti!
              </p>
              <Link href="/home/progressi">
                <Button size="sm" variant="primary">
                  Inizia a tracciare
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card variant="default">
          <CardHeader>
            <CardTitle size="md" className="flex items-center gap-2">
              <Weight className="text-brand h-5 w-5" />
              Progressi Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  <Button size="sm" variant="outline" className="w-full">
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
