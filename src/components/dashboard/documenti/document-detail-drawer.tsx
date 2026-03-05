'use client'

import { Drawer, DrawerContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { FileText, Download, AlertTriangle } from 'lucide-react'
import {
  getStatusColor,
  getStatusText,
  getStatusIcon,
  getCategoryText,
  formatDocumentDate,
} from '@/lib/document-utils'
import { extractFileName, extractFileType } from '@/lib/documents'
import type { Document } from '@/types/document'

interface DocumentDetailDrawerProps {
  document: Document | null
  open: boolean
  onClose: () => void
  onDownload: (document: Document) => void
  onMarkInvalid: () => void
}

export function DocumentDetailDrawer({
  document,
  open,
  onClose,
  onDownload,
  onMarkInvalid,
}: DocumentDetailDrawerProps) {
  if (!document) return null

  return (
    <Drawer open={open} onOpenChange={onClose} side="right">
      <DrawerContent title={`Documento: ${extractFileName(document.file_url)}`} onClose={onClose}>
        <div className="space-y-6">
          {/* Info documento */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-text-primary text-lg font-semibold">Informazioni</h3>
              <Badge variant={getStatusColor(document.status)} size="md">
                {getStatusIcon(document.status)} {getStatusText(document.status)}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Atleta:</span>
                <span className="text-text-primary font-medium">{document.athlete_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Categoria:</span>
                <span className="text-text-primary font-medium">
                  {getCategoryText(document.category)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">File:</span>
                <span className="text-text-primary font-medium">
                  {extractFileName(document.file_url)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Scadenza:</span>
                <span className="text-text-primary font-medium">
                  {document.expires_at ? formatDocumentDate(document.expires_at) : 'Senza scadenza'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Caricato da:</span>
                <span className="text-text-primary font-medium">{document.uploaded_by_name}</span>
              </div>
            </div>
          </div>

          {/* Note */}
          {document.notes && (
            <div className="space-y-2">
              <h4 className="text-text-primary font-medium">Note:</h4>
              <p className="text-text-secondary bg-background-tertiary rounded-lg p-3 text-sm">
                {document.notes}
              </p>
            </div>
          )}

          {/* Anteprima documento */}
          <div className="space-y-2">
            <h4 className="text-text-primary font-medium">Anteprima:</h4>
            <div className="bg-background-tertiary flex aspect-video items-center justify-center rounded-lg">
              <div className="text-center">
                <FileText className="text-text-tertiary mx-auto mb-2 h-12 w-12" />
                <p className="text-text-secondary text-sm">Anteprima non disponibile</p>
                <p className="text-text-tertiary text-xs">{extractFileType(document.file_url)}</p>
              </div>
            </div>
          </div>

          {/* Azioni */}
          <div className="space-y-3">
            <Button onClick={() => onDownload(document)} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Scarica documento
            </Button>

            {document.status !== 'non_valido' && (
              <Button
                variant="outline"
                onClick={onMarkInvalid}
                className="border-state-error text-state-error hover:bg-state-error/10 w-full"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Segnala non valido
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
