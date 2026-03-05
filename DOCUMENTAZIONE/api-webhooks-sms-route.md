# 📚 Documentazione Tecnica: API Webhooks SMS

**Percorso**: `src/app/api/webhooks/sms/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route webhook per gestire eventi Twilio (delivery status SMS). Gestisce status: queued, sent, delivered, failed, undelivered.

---

## 🔧 Endpoints

### 1. `POST /api/webhooks/sms`

**Classificazione**: API Route, POST Handler, Webhook (no auth required)  
**Autenticazione**: Non richiesta (webhook Twilio)  
**Autorizzazione**: Verifica signature (TODO: implementare)

**Query Parameters**:

- `recipient_id?`: `string` - ID recipient (opzionale, se fornito nel statusCallback)

**Request Body** (form-urlencoded da Twilio):

- `MessageSid`: `string` - ID messaggio Twilio
- `MessageStatus`: `string` - Status messaggio (`queued`, `sent`, `delivered`, `failed`, `undelivered`)
- `To`: `string` - Numero telefono destinatario
- `From`: `string` - Numero telefono mittente

**Request Headers**:

- `x-twilio-signature`: `string` - Signature webhook (opzionale, per verifica)

**Response Success** (200):

- Body: `"OK"` o `"Recipient not found"` (200 anche se recipient non trovato)

**Response Error**:

- `400`: `MessageSid` mancante
- `500`: Errore server

**Descrizione**: Endpoint webhook SMS con:

- **Signature Verification**: TODO - verifica signature Twilio (opzionale)
- **Form Data**: Parse form-urlencoded da Twilio
- **Recipient Lookup**: Cerca recipient tramite:
  1. `recipient_id` query param (se fornito)
  2. `metadata.message_id` matching `MessageSid`
- **Status Handling**:
  - `queued`: Nessuna azione (già gestito durante invio)
  - `sent`: Aggiorna `sent_at` se non presente
  - `delivered`: Aggiorna a `delivered` con `delivered_at`, aggiorna stats
  - `failed`/`undelivered`: Aggiorna a `failed` con `failed_at` e `error_message`, aggiorna stats
- **Update Stats**: Aggiorna statistiche comunicazione per delivered/failed

---

## 🔄 Flusso Logico

1. **Signature Verification** (TODO):
   - Verifica `x-twilio-signature` header se `TWILIO_WEBHOOK_SECRET` configurato

2. **Parse Form Data**:
   - Legge form-urlencoded da Twilio
   - Estrae `MessageSid`, `MessageStatus`, `To`, `From`
   - Legge `recipient_id` da query params

3. **Validazione**:
   - Verifica `MessageSid` presente

4. **Recipient Lookup**:
   - Se `recipient_id` fornito, query diretta
   - Altrimenti, cerca tra recipients `sms` con `status === 'sent'` e `metadata.message_id === MessageSid`

5. **Status Handling**:
   - Switch su `MessageStatus`:
     - `queued`: Nessuna azione
     - `sent`: Update `sent_at` se mancante
     - `delivered`: Update a `delivered`, aggiorna stats
     - `failed`/`undelivered`: Update a `failed`, aggiorna stats

6. **Response**:
   - Ritorna `"OK"` (200) anche se recipient non trovato (non critico)

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Supabase Client (`createClient`), Service Layer (`updateRecipientStatus`, `updateCommunicationStats`), tipo `Database`

**Utilizzato da**: Twilio webhook configuration (statusCallback URL)

---

## ⚠️ Note Tecniche

- **No Auth**: Webhook pubblico (Twilio chiama direttamente)
- **Service Role**: Usa `SUPABASE_SERVICE_ROLE_KEY` per accesso diretto
- **Form URL Encoded**: Twilio invia dati come form-urlencoded, non JSON
- **Metadata Lookup**: Cerca recipient tramite `metadata.message_id` se `recipient_id` non fornito
- **Non Critico**: Se recipient non trovato, ritorna 200 (potrebbe essere SMS non tracciato)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
