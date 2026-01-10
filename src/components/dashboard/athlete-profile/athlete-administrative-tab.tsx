/**
 * @fileoverview Tab Amministrativo per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati amministrativi, abbonamenti e documenti contrattuali
 * @module components/dashboard/athlete-profile/athlete-administrative-tab
 */

'use client'

import { useMemo } from 'react'
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
        (sum, p) => sum + (p.lessons_purchased || 0),
        0,
      )
      const totalUsed = completedAppointments?.length || 0
      const totalRemaining = totalPurchased - totalUsed

      setSubscriptionData({ totalPurchased, totalUsed, totalRemaining })

      // Carica anche le fatture (invoice_url) dai pagamenti
      const invoicesList = (payments || [])
        .filter((p) => p.invoice_url)
        .map((p) => ({
          id: p.id,
          url: p.invoice_url!,
          payment_date: p.payment_date ?? p.created_at ?? new Date().toISOString(),
          amount: p.amount || 0,
        }))

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-teal-400" />
            Dati Amministrativi
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Abbonamenti, pagamenti e documenti contrattuali
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifica
          </Button>
        )}
      </div>

      {/* Abbonamento */}
      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-teal-400" />
              Abbonamento
            </CardTitle>
            {statoBadge && (
              <Badge variant={statoBadge.color as BadgeProps['variant']} size="sm">
                <statoBadge.icon className="mr-1 h-3 w-3" />
                {statoBadge.text}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_abbonamento">Tipo Abbonamento</Label>
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
                    className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-text-primary"
                  >
                    <option value="">Non specificato</option>
                    {TIPI_ABBONAMENTO.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  administrative?.tipo_abbonamento && (
                    <p className="text-text-primary text-base font-semibold">
                      {TIPI_ABBONAMENTO.find((t) => t.value === administrative.tipo_abbonamento)
                        ?.label || administrative.tipo_abbonamento}
                    </p>
                  )
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stato_abbonamento">Stato</Label>
                {isEditing ? (
                  <select
                    id="stato_abbonamento"
                    value={formData.stato_abbonamento || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stato_abbonamento: (e.target.value || null) as StatoAbbonamentoEnum | null,
                      })
                    }
                    className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-text-primary"
                  >
                    <option value="">Non specificato</option>
                    {STATI_ABBONAMENTO.map((stato) => (
                      <option key={stato.value} value={stato.value}>
                        {stato.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  administrative?.stato_abbonamento && (
                    <p className="text-text-primary text-base">
                      {STATI_ABBONAMENTO.find((s) => s.value === administrative.stato_abbonamento)
                        ?.label || administrative.stato_abbonamento}
                    </p>
                  )
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inizio">Data Inizio</Label>
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
                    />
                  ) : (
                    administrative?.data_inizio_abbonamento && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-text-tertiary" />
                        <p className="text-text-primary text-base">
                          {new Date(administrative.data_inizio_abbonamento).toLocaleDateString(
                            'it-IT',
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_scadenza">Data Scadenza</Label>
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
                    />
                  ) : (
                    administrative?.data_scadenza_abbonamento && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-text-tertiary" />
                        <p className="text-text-primary text-base">
                          {new Date(administrative.data_scadenza_abbonamento).toLocaleDateString(
                            'it-IT',
                          )}
                        </p>
                        {scadenzaStatus && (
                          <Badge
                            variant={
                              scadenzaStatus.status === 'scaduto'
                                ? 'destructive'
                                : scadenzaStatus.status === 'in_scadenza'
                                  ? 'warning'
                                  : 'success'
                            }
                            size="sm"
                            className="ml-2"
                          >
                            {scadenzaStatus.text}
                          </Badge>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lezioni_incluse">Lezioni Incluse</Label>
                <p className="text-text-primary text-base font-semibold">
                  {subscriptionData?.totalPurchased ?? administrative?.lezioni_incluse ?? 0}
                </p>
                <p className="text-text-secondary text-xs">
                  (Calcolato dai pagamenti nella sezione Abbonamenti)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lezioni_utilizzate">Lezioni Utilizzate</Label>
                <p className="text-text-primary text-base">
                  {subscriptionData?.totalUsed ?? administrative?.lezioni_utilizzate ?? 0}
                </p>
                <p className="text-text-secondary text-xs">
                  (Calcolato dagli appuntamenti completati)
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wide text-text-tertiary">
                  Lezioni Rimanenti
                </Label>
                <p className="text-text-primary text-lg font-bold text-teal-300">
                  {subscriptionData?.totalRemaining ?? administrative?.lezioni_rimanenti ?? 0}
                </p>
                <p className="text-text-secondary text-[10px] opacity-60">
                  Calcolato automaticamente dal sistema
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodo_pagamento">Metodo Pagamento Preferito</Label>
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
                    className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-text-primary"
                  >
                    <option value="">Non specificato</option>
                    {METODI_PAGAMENTO.map((metodo) => (
                      <option key={metodo.value} value={metodo.value}>
                        {metodo.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  administrative?.metodo_pagamento_preferito && (
                    <p className="text-text-primary text-base">
                      {METODI_PAGAMENTO.find(
                        (m) => m.value === administrative.metodo_pagamento_preferito,
                      )?.label || administrative.metodo_pagamento_preferito}
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documenti Contrattuali */}
      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-400" />
              Documenti Contrattuali
            </CardTitle>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadDocumento(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Aggiungi Documento
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          {allDocuments.length > 0 ? (
            <div className="space-y-3">
              {allDocuments.map((documento) => (
                <div
                  key={documento.id}
                  className="flex items-center justify-between p-4 bg-background-tertiary/30 rounded-lg border border-teal-500/10"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-teal-400" />
                    <div>
                      <p className="text-text-primary font-semibold">{documento.nome}</p>
                      <p className="text-text-secondary text-sm">
                        {documento.tipo} •{' '}
                        {new Date(documento.data_upload).toLocaleDateString('it-IT')}
                        {documento.note && ` • ${documento.note}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(documento.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apri
                    </Button>
                    {isEditing && documento.source === 'contract' && (
                      <Button variant="outline" size="sm" disabled>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">Nessun documento contrattuale caricato</p>
            </div>
          )}

          {/* Modal Upload Documento */}
          {showUploadDocumento && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Carica Documento Contrattuale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-documento">File</Label>
                    <Input
                      id="file-documento"
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/jpg"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome-documento">Nome Documento</Label>
                    <Input
                      id="nome-documento"
                      value={documentoData.nome}
                      maxLength={200}
                      onChange={(e) => {
                        const sanitized = sanitizeString(e.target.value, 200)
                        setDocumentoData({ ...documentoData, nome: sanitized || '' })
                      }}
                      placeholder="Es. Contratto abbonamento annuale"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo-documento">Tipo Documento</Label>
                    <Input
                      id="tipo-documento"
                      value={documentoData.tipo}
                      maxLength={100}
                      onChange={(e) => {
                        const sanitized = sanitizeString(e.target.value, 100)
                        setDocumentoData({ ...documentoData, tipo: sanitized || '' })
                      }}
                      placeholder="Es. Contratto, Fattura, ecc."
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
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowUploadDocumento(false)}>
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
        </CardContent>
      </Card>

      {/* Note Contrattuali */}
      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <CardTitle className="text-lg">Note Contrattuali</CardTitle>
        </CardHeader>
        <CardContent>
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
            />
          ) : administrative?.note_contrattuali ? (
            <p className="text-text-primary whitespace-pre-wrap bg-background-tertiary/30 p-4 rounded-lg border border-teal-500/10">
              {administrative.note_contrattuali}
            </p>
          ) : (
            <p className="text-text-secondary text-center py-4">Nessuna nota contrattuale</p>
          )}
        </CardContent>
      </Card>

      {/* Pulsanti azione */}
      {isEditing && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </div>
      )}
    </div>
  )
}
