# 📚 Documentazione Tecnica: useSupabase

**Percorso**: `src/hooks/use-supabase.ts`  
**Tipo Modulo**: React Hook (Supabase Hook, Client Component)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

Hook base per accesso Supabase client e stato autenticazione. Fornisce user corrente, loading state, e client Supabase.

---

## 🔧 Funzioni e Export

### 1. `useSupabase`

**Classificazione**: React Hook, Supabase Hook, Client Component, Side-Effecting  
**Tipo**: `() => { user: User | null, loading: boolean, supabase: SupabaseClient }`

**Parametri**: Nessuno

**Output**: Oggetto con:

- `user`: `User | null` - Utente autenticato corrente
- `loading`: `boolean` - Stato caricamento sessione iniziale
- `supabase`: `SupabaseClient` - Client Supabase

**Descrizione**: Hook base per Supabase con:

- Fetch sessione iniziale al mount
- Sottoscrizione `onAuthStateChange` per aggiornamenti real-time
- Cleanup automatico subscription al unmount
- Loading state durante fetch iniziale

---

## 🔄 Flusso Logico

### Inizializzazione

1. **Fetch Sessione Iniziale**:
   - Chiama `supabase.auth.getSession()`
   - Imposta `user = session?.user ?? null`
   - Imposta `loading = false`

2. **Sottoscrizione Auth State**:
   - Sottoscrive `supabase.auth.onAuthStateChange((event, session) => { setUser(session?.user ?? null); setLoading(false) })`
   - Cleanup: unsubscribe al unmount

---

## 📊 Dipendenze

**Dipende da**: React (`useEffect`, `useState`), `supabase` (client), tipo `User`

**Utilizzato da**: Tutti gli hooks che necessitano Supabase client o user

---

## ⚠️ Note Tecniche

- **Singleton Client**: Usa `supabase` client singleton (non crea nuovo client)
- **Auth State Sync**: Sincronizza automaticamente con cambiamenti auth (login/logout)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
