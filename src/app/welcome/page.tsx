'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createLogger } from '@/lib/logger'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AvatarUploader } from '@/components/settings/avatar-uploader'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { SimpleSelect } from '@/components/ui/simple-select'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/use-auth'
import { useSupabaseClient } from '@/hooks/use-supabase-client'
import type { Database } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { uploadDocument, validateDocumentFile } from '@/lib/documents'
import {
  ArrowRight,
  ArrowLeft,
  Users,
  Loader2,
  Sparkles,
  User,
  Phone,
  Activity,
  Target,
  Heart,
  Apple,
  CheckCircle,
  FileText,
  Upload,
  ChevronDown,
} from 'lucide-react'

const logger = createLogger('app:welcome:page')

/** Client esteso per tabelle/RPC non ancora nei tipi generati (athlete_questionnaires, get_my_trainer_profile). */
type SupabaseExt = Omit<SupabaseClient<Database>, 'from' | 'rpc'> & {
  from: (table: string) => ReturnType<SupabaseClient<Database>['from']>
  rpc: (fn: string) => Promise<{ data: unknown; error: unknown }>
}

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

/** Stato form onboarding: solo campi usati nel wizard (phone, non telefono) */
export interface OnboardingFormState {
  nome: string
  cognome: string
  sesso: string
  data_nascita: string
  phone: string
  contatto_emergenza_nome: string
  contatto_emergenza_relazione: string
  contatto_emergenza_telefono: string
  indirizzo_residenza: string
  provincia: string
  cap: string
  citta: string
  nazione: string
  codice_fiscale: string
  professione: string
  altezza_cm: number | ''
  peso_corrente_kg: number | ''
  peso_iniziale_kg: number | ''
  obiettivo_peso: number | ''
  bmi: number | null
  livello_esperienza: string
  tipo_atleta: string
  obiettivi_fitness: string[]
  livello_motivazione: number | ''
  note: string
  certificato_medico_tipo: string
  certificato_medico_data_rilascio: string
  certificato_medico_scadenza: string
  limitazioni: string
  infortuni_recenti: string
  operazioni_passate: string
  allergie: string
  obiettivo_nutrizionale: string
  intolleranze: string[]
  allergie_alimentari: string[]
  abitudini_alimentari: string
}

const QUESTIONNAIRE_VERSION = 'intake-v1-2026-02-08'

export interface AnamnesiState {
  sonno: string
  bpm_riposo: string
  fumatore: string
  stile_vita: string
  infortuni: string
  infortuni_descrizione: string
  operazioni: string
  operazioni_descrizione: string
  gravidanza: string
  proporzione_armonia: string
  proporzione_note: string
  dichiarazione_veridicita: boolean
  firma_nome_cognome: string
}

export interface ManlevaState {
  nome_cognome: string
  data_nascita: string
  luogo_nascita: string
  residenza: string
  ruolo: string
  nome_minore: string
  dichiarazione_accettazione: boolean
  firma_nome_cognome: string
}

export interface LiberatoriaState {
  authorized: boolean | null
  channels: string[]
  duration: '' | 'fino_a_revoca' | 'illimitata'
  place: string
  firma_nome_cognome: string
}

const LIBERATORIA_CHANNELS = [
  'Sito 22club.it',
  'Social (Facebook, Instagram, TikTok, X)',
  'Stampa',
  'Materiale promozionale',
  'Altri canali futuri',
] as const

const SESSO_OPTIONS = [
  { value: '', label: 'Seleziona...' },
  { value: 'Uomo', label: 'Uomo' },
  { value: 'Donna', label: 'Donna' },
  { value: 'Altro', label: 'Altro' },
  { value: 'Preferisco non dirlo', label: 'Preferisco non dirlo' },
] as const

const _LIVELLO_OPTIONS = [
  { value: '', label: 'Seleziona...' },
  { value: 'Principiante', label: 'Principiante' },
  { value: 'Intermedio', label: 'Intermedio' },
  { value: 'Avanzato', label: 'Avanzato' },
] as const

const _TIPO_ATLETA_OPTIONS = [
  { value: '', label: 'Seleziona...' },
  { value: 'Dimagrimento', label: 'Dimagrimento' },
  { value: 'Massa', label: 'Massa' },
  { value: 'Forza', label: 'Forza' },
  { value: 'Performance', label: 'Performance' },
  { value: 'Benessere', label: 'Benessere' },
] as const

const OBIETTIVI_FITNESS_OPZIONI = [
  'Perdere peso',
  'Aumentare massa muscolare',
  'Tonificare',
  'Migliorare postura',
  'Aumentare forza',
  'Migliorare resistenza',
  'Mobilità / flessibilità',
  'Ridurre stress',
  'Recupero infortuni',
  'Preparazione evento',
] as const

const CERTIFICATO_MEDICO_TIPO_OPTIONS = [
  { value: '', label: 'Seleziona...' },
  { value: 'Agonistico', label: 'Agonistico' },
  { value: 'Non agonistico', label: 'Non agonistico' },
  { value: 'Altro', label: 'Altro' },
] as const

const OBIETTIVO_NUTRIZIONALE_OPTIONS = [
  { value: '', label: 'Seleziona...' },
  { value: 'Dimagrimento', label: 'Dimagrimento' },
  { value: 'Mantenimento', label: 'Mantenimento' },
  { value: 'Massa', label: 'Massa' },
  { value: 'Ricomposizione corporea', label: 'Ricomposizione corporea' },
  { value: 'Benessere / Energia', label: 'Benessere / Energia' },
  { value: 'Altro', label: 'Altro' },
] as const

const INTOLLERANZE_PRESET = ['Lattosio', 'Glutine', 'Nichel', 'Istamina', 'Fruttosio'] as const
const ALLERGIE_ALIMENTARI_PRESET = [
  'Frutta a guscio',
  'Arachidi',
  'Crostacei',
  'Pesce',
  'Uova',
  'Latte',
  'Soia',
  'Sesamo',
] as const

const STEPS = [
  {
    title: 'Benvenuto',
    description: 'Completa il tuo profilo per iniziare.',
    icon: Sparkles,
    skippable: false,
    emoji: '👋',
    accent: 'from-amber-500/20 to-orange-500/10',
    borderLeft: 'border-l-amber-500/60',
  },
  {
    title: 'Identità',
    description: 'I tuoi dati anagrafici.',
    icon: User,
    skippable: false,
    emoji: '🪪',
    accent: 'from-primary/20 to-primary/10',
    borderLeft: 'border-l-primary/60',
  },
  {
    title: 'Contatti & emergenza',
    description: 'Come contattarti e chi avvisare.',
    icon: Phone,
    skippable: false,
    emoji: '📱',
    accent: 'from-emerald-500/20 to-green-500/10',
    borderLeft: 'border-l-emerald-500/60',
  },
  {
    title: 'Residenza & dati fiscali',
    description: "Ci servono per i documenti e l'identificazione.",
    icon: User,
    skippable: false,
    emoji: '🏠',
    accent: 'from-slate-500/20 to-zinc-500/10',
    borderLeft: 'border-l-slate-500/60',
  },
  {
    title: 'Dati fisici',
    description: 'Altezza, peso e obiettivi.',
    icon: Activity,
    skippable: false,
    emoji: '📏',
    accent: 'from-violet-500/20 to-purple-500/10',
    borderLeft: 'border-l-violet-500/60',
  },
  {
    title: 'Obiettivi & livello',
    description: 'Così il trainer può personalizzare il tuo percorso.',
    icon: Target,
    skippable: false,
    emoji: '🎯',
    accent: 'from-rose-500/20 to-pink-500/10',
    borderLeft: 'border-l-rose-500/60',
  },
  {
    title: 'Motivazione',
    description: 'Capire cosa ti spinge ci aiuta a costruire un percorso migliore.',
    icon: Heart,
    skippable: false,
    emoji: '🔥',
    accent: 'from-red-500/20 to-orange-500/10',
    borderLeft: 'border-l-red-500/60',
  },
  {
    title: 'Salute',
    description: 'Informazioni utili per allenarti in sicurezza.',
    icon: Heart,
    skippable: true,
    emoji: '🩺',
    accent: 'from-red-500/15 to-pink-500/10',
    borderLeft: 'border-l-red-500/50',
  },
  {
    title: 'Nutrizione',
    description: 'Informazioni di base per personalizzare il percorso.',
    icon: Apple,
    skippable: true,
    emoji: '🍽️',
    accent: 'from-lime-500/20 to-green-500/10',
    borderLeft: 'border-l-lime-500/60',
  },
  {
    title: 'Anamnesi',
    description: 'Questionario ufficiale (documento clinico).',
    icon: FileText,
    skippable: false,
    emoji: '📋',
    accent: 'from-indigo-500/20 to-violet-500/10',
    borderLeft: 'border-l-indigo-500/60',
  },
  {
    title: 'Manleva',
    description: 'Accettazione della manleva di responsabilità.',
    icon: FileText,
    skippable: false,
    emoji: '🛡️',
    accent: 'from-amber-600/20 to-orange-600/10',
    borderLeft: 'border-l-amber-600/60',
  },
  {
    title: 'Liberatoria foto e video',
    description: "Scegli se autorizzi l'uso delle tue immagini.",
    icon: FileText,
    skippable: false,
    emoji: '📸',
    accent: 'from-teal-600/20 to-cyan-600/10',
    borderLeft: 'border-l-teal-600/60',
  },
  {
    title: 'Riepilogo',
    description: 'Controlla i dati prima di completare.',
    icon: CheckCircle,
    skippable: false,
    emoji: '✅',
    accent: 'from-sky-500/20 to-cyan-500/10',
    borderLeft: 'border-l-sky-500/60',
  },
  {
    title: 'Conferma finale',
    description: 'Prima di generare il dossier, verifica e conferma.',
    icon: CheckCircle,
    skippable: false,
    emoji: '✅',
    accent: 'from-green-500/20 to-emerald-500/10',
    borderLeft: 'border-l-green-500/60',
  },
  {
    title: 'Genera dossier',
    description: 'Stiamo creando il tuo documento ufficiale.',
    icon: FileText,
    skippable: false,
    emoji: '📄',
    accent: 'from-green-600/20 to-emerald-600/10',
    borderLeft: 'border-l-green-600/60',
  },
] as const

const TOTAL_STEPS = STEPS.length

function emptyFormState(): OnboardingFormState {
  return {
    nome: '',
    cognome: '',
    sesso: '',
    data_nascita: '',
    phone: '',
    contatto_emergenza_nome: '',
    contatto_emergenza_relazione: '',
    contatto_emergenza_telefono: '',
    indirizzo_residenza: '',
    provincia: '',
    cap: '',
    citta: '',
    nazione: 'Italia',
    codice_fiscale: '',
    professione: '',
    altezza_cm: '',
    peso_corrente_kg: '',
    peso_iniziale_kg: '',
    obiettivo_peso: '',
    bmi: null,
    livello_esperienza: '',
    tipo_atleta: '',
    obiettivi_fitness: [],
    livello_motivazione: '',
    note: '',
    certificato_medico_tipo: '',
    certificato_medico_data_rilascio: '',
    certificato_medico_scadenza: '',
    limitazioni: '',
    infortuni_recenti: '',
    operazioni_passate: '',
    allergie: '',
    obiettivo_nutrizionale: '',
    intolleranze: [],
    allergie_alimentari: [],
    abitudini_alimentari: '',
  }
}

function profileToFormState(row: ProfileRow | null): OnboardingFormState {
  const e = emptyFormState()
  if (!row) return e
  return {
    ...e,
    nome: row.nome ?? '',
    cognome: row.cognome ?? '',
    sesso: row.sesso ?? '',
    data_nascita: row.data_nascita ?? '',
    phone: row.phone ?? '',
    contatto_emergenza_nome: row.contatto_emergenza_nome ?? '',
    contatto_emergenza_relazione: row.contatto_emergenza_relazione ?? '',
    contatto_emergenza_telefono: row.contatto_emergenza_telefono ?? '',
    indirizzo_residenza: row.indirizzo_residenza ?? '',
    provincia: row.provincia ?? '',
    cap: row.cap ?? '',
    citta: row.citta ?? '',
    nazione: row.nazione ?? 'Italia',
    codice_fiscale: row.codice_fiscale ?? '',
    professione: row.professione ?? '',
    altezza_cm: row.altezza_cm ?? '',
    peso_corrente_kg: row.peso_corrente_kg ?? '',
    peso_iniziale_kg: row.peso_iniziale_kg ?? '',
    obiettivo_peso: row.obiettivo_peso ?? '',
    bmi: row.bmi ?? null,
    livello_esperienza: row.livello_esperienza ?? '',
    tipo_atleta: row.tipo_atleta ?? '',
    obiettivi_fitness: row.obiettivi_fitness ?? [],
    livello_motivazione: row.livello_motivazione ?? '',
    note: row.note ?? '',
    certificato_medico_tipo: row.certificato_medico_tipo ?? '',
    certificato_medico_data_rilascio: row.certificato_medico_data_rilascio ?? '',
    certificato_medico_scadenza: row.certificato_medico_scadenza ?? '',
    limitazioni: row.limitazioni ?? '',
    infortuni_recenti: row.infortuni_recenti ?? '',
    operazioni_passate: row.operazioni_passate ?? '',
    allergie: row.allergie ?? '',
    obiettivo_nutrizionale: row.obiettivo_nutrizionale ?? '',
    intolleranze: row.intolleranze ?? [],
    allergie_alimentari: row.allergie_alimentari ?? [],
    abitudini_alimentari: row.abitudini_alimentari ?? '',
  }
}

function computeBmi(altezzaCm: number, pesoKg: number): number | null {
  if (altezzaCm <= 0 || pesoKg <= 0) return null
  const h = altezzaCm / 100
  return Math.round((pesoKg / (h * h)) * 10) / 10
}

/** Payload per update: solo chiavi definite, stringhe vuote → null, niente telefono */
function formStateToUpdate(
  form: OnboardingFormState,
  step: number,
  extra?: Partial<ProfileUpdate>,
): ProfileUpdate {
  const emptyToNull = (s: string) => (s.trim() === '' ? null : s.trim())
  const num = (v: number | ''): number | null => (v === '' ? null : v)
  const payload: ProfileUpdate = { ...extra }

  if (step >= 1) {
    payload.nome = emptyToNull(form.nome) || null
    payload.cognome = emptyToNull(form.cognome) || null
    payload.codice_fiscale = emptyToNull(form.codice_fiscale) || null
    payload.sesso = emptyToNull(form.sesso) || null
    payload.data_nascita = emptyToNull(form.data_nascita) || null
  }
  if (step >= 2) {
    payload.phone = emptyToNull(form.phone) || null
    payload.contatto_emergenza_nome = emptyToNull(form.contatto_emergenza_nome) || null
    payload.contatto_emergenza_relazione = emptyToNull(form.contatto_emergenza_relazione) || null
    payload.contatto_emergenza_telefono = emptyToNull(form.contatto_emergenza_telefono) || null
  }
  if (step >= 3) {
    payload.indirizzo_residenza = emptyToNull(form.indirizzo_residenza) || null
    payload.provincia = emptyToNull(form.provincia) || null
    payload.cap = emptyToNull(form.cap) || null
    payload.citta = emptyToNull(form.citta) || null
    payload.nazione = emptyToNull(form.nazione) || null
    payload.professione = emptyToNull(form.professione) || null
  }
  if (step >= 4) {
    payload.altezza_cm = num(form.altezza_cm)
    payload.peso_corrente_kg = num(form.peso_corrente_kg)
    payload.peso_iniziale_kg = num(form.peso_iniziale_kg)
    payload.obiettivo_peso = num(form.obiettivo_peso)
    payload.bmi = form.bmi
  }
  if (step >= 5) {
    payload.livello_esperienza = emptyToNull(form.livello_esperienza) || null
    payload.tipo_atleta = emptyToNull(form.tipo_atleta) || null
    payload.obiettivi_fitness = form.obiettivi_fitness?.length ? form.obiettivi_fitness : null
  }
  if (step >= 6) {
    payload.livello_motivazione =
      form.livello_motivazione === '' ? null : Number(form.livello_motivazione)
    payload.note = emptyToNull(form.note) || null
  }
  if (step >= 7) {
    payload.certificato_medico_tipo = emptyToNull(form.certificato_medico_tipo) || null
    payload.certificato_medico_data_rilascio =
      emptyToNull(form.certificato_medico_data_rilascio) || null
    payload.certificato_medico_scadenza = emptyToNull(form.certificato_medico_scadenza) || null
    payload.limitazioni = emptyToNull(form.limitazioni) || null
    payload.infortuni_recenti = emptyToNull(form.infortuni_recenti) || null
    payload.operazioni_passate = emptyToNull(form.operazioni_passate) || null
    payload.allergie = emptyToNull(form.allergie) || null
  }
  if (step >= 8) {
    payload.obiettivo_nutrizionale = emptyToNull(form.obiettivo_nutrizionale) || null
    payload.intolleranze = form.intolleranze?.length ? form.intolleranze : null
    payload.allergie_alimentari = form.allergie_alimentari?.length ? form.allergie_alimentari : null
    payload.abitudini_alimentari = emptyToNull(form.abitudini_alimentari) || null
  }
  return payload
}

interface PtInfo {
  pt_nome: string
  pt_cognome: string
  pt_email: string
  pt_telefono: string
  pt_avatar_url: string | null
}

export default function WelcomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const supabaseExt = supabase as unknown as SupabaseExt
  const authUserId = user?.user_id ?? user?.id

  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [form, setForm] = useState<OnboardingFormState>(emptyFormState())
  const [ptInfo, setPtInfo] = useState<PtInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)
  const [completeError, setCompleteError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const emptyAnamnesi = (): AnamnesiState => ({
    sonno: '',
    bpm_riposo: '',
    fumatore: '',
    stile_vita: '',
    infortuni: '',
    infortuni_descrizione: '',
    operazioni: '',
    operazioni_descrizione: '',
    gravidanza: '',
    proporzione_armonia: '',
    proporzione_note: '',
    dichiarazione_veridicita: false,
    firma_nome_cognome: '',
  })
  const emptyManleva = (): ManlevaState => ({
    nome_cognome: '',
    data_nascita: '',
    luogo_nascita: '',
    residenza: '',
    ruolo: 'diretto_responsabile',
    nome_minore: '',
    dichiarazione_accettazione: false,
    firma_nome_cognome: '',
  })
  const emptyLiberatoria = (): LiberatoriaState => ({
    authorized: null,
    channels: [],
    duration: '',
    place: '',
    firma_nome_cognome: '',
  })

  const [anamnesi, setAnamnesi] = useState<AnamnesiState>(emptyAnamnesi())
  const [manleva, setManleva] = useState<ManlevaState>(emptyManleva())
  const [liberatoria, setLiberatoria] = useState<LiberatoriaState>(emptyLiberatoria())
  const [obiettivoAltro, setObiettivoAltro] = useState('')
  const [intolleranzaAltro, setIntolleranzaAltro] = useState('')
  const [allergiaAlimentareAltro, setAllergiaAlimentareAltro] = useState('')
  const [uploadingCertificato, setUploadingCertificato] = useState(false)
  const [certificatoCaricatoInSessione, setCertificatoCaricatoInSessione] = useState(false)
  const [manlevaLeggiTuttoOpen, setManlevaLeggiTuttoOpen] = useState(false)
  const [liberatoriaLeggiTuttoOpen, setLiberatoriaLeggiTuttoOpen] = useState(false)
  const [finalConfirmation, setFinalConfirmation] = useState(false)

  // Fetch profile + PT + questionnaire
  useEffect(() => {
    if (!authUserId) return
    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        const [profileRes, ptRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', authUserId).maybeSingle(),
          supabaseExt.rpc('get_my_trainer_profile'),
        ])
        if (cancelled) return
        if (profileRes.error) throw profileRes.error
        const row = profileRes.data
        setProfile(row)
        setForm(profileToFormState(row))
        if (row?.id) {
          const { data: qData } = await supabase
            .from('athlete_questionnaires')
            .select('anamnesi, manleva, liberatoria_media')
            .eq('athlete_id', row.id)
            .eq('version', QUESTIONNAIRE_VERSION)
            .maybeSingle()
          const qRow = qData as { anamnesi?: unknown; manleva?: unknown; liberatoria_media?: unknown } | null
          if (!cancelled && qRow) {
            const a = (qRow.anamnesi as Partial<AnamnesiState>) ?? {}
            setAnamnesi((prev) => ({ ...emptyAnamnesi(), ...prev, ...a }))
            const m = (qRow.manleva as Partial<ManlevaState>) ?? {}
            setManleva((prev) => ({ ...emptyManleva(), ...prev, ...m }))
            const l = (qRow.liberatoria_media as Record<string, unknown>) ?? {}
            const authorized =
              l.authorized !== undefined
                ? !!l.authorized
                : l.autorizzazione !== undefined
                  ? !!l.autorizzazione
                  : null
            const channelsRaw = l.channels
            const channels = Array.isArray(channelsRaw)
              ? channelsRaw.filter((x): x is string => typeof x === 'string')
              : typeof l.canali_consentiti === 'string' && l.canali_consentiti
                ? [l.canali_consentiti]
                : []
            const duration = ((l.duration ?? l.durata) as LiberatoriaState['duration']) ?? ''
            const place = (l.place ?? l.luogo ?? '') as string
            const firma = (l.signature_text ?? l.firma_nome_cognome ?? '') as string
            setLiberatoria((prev) => ({
              ...emptyLiberatoria(),
              ...prev,
              authorized: authorized ?? prev.authorized,
              channels: channels.length ? channels : prev.channels,
              duration: duration || prev.duration,
              place: place || prev.place,
              firma_nome_cognome: firma || prev.firma_nome_cognome,
            }))
          } else if (!cancelled && row) {
            const r = row as ProfileRow
            const nomeCognome = [r.nome, r.cognome].filter(Boolean).join(' ').trim()
            const residenzaStr = [r.indirizzo_residenza, r.cap, r.citta, r.provincia]
              .filter(Boolean)
              .join(', ')
            setManleva((prev) => ({
              ...prev,
              nome_cognome: prev.nome_cognome || nomeCognome,
              data_nascita: prev.data_nascita || (r.data_nascita ?? ''),
              residenza: prev.residenza || residenzaStr,
              firma_nome_cognome: prev.firma_nome_cognome || nomeCognome,
            }))
            setLiberatoria((prev) => ({
              ...prev,
              firma_nome_cognome: prev.firma_nome_cognome || nomeCognome,
            }))
          }
        }
        if (!ptRes.error && ptRes.data) {
          const raw = ptRes.data
          const row = Array.isArray(raw) && raw.length > 0 ? raw[0] : raw
          if (row && typeof row === 'object' && 'pt_nome' in row) {
            const r = row as {
              pt_nome?: string | null
              pt_cognome?: string | null
              pt_email?: string | null
              pt_telefono?: string | null
              pt_avatar_url?: string | null
            }
            setPtInfo({
              pt_nome: r.pt_nome ?? '',
              pt_cognome: r.pt_cognome ?? '',
              pt_email: r.pt_email ?? '',
              pt_telefono: r.pt_telefono ?? '',
              pt_avatar_url: r.pt_avatar_url ?? null,
            })
          }
        }
      } catch (err) {
        if (!cancelled) logger.error('Welcome fetch failed', err, { userId: authUserId })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [authUserId, supabase, supabaseExt])

  const updateForm = useCallback((patch: Partial<OnboardingFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }))
  }, [])

  const validateStep = useCallback(
    (step: number): string | null => {
      if (step === 1) {
        if (!form.nome.trim()) return 'Inserisci il nome.'
        if (!form.cognome.trim()) return 'Inserisci il cognome.'
      }
      if (step === 5) {
        if (!form.livello_esperienza.trim()) return 'Seleziona il livello di esperienza.'
      }
      if (step === 9) {
        if (!anamnesi.dichiarazione_veridicita)
          return 'Devi dichiarare la veridicità dei dati (Anamnesi).'
        if (!anamnesi.firma_nome_cognome.trim()) return 'Inserisci nome e cognome come firma.'
      }
      if (step === 10) {
        if (!manleva.dichiarazione_accettazione)
          return 'Devi accettare la manleva di responsabilità.'
        if (manleva.firma_nome_cognome.trim().length < 3)
          return 'Inserisci nome e cognome come firma (almeno 3 caratteri).'
        if (manleva.ruolo === 'tutore_legale' && manleva.nome_minore.trim().length < 3)
          return 'Inserisci il nome del/della minore.'
      }
      if (step === 11) {
        if (liberatoria.authorized === null || liberatoria.authorized === undefined)
          return 'Scegli se autorizzi o meno la pubblicazione di foto e video.'
        if (liberatoria.firma_nome_cognome.trim().length < 3)
          return 'Inserisci nome e cognome come firma (almeno 3 caratteri).'
      }
      if (step === 13) {
        if (!finalConfirmation) return 'Devi confermare che i dati sono corretti per procedere.'
      }
      return null
    },
    [form, anamnesi, manleva, liberatoria, finalConfirmation],
  )

  const saveStep = useCallback(
    async (step: number): Promise<boolean> => {
      if (!authUserId) return false
      setStepError(null)
      const alt = form.altezza_cm !== '' ? Number(form.altezza_cm) : 0
      const peso =
        form.peso_corrente_kg !== ''
          ? Number(form.peso_corrente_kg)
          : form.peso_iniziale_kg !== ''
            ? Number(form.peso_iniziale_kg)
            : 0
      const bmi = alt && peso ? computeBmi(alt, peso) : null
      const payload = formStateToUpdate({ ...form, bmi }, step)
      const { error } = await supabase.from('profiles').update(payload).eq('user_id', authUserId)
      if (error) {
        logger.error('Welcome save step failed', error, { step, userId: authUserId })
        setStepError(error.message)
        return false
      }
      if (bmi !== null) updateForm({ bmi })
      return true
    },
    [authUserId, form, updateForm, supabase],
  )

  const saveQuestionnaire = useCallback(
    async (updates: {
      anamnesi?: Record<string, unknown>
      manleva?: Record<string, unknown>
      liberatoria_media?: Record<string, unknown>
    }) => {
      if (!profile?.id) return false
      const now = new Date().toISOString()
      const fullPayload: Database['public']['Tables']['athlete_questionnaires']['Insert'] = {
        athlete_id: profile.id,
        version: QUESTIONNAIRE_VERSION,
        anamnesi: (updates.anamnesi ?? anamnesi) as Database['public']['Tables']['athlete_questionnaires']['Row']['anamnesi'],
        manleva: (updates.manleva ?? manleva) as Database['public']['Tables']['athlete_questionnaires']['Row']['manleva'],
        liberatoria_media: (updates.liberatoria_media ?? liberatoria) as Database['public']['Tables']['athlete_questionnaires']['Row']['liberatoria_media'],
        updated_at: now,
      }
      const { error } = await supabase.from('athlete_questionnaires').upsert(fullPayload, {
        onConflict: 'athlete_id,version',
      })
      if (error) {
        logger.error('Welcome save questionnaire failed', error, { athleteId: profile.id })
        setStepError(error.message)
        return false
      }
      return true
    },
    [profile?.id, anamnesi, manleva, liberatoria, supabase],
  )

  const handleNext = async () => {
    setStepError(null)
    setCompleteError(null)
    const stepIndex = currentStep
    const err = validateStep(stepIndex)
    if (err) {
      setStepError(err)
      return
    }
    if (stepIndex === 0) {
      setCurrentStep(1)
      return
    }
    if (stepIndex >= 1 && stepIndex <= 8) {
      setSaving(true)
      const ok = await saveStep(stepIndex + 1)
      setSaving(false)
      if (ok) setCurrentStep(stepIndex + 1)
      return
    }
    if (stepIndex === 9) {
      setSaving(true)
      const ok = await saveQuestionnaire({
        anamnesi: {
          ...anamnesi,
          accepted_at: new Date().toISOString(),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        },
      })
      if (ok && authUserId) {
        const profileUpdates: Record<string, string | null> = {}
        if (anamnesi.infortuni_descrizione.trim())
          profileUpdates.infortuni_recenti = anamnesi.infortuni_descrizione.trim()
        if (anamnesi.operazioni_descrizione.trim())
          profileUpdates.operazioni_passate = anamnesi.operazioni_descrizione.trim()
        if (Object.keys(profileUpdates).length > 0) {
          await supabase.from('profiles').update(profileUpdates).eq('user_id', authUserId)
        }
      }
      setSaving(false)
      if (ok) setCurrentStep(10)
      return
    }
    if (stepIndex === 10) {
      setSaving(true)
      const residenza = [form.indirizzo_residenza, form.cap, form.citta, form.provincia]
        .filter(Boolean)
        .join(', ')
      const ok = await saveQuestionnaire({
        manleva: {
          ...manleva,
          nome_cognome: [form.nome, form.cognome].filter(Boolean).join(' '),
          data_nascita: form.data_nascita || undefined,
          residenza: residenza || undefined,
          accepted_at: new Date().toISOString(),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        },
      })
      setSaving(false)
      if (ok) setCurrentStep(11)
      return
    }
    if (stepIndex === 11) {
      setSaving(true)
      const duration = liberatoria.authorized ? liberatoria.duration || 'fino_a_revoca' : ''
      const payload = {
        authorized: liberatoria.authorized,
        channels: liberatoria.channels,
        duration: liberatoria.authorized ? duration : undefined,
        place: liberatoria.place || undefined,
        signature_text: liberatoria.firma_nome_cognome.trim(),
        accepted_at: new Date().toISOString(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }
      const ok = await saveQuestionnaire({ liberatoria_media: payload })
      setSaving(false)
      if (ok) setCurrentStep(12)
      return
    }
    if (stepIndex === 12) {
      setCurrentStep(13)
      return
    }
    if (stepIndex === 13) {
      setCurrentStep(14)
      return
    }
    if (stepIndex === 14) {
      handleComplete()
      return
    }
    setCurrentStep(stepIndex + 1)
  }

  const handleBack = () => {
    setStepError(null)
    setCurrentStep((s) => Math.max(0, s - 1))
  }

  const handleComplete = async () => {
    setCompleteError(null)
    setCompleting(true)
    try {
      const res = await fetch('/api/onboarding/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: QUESTIONNAIRE_VERSION }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCompleteError((data.error as string) || 'Impossibile generare il dossier. Riprova.')
        setCompleting(false)
        return
      }
      if (data.downloadUrl) setDownloadUrl(data.downloadUrl)
    } catch (e) {
      logger.error('Finish onboarding failed', e)
      setCompleteError('Errore di rete. Riprova.')
    } finally {
      setCompleting(false)
    }
  }

  const handleGoHome = () => {
    router.push('/home')
  }

  const handleSkip = () => {
    if (currentStep === 7 || currentStep === 8) handleNext()
    else handleNext()
  }

  const backgroundContent = (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-brand/5 animate-pulse-glow" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(2, 179, 191, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(2, 179, 191, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand/5 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-brand/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />
    </>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex flex-col items-center justify-center relative overflow-hidden">
        {backgroundContent}
        <Card className="relative z-10 w-full max-w-md border-border bg-background-secondary/95 backdrop-blur-sm rounded-2xl shadow-xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="text-brand mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-text-secondary">Caricamento...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const step = currentStep

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex flex-col relative overflow-hidden">
      {backgroundContent}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-text-secondary hover:text-brand text-sm font-medium transition-colors"
        >
          Torna all&apos;app
        </Link>
        <Link href="/home" className="flex items-center shrink-0">
          <Image
            src="/logo.svg"
            alt="22 Club"
            width={120}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
        <div className="w-20" aria-hidden />
      </header>

      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-text-secondary text-sm font-medium">
                Passo {step + 1} di {TOTAL_STEPS}
              </span>
              <span className="text-text-secondary text-sm tabular-nums">
                {Math.round(((step + 1) / TOTAL_STEPS) * 100)}%
              </span>
            </div>
            <div className="flex gap-1.5 mb-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    i <= step ? 'opacity-100' : 'opacity-25'
                  } ${i < step ? 'bg-brand' : i === step ? 'bg-brand ring-2 ring-brand/50 ring-offset-2 ring-offset-background' : 'bg-background-tertiary'}`}
                />
              ))}
            </div>
          </div>

          <Card
            className={`mb-6 border-0 border-l-4 ${STEPS[step].borderLeft} bg-background-secondary/95 backdrop-blur-xl rounded-xl min-[834px]:rounded-2xl bg-gradient-to-br ${STEPS[step].accent}`}
          >
            <CardContent className="p-5 sm:p-6 min-[834px]:p-8">
              <div className="mb-4 flex items-center gap-4">
                <span className="text-4xl" aria-hidden>
                  {STEPS[step].emoji}
                </span>
                <div>
                  <h1 className="text-text-primary text-2xl font-bold">{STEPS[step].title}</h1>
                  <p className="text-text-secondary text-sm mt-0.5">{STEPS[step].description}</p>
                </div>
              </div>

              {/* Step 0: Intro + PT card */}
              {step === 0 && (
                <>
                  {ptInfo && (ptInfo.pt_nome || ptInfo.pt_cognome) && (
                    <Card className="mb-6 border border-primary/40 bg-gradient-to-br from-primary/25 to-primary/15 rounded-xl overflow-hidden">
                      <CardContent className="p-6">
                        <p className="text-primary text-xs font-medium uppercase tracking-wider mb-3">
                          Personal Trainer
                        </p>
                        <div className="mb-4 flex items-center gap-4">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-primary/20 ring-2 ring-primary/40">
                            {ptInfo.pt_avatar_url ? (
                              <Image
                                src={ptInfo.pt_avatar_url}
                                alt={`${ptInfo.pt_nome ?? ''} ${ptInfo.pt_cognome ?? ''}`}
                                className="h-full w-full object-cover"
                                fill
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary/20 text-primary">
                                <Users className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-text-primary font-semibold text-lg">
                              {ptInfo.pt_nome} {ptInfo.pt_cognome}
                            </h3>
                            <p className="text-primary text-sm">Personal Trainer</p>
                          </div>
                        </div>
                        {(ptInfo.pt_email || ptInfo.pt_telefono) && (
                          <div className="space-y-1 text-sm text-text-secondary">
                            {ptInfo.pt_email && <p>{ptInfo.pt_email}</p>}
                            {ptInfo.pt_telefono && <p>{ptInfo.pt_telefono}</p>}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  {(!ptInfo || (!ptInfo.pt_nome && !ptInfo.pt_cognome)) && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-6">
                      {profile?.avatar_url || profile?.avatar ? (
                        <>
                          <p className="text-text-primary text-sm font-medium text-center mb-4">
                            La tua foto profilo
                          </p>
                          <div className="flex flex-col items-center gap-4 mb-4">
                            <Avatar
                              src={profile.avatar_url ?? profile.avatar ?? null}
                              alt="Foto profilo"
                              fallbackText={
                                [form.nome, form.cognome].filter(Boolean).join(' ').trim() || '?'
                              }
                              size="xl"
                              className="ring-2 ring-amber-500/30"
                            />
                            <p className="text-text-tertiary text-xs">
                              Vuoi cambiarla? Scegli una nuova immagine qui sotto.
                            </p>
                          </div>
                          {profile?.id && (
                            <AvatarUploader
                              userId={profile.id}
                              onUploaded={(url) =>
                                setProfile((prev) =>
                                  prev ? { ...prev, avatar_url: url, avatar: url } : null,
                                )
                              }
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-text-primary text-sm font-medium text-center mb-4">
                            Carica la tua foto, che useremo come immagine del profilo.
                          </p>
                          {profile?.id && (
                            <AvatarUploader
                              userId={profile.id}
                              onUploaded={(url) =>
                                setProfile((prev) =>
                                  prev ? { ...prev, avatar_url: url, avatar: url } : null,
                                )
                              }
                            />
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Step 1: Identità */}
              {step === 1 && (
                <div className="space-y-4 text-left">
                  <Input
                    label="Nome *"
                    value={form.nome}
                    onChange={(e) => updateForm({ nome: e.target.value })}
                    errorMessage={stepError && !form.nome.trim() ? stepError : undefined}
                    placeholder="Inserisci il tuo nome"
                  />
                  <Input
                    label="Cognome *"
                    value={form.cognome}
                    onChange={(e) => updateForm({ cognome: e.target.value })}
                    errorMessage={stepError && !form.cognome.trim() ? stepError : undefined}
                    placeholder="Inserisci il tuo cognome"
                  />
                  <Input
                    label="Codice fiscale"
                    value={form.codice_fiscale}
                    onChange={(e) =>
                      updateForm({ codice_fiscale: e.target.value.toUpperCase().slice(0, 16) })
                    }
                    placeholder="RSSMRA85M01H501Z"
                    maxLength={16}
                  />
                  <div>
                    <Label className="block mb-2">Sesso</Label>
                    <Select
                      value={form.sesso}
                      onValueChange={(v) => updateForm({ sesso: v })}
                      label=""
                    >
                      {SESSO_OPTIONS.map((o) => (
                        <option key={o.value || 'empty'} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Input
                    label="Data di nascita"
                    type="date"
                    value={form.data_nascita}
                    onChange={(e) => updateForm({ data_nascita: e.target.value })}
                    placeholder="Data di nascita"
                  />
                </div>
              )}

              {/* Step 2: Contatti & emergenza */}
              {step === 2 && (
                <div className="space-y-4 text-left">
                  <p className="text-text-tertiary text-sm mb-2">
                    Questi dati ci aiutano a contattarti e a gestire eventuali emergenze.
                  </p>
                  <Input
                    label="Telefono"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm({ phone: e.target.value })}
                    placeholder="es. 3511234567"
                  />
                  <Input
                    label="Contatto emergenza — Nome"
                    value={form.contatto_emergenza_nome}
                    onChange={(e) => updateForm({ contatto_emergenza_nome: e.target.value })}
                    placeholder="es. Mario Rossi"
                  />
                  <Input
                    label="Relazione"
                    value={form.contatto_emergenza_relazione}
                    onChange={(e) => updateForm({ contatto_emergenza_relazione: e.target.value })}
                    placeholder="es. Madre, Padre, Compagno/a"
                  />
                  <Input
                    label="Contatto emergenza — Telefono"
                    type="tel"
                    value={form.contatto_emergenza_telefono}
                    onChange={(e) => updateForm({ contatto_emergenza_telefono: e.target.value })}
                    placeholder="es. 3511234567"
                  />
                </div>
              )}

              {/* Step 3: Residenza & dati fiscali */}
              {step === 3 && (
                <div className="space-y-4 text-left">
                  <p className="text-text-tertiary text-sm mb-2">
                    Puoi completarli ora o in seguito. Alcuni documenti richiedono questi dati.
                  </p>
                  <Input
                    label="Indirizzo di residenza (testo unico)"
                    value={form.indirizzo_residenza}
                    onChange={(e) => updateForm({ indirizzo_residenza: e.target.value })}
                    placeholder="Via, numero civico, città (se vuoi)"
                  />
                  <Input
                    label="CAP"
                    value={form.cap.replace(/\D/g, '').slice(0, 5)}
                    onChange={(e) =>
                      updateForm({ cap: e.target.value.replace(/\D/g, '').slice(0, 5) })
                    }
                    placeholder="es. 24100"
                    maxLength={5}
                  />
                  <Input
                    label="Città"
                    value={form.citta}
                    onChange={(e) => updateForm({ citta: e.target.value })}
                    placeholder="es. Bergamo"
                  />
                  <Input
                    label="Provincia"
                    value={form.provincia}
                    onChange={(e) =>
                      updateForm({ provincia: e.target.value.toUpperCase().slice(0, 3) })
                    }
                    placeholder="es. BG"
                    maxLength={3}
                  />
                  <Input
                    label="Nazione"
                    value={form.nazione}
                    onChange={(e) => updateForm({ nazione: e.target.value })}
                    placeholder="Italia"
                  />
                  <Input
                    label="Professione"
                    value={form.professione}
                    onChange={(e) => updateForm({ professione: e.target.value })}
                    placeholder="es. Impiegato, Studente, …"
                  />
                </div>
              )}

              {/* Step 4: Dati fisici */}
              {step === 4 && (
                <div className="space-y-4 text-left">
                  <p className="text-text-tertiary text-sm mb-2">
                    📏 Peso e altezza ci aiutano a personalizzare il tuo percorso.
                  </p>
                  <Input
                    label="Altezza (cm)"
                    type="number"
                    min={1}
                    value={form.altezza_cm === '' ? '' : form.altezza_cm}
                    onChange={(e) =>
                      updateForm({
                        altezza_cm: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    placeholder="170"
                  />
                  <Input
                    label="Peso attuale (kg)"
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.peso_corrente_kg === '' ? '' : form.peso_corrente_kg}
                    onChange={(e) =>
                      updateForm({
                        peso_corrente_kg: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    placeholder="70"
                  />
                  <Input
                    label="Peso iniziale (kg)"
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.peso_iniziale_kg === '' ? '' : form.peso_iniziale_kg}
                    onChange={(e) =>
                      updateForm({
                        peso_iniziale_kg: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    placeholder="Opzionale"
                  />
                  <Input
                    label="Obiettivo peso (kg)"
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.obiettivo_peso === '' ? '' : form.obiettivo_peso}
                    onChange={(e) =>
                      updateForm({
                        obiettivo_peso: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    placeholder="Opzionale"
                  />
                  {form.bmi != null && (
                    <p className="text-violet-400/90 text-sm font-medium mt-2">
                      📊 BMI calcolato: {form.bmi}
                    </p>
                  )}
                </div>
              )}

              {/* Step 5: Obiettivi & livello */}
              {step === 5 && (
                <div className="space-y-4 text-left">
                  <p className="text-text-tertiary text-sm mb-2">
                    Seleziona almeno il tuo livello di esperienza.
                  </p>
                  <div role="radiogroup" aria-label="Livello di esperienza">
                    <Label className="block mb-2">Livello di esperienza *</Label>
                    <div className="flex flex-wrap gap-2">
                      {(['Principiante', 'Intermedio', 'Avanzato'] as const).map((liv) => (
                        <button
                          key={liv}
                          type="button"
                          onClick={() =>
                            updateForm({
                              livello_esperienza: form.livello_esperienza === liv ? '' : liv,
                            })
                          }
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            form.livello_esperienza === liv
                              ? 'bg-brand text-white ring-2 ring-brand/50'
                              : 'bg-background-tertiary text-text-secondary hover:bg-background-secondary'
                          }`}
                        >
                          {liv}
                        </button>
                      ))}
                    </div>
                    {stepError && !form.livello_esperienza && (
                      <p className="text-state-error text-xs mt-1">{stepError}</p>
                    )}
                  </div>
                  <div>
                    <Label className="block mb-2">Obiettivi fitness</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {OBIETTIVI_FITNESS_OPZIONI.map((opt) => {
                        const selected = form.obiettivi_fitness.includes(opt)
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              const next = selected
                                ? form.obiettivi_fitness.filter((x) => x !== opt)
                                : [...form.obiettivi_fitness, opt]
                              updateForm({ obiettivi_fitness: next })
                            }}
                            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                              selected
                                ? 'bg-rose-500/30 text-rose-200 ring-1 ring-rose-500/50'
                                : 'bg-background-tertiary text-text-secondary hover:bg-background-secondary'
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                    {form.obiettivi_fitness
                      .filter((o) => !(OBIETTIVI_FITNESS_OPZIONI as readonly string[]).includes(o))
                      .map((altra) => (
                        <span
                          key={altra}
                          className="inline-flex items-center gap-1 rounded-full bg-background-tertiary px-3 py-1.5 text-sm text-text-primary mr-2 mb-2"
                        >
                          {altra}
                          <button
                            type="button"
                            onClick={() =>
                              updateForm({
                                obiettivi_fitness: form.obiettivi_fitness.filter(
                                  (x) => x !== altra,
                                ),
                              })
                            }
                            className="text-text-tertiary hover:text-text-primary"
                            aria-label={`Rimuovi ${altra}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    <Input
                      placeholder="Altro (scrivi e premi Invio)"
                      value={obiettivoAltro}
                      onChange={(e) => setObiettivoAltro(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const v = obiettivoAltro.trim()
                          if (v && !form.obiettivi_fitness.includes(v)) {
                            updateForm({ obiettivi_fitness: [...form.obiettivi_fitness, v] })
                            setObiettivoAltro('')
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Motivazione */}
              {step === 6 && (
                <div className="space-y-4 text-left">
                  <p className="text-text-tertiary text-sm mb-2">
                    Puoi scrivere due righe per il trainer. È facoltativo.
                  </p>
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                    <Label className="block mb-3 text-text-primary font-medium">
                      Livello motivazione (1–5)
                    </Label>
                    <div className="flex rounded-xl overflow-hidden border border-red-500/30 bg-background-secondary/50 shadow-inner">
                      {([1, 2, 3, 4, 5] as const).map((n) => {
                        const selected =
                          (form.livello_motivazione === '' ? 1 : form.livello_motivazione) === n
                        const isFirst = n === 1
                        const isLast = n === 5
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => updateForm({ livello_motivazione: n })}
                            className={`flex-1 min-w-0 py-3 text-sm font-semibold transition-all duration-200 ${
                              isFirst ? 'rounded-l-lg' : ''
                            } ${isLast ? 'rounded-r-lg' : ''} ${
                              selected
                                ? 'bg-red-500 text-white shadow-md'
                                : 'bg-transparent text-text-secondary hover:bg-red-500/15 hover:text-text-primary'
                            }`}
                          >
                            {n}
                          </button>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-2 px-0.5 text-xs text-text-tertiary">
                      <span>Bassa</span>
                      <span>Media</span>
                      <span>Alta</span>
                    </div>
                  </div>
                  <Textarea
                    label="Nota per il trainer"
                    value={form.note}
                    onChange={(e) => updateForm({ note: e.target.value.slice(0, 600) })}
                    placeholder="Cosa vuoi ottenere? Cosa ti mette più in difficoltà? C'è qualcosa che vuoi far sapere al tuo trainer?"
                    rows={4}
                    maxLength={600}
                  />
                </div>
              )}

              {/* Step 7: Salute (riassunto operativo) */}
              {step === 7 && (
                <div className="space-y-5 text-left">
                  <p className="text-text-tertiary text-sm mb-2">
                    Puoi inserire solo il necessario. L&apos;anamnesi completa verrà compilata più
                    avanti.
                  </p>

                  <div className="space-y-4">
                    <p className="text-text-primary text-sm font-medium">Certificato medico</p>
                    <div className="space-y-2">
                      <Label className="block">Tipo certificato</Label>
                      <SimpleSelect
                        value={form.certificato_medico_tipo}
                        onValueChange={(v) => updateForm({ certificato_medico_tipo: v })}
                        placeholder="Seleziona..."
                        options={CERTIFICATO_MEDICO_TIPO_OPTIONS.map((o) => ({
                          value: o.value,
                          label: o.label,
                        }))}
                      />
                    </div>
                    <Input
                      label="Data rilascio"
                      type="date"
                      value={form.certificato_medico_data_rilascio}
                      onChange={(e) =>
                        updateForm({ certificato_medico_data_rilascio: e.target.value })
                      }
                    />
                    <div>
                      <Input
                        label="Data scadenza (consigliata)"
                        type="date"
                        value={form.certificato_medico_scadenza}
                        onChange={(e) =>
                          updateForm({ certificato_medico_scadenza: e.target.value })
                        }
                      />
                      {(form.certificato_medico_tipo || form.certificato_medico_data_rilascio) &&
                        !form.certificato_medico_scadenza && (
                          <p className="text-amber-400/90 text-xs mt-1">
                            Consigliato indicare la scadenza.
                          </p>
                        )}
                      {form.certificato_medico_data_rilascio &&
                        form.certificato_medico_scadenza &&
                        form.certificato_medico_scadenza <
                          form.certificato_medico_data_rilascio && (
                          <p className="text-amber-400/90 text-xs mt-1">
                            La scadenza dovrebbe essere successiva alla data di rilascio.
                          </p>
                        )}
                    </div>

                    <div className="space-y-2">
                      <Label className="block">Carica certificato (se già in possesso)</Label>
                      {certificatoCaricatoInSessione ? (
                        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3">
                          <span className="text-text-primary text-sm">
                            Certificato caricato. Lo trovi nella sezione Documenti.
                          </span>
                          <button
                            type="button"
                            onClick={() => setCertificatoCaricatoInSessione(false)}
                            className="text-sm text-green-400 hover:text-green-300 underline"
                          >
                            Carica un altro
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            id="certificato-upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file || !authUserId) return
                              e.target.value = ''
                              const validation = validateDocumentFile(file)
                              if (!validation.valid) {
                                setStepError(validation.error ?? 'File non valido')
                                return
                              }
                              setUploadingCertificato(true)
                              setStepError(null)
                              try {
                                await uploadDocument(
                                  file,
                                  'certificato',
                                  authUserId,
                                  authUserId,
                                  form.certificato_medico_scadenza || undefined,
                                )
                                setCertificatoCaricatoInSessione(true)
                              } catch (err) {
                                logger.error('Upload certificato failed', err)
                                setStepError(
                                  err instanceof Error ? err.message : 'Errore caricamento',
                                )
                              } finally {
                                setUploadingCertificato(false)
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingCertificato}
                            onClick={() => document.getElementById('certificato-upload')?.click()}
                            className="border-red-500/40 text-red-400/90 hover:bg-red-500/15"
                          >
                            {uploadingCertificato ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            <span className="ml-2">
                              {uploadingCertificato
                                ? 'Caricamento...'
                                : 'Scegli file (PDF, JPG, PNG)'}
                            </span>
                          </Button>
                          <p className="text-text-tertiary text-xs">
                            PDF, JPG o PNG. Max 20MB. Il file verrà salvato nei tuoi Documenti.
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-red-500/20 pt-4">
                    <p className="text-text-primary text-sm font-medium">
                      Limitazioni / infortuni / operazioni / allergie
                    </p>
                    <Textarea
                      label="Limitazioni fisiche"
                      value={form.limitazioni}
                      onChange={(e) => updateForm({ limitazioni: e.target.value })}
                      placeholder="Breve descrizione se presenti"
                      rows={2}
                    />
                    <Textarea
                      label="Infortuni recenti (breve)"
                      value={form.infortuni_recenti}
                      onChange={(e) => updateForm({ infortuni_recenti: e.target.value })}
                      placeholder="Eventuali infortuni da tenere in considerazione"
                      rows={2}
                    />
                    <Textarea
                      label="Operazioni passate (breve)"
                      value={form.operazioni_passate}
                      onChange={(e) => updateForm({ operazioni_passate: e.target.value })}
                      placeholder="Interventi chirurgici o altro"
                      rows={2}
                    />
                    <Textarea
                      label="Allergie (riassunto)"
                      value={form.allergie}
                      onChange={(e) => updateForm({ allergie: e.target.value })}
                      placeholder="Allergie note (farmaci, alimenti, ecc.)"
                      rows={2}
                    />
                  </div>

                  <p className="text-text-tertiary text-xs">
                    Altri documenti puoi caricarli dalla sezione Documenti dopo il completamento.
                  </p>
                </div>
              )}

              {/* Step 8: Nutrizione (light) */}
              {step === 8 && (
                <div className="space-y-5 text-left">
                  <p className="text-text-tertiary text-sm mb-2">
                    Sono informazioni facoltative. Puoi aggiornarle in qualsiasi momento.
                  </p>

                  <div className="space-y-2">
                    <Label className="block">Obiettivo nutrizionale</Label>
                    <SimpleSelect
                      value={form.obiettivo_nutrizionale}
                      onValueChange={(v) => updateForm({ obiettivo_nutrizionale: v })}
                      placeholder="Seleziona..."
                      options={OBIETTIVO_NUTRIZIONALE_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                    />
                  </div>

                  <div>
                    <Label className="block mb-2">Intolleranze</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {INTOLLERANZE_PRESET.map((opt) => {
                        const selected = form.intolleranze.includes(opt)
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              const next = selected
                                ? form.intolleranze.filter((x) => x !== opt)
                                : [...form.intolleranze, opt]
                              updateForm({ intolleranze: next })
                            }}
                            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                              selected
                                ? 'bg-lime-500/30 text-lime-200 ring-1 ring-lime-500/50'
                                : 'bg-background-tertiary text-text-secondary hover:bg-background-secondary'
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                    {form.intolleranze
                      .filter((o) => !(INTOLLERANZE_PRESET as readonly string[]).includes(o))
                      .map((altra) => (
                        <span
                          key={altra}
                          className="inline-flex items-center gap-1 rounded-full bg-background-tertiary px-3 py-1.5 text-sm text-text-primary mr-2 mb-2"
                        >
                          {altra}
                          <button
                            type="button"
                            onClick={() =>
                              updateForm({
                                intolleranze: form.intolleranze.filter((x) => x !== altra),
                              })
                            }
                            className="text-text-tertiary hover:text-text-primary"
                            aria-label={`Rimuovi ${altra}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    <Input
                      placeholder="Altro (scrivi e premi Invio)"
                      value={intolleranzaAltro}
                      onChange={(e) => setIntolleranzaAltro(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const v = intolleranzaAltro.trim()
                          if (v && !form.intolleranze.includes(v)) {
                            updateForm({ intolleranze: [...form.intolleranze, v] })
                            setIntolleranzaAltro('')
                          }
                        }
                      }}
                    />
                  </div>

                  <div>
                    <Label className="block mb-2">Allergie alimentari</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {ALLERGIE_ALIMENTARI_PRESET.map((opt) => {
                        const selected = form.allergie_alimentari.includes(opt)
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              const next = selected
                                ? form.allergie_alimentari.filter((x) => x !== opt)
                                : [...form.allergie_alimentari, opt]
                              updateForm({ allergie_alimentari: next })
                            }}
                            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                              selected
                                ? 'bg-lime-500/30 text-lime-200 ring-1 ring-lime-500/50'
                                : 'bg-background-tertiary text-text-secondary hover:bg-background-secondary'
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                    {form.allergie_alimentari
                      .filter((o) => !(ALLERGIE_ALIMENTARI_PRESET as readonly string[]).includes(o))
                      .map((altra) => (
                        <span
                          key={altra}
                          className="inline-flex items-center gap-1 rounded-full bg-background-tertiary px-3 py-1.5 text-sm text-text-primary mr-2 mb-2"
                        >
                          {altra}
                          <button
                            type="button"
                            onClick={() =>
                              updateForm({
                                allergie_alimentari: form.allergie_alimentari.filter(
                                  (x) => x !== altra,
                                ),
                              })
                            }
                            className="text-text-tertiary hover:text-text-primary"
                            aria-label={`Rimuovi ${altra}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    <Input
                      placeholder="Altro (scrivi e premi Invio)"
                      value={allergiaAlimentareAltro}
                      onChange={(e) => setAllergiaAlimentareAltro(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const v = allergiaAlimentareAltro.trim()
                          if (v && !form.allergie_alimentari.includes(v)) {
                            updateForm({ allergie_alimentari: [...form.allergie_alimentari, v] })
                            setAllergiaAlimentareAltro('')
                          }
                        }
                      }}
                    />
                  </div>

                  <Textarea
                    label="Abitudini alimentari"
                    value={form.abitudini_alimentari}
                    onChange={(e) => updateForm({ abitudini_alimentari: e.target.value })}
                    placeholder="Esempio: orari irregolari, mangio fuori spesso, poca colazione, ecc."
                    rows={3}
                  />
                </div>
              )}

              {/* Step 9: Anamnesi (questionario ufficiale) */}
              {step === 9 && (
                <div className="space-y-5 text-left">
                  {/* Intestazione ANAMNESI */}
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-3">
                    <h3 className="text-text-primary font-semibold text-lg">ANAMNESI</h3>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                      <dt className="text-text-tertiary">Trainer</dt>
                      <dd className="text-text-primary">
                        {ptInfo?.pt_nome || ptInfo?.pt_cognome
                          ? `${ptInfo.pt_nome ?? ''} ${ptInfo.pt_cognome ?? ''}`.trim()
                          : '—'}
                      </dd>
                      <dt className="text-text-tertiary">Data anamnesi</dt>
                      <dd className="text-text-primary">
                        {new Date().toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </dd>
                      <dt className="text-text-tertiary">Cliente</dt>
                      <dd className="text-text-primary">
                        {[form.nome, form.cognome].filter(Boolean).join(' ') || '—'}
                      </dd>
                      {form.data_nascita && (
                        <>
                          <dt className="text-text-tertiary">Data di nascita</dt>
                          <dd className="text-text-primary">{form.data_nascita}</dd>
                        </>
                      )}
                      {form.codice_fiscale && (
                        <>
                          <dt className="text-text-tertiary">Codice fiscale</dt>
                          <dd className="text-text-primary">{form.codice_fiscale}</dd>
                        </>
                      )}
                    </dl>
                  </div>

                  {/* Questionario anamnestico */}
                  <div className="space-y-4">
                    <p className="text-text-tertiary text-sm">Compila le seguenti informazioni.</p>
                    <Input
                      label="Sonno"
                      value={anamnesi.sonno}
                      onChange={(e) => setAnamnesi((p) => ({ ...p, sonno: e.target.value }))}
                      placeholder="es. regolare / irregolare"
                    />
                    <Input
                      label="BPM a riposo"
                      type="number"
                      value={anamnesi.bpm_riposo}
                      onChange={(e) => setAnamnesi((p) => ({ ...p, bpm_riposo: e.target.value }))}
                      placeholder="es. 65"
                    />
                    <div>
                      <Label className="block mb-2">Fumatore</Label>
                      <Select
                        value={anamnesi.fumatore}
                        onValueChange={(v) => setAnamnesi((p) => ({ ...p, fumatore: v }))}
                      >
                        <option value="">Seleziona</option>
                        <option value="sì">Sì</option>
                        <option value="no">No</option>
                      </Select>
                    </div>
                    <Input
                      label="Stile di vita"
                      value={anamnesi.stile_vita}
                      onChange={(e) => setAnamnesi((p) => ({ ...p, stile_vita: e.target.value }))}
                      placeholder="es. sportivo / sedentario"
                    />
                    <div>
                      <Label className="block mb-2">Infortuni passati</Label>
                      <Select
                        value={anamnesi.infortuni}
                        onValueChange={(v) => setAnamnesi((p) => ({ ...p, infortuni: v }))}
                      >
                        <option value="">Seleziona</option>
                        <option value="sì">Sì</option>
                        <option value="no">No</option>
                      </Select>
                    </div>
                    <Input
                      label="Descrizione infortuni"
                      value={anamnesi.infortuni_descrizione}
                      onChange={(e) =>
                        setAnamnesi((p) => ({ ...p, infortuni_descrizione: e.target.value }))
                      }
                      placeholder="eventuali dettagli"
                    />
                    <div>
                      <Label className="block mb-2">Operazioni chirurgiche</Label>
                      <Select
                        value={anamnesi.operazioni}
                        onValueChange={(v) => setAnamnesi((p) => ({ ...p, operazioni: v }))}
                      >
                        <option value="">Seleziona</option>
                        <option value="sì">Sì</option>
                        <option value="no">No</option>
                      </Select>
                    </div>
                    <Input
                      label="Descrizione operazioni"
                      value={anamnesi.operazioni_descrizione}
                      onChange={(e) =>
                        setAnamnesi((p) => ({ ...p, operazioni_descrizione: e.target.value }))
                      }
                      placeholder="eventuali dettagli"
                    />
                    <Input
                      label="Gravidanza (se applicabile)"
                      value={anamnesi.gravidanza}
                      onChange={(e) => setAnamnesi((p) => ({ ...p, gravidanza: e.target.value }))}
                      placeholder="es. no / in corso / passata"
                    />
                    <Input
                      label="Proporzione / armonia corporea"
                      value={anamnesi.proporzione_armonia}
                      onChange={(e) =>
                        setAnamnesi((p) => ({ ...p, proporzione_armonia: e.target.value }))
                      }
                      placeholder="note opzionali"
                    />
                    <Textarea
                      label="Note proporzione / armonia"
                      value={anamnesi.proporzione_note}
                      onChange={(e) =>
                        setAnamnesi((p) => ({ ...p, proporzione_note: e.target.value }))
                      }
                      placeholder="eventuali note"
                      rows={2}
                    />
                  </div>

                  {/* Dichiarazione e firma (obbligatori) */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                    <p className="text-text-primary text-sm font-medium">Dichiarazione e firma</p>
                    <Checkbox
                      label="Dichiaro che le informazioni fornite sono veritiere *"
                      checked={anamnesi.dichiarazione_veridicita}
                      onChange={(e) =>
                        setAnamnesi((p) => ({ ...p, dichiarazione_veridicita: e.target.checked }))
                      }
                    />
                    <Input
                      label="Firma (nome e cognome) *"
                      value={anamnesi.firma_nome_cognome}
                      onChange={(e) =>
                        setAnamnesi((p) => ({ ...p, firma_nome_cognome: e.target.value }))
                      }
                      placeholder="Nome Cognome"
                      errorMessage={
                        stepError && !anamnesi.firma_nome_cognome.trim() ? stepError : undefined
                      }
                    />
                  </div>
                </div>
              )}

              {/* Step 10: Manleva (documento legale) */}
              {step === 10 && (
                <div className="space-y-5 text-left">
                  {/* Card documento: riassunto + Leggi tutto */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                    <p className="text-text-primary text-sm font-medium">
                      MODULO DI MANLEVA DI RESPONSABILITÀ
                    </p>
                    <p className="text-text-secondary text-sm">
                      Dichiaro di essere consapevole dei rischi derivanti dall&apos;attività fisica
                      e di accettare la manleva di responsabilità.
                    </p>
                    <button
                      type="button"
                      onClick={() => setManlevaLeggiTuttoOpen((v) => !v)}
                      className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${manlevaLeggiTuttoOpen ? 'rotate-180' : ''}`}
                      />
                      {manlevaLeggiTuttoOpen ? 'Nascondi' : 'Leggi tutto'}
                    </button>
                    {manlevaLeggiTuttoOpen && (
                      <div className="pt-2 border-t border-amber-500/20 space-y-2 text-text-secondary text-sm">
                        <p>
                          Io sottoscritto/a dichiaro di essere consapevole dei rischi connessi alla
                          pratica dell&apos;attività fisica e sportiva e di accettare integralmente
                          la manleva di responsabilità verso la struttura e il personale.
                        </p>
                        <p>
                          DICHIARO di aver ricevuto e compreso le informazioni relative
                          all&apos;attività e di sollevare da ogni responsabilità civile e penale la
                          struttura, i titolari e gli operatori.
                        </p>
                        <p className="text-text-tertiary text-xs pt-2">
                          Questo modulo è un riepilogo. L&apos;informativa completa è consultabile
                          su{' '}
                          <a
                            href="https://www.22club.it"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:underline"
                          >
                            www.22club.it
                          </a>
                          .
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dati identificativi (read-only) */}
                  <div className="rounded-xl border border-border bg-background/30 p-4 space-y-2">
                    <p className="text-text-primary text-sm font-medium">Dati identificativi</p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                      <dt className="text-text-tertiary">Nome e cognome</dt>
                      <dd className="text-text-primary">
                        {[form.nome, form.cognome].filter(Boolean).join(' ') || '—'}
                      </dd>
                      <dt className="text-text-tertiary">Data di nascita</dt>
                      <dd className="text-text-primary">{form.data_nascita || '—'}</dd>
                      <dt className="text-text-tertiary">Residenza</dt>
                      <dd className="text-text-primary">
                        {[form.indirizzo_residenza, form.cap, form.citta, form.provincia]
                          .filter(Boolean)
                          .join(', ') || '—'}
                      </dd>
                    </dl>
                    {(!form.nome && !form.cognome) || !form.data_nascita ? (
                      <p className="text-amber-400/90 text-xs mt-2">
                        Puoi completare questi dati tornando agli step precedenti.
                      </p>
                    ) : null}
                  </div>

                  {/* Campi input */}
                  <Input
                    label="Luogo di nascita"
                    value={manleva.luogo_nascita}
                    onChange={(e) => setManleva((p) => ({ ...p, luogo_nascita: e.target.value }))}
                    placeholder="es. Bergamo (BG)"
                  />
                  <div>
                    <Label className="block mb-2">Ruolo</Label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="manleva-ruolo"
                          checked={manleva.ruolo === 'diretto_responsabile'}
                          onChange={() =>
                            setManleva((p) => ({ ...p, ruolo: 'diretto_responsabile' }))
                          }
                          className="rounded-full border-amber-500/50 text-amber-500"
                        />
                        <span className="text-text-primary text-sm">Diretto responsabile</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="manleva-ruolo"
                          checked={manleva.ruolo === 'tutore_legale'}
                          onChange={() => setManleva((p) => ({ ...p, ruolo: 'tutore_legale' }))}
                          className="rounded-full border-amber-500/50 text-amber-500"
                        />
                        <span className="text-text-primary text-sm">
                          Tutore legale del/della minore
                        </span>
                      </label>
                    </div>
                  </div>
                  {manleva.ruolo === 'tutore_legale' && (
                    <Input
                      label="Nome del/della minore *"
                      value={manleva.nome_minore}
                      onChange={(e) => setManleva((p) => ({ ...p, nome_minore: e.target.value }))}
                      placeholder="Nome e cognome minore"
                      errorMessage={
                        stepError &&
                        manleva.ruolo === 'tutore_legale' &&
                        manleva.nome_minore.trim().length < 3
                          ? stepError
                          : undefined
                      }
                    />
                  )}

                  {/* Accettazione e firma (obbligatori) */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                    <Checkbox
                      label={
                        "Dichiaro di aver letto e compreso l'informativa e di accettare integralmente la manleva di responsabilità. *"
                      }
                      checked={manleva.dichiarazione_accettazione}
                      onChange={(e) =>
                        setManleva((p) => ({ ...p, dichiarazione_accettazione: e.target.checked }))
                      }
                    />
                    <Input
                      label="Firma (nome e cognome) *"
                      value={manleva.firma_nome_cognome}
                      onChange={(e) =>
                        setManleva((p) => ({ ...p, firma_nome_cognome: e.target.value }))
                      }
                      placeholder={
                        `${form.nome || ''} ${form.cognome || ''}`.trim() || 'Nome Cognome'
                      }
                      errorMessage={
                        stepError && manleva.firma_nome_cognome.trim().length < 3
                          ? stepError
                          : undefined
                      }
                    />
                  </div>
                </div>
              )}

              {/* Step 11: Liberatoria foto e video (consenso media) */}
              {step === 11 && (
                <div className="space-y-5 text-left">
                  {/* Card documento: riassunto + Leggi tutto */}
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 space-y-3">
                    <p className="text-text-primary text-sm font-medium">
                      LIBERATORIA PER LA PUBBLICAZIONE DI FOTO E VIDEO
                    </p>
                    <p className="text-text-secondary text-sm">
                      Puoi autorizzare (o negare) la pubblicazione di foto e video sui canali
                      22Club. Il consenso è revocabile in qualsiasi momento.
                    </p>
                    <button
                      type="button"
                      onClick={() => setLiberatoriaLeggiTuttoOpen((v) => !v)}
                      className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${liberatoriaLeggiTuttoOpen ? 'rotate-180' : ''}`}
                      />
                      {liberatoriaLeggiTuttoOpen ? 'Nascondi' : 'Leggi tutto'}
                    </button>
                    {liberatoriaLeggiTuttoOpen && (
                      <div className="pt-2 border-t border-primary/20 space-y-2 text-text-secondary text-sm">
                        <p>
                          Autorizzo gratuitamente e senza limiti di tempo la struttura 22Club a
                          utilizzare la mia immagine (foto e video) per comunicazione su: sito web,
                          social (Facebook, Instagram, TikTok, X), stampa, materiale promozionale e
                          altri canali futuri. I materiali potranno essere conservati negli archivi
                          della struttura. La revoca del consenso può essere comunicata in qualsiasi
                          momento via email a{' '}
                          <a href="mailto:info@22club.it" className="text-primary hover:underline">
                            info@22club.it
                          </a>
                          .
                        </p>
                        <p className="text-text-tertiary text-xs pt-2">
                          Luogo e data saranno registrati al momento della firma.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dati identificativi (read-only) */}
                  <div className="rounded-xl border border-border bg-background/30 p-4 space-y-2">
                    <p className="text-text-primary text-sm font-medium">Dati identificativi</p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                      <dt className="text-text-tertiary">Nome e cognome</dt>
                      <dd className="text-text-primary">
                        {[form.nome, form.cognome].filter(Boolean).join(' ') || '—'}
                      </dd>
                      <dt className="text-text-tertiary">Data di nascita</dt>
                      <dd className="text-text-primary">{form.data_nascita || '—'}</dd>
                      <dt className="text-text-tertiary">Codice fiscale</dt>
                      <dd className="text-text-primary">{form.codice_fiscale || '—'}</dd>
                      <dt className="text-text-tertiary">Residenza</dt>
                      <dd className="text-text-primary">
                        {[form.indirizzo_residenza, form.cap, form.citta, form.provincia]
                          .filter(Boolean)
                          .join(', ') || '—'}
                      </dd>
                    </dl>
                    {(!form.nome && !form.cognome) || !form.data_nascita ? (
                      <p className="text-amber-400/90 text-xs mt-2">
                        Per completare questi dati, torna agli step precedenti.
                      </p>
                    ) : null}
                    {!form.codice_fiscale?.trim() && (
                      <p className="text-amber-400/90 text-xs mt-1">Codice fiscale: consigliato.</p>
                    )}
                  </div>

                  {/* Scelta autorizzazione (obbligatoria) */}
                  <div>
                    <Label className="block mb-2">Autorizzazione *</Label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="liberatoria-auth"
                          checked={liberatoria.authorized === true}
                          onChange={() => setLiberatoria((p) => ({ ...p, authorized: true }))}
                          className="rounded-full border-primary/50 text-primary"
                        />
                        <span className="text-text-primary text-sm">Autorizzo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="liberatoria-auth"
                          checked={liberatoria.authorized === false}
                          onChange={() => setLiberatoria((p) => ({ ...p, authorized: false }))}
                          className="rounded-full border-primary/50 text-primary"
                        />
                        <span className="text-text-primary text-sm">Non autorizzo</span>
                      </label>
                    </div>
                  </div>

                  {/* Canali, durata, luogo (solo se autorizzo) */}
                  {liberatoria.authorized === true && (
                    <>
                      <div>
                        <Label className="block mb-2">Canali consentiti</Label>
                        <div className="flex flex-wrap gap-2">
                          {(LIBERATORIA_CHANNELS as readonly string[]).map((ch) => (
                            <button
                              key={ch}
                              type="button"
                              onClick={() =>
                                setLiberatoria((p) => ({
                                  ...p,
                                  channels: p.channels.includes(ch)
                                    ? p.channels.filter((c) => c !== ch)
                                    : [...p.channels, ch],
                                }))
                              }
                              className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${liberatoria.channels.includes(ch) ? 'border-primary bg-primary/20 text-primary-foreground' : 'border-border bg-background/50 text-text-secondary hover:border-primary/50'}`}
                            >
                              {ch}
                            </button>
                          ))}
                        </div>
                        {liberatoria.channels.length === 0 && (
                          <p className="text-amber-400/90 text-xs mt-1.5">
                            Consigliato selezionare almeno un canale.
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="block mb-2">Durata</Label>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="liberatoria-durata"
                              checked={liberatoria.duration === 'fino_a_revoca'}
                              onChange={() =>
                                setLiberatoria((p) => ({ ...p, duration: 'fino_a_revoca' }))
                              }
                              className="rounded-full border-primary/50 text-primary"
                            />
                            <span className="text-text-primary text-sm">Fino a revoca</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="liberatoria-durata"
                              checked={liberatoria.duration === 'illimitata'}
                              onChange={() =>
                                setLiberatoria((p) => ({ ...p, duration: 'illimitata' }))
                              }
                              className="rounded-full border-primary/50 text-primary"
                            />
                            <span className="text-text-primary text-sm">Illimitata</span>
                          </label>
                        </div>
                      </div>
                      <Input
                        label="Luogo (opzionale)"
                        value={liberatoria.place}
                        onChange={(e) => setLiberatoria((p) => ({ ...p, place: e.target.value }))}
                        placeholder="es. Bergamo"
                      />
                    </>
                  )}

                  {/* Firma (obbligatoria) */}
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                    <Input
                      label="Firma (nome e cognome) *"
                      value={liberatoria.firma_nome_cognome}
                      onChange={(e) =>
                        setLiberatoria((p) => ({ ...p, firma_nome_cognome: e.target.value }))
                      }
                      placeholder={
                        `${form.nome || ''} ${form.cognome || ''}`.trim() || 'Nome Cognome'
                      }
                      errorMessage={
                        stepError && liberatoria.firma_nome_cognome.trim().length < 3
                          ? stepError
                          : undefined
                      }
                    />
                  </div>
                </div>
              )}

              {/* Step 12: Riepilogo (solo lettura, CTA Modifica per step) */}
              {step === 12 && (
                <div className="space-y-5 text-left">
                  {/* Banner warning se documenti incompleti (non blocca) */}
                  {!anamnesi.dichiarazione_veridicita ||
                  !anamnesi.firma_nome_cognome.trim() ||
                  !manleva.dichiarazione_accettazione ||
                  manleva.firma_nome_cognome.trim().length < 3 ||
                  liberatoria.authorized === null ||
                  liberatoria.authorized === undefined ? (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/15 p-4">
                      <p className="text-amber-200 text-sm">
                        Alcuni documenti sono incompleti. Puoi modificarli dalla sezione Documenti
                        sotto o procedere comunque.
                      </p>
                    </div>
                  ) : null}

                  {/* 1) Profilo base */}
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-text-primary font-medium text-sm">Profilo base</h4>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentStep(1)}
                      >
                        Modifica
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      {(profile?.avatar_url || profile?.avatar) && (
                        <Avatar
                          src={profile.avatar_url ?? profile.avatar ?? null}
                          alt="Profilo"
                          fallbackText={
                            [form.nome, form.cognome].filter(Boolean).join(' ').trim() || '?'
                          }
                          size="lg"
                          className="ring-2 ring-sky-500/30"
                        />
                      )}
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                        {(form.nome || form.cognome) && (
                          <>
                            <dt className="text-text-tertiary">Nome e cognome</dt>
                            <dd className="text-text-primary">
                              {form.nome} {form.cognome}
                            </dd>
                          </>
                        )}
                        {form.sesso && (
                          <>
                            <dt className="text-text-tertiary">Sesso</dt>
                            <dd className="text-text-primary">{form.sesso}</dd>
                          </>
                        )}
                        {form.data_nascita && (
                          <>
                            <dt className="text-text-tertiary">Data di nascita</dt>
                            <dd className="text-text-primary">{form.data_nascita}</dd>
                          </>
                        )}
                      </dl>
                    </div>
                    {!form.nome && !form.cognome && !form.sesso && !form.data_nascita && (
                      <p className="text-text-tertiary text-xs">Nessun dato.</p>
                    )}
                  </div>

                  {/* 2) Contatti & emergenza */}
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-text-primary font-medium text-sm">
                        Contatti & emergenza
                      </h4>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentStep(2)}
                      >
                        Modifica
                      </Button>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                      {form.phone && (
                        <>
                          <dt className="text-text-tertiary">Telefono</dt>
                          <dd className="text-text-primary">{form.phone}</dd>
                        </>
                      )}
                      {form.contatto_emergenza_nome && (
                        <>
                          <dt className="text-text-tertiary">Emergenza</dt>
                          <dd className="text-text-primary">
                            {form.contatto_emergenza_nome}
                            {form.contatto_emergenza_relazione
                              ? ` (${form.contatto_emergenza_relazione})`
                              : ''}
                            {form.contatto_emergenza_telefono
                              ? ` · ${form.contatto_emergenza_telefono}`
                              : ''}
                          </dd>
                        </>
                      )}
                    </dl>
                    {!form.phone && !form.contatto_emergenza_nome && (
                      <p className="text-text-tertiary text-xs">Nessun contatto inserito.</p>
                    )}
                  </div>

                  {/* 3) Residenza & dati fiscali */}
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-text-primary font-medium text-sm">
                        Residenza & dati fiscali
                      </h4>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentStep(3)}
                      >
                        Modifica
                      </Button>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                      {form.codice_fiscale && (
                        <>
                          <dt className="text-text-tertiary">Codice fiscale</dt>
                          <dd className="text-text-primary">{form.codice_fiscale}</dd>
                        </>
                      )}
                      {form.indirizzo_residenza && (
                        <>
                          <dt className="text-text-tertiary">Indirizzo</dt>
                          <dd className="text-text-primary">{form.indirizzo_residenza}</dd>
                        </>
                      )}
                      {(form.cap || form.citta) && (
                        <>
                          <dt className="text-text-tertiary">CAP / Città</dt>
                          <dd className="text-text-primary">
                            {form.cap} {form.citta}
                          </dd>
                        </>
                      )}
                      {form.provincia && (
                        <>
                          <dt className="text-text-tertiary">Provincia</dt>
                          <dd className="text-text-primary">{form.provincia}</dd>
                        </>
                      )}
                      {form.nazione && (
                        <>
                          <dt className="text-text-tertiary">Nazione</dt>
                          <dd className="text-text-primary">{form.nazione}</dd>
                        </>
                      )}
                      {form.professione && (
                        <>
                          <dt className="text-text-tertiary">Professione</dt>
                          <dd className="text-text-primary">{form.professione}</dd>
                        </>
                      )}
                    </dl>
                    {!form.indirizzo_residenza && !form.codice_fiscale && !form.professione && (
                      <p className="text-text-tertiary text-xs">Nessun dato inserito.</p>
                    )}
                  </div>

                  {/* 4) Dati fisici */}
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-text-primary font-medium text-sm">Dati fisici</h4>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentStep(4)}
                      >
                        Modifica
                      </Button>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                      {form.altezza_cm !== '' && (
                        <>
                          <dt className="text-text-tertiary">Altezza</dt>
                          <dd className="text-text-primary">{form.altezza_cm} cm</dd>
                        </>
                      )}
                      {form.peso_corrente_kg !== '' && (
                        <>
                          <dt className="text-text-tertiary">Peso attuale</dt>
                          <dd className="text-text-primary">{form.peso_corrente_kg} kg</dd>
                        </>
                      )}
                      {form.peso_iniziale_kg !== '' && (
                        <>
                          <dt className="text-text-tertiary">Peso iniziale</dt>
                          <dd className="text-text-primary">{form.peso_iniziale_kg} kg</dd>
                        </>
                      )}
                      {form.obiettivo_peso !== '' && (
                        <>
                          <dt className="text-text-tertiary">Obiettivo peso</dt>
                          <dd className="text-text-primary">{form.obiettivo_peso} kg</dd>
                        </>
                      )}
                      {form.bmi != null && (
                        <>
                          <dt className="text-text-tertiary">BMI</dt>
                          <dd className="text-text-primary">{form.bmi}</dd>
                        </>
                      )}
                    </dl>
                    {form.altezza_cm === '' &&
                      form.peso_corrente_kg === '' &&
                      form.peso_iniziale_kg === '' && (
                        <p className="text-text-tertiary text-xs">Nessun dato fisico inserito.</p>
                      )}
                  </div>

                  {/* 5) Obiettivi & livello */}
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-text-primary font-medium text-sm">Obiettivi & livello</h4>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentStep(5)}
                      >
                        Modifica
                      </Button>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                      {form.livello_esperienza && (
                        <>
                          <dt className="text-text-tertiary">Livello esperienza</dt>
                          <dd className="text-text-primary">{form.livello_esperienza}</dd>
                        </>
                      )}
                      {form.tipo_atleta && (
                        <>
                          <dt className="text-text-tertiary">Tipo atleta</dt>
                          <dd className="text-text-primary">{form.tipo_atleta}</dd>
                        </>
                      )}
                      {form.obiettivi_fitness?.length > 0 && (
                        <>
                          <dt className="text-text-tertiary">Obiettivi fitness</dt>
                          <dd className="text-text-primary">{form.obiettivi_fitness.join(', ')}</dd>
                        </>
                      )}
                    </dl>
                    {!form.livello_esperienza &&
                      !form.tipo_atleta &&
                      !form.obiettivi_fitness?.length && (
                        <p className="text-text-tertiary text-xs">Nessun dato inserito.</p>
                      )}
                  </div>

                  {/* 6) Motivazione */}
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-text-primary font-medium text-sm">Motivazione</h4>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentStep(6)}
                      >
                        Modifica
                      </Button>
                    </div>
                    <dl className="grid grid-cols-1 gap-y-1.5 text-sm">
                      {form.livello_motivazione !== '' && (
                        <>
                          <dt className="text-text-tertiary">Livello (1-5)</dt>
                          <dd className="text-text-primary">{form.livello_motivazione}</dd>
                        </>
                      )}
                      {form.note && (
                        <>
                          <dt className="text-text-tertiary">Note</dt>
                          <dd className="text-text-primary whitespace-pre-wrap">{form.note}</dd>
                        </>
                      )}
                    </dl>
                    {form.livello_motivazione === '' && !form.note && (
                      <p className="text-text-tertiary text-xs">Nessuna nota.</p>
                    )}
                  </div>

                  {/* 7) Salute */}
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-text-primary font-medium text-sm">Salute</h4>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentStep(7)}
                      >
                        Modifica
                      </Button>
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                      {form.certificato_medico_tipo && (
                        <>
                          <dt className="text-text-tertiary">Certificato</dt>
                          <dd className="text-text-primary">
                            {form.certificato_medico_tipo}
                            {form.certificato_medico_data_rilascio
                              ? ` (ril. ${form.certificato_medico_data_rilascio})`
                              : ''}
                            {form.certificato_medico_scadenza
                              ? ` — scad. ${form.certificato_medico_scadenza}`
                              : ''}
                          </dd>
                        </>
                      )}
                      {form.limitazioni && (
                        <>
                          <dt className="text-text-tertiary">Limitazioni</dt>
                          <dd className="text-text-primary whitespace-pre-wrap">
                            {form.limitazioni}
                          </dd>
                        </>
                      )}
                      {form.infortuni_recenti && (
                        <>
                          <dt className="text-text-tertiary">Infortuni recenti</dt>
                          <dd className="text-text-primary whitespace-pre-wrap">
                            {form.infortuni_recenti}
                          </dd>
                        </>
                      )}
                      {form.operazioni_passate && (
                        <>
                          <dt className="text-text-tertiary">Operazioni passate</dt>
                          <dd className="text-text-primary whitespace-pre-wrap">
                            {form.operazioni_passate}
                          </dd>
                        </>
                      )}
                      {form.allergie && (
                        <>
                          <dt className="text-text-tertiary">Allergie</dt>
                          <dd className="text-text-primary">{form.allergie}</dd>
                        </>
                      )}
                    </dl>
                    {!form.certificato_medico_tipo &&
                      !form.limitazioni &&
                      !form.infortuni_recenti &&
                      !form.operazioni_passate &&
                      !form.allergie && (
                        <p className="text-text-tertiary text-xs">Nessun dato salute inserito.</p>
                      )}
                  </div>

                  {/* 8) Nutrizione */}
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="text-text-primary font-medium text-sm">Nutrizione</h4>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentStep(8)}
                      >
                        Modifica
                      </Button>
                    </div>
                    <dl className="grid grid-cols-1 gap-y-1.5 text-sm">
                      {form.obiettivo_nutrizionale && (
                        <>
                          <dt className="text-text-tertiary">Obiettivo nutrizionale</dt>
                          <dd className="text-text-primary">{form.obiettivo_nutrizionale}</dd>
                        </>
                      )}
                      {form.intolleranze?.length > 0 && (
                        <>
                          <dt className="text-text-tertiary">Intolleranze</dt>
                          <dd className="text-text-primary">{form.intolleranze.join(', ')}</dd>
                        </>
                      )}
                      {form.allergie_alimentari?.length > 0 && (
                        <>
                          <dt className="text-text-tertiary">Allergie alimentari</dt>
                          <dd className="text-text-primary">
                            {form.allergie_alimentari.join(', ')}
                          </dd>
                        </>
                      )}
                      {form.abitudini_alimentari && (
                        <>
                          <dt className="text-text-tertiary">Abitudini alimentari</dt>
                          <dd className="text-text-primary whitespace-pre-wrap">
                            {form.abitudini_alimentari}
                          </dd>
                        </>
                      )}
                    </dl>
                    {!form.obiettivo_nutrizionale &&
                      !form.intolleranze?.length &&
                      !form.allergie_alimentari?.length &&
                      !form.abitudini_alimentari && (
                        <p className="text-text-tertiary text-xs">
                          Nessun dato nutrizione inserito.
                        </p>
                      )}
                  </div>

                  {/* Documenti e consensi */}
                  <div className="rounded-xl border-2 border-sky-500/40 bg-sky-500/10 p-4 space-y-4">
                    <h4 className="text-text-primary font-semibold text-sm flex items-center gap-2">
                      📄 Documenti e consensi
                    </h4>

                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-text-primary text-sm font-medium">Anamnesi</span>
                          {anamnesi.dichiarazione_veridicita &&
                          anamnesi.firma_nome_cognome.trim().length >= 3 ? (
                            <span className="ml-2 text-green-400 text-xs">Compilata e firmata</span>
                          ) : (
                            <span className="ml-2 text-amber-400 text-xs">Incompleta</span>
                          )}
                          {ptInfo && (ptInfo.pt_nome || ptInfo.pt_cognome) && (
                            <p className="text-text-tertiary text-xs mt-0.5">
                              Trainer:{' '}
                              {[ptInfo.pt_nome, ptInfo.pt_cognome].filter(Boolean).join(' ')}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setCurrentStep(9)}
                        >
                          Modifica
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-text-primary text-sm font-medium">Manleva</span>
                          {manleva.dichiarazione_accettazione &&
                          manleva.firma_nome_cognome.trim().length >= 3 ? (
                            <span className="ml-2 text-green-400 text-xs">Accettata</span>
                          ) : (
                            <span className="ml-2 text-amber-400 text-xs">Incompleta</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setCurrentStep(10)}
                        >
                          Modifica
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-text-primary text-sm font-medium">
                            Liberatoria foto/video
                          </span>
                          {liberatoria.authorized === true && (
                            <span className="ml-2 text-green-400 text-xs">Autorizzata</span>
                          )}
                          {liberatoria.authorized === false && (
                            <span className="ml-2 text-green-400 text-xs">NON autorizzata</span>
                          )}
                          {(liberatoria.authorized === null ||
                            liberatoria.authorized === undefined) && (
                            <span className="ml-2 text-amber-400 text-xs">Da scegliere</span>
                          )}
                          {liberatoria.authorized === true &&
                            (liberatoria.channels.length > 0 || liberatoria.duration) && (
                              <p className="text-text-tertiary text-xs mt-0.5">
                                Canali: {liberatoria.channels.join(', ') || '—'} · Durata:{' '}
                                {liberatoria.duration === 'illimitata'
                                  ? 'Illimitata'
                                  : liberatoria.duration === 'fino_a_revoca'
                                    ? 'Fino a revoca'
                                    : '—'}
                              </p>
                            )}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setCurrentStep(11)}
                        >
                          Modifica
                        </Button>
                      </div>
                    </div>

                    <p className="text-text-tertiary text-xs pt-2 border-t border-sky-500/20">
                      Versione: {QUESTIONNAIRE_VERSION}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 13: Conferma finale */}
              {step === 13 && (
                <div className="space-y-5 text-left">
                  <div className="rounded-xl border border-border bg-background/30 p-4 space-y-4">
                    <p className="text-text-primary text-sm">
                      Conferma che i dati inseriti sono corretti. Genereremo il tuo Dossier Atleta
                      22Club e lo salveremo nei Documenti.
                    </p>
                    <Checkbox
                      label="Confermo che tutti i dati inseriti sono corretti e autorizzo la generazione del Dossier Atleta 22Club. *"
                      checked={finalConfirmation}
                      onChange={(e) => {
                        setFinalConfirmation(e.target.checked)
                        setStepError(null)
                      }}
                    />
                    {stepError && step === 13 && !finalConfirmation && (
                      <p className="text-state-error text-sm">{stepError}</p>
                    )}
                    <div className="text-text-tertiary text-xs space-y-1 pt-2 border-t border-border">
                      <p>Potrai modificare i dati anche in seguito dal tuo profilo.</p>
                      <p>Il dossier verrà salvato automaticamente nella sezione Documenti.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 14: Genera Dossier & Completa */}
              {step === 14 && (
                <div className="space-y-5 text-left">
                  {/* Stato 1: Ready */}
                  {!completing && !downloadUrl && !completeError && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-border bg-background/30 p-4 space-y-4">
                        <p className="text-text-primary text-sm">
                          Genereremo il Dossier Atleta 22Club e lo salveremo automaticamente nei
                          tuoi Documenti.
                        </p>
                        <Button onClick={handleComplete} className="w-full sm:w-auto">
                          Genera dossier
                        </Button>
                      </div>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentStep(12)
                          setCompleteError(null)
                        }}
                        className="text-sm text-brand hover:underline block"
                      >
                        Torna al riepilogo
                      </Link>
                    </div>
                  )}

                  {/* Stato 2: Loading */}
                  {completing && (
                    <div className="rounded-xl border border-border bg-background/30 p-6 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-brand" />
                      <p className="text-text-secondary text-sm">Generazione in corso…</p>
                    </div>
                  )}

                  {/* Stato 3: Success */}
                  {!completing && downloadUrl && (
                    <div className="rounded-xl border-2 border-green-500/30 bg-green-500/10 p-5 space-y-4">
                      <p className="text-green-400/95 font-medium">
                        Dossier generato e salvato nei Documenti.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                        <Button asChild>
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2"
                          >
                            Scarica dossier
                          </a>
                        </Button>
                        <Button variant="secondary" onClick={handleGoHome}>
                          Vai alla Home
                        </Button>
                        <Button variant="secondary" asChild>
                          <Link href="/home/documenti">Apri Documenti</Link>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Stato 4: Error */}
                  {!completing && completeError && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-state-error/40 bg-state-error/10 p-4">
                        <p className="text-state-error text-sm">
                          Non siamo riusciti a generare il dossier. Riprova.
                        </p>
                        <p className="text-text-tertiary text-xs mt-1">{completeError}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={handleComplete}>Riprova</Button>
                        <Link
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentStep(12)
                            setCompleteError(null)
                          }}
                          className="inline-flex items-center text-sm text-brand hover:underline"
                        >
                          Torna al riepilogo
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-3">
            <div className="flex justify-center gap-4">
              {step > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                  disabled={saving || completing}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Indietro
                </Button>
              )}
              <Button
                onClick={
                  step === 14 && completeError
                    ? handleComplete
                    : step === 14 && downloadUrl
                      ? handleGoHome
                      : handleNext
                }
                disabled={saving || completing || (step === 13 && !finalConfirmation)}
                className={
                  step === 0
                    ? 'flex items-center gap-2 min-h-[48px] px-6 text-base font-semibold rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-md shadow-primary/30 border border-teal-500/50 hover:from-teal-500 hover:to-cyan-500'
                    : 'flex items-center gap-2'
                }
              >
                {saving || completing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {completing ? 'Generazione...' : 'Salvataggio...'}
                  </>
                ) : step === 0 ? (
                  <>
                    Inizia <ArrowRight className="h-4 w-4" />
                  </>
                ) : step === 14 && completeError ? (
                  <>Riprova</>
                ) : step === 14 && downloadUrl ? (
                  <>Vai alla home</>
                ) : step === 14 && !downloadUrl ? (
                  <>Genera dossier</>
                ) : step < TOTAL_STEPS - 1 ? (
                  <>
                    Avanti <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Completa configurazione <span className="ml-1">✅</span>
                  </>
                )}
              </Button>
            </div>
            {(stepError || completeError) && (
              <p className="text-state-error text-sm">{stepError || completeError}</p>
            )}
            {STEPS[step].skippable && (
              <button
                type="button"
                onClick={handleSkip}
                className="text-text-tertiary hover:text-brand text-sm transition-colors flex items-center gap-1.5"
              >
                <span>⏭️</span> Salta e completa
              </button>
            )}
            {step < TOTAL_STEPS - 1 && !STEPS[step].skippable && (
              <Link
                href="/home"
                className="text-text-tertiary hover:text-brand text-sm transition-colors flex items-center gap-1.5"
              >
                Esci e torna all&apos;app
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
