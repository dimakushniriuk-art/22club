'use client'

import type { JSX } from 'react'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'
import { Button } from '@/components/ui'
import { Loader2, CheckCircle, XCircle, Clock, Mail, Search } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('RecipientsDetailModal')

interface Recipient {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  recipient_type: 'push' | 'email' | 'sms'
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'failed' | 'bounced'
  sent_at: string | null
  delivered_at: string | null
  opened_at: string | null
  failed_at: string | null
  error_message: string | null
  created_at: string
}

interface RecipientsDetailModalProps {
  isOpen: boolean
  onClose: () => void
  communicationId: string
  communicationTitle: string
}

const statusLabels: Record<Recipient['status'], string> = {
  pending: 'In attesa',
  sent: 'Inviato',
  delivered: 'Consegnato',
  opened: 'Aperto',
  failed: 'Fallito',
  bounced: 'Rimbalzato',
}

const statusIcons: Record<Recipient['status'], JSX.Element> = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  sent: <Mail className="h-4 w-4 text-blue-500" />,
  delivered: <CheckCircle className="h-4 w-4 text-green-500" />,
  opened: <CheckCircle className="h-4 w-4 text-teal-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  bounced: <XCircle className="h-4 w-4 text-orange-500" />,
}

export function RecipientsDetailModal({
  isOpen,
  onClose,
  communicationId,
  communicationTitle,
}: RecipientsDetailModalProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<Recipient['status'] | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch recipients quando si apre il modal
  useEffect(() => {
    if (isOpen && communicationId) {
      fetchRecipients()
    } else {
      // Reset quando si chiude
      setRecipients([])
      setStatusFilter('all')
      setSearchTerm('')
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, communicationId])

  const fetchRecipients = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/communications/recipients?communication_id=${communicationId}`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setRecipients(data.recipients || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto'
      setError(errorMessage)
      logger.error('Error fetching recipients', err, { communicationId })
    } finally {
      setLoading(false)
    }
  }

  // Filtra recipients per status e search
  const filteredRecipients = recipients.filter((recipient) => {
    const matchesStatus = statusFilter === 'all' || recipient.status === statusFilter
    const matchesSearch =
      !searchTerm ||
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.phone?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Statistiche
  const stats = {
    total: recipients.length,
    pending: recipients.filter((r) => r.status === 'pending').length,
    sent: recipients.filter((r) => r.status === 'sent').length,
    delivered: recipients.filter((r) => r.status === 'delivered').length,
    opened: recipients.filter((r) => r.status === 'opened').length,
    failed: recipients.filter((r) => r.status === 'failed' || r.status === 'bounced').length,
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Dettaglio Destinatari</DialogTitle>
          <DialogDescription>{communicationTitle}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-2 text-text-secondary">Caricamento destinatari...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-state-error mb-4">{error}</p>
            <Button onClick={fetchRecipients} variant="outline">
              Riprova
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Statistiche */}
            <div className="grid grid-cols-6 gap-2 mb-4">
              <div className="bg-background-secondary rounded-lg p-3 text-center">
                <div className="text-text-secondary text-xs mb-1">Totali</div>
                <div className="text-text-primary text-lg font-semibold">{stats.total}</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                <div className="text-text-secondary text-xs mb-1">In attesa</div>
                <div className="text-yellow-500 text-lg font-semibold">{stats.pending}</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                <div className="text-text-secondary text-xs mb-1">Inviati</div>
                <div className="text-blue-500 text-lg font-semibold">{stats.sent}</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                <div className="text-text-secondary text-xs mb-1">Consegnati</div>
                <div className="text-green-500 text-lg font-semibold">{stats.delivered}</div>
              </div>
              <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3 text-center">
                <div className="text-text-secondary text-xs mb-1">Aperti</div>
                <div className="text-teal-500 text-lg font-semibold">{stats.opened}</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                <div className="text-text-secondary text-xs mb-1">Falliti</div>
                <div className="text-red-500 text-lg font-semibold">{stats.failed}</div>
              </div>
            </div>

            {/* Filtri */}
            <div className="flex gap-4 mb-4">
              {/* Filtro status */}
              <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'sent', 'delivered', 'opened', 'failed'] as const).map(
                  (status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status === 'all' ? 'Tutti' : statusLabels[status]}
                    </Button>
                  ),
                )}
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Cerca per nome, email o telefono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tabella */}
            <div className="flex-1 overflow-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-background-secondary sticky top-0">
                  <tr>
                    <th className="text-left p-3 text-text-primary font-medium">Nome</th>
                    <th className="text-left p-3 text-text-primary font-medium">Email</th>
                    <th className="text-left p-3 text-text-primary font-medium">Telefono</th>
                    <th className="text-left p-3 text-text-primary font-medium">Tipo</th>
                    <th className="text-left p-3 text-text-primary font-medium">Stato</th>
                    <th className="text-left p-3 text-text-primary font-medium">Inviato</th>
                    <th className="text-left p-3 text-text-primary font-medium">Consegnato</th>
                    <th className="text-left p-3 text-text-primary font-medium">Aperto</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-text-tertiary">
                        Nessun destinatario trovato
                      </td>
                    </tr>
                  ) : (
                    filteredRecipients.map((recipient) => (
                      <tr
                        key={recipient.id}
                        className="border-t border-border hover:bg-background-secondary/50"
                      >
                        <td className="p-3 text-text-primary">{recipient.name}</td>
                        <td className="p-3 text-text-secondary">{recipient.email || '-'}</td>
                        <td className="p-3 text-text-secondary">{recipient.phone || '-'}</td>
                        <td className="p-3">
                          <span className="text-text-tertiary text-xs uppercase">
                            {recipient.recipient_type}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {statusIcons[recipient.status]}
                            <span className="text-text-primary text-xs">
                              {statusLabels[recipient.status]}
                            </span>
                          </div>
                          {recipient.error_message && (
                            <div
                              className="text-red-500 text-xs mt-1"
                              title={recipient.error_message}
                            >
                              {recipient.error_message.substring(0, 50)}...
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-text-secondary text-xs">
                          {formatDate(recipient.sent_at)}
                        </td>
                        <td className="p-3 text-text-secondary text-xs">
                          {formatDate(recipient.delivered_at)}
                        </td>
                        <td className="p-3 text-text-secondary text-xs">
                          {formatDate(recipient.opened_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-4 text-text-tertiary text-sm text-center">
              Mostrando {filteredRecipients.length} di {stats.total} destinatari
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
