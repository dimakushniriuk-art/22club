'use client'

/**
 * Pagina Documenti atleta – /home/documenti
 *
 * Mostra in un’unica lista tutti i documenti dell’atleta: tabella documents (certificati,
 * liberatorie, contratti, dossier onboarding), certificato/referti da athlete_medical_data,
 * documenti contrattuali da athlete_administrative_data, fatture da payments (invoice_url).
 *
 * Funzionalità:
 * - Lista unificata con categoria, label, date, stato (valido/in_scadenza/scaduto), note.
 * - Visualizza: apre il documento in nuova scheda (signed → proxy /api/document-preview).
 * - Carica: upload nuovo documento (PDF/JPG); se categoria “altro” si apre dialog per scegliere.
 * - Nuovo: sostituzione documento (solo per documenti sostituibili, es. scaduti).
 *
 * Dati: getAllAthleteDocuments(profileId, userId) in lib/all-athlete-documents.ts.
 * Storage: bucket documents (privato); RLS per dossier, fatture, path profile_id.
 */

import type { ReactNode } from 'react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Loader2,
  Upload,
  XCircle,
} from 'lucide-react'
import { PageHeaderFixed } from '@/components/layout'
import { getAllAthleteDocuments, type UnifiedDocumentItem } from '@/lib/all-athlete-documents'
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  SimpleSelect,
} from '@/components/ui'
import { useAuth } from '@/providers/auth-provider'
import { formatDate } from '@/lib/format'
import { createLogger } from '@/lib/logger'
import { notifyError, notifySuccess } from '@/lib/notifications'
import { useNotify } from '@/lib/ui/notify'
import { isValidProfile } from '@/lib/utils/type-guards'
import { uploadDocument, validateDocumentFile } from '@/lib/documents'

const logger = createLogger('app:home:documenti:page')

const CATEGORIE_UPLOAD = [
  { value: 'certificato', label: 'Certificato Medico' },
  { value: 'liberatoria', label: 'Liberatoria' },
  { value: 'contratto', label: 'Contratto' },
  { value: 'altro', label: 'Altro' },
] as const

type DocStatus = 'valido' | 'scaduto' | 'in-revisione' | 'in_scadenza' | 'non_valido'
type BadgeVariant = 'primary' | 'success' | 'warning' | 'neutral' | 'outline' | 'secondary'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-white/20 transition-all duration-200'

function getStatusColor(status: DocStatus): BadgeVariant {
  switch (status) {
    case 'valido':
      return 'success'
    case 'in_scadenza':
    case 'scaduto':
    case 'non_valido':
      return 'warning'
    case 'in-revisione':
      return 'neutral'
    default:
      return 'neutral'
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'valido':
      return 'Valido'
    case 'in_scadenza':
      return 'In scadenza'
    case 'scaduto':
      return 'Scaduto'
    case 'non_valido':
      return 'Non valido'
    default:
      return 'Sconosciuto'
  }
}

function getCategoryText(category: string): string {
  switch (category) {
    case 'certificato':
      return 'Certificato'
    case 'liberatoria':
      return 'Liberatoria'
    case 'contratto':
      return 'Contratto'
    case 'altro':
      return 'Altro'
    case 'dossier_onboarding':
      return 'Dossier onboarding'
    case 'referto':
      return 'Referto medico'
    case 'fattura':
      return 'Fattura'
    default:
      return category
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
  }
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case 'certificato':
      return '🏥'
    case 'liberatoria':
      return '📝'
    case 'contratto':
      return '📋'
    case 'altro':
      return '📄'
    case 'dossier_onboarding':
      return '📁'
    case 'referto':
      return '🩺'
    case 'fattura':
      return '🧾'
    default:
      return '📄'
  }
}

function getStatusIcon(status: string): ReactNode {
  switch (status) {
    case 'valido':
      return <CheckCircle className="h-3.5 w-3.5" />
    case 'in_scadenza':
    case 'scaduto':
    case 'non_valido':
      return <XCircle className="h-3.5 w-3.5" />
    default:
      return <FileText className="h-3.5 w-3.5" />
  }
}

/**
 * Contenuto principale della pagina documenti: header, statistiche (validi/in scadenza),
 * lista card documenti, card info, dialog categoria per upload.
 * Richiede utente autenticato con profilo valido (athlete).
 */
function DocumentiPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { notify } = useNotify()

  /** documents + payments usano profiles.id; medical + administrative usano profiles.user_id */
  const athleteProfileId = user?.id ?? null
  const athleteUserId = user?.user_id ?? null

  const isValidUser = user && isValidProfile(user)

  const [allDocuments, setAllDocuments] = useState<UnifiedDocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('certificato')

  const fetchAllDocuments = useCallback(async () => {
    if (!athleteProfileId) return
    try {
      setLoading(true)
      const list = await getAllAthleteDocuments(athleteProfileId, athleteUserId)
      setAllDocuments(list)
    } catch (error) {
      logger.error('Errore nel caricamento documenti', error, {
        athleteProfileId,
        athleteUserId,
      })
    } finally {
      setLoading(false)
    }
  }, [athleteProfileId, athleteUserId])

  useEffect(() => {
    if (!athleteProfileId) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const list = await getAllAthleteDocuments(athleteProfileId, athleteUserId)
        if (cancelled) return
        setAllDocuments(list)
      } catch (error) {
        if (!cancelled) {
          logger.error('Errore nel caricamento documenti', error, {
            athleteProfileId,
            athleteUserId,
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [athleteProfileId, athleteUserId])

  const openDocument = useCallback((item: UnifiedDocumentItem) => {
    const url =
      item.open.type === 'signed'
        ? `/api/document-preview?bucket=${encodeURIComponent(item.open.bucket)}&path=${encodeURIComponent(item.open.path)}`
        : item.open.url
    if (url) window.open(url, '_blank')
  }, [])

  const performUpload = useCallback(
    async (file: File, category: string) => {
      if (!athleteProfileId) {
        notify('Profilo non disponibile. Ricarica la pagina e riprova.', 'error', 'Errore autenticazione')
        return
      }
      try {
        setUploading(true)
        await uploadDocument(file, category, athleteProfileId, athleteProfileId)
        await fetchAllDocuments()
        notifySuccess('Documento caricato con successo!')
      } catch (error) {
        logger.error("Errore durante l'upload", error, { athleteProfileId, category })
        const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
        notifyError('Errore nel caricamento del documento', errorMessage)
      } finally {
        setUploading(false)
      }
    },
    [athleteProfileId, fetchAllDocuments, notify],
  )

  const handleUploadDocument = useCallback(
    async (category?: string) => {
      if (!athleteProfileId) {
        notifyError('Errore', 'Devi essere autenticato per caricare documenti')
        return
      }
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = '.pdf,.jpg,.jpeg,.png'
      fileInput.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return
        const validation = validateDocumentFile(file)
        if (!validation.valid) {
          notifyError('Errore validazione file', validation.error)
          return
        }
        const finalCategory = category || 'altro'
        if (!finalCategory || finalCategory === 'altro') {
          setPendingFile(file)
          setSelectedCategory('certificato')
          setShowCategoryDialog(true)
          return
        }
        await performUpload(file, finalCategory)
      }
      fileInput.click()
    },
    [athleteProfileId, performUpload],
  )

  const handleUploadNew = useCallback(
    async (item: UnifiedDocumentItem) => {
      if (item.source !== 'documents' || !item.canReplace) return
      await handleUploadDocument(item.categoryKey)
    },
    [handleUploadDocument],
  )

  const handleCategoryConfirm = useCallback(async () => {
    if (!pendingFile) return
    setShowCategoryDialog(false)
    const fileToUpload = pendingFile
    setPendingFile(null)
    await performUpload(fileToUpload, selectedCategory)
  }, [pendingFile, selectedCategory, performUpload])

  const handleBack = useCallback(() => router.back(), [router])

  /**
   * Apre file picker per caricare un documento (PDF/JPG).
   * Se category assente o "altro", mostra dialog per scegliere categoria prima dell’upload.
   */
  const validCount = useMemo(
    () => allDocuments.filter((d) => d.status === 'valido').length,
    [allDocuments],
  )
  const expiringCount = useMemo(
    () => allDocuments.filter((d) => d.status === 'in_scadenza').length,
    [allDocuments],
  )

  if (!user || !isValidUser) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-background px-4 py-5 pb-24 safe-area-inset-bottom">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-background-tertiary" />
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-background-tertiary" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-background px-4 py-5 pb-24 safe-area-inset-bottom">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 rounded bg-background-tertiary" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-background-tertiary" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <PageHeaderFixed
        title="I miei Documenti"
        subtitle="Gestisci i tuoi certificati e documenti"
        onBack={handleBack}
        icon={<FileText className="h-5 w-5 text-cyan-400" />}
      />
      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-4 pb-24 pt-24 safe-area-inset-bottom sm:space-y-6 sm:px-5 min-[834px]:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => handleUploadDocument()}
            disabled={uploading}
            className="min-h-[44px] gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Carica
              </>
            )}
          </Button>
        </div>

        {/* Stats - card compatte */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card className={`relative overflow-hidden ${CARD_DS}`}>
            <div className="absolute left-0 top-0 h-full w-1 bg-white" aria-hidden />
            <CardContent className="relative z-10 flex items-center gap-3 p-3 sm:p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <CheckCircle className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Validi
                </p>
                <p className="text-xl font-bold tabular-nums leading-tight text-text-primary sm:text-2xl">
                  {validCount}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className={`relative overflow-hidden ${CARD_DS}`}>
            <div className="absolute left-0 top-0 h-full w-1 bg-state-warn" aria-hidden />
            <CardContent className="relative z-10 flex items-center gap-3 p-3 sm:p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <Clock className="h-4 w-4 text-state-warn" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  In scadenza
                </p>
                <p className="text-xl font-bold tabular-nums leading-tight text-state-warn sm:text-2xl">
                  {expiringCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista documenti */}
        {allDocuments.length === 0 ? (
          <Card className={`relative overflow-hidden ${CARD_DS}`}>
            <CardContent className="relative z-10 px-4 py-8 text-center sm:px-6 sm:py-10">
              <div className="mb-3 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-2xl">
                  📄
                </div>
              </div>
              <h3 className="mb-1.5 text-base font-bold text-text-primary md:text-lg">
                Nessun documento caricato
              </h3>
              <p className="mb-4 text-sm text-text-secondary">Caricane uno ora per iniziare</p>
              <Button
                onClick={() => handleUploadDocument()}
                disabled={uploading}
                className="min-h-[44px] gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Caricamento...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Carica primo documento
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {allDocuments.map((item) => (
              <Card key={item.id} className={`relative overflow-hidden ${CARD_DS}`}>
                <div className="absolute left-0 top-0 h-full w-1 bg-white" aria-hidden />
                <CardContent className="relative z-10 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-base">
                        {getCategoryIcon(item.categoryKey)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-text-primary md:text-base">
                            {item.source === 'documents'
                              ? getCategoryText(item.categoryKey)
                              : item.category}
                          </h3>
                          {item.status != null && (
                            <Badge variant={getStatusColor(item.status as DocStatus)} size="sm" className="shrink-0 text-xs">
                              {getStatusIcon(item.status)}
                              {getStatusText(item.status)}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0 text-cyan-400" />
                            <p className="truncate text-xs text-text-secondary">{item.label}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 shrink-0 text-text-tertiary" />
                            <p className="truncate text-xs text-text-tertiary">
                              {item.source === 'documents'
                                ? `Caricato il ${formatDate(item.date)}`
                                : formatDate(item.date)}
                            </p>
                          </div>
                          {item.expires_at && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 shrink-0 text-text-tertiary" />
                              <span className="text-xs text-text-tertiary">
                                Scade il {formatDate(item.expires_at)}
                              </span>
                            </div>
                          )}
                        </div>
                        {item.notes && (
                          <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-2">
                            <p className="line-clamp-2 text-xs text-text-secondary">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        onClick={() => openDocument(item)}
                        className="min-h-[44px] shrink-0 gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Eye className="h-4 w-4" />
                        Visualizza
                      </Button>
                      {item.canReplace && (
                        <Button
                          variant="outline"
                          onClick={() => handleUploadNew(item)}
                          className="min-h-[44px] shrink-0 rounded-lg border border-white/10 text-text-primary hover:bg-white/5"
                        >
                          <Upload className="h-4 w-4" />
                          Nuovo
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info compatta */}
        <Card className={`relative overflow-hidden ${CARD_DS}`}>
          <div className="absolute left-0 top-0 h-full w-1 bg-state-warn" aria-hidden />
          <CardContent className="relative z-10 flex items-center gap-3 p-3 sm:p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <AlertTriangle className="h-4 w-4 text-state-warn" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-bold text-text-primary md:text-base">
                Informazioni importanti
              </h4>
              <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-text-secondary md:text-sm">
                Certificati annuali, liberatorie 2 anni, contratti a scadenza. Carica PDF o JPG.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog categoria upload - SimpleSelect */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-[90vw] border border-white/10 bg-background-secondary">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-text-primary md:text-lg">
              Seleziona Categoria Documento
            </DialogTitle>
            <DialogDescription className="text-sm text-text-secondary">
              Scegli la categoria del documento che stai caricando
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <SimpleSelect
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              placeholder="Categoria"
              options={[...CATEGORIE_UPLOAD]}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCategoryDialog(false)
                setPendingFile(null)
              }}
              className="min-h-[44px] rounded-lg border border-white/10 text-text-primary hover:bg-white/5"
            >
              Annulla
            </Button>
            <Button
              onClick={handleCategoryConfirm}
              disabled={uploading}
              className="min-h-[44px] rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Caricamento...
                </>
              ) : (
                'Conferma e Carica'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Pagina /home/documenti: wrapper con Suspense e fallback skeleton.
 */
export default function DocumentiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-background px-4 py-5 pb-24 safe-area-inset-bottom">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-background-tertiary" />
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-lg bg-background-tertiary" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <DocumentiPageContent />
    </Suspense>
  )
}
