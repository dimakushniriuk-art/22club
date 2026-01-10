# useInvitations Hook - Documentazione Tecnica

**File**: `src/hooks/use-invitations.ts`  
**Tipo**: React Hook (Custom Hook)  
**Righe**: 190  
**Stato**: ✅ COMPLETO (100%)  
**Ultimo Aggiornamento**: 2025-01-29T19:00:00Z

---

## 📋 Classificazione

- **Categoria**: Inviti / Registrazione Atleti
- **Tipo**: Custom React Hook
- **Dipendenze**: React, Supabase Client
- **Utilizzato da**: `src/app/dashboard/inviti/page.tsx`, componenti inviti

---

## 🎯 Obiettivo

Gestire CRUD inviti atleti per PT/Admin, inclusa:

- Fetch inviti (filtrati per PT se role='pt')
- Creazione invito con codice univoco
- Eliminazione invito
- Generazione URL registrazione con codice
- Calcolo statistiche (total, inviati, registrati, scaduti)
- Utility clipboard

---

## 📥 Parametri

```typescript
interface UseInvitationsProps {
  userId?: string | null
  role?: string | null
}
```

**Parametri**:

- `userId` (string | null): ID profilo utente corrente
- `role` (string | null): Ruolo utente ('admin' | 'pt')

---

## 📤 Output / Return Value

```typescript
{
  invitations: InvitationWithPT[]
  stats: InvitationStats
  loading: boolean
  error: string | null
  fetchInvitations: () => Promise<void>
  refetch: () => Promise<void> // Alias di fetchInvitations
  createInvitation: (data: CreateInvitationData) => Promise<Invitation | null>
  deleteInvitation: (invitationId: string) => Promise<boolean>
  generateQRCode: (invitationCode: string) => string
  copyToClipboard: (text: string) => Promise<boolean>
}
```

**Tipi**:

```typescript
interface CreateInvitationData {
  nome_atleta: string
  email?: string
}

interface InvitationWithPT {
  id: string
  codice: string
  qr_url: string | null
  pt_id: string
  nome_atleta: string
  email: string
  stato: 'inviato' | 'accepted' | 'expired'
  created_at: string
  accepted_at: string | null
  expires_at: string | null
  pt_nome: string
  pt_cognome: string
}

interface InvitationStats {
  total: number
  inviati: number
  registrati: number
  scaduti: number
}
```

---

## 🔄 Flusso Logico

### 1. Fetch Inviti

- Se `role !== 'admin' && role !== 'pt'`: non carica nulla
- Se `role === 'pt'`: filtra per `pt_id = userId`
- Se `role === 'admin'`: mostra tutti gli inviti
- Ordina per `created_at` (desc)
- Mappa dati aggiungendo `pt_nome` e `pt_cognome` (vuoti, da popolare con join se necessario)
- Calcola statistiche: conta per stato

### 2. Creazione Invito

- Genera codice invito univoco lato client (8 caratteri alfanumerici)
- Inserisce in `inviti_atleti` con:
  - `codice`: codice generato
  - `pt_id`: userId
  - `nome_atleta`: da input
  - `email`: da input (opzionale)
- Ricarica lista inviti

### 3. Eliminazione Invito

- Delete da `inviti_atleti` per `id`
- Ricarica lista inviti

### 4. Generazione QR Code

- Genera URL registrazione: `${NEXT_PUBLIC_APP_URL}/registrati?codice=${invitationCode}`
- URL usato per generare QR code (componente esterno)

### 5. Utility Clipboard

- Usa `navigator.clipboard.writeText()` per copiare testo

---

## 🗄️ Database

### Tabelle Utilizzate

**`inviti_atleti`**:

- `id` (uuid, PK)
- `codice` (text) - codice invito univoco (8 caratteri)
- `qr_url` (text, nullable) - URL QR code (generato lato server?)
- `pt_id` (uuid, FK → profiles.id)
- `nome_atleta` (text)
- `email` (text, nullable)
- `stato` (text) - 'inviato' | 'accepted' | 'expired'
- `created_at` (timestamp)
- `accepted_at` (timestamp, nullable)
- `expires_at` (timestamp, nullable)

---

## ⚠️ Errori Possibili

1. **User ID mancante**: `Error('User ID is required to create invitation.')`
2. **Errore Supabase**: Errori da query/insert/delete Supabase
3. **Errore clipboard**: Errori da `navigator.clipboard` (browser non supportato)

---

## 🔗 Dipendenze Critiche

- **Supabase Client**: `createClient()` da `@/lib/supabase`
- **Database**: `inviti_atleti` table
- **RLS Policies**: Deve permettere lettura per PT (solo propri) e Admin (tutti)
- **Environment**: `NEXT_PUBLIC_APP_URL` per generazione URL

---

## 📝 Esempio Utilizzo

```typescript
import { useInvitations } from '@/hooks/use-invitations'

function InvitiPage() {
  const { user } = useAuth()
  const { invitations, stats, loading, createInvitation, deleteInvitation, generateQRCode } =
    useInvitations({
      userId: user?.id,
      role: user?.role,
    })

  const handleCreate = async () => {
    await createInvitation({
      nome_atleta: 'Mario Rossi',
      email: 'mario@example.com',
    })
  }

  const qrUrl = generateQRCode(invitation.codice)
  // Usa qrUrl per generare QR code
}
```

---

## 🐛 Problemi Identificati

1. **🔴 P1-001**: RLS su `inviti_atleti` - 0 righe visibili (1 reale) - già identificato ma non specifico
2. **⚠️ Generazione QR code**: `qr_url` non popolato automaticamente (da verificare se generato lato server)
3. **⚠️ Scadenza inviti**: Nessuna logica automatica per aggiornare `stato` quando `expires_at` scade
4. **⚠️ Tracking stato inviti**: `accepted_at` non popolato automaticamente quando atleta si registra (da verificare trigger)

---

## 📊 Metriche

- **Complessità Ciclomatica**: Bassa (~6-8)
- **Dipendenze Esterne**: 1 (Supabase)
- **Side Effects**: Sì (database)

---

## 🔄 Changelog

### 2025-01-29T19:00:00Z

- ✅ Documentazione iniziale creata
- ✅ Identificati problemi RLS e scadenza
- ✅ Mappate dipendenze database

---

**Stato**: ✅ DOCUMENTATO (100%)
