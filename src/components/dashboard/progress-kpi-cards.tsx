'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Zap,
  Flame,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import type { ProgressKPI } from '@/hooks/use-progress-analytics'
import { getValueRange, getRangeColor } from '@/lib/constants/progress-ranges'

interface ProgressKPICardsProps {
  data: ProgressKPI | undefined
  loading: boolean
}

export function ProgressKPICards({ data, loading }: ProgressKPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} variant="trainer" className="border-teal-500/30 bg-transparent">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card
          variant="trainer"
          className="col-span-full border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 hover:border-teal-400/60 transition-all duration-300"
        >
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 text-5xl opacity-50">📊</div>
              <p className="text-text-secondary text-base font-medium">
                Nessun dato di progresso disponibile
              </p>
              <p className="text-text-tertiary text-sm mt-2">
                Inizia a tracciare il tuo peso per vedere i cambiamenti!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getWeightChangeIcon = (change: number | null) => {
    if (change === null) return <Minus className="text-text-tertiary h-4 w-4" />
    if (change > 0) return <TrendingUp className="text-state-success h-4 w-4" />
    if (change < 0) return <TrendingDown className="text-state-error h-4 w-4" />
    return <Minus className="text-text-tertiary h-4 w-4" />
  }

  const getWeightChangeText = (change: number | null) => {
    if (change === null) return 'N/A'
    if (change > 0) return `+${change.toFixed(1)}kg`
    if (change < 0) return `${change.toFixed(1)}kg`
    return '0kg'
  }

  const getWeightChangeColor = (change: number | null) => {
    if (change === null) return 'secondary'
    if (change > 0) return 'success'
    if (change < 0) return 'error'
    return 'secondary'
  }

  const getMotivationalMessage = () => {
    if (data.variazionePeso7gg !== null && data.variazionePeso7gg < 0) {
      return `Hai perso ${Math.abs(data.variazionePeso7gg).toFixed(1)}kg questa settimana! 🔥`
    }
    if (data.streak > 0) {
      return `Streak attivo: ${data.streak} giorni consecutivi 🎯`
    }
    if (data.percentualeCompletamento >= 80) {
      return `Hai completato il ${data.percentualeCompletamento}% delle schede di questo mese ✅`
    }
    return 'Continua così! 💪'
  }

  return (
    <div className="space-y-6">
      {/* Motivational message - Migliorata visivamente con animazione */}
      <div className="group relative overflow-hidden rounded-xl border border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 p-6 shadow-lg shadow-teal-500/10 transition-all duration-300 hover:border-teal-400/60 hover:shadow-teal-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
            <Zap className="h-5 w-5 text-teal-400" />
          </div>
          <p className="bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-lg font-bold text-transparent">
            {getMotivationalMessage()}
          </p>
        </div>
      </div>

      {/* KPI Cards - Migliorate visivamente con animazioni */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Peso Attuale */}
        {(() => {
          const pesoRange = getValueRange('valoriPrincipali', 'peso_kg')
          const pesoColor = data.pesoAttuale
            ? getRangeColor('valoriPrincipali', 'peso_kg', data.pesoAttuale)
            : 'default'
          const isInRange =
            pesoRange && data.pesoAttuale
              ? data.pesoAttuale >= pesoRange.min && data.pesoAttuale <= pesoRange.max
              : null

          return (
            <Card
              variant="trainer"
              className={`group relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 transition-all duration-300 hover:scale-[1.02] hover:border-teal-400/50 hover:shadow-xl hover:shadow-teal-500/30 ${
                pesoColor === 'error'
                  ? 'border-red-500/40 hover:border-red-400/60 hover:shadow-red-500/20'
                  : pesoColor === 'warning'
                    ? 'border-yellow-500/40 hover:border-yellow-400/60 hover:shadow-yellow-500/20'
                    : ''
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle size="sm" className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-teal-500/20 group-hover:bg-teal-500/30 transition-colors">
                      <Target className="text-teal-400 h-4 w-4" />
                    </div>
                    Peso Attuale
                  </div>
                  {data.pesoAttuale && isInRange !== null && (
                    <div className="flex items-center gap-1">
                      {isInRange ? (
                        <CheckCircle2
                          className="h-3.5 w-3.5 text-state-success"
                          aria-label="Valore nel range ottimale"
                        />
                      ) : (
                        <AlertTriangle
                          className="h-3.5 w-3.5 text-state-error"
                          aria-label="Valore fuori range"
                        />
                      )}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-teal-400 mb-2 text-3xl font-bold">
                  {data.pesoAttuale ? `${data.pesoAttuale}kg` : 'N/A'}
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  {getWeightChangeIcon(data.variazionePeso7gg)}
                  <span className="text-text-secondary text-xs">
                    {getWeightChangeText(data.variazionePeso7gg)} ultimi 7gg
                  </span>
                </div>
                {pesoRange && data.pesoAttuale && (
                  <div className="text-text-tertiary text-xs">
                    Range: {pesoRange.min}-{pesoRange.max}kg
                    {pesoRange.note && ` (${pesoRange.note})`}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })()}

        {/* Variazione Peso */}
        <Card
          variant="trainer"
          className="group relative overflow-hidden border-green-500/30 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/5 transition-all duration-300 hover:scale-[1.02] hover:border-green-400/50 hover:shadow-xl hover:shadow-green-500/30"
        >
          <CardHeader className="pb-2">
            <CardTitle size="sm" className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <TrendingUp className="text-green-400 h-4 w-4" />
              </div>
              Variazione 7gg
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-green-400 mb-2 text-3xl font-bold">
              {data.variazionePeso7gg !== null
                ? `${data.variazionePeso7gg > 0 ? '+' : ''}${data.variazionePeso7gg.toFixed(1)}kg`
                : 'N/A'}
            </div>
            <Badge
              variant={getWeightChangeColor(data.variazionePeso7gg)}
              size="sm"
              className="shadow-md"
            >
              {data.variazionePeso7gg !== null
                ? data.variazionePeso7gg > 0
                  ? 'In aumento'
                  : 'In diminuzione'
                : 'Nessun dato'}
            </Badge>
          </CardContent>
        </Card>

        {/* Forza Massima */}
        <Card
          variant="trainer"
          className="group relative overflow-hidden border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/5 transition-all duration-300 hover:scale-[1.02] hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-500/30"
        >
          <CardHeader className="pb-2">
            <CardTitle size="sm" className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                <Zap className="text-orange-400 h-4 w-4" />
              </div>
              Forza Massima
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-orange-400 mb-2 text-3xl font-bold">
              {data.forzaMassima ? `${data.forzaMassima}kg` : 'N/A'}
            </div>
            <p className="text-text-secondary text-xs">
              {data.forzaMassima ? 'Nuovo record! 💪' : 'Nessun dato'}
            </p>
          </CardContent>
        </Card>

        {/* Completamento Schede */}
        <Card
          variant="trainer"
          className="group relative overflow-hidden border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/5 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/30"
        >
          <CardHeader className="pb-2">
            <CardTitle size="sm" className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                <Target className="text-cyan-400 h-4 w-4" />
              </div>
              Schede Completate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-cyan-400 mb-2 text-3xl font-bold">
              {data.percentualeCompletamento}%
            </div>
            <p className="text-text-secondary text-xs">Ultimi 30gg</p>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card
          variant="trainer"
          className="group relative overflow-hidden border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/5 transition-all duration-300 hover:scale-[1.02] hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-500/30"
        >
          <CardHeader className="pb-2">
            <CardTitle size="sm" className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                <Flame className="text-orange-400 h-4 w-4" />
              </div>
              Streak Allenamenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-orange-400 mb-2 text-3xl font-bold">{data.streak} giorni</div>
            <p className="text-text-secondary text-xs">
              {data.streak > 0 ? 'Continua così! 🔥' : 'Inizia oggi! 💪'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
