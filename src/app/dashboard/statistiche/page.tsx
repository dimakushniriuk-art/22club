import { getAnalyticsData, calculateGrowthMetrics } from '@/lib/analytics'
import { StatistichePageContent } from '@/components/dashboard/statistiche-page-content'

export default async function StatistichePage() {
  const data = await getAnalyticsData()
  const growth = calculateGrowthMetrics(data.trend)

  return <StatistichePageContent data={data} growth={growth} />
}
