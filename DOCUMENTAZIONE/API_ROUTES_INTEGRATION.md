# 🔌 Integrazione API Routes - Strategia Web/Mobile

**Data**: 2025-01-17  
**Stato**: ✅ Implementato

---

## 🎯 Strategia

### Web (Next.js)

- ✅ **Usa API Routes** quando disponibili
- ✅ **Vantaggi**: Validazione server-side, sicurezza, logica centralizzata
- ✅ **Fallback**: Supabase client diretto se API fallisce

### Mobile (Capacitor)

- ✅ **Usa Supabase Client** direttamente
- ✅ **Motivo**: API routes non disponibili con export statico
- ✅ **Vantaggi**: Nessuna dipendenza da server, funziona offline

---

## 📚 Helper Creato

### `src/lib/api-client.ts`

Helper centralizzato per gestire chiamate API con fallback automatico.

#### Funzioni Principali

```typescript
// Verifica se siamo su mobile
isNativePlatform(): boolean

// Verifica se API routes sono disponibili
isApiAvailable(): boolean

// Chiamata API generica con fallback
apiCall<T>(endpoint, options, fallbackFn): Promise<T>

// Helper specifici
apiGet<T>(endpoint, params?, fallbackFn): Promise<T>
apiPost<T>(endpoint, body?, fallbackFn): Promise<T>
apiPut<T>(endpoint, body?, fallbackFn): Promise<T>
apiDelete<T>(endpoint, fallbackFn): Promise<T>
```

#### Esempio Utilizzo

```typescript
import { apiGet } from '@/lib/api-client'
import { supabase } from '@/lib/supabase/client'

// Usa API route su web, Supabase su mobile
const data = await apiGet(
  '/api/communications/list',
  { status: 'sent', limit: 10 },
  // Fallback Supabase (usato su mobile)
  async () => {
    const { data } = await supabase
      .from('communications')
      .select('*')
      .eq('status', 'sent')
      .limit(10)
    return { data: data || [], count: null }
  },
)
```

---

## ✅ Hook Aggiornati

### `use-communications.ts`

**Prima**:

```typescript
// Fetch manuale con try/catch complesso
const response = await fetch('/api/communications/list')
// ... gestione errori manuale
// ... fallback manuale
```

**Dopo**:

```typescript
import { apiGet } from '@/lib/api-client'

const result = await apiGet(
  '/api/communications/list',
  queryParams,
  // Fallback automatico
  async () => {
    // Query Supabase
  },
)
```

---

## 🔄 Pattern da Applicare

### 1. Identifica Hook/Componenti che Usano Supabase Direttamente

Cerca pattern come:

```typescript
const { data } = await supabase.from('table').select('*')
```

### 2. Crea API Route (se non esiste)

Vedi `docs/API_ROUTES_DA_CREARE.md` per elenco completo.

### 3. Aggiorna Hook per Usare `apiGet/apiPost/etc`

```typescript
// Prima
const { data } = await supabase.from('table').select('*')

// Dopo
const data = await apiGet('/api/table/list', {}, async () => {
  const { data } = await supabase.from('table').select('*')
  return data
})
```

---

## 📋 API Routes Disponibili

### ✅ Completate

- `/api/auth/context` - GET, POST
- `/api/health` - GET
- `/api/push/vapid-key` - GET
- `/api/push/subscribe` - POST
- `/api/push/unsubscribe` - POST

### 🚧 Da Creare (vedi `API_ROUTES_DA_CREARE.md`)

- `/api/communications/*` - 6 route
- `/api/athletes/*` - 4 route
- `/api/exercises` - 4 route
- `/api/dashboard/appointments` - 1 route
- `/api/admin/*` - 3 route
- `/api/webhooks/sms` - 1 route
- `/api/track/email-open` - 1 route

---

## 🔍 Come Verificare

### Test Web

1. Apri DevTools → Network
2. Verifica che chiamate vadano a `/api/*`
3. Verifica risposte API

### Test Mobile

1. Apri DevTools mobile (Safari/Chrome)
2. Verifica che chiamate vadano direttamente a Supabase
3. Verifica che non ci siano errori 404 per `/api/*`

---

## 📝 Note Tecniche

### Perché Non Usare API Routes su Mobile?

1. **Export Statico**: Capacitor richiede export statico Next.js
2. **API Routes Non Disponibili**: Vengono spostate durante build
3. **Supabase Client Funziona**: Accesso diretto al database funziona perfettamente
4. **Offline Support**: Supabase client può funzionare offline (con cache)

### Vantaggi API Routes su Web

1. **Sicurezza**: Validazione server-side
2. **Logica Centralizzata**: Business logic in un posto
3. **Rate Limiting**: Possibile implementare rate limiting
4. **Logging**: Log centralizzati
5. **Caching**: Possibile implementare caching server-side

---

## 🚀 Prossimi Passi

1. ✅ Helper `api-client.ts` creato
2. ✅ `use-communications.ts` aggiornato
3. ⏳ Aggiornare altri hook (vedi `API_ROUTES_DA_CREARE.md`)
4. ⏳ Creare API routes mancanti
5. ⏳ Test completo web e mobile

---

**Ultimo aggiornamento**: 2025-01-17  
**Mantenuto da**: Team 22Club
