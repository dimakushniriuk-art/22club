# 📚 Documentazione Tecnica: API Routes - Athletes

**Percorso**: `src/app/api/athletes/`  
**Tipo Modulo**: Next.js API Routes (Server Component, Server Action)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-03T00:00:00Z

---

## 📋 Panoramica

API routes Next.js per gestione atleti. Include creazione nuovo atleta e aggiornamento profilo esistente. Gestiscono autenticazione, autorizzazione, validazione input, e operazioni database con gestione errori robusta.

---

# POST /api/athletes/create

**Percorso**: `src/app/api/athletes/create/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Component, Server Action)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-03T00:00:00Z

## 📋 Panoramica

API route Next.js per creazione nuovo atleta. Crea utente in Supabase Auth e profilo nella tabella `profiles` con validazione, autenticazione, autorizzazione e gestione errori robusta. Include rollback automatico se la creazione profilo fallisce.

---

## 🔧 Funzione Principale

### `PUT`

**Classificazione**: Next.js API Route Handler, Server Component, Async, Side-Effecting  
**Tipo**: `(request: NextRequest, { params }: { params: { id: string } }) => Promise<NextResponse>`

**Parametri**:

- `request` (NextRequest): Request HTTP con body JSON
- `params` (object): Route parameters con `id` (UUID atleta)

**Output**: `Promise<NextResponse>` con JSON response

**Descrizione**: Aggiorna profilo atleta nella tabella `profiles` con validazione e controllo permessi.

---

## 🔄 Flusso Logico

1. **Estrazione Parametri**:
   - Estrae `id` da `params`

2. **Autenticazione**:
   - Crea Supabase server client
   - Verifica sessione con `supabase.auth.getSession()`
   - Se `!session` → ritorna `401 Unauthorized`

3. **Autorizzazione**:
   - Query profilo utente corrente da `profiles` table
   - Verifica ruolo: deve essere `admin`, `pt`, o `trainer`
   - Se ruolo non valido → ritorna `403 Forbidden`

4. **Verifica Profilo Esistente**:
   - Query profilo atleta da aggiornare con `id`
   - Se profilo non trovato → ritorna `404 Not Found`

5. **Validazione Input**:
   - Parse body JSON
   - Valida con `updateAthleteSchema.safeParse()`
   - Se validazione fallita → ritorna `400 Bad Request` con primo errore

6. **Normalizzazione Dati**:
   - Normalizza `data_iscrizione` (parse Date, converti in ISO string)
   - Prepara `updateData` rimuovendo `undefined`

7. **Update Database**:
   - Update `profiles` table con `updateData`
   - Se errore → ritorna `500 Internal Server Error`

8. **Response**:
   - Ritorna `200 OK` con profilo aggiornato

---

## 📥 Parametri Input

### Request Body (JSON)

```typescript
{
  nome: string                    // obbligatorio, min 1 carattere
  cognome: string                 // obbligatorio, min 1 carattere
  email: string                   // obbligatorio, formato email valido
  phone?: string                  // opzionale
  stato?: string                  // opzionale
  note?: string | null           // opzionale
  data_iscrizione?: string       // opzionale, formato data
}
```

### Route Parameters

- `id` (string): UUID del profilo atleta da aggiornare

---

## 📤 Output

### Success Response (200 OK)

```typescript
{
  success: true
  data: {
    profile: ProfileRow // Profilo aggiornato
    message: 'Atleta aggiornato con successo'
  }
}
```

### Error Responses

**401 Unauthorized**:

```typescript
{
  error: 'Non autenticato'
}
```

**403 Forbidden**:

```typescript
{
  error: 'Non autorizzato'
}
```

**404 Not Found**:

```typescript
{
  error: 'Profilo non trovato'
}
```

**400 Bad Request**:

```typescript
{
  error: 'Messaggio errore validazione'
}
```

**500 Internal Server Error**:

```typescript
{
  error: 'Messaggio errore server'
}
```

---

## ⚠️ Errori Possibili

1. **Sessione non valida**: `401 Unauthorized`
2. **Ruolo non autorizzato**: `403 Forbidden`
3. **Profilo non trovato**: `404 Not Found`
4. **Validazione input fallita**: `400 Bad Request`
5. **Data iscrizione invalida**: `400 Bad Request`
6. **Errore database**: `500 Internal Server Error`

**Gestione**: Tutti gli errori sono gestiti gracefully con response HTTP appropriati.

---

## 🔗 Dipendenze Critiche

1. **Next.js**: `NextRequest`, `NextResponse`
2. **Supabase Server Client**: `createClient()` da `@/lib/supabase/server`
3. **Validazione Zod**: `updateAthleteSchema` (definito inline)
4. **Types**: `TablesUpdate<'profiles'>` da `@/types/supabase`

---

## 🎯 Utilizzo

**Esempio Request**:

```typescript
const response = await fetch(`/api/athletes/${athleteId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Mario',
    cognome: 'Rossi',
    email: 'mario.rossi@example.com',
    phone: '+39 123 456 7890',
    stato: 'attivo',
  }),
})

const data = await response.json()
```

**Utilizzato da**: Componenti dashboard che aggiornano profilo atleta

---

## 🔄 Side-Effects

1. **Query Database**: Query `profiles` table (2 query: utente corrente + atleta)
2. **Update Database**: Update `profiles` table
3. **Console Logging**: Log errori per debugging

---

## 📝 Note Tecniche

- **Email Update**: L'aggiornamento email in `auth.users` richiede service role, attualmente non implementato
- **Validazione**: Usa Zod schema inline per validazione request body
- **Error Handling**: Try/catch globale cattura tutti gli errori non gestiti

---

## 📝 Changelog

### 2025-01-29

- ✅ Route completa e funzionante
- ✅ Autenticazione e autorizzazione implementate
- ✅ Validazione Zod implementata
- ✅ Gestione errori robusta

---

## 🔧 Funzione Principale

### `POST`

**Classificazione**: Next.js API Route Handler, Server Component, Async, Side-Effecting  
**Tipo**: `(request: NextRequest) => Promise<NextResponse>`

**Parametri**:

- `request` (NextRequest): Request HTTP con body JSON contenente dati atleta

**Output**: `Promise<NextResponse>` con JSON response

**Descrizione**: Crea nuovo atleta con utente in Supabase Auth e profilo nella tabella `profiles`. Richiede autenticazione e ruolo admin/pt/trainer.

---

## 🔄 Flusso Logico

1. **Autenticazione**:
   - Crea Supabase server client
   - Verifica sessione con `supabase.auth.getSession()`
   - Se `!session` → ritorna `401 Unauthorized`

2. **Autorizzazione**:
   - Query profilo utente corrente da `profiles` table
   - Verifica ruolo: deve essere `admin`, `pt`, o `trainer`
   - Se ruolo non valido → ritorna `403 Forbidden`

3. **Validazione Input**:
   - Parse body JSON
   - Valida con `athleteSchema.safeParse()`
   - Se validazione fallita → ritorna `400 Bad Request` con primo errore

4. **Normalizzazione Dati**:
   - Normalizza `data_iscrizione` (parse Date, converti in ISO string)
   - Se data non valida → ritorna `400 Bad Request`

5. **Verifica Configurazione**:
   - Verifica presenza `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
   - Se mancanti → ritorna `500 Internal Server Error`

6. **Creazione Utente Auth**:
   - Crea Supabase admin client con service role key
   - Crea utente in Supabase Auth con `supabaseAdmin.auth.admin.createUser()`
   - Email già confermata (`email_confirm: true`)
   - User metadata include nome e cognome
   - Se email già esiste → ritorna `409 Conflict`
   - Se errore → ritorna `500 Internal Server Error`

7. **Creazione Profilo**:
   - Prepara `profileData` con dati atleta
   - Prova prima con `role: 'atleta'`
   - Se fallisce per problema role, riprova con `role: 'athlete'`
   - Inserisce profilo in `profiles` table
   - Se errore → elimina utente creato (rollback) e ritorna `500 Internal Server Error`

8. **Response**:
   - Ritorna `200 OK` con userId, profileId e messaggio successo

---

## 📥 Parametri Input

### Request Body (JSON)

```typescript
{
  nome: string                    // obbligatorio, min 1 carattere (trimmed)
  cognome: string                 // obbligatorio, min 1 carattere (trimmed)
  email: string                  // obbligatorio, formato email valido (trimmed)
  password: string                // obbligatorio, min 6 caratteri
  phone?: string                 // opzionale, min 1 carattere se presente
  stato?: string                 // opzionale, min 1 carattere se presente
  note?: string                  // opzionale
  data_iscrizione?: string       // opzionale, formato data (convertita in ISO string)
}
```

---

## 📤 Output

### Success Response (200 OK)

```typescript
{
  success: true
  data: {
    userId: string // UUID utente creato in Auth
    profileId: string // UUID profilo creato in profiles
    message: 'Atleta creato con successo'
  }
}
```

### Error Responses

**401 Unauthorized**:

```typescript
{
  error: 'Non autenticato'
}
```

**403 Forbidden**:

```typescript
{
  error: 'Non autorizzato'
}
```

**400 Bad Request**:

```typescript
{
  error: 'Messaggio errore validazione' // Es: "Il nome è obbligatorio", "Email non valida", "La password deve essere di almeno 6 caratteri", "La data di iscrizione non è valida"
}
```

**409 Conflict**:

```typescript
{
  error: 'Questa email è già registrata'
}
```

**500 Internal Server Error**:

```typescript
{
  error: 'Messaggio errore server' // Es: "Configurazione server mancante", "Errore durante la creazione dell'utente", "Errore durante la creazione del profilo"
}
```

---

## ⚠️ Errori Possibili

1. **Sessione non valida**: `401 Unauthorized`
2. **Ruolo non autorizzato**: `403 Forbidden`
3. **Validazione input fallita**: `400 Bad Request`
4. **Data iscrizione invalida**: `400 Bad Request`
5. **Configurazione server mancante**: `500 Internal Server Error` (service role key non configurata)
6. **Email già registrata**: `409 Conflict`
7. **Errore creazione utente Auth**: `500 Internal Server Error`
8. **Errore creazione profilo**: `500 Internal Server Error` (con rollback: elimina utente creato)

**Gestione**: Tutti gli errori sono gestiti gracefully con response HTTP appropriati. Rollback automatico se creazione profilo fallisce.

---

## 🔗 Dipendenze Critiche

1. **Next.js**: `NextRequest`, `NextResponse`
2. **Supabase Server Client**: `createClient()` da `@/lib/supabase/server`
3. **Supabase Admin Client**: `createClient()` da `@supabase/supabase-js` con service role key
4. **Validazione Zod**: `athleteSchema` (definito inline)
5. **Types**: `TablesInsert<'profiles'>`, `SupabaseDatabase` da `@/types/supabase`
6. **Environment Variables**: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## 🎯 Utilizzo

**Esempio Request**:

```typescript
const response = await fetch('/api/athletes/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Mario',
    cognome: 'Rossi',
    email: 'mario.rossi@example.com',
    password: 'password123',
    phone: '+39 123 456 7890',
    stato: 'attivo',
    note: 'Atleta nuovo',
    data_iscrizione: '2024-01-15',
  }),
})

const data = await response.json()

if (data.success) {
  console.log('Atleta creato:', data.data.userId, data.data.profileId)
} else {
  console.error('Errore:', data.error)
}
```

**Utilizzato da**: Componenti dashboard che creano nuovi atleti (form creazione atleta)

---

## 🔄 Side-Effects

1. **Query Database**: Query `profiles` table (utente corrente per verifica ruolo)
2. **Create Auth User**: Crea utente in Supabase Auth con `auth.admin.createUser()`
3. **Insert Database**: Inserisce profilo in `profiles` table
4. **Rollback**: Se creazione profilo fallisce, elimina utente creato con `auth.admin.deleteUser()`
5. **Console Logging**: Log errori per debugging

---

## 📝 Note Tecniche

- **Service Role Key**: Utilizzata per bypassare RLS e creare utenti in Auth (richiede variabile ambiente `SUPABASE_SERVICE_ROLE_KEY`)
- **Email Confermata**: Email già confermata (`email_confirm: true`) perché creazione manuale da admin/staff
- **User Metadata**: Include nome e cognome in `user_metadata` per riferimento futuro
- **Gestione Role**: Prova prima `role: 'atleta'`, poi `role: 'athlete'` se fallisce (compatibilità con enum database)
- **Rollback Automatico**: Se creazione profilo fallisce, elimina automaticamente l'utente creato in Auth per evitare orfani
- **Validazione**: Usa Zod schema inline per validazione request body
- **Error Handling**: Try/catch globale cattura tutti gli errori non gestiti
- **Password**: Password minima 6 caratteri (validazione Zod)

---

## 📝 Changelog

### 2025-02-03

- ✅ Route documentata completamente
- ✅ Aggiunta sezione POST /api/athletes/create
- ✅ Documentazione rollback e gestione errori

---

# PUT /api/athletes/[id]

**Percorso**: `src/app/api/athletes/[id]/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Component, Server Action)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-01-29T15:30:00Z

## 📋 Panoramica

API route Next.js per aggiornamento profilo atleta. Gestisce autenticazione, autorizzazione, validazione input, e update database con gestione errori robusta.
