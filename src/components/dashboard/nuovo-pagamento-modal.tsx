'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
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
import { ConfirmDialog } from '@/components/shared/ui/confirm-dialog'
import { Input } from '@/components/ui'
import { SimpleSelect } from '@/components/ui/simple-select'
import { useToast } from '@/components/ui/toast'
import { supabase } from '@/lib/supabase/client'
import { createLogger } from '@/lib/logger'
import { addCreditFromPayment } from '@/lib/credits/ledger'
import type { ServiceType } from '@/lib/abbonamenti-service-type'
import { Euro, Calendar, User, FileText, Loader2, X, Upload } from 'lucide-react'
import type { Tables } from '@/types/supabase'
import type { Cliente } from '@/types/cliente'

const logger = createLogger('components:dashboard:nuovo-pagamento-modal')

interface NuovoPagamentoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  /** Servizio: training | nutrition | massage (payments.service_type, credit_ledger.service_type). */
  serviceType: ServiceType
  /** Se presente, precompila l'atleta e può bloccare la selezione. */
  defaultAthleteId?: string
  /** Se true (default), disabilita la selezione atleta quando defaultAthleteId è presente. */
  lockAthlete?: boolean
}

interface FormData {
  athlete_id: string
  payment_date: string
  lessons_purchased: number
  amount: number
  invoice_file: File | null
}

export function NuovoPagamentoModal({
  open,
  onOpenChange,
  onSuccess,
  serviceType,
  defaultAthleteId,
  lockAthlete = true,
}: NuovoPagamentoModalProps) {
  const { addToast } = useToast()
  const queryClient = useQueryClient()
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
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const initialFormRef = useRef<{
    athlete_id: string
    payment_date: string
    lessons_purchased: number
    amount: number
    hasInvoiceFile: boolean
  } | null>(null)

  // Carica atleti
  const loadAthletes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, cognome, email, role')
        .eq('role', 'athlete')
        .order('nome', { ascending: true })

      if (error) throw error

      type ProfileSelect = Pick<ProfileRow, 'id' | 'nome' | 'cognome' | 'email'>
      const formattedAthletes: Cliente[] = (data || []).map((profile: ProfileSelect) => {
        const athlete = profile
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
          role: 'athlete',
          created_at: '',
          updated_at: '',
        }
      })

      setAthletes(formattedAthletes)
    } catch (error) {
      logger.error('Errore caricamento atleti', error)
    }
  }, [])

  useEffect(() => {
    if (open) {
      void loadAthletes()
      const defaultDate = new Date().toISOString().split('T')[0]
      setFormData({
        athlete_id: defaultAthleteId ?? '',
        payment_date: defaultDate,
        lessons_purchased: 1,
        amount: 0,
        invoice_file: null,
      })
      setInvoicePreview(null)
      setError(null)
      initialFormRef.current = {
        athlete_id: defaultAthleteId ?? '',
        payment_date: defaultDate,
        lessons_purchased: 1,
        amount: 0,
        hasInvoiceFile: false,
      }
    } else {
      initialFormRef.current = null
    }
  }, [open, loadAthletes, defaultAthleteId])

  const isDirty = useMemo(() => {
    if (!open || !initialFormRef.current) return false
    const init = initialFormRef.current
    return (
      formData.athlete_id !== init.athlete_id ||
      formData.payment_date !== init.payment_date ||
      formData.lessons_purchased !== init.lessons_purchased ||
      formData.amount !== init.amount ||
      !!formData.invoice_file !== init.hasInvoiceFile
    )
  }, [open, formData])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isDirty) {
        setShowCloseConfirm(true)
        return
      }
      if (!nextOpen) {
        setShowCloseConfirm(false)
        resetForm()
        onOpenChange(false)
      }
    },
    [isDirty, onOpenChange],
  )

  const handleConfirmClose = useCallback(() => {
    setShowCloseConfirm(false)
    resetForm()
    onOpenChange(false)
  }, [onOpenChange])

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
        service_type: ServiceType
        payment_date?: string
      } = {
        athlete_id: formData.athlete_id,
        amount: parseFloat(formData.amount.toString()),
        payment_method: 'abbonamento',
        status: 'completed',
        notes: `Abbonamento di ${formData.lessons_purchased} allenamenti`,
        created_by_staff_id: staffProfile.id,
        lessons_purchased: formData.lessons_purchased,
        service_type: serviceType,
      }

      // Aggiungi payment_date se presente
      if (formData.payment_date && formData.payment_date.trim().length > 0) {
        paymentData.payment_date = new Date(formData.payment_date).toISOString()
      }

      // org_id: preferisci RPC (RLS-safe). Fallback a profiles.org_id se disponibile.
      const orgIdRaw = (staffProfile as { org_id?: string | null }).org_id
      let orgId: string | undefined =
        orgIdRaw && String(orgIdRaw).trim() ? String(orgIdRaw).trim() : undefined
      if (!orgId) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: rpcOrg, error: rpcErr } = await (supabase.rpc as any)(
            'get_org_id_for_current_user',
          )
          if (!rpcErr && rpcOrg) {
            orgId = String(rpcOrg).trim()
          }
        } catch {
          /* ignora: fallback sotto */
        }
      }
      if (!orgId || orgId.trim() === '') {
        throw new Error(
          'Organizzazione non configurata. Imposta org_id sul profilo o verifica get_org_id_for_current_user().',
        )
      }
      const paymentPayload = {
        ...paymentData,
        created_by_profile_id: staffProfile.id,
        org_id: orgId,
      }

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

      // Upload fattura dopo insert: path fatture/{service_type}/{athlete_id}/{paymentId}.{ext}
      if (formData.invoice_file) {
        setUploading(true)
        try {
          const fileExt = formData.invoice_file.name.split('.').pop() || 'pdf'
          const storagePath = `fatture/${serviceType}/${formData.athlete_id}/${paymentId}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(storagePath, formData.invoice_file, { cacheControl: '3600', upsert: false })

          if (uploadError) throw uploadError
          await supabase.from('payments').update({ invoice_url: storagePath }).eq('id', paymentId)
        } catch (uploadErr) {
          logger.error('Errore upload fattura', uploadErr, {
            paymentId,
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

      // Ledger: unica fonte per variazioni crediti (lesson_counters aggiornato da trigger DB)
      await addCreditFromPayment({
        id: paymentId,
        athlete_id: formData.athlete_id,
        lessons_purchased: formData.lessons_purchased,
        created_by_staff_id: staffProfile.id,
        serviceType,
      })

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
      handleOpenChange(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] backdrop-blur-xl p-0 flex flex-col">
          <div className="relative z-10 p-6 overflow-y-auto flex-1">
            <DialogHeader className="pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-full p-2 border border-primary/20">
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
                  disabled={Boolean(defaultAthleteId && lockAthlete)}
                  options={athletes
                    .map((athlete) => ({
                      value: athlete.id,
                      label: `${athlete.nome} ${athlete.cognome}`,
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label, 'it'))}
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, payment_date: e.target.value }))
                  }
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
                    logger.debug('Allenamenti selezionati', undefined, {
                      lessonsPurchased: numValue,
                    })
                    setFormData((prev) => ({ ...prev, lessons_purchased: numValue }))
                  }}
                  placeholder="Seleziona numero allenamenti..."
                  options={Array.from({ length: 600 }, (_, i) => ({
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
                  <div className="mt-2 p-3 bg-background-tertiary/50 rounded-lg border border-white/10">
                    <p className="text-text-secondary text-xs mb-2">Anteprima fattura:</p>
                    <iframe
                      src={invoicePreview}
                      className="w-full h-64 rounded border border-white/10"
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
                  className="bg-cyan-500 text-white hover:bg-cyan-400 font-semibold border border-cyan-400/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] transition-all duration-200"
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
      {showCloseConfirm && (
        <ConfirmDialog
          open={showCloseConfirm}
          onOpenChange={setShowCloseConfirm}
          title="Modifiche non salvate"
          description="Hai modifiche non salvate. Uscire le annullerà. Continuare?"
          confirmText="Esci"
          cancelText="Resta"
          variant="destructive"
          onConfirm={handleConfirmClose}
        />
      )}
    </>
  )
}
