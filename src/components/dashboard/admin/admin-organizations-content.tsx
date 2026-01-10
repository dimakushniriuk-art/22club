'use client'

import { useState, useEffect, useCallback } from 'react'
import { Building2, Edit, Users, Search } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AdminOrganizationsContent')
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
import { Skeleton } from '@/components/shared/ui/skeleton'
// Nota: notifySuccess potrebbe essere usato in futuro per notifiche successo
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { notifySuccess, notifyError } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/client'

interface Organization {
  id: string
  name: string
  created_at: string
  user_count?: number
}

export function AdminOrganizationsContent() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true)

      // Verifica se esiste la tabella organizations
      const { data: orgsData, error: orgsError } = await supabase
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
        ;(profiles || []).forEach((p) => {
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
      const orgsWithCounts = await Promise.all(
        (orgsData || []).map(async (org) => {
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

      setOrganizations(orgsWithCounts)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error('Errore nel caricamento organizzazioni', error)
      notifyError('Errore', error.message || 'Errore nel caricamento organizzazioni')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchOrganizations()
  }, [fetchOrganizations])

  const filteredOrganizations = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
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
      </div>

      {/* Info */}
      <Card className="bg-background-secondary border-border">
        <CardContent className="p-4">
          <p className="text-sm text-gray-400">
            {organizations.length === 0
              ? '⚠️ La tabella organizations non è ancora stata creata. Le organizzazioni sono gestite tramite org_id nei profili.'
              : `Trovate ${organizations.length} organizzazioni nel sistema.`}
          </p>
        </CardContent>
      </Card>

      {/* Ricerca */}
      <Card className="bg-background-secondary border-border">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cerca organizzazione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabella Organizzazioni */}
      <Card className="bg-background-secondary border-border">
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
                  <TableHead className="text-gray-300">Nome</TableHead>
                  <TableHead className="text-gray-300">Utenti</TableHead>
                  <TableHead className="text-gray-300">Data Creazione</TableHead>
                  <TableHead className="text-gray-300 w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                      {organizations.length === 0
                        ? 'Nessuna organizzazione trovata. Le organizzazioni vengono create automaticamente quando gli utenti vengono assegnati a un org_id.'
                        : 'Nessuna organizzazione corrisponde alla ricerca'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrganizations.map((org) => (
                    <TableRow
                      key={org.id}
                      className="border-border hover:bg-background-tertiary/50"
                    >
                      <TableCell className="text-white flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-orange-400" />
                        {org.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-teal-500/30 text-teal-400">
                          <Users className="h-3 w-3 mr-1" />
                          {org.user_count || 0} utenti
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(org.created_at).toLocaleDateString('it-IT', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white"
                            title="Modifica (non implementato)"
                            disabled
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
