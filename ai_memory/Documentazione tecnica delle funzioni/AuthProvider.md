# 📚 Documentazione Tecnica: AuthProvider

**Percorso**: `src/providers/auth-provider.tsx`  
**Tipo Modulo**: React Context Provider (Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-01-29T14:45:00Z

---

## 📋 Panoramica

Context Provider React per gestione stato autenticazione globale. Fornisce contesto autenticazione a tutti i componenti dell'applicazione tramite React Context API.

---

## 🔧 Componenti e Funzioni

### 1. `AuthProvider`

**Classificazione**: React Context Provider, Client Component, Side-Effecting, Async  
**Tipo**: `({ children }: { children: React.ReactNode }) => JSX.Element`

**Parametri**:

- `children` (React.ReactNode): Componenti figli da wrappare

**Output**: JSX.Element (Context Provider)

**Descrizione**: Provider che gestisce stato autenticazione globale e lo espone tramite Context.

---

### 2. `useAuth`

**Classificazione**: React Hook (Context Consumer)  
**Tipo**: `() => AuthContextType`

**Output**:

```typescript
{
  user: UserProfile | null
  role: UserRole | null
  org_id: string | null
  loading: boolean
}
```

**Descrizione**: Hook per accedere al contesto autenticazione. Deve essere usato dentro `AuthProvider`.

**Errori**: Lancia errore se usato fuori da `AuthProvider`

---

### 3. `serializeError`

**Classificazione**: Pure Function, Helper  
**Tipo**: `(err: unknown) => Record<string, unknown>`

**Parametri**:

- `err` (unknown): Errore da serializzare

**Output**: Oggetto serializzato con proprietà errore

**Descrizione**: Serializza errore in modo robusto, catturando tutte le proprietà (anche non enumerabili).

**Flusso Logico**:

1. Se `err instanceof Error` → estrae `message`, `name`, `stack` + proprietà custom
2. Se `err` è oggetto → estrae proprietà comuni (`message`, `code`, `details`, `hint`, ecc.)
3. Prova a serializzare con `JSON.stringify()`
4. Se fallisce → usa `String(err)`
5. Ritorna oggetto serializzato

**Utilizzato da**: Gestione errori in `AuthProvider`

---

### 4. `mapRole`

**Classificazione**: Pure Function, Helper  
**Tipo**: `(rawRole: string | null | undefined) => UserRole | null`

**Parametri**:

- `rawRole` (string | null | undefined): Ruolo raw da mappare

**Output**: Ruolo normalizzato o `null`

**Descrizione**: Mappa ruolo raw da database a tipo `UserRole`.

**Flusso Logico**:

1. Se `rawRole` è null/undefined → ritorna `null`
2. Normalizza: `pt` → `trainer`, `atleta` → `athlete`
3. Mappa legacy: `owner` → `admin`, `staff` → `trainer`
4. Valida: deve essere `trainer`, `admin`, o `athlete`
5. Ritorna ruolo normalizzato o `null`

**Utilizzato da**: `mapProfileToUser()`

---

### 5. `mapProfileToUser`

**Classificazione**: Pure Function, Helper  
**Tipo**: `(profile: ProfileRow) => UserProfile`

**Parametri**:

- `profile` (ProfileRow): Profilo raw da database

**Output**: `UserProfile` normalizzato

**Descrizione**: Mappa profilo raw da database a tipo `UserProfile` con supporto legacy fields.

**Flusso Logico**:

1. Estrae `first_name`/`last_name` da `profile.nome`/`profile.cognome` o legacy fields
2. Mappa ruolo con `mapRole()`
3. Costruisce `full_name` da `first_name` + `last_name`
4. Estrae `avatar_url` da `profile.avatar` o `profile.avatar_url`
5. Ritorna oggetto `UserProfile` completo

**Utilizzato da**: `AuthProvider` per mappare profilo dopo query

---

## 🔄 Flusso Logico AuthProvider

### Inizializzazione (useEffect)

1. Crea flag `isMounted` per cleanup
2. Funzione `loadUser()`:
   - Chiama `supabase.auth.getSession()`
   - Se errore sessione → log errore, reset stato, return
   - Se `!session?.user` → reset stato, return
   - Query `profiles` table con `user_id = session.user.id`
   - Se errore query:
     - Log dettagliato errore (con `serializeError()`)
     - Gestione specifica per `PGRST116` (profilo non trovato)
     - Reset stato, throw error
   - Se profilo trovato:
     - Mappa profilo con `mapProfileToUser()`
     - Imposta `user`, `role`, `orgId`
   - Finally: `loading = false`
3. Listener `onAuthStateChange`:
   - Se `session?.user`:
     - Query profilo
     - Se errore → log warning, reset stato
     - Se successo → mappa e imposta stato
   - Se `!session` → reset stato
   - Imposta sempre `loading = false`
4. Cleanup: `isMounted = false`, unsubscribe listener

### Context Value (useMemo)

- Memoizza valore contesto con `user`, `role`, `org_id`, `loading`
- Aggiorna solo se dipendenze cambiano

---

## 📤 Output Context

### `user`

- **Tipo**: `UserProfile | null`
- **Significato**: Profilo utente corrente normalizzato

### `role`

- **Tipo**: `UserRole | null`
- **Significato**: Ruolo utente (`admin`, `trainer`, `athlete`)

### `org_id`

- **Tipo**: `string | null`
- **Significato**: ID organizzazione utente

### `loading`

- **Tipo**: `boolean`
- **Significato**: Stato caricamento iniziale

---

## ⚠️ Errori Possibili

1. **Errore sessione**: Log errore, reset stato
2. **Profilo non trovato (PGRST116)**:
   - Log warning specifico
   - Suggerimento: verificare trigger `handle_new_user()`
   - Reset stato
3. **Errore query profilo**:
   - Log dettagliato con `serializeError()`
   - Reset stato
4. **useAuth fuori da Provider**:
   - Lancia errore: `"useAuth must be used within an AuthProvider"`

**Gestione**: Tutti gli errori sono loggati dettagliatamente e gestiti gracefully.

---

## 🔗 Dipendenze Critiche

1. **Supabase Client** (`@/lib/supabase/client`):
   - `supabase` - client Supabase
   - `supabase.auth.getSession()` - recupero sessione
   - `supabase.auth.onAuthStateChange()` - listener auth
   - `supabase.from('profiles')` - query profilo

2. **React Context API**:
   - `createContext` - creazione contesto
   - `useContext` - consumo contesto
   - `useState` - stato locale
   - `useEffect` - effetti collaterali
   - `useMemo` - memoizzazione valore contesto

3. **Types**:
   - `AuthContextType` da `@/types/user`
   - `UserProfile` da `@/types/user`
   - `UserRole` da `@/types/user`
   - `Tables<'profiles'>` da `@/types/supabase`

---

## 🎯 Utilizzo

**Setup Provider** (in `app/layout.tsx`):

```typescript
import { AuthProvider } from '@/providers/auth-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

**Utilizzo Hook** (in componenti):

```typescript
'use client'
import { useAuth } from '@/providers/auth-provider'

export default function Dashboard() {
  const { user, role, org_id, loading } = useAuth()

  if (loading) return <div>Caricamento...</div>
  if (!user) return <div>Non autenticato</div>

  return <div>Benvenuto {user.full_name}</div>
}
```

**Utilizzato da**: Tutti i componenti che richiedono autenticazione, layout dashboard/home

---

## 🔄 Side-Effects

1. **Query Database**: Query `profiles` table su inizializzazione e cambiamenti auth
2. **State Updates**: Aggiornamento stato React (`user`, `role`, `orgId`, `loading`)
3. **Supabase Listeners**: Sottoscrizione `onAuthStateChange` (cleanup automatico)
4. **Console Logging**: Log dettagliato errori per debugging

---

## 📝 Changelog

### 2025-01-29

- ✅ Provider completo e funzionante
- ✅ Gestione errori robusta con `serializeError()`
- ✅ Supporto legacy fields (`first_name`/`last_name`)
- ✅ Log dettagliato per debugging
- ✅ Cleanup listener automatico

---

**Ultimo aggiornamento**: 2025-01-29T14:45:00Z
