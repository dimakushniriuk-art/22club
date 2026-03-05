import { useState, useMemo } from 'react'
import type { Payment } from '@/types/payment'

export function usePaymentsFilters(payments: Payment[]) {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Filtra pagamenti
  const filteredPayments = useMemo(() => {
    let filtered = [...payments]

    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.athlete_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.method_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          false,
      )
    }

    if (methodFilter) {
      filtered = filtered.filter((payment) => payment.method_text === methodFilter)
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter((payment) => !payment.is_reversal)
    } else if (statusFilter === 'reversals') {
      filtered = filtered.filter((payment) => payment.is_reversal)
    }

    return filtered
  }, [payments, searchTerm, methodFilter, statusFilter])

  const resetFilters = () => {
    setSearchTerm('')
    setMethodFilter('')
    setStatusFilter('')
  }

  return {
    searchTerm,
    methodFilter,
    statusFilter,
    filteredPayments,
    setSearchTerm,
    setMethodFilter,
    setStatusFilter,
    resetFilters,
  }
}
