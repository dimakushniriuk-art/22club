# 📚 Documentazione Tecnica: API Push Subscribe

**Percorso**: `src/app/api/push/subscribe/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per registrare subscription push notification. Fornisce POST per salvare subscription (endpoint, keys) nel database.

---

## 🔧 Endpoints

### 1. `POST /api/push/subscribe`

**Classificazione**: API Route, POST Handler, Authenticated  
**Autenticazione**: Richiesta (implicita tramite userId)  
**Autorizzazione**: Nessuna (utente registra la propria subscription)

**Request Body**:

```typescript
{
  endpoint: string // Push subscription endpoint URL
  keys: {
    p256dh: string // Public key
    auth: string // Auth secret
  }
  userId: string // ID utente
}
```

**Response Success** (200):

```typescript
{
  ok: true
}
```

**Response Error**:

- `400`: Dati non validi (endpoint, keys, userId mancanti)
- `500`: Errore server

**Descrizione**: Endpoint subscribe push con:

- **Validazione**: Verifica `endpoint`, `keys.p256dh`, `keys.auth`, `userId` presenti
- **Upsert**: Usa `upsert` con `onConflict: 'endpoint'` (aggiorna se endpoint già esiste)
- **Service Role**: Usa `SUPABASE_SERVICE_ROLE_KEY` per accesso diretto
- **Table**: Salva in `push_subscriptions` con `user_id`, `endpoint`, `p256dh`, `auth`

---

## 🔄 Flusso Logico

1. **Parse Body**:
   - Legge JSON body
   - Estrae `endpoint`, `keys.p256dh`, `keys.auth`, `userId`

2. **Validazione**:
   - Verifica tutti i campi presenti
   - Se mancanti, ritorna errore 400

3. **Supabase Client**:
   - Crea client con service role key

4. **Upsert Subscription**:
   - Upsert in `push_subscriptions` con:
     - `user_id`: userId
     - `endpoint`: endpoint
     - `p256dh`: keys.p256dh
     - `auth`: keys.auth
   - `onConflict: 'endpoint'` (aggiorna se endpoint già esiste)

5. **Response**:
   - Ritorna `{ ok: true }`

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextResponse`), Supabase Client (`createClient`)

**Utilizzato da**: Client-side push subscription (`usePushNotifications`, `usePush`)

---

## ⚠️ Note Tecniche

- **Upsert**: Usa upsert per gestire subscription duplicate (stesso endpoint)
- **Service Role**: Usa service role key per accesso diretto (non richiede auth session)
- **Keys Storage**: Salva `p256dh` e `auth` keys necessarie per inviare push

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
