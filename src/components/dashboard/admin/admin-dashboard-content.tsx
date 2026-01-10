'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, Shield, BarChart3, Building2 } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const logger = createLogger('AdminDashboardContent')
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/shared/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  totalOrganizations: number
  totalTrainers: number
  totalAthletes: number
}

export function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch statistiche globali
        const [usersResult, profilesResult] = await Promise.all([
          supabase.from('profiles').select('id, role, stato, created_at', { count: 'exact' }),
          supabase.from('profiles').select('id, role, org_id', { count: 'exact' }),
        ])

        if (usersResult.error || profilesResult.error) {
          logger.error(
            'Errore nel caricamento statistiche',
            usersResult.error || profilesResult.error,
          )
          return
        }

        const allUsers = usersResult.data || []
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const statsData: AdminStats = {
          totalUsers: usersResult.count || 0,
          activeUsers: allUsers.filter((u) => u.stato === 'attivo').length,
          newUsersThisMonth: allUsers.filter(
            (u) => u.created_at && new Date(u.created_at) >= startOfMonth,
          ).length,
          totalOrganizations: new Set(
            profilesResult.data?.map((p) => p.org_id).filter(Boolean) || [],
          ).size,
          totalTrainers: allUsers.filter((u) => u.role === 'pt' || u.role === 'trainer').length,
          totalAthletes: allUsers.filter((u) => u.role === 'atleta' || u.role === 'athlete').length,
        }

        setStats(statsData)
      } catch (error) {
        logger.error('Errore nel caricamento statistiche', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Dashboard Amministratore</h1>
        <p className="text-gray-400">Gestione completa del sistema 22Club</p>
      </div>

      {/* Statistiche Globali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-gray-400 mt-1">Utenti registrati nel sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Utenti Attivi</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.activeUsers || 0}</div>
            <p className="text-xs text-gray-400 mt-1">Utenti con stato attivo</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Nuovi Questo Mese</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.newUsersThisMonth || 0}</div>
            <p className="text-xs text-gray-400 mt-1">Nuovi utenti registrati</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Organizzazioni</CardTitle>
            <Building2 className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalOrganizations || 0}</div>
            <p className="text-xs text-gray-400 mt-1">Organizzazioni attive</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Trainer</CardTitle>
            <Users className="h-4 w-4 text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalTrainers || 0}</div>
            <p className="text-xs text-gray-400 mt-1">Personal Trainer e Trainer</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Atleti</CardTitle>
            <Users className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalAthletes || 0}</div>
            <p className="text-xs text-gray-400 mt-1">Atleti registrati</p>
          </CardContent>
        </Card>
      </div>

      {/* Azioni Rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/admin/utenti">
          <Button
            variant="outline"
            className="w-full h-auto flex flex-col items-center justify-center gap-2 p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-cyan-500/20 hover:border-blue-500/50 transition-all duration-200 hover:scale-105"
          >
            <Users className="h-6 w-6 text-blue-400" />
            <span className="text-sm font-medium text-white">Gestione Utenti</span>
          </Button>
        </Link>

        <Link href="/dashboard/admin/ruoli">
          <Button
            variant="outline"
            className="w-full h-auto flex flex-col items-center justify-center gap-2 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-500/50 transition-all duration-200 hover:scale-105"
          >
            <Shield className="h-6 w-6 text-purple-400" />
            <span className="text-sm font-medium text-white">Gestione Ruoli</span>
          </Button>
        </Link>

        <Link href="/dashboard/admin/organizzazioni">
          <Button
            variant="outline"
            className="w-full h-auto flex flex-col items-center justify-center gap-2 p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 hover:bg-gradient-to-br hover:from-orange-500/20 hover:to-red-500/20 hover:border-orange-500/50 transition-all duration-200 hover:scale-105"
          >
            <Building2 className="h-6 w-6 text-orange-400" />
            <span className="text-sm font-medium text-white">Organizzazioni</span>
          </Button>
        </Link>

        <Link href="/dashboard/admin/statistiche">
          <Button
            variant="outline"
            className="w-full h-auto flex flex-col items-center justify-center gap-2 p-6 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-500/30 hover:bg-gradient-to-br hover:from-teal-500/20 hover:to-cyan-500/20 hover:border-teal-500/50 transition-all duration-200 hover:scale-105"
          >
            <BarChart3 className="h-6 w-6 text-teal-400" />
            <span className="text-sm font-medium text-white">Statistiche Avanzate</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
