'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { SimpleSelect } from '@/components/ui/simple-select'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { Euro, Calendar, User, FileText, Loader2, X, Upload } from 'lucide-react'
import type { Tables } from '@/types/supabase'
import type { Cliente } from '@/types/cliente'

const logger = createLogger('components:dashboard:nuovo-pagamento-modal')

interface NuovoPagamentoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  athlete_id: string
  payment_date: string
  lessons_purchased: number
  amount: number
  invoice_file: File | null
}

export function NuovoPagamentoModal({ open, onOpenChange, onSuccess }: NuovoPagamentoModalProps) {
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const supabase = createClient()
  type ProfileRow = Tables<'profiles'>
  const [formData, setFormData] = useState<FormData>({
    athlete_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    lessons_purchased: 1,
    amount: 0,
    invoice_file: null,
  })

  const [athletes, setAthletes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null)

  // Carica atleti
  const loadAthletes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, cognome, email, role')
        .in('role', ['atleta', 'athlete'])
        .order('nome', { ascending: true })

      if (error) throw error

      const formattedAthletes: Cliente[] = (data || []).map((profile) => {
        const athlete = profile as ProfileRow
        return {
          id: athlete.id,
          nome: athlete.nome ?? '',
          cognome: athlete.cognome ?? '',
          email: athlete.email ?? '',
          first_name: athlete.nome ?? '',
          last_name: athlete.cognome ?? '',
          phone: null,
          avatar_url: null,
          data_iscrizione: '',
          stato: 'attivo' as const,
          allenamenti_mese: 0,
          ultimo_accesso: null,
          scheda_attiva: null,
          documenti_scadenza: false,
          note: null,
          tags: [],
          role: 'atleta',
          created_at: '',
          updated_at: '',
        }
      })

      setAthletes(formattedAthletes)
    } catch (error) {
      logger.error('Errore caricamento atleti', error)
    }
  }, [supabase])

  useEffect(() => {
    if (open) {
      void loadAthletes()
    }
  }, [open, loadAthletes])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('Il file deve essere un PDF')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Il file deve essere inferiore a 10MB')
      return
    }

    setFormData((prev) => ({ ...prev, invoice_file: file }))
    setError(null)

    // Preview PDF
    const reader = new FileReader()
    reader.onload = (e) => {
      setInvoicePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validazione con logging dettagliato
      const validationErrors: string[] = []

      if (!formData.athlete_id) {
        validationErrors.push('Atleta non selezionato')
      }
      if (!formData.payment_date) {
        validationErrors.push('Data non selezionata')
      }
      if (!formData.lessons_purchased || formData.lessons_purchased < 1) {
        validationErrors.push('Numero allenamenti non valido')
      }
      if (!formData.amount || formData.amount <= 0) {
        validationErrors.push('Importo non valido')
      }

      if (validationErrors.length > 0) {
        logger.error('Errori validazione', undefined, { validationErrors, formData })
        setError('Compila tutti i campi obbligatori: ' + validationErrors.join(', '))
        setLoading(false)
        return
      }

      // Ottieni utente corrente e verifica sessione
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        logger.error('Errore autenticazione', userError)
        setError('Utente non autenticato. Esegui il login.')
        setLoading(false)
        return
      }

      logger.debug('Utente autenticato', undefined, { userId: user.id })

      // Verifica sessione attiva
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
      if (sessionError || !session) {
        logger.error('Errore sessione', sessionError)
        setError('Sessione non valida. Esegui il login.')
        setLoading(false)
        return
      }

      logger.debug('Sessione attiva', undefined, { hasAccessToken: !!session?.access_token })

      // Ottieni profilo staff corrente
      const { data: staffProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, role')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError) {
        logger.error('Errore recupero profilo', profileError, { userId: user.id })
        setError('Errore nel recupero del profilo staff')
        setLoading(false)
        return
      }

      if (!staffProfile) {
        logger.error('Profilo staff non trovato', undefined, { userId: user.id })
        setError(
          'Profilo staff non trovato. Verifica che il tuo account abbia i permessi corretti.',
        )
        setLoading(false)
        return
      }

      logger.debug('Profilo staff trovato', undefined, {
        staffId: staffProfile.id,
        role: staffProfile.role,
      })

      let invoiceUrl: string | null = null

      // Upload fattura PDF se presente
      if (formData.invoice_file) {
        setUploading(true)
        let fileName: string | undefined
        try {
          const fileExt = formData.invoice_file.name.split('.').pop()
          fileName = `fatture/${formData.athlete_id}/${Date.now()}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, formData.invoice_file, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
          invoiceUrl = urlData.publicUrl
        } catch (uploadErr) {
          logger.error('Errore upload fattura', uploadErr, {
            fileName,
            athleteId: formData.athlete_id,
          })
          setError(
            'Errore nel caricamento della fattura: ' +
              (uploadErr instanceof Error ? uploadErr.message : 'Errore sconosciuto'),
          )
          setLoading(false)
          setUploading(false)
          return
        } finally {
          setUploading(false)
        }
      }

      // Verifica che athlete_id sia valido
      if (!formData.athlete_id || typeof formData.athlete_id !== 'string') {
        throw new Error('ID atleta non valido')
      }

      // Verifica che l'atleta esista
      const { data: athleteCheck, error: athleteError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', formData.athlete_id)
        .single()

      if (athleteError || !athleteCheck) {
        throw new Error('Atleta non trovato nel database')
      }

      // Prepara dati pagamento - TUTTI i campi obbligatori
      const paymentData: {
        athlete_id: string
        amount: number
        payment_method: string
        status: string
        notes: string
        created_by_staff_id: string
        lessons_purchased: number
        payment_date?: string
      } = {
        athlete_id: formData.athlete_id,
        amount: parseFloat(formData.amount.toString()),
        payment_method: 'abbonamento',
        status: 'completed',
        notes: `Abbonamento di ${formData.lessons_purchased} allenamenti`,
        // Campi obbligatori NOT NULL
        // created_by_staff_id deve essere l'ID del profilo (profiles.id), non user_id
        created_by_staff_id: staffProfile.id,
        lessons_purchased: formData.lessons_purchased,
      }

      // Aggiungi payment_date se presente
      if (formData.payment_date && formData.payment_date.trim().length > 0) {
        paymentData.payment_date = new Date(formData.payment_date).toISOString()
      }

      const paymentPayload = paymentData

      logger.debug('Tentativo inserimento pagamento', undefined, {
        athleteId: paymentPayload.athlete_id,
        amount: paymentPayload.amount,
        createdByStaffId: paymentPayload.created_by_staff_id,
        staffProfileId: staffProfile.id,
        staffUserId: user.id,
        hasPaymentDate: !!paymentPayload.payment_date,
      })

      // Inserimento diretto
      const { data: paymentRecord, error: paymentInsertError } = await supabase
        .from('payments')
        .insert(paymentPayload)
        .select('id')
        .single()

      if (paymentInsertError) {
        const msg =
          paymentInsertError.message ||
          paymentInsertError.hint ||
          paymentInsertError.code ||
          'Errore di permessi o configurazione database. Verifica le policy RLS sulla tabella payments.'
        throw new Error(msg)
      }

      const paymentId = paymentRecord?.id

      if (!paymentId) {
        throw new Error('Pagamento creato ma ID non disponibile')
      }

      // Aggiorna con campi opzionali se esistono (solo invoice_url)
      if (invoiceUrl) {
        await supabase.from('payments').update({ invoice_url: invoiceUrl }).eq('id', paymentId)
        // Ignora errori di update - il pagamento è già stato creato
      }

      // Aggiorna lesson_counters
      // Nota: la tabella lesson_counters ha lesson_type (NOT NULL) e count
      // Verifica se esiste già un contatore per questo atleta con lesson_type 'standard'
      const { data: existingCounter } = await supabase
        .from('lesson_counters')
        .select('id, athlete_id, lesson_type, count, updated_at')
        .eq('athlete_id', formData.athlete_id)
        .eq('lesson_type', 'standard')
        .maybeSingle()

      if (existingCounter) {
        // Aggiorna il contatore esistente
        const currentCount =
          typeof existingCounter.count === 'number'
            ? existingCounter.count
            : Number(existingCounter.count ?? 0)

        await supabase
          .from('lesson_counters')
          .update({
            count: currentCount + formData.lessons_purchased,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCounter.id)
      } else {
        // Crea un nuovo contatore con lesson_type 'standard'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('lesson_counters') as any).insert({
          athlete_id: formData.athlete_id,
          lesson_type: 'standard',
          count: formData.lessons_purchased,
          updated_at: new Date().toISOString(),
        })
      }

      // Invalida query payments per refresh automatico
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all })

      addToast({
        title: 'Successo',
        message: 'Pagamento registrato con successo',
        variant: 'success',
      })

      onOpenChange(false)
      resetForm()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      logger.error('Errore registrazione pagamento', error, {
        athleteId: formData.athlete_id,
        amount: formData.amount,
      })
      const errorMessage =
        error instanceof Error ? error.message : 'Errore nella registrazione del pagamento'
      setError(errorMessage)
      addToast({
        title: 'Errore registrazione pagamento',
        message: errorMessage,
        variant: 'error',
      })
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      athlete_id: '',
      payment_date: new Date().toISOString().split('T')[0],
      lessons_purchased: 1,
      amount: 0,
      invoice_file: null,
    })
    setInvoicePreview(null)
    setError(null)
  }

  const handleClose = () => {
    if (!loading && !uploading) {
      onOpenChange(false)
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] relative overflow-hidden rounded-xl border border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-lg shadow-teal-500/10 p-0 flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="relative z-10 p-6 overflow-y-auto flex-1">
          <DialogHeader className="pb-4 border-b border-teal-500/20 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-teal-500/20 text-teal-400 rounded-full p-2">
                <Euro className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-text-primary">
                  Nuovo Pagamento
                </DialogTitle>
                <DialogDescription className="mt-1 text-text-secondary text-sm">
                  Registra un nuovo abbonamento per un atleta
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-white p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Seleziona Atleta */}
            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Seleziona Atleta *
              </label>
              <SimpleSelect
                value={formData.athlete_id}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, athlete_id: value || '' }))
                }}
                placeholder="Seleziona atleta..."
                options={athletes.map((athlete) => ({
                  value: athlete.id,
                  label: `${athlete.nome} ${athlete.cognome}`,
                }))}
              />
            </div>

            {/* Data */}
            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data *
              </label>
              <Input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, payment_date: e.target.value }))}
                required
              />
            </div>

            {/* Allenamenti */}
            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium">Allenamenti *</label>
              <SimpleSelect
                value={formData.lessons_purchased.toString()}
                onValueChange={(value) => {
                  const numValue = parseInt(value) || 1
                  logger.debug('Allenamenti selezionati', undefined, { lessonsPurchased: numValue })
                  setFormData((prev) => ({ ...prev, lessons_purchased: numValue }))
                }}
                placeholder="Seleziona numero allenamenti..."
                options={Array.from({ length: 20 }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: (i + 1).toString(),
                }))}
              />
            </div>

            {/* Pagato */}
            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Pagato (€) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value)
                  setFormData((prev) => ({ ...prev, amount: isNaN(value) ? 0 : value }))
                }}
                placeholder="0.00"
                required
              />
            </div>

            {/* Fattura PDF */}
            <div className="space-y-2">
              <label className="text-text-primary text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Fattura (PDF){' '}
                <span className="text-text-tertiary text-xs font-normal">(opzionale)</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading || uploading}
                  />
                  <div className="flex items-center gap-2 px-4 py-2 bg-background-secondary/50 border border-teal-500/30 rounded-lg hover:border-teal-500/50 transition-colors">
                    <Upload className="h-4 w-4 text-teal-400" />
                    <span className="text-text-primary text-sm">
                      {formData.invoice_file ? formData.invoice_file.name : 'Carica PDF'}
                    </span>
                  </div>
                </label>
                {formData.invoice_file && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, invoice_file: null }))
                      setInvoicePreview(null)
                    }}
                    className="border-red-500/30 text-white hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {invoicePreview && (
                <div className="mt-2 p-3 bg-background-tertiary/50 rounded-lg border border-teal-500/20">
                  <p className="text-text-secondary text-xs mb-2">Anteprima fattura:</p>
                  <iframe
                    src={invoicePreview}
                    className="w-full h-64 rounded border border-teal-500/20"
                    title="Anteprima fattura"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="w-full pt-6 border-t border-teal-500/30 relative z-10">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading || uploading}
                className="border-teal-500/30 text-white hover:bg-teal-500/10 hover:border-teal-500/50"
              >
                <X className="h-4 w-4 mr-2" />
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200"
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploading ? 'Caricamento...' : 'Salvataggio...'}
                  </>
                ) : (
                  <>
                    <Euro className="h-4 w-4 mr-2" />
                    Salva
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
