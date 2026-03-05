# 📚 Documentazione Tecnica: API Admin Users

**Percorso**: `src/app/api/admin/users/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per gestione utenti admin. Fornisce GET (lista), POST (crea), PUT (aggiorna), DELETE (elimina) con gestione completa di auth.users e profiles.

---

## 🔧 Endpoints

### 1. `GET /api/admin/users`

**Classificazione**: API Route, GET Handler, Admin Only  
**Autenticazione**: Richiesta (session)  
**Autorizzazione**: Solo ruolo `admin`

**Query Parameters**: Nessuno

**Response Success** (200):

```typescript
{
  users: Array<Profile> // tutti i profili ordinati per created_at DESC
}
```

**Response Error**:

- `401`: Non autenticato
- `403`: Non autorizzato (non admin)
- `500`: Errore server

**Descrizione**: Endpoint lista utenti con:

- **Fetch Profili**: Tutti i profili ordinati per `created_at` DESC

### 2. `POST /api/admin/users`

**Classificazione**: API Route, POST Handler, Admin Only  
**Autenticazione**: Richiesta (session)  
**Autorizzazione**: Solo ruolo `admin`

**Request Body**:

```typescript
{
  email: string // email valida
  password: string // min 6 caratteri
  nome?: string
  cognome?: string
  phone?: string
  role: 'admin' | 'pt' | 'trainer' | 'atleta' | 'athlete'
  stato?: 'attivo' | 'inattivo' | 'sospeso' // default: 'attivo'
}
```

**Validation**: Zod schema `createUserSchema`

**Response Success** (200):

```typescript
{
  user: Profile
}
```

**Response Error**:

- `400`: Dati non validi (validation error)
- `401`: Non autenticato
- `403`: Non autorizzato (non admin)
- `409`: Email già registrata
- `500`: Errore server

**Descrizione**: Endpoint creazione utente con:

- **Validazione**: Zod schema per tutti i campi
- **Service Role Client**: Usa `SUPABASE_SERVICE_ROLE_KEY` per creare utente
- **Creazione Auth**: Crea utente in `auth.users` con `email_confirm: true`
- **Creazione Profilo**: Crea profilo in `profiles`
- **Rollback**: Se profilo fallisce, elimina anche utente auth

### 3. `PUT /api/admin/users`

**Classificazione**: API Route, PUT Handler, Admin Only  
**Autenticazione**: Richiesta (session)  
**Autorizzazione**: Solo ruolo `admin`

**Request Body**:

```typescript
{
  userId: string // ID profilo (obbligatorio)
  email?: string // email valida
  password?: string // min 6 caratteri
  nome?: string
  cognome?: string
  phone?: string
  role?: 'admin' | 'pt' | 'trainer' | 'atleta' | 'athlete'
  stato?: 'attivo' | 'inattivo' | 'sospeso'
}
```

**Validation**: Zod schema `updateUserSchema` (tutti i campi opzionali)

**Response Success** (200):

```typescript
{
  user: Profile
}
```

**Response Error**:

- `400`: Dati non validi o userId mancante
- `401`: Non autenticato
- `403`: Non autorizzato (non admin)
- `404`: Utente non trovato
- `500`: Errore server

**Descrizione**: Endpoint aggiornamento utente con:

- **Validazione**: Zod schema (tutti i campi opzionali)
- **Service Role Client**: Usa `SUPABASE_SERVICE_ROLE_KEY` per aggiornare
- **Update Profilo**: Aggiorna campi profilo forniti
- **Update Auth**: Se email o password cambiate, aggiorna anche `auth.users`
- **Partial Update**: Aggiorna solo campi forniti

### 4. `DELETE /api/admin/users`

**Classificazione**: API Route, DELETE Handler, Admin Only  
**Autenticazione**: Richiesta (session)  
**Autorizzazione**: Solo ruolo `admin`

**Query Parameters**:

- `userId`: `string` - ID profilo (obbligatorio)

**Response Success** (200):

```typescript
{
  success: true
}
```

**Response Error**:

- `400`: userId mancante
- `401`: Non autenticato
- `403`: Non autorizzato (non admin)
- `404`: Utente non trovato
- `500`: Errore server

**Descrizione**: Endpoint eliminazione utente con:

- **Service Role Client**: Usa `SUPABASE_SERVICE_ROLE_KEY` per eliminare
- **Cascade Delete**: Elimina da `auth.users` (cascade elimina anche profilo)

---

## 🔄 Flusso Logico

### POST /api/admin/users

1. **Autenticazione e Autorizzazione**
2. **Validazione**: Zod schema
3. **Service Role Client**: Crea client con service role key
4. **Creazione Auth**: `supabaseAdmin.auth.admin.createUser()`
   - Email confermata automaticamente
   - User metadata con nome/cognome
5. **Creazione Profilo**: `supabaseAdmin.from('profiles').insert()`
6. **Rollback**: Se profilo fallisce, elimina utente auth

### PUT /api/admin/users

1. **Autenticazione e Autorizzazione**
2. **Validazione**: Zod schema (campi opzionali)
3. **Fetch Profilo Esistente**: Verifica esistenza
4. **Service Role Client**: Crea client con service role key
5. **Update Profilo**: Aggiorna campi forniti
6. **Update Auth**: Se email/password cambiate, aggiorna `auth.users`

### DELETE /api/admin/users

1. **Autenticazione e Autorizzazione**
2. **Fetch Profilo**: Ottiene `user_id` da profilo
3. **Service Role Client**: Crea client con service role key
4. **Delete Auth**: `supabaseAdmin.auth.admin.deleteUser()` (cascade elimina profilo)

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Zod (`z`), Supabase Server Client (`createServerClient`), Supabase Client (`createClient`), tipo `Database`

**Utilizzato da**: Componente `AdminUsersContent`

---

## ⚠️ Note Tecniche

- **Service Role Key**: Usa `SUPABASE_SERVICE_ROLE_KEY` per operazioni admin (creazione/aggiornamento/eliminazione utenti)
- **Email Confirm**: Nuovi utenti creati con `email_confirm: true` (non richiedono conferma)
- **Rollback**: POST gestisce rollback se creazione profilo fallisce
- **Cascade Delete**: DELETE elimina da `auth.users` (cascade elimina profilo automaticamente)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
