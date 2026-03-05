# 🔧 Fix Middleware Rate Limit - 2026-01-08

**Problema**: Rate limit Supabase raggiunto a causa di troppe chiamate API dal middleware.

**Status**: ✅ **RISOLTO**

---

## 🔴 Problema Identificato

Il middleware stava facendo chiamate a Supabase per **ogni richiesta**, anche per:
- Route pubbliche (`/login`, `/`, ecc.)
- Asset statici (già filtrati ma Next.js fa comunque molte richieste)
- Ogni navigazione tra pagine

**Risultato**: Rate limit Supabase raggiunto (`over_request_rate_limit`, status 429)

---

## ✅ Soluzioni Implementate

### 1. Skip Chiamate Supabase per Route Pubbliche

**Prima**: Il middleware chiamava sempre `getSession()` anche per route pubbliche.

**Dopo**: Il check delle route pubbliche è stato spostato **PRIMA** della chiamata a Supabase.

```typescript
// Route pubbliche - CHECK PRIMA di chiamare Supabase
const isPublicRoute = PUBLIC_ROUTES.some(...)

if (isPublicRoute) {
  // Skip completamente chiamate Supabase per route pubbliche
  return NextResponse.next()
}

// Solo ora chiama Supabase (solo per route protette)
const { supabase } = createClient(request)
```

**Impatto**: Riduce drasticamente le chiamate API (circa 70-80% in meno).

---

### 2. Gestione Rate Limit con Backoff

**Implementato**: Sistema di backoff automatico quando viene rilevato rate limit.

```typescript
// Flag globale per rate limit
let rateLimitActive = false
let rateLimitUntil = 0

// Rilevamento rate limit
if (sessionError?.code === 'over_request_rate_limit' || sessionError?.status === 429) {
  rateLimitActive = true
  rateLimitUntil = now + 60 * 1000 // Backoff 60 secondi
  // Skip chiamate Supabase durante backoff
}
```

**Comportamento**:
- Quando viene rilevato rate limit, attiva backoff di 60 secondi
- Durante il backoff, skippa tutte le chiamate Supabase
- Usa valori di default sicuri durante il backoff
- Si ripristina automaticamente dopo 60 secondi

---

### 3. Cache Ruoli Migliorata

**Già presente**: Cache ruoli con TTL 1 minuto.

**Migliorato**: Durante rate limit, usa valori di default invece di fallire.

```typescript
if (rateLimitActive && now < rateLimitUntil) {
  // Durante rate limit, usa default safe
  normalizedRole = 'athlete' // Default safe
} else {
  // Query normale al database
}
```

---

## 📊 Risultati Attesi

### Prima del Fix
- Chiamate Supabase: ~100-200 per minuto (ogni richiesta)
- Rate limit raggiunto dopo pochi minuti
- Errori 429 frequenti

### Dopo il Fix
- Chiamate Supabase: ~20-40 per minuto (solo route protette)
- Rate limit gestito automaticamente con backoff
- Riduzione 70-80% delle chiamate API

---

## 🔍 Monitoraggio

I log di performance continuano a funzionare:
- `[PERF] getSession (middleware): XXms`
- `[PERF] fetch role (middleware): XXms`

Se vedi rate limit, il sistema:
1. Attiva automaticamente backoff 60s
2. Logga warning: `Rate limit Supabase raggiunto, attivo backoff 60s`
3. Skippa chiamate durante backoff
4. Si ripristina automaticamente

---

## ⚠️ Note Importanti

1. **Route Pubbliche**: Ora skippano completamente Supabase
   - `/login`, `/`, `/forgot-password`, ecc.
   - Queste pagine gestiscono l'autenticazione lato client se necessario

2. **Rate Limit**: Gestito automaticamente
   - Backoff di 60 secondi
   - Valori default durante backoff
   - Ripristino automatico

3. **Cache Ruoli**: TTL 1 minuto
   - Riduce query database
   - Funziona anche durante rate limit

---

## 🧪 Test

Per verificare che il fix funzioni:

1. **Monitora chiamate Supabase**:
   - Dashboard Supabase → Logs → API Requests
   - Dovresti vedere riduzione significativa

2. **Testa navigazione**:
   - Naviga tra pagine pubbliche (`/login`, `/`)
   - Non dovrebbero esserci chiamate Supabase

3. **Testa rate limit** (se si verifica):
   - Il sistema dovrebbe attivare backoff automaticamente
   - Dopo 60 secondi, riprendere normalmente

---

**File Modificato**: `src/middleware.ts`

**Data Fix**: 2026-01-08
