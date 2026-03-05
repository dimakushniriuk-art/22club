# 📚 Documentazione Tecnica: API Webhooks Email

**Percorso**: `src/app/api/webhooks/email/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route webhook per gestire eventi Resend (delivery status email). Gestisce eventi: sent, delivered, bounced, complained, opened, clicked.

---

## 🔧 Endpoints

### 1. `POST /api/webhooks/email`

**Classificazione**: API Route, POST Handler, Webhook (no auth required)  
**Autenticazione**: Non richiesta (webhook Resend)  
**Autorizzazione**: Verifica signature (TODO: implementare)

**Request Body** (JSON da Resend):

```typescript
{
  type: string // 'email.sent', 'email.delivered', 'email.bounced', etc.
  data?: {
    email_id?: string
    to?: string
    link?: string // per email.clicked
  }
  email_id?: string // formato alternativo
  to?: string // formato alternativo
}
```

**Request Headers**:

- `resend-signature`: `string` - Signature webhook (opzionale, per verifica)

**Response Success** (200):

- Body: `"OK"` o `"Recipient not found"` (200 anche se recipient non trovato)

**Response Error**:

- `400`: `email_id` mancante
- `500`: Errore server

**Descrizione**: Endpoint webhook email con:

- **Signature Verification**: TODO - verifica signature Resend (opzionale)
- **Event Types**:
  - `email.sent`: Conferma invio, aggiorna `sent_at` se mancante
  - `email.delivered`: Aggiorna a `delivered` con `delivered_at`, aggiorna stats
  - `email.bounced`: Aggiorna a `bounced` con `failed_at` e error message, aggiorna stats
  - `email.complained`: Aggiorna a `bounced` con error message (spam), aggiorna stats
  - `email.opened`: Alternativo al pixel tracking, aggiorna `opened_at`, aggiorna stats
  - `email.clicked`: Traccia click, salva `clicked_at` e `clicked_url` in metadata
- **Recipient Lookup**: Cerca recipient tramite `metadata.email_id` matching `emailId`
- **Update Stats**: Aggiorna statistiche comunicazione per delivered/bounced/opened

---

## 🔄 Flusso Logico

1. **Signature Verification** (TODO):
   - Verifica `resend-signature` header se `RESEND_WEBHOOK_SECRET` configurato

2. **Parse JSON Body**:
   - Legge JSON da Resend
   - Estrae `type`, `email_id` (da `data.email_id` o `email_id`), `to`

3. **Validazione**:
   - Verifica `emailId` presente

4. **Recipient Lookup**:
   - Query recipients `email` con `status === 'sent'` e `metadata.email_id === emailId`

5. **Event Handling**:
   - Switch su `eventType`:
     - `email.sent`: Update `sent_at` se mancante
     - `email.delivered`: Update a `delivered`, aggiorna stats
     - `email.bounced`/`email.complained`: Update a `bounced`, aggiorna stats
     - `email.opened`: Update `opened_at`, aggiorna stats
     - `email.clicked`: Update metadata con `clicked_at` e `clicked_url`

6. **Response**:
   - Ritorna `"OK"` (200) anche se recipient non trovato (non critico)

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Supabase Client (`createClient`), Service Layer (`updateRecipientStatus`, `updateCommunicationStats`), tipo `Database`

**Utilizzato da**: Resend webhook configuration

---

## ⚠️ Note Tecniche

- **No Auth**: Webhook pubblico (Resend chiama direttamente)
- **Service Role**: Usa `SUPABASE_SERVICE_ROLE_KEY` per accesso diretto
- **JSON Body**: Resend invia dati come JSON (diverso da Twilio form-urlencoded)
- **Metadata Lookup**: Cerca recipient tramite `metadata.email_id`
- **Click Tracking**: Salva click in metadata (non cambia status)
- **Non Critico**: Se recipient non trovato, ritorna 200 (potrebbe essere email non tracciata)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
