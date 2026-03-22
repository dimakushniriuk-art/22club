/**
 * Generazione PDF "DOSSIER ATLETA 22CLUB" per onboarding.
 * Usato da API /api/onboarding/finish (solo server).
 */

import { jsPDF } from 'jspdf'

const FONT_SIZE_NORMAL = 10
const FONT_SIZE_SMALL = 9
const FONT_SIZE_TITLE = 16
const FONT_SIZE_SECTION = 12
const MARGIN = 20
const LINE_HEIGHT = 6
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297

export interface DossierProfile {
  id: string
  nome: string | null
  cognome: string | null
  email: string
  phone: string | null
  data_nascita: string | null
  sesso: string | null
  indirizzo_residenza: string | null
  provincia: string | null
  cap: string | null
  citta: string | null
  nazione: string | null
  codice_fiscale: string | null
  professione: string | null
  altezza_cm: number | null
  peso_corrente_kg: number | null
  bmi: number | null
  livello_esperienza: string | null
  tipo_atleta: string | null
  obiettivi_fitness: string[] | null
  livello_motivazione: number | null
  note: string | null
  certificato_medico_tipo: string | null
  limitazioni: string | null
  allergie: string | null
  obiettivo_nutrizionale: string | null
  org_id: string | null
}

export interface DossierQuestionnaire {
  version: string
  anamnesi: Record<string, unknown>
  manleva: Record<string, unknown>
  liberatoria_media: Record<string, unknown>
  signed_at: string | null
}

function _addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number = FONT_SIZE_NORMAL,
): number {
  const lines = doc.splitTextToSize(text, maxWidth)
  doc.setFontSize(fontSize)
  doc.text(lines, x, y)
  return y + lines.length * (fontSize * 0.4 + 1)
}

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(FONT_SIZE_SECTION)
  doc.setFont('helvetica', 'bold')
  doc.text(title, MARGIN, y)
  doc.setFont('helvetica', 'normal')
  return y + LINE_HEIGHT * 1.5
}

function labelVal(
  doc: jsPDF,
  label: string,
  value: unknown,
  x: number,
  y: number,
  maxW: number,
): number {
  const v = value === null || value === undefined ? '-' : String(value)
  doc.setFontSize(FONT_SIZE_SMALL)
  doc.setFont('helvetica', 'bold')
  doc.text(`${label}: `, x, y)
  const lw = doc.getTextWidth(`${label}: `)
  doc.setFont('helvetica', 'normal')
  const rest = maxW - x - lw
  const lines = doc.splitTextToSize(v, rest)
  doc.text(lines, x + lw, y)
  return y + Math.max(LINE_HEIGHT, lines.length * (FONT_SIZE_SMALL * 0.4 + 1))
}

function addPageIfNeeded(doc: jsPDF, y: number, need: number): number {
  if (y + need > PAGE_HEIGHT - MARGIN) {
    doc.addPage()
    return MARGIN
  }
  return y
}

export function buildDossierPdf(
  profile: DossierProfile,
  questionnaire: DossierQuestionnaire,
): Uint8Array {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MARGIN

  doc.setFontSize(FONT_SIZE_TITLE)
  doc.setFont('helvetica', 'bold')
  doc.text('DOCUMENTO DI RIEPILOGO DEI DATI INSERITI', MARGIN, y)
  y += LINE_HEIGHT * 2
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(FONT_SIZE_NORMAL)
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, MARGIN, y)
  y += LINE_HEIGHT * 2

  y = sectionTitle(doc, '1. Dati anagrafici e contatti', y)
  y = addPageIfNeeded(doc, y, 60)
  const maxW = PAGE_WIDTH - MARGIN * 2
  y = labelVal(
    doc,
    'Nome e cognome',
    `${profile.nome ?? ''} ${profile.cognome ?? ''}`.trim() || '-',
    MARGIN,
    y,
    maxW,
  )
  y = labelVal(doc, 'Email', profile.email, MARGIN, y, maxW)
  y = labelVal(doc, 'Telefono', profile.phone, MARGIN, y, maxW)
  y = labelVal(doc, 'Data di nascita', profile.data_nascita, MARGIN, y, maxW)
  y = labelVal(
    doc,
    'Residenza',
    [profile.indirizzo_residenza, profile.cap, profile.citta, profile.provincia]
      .filter(Boolean)
      .join(', ') || '-',
    MARGIN,
    y,
    maxW,
  )
  y = labelVal(doc, 'Codice fiscale', profile.codice_fiscale, MARGIN, y, maxW)
  y = labelVal(doc, 'Professione', profile.professione, MARGIN, y, maxW)
  y += LINE_HEIGHT

  y = addPageIfNeeded(doc, y, 40)
  y = sectionTitle(doc, '2. Dati fisici e obiettivi', y)
  y = labelVal(doc, 'Altezza (cm)', profile.altezza_cm, MARGIN, y, maxW)
  y = labelVal(doc, 'Peso (kg)', profile.peso_corrente_kg, MARGIN, y, maxW)
  y = labelVal(doc, 'BMI', profile.bmi, MARGIN, y, maxW)
  y = labelVal(doc, 'Livello esperienza', profile.livello_esperienza, MARGIN, y, maxW)
  y = labelVal(doc, 'Tipo atleta', profile.tipo_atleta, MARGIN, y, maxW)
  y = labelVal(
    doc,
    'Obiettivi fitness',
    Array.isArray(profile.obiettivi_fitness) ? profile.obiettivi_fitness.join(', ') : null,
    MARGIN,
    y,
    maxW,
  )
  y = labelVal(doc, 'Note / motivazione', profile.note, MARGIN, y, maxW)
  y += LINE_HEIGHT

  y = addPageIfNeeded(doc, y, 80)
  y = sectionTitle(doc, '3. Anamnesi e consensi', y)
  const anam = questionnaire.anamnesi as Record<string, unknown>

  const consensoLabels: Record<string, string> = {
    consenso_termini_condizioni: 'Accettazione termini e condizioni',
    consenso_privacy: 'Informativa privacy (GDPR)',
    consenso_idoneita_fisica: 'Idoneità fisica / responsabilità',
    consenso_dati_sanitari: 'Consenso trattamento dati sanitari',
    consenso_liberatoria_attivita_fisica: 'Liberatoria attività fisica',
    consenso_marketing: 'Marketing (comunicazioni promozionali)',
    consenso_comunicazioni: 'Comunicazioni via WhatsApp / email',
    dichiarazione_veridicita: 'Dichiarazione veridicità informazioni',
  }
  const consensoKeys = Object.keys(consensoLabels)
  const otherAnamKeys = Object.keys(anam).filter((k) => !consensoKeys.includes(k))

  doc.setFontSize(FONT_SIZE_SMALL)
  doc.setFont('helvetica', 'bold')
  doc.text('Consensi e dichiarazioni', MARGIN, y)
  y += LINE_HEIGHT
  doc.setFont('helvetica', 'normal')
  consensoKeys.forEach((k) => {
    if (!(k in anam)) return
    y = addPageIfNeeded(doc, y, LINE_HEIGHT * 2)
    const label = consensoLabels[k]
    const val = anam[k]
    const display = val === true ? 'Sì' : val === false ? 'No' : val != null ? String(val) : '-'
    y = labelVal(doc, label, display, MARGIN, y, maxW)
  })
  y += LINE_HEIGHT * 0.5

  doc.setFont('helvetica', 'bold')
  doc.text('Firma e altri dati anamnesi', MARGIN, y)
  y += LINE_HEIGHT
  doc.setFont('helvetica', 'normal')
  const anamnesiFieldLabels: Record<string, string> = {
    firma_nome_cognome: 'Firma (nome e cognome)',
    sonno: 'Sonno',
    fumatore: 'Fumatore',
    stile_vita: 'Stile di vita',
    infortuni_descrizione: 'Descrizione infortuni',
    operazioni: 'Operazioni chirurgiche',
    operazioni_descrizione: 'Descrizione operazioni',
    gravidanza: 'Gravidanza',
  }
  otherAnamKeys.forEach((k) => {
    y = addPageIfNeeded(doc, y, LINE_HEIGHT * 2)
    const label = anamnesiFieldLabels[k] ?? k.replace(/_/g, ' ')
    const v = anam[k]
    const display =
      v === true ? 'Sì' : v === false ? 'No' : v != null && v !== '' ? String(v) : null
    if (display != null) y = labelVal(doc, label, display, MARGIN, y, maxW)
  })
  y += LINE_HEIGHT

  y = addPageIfNeeded(doc, y, 30)
  y = sectionTitle(doc, '4. Manleva di responsabilità', y)
  const manleva = questionnaire.manleva as Record<string, unknown>
  Object.entries(manleva).forEach(([k, v]) => {
    y = addPageIfNeeded(doc, y, LINE_HEIGHT * 2)
    y = labelVal(doc, k.replace(/_/g, ' '), v, MARGIN, y, maxW)
  })
  y += LINE_HEIGHT

  y = addPageIfNeeded(doc, y, 50)
  y = sectionTitle(doc, '5. Liberatoria foto/video', y)
  const lib = questionnaire.liberatoria_media as Record<string, unknown>
  const authorized = lib.authorized === true ? 'Sì' : lib.authorized === false ? 'No' : null
  if (authorized != null) y = labelVal(doc, 'Autorizzazione', authorized, MARGIN, y, maxW)
  const channels = lib.channels
  if (Array.isArray(channels) && channels.length > 0) {
    y = addPageIfNeeded(doc, y, LINE_HEIGHT * 2)
    doc.setFontSize(FONT_SIZE_SMALL)
    doc.setFont('helvetica', 'bold')
    doc.text('Canali consentiti:', MARGIN, y)
    y += LINE_HEIGHT
    doc.setFont('helvetica', 'normal')
    const channelList = channels.map((c) => String(c)).join(', ')
    const lines = doc.splitTextToSize(channelList, maxW)
    doc.text(lines, MARGIN, y)
    y += lines.length * (FONT_SIZE_SMALL * 0.4 + 1) + LINE_HEIGHT * 0.5
  }
  const revocaText =
    "La presente autorizzazione potrà essere revocata in qualsiasi momento mediante comunicazione scritta inviata via e-mail all'indirizzo info@22club.it."
  y = addPageIfNeeded(doc, y, LINE_HEIGHT * 4)
  const revocaLines = doc.splitTextToSize(revocaText, maxW)
  doc.setFontSize(FONT_SIZE_SMALL)
  doc.text(revocaLines, MARGIN, y)
  y += revocaLines.length * (FONT_SIZE_SMALL * 0.4 + 1) + LINE_HEIGHT
  if (lib.place != null && lib.place !== '') {
    y = labelVal(doc, 'Luogo', lib.place, MARGIN, y, maxW)
  }
  if (lib.firma_nome_cognome != null && lib.firma_nome_cognome !== '') {
    y = labelVal(doc, 'Firma (nome e cognome)', lib.firma_nome_cognome, MARGIN, y, maxW)
  }
  y += LINE_HEIGHT

  doc.setFontSize(FONT_SIZE_SMALL)
  doc.setTextColor(100, 100, 100)
  const footerY = PAGE_HEIGHT - 15
  doc.text(
    `athlete_id: ${profile.id} | org_id: ${profile.org_id ?? '-'} | versione: ${questionnaire.version} | ${new Date().toISOString()}`,
    MARGIN,
    footerY,
  )
  doc.setTextColor(0, 0, 0)

  const buf = doc.output('arraybuffer')
  return new Uint8Array(buf instanceof ArrayBuffer ? buf : (buf as unknown as ArrayBuffer))
}
