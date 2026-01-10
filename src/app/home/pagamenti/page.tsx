'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'

const logger = createLogger('app:home:pagamenti:page')
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { Euro, FileText, Download, Eye, X } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'

interface Pagamento {
  id: string
  payment_date: string
  lessons_purchased: number
  lessons_used: number
  lessons_remaining: number
  amount: number
  invoice_url: string | null
}

export default function PagamentiPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [pagamenti, setPagamenti] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null)

  const loadPagamenti = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        setError('Utente non autenticato')
        return
      }

      // Ottieni profilo atleta
      // user.user_id è auth.users.id, necessario per cercare profiles.user_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.user_id)
        .single()

      if (profileError || !profile) {
        throw new Error('Profilo atleta non trovato')
      }

      // Carica pagamenti
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, payment_date, amount, invoice_url, lessons_purchased, status')
        .eq('athlete_id', profile.id)
        .eq('status', 'completed')
        .order('payment_date', { ascending: false })

      if (paymentsError) throw paymentsError

      // Carica lesson_counters per calcolare lezioni usate
      const { data: counter, error: counterError } = await supabase
        .from('lesson_counters')
        .select('count')
        .eq('athlete_id', profile.id)
        .maybeSingle()

      if (counterError) throw counterError

      // Calcola lezioni totali acquistate e usate
      const totalPurchased = (payments || []).reduce(
        (sum, p) => sum + (p.lessons_purchased || 0),
        0,
      )
      const remaining = counter?.count || 0
      const totalUsed = Math.max(0, totalPurchased - remaining)

      // Distribuisci lezioni usate proporzionalmente tra i pagamenti
      type PaymentRow = {
        id: string
        payment_date: string | null
        amount: number | null
        invoice_url: string | null
        lessons_purchased: number | null
        status: string | null
        created_at?: string | null
      }

      const paymentRows = (payments ?? []) as PaymentRow[]

      const formatted: Pagamento[] = paymentRows.map((p) => {
        const lessonsPurchased = p.lessons_purchased ?? 0
        const proportion = totalPurchased > 0 ? lessonsPurchased / totalPurchased : 0
        const lessonsUsed = Math.round(totalUsed * proportion)
        const lessonsRemaining = Math.max(0, lessonsPurchased - lessonsUsed)

        return {
          id: p.id,
          payment_date: p.payment_date ?? p.created_at ?? new Date().toISOString(),
          lessons_purchased: lessonsPurchased,
          lessons_used: lessonsUsed,
          lessons_remaining: lessonsRemaining,
          amount: p.amount ?? 0,
          invoice_url: p.invoice_url ?? null,
        }
      })

      setPagamenti(formatted)
    } catch (error) {
      logger.error('Errore caricamento pagamenti', error, { userId: user?.id })
      setError(error instanceof Error ? error.message : 'Errore nel caricamento dei pagamenti')
    } finally {
      setLoading(false)
    }
  }, [supabase, user])

  useEffect(() => {
    if (user) {
      void loadPagamenti()
    }
  }, [user, loadPagamenti])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  if (loading) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] flex flex-col"
        style={{ overflow: 'auto' }}
      >
        <Card variant="trainer" className="relative bg-transparent">
          <CardContent className="relative py-16 text-center">
            <LoadingState message="Caricamento pagamenti..." />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] flex flex-col"
        style={{ overflow: 'auto' }}
      >
        <Card variant="trainer" className="relative bg-transparent">
          <CardContent className="relative py-16 text-center">
            <ErrorState message={error} onRetry={loadPagamenti} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="bg-black min-w-[402px] min-h-[874px] flex flex-col"
      style={{ overflow: 'auto' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none"></div>

      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-text-primary text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight flex items-center gap-3">
              <Euro className="h-8 w-8 text-blue-400" />
              Pagamenti
            </h1>
            <p className="text-text-secondary text-sm sm:text-base mt-1">
              I tuoi abbonamenti e pagamenti
            </p>
          </div>
        </div>

        {/* Tabella Pagamenti */}
        <Card
          variant="trainer"
          className="relative border-blue-500/30 bg-transparent transition-all duration-200"
        >
          <CardContent className="relative z-10 p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-tertiary/50 border-b border-blue-500/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-text-primary text-sm font-semibold">
                      Data
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Allenamenti
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Usufruiti
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Rimasti
                    </th>
                    <th className="px-4 py-3 text-right text-text-primary text-sm font-semibold">
                      Pagato
                    </th>
                    <th className="px-4 py-3 text-center text-text-primary text-sm font-semibold">
                      Fattura
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/10">
                  {pagamenti.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-text-secondary">
                        <div className="flex flex-col items-center gap-3">
                          <Euro className="h-12 w-12 text-blue-400/50" />
                          <p>Nessun pagamento registrato</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagamenti.map((pag) => (
                      <tr key={pag.id} className="transition-colors">
                        <td className="px-4 py-3 text-text-secondary">
                          {formatDate(pag.payment_date)}
                        </td>
                        <td className="px-4 py-3 text-center text-text-primary font-semibold">
                          {pag.lessons_purchased}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-orange-400 font-medium">{pag.lessons_used}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-semibold ${
                              pag.lessons_remaining === 0
                                ? 'text-red-400'
                                : pag.lessons_remaining <= 3
                                  ? 'text-orange-400'
                                  : 'text-green-400'
                            }`}
                          >
                            {pag.lessons_remaining}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-text-primary font-semibold">
                          {formatCurrency(pag.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {pag.invoice_url ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedInvoice(pag.invoice_url!)}
                                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Visualizza
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(pag.invoice_url!, '_blank')}
                                className="border-blue-500/30 text-white hover:bg-blue-500/10"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-text-tertiary text-sm">Non disponibile</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Preview Fattura */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] m-4 bg-background-secondary rounded-lg border border-blue-500/30 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-blue-500/20">
              <h3 className="text-text-primary text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Fattura
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
                className="border-blue-500/30 text-white hover:bg-blue-500/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 h-[calc(90vh-80px)] overflow-auto">
              <iframe
                src={selectedInvoice}
                className="w-full h-full rounded border border-blue-500/20"
                title="Fattura PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
