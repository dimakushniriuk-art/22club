import {
  STATS_PERIODS,
  type StatsPeriod,
} from '@/components/dashboard/statistiche-constants'
import type { AnalyticsData, TrendData } from '@/lib/analytics'

export const EMPTY_STAFF_LEGACY_ANALYTICS: AnalyticsData = {
  trend: [],
  distribution: [],
  performance: [],
  summary: {
    total_workouts: 0,
    total_documents: 0,
    total_hours: 0,
    active_athletes: 0,
  },
}

export function calculateStaffStatisticheGrowthMetrics(trend: TrendData[]) {
  if (trend.length < 2) {
    return {
      workouts_growth: 0,
      documents_growth: 0,
      hours_growth: 0,
    }
  }

  const firstHalf = trend.slice(0, Math.floor(trend.length / 2))
  const secondHalf = trend.slice(Math.floor(trend.length / 2))

  const firstWorkouts = firstHalf.reduce((sum, d) => sum + d.allenamenti, 0)
  const secondWorkouts = secondHalf.reduce((sum, d) => sum + d.allenamenti, 0)
  const workouts_growth =
    firstWorkouts > 0 ? ((secondWorkouts - firstWorkouts) / firstWorkouts) * 100 : 0

  const firstDocuments = firstHalf.reduce((sum, d) => sum + d.documenti, 0)
  const secondDocuments = secondHalf.reduce((sum, d) => sum + d.documenti, 0)
  const documents_growth =
    firstDocuments > 0 ? ((secondDocuments - firstDocuments) / firstDocuments) * 100 : 0

  const firstHours = firstHalf.reduce((sum, d) => sum + d.ore_totali, 0)
  const secondHours = secondHalf.reduce((sum, d) => sum + d.ore_totali, 0)
  const hours_growth = firstHours > 0 ? ((secondHours - firstHours) / firstHours) * 100 : 0

  return {
    workouts_growth: Math.round(workouts_growth * 10) / 10,
    documents_growth: Math.round(documents_growth * 10) / 10,
    hours_growth: Math.round(hours_growth * 10) / 10,
  }
}

export function staffStatisticheDaysForPeriod(period: StatsPeriod): number {
  const found = STATS_PERIODS.find((p) => p.id === period)
  return found?.days ?? 30
}

export function staffStatisticheBoundariesForPeriod(rangeDays: number): { start: Date; end: Date } {
  const days = Math.max(1, Math.min(rangeDays, 366 * 2))
  const endBoundary = new Date()
  endBoundary.setHours(23, 59, 59, 999)
  const startBoundary = new Date()
  startBoundary.setDate(endBoundary.getDate() - (days - 1))
  startBoundary.setHours(0, 0, 0, 0)
  return { start: startBoundary, end: endBoundary }
}
