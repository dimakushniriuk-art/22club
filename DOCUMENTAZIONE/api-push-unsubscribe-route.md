# 📚 Documentazione Tecnica: API Push Unsubscribe

**Percorso**: `src/app/api/push/unsubscribe/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per rimuovere subscription push notification. Fornisce POST per eliminare subscription dal database.

---

## 🔧 Endpoints

### 1. `POST /api/push/unsubscribe`

**Classificazione**: API Route, POST Handler, Authenticated  
**Autenticazione**: Richiesta (implicita tramite userId)  
**Autorizzazione**: Nessuna (utente rimuove la propria subscription)

**Request Body**:

```typescript
{
  endpoint: string // Push subscription endpoint URL
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

- `400`: Dati non validi (endpoint, userId mancanti)
- `500`: Errore server

**Descrizione**: Endpoint unsubscribe push con:

- **Validazione**: Verifica `endpoint` e `userId` presenti
- **Delete**: Elimina subscription da `push_subscriptions` con match `endpoint` e `user_id`
- **Service Role**: Usa `SUPABASE_SERVICE_ROLE_KEY` per accesso diretto

---

## 🔄 Flusso Logico

1. **Parse Body**:
   - Legge JSON body
   - Estrae `endpoint`, `userId`

2. **Validazione**:
   - Verifica `endpoint` e `userId` presenti
   - Se mancanti, ritorna errore 400

3. **Supabase Client**:
   - Crea client con service role key

4. **Delete Subscription**:
   - Delete da `push_subscriptions` con:
     - `endpoint === endpoint`
     - `user_id === userId`

5. **Response**:
   - Ritorna `{ ok: true }`

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextResponse`), Supabase Client (`createClient`)

**Utilizzato da**: Client-side push unsubscription (`usePushNotifications`, `usePush`)

---

## ⚠️ Note Tecniche

- **Double Check**: Elimina solo se `endpoint` e `user_id` corrispondono (sicurezza)
- **Service Role**: Usa service role key per accesso diretto (non richiede auth session)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
