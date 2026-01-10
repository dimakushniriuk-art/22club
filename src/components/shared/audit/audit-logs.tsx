'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createLogger } from '@/lib/logger'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const logger = createLogger('components:shared:audit:audit-logs')
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getAuditLogs, type AuditLog } from '@/lib/audit'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { Download, RefreshCw } from 'lucide-react'

interface AuditLogsProps {
  limit?: number
  showFilters?: boolean
  showExport?: boolean
}

export function AuditLogs({ limit = 50, showFilters = true, showExport = true }: AuditLogsProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAuditLogs(limit)
      setLogs(data)
    } catch (err) {
      setError('Errore nel caricamento dei log')
      logger.error('Error loading audit logs', err, { limit })
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    void loadLogs()
  }, [loadLogs])

  const filteredLogs = useMemo(() => {
    const searchValue = searchTerm.toLowerCase()
    return logs.filter((log) => {
      const matchesSearch =
        searchValue === '' ||
        log.event.toLowerCase().includes(searchValue) ||
        log.email?.toLowerCase().includes(searchValue) ||
        JSON.stringify(log.details ?? {})
          .toLowerCase()
          .includes(searchValue)

      const matchesEvent = eventFilter === 'all' || log.event === eventFilter
      const matchesUser = userFilter === 'all' || log.email === userFilter

      return matchesSearch && matchesEvent && matchesUser
    })
  }, [eventFilter, logs, searchTerm, userFilter])

  const uniqueEvents = useMemo(() => Array.from(new Set(logs.map((log) => log.event))), [logs])
  const uniqueUsers = useMemo(
    () => Array.from(new Set(logs.map((log) => log.email).filter(Boolean))) as string[],
    [logs],
  )

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Event', 'Details', 'IP Address', 'User Agent'],
      ...filteredLogs.map((log) => [
        new Date(log.created_at).toISOString(),
        log.email || 'N/A',
        log.event,
        JSON.stringify(log.details || {}),
        log.ip_address || 'N/A',
        log.user_agent || 'N/A',
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getEventBadgeVariant = (event: string) => {
    if (event.includes('login') || event.includes('logout')) return 'default'
    if (event.includes('create') || event.includes('upload')) return 'secondary'
    if (event.includes('update') || event.includes('modify')) return 'outline'
    if (event.includes('delete') || event.includes('remove')) return 'destructive'
    if (event.includes('error') || event.includes('violation')) return 'destructive'
    return 'secondary'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log di Audit</CardTitle>
          <CardDescription>Caricamento in corso...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log di Audit</CardTitle>
          <CardDescription>Errore nel caricamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadLogs} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Riprova
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Log di Audit</CardTitle>
            <CardDescription>Tracciamento delle azioni utente e eventi di sistema</CardDescription>
          </div>
          <div className="flex gap-2">
            {showExport && (
              <Button onClick={exportLogs} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Esporta CSV
              </Button>
            )}
            <Button onClick={loadLogs} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Aggiorna
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {showFilters && (
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cerca nei log..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={eventFilter} onValueChange={setEventFilter} className="w-48">
                <SelectItem value="all">Tutti gli eventi</SelectItem>
                {uniqueEvents.map((event) => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
              </Select>
              <Select value={userFilter} onValueChange={setUserFilter} className="w-48">
                <SelectItem value="all">Tutti gli utenti</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user || ''}>
                    {user}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Utente</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Dettagli</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nessun log trovato
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                        locale: it,
                      })}
                    </TableCell>
                    <TableCell className="text-sm">{log.email || 'Sistema'}</TableCell>
                    <TableCell>
                      <Badge variant={getEventBadgeVariant(log.event)}>{log.event}</Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {log.details ? (
                        <pre className="text-xs bg-muted p-2 rounded">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.ip_address || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Mostrando {filteredLogs.length} di {logs.length} log
          </div>
        )}
      </CardContent>
    </Card>
  )
}
