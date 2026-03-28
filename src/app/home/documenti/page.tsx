'use client'

/**
 * Pagina Documenti atleta â€“ /home/documenti
 *
 * Mostra in unâ€™unica lista tutti i documenti dellâ€™atleta: tabella documents (certificati,
 * liberatorie, contratti, dossier onboarding), certificato/referti da athlete_medical_data,
 * documenti contrattuali da athlete_administrative_data, fatture da payments (invoice_url).
 *
 * FunzionalitÃ :
 * - Lista unificata con categoria, label, date, stato (valido/in_scadenza/scaduto), note.
 * - Visualizza: apre il documento in nuova scheda (signed â†’ proxy /api/document-preview).
 * - Carica: upload nuovo documento (PDF/JPG); se categoria â€œaltroâ€ si apre dialog per scegliere.
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
  ClipboardList,
  Clock,
  Eye,
  FileSignature,
  FileText,
  FolderOpen,
  Loader2,
  Receipt,
  ScrollText,
  Stethoscope,
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
  'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

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

const CATEGORY_ICON_CLASS = 'h-5 w-5 text-cyan-400'

function getCategoryIcon(category: string): ReactNode {
  switch (category) {
    case 'certificato':
      return <Stethoscope className={CATEGORY_ICON_CLASS} aria-hidden />
    case 'liberatoria':
      return <FileSignature className={CATEGORY_ICON_CLASS} aria-hidden />
    case 'contratto':
      return <ClipboardList className={CATEGORY_ICON_CLASS} aria-hidden />
    case 'altro':
      return <FileText className={CATEGORY_ICON_CLASS} aria-hidden />
    case 'dossier_onboarding':
      return <FolderOpen className={CATEGORY_ICON_CLASS} aria-hidden />
    case 'referto':
      return <ScrollText className={CATEGORY_ICON_CLASS} aria-hidden />
    case 'fattura':
      return <Receipt className={CATEGORY_ICON_CLASS} aria-hidden />
    default:
      return <FileText className={CATEGORY_ICON_CLASS} aria-hidden />
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
  const [uploading, setUploading] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('certificato')

  const fetchAllDocuments = useCallback(async () => {
    if (!athleteProfileId) return
    try {
      const list = await getAllAthleteDocuments(athleteProfileId, athleteUserId)
      setAllDocuments(list)
    } catch (error) {
      logger.error('Errore nel caricamento documenti', error, {
        athleteProfileId,
        athleteUserId,
      })
    }
  }, [athleteProfileId, athleteUserId])

  useEffect(() => {
    if (!athleteProfileId) return
    let cancelled = false
    const load = async () => {
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
        notify(
          'Profilo non disponibile. Ricarica la pagina e riprova.',
          'error',
          'Errore autenticazione',
        )
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
   * Se category assente o "altro", mostra dialog per scegliere categoria prima dellâ€™upload.
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
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <PageHeaderFixed
          variant="chat"
          title="I miei Documenti"
          subtitle="Gestisci i tuoi certificati e documenti"
          onBack={handleBack}
          icon={<FileText className="h-5 w-5 text-cyan-400" />}
        />
        <div className="min-h-0 flex-1" aria-hidden />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <PageHeaderFixed
        variant="chat"
        title="I miei Documenti"
        subtitle="Gestisci i tuoi certificati e documenti"
        onBack={handleBack}
        icon={<FileText className="h-5 w-5 text-cyan-400" />}
      />
      <div className="min-h-0 flex-1 overflow-auto px-3 pb-28 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:pb-24">
        <div className="mx-auto w-full max-w-lg space-y-4 sm:space-y-6 min-[1100px]:max-w-3xl">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              onClick={() => handleUploadDocument()}
              disabled={uploading}
              className="min-h-[44px] touch-manipulation gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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
              <CardContent className="relative z-10 flex items-center gap-3 p-3 sm:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
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
              <CardContent className="relative z-10 flex items-center gap-3 p-3 sm:p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <FileText className="h-8 w-8 text-cyan-400" aria-hidden />
                  </div>
                </div>
                <h3 className="mb-1.5 text-base font-bold text-text-primary md:text-lg">
                  Nessun documento caricato
                </h3>
                <p className="mb-4 text-sm text-text-secondary">Caricane uno ora per iniziare</p>
                <Button
                  onClick={() => handleUploadDocument()}
                  disabled={uploading}
                  className="min-h-[44px] touch-manipulation gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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
                  <CardContent className="relative z-10 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
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
                              <Badge
                                variant={getStatusColor(item.status as DocStatus)}
                                size="sm"
                                className="shrink-0 text-xs"
                              >
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
                            <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-2">
                              <p className="line-clamp-2 text-xs text-text-secondary">
                                {item.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <Button
                          onClick={() => openDocument(item)}
                          className="min-h-[44px] w-full touch-manipulation gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                        >
                          <Eye className="h-4 w-4" />
                          Visualizza
                        </Button>
                        {item.canReplace && (
                          <Button
                            variant="outline"
                            onClick={() => handleUploadNew(item)}
                            className="min-h-[44px] w-full touch-manipulation shrink-0 rounded-xl border border-white/10 text-text-primary hover:bg-white/5 sm:w-auto"
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
            <CardContent className="relative z-10 flex items-center gap-3 p-3 sm:p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
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
      </div>

      {/* Dialog categoria upload - SimpleSelect */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-[90vw] rounded-2xl border border-white/10 bg-background-secondary">
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
              className="min-h-[44px] touch-manipulation rounded-xl border border-white/10 text-text-primary hover:bg-white/5"
            >
              Annulla
            </Button>
            <Button
              onClick={handleCategoryConfirm}
              disabled={uploading}
              className="min-h-[44px] touch-manipulation rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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

export default function DocumentiPage() {
  return (
    <Suspense fallback={null}>
      <DocumentiPageContent />
    </Suspense>
  )
}
