import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:athletes:[id]')

const updateAthleteSchema = z.object({
  nome: z.string().trim().min(1, 'Il nome è obbligatorio'),
  cognome: z.string().trim().min(1, 'Il cognome è obbligatorio'),
  email: z.string().trim().email('Email non valida'),
  phone: z.string().trim().min(1).optional(),
  stato: z.string().trim().min(1).optional(),
  note: z.string().trim().optional().nullable(),
  data_iscrizione: z.string().trim().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Verifica autenticazione e permessi
    const supabase = await createServerClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Verifica ruolo utente
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    const profileData = profile as { role?: string } | null
    const userRole = profileData?.role ?? ''

    if (!profileData || !['admin', 'pt', 'trainer'].includes(userRole)) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
    }

    // Assicurati che il profilo esista
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, user_id, email')
      .eq('id', id)
      .single()

    if (fetchError || !existingProfile) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    const existingProfileData = existingProfile as {
      id?: string
      user_id?: string
      email?: string
    } | null

    // Validazione input
    const body = await request.json()
    const parsedBody = updateAthleteSchema.safeParse(body)

    if (!parsedBody.success) {
      const [firstError] = parsedBody.error.issues
      return NextResponse.json({ error: firstError?.message ?? 'Dati non validi' }, { status: 400 })
    }

    const { nome, cognome, email, phone, stato, note, data_iscrizione } = parsedBody.data

    let normalizedDataIscrizione: string | undefined
    if (data_iscrizione) {
      const parsedDate = new Date(data_iscrizione)
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: 'La data di iscrizione non è valida' }, { status: 400 })
      }
      normalizedDataIscrizione = parsedDate.toISOString()
    }

    // Aggiorna profilo nella tabella profiles
    const updateData = {
      nome,
      cognome,
      email,
      phone: phone ?? null,
      stato: stato ?? 'attivo',
      note: note ?? null,
      data_iscrizione: normalizedDataIscrizione ?? null,
    }

    // Aggiorna il profilo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedProfile, error: updateError } = await (supabase.from('profiles') as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updateData as any)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      logger.error('Errore aggiornamento profilo', updateError, { athleteId: id })
      return NextResponse.json(
        { error: updateError.message || "Errore durante l'aggiornamento del profilo" },
        { status: 500 },
      )
    }

    // Se l'email è cambiata, aggiorna anche l'utente in auth (se necessario)
    if (existingProfileData?.user_id && existingProfileData.email !== email) {
      // Nota: l'aggiornamento dell'email in auth.users richiede service role
      // Per ora aggiorniamo solo il profilo, l'email in auth.users può essere aggiornata separatamente se necessario
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: updatedProfile,
        message: 'Atleta aggiornato con successo',
      },
    })
  } catch (error) {
    logger.error('Errore API aggiornamento atleta', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Errore interno del server' },
      { status: 500 },
    )
  }
}
