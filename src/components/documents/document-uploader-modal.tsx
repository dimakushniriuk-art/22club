'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { createClient } from '@/lib/supabase'
import { useClienti } from '@/hooks/use-clienti'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Upload, User, FileText, Calendar, X, Loader2, File } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:documents:document-uploader-modal')

interface DocumentFormData {
  athlete_id: string
  category: 'certificato' | 'liberatoria' | 'contratto' | 'altro'
  file: File | null
  expires_at: string
  notes?: string
}

interface DocumentUploaderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DocumentUploaderModal({
  open,
  onOpenChange,
  onSuccess,
}: DocumentUploaderModalProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<DocumentFormData>({
    athlete_id: '',
    category: 'certificato',
    file: null,
    expires_at: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const supabase = createClient()
  const { clienti } = useClienti()
  const { addToast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, file }))
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Validazione
      if (!formData.athlete_id || !formData.file) {
        setError('Seleziona un atleta e carica un file')
        return
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Utente non autenticato')
        return
      }

      // Get PT profile to use as uploaded_by_profile_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profile) {
        setError('Profilo trainer non trovato')
        return
      }

      type ProfileRow = {
        id: string
      }
      const typedProfile = profile as ProfileRow

      // 1. Upload file to Supabase Storage
      const fileName = `${Date.now()}_${formData.file.name}`
      const filePath = `${formData.athlete_id}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, formData.file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      setUploadProgress(50)

      // 2. Insert document metadata in database
      // Note: file_name, file_size, file_type non sono campi del DB, vengono ignorati
      // Workaround necessario per inferenza tipo Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase.from('documents') as any).insert([
        {
          athlete_id: formData.athlete_id,
          category: formData.category,
          file_url: uploadData.path,
          expires_at: formData.expires_at || null,
          uploaded_by_profile_id: typedProfile.id,
          notes: formData.notes || null,
          status: 'valido',
        },
      ])

      if (dbError) {
        // Rollback: delete uploaded file if DB insert fails
        await supabase.storage.from('documents').remove([filePath])
        throw dbError
      }

      setUploadProgress(100)

      // Invalida query documents per refresh automatico
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all })

      addToast({
        title: 'Documento caricato',
        message: 'Il documento è stato caricato correttamente',
        variant: 'success',
      })
      onOpenChange(false)
      onSuccess?.()

      // Reset form
      setFormData({
        athlete_id: '',
        category: 'certificato',
        file: null,
        expires_at: '',
        notes: '',
      })
      setUploadProgress(0)
    } catch (error) {
      logger.error('Error uploading document', error, {
        athleteId: formData.athlete_id,
        category: formData.category,
      })
      const errorMsg =
        error instanceof Error ? error.message : 'Errore nel caricamento del documento'
      setError(errorMsg)
      addToast({
        title: 'Errore caricamento documento',
        message: errorMsg,
        variant: 'error',
      })
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      setError(null)
      setFormData({
        athlete_id: '',
        category: 'certificato',
        file: null,
        expires_at: '',
        notes: '',
      })
      setUploadProgress(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-background-secondary border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-text-primary text-2xl font-bold flex items-center gap-2">
            <Upload className="h-6 w-6 text-blue-400" />
            Carica Documento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Select Atleta */}
          <div className="space-y-2">
            <Label htmlFor="athlete" className="text-text-primary">
              <User className="inline h-4 w-4 mr-2" />
              Atleta *
            </Label>
            <select
              id="athlete"
              value={formData.athlete_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, athlete_id: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-input border-border border rounded-lg text-text-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Seleziona atleta...</option>
              {clienti.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} {cliente.cognome}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file" className="text-text-primary">
              <File className="inline h-4 w-4 mr-2" />
              File *
            </Label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              required
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-full px-3 py-2 bg-input border-border border rounded-lg text-text-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/10 file:text-blue-400 file:cursor-pointer hover:file:bg-blue-500/20"
            />
            {formData.file && (
              <p className="text-sm text-text-secondary">
                File selezionato: {formData.file.name} ({(formData.file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-text-primary">
              Categoria *
            </Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as DocumentFormData['category'],
                }))
              }
              required
              className="w-full px-3 py-2 bg-input border-border border rounded-lg text-text-primary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="certificato">Certificato Medico</option>
              <option value="liberatoria">Liberatoria</option>
              <option value="contratto">Contratto</option>
              <option value="altro">Altro</option>
            </select>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expires_at" className="text-text-primary">
              <Calendar className="inline h-4 w-4 mr-2" />
              Data Scadenza (opzionale)
            </Label>
            <Input
              id="expires_at"
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData((prev) => ({ ...prev, expires_at: e.target.value }))}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-text-primary">
              <FileText className="inline h-4 w-4 mr-2" />
              Note (opzionale)
            </Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Note aggiuntive sul documento..."
              rows={3}
              className="w-full px-3 py-2 bg-input border-border border rounded-lg text-text-primary placeholder:text-text-tertiary focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="h-2 bg-input rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-text-secondary text-center">
                Caricamento: {uploadProgress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 border-blue-500/50 text-white hover:bg-blue-500/10"
            >
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Caricamento...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Carica Documento
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
