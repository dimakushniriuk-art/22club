// ============================================================
// Componente Modal Nuova Comunicazione (FASE C - Split File Lunghi)
// ============================================================
// Estratto da comunicazioni/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Checkbox } from '@/components/ui'
import { Bell, Mail, MessageSquare, Send, Users, Loader2, Search, UserCheck } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('NewCommunicationModal')

interface NewCommunicationModalProps {
  isOpen: boolean
  onClose: () => void
  isEditing?: boolean
  formType: 'push' | 'email' | 'sms' | 'all'
  formTitle: string
  formMessage: string
  formRecipientFilter: 'all' | 'atleti' | 'custom'
  formSelectedAthletes: string[]
  formScheduled: boolean
  formScheduledDate: string
  formLoading: boolean
  recipientCount: number | null
  onFormTypeChange: (type: 'push' | 'email' | 'sms' | 'all') => void
  onFormTitleChange: (title: string) => void
  onFormMessageChange: (message: string) => void
  onFormRecipientFilterChange: (filter: 'all' | 'atleti' | 'custom') => void
  onFormSelectedAthletesChange: (athletes: string[]) => void
  onFormScheduledChange: (scheduled: boolean) => void
  onFormScheduledDateChange: (date: string) => void
  onCreateDraft: () => void
  onCreateAndSend: () => void
}

export function NewCommunicationModal({
  isOpen,
  onClose,
  isEditing = false,
  formType,
  formTitle,
  formMessage,
  formRecipientFilter,
  formSelectedAthletes,
  formScheduled,
  formScheduledDate,
  formLoading,
  recipientCount,
  onFormTypeChange,
  onFormTitleChange,
  onFormMessageChange,
  onFormRecipientFilterChange,
  onFormSelectedAthletesChange,
  onFormScheduledChange,
  onFormScheduledDateChange,
  onCreateDraft,
  onCreateAndSend,
}: NewCommunicationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifica Comunicazione' : 'Nuova Comunicazione'}</DialogTitle>
          <DialogDescription>Invia una notifica push, email o SMS ai tuoi atleti</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo */}
          <div>
            <label className="text-text-primary mb-2 block text-sm font-medium">
              Tipo di comunicazione
            </label>
            <div className="grid grid-cols-4 gap-4">
              {[
                { value: 'push', label: 'Push', icon: <Bell className="h-5 w-5" /> },
                { value: 'email', label: 'Email', icon: <Mail className="h-5 w-5" /> },
                { value: 'sms', label: 'SMS', icon: <MessageSquare className="h-5 w-5" /> },
                { value: 'all', label: 'Tutti', icon: <Send className="h-5 w-5" /> },
              ].map((tipo) => (
                <button
                  key={tipo.value}
                  onClick={() => onFormTypeChange(tipo.value as typeof formType)}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                    formType === tipo.value
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div>{tipo.icon}</div>
                  <span className="text-sm font-medium">{tipo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Destinatari */}
          <div>
            <label className="text-text-primary mb-2 block text-sm font-medium">Destinatari</label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={formRecipientFilter === 'all' ? 'default' : 'outline'}
                className="flex-1 min-w-[140px]"
                onClick={() => onFormRecipientFilterChange('all')}
              >
                <Users className="mr-2 h-4 w-4" />
                Tutti gli utenti {recipientCount !== null && `(${recipientCount})`}
              </Button>
              <Button
                variant={formRecipientFilter === 'atleti' ? 'default' : 'outline'}
                className="flex-1 min-w-[140px]"
                onClick={() => onFormRecipientFilterChange('atleti')}
              >
                Solo atleti{' '}
                {recipientCount !== null &&
                  formRecipientFilter === 'atleti' &&
                  `(${recipientCount})`}
              </Button>
              <Button
                variant={formRecipientFilter === 'custom' ? 'default' : 'outline'}
                className="flex-1 min-w-[140px]"
                onClick={() => onFormRecipientFilterChange('custom')}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Atleti specifici{' '}
                {formRecipientFilter === 'custom' && formSelectedAthletes.length > 0
                  ? `(${formSelectedAthletes.length})`
                  : ''}
              </Button>
            </div>

            {/* Selezione atleti specifici */}
            {formRecipientFilter === 'custom' && (
              <AthleteSelector
                selectedAthletes={formSelectedAthletes}
                onSelectionChange={onFormSelectedAthletesChange}
              />
            )}
          </div>

          {/* Titolo */}
          <Input
            label="Titolo"
            placeholder="Es: Nuova scheda disponibile"
            value={formTitle}
            onChange={(e) => onFormTitleChange(e.target.value)}
          />

          {/* Messaggio */}
          <Textarea
            label="Messaggio"
            placeholder="Scrivi il contenuto della comunicazione..."
            value={formMessage}
            onChange={(e) => onFormMessageChange(e.target.value)}
            errorMessage={
              formType === 'sms' && formMessage.length > 160
                ? `Il messaggio SMS non può superare 160 caratteri (attualmente: ${formMessage.length}. Riduci di ${formMessage.length - 160} caratteri)`
                : undefined
            }
            helperText={
              formType === 'sms'
                ? `Massimo 160 caratteri per SMS (${formMessage.length}/160)`
                : 'Illimitato per Push ed Email'
            }
          />

          {/* Programmazione */}
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="schedule"
              checked={formScheduled}
              onChange={(e) => onFormScheduledChange(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="schedule" className="text-text-primary text-sm">
              Programma invio
            </label>
            {formScheduled && (
              <Input
                type="datetime-local"
                className="flex-1"
                value={formScheduledDate}
                onChange={(e) => onFormScheduledDateChange(e.target.value)}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={formLoading}>
            Annulla
          </Button>
          <Button
            variant="secondary"
            onClick={onCreateDraft}
            disabled={
              formLoading ||
              !formTitle.trim() ||
              !formMessage.trim() ||
              (formType === 'sms' && formMessage.length > 160)
            }
          >
            {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salva bozza
          </Button>
          <Button
            onClick={onCreateAndSend}
            disabled={
              formLoading ||
              !formTitle.trim() ||
              !formMessage.trim() ||
              (formType === 'sms' && formMessage.length > 160)
            }
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
          >
            {formLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Invia ora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Componente per selezionare atleti specifici
interface AthleteSelectorProps {
  selectedAthletes: string[]
  onSelectionChange: (athletes: string[]) => void
}

function AthleteSelector({ selectedAthletes, onSelectionChange }: AthleteSelectorProps) {
  const [athletes, setAthletes] = useState<
    Array<{ id: string; name: string; email: string | null }>
  >([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch atleti quando il componente viene montato
  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/communications/list-athletes')

        if (!response.ok) {
          logger.error('Error fetching athletes', null, {
            status: response.status,
            statusText: response.statusText,
          })
          return
        }

        const data = await response.json()
        setAthletes(data.athletes || [])
      } catch (error) {
        logger.error('Error fetching athletes', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAthletes()
  }, [])

  // Filtra atleti in base al search term
  const filteredAthletes = athletes.filter((athlete) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      athlete.name.toLowerCase().includes(term) ||
      (athlete.email && athlete.email.toLowerCase().includes(term))
    )
  })

  const handleToggleAthlete = (athleteId: string) => {
    if (selectedAthletes.includes(athleteId)) {
      onSelectionChange(selectedAthletes.filter((id) => id !== athleteId))
    } else {
      onSelectionChange([...selectedAthletes, athleteId])
    }
  }

  if (loading) {
    return (
      <div className="mt-4 p-4 border border-border rounded-lg bg-background-secondary/50">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-text-tertiary" />
          <span className="ml-2 text-text-tertiary text-sm">Caricamento atleti...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 border border-border rounded-lg bg-background-secondary/50">
      {/* Search bar */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            type="text"
            placeholder="Cerca atleta per nome o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista atleti con checkbox */}
      <div className="max-h-64 overflow-y-auto p-2">
        {filteredAthletes.length === 0 ? (
          <div className="py-8 text-center text-text-tertiary text-sm">
            {searchTerm ? 'Nessun atleta trovato' : 'Nessun atleta disponibile'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAthletes.map((athlete) => (
              <label
                key={athlete.id}
                className="flex items-center space-x-3 p-2 rounded hover:bg-background-tertiary/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedAthletes.includes(athlete.id)}
                  onChange={() => handleToggleAthlete(athlete.id)}
                />
                <div className="flex-1">
                  <div className="text-text-primary text-sm font-medium">{athlete.name}</div>
                  {athlete.email && (
                    <div className="text-text-tertiary text-xs">{athlete.email}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Footer con conteggio */}
      <div className="p-3 border-t border-border bg-background-secondary/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">
            {selectedAthletes.length} atleta{selectedAthletes.length !== 1 ? 'i' : ''} selezionato
            {selectedAthletes.length !== 1 ? 'i' : ''}
          </span>
          {selectedAthletes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
              className="h-7 text-xs"
            >
              Deseleziona tutto
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
