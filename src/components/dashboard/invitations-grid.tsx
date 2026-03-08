'use client'

import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Checkbox } from '@/components/ui'
import {
  Copy,
  Trash2,
  QrCode,
  CheckCircle,
  Share2,
} from 'lucide-react'
import type { Invitation } from '@/types/invitation'

export interface InvitationsGridProps {
  invitations: Invitation[]
  selectedIds: Set<string>
  copiedText: string | null
  getStatusIcon: (stato: string) => ReactNode
  getStatusBadge: (stato: string) => ReactNode
  onToggleSelect: (id: string, checked: boolean) => void
  onCopyCode: (code: string) => void
  onCopyLink: (code: string) => void
  onShowQR: (invitation: Invitation) => void
  onDelete: (id: string) => void
}

export function InvitationsGrid({
  invitations,
  selectedIds,
  copiedText,
  getStatusIcon,
  getStatusBadge,
  onToggleSelect,
  onCopyCode,
  onCopyLink,
  onShowQR,
  onDelete,
}: InvitationsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {invitations.map((invitation) => (
        <Card
          key={invitation.id}
          variant="trainer"
          className="relative overflow-hidden bg-linear-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 hover:shadow-blue-500/20 transition-all duration-200"
        >
          <div className="absolute left-3 top-3">
            <Checkbox
              checked={selectedIds.has(invitation.id)}
              onChange={(e) => onToggleSelect(invitation.id, e.target.checked)}
              aria-label={`Seleziona invito per ${invitation.nome_atleta}`}
            />
          </div>
          <CardContent className="p-4 pt-10 relative">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-text-primary font-medium">{invitation.nome_atleta}</h3>
                {invitation.email && (
                  <p className="text-text-secondary text-sm">{invitation.email}</p>
                )}
              </div>
              {getStatusIcon(invitation.stato)}
            </div>

            <div className="space-y-3">
              {getStatusBadge(invitation.stato)}

              <div className="bg-background-tertiary rounded p-3">
                <p className="text-text-secondary mb-1 text-xs font-medium">Codice invito:</p>
                <p className="text-text-primary font-mono text-sm font-bold">
                  {invitation.codice}
                </p>
              </div>

              <div className="bg-background-tertiary rounded p-2">
                <p className="text-text-secondary mb-1 text-xs">Link registrazione:</p>
                <p className="text-text-primary truncate text-xs">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}/registrati?codice=${encodeURIComponent(invitation.codice)}`
                    : ''}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-text-tertiary text-xs">
                  Creato: {new Date(invitation.created_at).toLocaleDateString('it-IT')}
                </p>
                {invitation.expires_at && (
                  <p className="text-text-tertiary text-xs">
                    Scade: {new Date(invitation.expires_at).toLocaleDateString('it-IT')}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopyCode(invitation.codice)}
                  className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                  aria-label="Copia codice"
                >
                  {copiedText === invitation.codice ? (
                    <>
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Copiato!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-4 w-4" />
                      Codice
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopyLink(invitation.codice)}
                  className="flex-1 border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                  aria-label="Copia link"
                >
                  {copiedText === `link-${invitation.codice}` ? (
                    <>
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Copiato!
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-1 h-4 w-4" />
                      Link
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShowQR(invitation)}
                  className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                  aria-label="Mostra QR Code"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(invitation.id)}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200"
                  aria-label="Elimina invito"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
