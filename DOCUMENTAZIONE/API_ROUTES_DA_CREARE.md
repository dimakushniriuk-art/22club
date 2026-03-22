# 📋 API Routes da Creare - Documento di Riferimento

**Data creazione**: 2025-01-17  
**Stato**: 🟡 In corso

Questo documento elenca tutte le API routes necessarie per il progetto 22Club e il loro stato di implementazione.

---

## ✅ Route Completate

### Autenticazione

- ✅ `/api/auth/context` - GET, POST
- ✅ `/api/health` - GET

### Push Notifications

- ✅ `/api/push/vapid-key` - GET
- ✅ `/api/push/subscribe` - POST
- ✅ `/api/push/unsubscribe` - POST

### Dashboard

- ✅ `/api/dashboard/appointments` - GET (2025-01-17)

### Athletes

- ✅ `/api/athletes/create` - POST (2025-01-17)
- ✅ `/api/athletes/[id]` - GET, PUT, DELETE (2025-01-17)

### Exercises

- ✅ `/api/exercises` - GET, POST, PUT, DELETE (2025-01-17)

---

## 🚧 Route da Completare

### Communications (Priorità Alta)

#### `/api/communications/list` - GET

**Uso**: Lista comunicazioni con filtri e paginazione  
**Parametri query**: `status`, `type`, `limit`, `offset`  
**Risposta**: `{ communications: [], total: number }`  
**File riferimento**: `src/hooks/use-communications.ts:59`

#### `/api/communications/send` - POST

**Uso**: Invia una nuova comunicazione  
**Body**: `{ type, subject, content, recipients, scheduled_at? }`  
**File riferimento**: `src/hooks/use-communications.ts:300`

#### `/api/communications/list-athletes` - GET

**Uso**: Lista atleti per selezione destinatari  
**Risposta**: `{ athletes: [] }`  
**File riferimento**: `src/components/communications/new-communication-modal.tsx:262`

#### `/api/communications/count-recipients` - POST

**Uso**: Conta destinatari in base ai filtri  
**Body**: `{ filter: { all_users?, athlete_ids?, trainer_ids? } }`  
**Risposta**: `{ count: number }`  
**File riferimento**: `src/hooks/communications/use-communications-page.tsx:198`

#### `/api/communications/check-stuck` - POST

**Uso**: Verifica comunicazioni bloccate  
**Body**: `{ communication_id }`  
**File riferimento**: `src/hooks/communications/use-communications-page.tsx:129`

#### `/api/communications/recipients` - GET

**Uso**: Lista destinatari di una comunicazione  
**Parametri query**: `communication_id`  
**Risposta**: `{ recipients: [] }`  
**File riferimento**: `src/components/communications/recipients-detail-modal.tsx:91`

---

### Athletes (Priorità Alta) ✅ COMPLETATO

#### `/api/athletes/create` - POST ✅

**Uso**: Crea un nuovo atleta  
**Body**: `{ nome, cognome, email, phone?, password, stato, data_iscrizione?, note? }`  
**File riferimento**: `src/components/dashboard/crea-atleta-modal.tsx:114`  
**Stato**: ✅ Implementato e integrato con fallback Supabase

#### `/api/athletes/[id]` - GET, PUT, DELETE ✅

**Uso**: Ottieni, aggiorna o elimina un atleta  
**Parametri**: `id` (path parameter)  
**File riferimento**:

- GET: `src/hooks/use-clienti.ts:844`
- PUT: `src/components/dashboard/modifica-atleta-modal.tsx:133` ✅ Aggiornato
- DELETE: Disponibile  
  **Stato**: ✅ Implementato e integrato con fallback Supabase

---

### Exercises (Priorità Alta) ✅ COMPLETATO

#### `/api/exercises` - GET, POST, PUT, DELETE ✅

**Uso**: CRUD completo per esercizi  
**File riferimento**:

- GET: `src/app/dashboard/esercizi/page.tsx:195` ✅ Aggiornato
- POST: `src/components/dashboard/exercise-form-modal.tsx:543` ✅ Aggiornato
- PUT: `src/components/dashboard/exercise-form-modal.tsx:543` ✅ Aggiornato
- DELETE: `src/app/dashboard/esercizi/page.tsx:244` ✅ Aggiornato  
  **Stato**: ✅ Implementato e integrato con fallback Supabase

---

### Dashboard (Priorità Media) ✅ COMPLETATO

#### `/api/dashboard/appointments` - GET ✅

**Uso**: Lista appuntamenti per dashboard  
**Risposta**: `{ appointments: [] }`  
**File riferimento**: `src/app/dashboard/_components/upcoming-appointments-client.tsx:30` ✅ Aggiornato  
**Stato**: ✅ Implementato e integrato con fallback Supabase

---

### Admin (Priorità Media)

#### `/api/admin/users` - GET, POST, PUT, DELETE

**Uso**: Gestione utenti admin  
**File riferimento**: `src/components/dashboard/admin/admin-users-content.tsx`

#### `/api/admin/users/verify-login` - POST

**Uso**: Verifica credenziali utente  
**Body**: `{ userId, email, password }`  
**File riferimento**: `src/components/dashboard/admin/admin-users-content.tsx:280`

#### `/api/admin/users/reset-password` - POST

**Uso**: Reset password utente  
**Body**: `{ userId, newPassword }`  
**File riferimento**: `src/components/dashboard/admin/admin-users-content.tsx:345`

#### `/api/admin/users/import` - POST

**Uso**: Importa utenti da CSV/Excel  
**Body**: `{ file, options }`  
**File riferimento**: `src/components/dashboard/admin/user-import-modal.tsx:325`

#### `/api/admin/users/trainer` - GET

**Uso**: Ottieni trainer per atleta  
**Parametri query**: `athleteId`  
**File riferimento**: `src/components/dashboard/admin/user-form-modal.tsx:121`

#### `/api/admin/roles` - GET, POST

**Uso**: Gestione ruoli  
**File riferimento**: `src/components/dashboard/admin/admin-roles-content.tsx`

#### `/api/admin/statistics` - GET

**Uso**: Statistiche admin  
**Risposta**: `{ stats: {} }`  
**File riferimento**: `src/components/dashboard/admin/admin-statistics-content.tsx:78`

---

### Webhooks (Priorità Bassa)

#### `/api/webhooks/sms` - POST

**Uso**: Webhook per SMS (callback da provider SMS)  
**Parametri query**: `recipient_id`  
**File riferimento**: `src/lib/communications/sms.ts:112`

---

### Tracking (Priorità Bassa)

#### `/api/track/email-open/[id]` - GET

**Uso**: Tracking apertura email (pixel tracking)  
**Parametri**: `id` (tracking pixel ID)  
**File riferimento**: `src/lib/communications/email-resend-client.ts:94`

---

## 📝 Note di Implementazione

### Pattern Comuni

1. **Autenticazione**: Tutte le route (tranne `/api/health` e webhooks) devono verificare l'autenticazione usando `createClient()` da `@/lib/supabase/server`

2. **Autorizzazione**: Verificare i permessi basati su `role` e `org_id` dal profilo utente

3. **Error Handling**: Usare `createLogger()` per logging e restituire errori consistenti

4. **Validazione**: Validare input con Zod schemas quando disponibili

5. **RLS**: Le query Supabase rispettano automaticamente le RLS policies

### Esempio Template

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('api:route-name')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    // Logica route...

    return NextResponse.json({ data: [] })
  } catch (error) {
    logger.error('Errore', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
```

---

## 🔄 Prossimi Passi

1. ⏳ Completare route Communications (6 route)
2. ✅ **Completato** route Athletes (4 route) - 2025-01-17
3. ✅ **Completato** route Exercises (4 route) - 2025-01-17
4. ✅ **Completato** route Dashboard (1 route) - 2025-01-17
5. ⏳ Completare route Admin (7 route)
6. ⏳ Completare route Webhooks (1 route)
7. ⏳ Completare route Tracking (1 route)

**Totale route completate**: 9/24 (~38%)  
**Totale route da creare**: ~15 route rimanenti

## 📝 Note Integrazione

Tutte le route create sono integrate con:

- ✅ Helper `api-client.ts` per fallback automatico
- ✅ Supporto web (API routes) e mobile (Supabase client)
- ✅ Gestione errori e logging
- ✅ Validazione e autorizzazione

Vedi `docs/API_ROUTES_INTEGRATION.md` per dettagli sull'integrazione.

---

**Ultimo aggiornamento**: 2025-01-17
