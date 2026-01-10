import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { TablesUpdate } from '@/types/supabase'

const logger = createLogger('api/admin/roles')

const updateRoleSchema = z.object({
  roleId: z.string().uuid(),
  description: z.string().optional().nullable(),
  permissions: z.record(z.string(), z.boolean()).optional(),
})

// GET - Lista tutti i ruoli con conteggio utenti (solo admin)
export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const profileData = profile as { role?: string } | null
    const userRole = profileData?.role ?? ''
    if (!profileData || userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Recupera tutti i ruoli
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true })

    if (rolesError) throw rolesError

    // Conta utenti per ogni ruolo
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('role')

    if (profilesError) throw profilesError

    const roleCounts: Record<string, number> = {}
    profiles?.forEach((profileItem) => {
      const profileData = profileItem as { role?: string } | null
      const role = profileData?.role ?? ''
      if (role) {
        roleCounts[role] = (roleCounts[role] || 0) + 1
      }
    })

    // Aggiungi conteggio utenti a ogni ruolo
    const rolesWithCounts = (roles || []).map((roleItem) => {
      const role = roleItem as { name?: string; [key: string]: unknown } | null
      return {
        ...role,
        user_count: roleCounts[role?.name || ''] || 0,
      }
    })

    return NextResponse.json({ roles: rolesWithCounts })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error('Errore nel recupero ruoli', error)
    return NextResponse.json(
      { error: error.message || 'Errore nel recupero ruoli' },
      { status: 500 },
    )
  }
}

// PUT - Aggiorna ruolo (solo admin)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const profileData = profile as { role?: string } | null
    const userRole = profileData?.role ?? ''
    if (!profileData || userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Valida input
    const body = await request.json()
    const parsedBody = updateRoleSchema.safeParse(body)

    if (!parsedBody.success) {
      const [firstError] = parsedBody.error.issues
      return NextResponse.json({ error: firstError?.message ?? 'Dati non validi' }, { status: 400 })
    }

    const { roleId, description, permissions } = parsedBody.data

    // Aggiorna ruolo
    const updateData: TablesUpdate<'roles'> & { permissions?: Record<string, boolean> } = {}
    if (description !== undefined) updateData.description = description || null
    if (permissions !== undefined) updateData.permissions = permissions

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedRole, error: updateError } = await (supabase.from('roles') as any)
      .update(updateData)
      .eq('id', roleId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Errore nell'aggiornamento ruolo" },
        { status: 500 },
      )
    }

    return NextResponse.json({ role: updatedRole })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error("Errore nell'aggiornamento ruolo", error)
    return NextResponse.json(
      { error: error.message || "Errore nell'aggiornamento ruolo" },
      { status: 500 },
    )
  }
}
