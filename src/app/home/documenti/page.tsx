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
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Loader2,
  Upload,
  XCircle,
} from 'lucide-react'
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

const HEADER_STYLE = {
  border: '1px solid rgba(2, 179, 191, 0.4)',
  background: 'linear-gradient(135deg, rgba(2,179,191,0.09) 0%, rgba(2,179,191,0.02) 50%, rgba(6,182,212,0.05) 100%)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(2,179,191,0.1) inset',
} as const
const HEADER_OVERLAY_STYLE = {
  background: 'radial-gradient(ellipse 85% 60% at 50% 0%, rgba(2,179,191,0.14) 0%, transparent 65%)',
} as const
const CARD_VALIDI_STYLE = {
  background: 'linear-gradient(145deg, rgba(6,182,212,0.16) 0%, rgba(2,179,191,0.05) 50%, rgba(22,22,26,0.85) 100%)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(6,182,212,0.12) inset',
} as const
const CARD_SCADENZA_STYLE = {
  background: 'linear-gradient(145deg, rgba(255,193,7,0.12) 0%, rgba(255,193,7,0.03) 50%, rgba(22,22,26,0.85) 100%)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,193,7,0.15) inset',
} as const
const CARD_DOC_STYLE = {
  borderColor: 'rgba(2, 179, 191, 0.35)',
  background: 'linear-gradient(145deg, rgba(26,26,30,0.9) 0%, rgba(22,22,26,0.92) 100%)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.02) inset',
} as const
const CARD_EMPTY_STYLE = {
  borderColor: 'rgba(2, 179, 191, 0.35)',
  background: 'linear-gradient(145deg, rgba(22,22,26,0.95) 0%, rgba(16,16,18,0.98) 100%)',
  boxShadow: '0 2px 16px rgba(0,0,0,0.2), 0 0 0 1px rgba(2,179,191,0.08) inset',
} as const
const CARD_INFO_STYLE = {
  background: 'linear-gradient(145deg, rgba(26,26,30,0.9) 0%, rgba(22,22,26,0.92) 100%)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.02) inset',
} as const

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
      <div className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 pt-5 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6 min-[834px]:pb-24 min-[834px]:pt-6">
        {/* Header - glass + accento teal */}
        <div
          className="relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl min-[834px]:p-5"
          style={HEADER_STYLE}
        >
          <div
            className="absolute inset-0 rounded-2xl opacity-70"
            style={HEADER_OVERLAY_STYLE}
            aria-hidden
          />
          <div className="relative z-10 flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="h-10 min-h-[44px] min-w-[44px] shrink-0 rounded-xl p-0 text-text-secondary transition-colors duration-200 hover:bg-primary/15 hover:text-primary"
              aria-label="Indietro"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl min-[834px]:h-14 min-[834px]:w-14"
                style={{ backgroundColor: 'rgba(2, 179, 191, 0.2)', border: '1px solid rgba(2, 179, 191, 0.35)' }}
              >
                <FileText className="h-6 w-6 min-[834px]:h-7 min-[834px]:w-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                  I miei Documenti
                </h1>
                <p className="mt-0.5 truncate text-xs text-text-tertiary">
                  Gestisci i tuoi certificati e documenti
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleUploadDocument()}
              disabled={uploading}
              className="min-h-[44px] shrink-0 gap-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50"
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
        </div>

        {/* Stats - card compatte */}
        <div className="grid grid-cols-2 gap-3 min-[834px]:gap-4">
          <Card
            className="relative overflow-hidden rounded-xl border border-cyan-400/50 backdrop-blur-md"
            style={CARD_VALIDI_STYLE}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400" aria-hidden />
            <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/20">
                <CheckCircle className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Validi
                </p>
                <p className="text-xl font-bold tabular-nums leading-tight text-cyan-400 min-[834px]:text-2xl">
                  {validCount}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="relative overflow-hidden rounded-xl border border-state-warn/50 backdrop-blur-md"
            style={CARD_SCADENZA_STYLE}
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-state-warn" aria-hidden />
            <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-state-warn/40 bg-state-warn/20">
                <Clock className="h-4 w-4 text-state-warn" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  In scadenza
                </p>
                <p className="text-xl font-bold tabular-nums leading-tight text-state-warn min-[834px]:text-2xl">
                  {expiringCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista documenti */}
        {allDocuments.length === 0 ? (
          <Card
            className="relative overflow-hidden rounded-xl border border-primary/35 backdrop-blur-md"
            style={CARD_EMPTY_STYLE}
          >
            <CardContent className="relative z-10 px-4 py-8 text-center min-[834px]:px-6 min-[834px]:py-10">
              <div className="mb-3 text-4xl opacity-50">📄</div>
              <h3 className="mb-1.5 text-base font-bold text-text-primary md:text-lg">
                Nessun documento caricato
              </h3>
              <p className="mb-4 text-sm text-text-secondary">Caricane uno ora per iniziare</p>
              <Button
                onClick={() => handleUploadDocument()}
                disabled={uploading}
                className="min-h-[44px] gap-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50"
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
          <div className="space-y-3 min-[834px]:space-y-4">
            {allDocuments.map((item) => (
              <Card
                key={item.id}
                className="relative overflow-hidden rounded-xl border border-primary/35 backdrop-blur-md"
                style={CARD_DOC_STYLE}
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-primary" aria-hidden />
                <CardContent className="relative z-10 p-4 min-[834px]:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/20 text-base">
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
                            <FileText className="h-4 w-4 shrink-0 text-primary" />
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
                          <div className="mt-2 rounded-lg border border-primary/15 bg-background-tertiary/30 p-2">
                            <p className="line-clamp-2 text-xs text-text-secondary">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        onClick={() => openDocument(item)}
                        className="min-h-[44px] shrink-0 gap-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-400"
                      >
                        <Eye className="h-4 w-4" />
                        Visualizza
                      </Button>
                      {item.canReplace && (
                        <Button
                          variant="outline"
                          onClick={() => handleUploadNew(item)}
                          className="min-h-[44px] shrink-0 rounded-xl border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/15"
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
        <Card
          className="relative overflow-hidden rounded-xl border border-state-warn/40 backdrop-blur-md"
          style={CARD_INFO_STYLE}
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-state-warn" aria-hidden />
          <CardContent className="relative z-10 flex items-center gap-3 p-3 min-[834px]:p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-state-warn/20">
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
        <DialogContent className="max-w-[90vw] border border-primary/35 bg-background-secondary backdrop-blur-sm">
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
              className="min-h-[44px] rounded-xl border-border text-text-secondary hover:border-cyan-400/40 hover:text-cyan-400"
            >
              Annulla
            </Button>
            <Button
              onClick={handleCategoryConfirm}
              disabled={uploading}
              className="min-h-[44px] rounded-xl bg-cyan-500 text-white hover:bg-cyan-400 disabled:opacity-50"
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
