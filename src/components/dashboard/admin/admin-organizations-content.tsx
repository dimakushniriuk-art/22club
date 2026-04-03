'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Building2,
  Users,
  Search,
  RefreshCw,
  FileText,
  Eye,
  User,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { createLogger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/shared/ui/skeleton'
import { ModernKPICard } from '@/components/dashboard/modern-kpi-card'
import { notifySuccess, notifyError } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/client'
import { usePdfPreviewDialog } from '@/hooks/use-pdf-preview-dialog'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'
import { buildTabularExportPdfBlob, type ExportData } from '@/lib/export-utils'

const logger = createLogger('AdminOrganizationsContent')

interface Organization {
  id: string
  name: string
  created_at: string
  user_count?: number
}

interface OrganizationUser {
  id: string
  nome: string | null
  cognome: string | null
  email: string
  role: string | null
  stato: string | null
}

export function AdminOrganizationsContent() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [orgUsers, setOrgUsers] = useState<OrganizationUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const supabase = createClient()
  const {
    open: pdfOpen,
    blob: pdfBlob,
    filename: pdfFilename,
    loading: pdfLoading,
    setLoading: setPdfLoading,
    openWithBlob: openPdfWithBlob,
    onOpenChange: onPdfOpenChange,
  } = usePdfPreviewDialog()

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true)

      // Verifica se esiste la tabella organizations (non nei tipi generati)
      const orgsClient = supabase as unknown as {
        from: (table: string) => ReturnType<typeof supabase.from>
      }
      const { data: orgsData, error: orgsError } = await orgsClient
        .from('organizations')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })

      if (orgsError) {
        // Se la tabella non esiste, usa org_id da profiles
        logger.warn('Tabella organizations non trovata, uso org_id da profiles', orgsError)

        // Raggruppa per org_id da profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('org_id')
          .not('org_id', 'is', null)

        const orgMap = new Map<string, { name: string; user_count: number }>()
        ;(profiles || []).forEach((p: { org_id?: string | null }) => {
          const orgId = p.org_id as string
          if (orgId) {
            const existing = orgMap.get(orgId) || {
              name: `Organizzazione ${orgId.substring(0, 8)}`,
              user_count: 0,
            }
            existing.user_count += 1
            orgMap.set(orgId, existing)
          }
        })

        const orgs: Organization[] = Array.from(orgMap.entries()).map(([id, data]) => ({
          id,
          name: data.name,
          created_at: new Date().toISOString(),
          user_count: data.user_count,
        }))

        setOrganizations(orgs)
        return
      }

      // Se la tabella esiste, conta utenti per organizzazione
      const orgsList = (orgsData || []) as unknown as Array<{
        id: string
        name?: string
        created_at?: string
      }>
      const orgsWithCounts = await Promise.all(
        orgsList.map(async (org) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', org.id)

          return {
            ...org,
            user_count: count || 0,
          }
        }),
      )

      setOrganizations(orgsWithCounts as Organization[])
    } catch (error: unknown) {
      logger.error('Errore nel caricamento organizzazioni', error)
      notifyError(
        'Errore',
        error instanceof Error ? error.message : 'Errore nel caricamento organizzazioni',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [supabase])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchOrganizations()
  }, [fetchOrganizations])

  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

  const filteredOrganizations = useMemo(
    () => organizations.filter((org) => org.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [organizations, searchTerm],
  )

  // Statistiche
  const stats = useMemo(() => {
    const total = organizations.length
    const totalUsers = organizations.reduce((sum, org) => sum + (org.user_count || 0), 0)
    const avgUsersPerOrg = total > 0 ? Math.round((totalUsers / total) * 10) / 10 : 0
    const orgsWithUsers = organizations.filter((org) => (org.user_count || 0) > 0).length

    return {
      total,
      totalUsers,
      avgUsersPerOrg,
      orgsWithUsers,
    }
  }, [organizations])

  const handleViewUsers = useCallback(
    async (org: Organization) => {
      setSelectedOrg(org)
      setLoadingUsers(true)
      setOrgUsers([])

      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, nome, cognome, email, role, stato')
          .eq('org_id', org.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        setOrgUsers((profiles || []) as OrganizationUser[])
      } catch (error: unknown) {
        logger.error('Errore nel caricamento utenti organizzazione', error)
        notifyError(
          'Errore',
          error instanceof Error ? error.message : 'Errore nel caricamento utenti',
        )
        setOrgUsers([])
      } finally {
        setLoadingUsers(false)
      }
    },
    [supabase],
  )

  const handleCloseUsersDialog = useCallback(() => {
    setSelectedOrg(null)
    setOrgUsers([])
  }, [])

  const handleExportPdf = useCallback(async () => {
    if (filteredOrganizations.length === 0) return
    setPdfLoading(true)
    try {
      const data: ExportData = filteredOrganizations.map((org) => ({
        'Nome Organizzazione': org.name,
        ID: org.id,
        'Numero Utenti': org.user_count ?? 0,
        'Data Creazione': new Date(org.created_at).toISOString().split('T')[0],
      }))
      const blob = await buildTabularExportPdfBlob('Organizzazioni', data)
      openPdfWithBlob(blob, `organizzazioni_${new Date().toISOString().split('T')[0]}.pdf`)
      notifySuccess('Export', 'PDF pronto in anteprima')
    } catch (error) {
      logger.error('Errore esportazione PDF', error)
      notifyError('Errore', "Errore durante l'esportazione del PDF")
    } finally {
      setPdfLoading(false)
    }
  }, [filteredOrganizations, setPdfLoading, openPdfWithBlob])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestione Organizzazioni</h1>
          <p className="text-gray-400 mt-1">Gestisci le organizzazioni del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-background-secondary border-border hover:bg-background-tertiary"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleExportPdf()}
            className="bg-background-secondary border-border hover:bg-background-tertiary"
            disabled={filteredOrganizations.length === 0 || pdfLoading}
            aria-busy={pdfLoading}
          >
            <FileText className="h-4 w-4 mr-2" />
            Esporta PDF
          </Button>
        </div>
      </div>

      {/* Statistiche KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernKPICard
          title="Totale Organizzazioni"
          value={stats.total}
          icon={<Building2 className="h-5 w-5" />}
          color="orange"
          animationDelay="0ms"
        />
        <ModernKPICard
          title="Totale Utenti"
          value={stats.totalUsers}
          icon={<Users className="h-5 w-5" />}
          color="blue"
          animationDelay="100ms"
        />
        <ModernKPICard
          title="Media Utenti/Org"
          value={stats.avgUsersPerOrg}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
          animationDelay="200ms"
        />
        <ModernKPICard
          title="Org con Utenti"
          value={stats.orgsWithUsers}
          icon={<User className="h-5 w-5" />}
          color="purple"
          animationDelay="300ms"
        />
      </div>

      {/* Info */}
      {organizations.length === 0 && (
        <Card variant="trainer" className="bg-background-secondary border-border">
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">
              ⚠️ La tabella organizations non è ancora stata creata. Le organizzazioni sono gestite
              tramite org_id nei profili.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Ricerca */}
      <Card variant="trainer" className="bg-background-secondary border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <Input
              placeholder="Cerca organizzazione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border text-text-primary placeholder:text-text-secondary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabella Organizzazioni */}
      <Card variant="trainer" className="bg-background-secondary border-border">
        <CardHeader>
          <CardTitle className="text-white">
            Organizzazioni ({filteredOrganizations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-text-secondary">Nome</TableHead>
                  <TableHead className="text-text-secondary">Utenti</TableHead>
                  <TableHead className="text-text-secondary">Data Creazione</TableHead>
                  <TableHead className="text-text-secondary w-32">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-text-secondary">
                      {organizations.length === 0
                        ? 'Nessuna organizzazione trovata. Le organizzazioni vengono create automaticamente quando gli utenti vengono assegnati a un org_id.'
                        : 'Nessuna organizzazione corrisponde alla ricerca'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrganizations.map((org) => (
                    <TableRow
                      key={org.id}
                      className="border-border hover:bg-background-tertiary/50 transition-colors"
                    >
                      <TableCell className="text-text-primary">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-orange-400 flex-shrink-0" />
                          <span className="font-medium">{org.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-teal-500/30 text-teal-400 bg-teal-500/10"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {org.user_count || 0} utenti
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(org.created_at).toLocaleDateString('it-IT', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUsers(org)}
                          className="h-8 text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Utenti
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Utenti Organizzazione */}
      <Dialog open={!!selectedOrg} onOpenChange={(open) => !open && handleCloseUsersDialog()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-text-primary">
              <Building2 className="h-5 w-5 text-orange-400" />
              Utenti di: {selectedOrg?.name}
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              Lista completa degli utenti appartenenti a questa organizzazione.
            </DialogDescription>
          </DialogHeader>

          {loadingUsers ? (
            <div className="py-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : orgUsers.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-text-secondary">
                Nessun utente trovato per questa organizzazione.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  Trovati <strong className="text-text-primary">{orgUsers.length}</strong> utenti
                </p>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-text-secondary">Nome</TableHead>
                      <TableHead className="text-text-secondary">Email</TableHead>
                      <TableHead className="text-text-secondary">Ruolo</TableHead>
                      <TableHead className="text-text-secondary">Stato</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="border-border hover:bg-background-tertiary/50"
                      >
                        <TableCell className="text-text-primary">
                          {user.nome || user.cognome
                            ? `${user.nome || ''} ${user.cognome || ''}`.trim()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-text-secondary">{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-purple-500/30 text-purple-400 bg-purple-500/10"
                          >
                            {user.role || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.stato === 'attivo'
                                ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                : user.stato === 'sospeso'
                                  ? 'border-red-500/30 text-red-400 bg-red-500/10'
                                  : 'border-gray-500/30 text-gray-400 bg-gray-500/10'
                            }
                          >
                            {user.stato || 'N/A'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PdfCanvasPreviewDialog
        open={pdfOpen}
        onOpenChange={onPdfOpenChange}
        blob={pdfBlob}
        filename={pdfFilename}
        title="Anteprima — Organizzazioni"
      />
    </div>
  )
}
