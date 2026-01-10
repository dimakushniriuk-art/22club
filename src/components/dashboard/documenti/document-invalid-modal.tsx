'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Textarea } from '@/components/ui'

interface DocumentInvalidModalProps {
  open: boolean
  rejectionReason: string
  onRejectionReasonChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export function DocumentInvalidModal({
  open,
  rejectionReason,
  onRejectionReasonChange,
  onConfirm,
  onCancel,
}: DocumentInvalidModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle size="md">Segnala documento non valido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Motivazione *"
            placeholder="Spiega perché il documento non è valido..."
            value={rejectionReason}
            onChange={(e) => onRejectionReasonChange(e.target.value)}
            rows={4}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Annulla
            </Button>
            <Button
              onClick={onConfirm}
              disabled={!rejectionReason.trim()}
              className="bg-state-error hover:bg-state-error/90 flex-1"
            >
              Segnala
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
