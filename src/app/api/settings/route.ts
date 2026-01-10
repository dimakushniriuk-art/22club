import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api/settings')

// Schema validazione notifiche
const NotificationSettingsSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
  newClients: z.boolean(),
  payments: z.boolean(),
  appointments: z.boolean(),
  messages: z.boolean(),
})

// Schema validazione privacy
const PrivacySettingsSchema = z.object({
  profileVisible: z.boolean(),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  analytics: z.boolean(),
})

// Schema validazione account
const AccountSettingsSchema = z.object({
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
})

// Schema validazione 2FA
const TwoFactorSettingsSchema = z.object({
  enabled: z.boolean(),
  secret: z.string().optional(),
  backupCodes: z.array(z.string()).optional(),
})

// GET /api/settings - Ottieni impostazioni utente
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Usa la funzione RPC per ottenere o creare impostazioni
    // Workaround necessario per inferenza tipo Supabase RPC
    const { data, error: rpcError } =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.rpc as any)('get_or_create_user_settings', {
        p_user_id: user.id,
      })

    if (rpcError) {
      // Fallback: query diretta
      const { data: settingsData, error: queryError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (queryError) {
        if (queryError.code === 'PGRST116') {
          // Nessun record, crea default
          // Workaround necessario per inferenza tipo Supabase
          const { data: newSettings, error: insertError } =
            await // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (supabase.from('user_settings') as any).insert({ user_id: user.id }).select().single()

          if (insertError) {
            return NextResponse.json(
              { error: 'Errore creazione impostazioni', details: insertError.message },
              { status: 500 },
            )
          }

          return NextResponse.json({ settings: newSettings })
        }

        return NextResponse.json(
          { error: 'Errore caricamento impostazioni', details: queryError.message },
          { status: 500 },
        )
      }

      return NextResponse.json({ settings: settingsData })
    }

    return NextResponse.json({ settings: data })
  } catch (error) {
    logger.error('Errore GET /api/settings', error)
    return NextResponse.json(
      {
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 },
    )
  }
}

// PUT /api/settings - Aggiorna impostazioni utente
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const body = await request.json()
    const { type, data: settingsData } = body

    if (!type || !settingsData) {
      return NextResponse.json({ error: 'Tipo e dati richiesti' }, { status: 400 })
    }

    let validatedData: unknown

    // Valida in base al tipo
    switch (type) {
      case 'notifications':
        validatedData = NotificationSettingsSchema.parse(settingsData)
        break
      case 'privacy':
        validatedData = PrivacySettingsSchema.parse(settingsData)
        break
      case 'account':
        validatedData = AccountSettingsSchema.parse(settingsData)
        break
      case 'two_factor':
        validatedData = TwoFactorSettingsSchema.parse(settingsData)
        break
      default:
        return NextResponse.json({ error: 'Tipo non valido' }, { status: 400 })
    }

    // Prepara dati per update
    const updateData: Record<string, unknown> = { user_id: user.id }

    if (type === 'two_factor') {
      const twoFactorData = validatedData as z.infer<typeof TwoFactorSettingsSchema>
      updateData.two_factor_enabled = twoFactorData.enabled
      if (twoFactorData.enabled) {
        if (twoFactorData.secret) updateData.two_factor_secret = twoFactorData.secret
        if (twoFactorData.backupCodes)
          updateData.two_factor_backup_codes = twoFactorData.backupCodes
        updateData.two_factor_enabled_at = new Date().toISOString()
      } else {
        updateData.two_factor_secret = null
        updateData.two_factor_backup_codes = null
        updateData.two_factor_enabled_at = null
      }
    } else {
      updateData[type] = validatedData
    }

    // Upsert impostazioni
    // Workaround necessario per inferenza tipo Supabase
    const { data, error: updateError } =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('user_settings') as any)
        .upsert(updateData as Record<string, unknown>, {
          onConflict: 'user_id',
        })
        .select()
        .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Errore aggiornamento impostazioni', details: updateError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, settings: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi', details: error.issues }, { status: 400 })
    }

    logger.error('Errore PUT /api/settings', error)
    return NextResponse.json(
      {
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Errore sconosciuto',
      },
      { status: 500 },
    )
  }
}
