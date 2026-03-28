/**
 * @fileoverview Tab Medica per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati medici, certificati e referti
 * @module components/dashboard/athlete-profile/athlete-medical-tab
 */

'use client'

import { useMemo, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Badge } from '@/components/ui'
import type { BadgeProps } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'
import { isStoragePreviewBucket, storagePreviewHrefFromUrlOrPath } from '@/lib/documents'
import { ATHLETE_PROFILE_NESTED_CARD_CLASS } from './athlete-profile-ds'
import { AthleteProfileSectionHeading } from './athlete-profile-section-heading'

interface AthleteMedicalTabProps {
  athleteId: string
}

export function AthleteMedicalTab({ athleteId }: AthleteMedicalTabProps) {
  const { data: medical, isLoading, error } = useAthleteMedical(athleteId)

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

  const openPrivateStorageFile = (bucket: string, urlOrPath: string) => {
    if (isStoragePreviewBucket(bucket)) {
      const href = storagePreviewHrefFromUrlOrPath(bucket, urlOrPath)
      if (href) {
        window.open(href, '_blank', 'noopener,noreferrer')
        return
      }
    }
    window.open(urlOrPath, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) {
    return <LoadingState message="Caricamento dati medici..." />
  }

  if (error) {
    return <ErrorState message="Errore nel caricamento dei dati medici" />
  }

  return (
    <>
      <Card variant="default" className={cn(ATHLETE_PROFILE_NESTED_CARD_CLASS, 'p-0')}>
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="min-w-0 text-center sm:text-left">
            <h2 className="flex items-center justify-center gap-2 text-base font-semibold text-text-primary sm:justify-start sm:text-lg">
              <FileText className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
              Dati Medici
            </h2>
            <p className="mt-1 line-clamp-2 text-xs text-text-secondary sm:line-clamp-1">
              Certificati, referti e informazioni mediche dell&apos;atleta
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
            icon={FileText}
            trailing={
              certificatoStatus ? (
                <Badge variant={certificatoStatus.color as BadgeProps['variant']} size="sm">
                  {certificatoStatus.status === 'scaduto' && (
                    <AlertCircle className="mr-1 h-3 w-3" />
                  )}
                  {certificatoStatus.status === 'valido' && (
                    <CheckCircle className="mr-1 h-3 w-3" />
                  )}
                  {certificatoStatus.text}
                </Badge>
              ) : undefined
            }
          >
            Certificato medico
          </AthleteProfileSectionHeading>
          <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
            {medical?.certificato_medico_url ? (
              <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                  <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">
                      Certificato {medical.certificato_medico_tipo || 'medico'}
                    </p>
                    {medical.certificato_medico_scadenza && (
                      <p className="text-sm text-text-secondary">
                        Scadenza:{' '}
                        {new Date(medical.certificato_medico_scadenza).toLocaleDateString('it-IT')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
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
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Apri
                  </Button>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUploadCertificato(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Sostituisci
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-text-tertiary" aria-hidden />
                <p className="mb-4 text-text-secondary">Nessun certificato caricato</p>
                {isEditing && (
                  <Button
                    onClick={() => setShowUploadCertificato(true)}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Carica certificato
                  </Button>
                )}
              </div>
            )}
          </div>

          <AthleteProfileSectionHeading
            icon={FileText}
            trailing={
              isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadReferto(true)}
                  className="flex h-9 items-center gap-2 border-white/10 text-xs hover:border-primary/20 hover:bg-white/[0.04]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Aggiungi
                </Button>
              ) : undefined
            }
          >
            Referti medici
          </AthleteProfileSectionHeading>
          <div className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
            {refertiList.length > 0 ? (
              <div className="space-y-3">
                {refertiList.map((referto: RefertoMedico, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3 sm:items-center">
                      <FileText className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary">{referto.tipo}</p>
                        <p className="text-xs text-text-secondary">
                          {new Date(referto.data).toLocaleDateString('it-IT')}
                          {referto.note && ` • ${referto.note}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPrivateStorageFile('athlete-referti', referto.url)}
                      className="h-9 shrink-0 border-white/10 text-xs hover:border-primary/20 hover:bg-white/[0.04] sm:self-center"
                    >
                      <ExternalLink className="mr-2 h-3.5 w-3.5" />
                      Apri
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <FileText className="mx-auto mb-2.5 h-10 w-10 text-text-tertiary" aria-hidden />
                <p className="text-sm text-text-secondary">Nessun referto caricato</p>
                {isEditing && (
                  <p className="mt-1 text-xs text-text-tertiary">
                    Carica PDF/JPG/PNG e tieni tutto ordinato.
                  </p>
                )}
              </div>
            )}
          </div>

          <AthleteProfileSectionHeading icon={AlertCircle}>
            Allergie e patologie
          </AthleteProfileSectionHeading>
          <div className="px-4 py-4 sm:px-5 sm:py-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                  Allergie
                </p>
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
                      className="border-white/10 bg-white/[0.04] text-xs"
                    />
                    <Button
                      variant="default"
                      onClick={handleAddAllergia}
                      size="icon"
                      className="h-9 w-10 px-0"
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
                        className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] text-primary"
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
                  <p className="text-xs text-text-tertiary">
                    {isEditing
                      ? 'Aggiungi eventuali allergie dell’atleta.'
                      : 'Nessuna allergia registrata.'}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                  Patologie
                </p>
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
                      className="border-white/10 bg-white/[0.04] text-xs"
                    />
                    <Button
                      variant="default"
                      onClick={handleAddPatologia}
                      size="icon"
                      className="h-9 w-10 px-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {(isEditing ? patologieList : medical?.patologie || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? patologieList : medical?.patologie || []).map(
                      (patologia, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] text-primary"
                        >
                          {patologia}
                          {isEditing && (
                            <X
                              className="h-3 w-3 cursor-pointer opacity-80 hover:opacity-100"
                              onClick={() => removeArrayItem('patologie', index)}
                            />
                          )}
                        </Badge>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-text-tertiary">
                    {isEditing
                      ? 'Aggiungi eventuali patologie dell’atleta.'
                      : 'Nessuna patologia registrata.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <AthleteProfileSectionHeading icon={FileText}>Note mediche</AthleteProfileSectionHeading>
          <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
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
                className="border-white/10 bg-white/[0.04] text-xs"
              />
            ) : medical?.note_mediche ? (
              <p className="whitespace-pre-wrap rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-text-primary">
                {medical.note_mediche}
              </p>
            ) : (
              <p className="py-4 text-center text-sm text-text-tertiary">Nessuna nota medica</p>
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

      {showUploadCertificato && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3"
          onClick={() => !uploadCertificatoMutation.isPending && setShowUploadCertificato(false)}
        >
          <Card
            variant="default"
            className="w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-white/10 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-text-primary">
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
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
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
                      <span className="max-w-[180px] truncate text-[10px] text-primary">
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
                    setUploadTipo(e.target.value as 'agonistico' | 'non_agonistico' | 'sportivo')
                  }
                  className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs text-text-primary focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
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
                  className="border-white/10 bg-white/[0.04] text-xs"
                  disabled={uploadCertificatoMutation.isPending}
                />
              </div>

              {uploadCertificatoMutation.isPending && (
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Caricamento in corso...
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadCertificato(false)}
                  className="h-9 border-white/10 text-xs hover:border-primary/20"
                  disabled={uploadCertificatoMutation.isPending}
                >
                  Annulla
                </Button>
                <Button
                  variant="default"
                  onClick={handleUploadCertificato}
                  disabled={uploadCertificatoMutation.isPending || !uploadFile || !uploadTipo}
                  className="h-9 text-xs"
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

      {showUploadReferto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-3"
          onClick={() => !uploadRefertoMutation.isPending && setShowUploadReferto(false)}
        >
          <Card
            variant="default"
            className="w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-white/10 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-text-primary">
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
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
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
                      <span className="max-w-[180px] truncate text-[10px] text-primary">
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
                  className="border-white/10 bg-white/[0.04] text-xs"
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
                  className="border-white/10 bg-white/[0.04] text-xs"
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
                  className="border-white/10 bg-white/[0.04] text-xs"
                  rows={3}
                  disabled={uploadRefertoMutation.isPending}
                />
              </div>

              {uploadRefertoMutation.isPending && (
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Caricamento in corso...
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadReferto(false)}
                  className="h-9 border-white/10 text-xs hover:border-primary/20"
                  disabled={uploadRefertoMutation.isPending}
                >
                  Annulla
                </Button>
                <Button
                  variant="default"
                  onClick={handleUploadReferto}
                  disabled={
                    uploadRefertoMutation.isPending ||
                    !uploadFile ||
                    !refertoData.tipo ||
                    !refertoData.data
                  }
                  className="h-9 text-xs"
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
    </>
  )
}
