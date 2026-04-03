'use client'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import { Calendar, ChevronDown, FileText, User } from 'lucide-react'
import {
  getStatusColor,
  getStatusText,
  getStatusIcon,
  getCategoryText,
  formatDocumentDate,
} from '@/lib/document-utils'
import { documentDisplayFileName } from '@/lib/documents'
import type { Document } from '@/types/document'

interface DocumentsTableProps {
  documents: Document[]
  onDocumentClick: (document: Document) => void
  onDownload: (document: Document) => void
  /**
   * Anteprima da aprire (es. Eye icon).
   * Se non presente, ricade su onDocumentClick.
   */
  onPreview?: (document: Document) => void
}

export function DocumentsTable({
  documents,
  onDocumentClick,
  onDownload,
  onPreview,
}: DocumentsTableProps) {
  if (documents.length === 0) {
    return (
      <Card
        variant="default"
        className="relative overflow-hidden border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all duration-200"
      >
        <CardContent className="relative py-12 text-center">
          <div className="mb-4 text-6xl opacity-50">📄</div>
          <h3 className="text-text-primary mb-2 text-lg font-medium">Nessun documento trovato</h3>
          <p className="text-text-secondary text-sm">Prova a modificare i filtri di ricerca</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      variant="default"
      className="relative overflow-hidden border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-all duration-200"
    >
      <CardHeader className="relative">
        <CardTitle size="md">Documenti ({documents.length})</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-text-secondary p-3 text-left text-sm font-medium">Atleta</th>
                <th className="text-text-secondary p-3 text-left text-sm font-medium">Categoria</th>
                <th className="text-text-secondary p-3 text-left text-sm font-medium">File</th>
                <th className="text-text-secondary p-3 text-left text-sm font-medium">Stato</th>
                <th className="text-text-secondary p-3 text-left text-sm font-medium">Scadenza</th>
                <th className="text-text-secondary p-3 text-left text-sm font-medium">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr
                  key={document.id}
                  className="hover:bg-background-tertiary cursor-pointer border-b border-border"
                  onClick={() => onDocumentClick(document)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="text-text-tertiary h-4 w-4" />
                      <span className="text-text-primary font-medium">{document.athlete_name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-text-secondary text-sm">
                      {getCategoryText(document.category)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="text-text-tertiary h-4 w-4" />
                      <div>
                        <div className="text-text-primary text-sm font-medium">
                          {documentDisplayFileName(document)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={getStatusColor(document.status)} size="sm">
                      {getStatusIcon(document.status)} {getStatusText(document.status)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-text-tertiary h-4 w-4" />
                      <span className="text-text-secondary text-sm">
                        {document.expires_at
                          ? formatDocumentDate(document.expires_at)
                          : 'Senza scadenza'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          className="gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          File
                          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[10rem]">
                        <DropdownMenuItem
                          onClick={() => {
                            if (onPreview != null) {
                              onPreview(document)
                            } else {
                              onDocumentClick(document)
                            }
                          }}
                        >
                          Visualizza
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDownload(document)}>
                          Scarica
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
