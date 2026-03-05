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

function labelVal(doc: jsPDF, label: string, value: unknown, x: number, y: number, maxW: number): number {
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
  doc.text('DOSSIER ATLETA 22CLUB', MARGIN, y)
  y += LINE_HEIGHT * 2
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(FONT_SIZE_NORMAL)
  doc.text(`Generato il ${new Date().toLocaleString('it-IT')}`, MARGIN, y)
  y += LINE_HEIGHT * 2

  y = sectionTitle(doc, '1. Dati anagrafici e contatti', y)
  y = addPageIfNeeded(doc, y, 60)
  const maxW = PAGE_WIDTH - MARGIN * 2
  y = labelVal(doc, 'Nome e cognome', `${profile.nome ?? ''} ${profile.cognome ?? ''}`.trim() || '-', MARGIN, y, maxW)
  y = labelVal(doc, 'Email', profile.email, MARGIN, y, maxW)
  y = labelVal(doc, 'Telefono', profile.phone, MARGIN, y, maxW)
  y = labelVal(doc, 'Data di nascita', profile.data_nascita, MARGIN, y, maxW)
  y = labelVal(doc, 'Residenza', [profile.indirizzo_residenza, profile.cap, profile.citta, profile.provincia].filter(Boolean).join(', ') || '-', MARGIN, y, maxW)
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
  y = labelVal(doc, 'Obiettivi fitness', Array.isArray(profile.obiettivi_fitness) ? profile.obiettivi_fitness.join(', ') : null, MARGIN, y, maxW)
  y = labelVal(doc, 'Note / motivazione', profile.note, MARGIN, y, maxW)
  y += LINE_HEIGHT

  y = addPageIfNeeded(doc, y, 30)
  y = sectionTitle(doc, '3. Anamnesi', y)
  const anam = questionnaire.anamnesi as Record<string, unknown>
  Object.entries(anam).forEach(([k, v]) => {
    y = addPageIfNeeded(doc, y, LINE_HEIGHT * 2)
    y = labelVal(doc, k.replace(/_/g, ' '), v, MARGIN, y, maxW)
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

  y = addPageIfNeeded(doc, y, 30)
  y = sectionTitle(doc, '5. Liberatoria foto/video', y)
  const lib = questionnaire.liberatoria_media as Record<string, unknown>
  Object.entries(lib).forEach(([k, v]) => {
    y = addPageIfNeeded(doc, y, LINE_HEIGHT * 2)
    y = labelVal(doc, k.replace(/_/g, ' '), v, MARGIN, y, maxW)
  })
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
