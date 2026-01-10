'use client'

import { Card, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import { TrendingUp, CreditCard, Euro } from 'lucide-react'

interface PaymentsKPICardsProps {
  totalRevenue: number
  totalLessons: number
  totalPayments: number
  totalReversals: number
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

  const getRevenueColor = (amount: number) => {
    if (amount >= 1000) return 'success'
    if (amount >= 500) return 'warning'
    return 'error'
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-green-500/30 shadow-lg shadow-green-500/10 backdrop-blur-xl hover:border-green-400/50 transition-all duration-200"
        style={{ animationDelay: '100ms' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Entrate Mensili</p>
              <p className="text-text-primary text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="bg-green-500/20 text-green-400 rounded-full p-3">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <Badge
            variant={getRevenueColor(totalRevenue) as 'success' | 'warning' | 'error'}
            size="sm"
            className="mt-2"
          >
            {totalPayments} pagamenti
          </Badge>
        </CardContent>
      </Card>

      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
        style={{ animationDelay: '200ms' }}
      >
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Lezioni Vendute</p>
              <p className="text-text-primary text-2xl font-bold">{totalLessons}</p>
            </div>
            <div className="bg-blue-500/20 text-blue-400 rounded-full p-3">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
          <p className="text-text-tertiary mt-2 text-xs">Questo mese</p>
        </CardContent>
      </Card>

      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-purple-500/30 shadow-lg shadow-purple-500/10 backdrop-blur-xl hover:border-purple-400/50 transition-all duration-200"
        style={{ animationDelay: '300ms' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">Pagamenti Totali</p>
              <p className="text-text-primary text-2xl font-bold">
                {totalPayments + totalReversals}
              </p>
            </div>
            <div className="bg-purple-500/20 text-purple-400 rounded-full p-3">
              <Euro className="h-6 w-6" />
            </div>
          </div>
          <p className="text-text-tertiary mt-2 text-xs">Di cui {totalReversals} storni</p>
        </CardContent>
      </Card>
    </div>
  )
}
