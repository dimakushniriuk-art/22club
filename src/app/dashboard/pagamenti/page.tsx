'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { Button } from '@/components/ui'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { usePayments } from '@/hooks/use-payments'
import { usePaymentsFilters } from '@/hooks/use-payments-filters'
import { usePaymentsStats } from '@/hooks/use-payments-stats'
import { PaymentsKPICards } from '@/components/dashboard/pagamenti/payments-kpi-cards'
import { PaymentsFilters } from '@/components/dashboard/pagamenti/payments-filters'
import { PaymentsTable } from '@/components/dashboard/pagamenti/payments-table'
import { PaymentDetailDrawer } from '@/components/dashboard/pagamenti/payment-detail-drawer'
import { PaymentsExportMenu } from '@/components/dashboard/pagamenti/payments-export-menu'
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { LoadingState } from '@/components/dashboard/loading-state'
import { useToast } from '@/components/ui/toast'
import type { Payment } from '@/types/payment'
import { logger } from '@/lib/logger'

// Lazy load NewPaymentModal per ridurre bundle size iniziale
const NewPaymentModal = lazy(() =>
  import('@/components/dashboard/pagamenti/new-payment-modal').then((mod) => ({
    default: mod.NewPaymentModal,
  })),
)

export default function PagamentiPage() {
  const { user } = useAuth()
  const userId = user?.user_id || null
  const role = user?.role || null
  const { addToast } = useToast()

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false)
  const [reverseDialogOpen, setReverseDialogOpen] = useState(false)
  const [paymentToReverse, setPaymentToReverse] = useState<Payment | null>(null)
  const [isReversing, setIsReversing] = useState(false)

  // Determina se abilitare paginazione (se ci sono più di 100 record)
  const [enablePagination, setEnablePagination] = useState(false)

  // Hook per pagamenti con paginazione
  const {
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
  } = usePayments({
    userId,
    role,
    enablePagination,
  })

  // Abilita paginazione se ci sono più di 100 record
  useEffect(() => {
    if (totalCount > 100 && !enablePagination) {
      setEnablePagination(true)
    }
  }, [totalCount, enablePagination])

  // Hook per filtri
  const {
    searchTerm,
    methodFilter,
    statusFilter,
    filteredPayments,
    setSearchTerm,
    setMethodFilter,
    setStatusFilter,
    resetFilters,
  } = usePaymentsFilters(payments)

  // Hook per statistiche (usa RPC con cache)
  const stats = usePaymentsStats(undefined, { useRPC: true })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowDrawer(true)
  }

  const handleReversePayment = (payment: Payment) => {
    setPaymentToReverse(payment)
    setReverseDialogOpen(true)
  }

  const handleReverseConfirm = async () => {
    if (!paymentToReverse) return

    setIsReversing(true)
    try {
      await reversePayment(paymentToReverse.id, 'Storno manuale')
      setShowDrawer(false)
      setReverseDialogOpen(false)
      setPaymentToReverse(null)
      // Ricarica pagamenti dopo storno
      await fetchPayments()
      addToast({
        title: 'Pagamento stornato',
        message: `Il pagamento di ${formatCurrency(paymentToReverse.amount)} è stato stornato con successo.`,
        variant: 'success',
      })
    } catch (err) {
      logger.error(
        'PagamentiPage.handleReversePayment',
        'Errore nello storno del pagamento',
        err instanceof Error ? err : new Error(String(err)),
      )
      addToast({
        title: 'Errore',
        message: 'Errore nello storno del pagamento. Riprova più tardi.',
        variant: 'error',
      })
      setReverseDialogOpen(false)
    } finally {
      setIsReversing(false)
      setPaymentToReverse(null)
    }
  }

  const handleNewPayment = () => {
    setShowNewPaymentModal(true)
  }

  const handleSavePayment = async (payment: Omit<Payment, 'id' | 'created_at'>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createPayment(payment as any)
      setShowNewPaymentModal(false)
      // Ricarica pagamenti dopo creazione
      await fetchPayments()
      addToast({
        title: 'Pagamento creato',
        message: 'Il pagamento è stato creato con successo.',
        variant: 'success',
      })
    } catch (err) {
      logger.error(
        'PagamentiPage.handleSavePayment',
        'Errore nella creazione del pagamento',
        err instanceof Error ? err : new Error(String(err)),
      )
      addToast({
        title: 'Errore',
        message: 'Errore nella creazione del pagamento. Riprova più tardi.',
        variant: 'error',
      })
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
          <div className="animate-pulse space-y-4">
            <div className="bg-background-tertiary h-8 w-64 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-background-tertiary h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-indigo-500/5 via-transparent to-transparent" />
      </div>

      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              Gestione Pagamenti
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Monitora entrate e saldi lezioni atleti
            </p>
          </div>
          <Button
            onClick={handleNewPayment}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Pagamento
          </Button>
        </div>

        {/* KPI Cards */}
        <PaymentsKPICards
          totalRevenue={stats.totalRevenue}
          totalLessons={stats.totalLessons}
          totalPayments={stats.totalPayments}
          totalReversals={payments.filter((p) => p.is_reversal).length}
        />

        {/* Filtri e Export */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <PaymentsFilters
            searchTerm={searchTerm}
            methodFilter={methodFilter}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onMethodFilterChange={setMethodFilter}
            onStatusFilterChange={setStatusFilter}
            onReset={resetFilters}
          />
          <PaymentsExportMenu payments={filteredPayments} disabled={loading} />
        </div>

        {/* Tabella pagamenti */}
        <PaymentsTable
          payments={filteredPayments}
          onPaymentClick={handlePaymentClick}
          onReversePayment={handleReversePayment}
        />

        {/* Paginazione */}
        {enablePagination && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="text-text-secondary text-sm">
              Mostrando {currentPage * 100 + 1} - {Math.min((currentPage + 1) * 100, totalCount)} di{' '}
              {totalCount} pagamenti
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(currentPage - 1)}
                disabled={currentPage === 0 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Precedente
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary text-sm">
                  Pagina {currentPage + 1} di {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(currentPage + 1)}
                disabled={!hasMore || loading}
              >
                Successiva
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
            <p className="text-red-400 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchPayments} className="mt-2">
              Riprova
            </Button>
          </div>
        )}
      </div>

      {/* Drawer dettaglio pagamento */}
      <PaymentDetailDrawer
        payment={selectedPayment}
        open={showDrawer}
        onClose={() => {
          setShowDrawer(false)
          setSelectedPayment(null)
        }}
        onReverse={handleReversePayment}
      />

      {/* Modal nuovo pagamento - Lazy loaded solo quando aperto */}
      {showNewPaymentModal && (
        <Suspense fallback={<LoadingState message="Caricamento form pagamento..." />}>
          <NewPaymentModal onClose={() => setShowNewPaymentModal(false)} onSave={handleSavePayment} />
        </Suspense>
      )}

      {/* Dialog conferma storno pagamento */}
      {paymentToReverse && (
        <ConfirmDialog
          open={reverseDialogOpen}
          onOpenChange={setReverseDialogOpen}
          title="Storna pagamento"
          description={`Sei sicuro di voler stornare il pagamento di ${formatCurrency(paymentToReverse.amount)}? Questa azione non può essere annullata.`}
          confirmText="Storna"
          cancelText="Annulla"
          variant="destructive"
          onConfirm={handleReverseConfirm}
          loading={isReversing}
        />
      )}
    </div>
  )
}
