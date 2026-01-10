'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { statsCache } from '@/lib/cache/cache-strategies'

const logger = createLogger('hooks:use-payments-stats')

// const STATS_CACHE_TTL_MS = 2 * 60 * 1000 // 2 minuti (non utilizzato)

interface PaymentsStats {
  totalRevenue: number
  totalLessons: number
  totalPayments: number
}

interface UsePaymentsStatsOptions {
  year?: number
  month?: number
  useRPC?: boolean // Se true, usa RPC invece di calcolo client-side
}

export function usePaymentsStats(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payments?: any[], // Opzionale per backward compatibility
  options: UsePaymentsStatsOptions = {},
): PaymentsStats {
  const [stats, setStats] = useState<PaymentsStats>({
    totalRevenue: 0,
    totalLessons: 0,
    totalPayments: 0,
  })
  // Nota: loading potrebbe essere usato in futuro per loading states
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const { year, month, useRPC = true } = options

  const currentYear = year ?? new Date().getFullYear()
  const currentMonth = month ?? new Date().getMonth() + 1 // getMonth() è 0-based

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)

      // Controlla cache
      const cacheKey = `payments-stats:${currentYear}:${currentMonth}`
      const cached = statsCache.get<PaymentsStats>(cacheKey)
      if (cached) {
        setStats(cached)
        setLoading(false)
        return
      }

      // Prova con RPC se abilitato
      if (useRPC) {
        try {
          // Workaround necessario per tipizzazione Supabase RPC
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: rpcData, error: rpcError } = await (supabase.rpc as any)(
            'get_monthly_revenue',
            {
              p_year: currentYear,
              p_month: currentMonth,
            },
          )

          type RevenueRpcRow = {
            total_revenue: number
            total_payments: number
            total_lessons_sold: number
            [key: string]: unknown
          }
          const typedRpcData = (rpcData as RevenueRpcRow[]) || []

          if (!rpcError && typedRpcData && Array.isArray(typedRpcData) && typedRpcData.length > 0) {
            const result = typedRpcData[0] as {
              total_revenue: number
              total_payments: number
              total_lessons_sold: number
            }

            const statsData: PaymentsStats = {
              totalRevenue: Number(result.total_revenue) || 0,
              totalLessons: Number(result.total_lessons_sold) || 0,
              totalPayments: Number(result.total_payments) || 0,
            }

            // Salva in cache (TTL gestito internamente)
            statsCache.set(cacheKey, statsData)
            setStats(statsData)
            setLoading(false)
            return
          }
        } catch (rpcErr) {
          logger.warn('RPC get_monthly_revenue failed, using fallback', rpcErr, {
            year: currentYear,
            month: currentMonth,
          })
        }
      }

      // Fallback: calcolo client-side se payments è fornito
      if (payments && payments.length > 0) {
        const monthlyPayments = payments.filter((payment) => {
          const paymentDate = new Date(payment.created_at || payment.payment_date)
          return (
            !payment.is_reversal &&
            paymentDate.getMonth() + 1 === currentMonth &&
            paymentDate.getFullYear() === currentYear
          )
        })

        const statsData: PaymentsStats = {
          totalRevenue: monthlyPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
          totalLessons: monthlyPayments.reduce(
            (sum, payment) => sum + (payment.lessons_purchased || 0),
            0,
          ),
          totalPayments: monthlyPayments.length,
        }

        // Salva in cache anche il fallback (TTL gestito internamente)
        statsCache.set(cacheKey, statsData)
        setStats(statsData)
      } else {
        // Nessun dato disponibile
        setStats({
          totalRevenue: 0,
          totalLessons: 0,
          totalPayments: 0,
        })
      }
    } catch (err) {
      logger.error('Error fetching payments stats', err, { year: currentYear, month: currentMonth })
      setStats({
        totalRevenue: 0,
        totalLessons: 0,
        totalPayments: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, currentYear, currentMonth, useRPC, payments])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return stats
}
