import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import type { Database, Tables } from '@/types/supabase'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/admin/users/verify-login')

// POST - Verifica e fix login utente (solo admin)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const adminProfile = profile as { role?: string } | null
    const userRole = adminProfile?.role ?? ''
    if (!adminProfile || userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password } = body

    if (!email) {
      return NextResponse.json({ error: 'Email richiesta' }, { status: 400 })
    }

    // Crea client con service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configurazione server mancante' }, { status: 500 })
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Cerca utente in auth.users
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = authUsers?.users?.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase())

    if (!authUser) {
      return NextResponse.json(
        {
          error: 'Utente non trovato in auth.users',
          email,
          found: false,
        },
        { status: 404 },
      )
    }

    // Verifica profilo
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle()

    // Se password è fornita, prova ad aggiornarla
    let passwordUpdated = false
    if (password) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        password,
        email_confirm: true, // Assicura che l'email sia confermata
      })

      if (updateError) {
        logger.error('Errore aggiornamento password', updateError, { userId: authUser.id, email })
        return NextResponse.json(
          {
            error: 'Errore aggiornamento password',
            details: updateError.message,
            email,
            authUser: {
              id: authUser.id,
              email: authUser.email,
              email_confirmed_at: authUser.email_confirmed_at,
              created_at: authUser.created_at,
            },
            profile: userProfile,
          },
          { status: 500 },
        )
      }
      passwordUpdated = true
    }

    // Verifica se l'email è confermata
    const emailConfirmed = !!authUser.email_confirmed_at

    // Se email non confermata, confermala
    let emailConfirmedNow = false
    if (!emailConfirmed) {
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        email_confirm: true,
      })

      if (!confirmError) {
        emailConfirmedNow = true
      }
    }

    return NextResponse.json({
      success: true,
      email,
      authUser: {
        id: authUser.id,
        email: authUser.email,
        email_confirmed_at: authUser.email_confirmed_at,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
      },
      profile: userProfile
        ? {
            id: (userProfile as Tables<'profiles'>).id,
            nome: (userProfile as Tables<'profiles'>).nome,
            cognome: (userProfile as Tables<'profiles'>).cognome,
            role: (userProfile as Tables<'profiles'>).role,
            stato: (userProfile as Tables<'profiles'>).stato,
          }
        : null,
      actions: {
        passwordUpdated,
        emailConfirmedNow,
        emailWasConfirmed: emailConfirmed,
      },
      message: passwordUpdated
        ? 'Password aggiornata con successo. Prova a fare login ora.'
        : emailConfirmedNow
          ? 'Email confermata. Prova a fare login.'
          : 'Utente verificato. Se il login non funziona, verifica la password.',
    })
  } catch (error: unknown) {
    logger.error('Errore verifica login utente', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore durante la verifica' },
      { status: 500 },
    )
  }
}
