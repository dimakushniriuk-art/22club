# 📚 Documentazione Tecnica: API Auth Context

**Percorso**: `src/app/api/auth/context/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per gestire contesto autenticazione. Fornisce GET per recuperare profilo utente e POST per aggiornare ruolo e organizzazione.

---

## 🔧 Endpoints

### 1. `GET /api/auth/context`

**Classificazione**: API Route, GET Handler, Authenticated  
**Autenticazione**: Richiesta (session)  
**Autorizzazione**: Nessuna (utente recupera il proprio profilo)

**Query Parameters**: Nessuno

**Response Success** (200):

```typescript
{
  success: true
  data: {
    role: string
    org_id: string
    full_name: string // nome + cognome
    email: string
    user_id: string
  }
}
```

**Response Error**:

- `401`: Non autenticato
- `404`: Profilo non trovato
- `500`: Errore server

**Descrizione**: Endpoint recupero contesto con:

- **Session Check**: Verifica session autenticata
- **Profile Fetch**: Query `profiles` per `user_id` dalla session
- **Fields**: Ritorna `role`, `org_id`, `full_name` (nome + cognome), `email`, `user_id`

### 2. `POST /api/auth/context`

**Classificazione**: API Route, POST Handler, Authenticated  
**Autenticazione**: Richiesta (session)  
**Autorizzazione**: Nessuna (utente aggiorna il proprio profilo)

**Request Headers**:

- `x-user-role`: `string` - Ruolo da impostare (`athlete`, `trainer`, `admin`)
- `x-org-id`: `string` - ID organizzazione

**Request Body**: Nessuno (usa headers)

**Response Success** (200):

```typescript
{
  success: true
  message: string
  data: {
    role: string
    org_id: string
    user_id: string
  }
}
```

**Response Error**:

- `400`: Headers mancanti o ruolo non valido
- `401`: Non autenticato
- `500`: Errore server

**Descrizione**: Endpoint aggiornamento contesto con:

- **Session Check**: Verifica session autenticata
- **Headers Validation**: Verifica `x-user-role` e `x-org-id` presenti
- **Role Validation**: Verifica ruolo valido (`athlete`, `trainer`, `admin`)
- **Profile Update**: Aggiorna `profiles` con `role`, `org_id`, `updated_at`

---

## 🔄 Flusso Logico

### GET /api/auth/context

1. **Session Check**:
   - Verifica session autenticata

2. **Profile Fetch**:
   - Query `profiles` per `user_id` dalla session
   - Seleziona `role`, `org_id`, `nome`, `cognome`, `email`

3. **Format Response**:
   - Calcola `full_name` = `nome + cognome`
   - Ritorna dati formattati

### POST /api/auth/context

1. **Session Check**:
   - Verifica session autenticata

2. **Headers Validation**:
   - Verifica `x-user-role` e `x-org-id` presenti
   - Verifica ruolo valido

3. **Profile Update**:
   - Update `profiles` con `role`, `org_id`, `updated_at`
   - Filtra per `user_id` dalla session

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Supabase Server Client (`createClient`)

**Utilizzato da**: Client-side context management, selezione ruolo/organizzazione

---

## ⚠️ Note Tecniche

- **Headers Custom**: Usa custom headers (`x-user-role`, `x-org-id`) invece di body
- **Role Validation**: Solo ruoli validi: `athlete`, `trainer`, `admin`
- **Self Update**: Utente aggiorna solo il proprio profilo (filtro per `user_id` dalla session)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
