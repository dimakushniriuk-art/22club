// ============================================================
// Componente Modal Nuova Comunicazione (FASE C - Split File Lunghi)
// ============================================================
// Estratto da comunicazioni/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Checkbox } from '@/components/ui'
import { Send, Loader2, Search, UserCheck } from 'lucide-react'
import { createLogger } from '@/lib/logger'

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

const _logger = createLogger('NewCommunicationModal')

interface NewCommunicationModalProps {
  isOpen: boolean
  onClose: () => void
  isEditing?: boolean
  formType: 'email' | 'all'
  formTitle: string
  formMessage: string
  formRecipientFilter: 'all' | 'atleti' | 'custom'
  formSelectedAthletes: string[]
  formScheduled: boolean
  formScheduledDate: string
  formLoading: boolean
  recipientCount: number | null
  onFormTypeChange: (type: 'email' | 'all') => void
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
  onFormTypeChange: _onFormTypeChange,
  onFormTitleChange,
  onFormMessageChange,
  onFormRecipientFilterChange,
  onFormSelectedAthletesChange,
  onFormScheduledChange,
  onFormScheduledDateChange,
  onCreateDraft,
  onCreateAndSend,
}: NewCommunicationModalProps) {
  const [showConfirmExit, setShowConfirmExit] = useState(false)
  const prevOpenRef = useRef(false)
  const snapshotRef = useRef<{
    formTitle: string
    formMessage: string
    formSelectedAthletes: string[]
    formType: string
    formRecipientFilter: string
    formScheduled: boolean
    formScheduledDate: string
  } | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (!prevOpenRef.current) {
        snapshotRef.current = {
          formTitle,
          formMessage,
          formSelectedAthletes: [...formSelectedAthletes],
          formType,
          formRecipientFilter,
          formScheduled,
          formScheduledDate,
        }
      }
      prevOpenRef.current = true
    } else {
      snapshotRef.current = null
      setShowConfirmExit(false)
      prevOpenRef.current = false
    }
  }, [
    isOpen,
    formTitle,
    formMessage,
    formSelectedAthletes,
    formType,
    formRecipientFilter,
    formScheduled,
    formScheduledDate,
  ])

  const snapshot = snapshotRef.current
  const isDirty =
    snapshot != null &&
    (formTitle !== snapshot.formTitle ||
      formMessage !== snapshot.formMessage ||
      formType !== snapshot.formType ||
      formRecipientFilter !== snapshot.formRecipientFilter ||
      formScheduled !== snapshot.formScheduled ||
      formScheduledDate !== snapshot.formScheduledDate ||
      !arraysEqual(formSelectedAthletes, snapshot.formSelectedAthletes))

  const handleCloseRequest = () => {
    if (isDirty) {
      setShowConfirmExit(true)
    } else {
      onClose()
    }
  }

  const handleConfirmExit = () => {
    setShowConfirmExit(false)
    onClose()
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseRequest()
        }}
      >
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Modifica Comunicazione' : 'Nuova Comunicazione'}
            </DialogTitle>
            <DialogDescription>Invia un&apos;email ai tuoi atleti</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            {/* Destinatari */}
            <div className="space-y-3">
              <label className="text-text-primary block text-sm font-medium">Destinatari</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={formRecipientFilter === 'atleti' ? 'default' : 'outline'}
                  className="flex-1 min-w-[140px]"
                  onClick={() => onFormRecipientFilterChange('atleti')}
                >
                  Tutti atleti
                  {recipientCount !== null && formRecipientFilter === 'atleti'
                    ? ` (${recipientCount})`
                    : ''}
                </Button>
                <Button
                  variant={formRecipientFilter === 'custom' ? 'default' : 'outline'}
                  className="flex-1 min-w-[140px]"
                  onClick={() => onFormRecipientFilterChange('custom')}
                >
                  <UserCheck className="mr-2 h-4 w-4 shrink-0" />
                  Atleta specifico
                  {formRecipientFilter === 'custom' && formSelectedAthletes.length > 0
                    ? recipientCount !== null
                      ? ` (${recipientCount})`
                      : ''
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

            {/* Titolo e messaggio */}
            <div className="space-y-4">
              <Input
                label="Titolo"
                placeholder="Es: Nuova scheda disponibile"
                value={formTitle}
                onChange={(e) => onFormTitleChange(e.target.value)}
              />
              <Textarea
                label="Messaggio"
                placeholder="Scrivi il contenuto della comunicazione..."
                value={formMessage}
                onChange={(e) => onFormMessageChange(e.target.value)}
              />
            </div>

            {/* Programmazione */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="shrink-0">
                <Checkbox
                  id="schedule"
                  checked={formScheduled}
                  onChange={(e) => onFormScheduledChange(e.target.checked)}
                  label="Programma invio"
                />
              </div>
              {formScheduled && (
                <Input
                  type="datetime-local"
                  className="min-w-0 flex-1 sm:max-w-xs"
                  value={formScheduledDate}
                  onChange={(e) => onFormScheduledDateChange(e.target.value)}
                />
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseRequest} disabled={formLoading}>
              Annulla
            </Button>
            <Button
              variant="secondary"
              onClick={onCreateDraft}
              disabled={formLoading || !formTitle.trim() || !formMessage.trim()}
            >
              {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" /> : null}
              Salva bozza
            </Button>
            <Button
              onClick={onCreateAndSend}
              disabled={formLoading || !formTitle.trim() || !formMessage.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {formLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
              ) : (
                <Send className="mr-2 h-4 w-4 shrink-0" />
              )}
              Invia ora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmExit} onOpenChange={setShowConfirmExit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifiche non salvate</AlertDialogTitle>
            <AlertDialogDescription>
              Hai modifiche non salvate. Uscendo le perderai. Vuoi uscire?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit}>Esci</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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

        if (response.status === 404 || !response.ok) {
          setAthletes([])
          return
        }

        const data = await response.json()
        setAthletes(data.athletes ?? [])
      } catch {
        setAthletes([])
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
      <div className="mt-4 p-4 rounded-lg border border-white/10 bg-white/[0.02]">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-text-tertiary" />
          <span className="ml-2 text-text-tertiary text-sm">Caricamento atleti...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02]">
      {/* Search bar */}
      <div className="border-b border-white/10 p-3">
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
                className="flex items-center space-x-3 p-2 rounded hover:bg-white/[0.04] cursor-pointer transition-colors"
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
      <div className="border-t border-white/10 bg-white/[0.02] p-3">
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
