# 📊 Analisi Statica - Query a `profiles`

**Data analisi:** ${new Date().toISOString()}
**Tipo:** Analisi statica del codice (non test runtime)

---

## 🎯 Obiettivo

Identificare tutte le query potenziali a `profiles` per ogni scenario (A/B/C) e verificare condizioni che le evitano (cache, singleflight, useAuth).

---

## 📍 Punti Critici Identificati

### 1. **Server Components (SSR)**
Queste query **NON possono essere eliminate** perché i server components non hanno accesso al client context (`AuthProvider`):

| File | Query | Select | Condizione | Cache |
|------|-------|--------|------------|-------|
| `src/app/post-login/page.tsx` | `profiles` | `role` | Sempre (redirect basato su ruolo) | ❌ No (server-side) |
| `src/app/dashboard/page.tsx` | `profiles` | `id` | Sempre (server component SSR) | ❌ No (server-side) |
| `src/app/dashboard/admin/page.tsx` | `profiles` | `role` | Solo admin (verifica ruolo) | ❌ No (server-side) |

### 2. **Client Components (AuthProvider)**
Query gestite con cache TTL 30s + singleflight:

| File | Query | Select | Condizione | Cache | Singleflight |
|------|-------|--------|------------|-------|--------------|
| `src/providers/auth-provider.tsx` | `profiles` | `id, user_id, role, org_id, email, nome, cognome, avatar, avatar_url, created_at, updated_at, first_name, last_name, phone` | Bootstrap OPPURE INITIAL_SESSION (previene duplicati con singleflight) | ✅ TTL 30s | ✅ Sì |

### 3. **Client Hooks (Ottimizzate)**
Query evitabili se `AuthProvider` ha già caricato il profilo:

| File | Query | Select | Condizione | Ottimizzazione |
|------|-------|--------|------------|----------------|
| `src/lib/utils/profile-id-utils.ts` | `profiles` | `id` | Solo se `useAuth().user` non disponibile | ✅ Usa `useAuth()` prima di query |
| `src/app/dashboard/impostazioni/page.tsx` | `profiles` | `id, nome, cognome, email, phone, avatar, avatar_url` | Solo se `authUser` non disponibile (fallback) | ✅ Usa `authUser.phone` (aggiunto a UserProfile) |

### 4. **Client Hooks (Potenziale Doppia Query)**
Query che potrebbero fare 1-2 lookup:

| File | Query | Select | Condizione | Cache |
|------|-------|--------|------------|-------|
| `src/hooks/use-appointments.ts` | `profiles` | `id` | 2 query se `userId` non è `profile.id` (prima verifica `id`, poi `user_id`) | ✅ Map cache (per hook) |

---

## 🔐 SCENARIO A — Login Completo

### Flusso Esecuzione

```
1. /login → Form login
   ↓
2. /post-login (Server Component)
   → Query: profiles.select('role').eq('user_id', userId).single()
   → Endpoint: /rest/v1/profiles?user_id=eq.{userId}&select=role
   → ✅ NECESSARIA (server-side redirect basato su ruolo)
   ↓
3. Redirect a /dashboard (trainer/admin) o /home (athlete)
   ↓
4. AuthProvider (Client Component) - Bootstrap
   → Condizione: getSession() → session esiste
   → Query: profiles.select('id,user_id,role,...phone').eq('user_id', userId).single()
   → Endpoint: /rest/v1/profiles?user_id=eq.{userId}&select=id,user_id,role,...
   → ✅ NECESSARIA (client context, cache TTL 30s)
   → ⚠️ SINGLEFLIGHT previene duplicati se anche INITIAL_SESSION triggera
   ↓
5. AuthProvider (Client Component) - onAuthStateChange INITIAL_SESSION
   → Condizione: event === 'INITIAL_SESSION' && !initialSessionHandledRef.current
   → Query: stessa di bootstrap (condivisa via singleflight)
   → Endpoint: stesso di bootstrap
   → ⚠️ SINGLEFLIGHT: se bootstrap già in corso, ritorna Promise esistente (NO query duplicata)
   ↓
6. /dashboard/page.tsx (Server Component) - SOLO trainer/admin
   → Query: profiles.select('id').eq('user_id', userId).single()
   → Endpoint: /rest/v1/profiles?user_id=eq.{userId}&select=id
   → ✅ NECESSARIA (SSR, non può usare AuthProvider)
   → ⚠️ DUPLICATA MA ACCETTABILE (server vs client context)
   ↓
7. /dashboard/admin/page.tsx (Server Component) - SOLO admin
   → Query: profiles.select('role').eq('user_id', userId).single()
   → Endpoint: /rest/v1/profiles?user_id=eq.{userId}&select=role
   → ✅ NECESSARIA (SSR verifica ruolo admin)
   → ⚠️ DUPLICATA MA ACCETTABILE (server vs client context)
   ↓
8. Componenti Client che usano useProfileId (opzionale, se presenti)
   → Condizione: useAuth().user?.id non disponibile (raro, dopo ottimizzazione)
   → Query: profiles.select('id').eq('user_id', userId).maybeSingle()
   → Endpoint: /rest/v1/profiles?user_id=eq.{userId}&select=id
   → ⚠️ OTTIMIZZATA: usa useAuth() prima, evita query se profilo disponibile
   ↓
9. Componenti Client che usano useAppointments.getProfileId (opzionale, se presenti)
   → Condizione: useAppointments() montato con userId
   → Query 1: profiles.select('id').eq('id', userId).maybeSingle() (verifica se userId è già profile.id)
   → Query 2: profiles.select('id').eq('user_id', userId).maybeSingle() (se Query 1 fallisce)
   → Endpoint: /rest/v1/profiles?id=eq.{userId}&select=id (prima)
   → Endpoint: /rest/v1/profiles?user_id=eq.{userId}&select=id (se necessario)
   → ⚠️ POTENZIALE: può fare 1-2 query (cache Map previene duplicati nello stesso hook)
```

### 📊 Query Attese per Scenario A

| Ruolo | Query Server | Query Client AuthProvider | Query Server Dashboard | Query Server Admin | Query Client Hooks | **TOTALE** |
|-------|--------------|---------------------------|------------------------|--------------------|--------------------|-----------|
| **Trainer** | 1 (post-login) | 1 (bootstrap/INITIAL_SESSION) | 1 (dashboard/page SSR) | 0 | 0-2 (useProfileId/useAppointments) | **3-5** |
| **Admin** | 1 (post-login) | 1 (bootstrap/INITIAL_SESSION) | 1 (dashboard/page SSR) | 1 (dashboard/admin/page SSR) | 0-2 (useProfileId/useAppointments) | **4-6** |
| **Athlete** | 1 (post-login) | 1 (bootstrap/INITIAL_SESSION) | 0 | 0 | 0-2 (useProfileId/useAppointments) | **2-4** |

**Note:**
- `useProfileId` e `useAppointments` sono opzionali (solo se componenti che li usano sono montati)
- Singleflight previene query duplicate tra bootstrap e INITIAL_SESSION in `AuthProvider`
- Cache TTL 30s in `AuthProvider` previene query duplicate entro 30 secondi

---

## 🔄 SCENARIO B — Refresh Pagina

### Flusso Esecuzione

```
1. F5 su /dashboard o /home
   ↓
2. AuthProvider (Client Component) - Bootstrap
   → Condizione: getSession() → session esiste
   → Query: profiles.select('id,user_id,role,...phone').eq('user_id', userId).single()
   → Endpoint: /rest/v1/profiles?user_id=eq.{userId}&select=id,user_id,role,...
   → ⚠️ Cache TTL 30s potrebbe evitarla se refresh < 30s dopo login
   → ✅ NECESSARIA se cache scaduta (>30s)
   ↓
3. AuthProvider (Client Component) - onAuthStateChange INITIAL_SESSION
   → Condizione: event === 'INITIAL_SESSION' && !initialSessionHandledRef.current
   → Query: stessa di bootstrap (condivisa via singleflight)
   → ⚠️ SINGLEFLIGHT: se bootstrap già in corso, ritorna Promise esistente (NO query duplicata)
   → ⚠️ Cache TTL 30s potrebbe evitarla se refresh < 30s dopo login
   ↓
4. /dashboard/page.tsx (Server Component) - SOLO trainer/admin
   → Query: profiles.select('id').eq('user_id', userId).single()
   → Endpoint: /rest/v1/profiles?user_id=eq.{userId}&select=id
   → ✅ NECESSARIA (SSR, non può usare AuthProvider, sempre eseguita)
   → ⚠️ DUPLICATA MA ACCETTABILE (server vs client context)
   ↓
5. /dashboard/admin/page.tsx (Server Component) - SOLO admin
   → Query: profiles.select('role').eq('user_id', userId).single()
   → Endpoint: /rest/v1/profiles?user_id=eq.{userId}&select=role
   → ✅ NECESSARIA (SSR verifica ruolo admin, sempre eseguita)
   → ⚠️ DUPLICATA MA ACCETTABILE (server vs client context)
```

### 📊 Query Attese per Scenario B

| Ruolo | Query Client AuthProvider | Query Server Dashboard | Query Server Admin | **TOTALE** |
|-------|---------------------------|------------------------|--------------------|-----------|
| **Trainer** | 0-1 (0 se cache <30s, 1 se cache scaduta) | 1 (dashboard/page SSR sempre) | 0 | **1-2** |
| **Admin** | 0-1 (0 se cache <30s, 1 se cache scaduta) | 1 (dashboard/page SSR sempre) | 1 (dashboard/admin/page SSR sempre) | **2-3** |
| **Athlete** | 0-1 (0 se cache <30s, 1 se cache scaduta) | 0 | 0 | **0-1** |

**Note:**
- Cache TTL 30s in `AuthProvider` può evitare query client se refresh < 30s dopo login
- Server components (SSR) fanno sempre query (non hanno accesso a cache client)
- Singleflight previene query duplicate tra bootstrap e INITIAL_SESSION

---

## 🪟 SCENARIO C — Multi-Tab

### Flusso Esecuzione (Tab A e Tab B)

**Tab A:**
```
1. Login (se non autenticato)
   → Stesso flusso Scenario A
   → Query totali: 3-6 (come Scenario A)
   ↓
2. Navigazione a /dashboard o /home
   → Nessuna query extra (AuthProvider già caricato)
```

**Tab B:**
```
1. Vai direttamente su /dashboard o /home (stesso browser, non InPrivate)
   → Condizione: sessione condivisa tra tab (cookie)
   ↓
2. AuthProvider (Client Component) - Bootstrap (istanza separata)
   → Condizione: getSession() → session esiste (cookie condiviso)
   → Query: profiles.select('id,user_id,role,...phone').eq('user_id', userId).single()
   → Endpoint: /rest/v1/profiles?user_id=eq.{userId}&select=id,user_id,role,...
   → ✅ NECESSARIA (istanza AuthProvider separata per tab, cache useRef è per-tab)
   → ⚠️ Normale: ogni tab ha istanza separata di AuthProvider (cache non condivisa)
   ↓
3. AuthProvider (Client Component) - onAuthStateChange INITIAL_SESSION
   → Condizione: event === 'INITIAL_SESSION' && !initialSessionHandledRef.current
   → Query: stessa di bootstrap (condivisa via singleflight)
   → ⚠️ SINGLEFLIGHT: se bootstrap già in corso, ritorna Promise esistente (NO query duplicata)
   ↓
4. /dashboard/page.tsx (Server Component) - SOLO trainer/admin
   → Query: profiles.select('id').eq('user_id', userId).single()
   → Endpoint: /rest/v1/profiles?user_id=eq.{userId}&select=id
   → ✅ NECESSARIA (SSR, non può usare AuthProvider)
   ↓
5. /dashboard/admin/page.tsx (Server Component) - SOLO admin
   → Query: profiles.select('role').eq('user_id', userId).single()
   → Endpoint: /rest/v1/profiles?user_id=eq.{userId}&select=role
   → ✅ NECESSARIA (SSR verifica ruolo admin)
```

**Tab B (dopo logout Tab A):**
```
1. Logout Tab A → Supabase invia evento SIGNED_OUT a tutti i tab
   ↓
2. Tab B riceve onAuthStateChange SIGNED_OUT
   → Azione: profileCacheRef.current.clear() + inFlightRef.current.clear()
   → ✅ NO query extra (solo pulizia cache, non fa query)
```

### 📊 Query Attese per Scenario C

| Tab | Query Bootstrap | Query INITIAL_SESSION | Query Server Dashboard | Query Server Admin | **TOTALE** |
|-----|-----------------|----------------------|------------------------|--------------------|-----------|
| **Tab A** | 1 (se login) | 0-1 (0 se bootstrap già gestito) | 1 (se trainer/admin) | 1 (se admin) | **3-6** (come Scenario A) |
| **Tab B** | 1 (istanza separata) | 0-1 (0 se bootstrap già gestito) | 1 (se trainer/admin) | 1 (se admin) | **2-4** |
| **Tab B (dopo logout Tab A)** | 0 | 0 | 0 | 0 | **0** (NO query extra, solo pulizia cache) |

**Note:**
- Ogni tab ha istanza separata di `AuthProvider` → cache `useRef` è per-tab (normale)
- Logout Tab A → Tab B riceve `SIGNED_OUT` e pulisce cache (NO query extra)
- Singleflight previene query duplicate tra bootstrap e INITIAL_SESSION nello stesso tab

---

## ✅ Ottimizzazioni Applicate

### 1. **Aggiunto `phone` a `UserProfile`**
- **File:** `src/types/user.ts`, `src/providers/auth-provider.tsx`
- **Risultato:** Elimina query `phone` in `/dashboard/impostazioni`
- **Impatto:** -1 query quando si visita `/dashboard/impostazioni`

### 2. **Ottimizzato `useProfileId` per usare `useAuth()`**
- **File:** `src/lib/utils/profile-id-utils.ts`
- **Risultato:** Evita query se `AuthProvider` ha già caricato il profilo
- **Impatto:** -1 query per `useProfileId` quando `AuthProvider` è già caricato

### 3. **Logging condizionale aggiunto**
- **File:** Tutti i punti critici
- **Risultato:** Tracciamento dettagliato in DEV (`[profiles]` logs)
- **Impatto:** Facilita debug e verifica comportamento runtime

---

## 📝 Conclusioni

### Query Minimizzate:
- ✅ **Scenario A:** Da 4-6 a 2-6 (con ottimizzazioni, dipende da componenti montati)
- ✅ **Scenario B:** Da 2-4 a 0-3 (cache TTL 30s può evitare query client)
- ✅ **Scenario C:** Da 4-8 a 2-6 per tab (cache per-tab normale, logout pulisce senza query extra)

### Query Non Eliminabili (SSR):
- ⚠️ `/post-login`: Necessaria per redirect basato su ruolo
- ⚠️ `/dashboard/page.tsx`: Necessaria per SSR (non può usare AuthProvider client)
- ⚠️ `/dashboard/admin/page.tsx`: Necessaria per verifica ruolo admin (SSR)

### Race Conditions Risolte:
- ✅ Singleflight in `AuthProvider` previene duplicati tra bootstrap e INITIAL_SESSION
- ✅ Cache TTL 30s previene query duplicate entro 30 secondi
- ✅ `initialSessionHandledRef` previene gestione duplicata di INITIAL_SESSION

---

## 🎯 Verifica Runtime Richiesta

**Questa analisi statica deve essere verificata con test manuale reale:**
- Aprire DevTools → Network → filtra `profiles`
- Eseguire scenari A/B/C
- Annotare query effettive vs attese
- Verificare che singleflight + cache funzionino correttamente

**Vedi:** `docs/TEST_MANUALE_QUERY_PROFILES.md` per guida test manuale.
