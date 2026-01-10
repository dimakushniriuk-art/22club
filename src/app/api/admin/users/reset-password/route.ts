import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import type { Database, Tables } from '@/types/supabase'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/admin/users/reset-password')

const resetPasswordSchema = z.object({
  userId: z.string().min(1, 'ID utente richiesto'),
  password: z.string().min(6, 'La password deve essere di almeno 6 caratteri'),
})

export async function POST(request: NextRequest) {
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

    const adminProfile = profile as { role?: string } | null
    const userRole = adminProfile?.role ?? ''
    if (!adminProfile || userRole !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Valida input
    const body = await request.json()
    const parsedBody = resetPasswordSchema.safeParse(body)

    if (!parsedBody.success) {
      const [firstError] = parsedBody.error.issues
      return NextResponse.json({ error: firstError?.message ?? 'Dati non validi' }, { status: 400 })
    }

    const { userId, password } = parsedBody.data

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

    // Recupera profilo per ottenere user_id
    type ProfileData = { id: string; user_id: string; email: string }
    type ProfileSelect = Pick<Tables<'profiles'>, 'id' | 'user_id' | 'email'>

    // Prima prova a cercare per id
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, email')
      .eq('id', userId)
      .maybeSingle()

    // Se non trovato per id, prova con user_id (ID auth.users)
    let profileData: ProfileData | null = null
    const typedUserProfile = userProfile as ProfileSelect | null
    if (typedUserProfile && typedUserProfile.user_id) {
      profileData = {
        id: typedUserProfile.id,
        user_id: typedUserProfile.user_id,
        email: typedUserProfile.email ?? '',
      }
    } else {
      const { data: userProfileByUserId } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, email')
        .eq('user_id', userId)
        .maybeSingle()

      const typedUserProfileByUserId = userProfileByUserId as ProfileSelect | null
      if (typedUserProfileByUserId && typedUserProfileByUserId.user_id) {
        profileData = {
          id: typedUserProfileByUserId.id,
          user_id: typedUserProfileByUserId.user_id,
          email: typedUserProfileByUserId.email ?? '',
        }
      }
    }

    if (!profileData || !profileData.user_id) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }

    const validProfileData = profileData

    // Aggiorna password (validProfileData.user_id è garantito non-null dal check sopra)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      validProfileData.user_id!,
      { password },
    )

    if (authError) {
      logger.error('Errore reset password', authError, {
        profileId: validProfileData.id,
        authUserId: validProfileData.user_id,
      })
      return NextResponse.json(
        { error: authError.message || "Errore nell'aggiornamento della password" },
        { status: 500 },
      )
    }

    logger.info('Password resettata con successo', {
      profileId: validProfileData.id,
      authUserId: validProfileData.user_id,
      email: validProfileData.email,
    })

    return NextResponse.json({
      success: true,
      message: 'Password aggiornata con successo',
    })
  } catch (error: unknown) {
    logger.error('Errore reset password', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore interno del server' },
      { status: 500 },
    )
  }
}
