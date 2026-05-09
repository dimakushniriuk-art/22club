'use client'

import { MetricCard } from '@/components'
import { Card, CardContent } from '@/components/ui'
import { TrendingUp, TrendingDown, Minus, Target, Zap, Flame } from 'lucide-react'
import type { ProgressKPI } from '@/hooks/use-progress-analytics'
import { getValueRange, getRangeColor } from '@/lib/constants/progress-ranges'
import { cn } from '@/lib/utils'

interface ProgressKPICardsProps {
  data: ProgressKPI | undefined
  loading: boolean
}

export function ProgressKPICards({ data, loading }: ProgressKPICardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <MetricCard
            key={i}
            variant="trainer"
            tone="teal"
            title=" "
            value={0}
            icon={<Target className="h-4 w-4" aria-hidden />}
            loading
          />
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

  const weightChangeTrend = (change: number | null): 'up' | 'down' | 'neutral' | undefined => {
    if (change === null) return undefined
    if (change > 0) return 'up'
    if (change < 0) return 'down'
    return 'neutral'
  }

  const variazioneStatusFromBadge = (
    change: number | null,
  ): 'success' | 'error' | 'info' | undefined => {
    if (change === null) return 'info'
    const c = getWeightChangeColor(change)
    if (c === 'success') return 'success'
    if (c === 'error') return 'error'
    return 'info'
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

  const pesoRange = getValueRange('valoriPrincipali', 'peso_kg')
  const pesoColor = data.pesoAttuale
    ? getRangeColor('valoriPrincipali', 'peso_kg', data.pesoAttuale)
    : 'default'
  const isInRange =
    pesoRange && data.pesoAttuale
      ? data.pesoAttuale >= pesoRange.min && data.pesoAttuale <= pesoRange.max
      : null

  const pesoStatus: 'success' | 'error' | undefined =
    data.pesoAttuale && isInRange !== null ? (isInRange ? 'success' : 'error') : undefined
  const pesoStatusText =
    data.pesoAttuale && isInRange !== null ? (isInRange ? 'Nel range' : 'Fuori range') : undefined

  const variazioneStatusText =
    data.variazionePeso7gg !== null
      ? data.variazionePeso7gg > 0
        ? 'In aumento'
        : 'In diminuzione'
      : 'Nessun dato'

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
        <div className="relative h-full min-h-[140px]">
          <MetricCard
            variant="trainer"
            tone="teal"
            title="Peso Attuale"
            value={data.pesoAttuale ? `${data.pesoAttuale}kg` : 'N/A'}
            icon={<Target className="h-4 w-4" aria-hidden />}
            trend={weightChangeTrend(data.variazionePeso7gg)}
            status={pesoStatus}
            statusText={pesoStatusText}
            className={cn(
              'group relative overflow-hidden border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 transition-all duration-300 hover:scale-[1.02] hover:border-teal-400/50 hover:shadow-xl hover:shadow-teal-500/30 !pb-16',
              pesoColor === 'error' &&
                'border-red-500/40 hover:border-red-400/60 hover:shadow-red-500/20',
              pesoColor === 'warning' &&
                'border-yellow-500/40 hover:border-yellow-400/60 hover:shadow-yellow-500/20',
            )}
          />
          <div className="pointer-events-none absolute bottom-3 left-4 right-14 z-[1] flex flex-col gap-0.5 text-xs">
            <div className="flex items-center gap-1.5 text-text-secondary">
              {getWeightChangeIcon(data.variazionePeso7gg)}
              <span>{getWeightChangeText(data.variazionePeso7gg)} ultimi 7gg</span>
            </div>
            {pesoRange && data.pesoAttuale ? (
              <div className="text-text-tertiary">
                Range: {pesoRange.min}-{pesoRange.max}kg
                {pesoRange.note ? ` (${pesoRange.note})` : ''}
              </div>
            ) : null}
          </div>
          {data.pesoAttuale && isInRange !== null ? (
            <span className="sr-only">
              {isInRange ? 'Valore nel range ottimale' : 'Valore fuori range'}
            </span>
          ) : null}
        </div>

        {/* Variazione Peso */}
        <MetricCard
          variant="trainer"
          tone="emerald"
          title="Variazione 7gg"
          value={
            data.variazionePeso7gg !== null
              ? `${data.variazionePeso7gg > 0 ? '+' : ''}${data.variazionePeso7gg.toFixed(1)}kg`
              : 'N/A'
          }
          icon={<TrendingUp className="h-4 w-4" aria-hidden />}
          trend={weightChangeTrend(data.variazionePeso7gg)}
          status={variazioneStatusFromBadge(data.variazionePeso7gg)}
          statusText={variazioneStatusText}
          className="group relative overflow-hidden border-green-500/30 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/5 transition-all duration-300 hover:scale-[1.02] hover:border-green-400/50 hover:shadow-xl hover:shadow-green-500/30"
        />

        {/* Forza Massima */}
        <div className="relative h-full min-h-[140px]">
          <MetricCard
            variant="trainer"
            tone="amber"
            title="Forza Massima"
            value={data.forzaMassima ? `${data.forzaMassima}kg` : 'N/A'}
            icon={<Zap className="h-4 w-4" aria-hidden />}
            className="group relative overflow-hidden border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/5 transition-all duration-300 hover:scale-[1.02] hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-500/30 !pb-11"
          />
          <p className="pointer-events-none absolute bottom-3 left-4 right-14 z-[1] text-text-secondary text-xs">
            {data.forzaMassima ? 'Nuovo record! 💪' : 'Nessun dato'}
          </p>
        </div>

        {/* Completamento Schede */}
        <div className="relative h-full min-h-[140px]">
          <MetricCard
            variant="trainer"
            tone="blue"
            title="Schede Completate"
            value={`${data.percentualeCompletamento}%`}
            icon={<Target className="h-4 w-4" aria-hidden />}
            className="group relative overflow-hidden border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/5 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/30 !pb-11"
          />
          <p className="pointer-events-none absolute bottom-3 left-4 right-14 z-[1] text-text-secondary text-xs">
            Ultimi 30gg
          </p>
        </div>

        {/* Streak */}
        <div className="relative h-full min-h-[140px]">
          <MetricCard
            variant="trainer"
            tone="amber"
            title="Streak Allenamenti"
            value={`${data.streak} giorni`}
            icon={<Flame className="h-4 w-4" aria-hidden />}
            className="group relative overflow-hidden border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/5 transition-all duration-300 hover:scale-[1.02] hover:border-orange-400/50 hover:shadow-xl hover:shadow-orange-500/30 !pb-11"
          />
          <p className="pointer-events-none absolute bottom-3 left-4 right-14 z-[1] text-text-secondary text-xs">
            {data.streak > 0 ? 'Continua così! 🔥' : 'Inizia oggi! 💪'}
          </p>
        </div>
      </div>
    </div>
  )
}
