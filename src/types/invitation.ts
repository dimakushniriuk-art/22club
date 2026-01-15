export type Invitation = {
  id: string
  codice: string
  qr_url?: string | null
  pt_id: string
  nome_atleta: string
  email: string
  stato: 'inviato' | 'registrato' | 'scaduto'
  created_at: string
  accepted_at?: string | null
  expires_at: string | null
}

export type InvitationWithPT = Invitation & {
  pt_nome: string
  pt_cognome: string
}

export type CreateInvitationData = {
  nome_atleta: string
  email?: string
}

export type InvitationStats = {
  total: number
  inviati: number
  registrati: number
  scaduti: number
}
