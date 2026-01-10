'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import type { Payment } from '@/types/payment'

const logger = createLogger('hooks:use-payments')

const PAYMENTS_PER_PAGE = 100 // Soglia per attivare paginazione

interface UsePaymentsProps {
  userId?: string | null
  role?: string | null
  page?: number
  pageSize?: number
  enablePagination?: boolean
}

interface UsePaymentsReturn {
  payments: Payment[]
  loading: boolean
  error: string | null
  totalCount: number
  hasMore: boolean
  currentPage: number
  totalPages: number
  fetchPayments: () => Promise<void>
  loadPage: (page: number) => Promise<void>
  createPayment: (
    paymentData: Omit<
      Payment,
      'id' | 'created_at' | 'updated_at' | 'athlete_name' | 'created_by_staff_name'
    >,
  ) => Promise<Payment>
  reversePayment: (paymentId: string, reason: string) => Promise<Payment>
  getStats: () => {
    totalRevenue: number
    totalLessons: number
    totalPayments: number
    allPayments: number
  }
}

export function usePayments({
  userId,
  role,
  page: initialPage = 0,
  pageSize = PAYMENTS_PER_PAGE,
  enablePagination = false,
}: UsePaymentsProps): UsePaymentsReturn {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialPage)

  const supabase = createClient()

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Query base con count per paginazione
      let query = supabase.from('payments').select(
        `
          *,
          athlete:profiles!athlete_id(nome, cognome),
          created_by_staff:profiles!created_by_staff_id(nome, cognome)
        `,
        { count: enablePagination ? 'exact' : undefined },
      )

      if (role === 'atleta' && userId) {
        query = query.eq('athlete_id', userId)
      } else if ((role === 'admin' || role === 'pt' || role === 'trainer') && userId) {
        // Staff: mostra solo i pagamenti creati da questo trainer
        query = query.eq('created_by_staff_id', userId)
      }

      // Applica paginazione se abilitata
      if (enablePagination) {
        const from = currentPage * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      const {
        data,
        error: fetchError,
        count,
      } = await query.order('created_at', {
        ascending: false,
      })

      if (fetchError) {
        throw fetchError
      }

      // Trasforma i dati per includere i nomi
      const transformedData =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data as any[])?.map((payment: any) => ({
          ...payment,
          athlete_name: `${payment.athlete?.nome || ''} ${payment.athlete?.cognome || ''}`.trim(),
          created_by_staff_name: `${payment.created_by_staff?.nome || ''} ${payment.created_by_staff?.cognome || ''}`.trim(),
        })) || []

      setPayments(transformedData)
      setTotalCount(count || transformedData.length)
    } catch (err) {
      logger.error('Error fetching payments', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento dei pagamenti')
    } finally {
      setLoading(false)
    }
  }, [userId, role, supabase, enablePagination, currentPage, pageSize])

  const loadPage = useCallback(async (page: number) => {
    setCurrentPage(page)
    // fetchPayments verrà chiamato automaticamente quando currentPage cambia
  }, [])

  useEffect(() => {
    if (!userId) return

    fetchPayments()
  }, [userId, role, fetchPayments, currentPage])

  const createPayment = async (
    paymentData: Omit<
      Payment,
      'id' | 'created_at' | 'updated_at' | 'athlete_name' | 'created_by_staff_name'
    >,
  ) => {
    try {
      setError(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('payments') as any).insert(paymentData).select().single()

      if (error) throw error

      // Ricarica i pagamenti
      await fetchPayments()

      return data
    } catch (err) {
      logger.error('Error creating payment', err)
      setError(err instanceof Error ? err.message : 'Errore nella creazione del pagamento')
      throw err
    }
  }

  const reversePayment = async (paymentId: string, reason: string) => {
    try {
      setError(null)

      if (!userId) throw new Error('User ID is required')

      // Ottieni il pagamento originale
      const { data: originalPayment, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single()

      if (fetchError) throw fetchError

      // Crea il pagamento di storno
      const sanitizedReason = reason.trim()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const originalPaymentTyped = originalPayment as any
      const reversalData = {
        athlete_id: originalPaymentTyped.athlete_id,
        amount: -originalPaymentTyped.amount,
        method_text: `${originalPaymentTyped.method_text || ''} (Storno${
          sanitizedReason.length > 0 ? `: ${sanitizedReason}` : ''
        })`,
        lessons_purchased: 0,
        created_by_staff_id: userId,
        is_reversal: true,
        ref_payment_id: paymentId,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('payments') as any).insert(reversalData).select().single()

      if (error) throw error

      // Ricarica i pagamenti
      await fetchPayments()

      return data
    } catch (err) {
      logger.error('Error reversing payment', err, { paymentId, reason })
      setError(err instanceof Error ? err.message : 'Errore nello storno del pagamento')
      throw err
    }
  }

  // Calcola statistiche
  const getStats = useCallback(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyPayments = payments.filter((payment) => {
      const paymentDate = new Date(payment.created_at)
      return (
        !payment.is_reversal &&
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      )
    })

    const totalRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalLessons = monthlyPayments.reduce(
      (sum, payment) => sum + payment.lessons_purchased,
      0,
    )
    const totalPayments = monthlyPayments.length

    return {
      totalRevenue,
      totalLessons,
      totalPayments,
      allPayments: payments.length,
    }
  }, [payments])

  const totalPages = enablePagination ? Math.ceil(totalCount / pageSize) : 1
  const hasMore = enablePagination ? currentPage < totalPages - 1 : false

  return {
    payments,
    loading,
    error,
    totalCount,
    hasMore,
    currentPage,
    totalPages,
    fetchPayments,
    loadPage,
    createPayment,
    reversePayment,
    getStats,
  }
}
