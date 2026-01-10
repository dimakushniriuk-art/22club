'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'
import { createLogger } from '@/lib/logger'
import { useAuth } from '@/providers/auth-provider'
import { notifyError, notifySuccess } from '@/lib/notifications'
import { isValidProfile } from '@/lib/utils/type-guards'

const logger = createLogger('app:home:documenti:page')
import {
  FileText,
  Upload,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import type { Document } from '@/types/document'
import {
  uploadDocument,
  getDocuments,
  validateDocumentFile,
  extractFileName,
} from '@/lib/documents'

function DocumentiPageContent() {
  const { user } = useAuth()
  const router = useRouter()

  // user?.user_id da useAuth() è già profiles.user_id (auth.users.id), usiamolo direttamente
  // documents.athlete_id e uploaded_by_profile_id sono FK a profiles.id
  const authUserId = user?.user_id || null

  // Type guard per user
  const isValidUser = user && isValidProfile(user)

  // NOTA: Tutti gli hooks devono essere chiamati prima di qualsiasi early return
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('certificato')

  const fetchDocuments = async () => {
    if (!authUserId) return

    try {
      setLoading(true)
      const docs = await getDocuments(authUserId)
      setDocuments(docs)
    } catch (error) {
      logger.error('Errore nel caricamento documenti', error, { authUserId })
    } finally {
      setLoading(false)
    }
  }

  // Fetch documenti al caricamento (pathname rimosso: useDocuments usa React Query che gestisce refetch automaticamente)
  useEffect(() => {
    if (authUserId) {
      fetchDocuments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUserId])

  // Se non c'è user, mostra skeleton (il layout gestirà il redirect)
  if (!user || !isValidUser) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-background-tertiary rounded" />
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-background-tertiary rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (
    status: 'valido' | 'scaduto' | 'in-revisione' | 'in_scadenza' | 'non_valido',
  ): 'primary' | 'success' | 'warning' | 'neutral' | 'outline' | 'secondary' => {
    switch (status) {
      case 'valido':
        return 'success'
      case 'in_scadenza':
        return 'warning'
      case 'scaduto':
        return 'warning'
      case 'non_valido':
        return 'warning'
      case 'in-revisione':
        return 'neutral'
      default:
        return 'neutral'
    }
  }

  const getStatusText = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valido':
        return <CheckCircle className="h-3.5 w-3.5" />
      case 'in_scadenza':
        return <Clock className="h-3.5 w-3.5" />
      case 'scaduto':
        return <XCircle className="h-3.5 w-3.5" />
      case 'non_valido':
        return <XCircle className="h-3.5 w-3.5" />
      default:
        return <FileText className="h-3.5 w-3.5" />
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'certificato':
        return 'Certificato'
      case 'liberatoria':
        return 'Liberatoria'
      case 'contratto':
        return 'Contratto'
      case 'altro':
        return 'Altro'
      default:
        return category
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'certificato':
        return '🏥'
      case 'liberatoria':
        return '📝'
      case 'contratto':
        return '📋'
      case 'altro':
        return '📄'
      default:
        return '📄'
    }
  }

  // Nota: formatFileSize potrebbe essere usato in futuro per formattazione dimensioni file
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const handleViewDocument = (document: Document) => {
    // Apri documento in nuova tab
    window.open(document.file_url, '_blank')
  }

  const handleUploadNew = async (document: Document) => {
    // Upload nuovo documento per la stessa categoria
    await handleUploadDocument(document.category)
  }

  const handleUploadDocument = async (category?: string) => {
    if (!authUserId) {
      notifyError('Errore', 'Devi essere autenticato per caricare documenti')
      return
    }

    // Crea input file
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.pdf,.jpg,.jpeg,.png'

    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Valida file
      const validation = validateDocumentFile(file)
      if (!validation.valid) {
        notifyError('Errore validazione file', validation.error)
        return
      }

      const finalCategory = category || 'altro'

      // Se non c'è categoria, mostra dialog per selezionarla
      if (!finalCategory || finalCategory === 'altro') {
        setPendingFile(file)
        setSelectedCategory('certificato')
        setShowCategoryDialog(true)
        return
      }

      // Se c'è già una categoria, procedi direttamente con l'upload
      await performUpload(file, finalCategory)
    }

    fileInput.click()
  }

  const performUpload = async (file: File, category: string) => {
    if (!authUserId) {
      alert('Errore: ID utente non disponibile. Ricarica la pagina e riprova.')
      return
    }

    try {
      setUploading(true)

      // Upload documento
      // Per atleti: athleteId = uploadedByUserId = authUserId (caricano per se stessi)
      // Per trainer/admin: dovrebbero passare athleteId separato (non implementato in questa pagina)
      await uploadDocument(file, category, authUserId, authUserId)

      // Ricarica lista documenti
      await fetchDocuments()

      notifySuccess('Documento caricato con successo!')
    } catch (error) {
      logger.error("Errore durante l'upload", error, { authUserId, category })

      // Mostra messaggio di errore più dettagliato
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
      notifyError('Errore nel caricamento del documento', errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleCategoryConfirm = async () => {
    if (!pendingFile) return

    setShowCategoryDialog(false)
    const fileToUpload = pendingFile
    setPendingFile(null)

    await performUpload(fileToUpload, selectedCategory)
  }

  if (loading) {
    return (
      <div
        className="bg-black min-w-[402px] min-h-[874px] space-y-3 px-3 py-4"
        style={{ overflow: 'auto' }}
      >
        <div className="animate-pulse space-y-3">
          <div className="bg-background-tertiary h-6 w-40 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-background-tertiary h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
      style={{ overflow: 'auto' }}
    >
      {/* Header - Design Moderno e Uniforme */}
      <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
                I miei Documenti
              </h1>
              <p className="text-text-secondary text-xs line-clamp-1">
                Gestisci i tuoi certificati e documenti
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleUploadDocument()}
            disabled={uploading}
            className="h-9 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all duration-200 flex-shrink-0"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Carica
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistiche rapide - Design Moderno e Uniforme */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card
          variant="default"
          className="group relative overflow-hidden border border-green-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-green-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.01] backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-3 text-center relative z-10">
            <div className="absolute top-1 right-1 opacity-20">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <div className="text-state-valid text-lg font-bold text-white relative z-10">
              {documents.filter((d) => d.status === 'valido').length}
            </div>
            <div className="text-text-secondary text-[10px] uppercase tracking-wide relative z-10">
              Validi
            </div>
          </CardContent>
        </Card>
        <Card
          variant="default"
          className="group relative overflow-hidden border border-orange-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-orange-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.01] backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-3 text-center relative z-10">
            <div className="absolute top-1 right-1 opacity-20">
              <Clock className="h-10 w-10 text-orange-400" />
            </div>
            <div className="text-state-warn text-lg font-bold text-white relative z-10">
              {documents.filter((d) => d.status === 'in_scadenza').length}
            </div>
            <div className="text-text-secondary text-[10px] uppercase tracking-wide relative z-10">
              In scadenza
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista documenti - Design Moderno e Uniforme */}
      {documents.length === 0 ? (
        <Card
          variant="default"
          className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="py-6 text-center relative z-10">
            <div className="mb-2.5 text-4xl opacity-50">📄</div>
            <h3 className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent mb-1.5">
              Nessun documento caricato
            </h3>
            <p className="text-text-secondary mb-3 text-xs">Caricane uno ora per iniziare</p>
            <Button
              onClick={() => handleUploadDocument()}
              disabled={uploading}
              className="h-9 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all duration-200"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Caricamento...
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Carica primo documento
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {documents.map((document) => (
            <Card
              key={document.id}
              variant="default"
              className="group relative overflow-hidden border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 hover:scale-[1.01] backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-2.5 relative z-10">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-1 items-start gap-2 min-w-0">
                    {/* Icona categoria */}
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300 text-base flex-shrink-0">
                      {getCategoryIcon(document.category)}
                    </div>

                    {/* Info documento */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-text-primary font-semibold text-sm text-white truncate">
                          {getCategoryText(document.category)}
                        </h3>
                        <Badge
                          variant={getStatusColor(document.status)}
                          size="sm"
                          className="shadow-lg shadow-teal-500/20 text-[10px] flex-shrink-0"
                        >
                          {getStatusIcon(document.status)}
                          {getStatusText(document.status)}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                          <p className="text-text-secondary text-xs truncate">
                            {extractFileName(document.file_url)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                          <p className="text-text-tertiary text-[10px] truncate">
                            Caricato il {formatDate(document.created_at)}
                          </p>
                        </div>
                        {document.expires_at && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                            <span className="text-text-tertiary text-[10px] truncate">
                              Scade il {formatDate(document.expires_at)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Note */}
                      {document.notes && (
                        <div className="mt-1.5 rounded-lg border border-teal-500/20 bg-black/20 p-1.5">
                          <p className="text-text-secondary text-[10px] line-clamp-2">
                            {document.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Azioni */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDocument(document)}
                      className="h-8 w-8 p-0 text-text-secondary hover:text-teal-300 hover:bg-teal-500/10 transition-all duration-200 hover:scale-[1.05]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>

                    {(document.status === 'scaduto' ||
                      document.status === 'in_scadenza' ||
                      document.status === 'non_valido') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUploadNew(document)}
                        className="h-8 text-[10px] border-teal-500/30 text-white hover:border-teal-400 hover:bg-teal-500/10 transition-all duration-200 hover:scale-[1.02]"
                      >
                        <Upload className="mr-0.5 h-3 w-3" />
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

      {/* Info aggiuntive - Design Moderno e Uniforme */}
      <Card
        variant="default"
        className="group relative overflow-hidden border border-orange-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-orange-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-2.5 relative z-10">
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 group-hover:from-orange-500/30 group-hover:to-amber-500/30 transition-all duration-300 flex-shrink-0">
              <AlertTriangle className="text-state-warn h-3.5 w-3.5" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
                Informazioni importanti
              </h4>
              <ul className="text-text-secondary space-y-1 text-xs">
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-400 flex-shrink-0">•</span>
                  <span className="line-clamp-2">
                    I certificati medici devono essere aggiornati annualmente
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-400 flex-shrink-0">•</span>
                  <span className="line-clamp-2">Le liberatorie sono valide per 2 anni</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-400 flex-shrink-0">•</span>
                  <span className="line-clamp-2">I contratti scadono secondo le date indicate</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-orange-400 flex-shrink-0">•</span>
                  <span className="line-clamp-2">Carica sempre documenti in formato PDF o JPG</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog per selezione categoria - Design Moderno e Uniforme */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="bg-background-secondary border border-teal-500/30 max-w-[90vw] backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
              Seleziona Categoria Documento
            </DialogTitle>
            <DialogDescription className="text-text-secondary text-xs">
              Scegli la categoria del documento che stai caricando
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-background-secondary border border-teal-500/30 rounded-lg text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
            >
              <option value="certificato">Certificato Medico</option>
              <option value="liberatoria">Liberatoria</option>
              <option value="contratto">Contratto</option>
              <option value="altro">Altro</option>
            </select>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCategoryDialog(false)
                setPendingFile(null)
              }}
              className="h-9 text-xs border-teal-500/30 text-white hover:bg-teal-500/10"
            >
              Annulla
            </Button>
            <Button
              onClick={handleCategoryConfirm}
              disabled={uploading}
              className="h-9 text-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
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
    <Suspense
      fallback={
        <div
          className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
          style={{ overflow: 'auto' }}
        >
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-background-tertiary rounded" />
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-background-tertiary rounded-lg" />
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
