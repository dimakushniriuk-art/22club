'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
} from '@/components/ui'
import { Mail, Loader2 } from 'lucide-react'

interface EmailToAthleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  athleteId: string
  athleteName: string
  athleteEmail?: string | null
}

export function EmailToAthleteModal({
  open,
  onOpenChange,
  athleteId,
  athleteName,
  athleteEmail,
}: EmailToAthleteModalProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setSubject('')
    setBody('')
    setError(null)
  }, [])

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) reset()
      onOpenChange(open)
    },
    [onOpenChange, reset],
  )

  const handleSend = useCallback(async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Inserisci oggetto e messaggio.')
      return
    }
    setError(null)
    setSending(true)
    try {
      const res = await fetch('/api/communications/send-email-to-athlete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athlete_id: athleteId,
          subject: subject.trim(),
          body: body.trim(),
          athlete_name: athleteName,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Invio fallito. Riprova.')
        return
      }
      handleClose(false)
    } catch {
      setError('Errore di connessione. Riprova.')
    } finally {
      setSending(false)
    }
  }, [athleteId, athleteName, subject, body, handleClose])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Invia email all&apos;atleta
          </DialogTitle>
          <DialogDescription>
            Scrivi il messaggio e invialo direttamente all&apos;indirizzo email dell&apos;atleta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-xs font-medium mb-1 block">Destinatario</label>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-text-primary">
              {athleteName}
              {athleteEmail != null && athleteEmail !== '' && (
                <span className="text-text-tertiary ml-2">({athleteEmail})</span>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email-subject" className="text-text-secondary text-xs font-medium mb-1 block">
              Oggetto
            </label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Oggetto dell'email"
              className="bg-white/[0.04] border-white/10"
              disabled={sending}
            />
          </div>

          <div>
            <label htmlFor="email-body" className="text-text-secondary text-xs font-medium mb-1 block">
              Messaggio
            </label>
            <textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Scrivi qui il messaggio..."
              rows={6}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 resize-y min-h-[120px]"
              disabled={sending}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={sending}
          >
            Annulla
          </Button>
          <Button
            onClick={handleSend}
            variant="primary"
            disabled={sending || !subject.trim() || !body.trim()}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Invio in corso...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Invia email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
