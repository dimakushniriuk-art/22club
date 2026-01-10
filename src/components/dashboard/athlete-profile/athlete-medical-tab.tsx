/**
 * @fileoverview Tab Medica per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati medici, certificati e referti
 * @module components/dashboard/athlete-profile/athlete-medical-tab
 */

'use client'

import { useMemo, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Badge } from '@/components/ui'
import type { BadgeProps } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'
import { useAthleteMedical } from '@/hooks/athlete-profile/use-athlete-medical'
import { useAthleteMedicalForm } from '@/hooks/athlete-profile/use-athlete-medical-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import {
  FileText,
  Upload,
  X,
  Edit,
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import type { RefertoMedico } from '@/types/athlete-profile'
import { sanitizeString } from '@/lib/sanitize'

interface AthleteMedicalTabProps {
  athleteId: string
}

export function AthleteMedicalTab({ athleteId }: AthleteMedicalTabProps) {
  const { data: medical, isLoading, error } = useAthleteMedical(athleteId)
  const supabase = createClient()

  const {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    showUploadCertificato,
    setShowUploadCertificato,
    showUploadReferto,
    setShowUploadReferto,
    uploadFile,
    setUploadFile,
    uploadTipo,
    setUploadTipo,
    uploadScadenza,
    setUploadScadenza,
    refertoData,
    setRefertoData,
    handleSave,
    handleCancel,
    handleUploadCertificato,
    handleUploadReferto,
    addArrayItem,
    removeArrayItem,
    updateMutation,
    uploadCertificatoMutation,
    uploadRefertoMutation,
  } = useAthleteMedicalForm({ medical: medical ?? null, athleteId })

  // Memoizza il calcolo dello stato certificato
  const certificatoStatus = useMemo(() => {
    if (!medical?.certificato_medico_scadenza) return null
    const scadenza = new Date(medical.certificato_medico_scadenza)
    const oggi = new Date()
    const giorniRimanenti = Math.ceil((scadenza.getTime() - oggi.getTime()) / (1000 * 60 * 60 * 24))

    if (giorniRimanenti < 0) {
      return { status: 'scaduto', color: 'destructive', text: 'Scaduto' }
    } else if (giorniRimanenti <= 30) {
      return {
        status: 'in_scadenza',
        color: 'warning',
        text: `Scade tra ${giorniRimanenti} giorni`,
      }
    } else {
      return {
        status: 'valido',
        color: 'success',
        text: `Valido fino al ${scadenza.toLocaleDateString('it-IT')}`,
      }
    }
  }, [medical?.certificato_medico_scadenza])

  // Memoizza liste array
  const allergieList = useMemo(() => formData.allergie || [], [formData.allergie])
  const patologieList = useMemo(() => formData.patologie || [], [formData.patologie])
  const refertiList = useMemo(
    () => (isEditing ? formData.referti_medici || [] : medical?.referti_medici || []),
    [isEditing, formData.referti_medici, medical?.referti_medici],
  )

  // Input controllati per aggiunta allergie/patologie (evita hack DOM e bug)
  const [newAllergia, setNewAllergia] = useState('')
  const [newPatologia, setNewPatologia] = useState('')

  useEffect(() => {
    if (!isEditing) {
      setNewAllergia('')
      setNewPatologia('')
    }
  }, [isEditing])

  const handleAddAllergia = () => {
    const sanitized = sanitizeString(newAllergia, 100)
    if (!sanitized) return
    addArrayItem('allergie', sanitized)
    setNewAllergia('')
  }

  const handleAddPatologia = () => {
    const sanitized = sanitizeString(newPatologia, 100)
    if (!sanitized) return
    addArrayItem('patologie', sanitized)
    setNewPatologia('')
  }

  const openPrivateStorageFile = async (bucket: string, urlOrPath: string) => {
    // Se è già un URL (bucket pubblico o signed già pronto), aprilo direttamente
    if (urlOrPath.startsWith('http')) {
      window.open(urlOrPath, '_blank')
      return
    }

    // Se è un path relativo (es. "/<athleteId>/file.pdf"), genera signed URL
    const path = urlOrPath.startsWith('/') ? urlOrPath.slice(1) : urlOrPath
    const { data, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 10) // 10 minuti

    if (signedError || !data?.signedUrl) {
      // fallback: non bloccare l'UI
      window.open(urlOrPath, '_blank')
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  if (isLoading) {
    return <LoadingState message="Caricamento dati medici..." />
  }

  if (error) {
    return <ErrorState message="Errore nel caricamento dei dati medici" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FileText className="h-6 w-6 text-teal-400" />
            Dati Medici
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Certificati, referti e informazioni mediche dell&apos;atleta
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  location: 'athlete-medical-tab.tsx:124',
                  message: 'Modifica button clicked',
                  data: {
                    currentIsEditing: isEditing,
                    setIsEditingType: typeof setIsEditing,
                    setIsEditingExists: !!setIsEditing,
                  },
                  timestamp: Date.now(),
                  sessionId: 'debug-session',
                  runId: 'run1',
                  hypothesisId: 'H1',
                }),
              }).catch(() => {})
              // #endregion
              setIsEditing(true)
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/0f58390d-439e-4525-abb4-d05407869369', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  location: 'athlete-medical-tab.tsx:140',
                  message: 'After setIsEditing(true)',
                  data: {},
                  timestamp: Date.now(),
                  sessionId: 'debug-session',
                  runId: 'run1',
                  hypothesisId: 'H1',
                }),
              }).catch(() => {})
              // #endregion
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifica
          </Button>
        )}
      </div>

      {/* Certificato Medico */}
      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-400" />
              Certificato Medico
            </CardTitle>
            {certificatoStatus && (
              <Badge variant={certificatoStatus.color as BadgeProps['variant']} size="sm">
                {certificatoStatus.status === 'scaduto' && <AlertCircle className="mr-1 h-3 w-3" />}
                {certificatoStatus.status === 'valido' && <CheckCircle className="mr-1 h-3 w-3" />}
                {certificatoStatus.text}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {medical?.certificato_medico_url ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-background-tertiary/30 rounded-lg border border-teal-500/10">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-teal-400" />
                  <div>
                    <p className="text-text-primary font-semibold">
                      Certificato {medical.certificato_medico_tipo || 'medico'}
                    </p>
                    {medical.certificato_medico_scadenza && (
                      <p className="text-text-secondary text-sm">
                        Scadenza:{' '}
                        {new Date(medical.certificato_medico_scadenza).toLocaleDateString('it-IT')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openPrivateStorageFile(
                        'athlete-certificates',
                        medical.certificato_medico_url!,
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apri
                  </Button>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUploadCertificato(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Sostituisci
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary mb-4">Nessun certificato caricato</p>
              {isEditing && (
                <Button
                  onClick={() => setShowUploadCertificato(true)}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Carica Certificato
                </Button>
              )}
            </div>
          )}

          {/* Modal Upload Certificato */}
          {showUploadCertificato && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3"
              onClick={() =>
                !uploadCertificatoMutation.isPending && setShowUploadCertificato(false)
              }
            >
              <Card
                className="w-full max-w-md relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 shadow-[0_0_14px_rgba(2,179,191,0.25)]"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader className="pb-2 border-b border-teal-500/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
                      Carica Certificato Medico
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowUploadCertificato(false)}
                      className="h-8 w-8 text-text-secondary hover:text-text-primary"
                      aria-label="Chiudi"
                      disabled={uploadCertificatoMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="file-certificato" className="text-xs">
                      File
                    </Label>
                    <div className="rounded-lg border border-teal-500/30 bg-background-secondary/50 p-3">
                      <Input
                        id="file-certificato"
                        type="file"
                        accept="application/pdf,image/jpeg,image/png,image/jpg"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="bg-transparent text-xs"
                        disabled={uploadCertificatoMutation.isPending}
                      />
                      <div className="mt-1.5 flex items-center justify-between">
                        <p className="text-[10px] text-text-tertiary">
                          Formati: PDF, JPG, PNG • max 20MB
                        </p>
                        {uploadFile && (
                          <span className="text-[10px] text-teal-300 truncate max-w-[180px]">
                            {uploadFile.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tipo-certificato" className="text-xs">
                      Tipo
                    </Label>
                    <select
                      id="tipo-certificato"
                      value={uploadTipo}
                      onChange={(e) =>
                        setUploadTipo(
                          e.target.value as 'agonistico' | 'non_agonistico' | 'sportivo',
                        )
                      }
                      className="w-full px-2.5 py-2 text-xs bg-background-secondary/50 border border-teal-500/30 rounded-lg text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                      disabled={uploadCertificatoMutation.isPending}
                    >
                      <option value="non_agonistico">Non Agonistico</option>
                      <option value="agonistico">Agonistico</option>
                      <option value="sportivo">Sportivo</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="scadenza-certificato" className="text-xs">
                      Data Scadenza
                    </Label>
                    <Input
                      id="scadenza-certificato"
                      type="date"
                      value={uploadScadenza}
                      onChange={(e) => setUploadScadenza(e.target.value)}
                      className="bg-background-secondary/50 text-xs border-teal-500/30"
                      disabled={uploadCertificatoMutation.isPending}
                    />
                  </div>

                  {uploadCertificatoMutation.isPending && (
                    <div className="flex items-center gap-2 text-text-secondary text-xs">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-300" />
                      Caricamento in corso...
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      onClick={() => setShowUploadCertificato(false)}
                      className="h-9 text-xs border-teal-500/30"
                      disabled={uploadCertificatoMutation.isPending}
                    >
                      Annulla
                    </Button>
                    <Button
                      onClick={handleUploadCertificato}
                      disabled={uploadCertificatoMutation.isPending || !uploadFile || !uploadTipo}
                      className="h-9 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                    >
                      {uploadCertificatoMutation.isPending ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Caricamento...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Upload className="h-3.5 w-3.5" />
                          Carica
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referti Medici */}
      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader className="pb-2 border-b border-teal-500/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center border border-teal-500/20">
                <FileText className="h-3.5 w-3.5 text-teal-300" />
              </div>
              <span className="bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
                Referti Medici
              </span>
            </CardTitle>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadReferto(true)}
                className="h-9 text-xs border-teal-500/30 hover:bg-teal-500/10 flex items-center gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Aggiungi
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {refertiList.length > 0 ? (
            <div className="space-y-3">
              {refertiList.map((referto: RefertoMedico, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-background-tertiary/30 rounded-lg border border-teal-500/10"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-teal-300" />
                    <div>
                      <p className="text-text-primary text-sm font-semibold">{referto.tipo}</p>
                      <p className="text-text-secondary text-xs">
                        {new Date(referto.data).toLocaleDateString('it-IT')}
                        {referto.note && ` • ${referto.note}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPrivateStorageFile('athlete-referti', referto.url)}
                    className="h-9 text-xs border-teal-500/30 hover:bg-teal-500/10"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    Apri
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-10 w-10 text-text-tertiary mx-auto mb-2.5" />
              <p className="text-text-secondary text-sm">Nessun referto caricato</p>
              {isEditing && (
                <p className="text-text-tertiary text-xs mt-1">
                  Carica PDF/JPG/PNG e tieni tutto ordinato.
                </p>
              )}
            </div>
          )}

          {/* Modal Upload Referto */}
          {showUploadReferto && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3"
              onClick={() => !uploadRefertoMutation.isPending && setShowUploadReferto(false)}
            >
              <Card
                className="w-full max-w-md relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 shadow-[0_0_14px_rgba(2,179,191,0.25)]"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader className="pb-2 border-b border-teal-500/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
                      Carica Referto Medico
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowUploadReferto(false)}
                      className="h-8 w-8 text-text-secondary hover:text-text-primary"
                      aria-label="Chiudi"
                      disabled={uploadRefertoMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="file-referto" className="text-xs">
                      File
                    </Label>
                    <div className="rounded-lg border border-teal-500/30 bg-background-secondary/50 p-3">
                      <Input
                        id="file-referto"
                        type="file"
                        accept="application/pdf,image/jpeg,image/png,image/jpg"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="bg-transparent text-xs"
                        disabled={uploadRefertoMutation.isPending}
                      />
                      <div className="mt-1.5 flex items-center justify-between">
                        <p className="text-[10px] text-text-tertiary">
                          Formati: PDF, JPG, PNG • max 20MB
                        </p>
                        {uploadFile && (
                          <span className="text-[10px] text-teal-300 truncate max-w-[180px]">
                            {uploadFile.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tipo-referto" className="text-xs">
                      Tipo referto
                    </Label>
                    <Input
                      id="tipo-referto"
                      value={refertoData.tipo}
                      onChange={(e) =>
                        setRefertoData({
                          ...refertoData,
                          tipo: sanitizeString(e.target.value, 50) || '',
                        })
                      }
                      placeholder="Es. Esami del sangue, RX..."
                      maxLength={50}
                      className="bg-background-secondary/50 text-xs border-teal-500/30"
                      disabled={uploadRefertoMutation.isPending}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="data-referto" className="text-xs">
                      Data
                    </Label>
                    <Input
                      id="data-referto"
                      type="date"
                      value={refertoData.data}
                      onChange={(e) => setRefertoData({ ...refertoData, data: e.target.value })}
                      className="bg-background-secondary/50 text-xs border-teal-500/30"
                      disabled={uploadRefertoMutation.isPending}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="note-referto" className="text-xs">
                      Note (opzionale)
                    </Label>
                    <Textarea
                      id="note-referto"
                      value={refertoData.note}
                      onChange={(e) =>
                        setRefertoData({
                          ...refertoData,
                          note: sanitizeString(e.target.value, 500) || '',
                        })
                      }
                      maxLength={500}
                      placeholder="Note aggiuntive sul referto"
                      className="bg-background-secondary/50 text-xs border-teal-500/30"
                      rows={3}
                      disabled={uploadRefertoMutation.isPending}
                    />
                  </div>

                  {uploadRefertoMutation.isPending && (
                    <div className="flex items-center gap-2 text-text-secondary text-xs">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-300" />
                      Caricamento in corso...
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      onClick={() => setShowUploadReferto(false)}
                      className="h-9 text-xs border-teal-500/30"
                      disabled={uploadRefertoMutation.isPending}
                    >
                      Annulla
                    </Button>
                    <Button
                      onClick={handleUploadReferto}
                      disabled={
                        uploadRefertoMutation.isPending ||
                        !uploadFile ||
                        !refertoData.tipo ||
                        !refertoData.data
                      }
                      className="h-9 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                    >
                      {uploadRefertoMutation.isPending ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Caricamento...
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Upload className="h-3.5 w-3.5" />
                          Carica
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allergie, Patologie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allergie */}
        <Card
          variant="trainer"
          className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
        >
          <CardHeader className="pb-2 border-b border-teal-500/20">
            <CardTitle className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
              Allergie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Aggiungi allergia"
                  value={newAllergia}
                  onChange={(e) => setNewAllergia(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddAllergia()
                    }
                  }}
                  maxLength={100}
                  className="bg-background-secondary/50 text-xs border-teal-500/30"
                />
                <Button
                  onClick={handleAddAllergia}
                  className="h-9 w-10 px-0 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {(isEditing ? allergieList : medical?.allergie || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(isEditing ? allergieList : medical?.allergie || []).map((allergia, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 text-[10px] border border-teal-500/20 bg-teal-500/10 text-white"
                  >
                    {allergia}
                    {isEditing && (
                      <X
                        className="h-3 w-3 cursor-pointer opacity-80 hover:opacity-100"
                        onClick={() => removeArrayItem('allergie', index)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-text-tertiary text-xs">
                {isEditing
                  ? 'Aggiungi eventuali allergie dell’atleta.'
                  : 'Nessuna allergia registrata.'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Patologie */}
        <Card
          variant="trainer"
          className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
        >
          <CardHeader className="pb-2 border-b border-teal-500/20">
            <CardTitle className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
              Patologie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Aggiungi patologia"
                  value={newPatologia}
                  onChange={(e) => setNewPatologia(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddPatologia()
                    }
                  }}
                  maxLength={100}
                  className="bg-background-secondary/50 text-xs border-teal-500/30"
                />
                <Button
                  onClick={handleAddPatologia}
                  className="h-9 w-10 px-0 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
            {(isEditing ? patologieList : medical?.patologie || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(isEditing ? patologieList : medical?.patologie || []).map((patologia, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 text-[10px] border border-teal-500/20 bg-teal-500/10 text-white"
                  >
                    {patologia}
                    {isEditing && (
                      <X
                        className="h-3 w-3 cursor-pointer opacity-80 hover:opacity-100"
                        onClick={() => removeArrayItem('patologie', index)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-text-tertiary text-xs">
                {isEditing
                  ? 'Aggiungi eventuali patologie dell’atleta.'
                  : 'Nessuna patologia registrata.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Note Mediche */}
      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader className="pb-2 border-b border-teal-500/20">
          <CardTitle className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
            Note Mediche
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          {isEditing ? (
            <Textarea
              value={formData.note_mediche || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  note_mediche: sanitizeString(e.target.value, 2000) || null,
                })
              }
              maxLength={2000}
              placeholder="Note mediche aggiuntive..."
              rows={4}
              className="bg-background-secondary/50 text-xs border-teal-500/30"
            />
          ) : medical?.note_mediche ? (
            <p className="text-text-primary text-sm whitespace-pre-wrap bg-background-tertiary/30 p-3 rounded-lg border border-teal-500/10">
              {medical.note_mediche}
            </p>
          ) : (
            <p className="text-text-tertiary text-center text-sm py-4">Nessuna nota medica</p>
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
