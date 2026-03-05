# 📚 Documentazione Tecnica: useAuth Hook

**Percorso**: `src/hooks/use-auth.ts`  
**Tipo Modulo**: React Hook (Custom Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-01-29T14:45:00Z

---

## 📋 Panoramica

Hook React per gestione autenticazione utente. Fornisce stato utente, funzioni di login/logout/reset password, e gestione sessione Supabase.

---

## 🔧 Funzione Principale

### `useAuth`

**Classificazione**: React Hook, Client Component, Side-Effecting, Async  
**Tipo**: `() => UseAuthReturn`

**Output**:

```typescript
{
  user: ProfileRow | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}
```

**Descrizione**: Hook per gestione completa autenticazione: stato utente, login, logout, reset password.

---

## 📥 Parametri

Nessun parametro (hook senza dipendenze esterne)

---

## 📤 Output

### `user`

- **Tipo**: `ProfileRow | null`
- **Significato**: Profilo utente corrente o `null` se non autenticato
- **Aggiornamento**: Automatico su cambiamenti sessione Supabase

### `loading`

- **Tipo**: `boolean`
- **Significato**: Stato di caricamento iniziale sessione
- **Valore iniziale**: `true`
- **Aggiornamento**: `false` dopo caricamento sessione

### `error`

- **Tipo**: `string | null`
- **Significato**: Messaggio errore se presente
- **Aggiornamento**: Impostato su errori durante operazioni auth

### `signIn`

- **Tipo**: `(email: string, password: string) => Promise<{ success: boolean; error?: string }>`
- **Significato**: Funzione per login utente
- **Side-effects**:
  - Chiama `supabase.auth.signInWithPassword()`
  - Carica profilo utente da database
  - Naviga a `/dashboard` (admin/trainer) o `/home` (athlete)
  - Aggiorna stato `user`, `loading`, `error`

### `signOut`

- **Tipo**: `() => Promise<{ success: boolean; error?: string }>`
- **Significato**: Funzione per logout utente
- **Side-effects**:
  - Chiama `supabase.auth.signOut()`
  - Resetta stato `user` a `null`
  - Naviga a `/login`

### `resetPassword`

- **Tipo**: `(email: string) => Promise<{ success: boolean; error?: string }>`
- **Significato**: Funzione per reset password via email
- **Side-effects**:
  - Chiama `supabase.auth.resetPasswordForEmail()`
  - Invia email reset con link redirect

---

## 🔄 Flusso Logico

### Inizializzazione (useEffect)

1. Crea ref `isMountedRef` per gestire cleanup
2. Funzione `populateProfile(userId)`:
   - Query `profiles` table con `user_id = userId`
   - Se errore → imposta `error = 'Profilo non trovato'`
   - Se successo → imposta `user = profile`
3. Funzione `getSession()`:
   - Chiama `supabase.auth.getSession()`
   - Se sessione valida → chiama `populateProfile(session.user.id)`
   - Gestisce errori e imposta `loading = false`
4. Listener `onAuthStateChange`:
   - `SIGNED_OUT` o `!session` → `user = null`, `error = null`
   - `session?.user` → chiama `populateProfile(session.user.id)`
   - Imposta sempre `loading = false`
5. Cleanup: unsubscribe listener

### `signIn(email, password)`

1. Imposta `loading = true`, `error = null`
2. Chiama `supabase.auth.signInWithPassword({ email, password })`
3. Se errore → imposta `error`, ritorna `{ success: false, error }`
4. Se successo:
   - Query profilo da `profiles` table
   - Se profilo non trovato → errore
   - Se profilo trovato:
     - Imposta `user = profile`
     - Normalizza ruolo con `normaliseRole()`
     - Naviga: `admin/trainer` → `/dashboard`, `athlete` → `/home`
     - Ritorna `{ success: true }`
5. Finally: `loading = false`

### `signOut()`

1. Imposta `loading = true`, `error = null`
2. Chiama `supabase.auth.signOut()`
3. Se errore → imposta `error`, ritorna `{ success: false, error }`
4. Se successo:
   - Imposta `user = null`
   - Naviga a `/login`
   - Ritorna `{ success: true }`
5. Finally: `loading = false`

### `resetPassword(email)`

1. Imposta `loading = true`, `error = null`
2. Chiama `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
3. Se errore → imposta `error`, ritorna `{ success: false, error }`
4. Se successo → ritorna `{ success: true }`
5. Finally: `loading = false`

---

## ⚠️ Errori Possibili

1. **Errore sessione**: `sessionError.message` → imposta `error`
2. **Profilo non trovato**: `'Profilo non trovato'` → imposta `error`
3. **Errore login**: `error.message` da Supabase → ritorna `{ success: false, error }`
4. **Errore logout**: `error.message` da Supabase → ritorna `{ success: false, error }`
5. **Errore reset password**: `error.message` da Supabase → ritorna `{ success: false, error }`

**Gestione**: Tutti gli errori sono catturati e gestiti gracefully, nessuna eccezione non gestita.

---

## 🔗 Dipendenze Critiche

1. **Supabase Client** (`@/lib/supabase/client`):
   - `createClient()` - creazione client Supabase
   - `supabase.auth.getSession()` - recupero sessione
   - `supabase.auth.signInWithPassword()` - login
   - `supabase.auth.signOut()` - logout
   - `supabase.auth.resetPasswordForEmail()` - reset password
   - `supabase.auth.onAuthStateChange()` - listener cambiamenti auth
   - `supabase.from('profiles')` - query profilo

2. **Next.js Router** (`next/navigation`):
   - `useRouter()` - navigazione programmatica

3. **React Hooks**:
   - `useState` - stato locale
   - `useEffect` - effetti collaterali
   - `useRef` - ref per cleanup

---

## 🎯 Utilizzo

**Esempio Base**:

```typescript
'use client'
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const { user, loading, error, signIn, signOut } = useAuth()

  const handleLogin = async () => {
    const result = await signIn('user@example.com', 'password')
    if (result.success) {
      // Navigazione automatica
    } else {
      // Mostra errore: result.error
    }
  }

  if (loading) return <div>Caricamento...</div>
  if (error) return <div>Errore: {error}</div>
  if (user) return <div>Benvenuto {user.nome}</div>

  return <button onClick={handleLogin}>Login</button>
}
```

**Utilizzato da**:

- `src/app/login/page.tsx` - pagina login
- `src/components/auth/login-form.tsx` - form login
- Componenti che richiedono autenticazione

---

## 🔄 Side-Effects

1. **Query Database**: Query `profiles` table su inizializzazione e cambiamenti auth
2. **Navigazione**: Redirect automatico dopo login (`/dashboard` o `/home`)
3. **State Updates**: Aggiornamento stato React (`user`, `loading`, `error`)
4. **Supabase Listeners**: Sottoscrizione `onAuthStateChange` (cleanup automatico)

---

## 📝 Changelog

### 2025-01-29

- ✅ Hook completo e funzionante
- ✅ Gestione errori robusta
- ✅ Normalizzazione ruolo con `normaliseRole()`
- ✅ Cleanup listener automatico

---

**Ultimo aggiornamento**: 2025-01-29T14:45:00Z
