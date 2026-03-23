import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getServerAuthUser } from '@/lib/auth/server-user'
import { createLogger } from '@/lib/logger'
import { buildDossierPdf } from '@/lib/dossier-pdf'
import type { DossierProfile, DossierQuestionnaire } from '@/lib/dossier-pdf'
import { requireCurrentOrgId } from '@/lib/organizations/current-org'
import { resolveProfileByIdentifier } from '@/lib/utils/resolve-profile-by-identifier'

const logger = createLogger('api:onboarding:finish')
const QUESTIONNAIRE_VERSION = 'intake-v1-2026-02-08'

const DOSSIER_PROFILE_COLUMNS =
  'id, role, nome, cognome, email, phone, data_nascita, sesso, indirizzo_residenza, provincia, cap, citta, nazione, codice_fiscale, professione, altezza_cm, peso_corrente_kg, bmi, livello_esperienza, tipo_atleta, obiettivi_fitness, livello_motivazione, note, certificato_medico_tipo, limitazioni, allergie, obiettivo_nutrizionale, org_id'

/** Row shape per athlete_questionnaires (tabella non presente nei tipi generati Supabase) */
type AthleteQuestionnaireRow = {
  version: string
  anamnesi: Record<string, unknown> | null
  manleva: Record<string, unknown> | null
  liberatoria_media: Record<string, unknown> | null
  signed_at: string | null
}

type QuestionnaireQueryResult = Promise<{ data: AthleteQuestionnaireRow | null; error: unknown }>
type SupabaseQuestionnaireClient = {
  from: (r: string) => {
    select: (s: string) => {
      eq: (
        a: string,
        b: string,
      ) => { eq: (a: string, b: string) => { maybeSingle: () => QuestionnaireQueryResult } }
    }
  }
}

type AdminQuestionnaireClient = {
  from: (r: string) => {
    update: (u: object) => {
      eq: (a: string, b: string) => { eq: (a: string, b: string) => Promise<unknown> }
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { version?: string }
    const version = body.version ?? QUESTIONNAIRE_VERSION

    const supabase = await createClient()
    const { user } = await getServerAuthUser(supabase)

    if (!user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    const profileRow = await resolveProfileByIdentifier(supabase, user.id, DOSSIER_PROFILE_COLUMNS)

    if (!profileRow) {
      return NextResponse.json({ error: 'Profilo non trovato' }, { status: 404 })
    }

    const row = profileRow as unknown as DossierProfile & { role?: string | null }
    const role = row.role
    if (role !== 'athlete') {
      return NextResponse.json(
        { error: "Solo gli atleti possono completare l'onboarding" },
        { status: 403 },
      )
    }

    const athleteId = row.id

    const qRes = await (supabase as unknown as SupabaseQuestionnaireClient)
      .from('athlete_questionnaires')
      .select('version, anamnesi, manleva, liberatoria_media, signed_at')
      .eq('athlete_id', athleteId)
      .eq('version', version)
      .maybeSingle()
    const questionnaireRow = qRes.data
    const qError = qRes.error

    if (qError) {
      logger.error('Errore lettura questionario', qError, { athleteId })
      return NextResponse.json({ error: 'Errore lettura questionario' }, { status: 500 })
    }

    if (!questionnaireRow) {
      return NextResponse.json(
        { error: 'Completa prima il questionario (Anamnesi, Manleva, Liberatoria)' },
        { status: 400 },
      )
    }

    const profileForPdf: DossierProfile = {
      id: row.id,
      nome: row.nome ?? null,
      cognome: row.cognome ?? null,
      email: row.email,
      phone: row.phone ?? null,
      data_nascita: row.data_nascita ?? null,
      sesso: row.sesso ?? null,
      indirizzo_residenza: row.indirizzo_residenza ?? null,
      provincia: row.provincia ?? null,
      cap: row.cap ?? null,
      citta: row.citta ?? null,
      nazione: row.nazione ?? null,
      codice_fiscale: row.codice_fiscale ?? null,
      professione: row.professione ?? null,
      altezza_cm: row.altezza_cm ?? null,
      peso_corrente_kg: row.peso_corrente_kg ?? null,
      bmi: row.bmi ?? null,
      livello_esperienza: row.livello_esperienza ?? null,
      tipo_atleta: row.tipo_atleta ?? null,
      obiettivi_fitness: row.obiettivi_fitness ?? null,
      livello_motivazione: row.livello_motivazione ?? null,
      note: row.note ?? null,
      certificato_medico_tipo: row.certificato_medico_tipo ?? null,
      limitazioni: row.limitazioni ?? null,
      allergie: row.allergie ?? null,
      obiettivo_nutrizionale: row.obiettivo_nutrizionale ?? null,
      org_id: row.org_id ?? null,
    }

    const questionnaireForPdf: DossierQuestionnaire = {
      version: questionnaireRow.version,
      anamnesi: (questionnaireRow.anamnesi as Record<string, unknown>) ?? {},
      manleva: (questionnaireRow.manleva as Record<string, unknown>) ?? {},
      liberatoria_media: (questionnaireRow.liberatoria_media as Record<string, unknown>) ?? {},
      signed_at: questionnaireRow.signed_at,
    }

    const pdfBytes = buildDossierPdf(profileForPdf, questionnaireForPdf)
    const fileName = `dossier-onboarding-${Date.now()}.pdf`
    const storagePath = `dossier/${athleteId}/${fileName}`

    const admin = createAdminClient()
    const { error: uploadError } = await admin.storage
      .from('documents')
      .upload(storagePath, pdfBytes, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      logger.error('Errore upload PDF dossier', uploadError, { athleteId, storagePath })
      return NextResponse.json({ error: 'Errore upload dossier' }, { status: 500 })
    }

    const { data: urlData } = admin.storage.from('documents').getPublicUrl(storagePath)
    const fileUrl = urlData.publicUrl

    const orgId = requireCurrentOrgId(
      row.org_id,
      'Organizzazione non disponibile per salvataggio dossier onboarding',
    )
    const { error: docError } = await admin.from('documents').insert({
      athlete_id: athleteId,
      uploaded_by_profile_id: athleteId,
      category: 'dossier_onboarding',
      file_url: fileUrl,
      status: 'valido',
      org_id: orgId,
    })

    if (docError) {
      logger.error('Errore insert documents', docError, { athleteId })
      await admin.storage.from('documents').remove([storagePath])
      return NextResponse.json({ error: 'Errore salvataggio documento' }, { status: 500 })
    }

    const nowIso = new Date().toISOString()
    await (admin as unknown as AdminQuestionnaireClient)
      .from('athlete_questionnaires')
      .update({ signed_at: nowIso, updated_at: nowIso })
      .eq('athlete_id', athleteId)
      .eq('version', version)

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        first_login: false,
        ultimo_accesso: nowIso,
      })
      .eq('user_id', user.id)

    if (profileUpdateError) {
      logger.error('Errore update first_login', profileUpdateError, { userId: user.id })
      return NextResponse.json({ error: 'Errore aggiornamento profilo' }, { status: 500 })
    }

    const { data: signed } = await admin.storage
      .from('documents')
      .createSignedUrl(storagePath, 3600)
    const downloadUrl = signed?.signedUrl ?? fileUrl

    return NextResponse.json({ success: true, downloadUrl })
  } catch (err) {
    logger.error('Errore finish onboarding', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
