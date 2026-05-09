export type StatsPeriod = 'week' | 'month' | '6months' | 'year'

export type StatisticheViewTab = 'trainer' | 'legacy'

export const STATS_PERIODS: { id: StatsPeriod; label: string; days: number }[] = [
  { id: 'week', label: 'Settimana', days: 7 },
  { id: 'month', label: 'Mese', days: 30 },
  { id: '6months', label: '6 mesi', days: 183 },
  { id: 'year', label: 'Anno', days: 365 },
]
