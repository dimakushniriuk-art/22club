'use client'

import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import {
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  Copy,
  Eye,
  CheckCircle2,
  XCircle,
  Circle,
} from 'lucide-react'
import type { AppointmentTable } from '@/types/appointment'

interface AppointmentsTableProps {
  appointments: AppointmentTable[]
  onEdit?: (appointment: AppointmentTable) => void
  onDelete?: (appointment: AppointmentTable) => void
  onDuplicate?: (appointment: AppointmentTable) => void
  onView?: (appointment: AppointmentTable) => void
}

export function AppointmentsTable({
  appointments,
  onEdit,
  onDelete,
  onDuplicate,
  onView,
}: AppointmentsTableProps) {
  // Estrai tipo appuntamento
  const getAppointmentType = (appointment: AppointmentTable): string => {
    if (appointment.type === 'allenamento') return 'Allenamento'
    if (appointment.type === 'prova') return 'Prova'
    if (appointment.type === 'valutazione') return 'Valutazione'
    return 'Appuntamento'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Gli appuntamenti vengono già filtrati dalla pagina principale
  const filteredAppointments = appointments

  return (
    <div className="relative overflow-hidden rounded-lg border border-teal-500/20 bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary backdrop-blur-xl shadow-2xl shadow-teal-500/10">
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
      <div className="relative p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20">
              <Calendar className="h-5 w-5 text-teal-400" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Lista Appuntamenti ({filteredAppointments.length})
            </h3>
          </div>
        </div>

        {/* Tabella */}
        <div className="overflow-hidden rounded-lg border border-background-tertiary/50">
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-teal-500/20 text-teal-400 rounded-full p-4">
                  <Calendar className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-text-primary mb-2 text-lg font-semibold">
                Nessun appuntamento trovato
              </h3>
              <p className="text-text-secondary text-sm">Prova a modificare i filtri di ricerca</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-background-tertiary/30">
                    <TableHead className="text-text-primary">Data</TableHead>
                    <TableHead className="text-text-primary">Ora</TableHead>
                    <TableHead className="text-text-primary">Atleta</TableHead>
                    <TableHead className="text-text-primary">Tipo</TableHead>
                    <TableHead className="text-text-primary">Stato</TableHead>
                    <TableHead className="text-text-primary text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow
                      key={appointment.id}
                      className="hover:bg-background-tertiary/50 cursor-pointer transition-colors"
                      onClick={() => onView?.(appointment)}
                    >
                      <TableCell className="text-text-primary">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-text-tertiary h-4 w-4" />
                          <span className="font-medium">{formatDate(appointment.starts_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        <div className="flex items-center gap-2">
                          <Clock className="text-text-tertiary h-4 w-4" />
                          <span>
                            {formatTime(appointment.starts_at)} - {formatTime(appointment.ends_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="text-text-tertiary h-4 w-4" />
                          <span className="text-text-primary font-medium">
                            {appointment.athlete_name || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          size="sm"
                          className="bg-teal-500/10 text-teal-400 border-teal-500/30"
                        >
                          {getAppointmentType(appointment)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          {(() => {
                            const statusLower = appointment.status?.toLowerCase() || ''
                            if (statusLower === 'attivo' || statusLower === 'active') {
                              return (
                                <div
                                  className="bg-green-500/20 text-green-400 rounded-full p-2"
                                  title="Attivo"
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </div>
                              )
                            }
                            if (statusLower === 'annullato' || statusLower === 'cancelled') {
                              return (
                                <div
                                  className="bg-red-500/20 text-red-400 rounded-full p-2"
                                  title="Annullato"
                                >
                                  <XCircle className="h-5 w-5" />
                                </div>
                              )
                            }
                            if (statusLower === 'completato' || statusLower === 'completed') {
                              return (
                                <div
                                  className="bg-blue-500/20 text-blue-400 rounded-full p-2"
                                  title="Completato"
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </div>
                              )
                            }
                            return (
                              <div
                                className="bg-gray-500/20 text-gray-400 rounded-full p-2"
                                title="Sconosciuto"
                              >
                                <Circle className="h-5 w-5" />
                              </div>
                            )
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onView && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                onView(appointment)
                              }}
                              className="h-8 w-8 text-text-secondary hover:text-teal-400 hover:bg-teal-500/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEdit(appointment)
                              }}
                              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDuplicate && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDuplicate(appointment)
                              }}
                              className="h-8 w-8 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDelete(appointment)
                              }}
                              className="h-8 w-8 text-state-error hover:text-red-300 hover:bg-error/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
