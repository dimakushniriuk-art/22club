import type {
  OnboardingFormState,
  ProfileRow,
  ProfileUpdate,
  WelcomeBrowserDraftPayload,
} from '@/features/welcome-onboarding/types'

export function isMeaningfulWelcomeDraft(p: WelcomeBrowserDraftPayload): boolean {
  if (p.currentStep > 0) return true
  if (p.form.nome?.trim() || p.form.cognome?.trim() || p.form.phone?.trim()) return true
  if (
    Object.values(p.anamnesi).some((v) =>
      typeof v === 'boolean' ? v : typeof v === 'string' ? v.trim() !== '' : false,
    )
  )
    return true
  return false
}

export function emptyFormState(): OnboardingFormState {
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

export function profileToFormState(row: ProfileRow | null): OnboardingFormState {
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

export function computeBmi(altezzaCm: number, pesoKg: number): number | null {
  if (altezzaCm <= 0 || pesoKg <= 0) return null
  const h = altezzaCm / 100
  return Math.round((pesoKg / (h * h)) * 10) / 10
}

/** Payload per update: solo chiavi definite, stringhe vuote → null, niente telefono */
export function formStateToUpdate(
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
