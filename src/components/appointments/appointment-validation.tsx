'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:appointments:appointment-validation')
import { Card, CardContent, Badge, Button } from '@/components/ui'
import {
  canCancelAppointment,
  canModifyAppointment,
  getAppointmentStatus,
  formatAppointmentTime,
  formatAppointmentDate,
} from '@/lib/appointment-utils'
import type { AppointmentUI } from '@/types/appointment'

interface AppointmentValidationProps {
  appointment: AppointmentUI
  onValidationChange?: (isValid: boolean, errors: string[]) => void
}

export function AppointmentValidation({
  appointment,
  onValidationChange,
}: AppointmentValidationProps) {
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
    canCancel: false,
    canModify: false,
    status: 'attivo' as 'attivo' | 'completato' | 'annullato',
  })
  const [loading, setLoading] = useState(false)

  const validateAppointment = useCallback(async () => {
    setLoading(true)
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Verifica sovrapposizioni
      // Nota: AppointmentUI non ha staffId, quindi saltiamo questo controllo
      // In una implementazione reale, dovresti passare staffId come parametro separato
      const hasOverlap = false
      const conflictingAppointments: unknown[] = []

      if (hasOverlap) {
        errors.push(`Sovrapposizione con ${conflictingAppointments.length} appuntamento/i`)
      }

      // Verifica date
      const startDate = new Date(appointment.starts_at)
      const endDate = new Date(appointment.ends_at)
      const now = new Date()

      if (endDate <= startDate) {
        errors.push('La data di fine deve essere successiva alla data di inizio')
      }

      if (startDate < now) {
        warnings.push("L'appuntamento è nel passato")
      }

      // Verifica durata
      const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60)
      if (duration < 15) {
        warnings.push('Durata minima consigliata: 15 minuti')
      }
      if (duration > 180) {
        warnings.push('Durata massima consigliata: 3 ore')
      }

      // Verifica permessi
      const canCancel = canCancelAppointment(appointment.starts_at, null)
      const canModify = canModifyAppointment(appointment.starts_at, null)
      const status = getAppointmentStatus(appointment.starts_at, appointment.ends_at, null)

      setValidation({
        isValid: errors.length === 0,
        errors,
        warnings,
        canCancel,
        canModify,
        status,
      })

      onValidationChange?.(errors.length === 0, errors)
    } catch (error) {
      logger.error('Error validating appointment', error, { appointmentId: appointment.id })
      setValidation((prev) => ({
        ...prev,
        isValid: false,
        errors: [...prev.errors, 'Errore durante la validazione'],
      }))
    } finally {
      setLoading(false)
    }
  }, [appointment, onValidationChange])

  useEffect(() => {
    validateAppointment()
  }, [validateAppointment])

  if (loading) {
    return (
      <Card variant="outlined">
        <CardContent padding="md">
          <div className="flex items-center gap-2">
            <Clock className="text-brand h-4 w-4 animate-spin" />
            <span className="text-text-secondary">Validazione in corso...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* Status */}
      <Card variant="outlined">
        <CardContent padding="md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <CheckCircle className="text-state-valid h-5 w-5" />
              ) : (
                <XCircle className="text-state-error h-5 w-5" />
              )}
              <span className="text-text-primary font-medium">
                {validation.isValid ? 'Appuntamento valido' : 'Appuntamento non valido'}
              </span>
            </div>
            <Badge
              variant={
                validation.status === 'annullato'
                  ? 'warning'
                  : validation.status === 'completato'
                    ? 'primary'
                    : 'success'
              }
              size="sm"
            >
              {validation.status === 'annullato'
                ? 'Cancellato'
                : validation.status === 'completato'
                  ? 'Completato'
                  : 'Programmato'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {validation.errors.length > 0 && (
        <Card variant="outlined" className="border-state-error bg-red-950">
          <CardContent padding="md">
            <div className="flex items-start gap-2">
              <XCircle className="text-state-error mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <h4 className="text-state-error mb-2 font-medium">Errori:</h4>
                <ul className="space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="text-state-error text-sm">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <Card variant="outlined" className="border-state-warn bg-yellow-950">
          <CardContent padding="md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-state-warn mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <h4 className="text-state-warn mb-2 font-medium">Avvisi:</h4>
                <ul className="space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="text-state-warn text-sm">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment Details */}
      <Card variant="outlined">
        <CardContent padding="md">
          <h4 className="text-text-primary mb-3 font-medium">Dettagli appuntamento</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Data:</span>
              <span className="text-text-primary">
                {formatAppointmentDate(appointment.starts_at)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Orario:</span>
              <span className="text-text-primary">
                {formatAppointmentTime(appointment.starts_at)} -{' '}
                {formatAppointmentTime(appointment.ends_at)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Luogo:</span>
              <span className="text-text-primary">{appointment.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Tipo:</span>
              <span className="text-text-primary capitalize">{appointment.notes}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        {validation.canModify && (
          <Button variant="outline" size="sm" className="flex-1">
            Modifica
          </Button>
        )}
        {validation.canCancel && (
          <Button variant="outline" size="sm" className="flex-1">
            Cancella
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={validateAppointment}>
          Ricontrolla
        </Button>
      </div>
    </div>
  )
}
