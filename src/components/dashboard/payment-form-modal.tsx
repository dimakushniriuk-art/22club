'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import { createLogger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'

const logger = createLogger('components:dashboard:payment-form-modal')
import { useClienti } from '@/hooks/use-clienti'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { CreditCard, Euro, Calendar, BookOpen, X, Loader2 } from 'lucide-react'

interface PaymentFormData {
  athlete_id: string
  amount: number
  payment_method: 'contanti' | 'bonifico' | 'carta' | 'paypal'
  lessons_purchased: number
  notes?: string
}

interface PaymentFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function PaymentFormModal({ open, onOpenChange, onSuccess }: PaymentFormModalProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    athlete_id: '',
    amount: 0,
    payment_method: 'contanti',
    lessons_purchased: 0,
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const supabase = createClient()
  const { clienti } = useClienti()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validazione
      if (!formData.athlete_id || formData.amount <= 0 || formData.lessons_purchased <= 0) {
        setError('Compila tutti i campi obbligatori')
        return
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Utente non autenticato')
        return
      }

      // 1. Insert payment
      // Workaround necessario per inferenza tipo Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: paymentError } = await (supabase.from('payments') as any).insert([
        {
          athlete_id: formData.athlete_id,
          amount: formData.amount,
          payment_date: new Date().toISOString(),
          payment_method: formData.payment_method,
          lessons_purchased: formData.lessons_purchased,
          notes: formData.notes || null,
        },
      ])

      if (paymentError) {
        throw paymentError
      }

      // 2. Update lesson_counters (increment)
      // Check if counter exists
      const { data: existingCounter } = await supabase
        .from('lesson_counters')
        .select('*')
        .eq('athlete_id', formData.athlete_id)
        .single()

      if (existingCounter) {
        type LessonCounterRow = {
          lessons_remaining: number | null
          athlete_id: string
          [key: string]: unknown
        }
        const typedCounter = existingCounter as LessonCounterRow

        // Update existing counter
        // Workaround necessario per inferenza tipo Supabase
        const { error: updateError } =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('lesson_counters') as any)
            .update({
              lessons_remaining: (typedCounter.lessons_remaining || 0) + formData.lessons_purchased,
            } as Record<string, unknown>)
            .eq('athlete_id', formData.athlete_id)

        if (updateError) {
          throw updateError
        }
      } else {
        // Create new counter
        // Workaround necessario per inferenza tipo Supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: createError } = await (supabase.from('lesson_counters') as any).insert([
          {
            athlete_id: formData.athlete_id,
            lessons_remaining: formData.lessons_purchased,
          },
        ])

        if (createError) {
          throw createError
        }
      }

      // Invalida query payments per refresh automatico
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all })

      toast.addToast({
        title: 'Pagamento registrato',
        message: 'Pagamento aggiunto correttamente',
        variant: 'success',
      })
      onOpenChange(false)
      onSuccess?.()

      // Reset form
      setFormData({
        athlete_id: '',
        amount: 0,
        payment_method: 'contanti',
        lessons_purchased: 0,
        notes: '',
      })
    } catch (error) {
      logger.error('Error registering payment', error, {
        athleteId: formData.athlete_id,
        amount: formData.amount,
      })
      const errorMsg =
        error instanceof Error ? error.message : 'Errore nella registrazione del pagamento'
      setError(errorMsg)
      toast.addToast({
        title: 'Errore registrazione pagamento',
        message: errorMsg,
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      setError(null)
      setFormData({
        athlete_id: '',
        amount: 0,
        payment_method: 'contanti',
        lessons_purchased: 0,
        notes: '',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-background-secondary border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-text-primary text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-400" />
            Registra Pagamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Select Atleta */}
          <div className="space-y-2">
            <Label htmlFor="athlete" className="text-text-primary">
              <Calendar className="inline h-4 w-4 mr-2" />
              Atleta *
            </Label>
            <select
              id="athlete"
              value={formData.athlete_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, athlete_id: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-input border-border border rounded-lg text-text-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Seleziona atleta...</option>
              {clienti.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} {cliente.cognome}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-text-primary">
              <Euro className="inline h-4 w-4 mr-2" />
              Importo (€) *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))
              }
              placeholder="0.00"
              required
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment_method" className="text-text-primary">
              Metodo Pagamento *
            </Label>
            <select
              id="payment_method"
              value={formData.payment_method}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  payment_method: e.target.value as 'contanti' | 'bonifico' | 'carta' | 'paypal',
                }))
              }
              required
              className="w-full px-3 py-2 bg-input border-border border rounded-lg text-text-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="contanti">Contanti</option>
              <option value="bonifico">Bonifico</option>
              <option value="carta">Carta</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          {/* Lessons Purchased */}
          <div className="space-y-2">
            <Label htmlFor="lessons_purchased" className="text-text-primary">
              <BookOpen className="inline h-4 w-4 mr-2" />
              Lezioni Acquistate *
            </Label>
            <Input
              id="lessons_purchased"
              type="number"
              min="1"
              value={formData.lessons_purchased || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  lessons_purchased: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="0"
              required
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-text-primary">
              Note (opzionale)
            </Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Note aggiuntive sul pagamento..."
              rows={3}
              className="w-full px-3 py-2 bg-input border-border border rounded-lg text-text-primary placeholder:text-text-tertiary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 border-blue-500/50 text-white hover:bg-blue-500/10"
            >
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrazione...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Registra Pagamento
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
