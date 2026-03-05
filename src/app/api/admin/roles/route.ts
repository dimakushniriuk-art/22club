import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'
import type { Tables } from '@/types/supabase'
import type { Database } from '@/lib/supabase/types'

const logger = createLogger('api:admin:roles')

/**
 * GET /api/admin/roles
 * Ottiene tutti i ruoli del sistema con conteggio utenti (solo admin)
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica che l'utente sia admin
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    if (profileTyped.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin può accedere a questa risorsa' }, { status: 403 })
    }

    // Usa admin client per vedere tutti i ruoli
    const supabaseAdmin = createAdminClient()

    // Ottieni tutti i ruoli
    const { data: roles, error: rolesError } = await supabaseAdmin.from('roles').select('*').order('name')

    if (rolesError) {
      logger.error('Errore durante il recupero dei ruoli', rolesError)
      return NextResponse.json({ error: 'Errore durante il recupero dei ruoli' }, { status: 500 })
    }

    // Conta utenti per ogni ruolo
    const rolesWithCount = await Promise.all(
      (roles || []).map(async (role) => {
        const { count } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', role.name)

        return {
          ...role,
          user_count: count || 0,
        }
      }),
    )

    return NextResponse.json({ roles: rolesWithCount || [] })
  } catch (error) {
    logger.error('Errore durante il recupero dei ruoli', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/roles
 * Aggiorna un ruolo (solo admin)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica che l'utente sia admin
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    if (profileTyped.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin può aggiornare ruoli' }, { status: 403 })
    }

    const body = await request.json()
    const { roleId, description, permissions } = body

    if (!roleId) {
      return NextResponse.json({ error: 'roleId è obbligatorio' }, { status: 400 })
    }

    // Usa admin client per aggiornare ruolo
    const supabaseAdmin = createAdminClient()

    // Prepara dati aggiornamento
    type RoleUpdate = Database['public']['Tables']['roles']['Update']
    const updateData: RoleUpdate = {
      updated_at: new Date().toISOString(),
    }
    if (description !== undefined) updateData.description = description || null
    if (permissions !== undefined) updateData.permissions = permissions

    // Aggiorna ruolo
    const { data: updatedRole, error: updateError } = await supabaseAdmin
      .from('roles')
      .update(updateData)
      .eq('id', roleId)
      .select()
      .single()

    if (updateError) {
      logger.error('Errore durante l\'aggiornamento del ruolo', updateError)
      return NextResponse.json({ error: 'Errore durante l\'aggiornamento' }, { status: 500 })
    }

    return NextResponse.json({ role: updatedRole })
  } catch (error) {
    logger.error('Errore durante l\'aggiornamento del ruolo', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * POST /api/admin/roles
 * Crea un nuovo ruolo (solo admin)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica che l'utente sia admin
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    if (profileTyped.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin può creare ruoli' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, permissions } = body

    if (!name) {
      return NextResponse.json({ error: 'name è obbligatorio' }, { status: 400 })
    }

    // Verifica che il nome ruolo sia valido
    const validRoleNames = ['admin', 'trainer', 'athlete', 'marketing', 'nutrizionista', 'massaggiatore']
    if (!validRoleNames.includes(name)) {
      return NextResponse.json(
        { error: `Nome ruolo non valido. Valori permessi: ${validRoleNames.join(', ')}` },
        { status: 400 },
      )
    }

    // Usa admin client per creare ruolo
    const supabaseAdmin = createAdminClient()

    // Verifica che il ruolo non esista già
    const { data: existingRole } = await supabaseAdmin.from('roles').select('id').eq('name', name).single()

    if (existingRole) {
      return NextResponse.json({ error: 'Ruolo già esistente' }, { status: 409 })
    }

    // Crea ruolo
    type RoleInsert = Database['public']['Tables']['roles']['Insert']
    const roleData: RoleInsert = {
      name,
      description: description || null,
      permissions: permissions || {},
    }

    const { data: createdRole, error: createError } = await supabaseAdmin
      .from('roles')
      .insert(roleData)
      .select()
      .single()

    if (createError) {
      logger.error('Errore durante la creazione del ruolo', createError)
      return NextResponse.json({ error: 'Errore durante la creazione' }, { status: 500 })
    }

    return NextResponse.json({ role: createdRole })
  } catch (error) {
    logger.error('Errore durante la creazione del ruolo', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/roles
 * Elimina un ruolo (solo admin)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica che l'utente sia admin
    type ProfileRow = Pick<Tables<'profiles'>, 'id' | 'org_id' | 'role'>
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, org_id, role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }
    const profileTyped = profile as ProfileRow

    if (profileTyped.role !== 'admin') {
      return NextResponse.json({ error: 'Solo admin può eliminare ruoli' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const roleId = searchParams.get('roleId')

    if (!roleId) {
      return NextResponse.json({ error: 'roleId è obbligatorio' }, { status: 400 })
    }

    // Usa admin client per eliminare ruolo
    const supabaseAdmin = createAdminClient()

    // Verifica che il ruolo esista
    const { data: existingRole, error: fetchError } = await supabaseAdmin
      .from('roles')
      .select('id, name')
      .eq('id', roleId)
      .single()

    if (fetchError || !existingRole) {
      return NextResponse.json({ error: 'Ruolo non trovato' }, { status: 404 })
    }

    // Verifica che non ci siano utenti con questo ruolo
    const { count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', existingRole.name)

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Impossibile eliminare ruolo: ci sono ${count} utenti con questo ruolo` },
        { status: 400 },
      )
    }

    // Elimina ruolo
    const { error: deleteError } = await supabaseAdmin.from('roles').delete().eq('id', roleId)

    if (deleteError) {
      logger.error('Errore durante l\'eliminazione del ruolo', deleteError)
      return NextResponse.json({ error: 'Errore durante l\'eliminazione' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Errore durante l\'eliminazione del ruolo', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}