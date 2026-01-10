# 📚 Documentazione Tecnica: createClient (Supabase)

**Percorso**: `src/lib/supabase/client.ts`  
**Tipo Modulo**: Factory Function, Client Utility  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-01-29T15:00:00Z

---

## 📋 Panoramica

Factory function per creazione client Supabase browser-side. Gestisce configurazione environment variables, fallback a mock client per sviluppo, e utility per gestione contesto autenticazione.

---

## 🔧 Funzioni e Export

### 1. `createMockClient`

**Classificazione**: Factory Function, Pure Function (no side-effects diretti)  
**Tipo**: `() => SupabaseClient`

**Output**: Mock Supabase client per sviluppo quando Supabase non è configurato

**Descrizione**: Crea mock client con metodi stub che ritornano errori "Supabase not configured".

**Flusso Logico**:

1. Ritorna oggetto mock che implementa interfaccia `SupabaseClient`
2. Tutti i metodi (`auth.getSession`, `from().select()`, ecc.) ritornano errori mock
3. Utilizzato quando environment variables non sono configurate

**Utilizzato da**: `createClient()` come fallback

---

### 2. `createClient`

**Classificazione**: Factory Function, Pure Function (no side-effects)  
**Tipo**: `() => SupabaseClient<Database>`

**Output**: Supabase client browser-side tipizzato con `Database`

**Descrizione**: Crea client Supabase browser-side con validazione environment variables e fallback a mock.

**Flusso Logico**:

1. Legge `process.env.NEXT_PUBLIC_SUPABASE_URL`
2. Legge `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Verifica se variabili sono configurate:
   - Se `!url` o `!key` → usa mock client
   - Se `url` contiene valori mock/bypass → usa mock client
   - Se `url` non contiene `.supabase.co` → usa mock client
   - Se `url` contiene `your_supabase` o `your-project` → usa mock client
4. Se tutte le verifiche passano:
   - Chiama `createBrowserClient<Database>(url, key)`
   - Ritorna client Supabase reale
5. Se fallisce verifiche:
   - Log warning in console
   - Ritorna mock client

**Side-effects**:

- Console warning se Supabase non configurato
- Nessun altro side-effect (funzione pura)

**Errori Possibili**: Nessuno (gestisce tutti i casi con fallback)

---

### 3. `supabase` (Export Default)

**Classificazione**: Singleton Instance  
**Tipo**: `SupabaseClient<Database>`

**Descrizione**: Istanza singleton del client Supabase creata al module load.

**Utilizzato da**: Tutti i moduli che importano `@/lib/supabase/client`

---

### 4. `setSupabaseContext`

**Classificazione**: Async Function, Side-Effecting  
**Tipo**: `(role: UserRole, org_id: string) => Promise<void>`

**Parametri**:

- `role` (UserRole): Ruolo utente (`admin`, `trainer`, `athlete`)
- `org_id` (string): ID organizzazione

**Output**: `Promise<void>`

**Descrizione**: Imposta contesto Supabase (ruolo e organizzazione) tramite API route per sincronizzazione con backend.

**Flusso Logico**:

1. Recupera sessione corrente con `supabase.auth.getSession()`
2. Estrae `access_token` dalla sessione
3. Se `!access_token` → log warning e return
4. Chiama `POST /api/auth/context` con headers:
   - `Authorization: Bearer ${access_token}`
   - `x-user-role: ${role}`
   - `x-org-id: ${org_id}`
5. Se `!response.ok` → log warning
6. Gestisce errori con try/catch

**Side-effects**:

- HTTP request a `/api/auth/context`
- Console warnings su errori

**Utilizzato da**: Componenti che devono sincronizzare contesto dopo login

---

### 5. `getSupabaseContext`

**Classificazione**: Async Function, Pure Function (no side-effects)  
**Tipo**: `() => Promise<{ role: UserRole | null; org_id: string | null }>`

**Output**: Oggetto con `role` e `org_id` estratti dal JWT token

**Descrizione**: Estrae contesto utente (ruolo e organizzazione) dal JWT token corrente.

**Flusso Logico**:

1. Recupera sessione corrente con `supabase.auth.getSession()`
2. Se `!session?.access_token` → ritorna `{ role: null, org_id: null }`
3. Decodifica JWT:
   - Split token per `.` → `[header, payload, signature]`
   - Decodifica `payload` con `atob(payload)`
   - Parse JSON del payload
4. Estrae `role` e `org_id` dal payload
5. Ritorna `{ role, org_id }` o `null` se non presenti
6. Gestisce errori di decodifica con try/catch → ritorna `{ role: null, org_id: null }`

**Side-effects**: Nessuno (funzione pura)

**Errori Possibili**:

- JWT malformato → catch error, ritorna `{ role: null, org_id: null }`

**Utilizzato da**: Utility per verificare permessi utente

---

### 6. `checkResourceAccess`

**Classificazione**: Async Function, Pure Function (no side-effects)  
**Tipo**: `(resourceOrgId: string, requiredRole?: UserRole) => Promise<boolean>`

**Parametri**:

- `resourceOrgId` (string): ID organizzazione della risorsa
- `requiredRole` (UserRole, opzionale, default: `'athlete'`): Ruolo minimo richiesto

**Output**: `Promise<boolean>` - `true` se utente ha accesso, `false` altrimenti

**Descrizione**: Verifica se utente corrente ha permessi per accedere a una risorsa (stessa organizzazione + ruolo sufficiente).

**Flusso Logico**:

1. Chiama `getSupabaseContext()` per ottenere `role` e `org_id` utente
2. Se `!role` o `!org_id` → ritorna `false`
3. Verifica organizzazione:
   - Se `org_id !== resourceOrgId` → ritorna `false`
4. Verifica gerarchia ruoli:
   - Definisce gerarchia: `athlete: 1`, `trainer: 2`, `admin: 3`
   - Se `roleHierarchy[role] >= roleHierarchy[requiredRole]` → ritorna `true`
   - Altrimenti → ritorna `false`

**Side-effects**: Nessuno (funzione pura)

**Utilizzato da**: Componenti che devono verificare permessi prima di mostrare/aggiornare risorse

---

## 📥 Parametri Input

### `createClient`

Nessun parametro

### `setSupabaseContext`

- `role`: `UserRole` - ruolo utente
- `org_id`: `string` - ID organizzazione

### `getSupabaseContext`

Nessun parametro

### `checkResourceAccess`

- `resourceOrgId`: `string` - ID organizzazione risorsa
- `requiredRole`: `UserRole` (opzionale, default: `'athlete'`) - ruolo minimo richiesto

---

## 📤 Output

### `createClient`

- `SupabaseClient<Database>` - client Supabase tipizzato

### `setSupabaseContext`

- `Promise<void>` - nessun valore di ritorno

### `getSupabaseContext`

- `Promise<{ role: UserRole | null; org_id: string | null }>`

### `checkResourceAccess`

- `Promise<boolean>` - `true` se accesso consentito

---

## ⚠️ Errori Possibili

1. **Supabase non configurato**:
   - Fallback automatico a mock client
   - Warning in console

2. **JWT malformato** (in `getSupabaseContext`):
   - Catch error, ritorna `{ role: null, org_id: null }`
   - Warning in console

3. **Errore API context** (in `setSupabaseContext`):
   - Warning in console
   - Nessuna eccezione lanciata

**Gestione**: Tutti gli errori sono gestiti gracefully con fallback e logging.

---

## 🔗 Dipendenze Critiche

1. **Supabase SSR** (`@supabase/ssr`):
   - `createBrowserClient` - factory client browser

2. **Supabase JS** (`@supabase/supabase-js`):
   - `SupabaseClient` - tipo client
   - `Database` - tipo database

3. **Types**:
   - `UserRole` da `@/types/user`
   - `Database` da `@/types/supabase`

4. **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` - URL progetto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - anon key Supabase

---

## 🎯 Utilizzo

**Esempio Base - Creazione Client**:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Usa client per query
const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
```

**Esempio - Singleton Export**:

```typescript
import { supabase } from '@/lib/supabase/client'

// Usa direttamente istanza singleton
const { data } = await supabase.from('profiles').select('*')
```

**Esempio - Verifica Accesso**:

```typescript
import { checkResourceAccess } from '@/lib/supabase/client'

const hasAccess = await checkResourceAccess(athleteOrgId, 'trainer')
if (!hasAccess) {
  return <div>Accesso negato</div>
}
```

**Esempio - Imposta Contesto**:

```typescript
import { setSupabaseContext } from '@/lib/supabase/client'

await setSupabaseContext('trainer', orgId)
```

**Utilizzato da**:

- Tutti gli hook che usano Supabase
- Tutti i componenti che fanno query database
- Utility di autenticazione

---

## 🔄 Side-Effects

1. **Console Logging**: Warning se Supabase non configurato
2. **HTTP Requests**: `setSupabaseContext` fa request a `/api/auth/context`
3. **Singleton Creation**: Istanza `supabase` creata al module load

---

## 📝 Changelog

### 2025-01-29

- ✅ Factory function completa e funzionante
- ✅ Fallback a mock client per sviluppo
- ✅ Validazione environment variables robusta
- ✅ Utility per gestione contesto autenticazione
- ✅ Verifica permessi con `checkResourceAccess`

---

**Ultimo aggiornamento**: 2025-01-29T15:00:00Z
