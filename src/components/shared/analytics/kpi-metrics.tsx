'use client'
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Users, FileText, Clock, Activity } from 'lucide-react'

interface KPIMetricsProps {
  summary: {
    total_workouts: number
    total_documents: number
    total_hours: number
    active_athletes: number
  }
  growth?: {
    workouts_growth: number
    documents_growth: number
    hours_growth: number
  }
}

export const KPIMetrics: React.FC<KPIMetricsProps> = ({ summary, growth }) => {
  const metrics = [
    {
      title: 'Allenamenti Totali',
      value: summary.total_workouts,
      icon: Activity,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/20',
      borderColor: 'border-teal-500/40',
      gradient: 'from-teal-500/20 via-cyan-500/10 to-teal-500/20',
      shadow: 'shadow-teal-500/20',
      growth: growth?.workouts_growth,
    },
    {
      title: 'Documenti Caricati',
      value: summary.total_documents,
      icon: FileText,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/40',
      gradient: 'from-yellow-500/20 via-orange-500/10 to-yellow-500/20',
      shadow: 'shadow-yellow-500/20',
      growth: growth?.documents_growth,
    },
    {
      title: 'Ore Totali',
      value: summary.total_hours.toFixed(1),
      icon: Clock,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/40',
      gradient: 'from-green-500/20 via-emerald-500/10 to-green-500/20',
      shadow: 'shadow-green-500/20',
      growth: growth?.hours_growth,
    },
    {
      title: 'Atleti Attivi',
      value: summary.active_athletes,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/40',
      gradient: 'from-purple-500/20 via-pink-500/10 to-purple-500/20',
      shadow: 'shadow-purple-500/20',
    },
  ]

  const getTrendIcon = (growth?: number) => {
    if (!growth) return <Minus className="w-4 h-4" />
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-success" />
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-error" />
    return <Minus className="w-4 h-4" />
  }

  const getTrendColor = (growth?: number) => {
    if (!growth) return 'text-text-muted'
    if (growth > 0) return 'text-success'
    if (growth < 0) return 'text-error'
    return 'text-text-muted'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative overflow-hidden rounded-xl border-2 ${metric.borderColor} bg-gradient-to-br ${metric.gradient} backdrop-blur-xl shadow-lg ${metric.shadow} hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl ${metric.bgColor} border ${metric.borderColor} shadow-md`}
              >
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              {metric.growth !== undefined && (
                <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-background-secondary/50 border border-border/30">
                  {getTrendIcon(metric.growth)}
                  <span className={`text-sm font-semibold ${getTrendColor(metric.growth)}`}>
                    {metric.growth > 0 ? '+' : ''}
                    {metric.growth.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl font-bold text-white drop-shadow-lg">{metric.value}</h3>
              <p className="text-sm text-text-secondary font-medium">{metric.title}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Componente per metriche di performance atleti
export const PerformanceMetrics: React.FC<{
  performance: Array<{
    athlete_id: string
    athlete_name: string
    total_workouts: number
    avg_duration: number
    completion_rate: number
  }>
}> = ({ performance }) => {
  // useMemo per evitare ri-calcolo ad ogni render
  const topPerformers = useMemo(
    () => performance.sort((a, b) => b.completion_rate - a.completion_rate).slice(0, 5),
    [performance],
  )

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-purple-500/40 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5" />
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <svg
              className="w-5 h-5 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🏆 Top Performers
          </h2>
        </div>
        <div className="space-y-3">
          {topPerformers.map((athlete, index) => (
            <motion.div
              key={athlete.athlete_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 text-yellow-400 border border-yellow-500/40'
                      : index === 1
                        ? 'bg-gradient-to-br from-gray-400/30 to-gray-500/30 text-gray-300 border border-gray-400/40'
                        : index === 2
                          ? 'bg-gradient-to-br from-amber-600/30 to-amber-700/30 text-amber-400 border border-amber-600/40'
                          : 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-500/40'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-white">{athlete.athlete_name}</h4>
                  <p className="text-sm text-text-secondary">
                    {athlete.total_workouts} allenamenti • {athlete.avg_duration}min avg
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{athlete.completion_rate}%</div>
                <div className="text-xs text-text-secondary">completamento</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
