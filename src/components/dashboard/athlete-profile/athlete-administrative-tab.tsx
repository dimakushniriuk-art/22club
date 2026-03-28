/**
 * @fileoverview Tab Amministrativo per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati amministrativi, abbonamenti e documenti contrattuali
 * @module components/dashboard/athlete-profile/athlete-administrative-tab
 */

'use client'

import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Badge } from '@/components/ui'
import type { BadgeProps } from '@/components/ui/badge'
import { useAthleteAdministrative } from '@/hooks/athlete-profile/use-athlete-administrative'
import { useAthleteAdministrativeForm } from '@/hooks/athlete-profile/use-athlete-administrative-form'
import { createClient } from '@/lib/supabase/client'
import { useProfileId } from '@/lib/utils/profile-id-utils'
import { useEffect, useState, useCallback } from 'react'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import {
  FileText,
  CreditCard,
  Calendar,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import type {
  TipoAbbonamentoEnum,
  StatoAbbonamentoEnum,
  MetodoPagamentoEnum,
  DocumentoContrattuale,
} from '@/types/athlete-profile'
import { sanitizeString } from '@/lib/sanitize'
import { cn } from '@/lib/utils'
import { ATHLETE_PROFILE_NESTED_CARD_CLASS } from './athlete-profile-ds'
import { AthleteProfileSectionHeading } from './athlete-profile-section-heading'

interface AthleteAdministrativeTabProps {
  athleteId: string
}

const TIPI_ABBONAMENTO: { value: TipoAbbonamentoEnum; label: string }[] = [
  { value: 'mensile', label: 'Mensile' },
  { value: 'trimestrale', label: 'Trimestrale' },
  { value: 'semestrale', label: 'Semestrale' },
  { value: 'annuale', label: 'Annuale' },
  { value: 'pacchetto_lezioni', label: 'Pacchetto Lezioni' },
  { value: 'nessuno', label: 'Nessuno' },
]

const STATI_ABBONAMENTO: { value: StatoAbbonamentoEnum; label: string }[] = [
  { value: 'attivo', label: 'Attivo' },
  { value: 'scaduto', label: 'Scaduto' },
  { value: 'sospeso', label: 'Sospeso' },
  { value: 'in_attesa', label: 'In Attesa' },
]

const METODI_PAGAMENTO: { value: MetodoPagamentoEnum; label: string }[] = [
  { value: 'carta', label: 'Carta di Credito' },
  { value: 'bonifico', label: 'Bonifico' },
  { value: 'contanti', label: 'Contanti' },
  { value: 'altro', label: 'Altro' },
]

const ADM_SELECT_CLS =
  'h-9 w-full min-w-0 rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-xs text-text-primary'
const ADM_INPUT_CLS = 'h-9 w-full min-w-0 border-white/10 bg-white/[0.04] text-xs'

/** Righe allineate come tab Anagrafica (colonna etichette fissa da sm). */
function AdmFieldRow({
  label,
  htmlFor,
  children,
  layout = 'split',
}: {
  label: string
  htmlFor?: string
  children: ReactNode
  layout?: 'split' | 'stacked'
}) {
  const gridClass =
    layout === 'stacked'
      ? 'grid grid-cols-1 gap-1.5'
      : 'grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(8.5rem,11rem)_1fr] sm:items-start sm:gap-x-5'
  return (
    <div className={gridClass}>
      <Label
        htmlFor={htmlFor}
        className={cn(
          'text-[10px] uppercase tracking-wide text-text-tertiary sm:pt-1.5',
          layout === 'stacked' && 'sm:pt-0',
        )}
      >
        {label}
      </Label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function AthleteAdministrativeTab({ athleteId }: AthleteAdministrativeTabProps) {
  const { data: administrative, isLoading, error } = useAthleteAdministrative(athleteId)
  const supabase = createClient()
  const athleteProfileId = useProfileId(athleteId)
  const [subscriptionData, setSubscriptionData] = useState<{
    totalPurchased: number
    totalUsed: number
    totalRemaining: number
  } | null>(null)
  const [invoices, setInvoices] = useState<
    Array<{
      id: string
      url: string
      payment_date: string
      amount: number
    }>
  >([])

  // Carica dati da payments (stessa logica di AthleteSubscriptionsTab)
  const loadSubscriptionData = useCallback(async () => {
    if (!athleteProfileId) return

    try {
      // Carica pagamenti (includendo invoice_url per le fatture)
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, lessons_purchased, status, invoice_url, payment_date, amount, created_at')
        .eq('athlete_id', athleteProfileId)
        .eq('status', 'completed')

      if (paymentsError) throw paymentsError

      // Carica appointments completati
      const { data: completedAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('athlete_id', athleteProfileId)
        .eq('status', 'completato')

      if (appointmentsError) throw appointmentsError

      // Calcola totali
      const totalPurchased = (payments || []).reduce(
        (sum: number, p: { lessons_purchased?: number | null }) => sum + (p.lessons_purchased || 0),
        0,
      )
      const totalUsed = completedAppointments?.length || 0
      const totalRemaining = totalPurchased - totalUsed

      setSubscriptionData({ totalPurchased, totalUsed, totalRemaining })

      // Carica anche le fatture (invoice_url) dai pagamenti
      const invoicesList = (payments || [])
        .filter((p: { invoice_url?: string | null }) => p.invoice_url)
        .map(
          (p: {
            id: string
            invoice_url?: string | null
            payment_date?: string | null
            created_at?: string | null
            amount?: number | null
          }) => ({
            id: p.id,
            url: p.invoice_url!,
            payment_date: p.payment_date ?? p.created_at ?? new Date().toISOString(),
            amount: p.amount || 0,
          }),
        )

      setInvoices(invoicesList)
    } catch (err) {
      console.error('Errore caricamento dati abbonamento', err)
      // Non bloccare la visualizzazione in caso di errore
    }
  }, [supabase, athleteProfileId])

  useEffect(() => {
    void loadSubscriptionData()
  }, [loadSubscriptionData])

  const {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    showUploadDocumento,
    setShowUploadDocumento,
    setUploadFile,
    documentoData,
    setDocumentoData,
    handleSave,
    handleCancel,
    handleUploadDocumento,
    updateMutation,
    uploadDocumentoMutation,
  } = useAthleteAdministrativeForm({ administrative: administrative ?? null, athleteId })

  // Memoizza calcolo stato abbonamento
  const statoAbbonamentoBadge = useMemo(() => {
    if (!administrative?.stato_abbonamento) return null
    const stato = administrative.stato_abbonamento
    const badges = {
      attivo: { color: 'success', icon: CheckCircle, text: 'Attivo' },
      scaduto: { color: 'destructive', icon: AlertCircle, text: 'Scaduto' },
      sospeso: { color: 'warning', icon: AlertCircle, text: 'Sospeso' },
      in_attesa: { color: 'secondary', icon: AlertCircle, text: 'In Attesa' },
    }
    return badges[stato]
  }, [administrative])

  // Memoizza calcolo scadenza abbonamento
  const scadenzaStatus = useMemo(() => {
    if (!administrative?.data_scadenza_abbonamento) return null
    const scadenza = new Date(administrative.data_scadenza_abbonamento)
    const oggi = new Date()
    const giorniRimanenti = Math.ceil((scadenza.getTime() - oggi.getTime()) / (1000 * 60 * 60 * 24))

    if (giorniRimanenti < 0) {
      return { status: 'scaduto', text: 'Scaduto' }
    } else if (giorniRimanenti <= 7) {
      return { status: 'in_scadenza', text: `Scade tra ${giorniRimanenti} giorni` }
    } else {
      return { status: 'valido', text: `Valido fino al ${scadenza.toLocaleDateString('it-IT')}` }
    }
  }, [administrative?.data_scadenza_abbonamento])

  // Memoizza lista documenti
  const documentiList = useMemo(
    () =>
      isEditing
        ? formData.documenti_contrattuali || []
        : administrative?.documenti_contrattuali || [],
    [isEditing, formData.documenti_contrattuali, administrative?.documenti_contrattuali],
  )

  // Combina documenti contrattuali e fatture per la visualizzazione
  const allDocuments = useMemo(() => {
    const docs: Array<{
      id: string
      nome: string
      tipo: string
      url: string
      data_upload: string
      note?: string
      source: 'contract' | 'invoice'
    }> = []

    // Aggiungi documenti contrattuali
    documentiList.forEach((doc: DocumentoContrattuale) => {
      docs.push({
        id: doc.url, // Usa URL come ID univoco
        nome: doc.nome,
        tipo: doc.tipo,
        url: doc.url,
        data_upload: doc.data_upload,
        note: doc.note,
        source: 'contract',
      })
    })

    // Aggiungi fatture dai pagamenti
    invoices.forEach((invoice) => {
      docs.push({
        id: invoice.id,
        nome: `Fattura ${new Date(invoice.payment_date).toLocaleDateString('it-IT')}`,
        tipo: 'Fattura',
        url: invoice.url,
        data_upload: invoice.payment_date,
        note: `Importo: €${invoice.amount.toFixed(2)}`,
        source: 'invoice',
      })
    })

    // Ordina per data (più recenti prima)
    return docs.sort((a, b) => {
      const dateA = new Date(a.data_upload).getTime()
      const dateB = new Date(b.data_upload).getTime()
      return dateB - dateA
    })
  }, [documentiList, invoices])

  if (isLoading) {
    return <LoadingState message="Caricamento dati amministrativi..." />
  }

  if (error) {
    return <ErrorState message="Errore nel caricamento dei dati amministrativi" />
  }

  const statoBadge = statoAbbonamentoBadge
  const StatoAbbonamentoIcon = statoBadge?.icon

  return (
    <>
      <Card variant="default" className={cn(ATHLETE_PROFILE_NESTED_CARD_CLASS, 'p-0')}>
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="min-w-0 text-center sm:text-left">
            <h2 className="flex items-center justify-center gap-2 text-base font-semibold text-text-primary sm:justify-start sm:text-lg">
              <CreditCard className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
              Dati Amministrativi
            </h2>
            <p className="mt-1 line-clamp-2 text-xs text-text-secondary sm:line-clamp-1">
              Abbonamenti, pagamenti e documenti contrattuali
            </p>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 text-xs touch-manipulation hover:border-primary/20 hover:bg-white/[0.04] sm:h-9 sm:w-auto sm:rounded-md"
            >
              <Edit className="h-3.5 w-3.5" />
              Modifica
            </Button>
          )}
        </div>

        <CardContent className="space-y-0 p-0">
          <AthleteProfileSectionHeading
            icon={CreditCard}
            trailing={
              statoBadge && StatoAbbonamentoIcon ? (
                <Badge variant={statoBadge.color as BadgeProps['variant']} size="sm">
                  <StatoAbbonamentoIcon className="mr-1 h-3 w-3" />
                  {statoBadge.text}
                </Badge>
              ) : undefined
            }
          >
            Abbonamento
          </AthleteProfileSectionHeading>
          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              <div className="space-y-4">
                <AdmFieldRow label="Tipo abbonamento" htmlFor="tipo_abbonamento">
                  {isEditing ? (
                    <select
                      id="tipo_abbonamento"
                      value={formData.tipo_abbonamento || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipo_abbonamento: (e.target.value || null) as TipoAbbonamentoEnum | null,
                        })
                      }
                      className={ADM_SELECT_CLS}
                    >
                      <option value="">Non specificato</option>
                      {TIPI_ABBONAMENTO.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm font-medium text-text-primary">
                      {administrative?.tipo_abbonamento
                        ? TIPI_ABBONAMENTO.find((t) => t.value === administrative.tipo_abbonamento)
                            ?.label || administrative.tipo_abbonamento
                        : '—'}
                    </span>
                  )}
                </AdmFieldRow>

                <AdmFieldRow label="Stato" htmlFor="stato_abbonamento">
                  {isEditing ? (
                    <select
                      id="stato_abbonamento"
                      value={formData.stato_abbonamento || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stato_abbonamento: (e.target.value ||
                            null) as StatoAbbonamentoEnum | null,
                        })
                      }
                      className={ADM_SELECT_CLS}
                    >
                      <option value="">Non specificato</option>
                      {STATI_ABBONAMENTO.map((stato) => (
                        <option key={stato.value} value={stato.value}>
                          {stato.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm font-medium text-text-primary">
                      {administrative?.stato_abbonamento
                        ? STATI_ABBONAMENTO.find(
                            (s) => s.value === administrative.stato_abbonamento,
                          )?.label || administrative.stato_abbonamento
                        : '—'}
                    </span>
                  )}
                </AdmFieldRow>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
                  <AdmFieldRow label="Data inizio" htmlFor="data_inizio" layout="stacked">
                    {isEditing ? (
                      <Input
                        id="data_inizio"
                        type="date"
                        value={formData.data_inizio_abbonamento || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            data_inizio_abbonamento: e.target.value || null,
                          })
                        }
                        className={ADM_INPUT_CLS}
                      />
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-text-tertiary" aria-hidden />
                        <span className="text-sm font-medium text-text-primary tabular-nums">
                          {administrative?.data_inizio_abbonamento
                            ? new Date(administrative.data_inizio_abbonamento).toLocaleDateString(
                                'it-IT',
                              )
                            : '—'}
                        </span>
                      </div>
                    )}
                  </AdmFieldRow>
                  <AdmFieldRow label="Data scadenza" htmlFor="data_scadenza" layout="stacked">
                    {isEditing ? (
                      <Input
                        id="data_scadenza"
                        type="date"
                        value={formData.data_scadenza_abbonamento || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            data_scadenza_abbonamento: e.target.value || null,
                          })
                        }
                        className={ADM_INPUT_CLS}
                      />
                    ) : (
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-text-tertiary" aria-hidden />
                        <span className="text-sm font-medium text-text-primary tabular-nums">
                          {administrative?.data_scadenza_abbonamento
                            ? new Date(administrative.data_scadenza_abbonamento).toLocaleDateString(
                                'it-IT',
                              )
                            : '—'}
                        </span>
                        {scadenzaStatus && administrative?.data_scadenza_abbonamento && (
                          <Badge
                            variant={
                              scadenzaStatus.status === 'scaduto'
                                ? 'destructive'
                                : scadenzaStatus.status === 'in_scadenza'
                                  ? 'warning'
                                  : 'success'
                            }
                            size="sm"
                            className="shrink-0"
                          >
                            {scadenzaStatus.text}
                          </Badge>
                        )}
                      </div>
                    )}
                  </AdmFieldRow>
                </div>
              </div>

              <div className="space-y-4">
                <AdmFieldRow label="Lezioni incluse">
                  <>
                    <span className="text-sm font-semibold tabular-nums text-text-primary">
                      {subscriptionData?.totalPurchased ?? administrative?.lezioni_incluse ?? 0}
                    </span>
                    <p className="mt-1 text-[10px] leading-snug text-text-tertiary">
                      Da pagamenti completati (sezione Abbonamenti).
                    </p>
                  </>
                </AdmFieldRow>

                <AdmFieldRow label="Lezioni utilizzate">
                  <>
                    <span className="text-sm font-medium tabular-nums text-text-primary">
                      {subscriptionData?.totalUsed ?? administrative?.lezioni_utilizzate ?? 0}
                    </span>
                    <p className="mt-1 text-[10px] leading-snug text-text-tertiary">
                      Da appuntamenti completati.
                    </p>
                  </>
                </AdmFieldRow>

                <AdmFieldRow label="Lezioni rimanenti">
                  <>
                    <span className="text-lg font-bold tabular-nums text-primary drop-shadow-[0_0_12px_rgba(2,179,191,0.35)]">
                      {subscriptionData?.totalRemaining ?? administrative?.lezioni_rimanenti ?? 0}
                    </span>
                    <p className="mt-1 text-[10px] leading-snug text-text-tertiary opacity-80">
                      Calcolato dal sistema.
                    </p>
                  </>
                </AdmFieldRow>

                <AdmFieldRow label="Metodo pagamento" htmlFor="metodo_pagamento">
                  {isEditing ? (
                    <select
                      id="metodo_pagamento"
                      value={formData.metodo_pagamento_preferito || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metodo_pagamento_preferito: (e.target.value ||
                            null) as MetodoPagamentoEnum | null,
                        })
                      }
                      className={ADM_SELECT_CLS}
                    >
                      <option value="">Non specificato</option>
                      {METODI_PAGAMENTO.map((metodo) => (
                        <option key={metodo.value} value={metodo.value}>
                          {metodo.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm font-medium text-text-primary">
                      {administrative?.metodo_pagamento_preferito
                        ? METODI_PAGAMENTO.find(
                            (m) => m.value === administrative.metodo_pagamento_preferito,
                          )?.label || administrative.metodo_pagamento_preferito
                        : '—'}
                    </span>
                  )}
                </AdmFieldRow>
              </div>
            </div>
          </div>

          <AthleteProfileSectionHeading
            icon={FileText}
            trailing={
              isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadDocumento(true)}
                  className="flex h-9 items-center gap-2 border-white/10 text-xs hover:border-primary/20 hover:bg-white/[0.04]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Aggiungi documento
                </Button>
              ) : undefined
            }
          >
            Documenti contrattuali
          </AthleteProfileSectionHeading>
          <div className="px-4 py-4 sm:px-5 sm:py-5">
            {allDocuments.length > 0 ? (
              <div className="space-y-3">
                {allDocuments.map((documento) => (
                  <div
                    key={documento.id}
                    className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3 sm:items-center">
                      <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                      <div className="min-w-0">
                        <p className="font-semibold text-text-primary">{documento.nome}</p>
                        <p className="text-sm text-text-secondary">
                          {documento.tipo} •{' '}
                          {new Date(documento.data_upload).toLocaleDateString('it-IT')}
                          {documento.note && ` • ${documento.note}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(documento.url, '_blank')}
                        className="border-white/10"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Apri
                      </Button>
                      {isEditing && documento.source === 'contract' && (
                        <Button variant="outline" size="sm" disabled className="border-white/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-text-tertiary" aria-hidden />
                <p className="text-text-secondary">Nessun documento contrattuale caricato</p>
              </div>
            )}
          </div>

          <AthleteProfileSectionHeading icon={FileText}>
            Note contrattuali
          </AthleteProfileSectionHeading>
          <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
            {isEditing ? (
              <Textarea
                value={formData.note_contrattuali || ''}
                maxLength={2000}
                onChange={(e) => {
                  const sanitized = sanitizeString(e.target.value, 2000)
                  setFormData({ ...formData, note_contrattuali: sanitized || null })
                }}
                placeholder="Note aggiuntive sui contratti..."
                rows={4}
                className="border-white/10 bg-white/[0.04] text-xs"
              />
            ) : administrative?.note_contrattuali ? (
              <p className="whitespace-pre-wrap rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-text-primary">
                {administrative.note_contrattuali}
              </p>
            ) : (
              <p className="py-4 text-center text-sm text-text-secondary">
                Nessuna nota contrattuale
              </p>
            )}
          </div>

          {isEditing && (
            <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-4 pb-4 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4 sm:px-5 sm:pb-5 sm:pt-5">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex h-11 w-full items-center justify-center gap-2 border-white/10 touch-manipulation hover:border-primary/20 hover:bg-white/[0.04] sm:h-auto sm:w-auto"
              >
                <X className="h-4 w-4" />
                Annulla
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex h-11 w-full items-center justify-center gap-2 touch-manipulation sm:h-auto sm:w-auto"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showUploadDocumento && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3"
          onClick={() => !uploadDocumentoMutation.isPending && setShowUploadDocumento(false)}
        >
          <Card className="w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b border-white/10 pb-2">
              <CardTitle className="text-sm font-bold text-text-primary">
                Carica documento contrattuale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="file-documento">File</Label>
                <Input
                  id="file-documento"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="border-white/10 bg-white/[0.04] text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome-documento">Nome documento</Label>
                <Input
                  id="nome-documento"
                  value={documentoData.nome}
                  maxLength={200}
                  onChange={(e) => {
                    const sanitized = sanitizeString(e.target.value, 200)
                    setDocumentoData({ ...documentoData, nome: sanitized || '' })
                  }}
                  placeholder="Es. Contratto abbonamento annuale"
                  className="border-white/10 bg-white/[0.04] text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo-documento">Tipo documento</Label>
                <Input
                  id="tipo-documento"
                  value={documentoData.tipo}
                  maxLength={100}
                  onChange={(e) => {
                    const sanitized = sanitizeString(e.target.value, 100)
                    setDocumentoData({ ...documentoData, tipo: sanitized || '' })
                  }}
                  placeholder="Es. Contratto, Fattura, ecc."
                  className="border-white/10 bg-white/[0.04] text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-documento">Note (opzionale)</Label>
                <Textarea
                  id="note-documento"
                  value={documentoData.note}
                  maxLength={500}
                  onChange={(e) => {
                    const sanitized = sanitizeString(e.target.value, 500)
                    setDocumentoData({ ...documentoData, note: sanitized || '' })
                  }}
                  placeholder="Note aggiuntive sul documento"
                  rows={2}
                  className="border-white/10 bg-white/[0.04] text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-white/10"
                  onClick={() => setShowUploadDocumento(false)}
                  disabled={uploadDocumentoMutation.isPending}
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleUploadDocumento}
                  disabled={uploadDocumentoMutation.isPending}
                >
                  {uploadDocumentoMutation.isPending ? 'Caricamento...' : 'Carica'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
