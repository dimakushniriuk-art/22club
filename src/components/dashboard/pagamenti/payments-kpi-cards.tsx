'use client'

import { MetricCard } from '@/components'
import { TrendingUp, CreditCard, Euro } from 'lucide-react'

interface PaymentsKPICardsProps {
  totalRevenue: number
  totalLessons: number
  totalPayments: number
  totalReversals: number
}

function getRevenueStatus(amount: number): 'success' | 'warning' | 'error' {
  if (amount >= 1000) return 'success'
  if (amount >= 500) return 'warning'
  return 'error'
}

export function PaymentsKPICards({
  totalRevenue,
  totalLessons,
  totalPayments,
  totalReversals,
}: PaymentsKPICardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard
        title="Entrate Mensili"
        value={formatCurrency(totalRevenue)}
        icon={<TrendingUp className="h-5 w-5" />}
        tone="emerald"
        variant="trainer"
        animationDelay="100ms"
        status={getRevenueStatus(totalRevenue)}
        statusText={`${totalPayments} pagamenti`}
      />
      <MetricCard
        title="Lezioni Vendute"
        value={totalLessons}
        icon={<CreditCard className="h-5 w-5" />}
        tone="blue"
        variant="trainer"
        animationDelay="200ms"
        status="info"
        statusText="Questo mese"
      />
      <MetricCard
        title="Pagamenti Totali"
        value={totalPayments + totalReversals}
        icon={<Euro className="h-5 w-5" />}
        tone="purple"
        variant="trainer"
        animationDelay="300ms"
        status="info"
        statusText={`Di cui ${totalReversals} storni`}
      />
    </div>
  )
}
