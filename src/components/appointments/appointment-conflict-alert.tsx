'use client'

import { AlertTriangle, Clock, User } from 'lucide-react'
import { Card, CardContent, Badge, Button } from '@/components/ui'
type AppointmentConflict = {
  conflictType?: 'overlap' | 'double'
  message?: string
  appointment?: {
    id: string
    starts_at: string
    trainer_id?: string | null
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface AppointmentConflictAlertProps {
  conflicts: AppointmentConflict[]
  onResolve?: (conflictId: string) => void
  onIgnore?: (conflictId: string) => void
}

export function AppointmentConflictAlert({
  conflicts,
  onResolve,
  onIgnore,
}: AppointmentConflictAlertProps) {
  if (conflicts.length === 0) return null

  return (
    <Card variant="outlined" className="border-state-error bg-state-error/5">
      <CardContent padding="md">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-state-error mt-0.5 h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-text-primary mb-2 font-semibold">Conflitti rilevati</h3>
            <div className="space-y-3">
              {conflicts.map((conflict, index) => (
                <div key={index} className="bg-background-secondary rounded-lg p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge
                      variant={conflict.conflictType === 'overlap' ? 'warning' : 'error'}
                      size="sm"
                    >
                      {conflict.conflictType === 'overlap'
                        ? 'Sovrapposizione'
                        : 'Doppia prenotazione'}
                    </Badge>
                    <div className="flex gap-2">
                      {onResolve && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => conflict.appointment && onResolve(conflict.appointment.id)}
                        >
                          Risolvi
                        </Button>
                      )}
                      {onIgnore && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => conflict.appointment && onIgnore(conflict.appointment.id)}
                        >
                          Ignora
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-text-secondary mb-2 text-sm">{conflict.message}</p>
                  <div className="text-text-tertiary flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {conflict.appointment
                          ? new Date(conflict.appointment.starts_at).toLocaleString('it-IT')
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Trainer ID: {conflict.appointment?.trainer_id || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
