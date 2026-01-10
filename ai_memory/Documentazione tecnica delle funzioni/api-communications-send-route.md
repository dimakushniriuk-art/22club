# 📚 Documentazione Tecnica: API Communications Send

**Percorso**: `src/app/api/communications/send/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per inviare una comunicazione. Gestisce creazione recipients, invio effettivo (push/email/sms), timeout dinamico, e gestione errori/stati.

---

## 🔧 Endpoints

### 1. `POST /api/communications/send`

**Classificazione**: API Route, POST Handler, Staff Only  
**Autenticazione**: Richiesta (user)  
**Autorizzazione**: Solo ruoli `admin`, `pt`, `trainer`, `staff`

**Request Body**:

```typescript
{
  communicationId: string // ID comunicazione (obbligatorio)
}
```

**Response Success** (200):

```typescript
{
  success: boolean
  sent: number
  failed: number
  total: number
  errors?: string[]
  error?: string
  message: string
}
```

**Response Error**:

- `400`: `communicationId` mancante o comunicazione non in stato valido o nessun destinatario
- `401`: Non autenticato
- `403`: Non autorizzato (non staff)
- `404`: Comunicazione non trovata
- `408`: Timeout (Request Timeout)
- `500`: Errore server

**Descrizione**: Endpoint invio comunicazione con:

- **Validazione Stato**: Verifica comunicazione in stato `draft`, `scheduled`, `sending`, o `failed`
- **Reset Failed**: Se stato `failed`, resetta a `draft` per retry
- **Creazione Recipients**: Assicura che recipients siano creati (`ensureRecipientsCreated`)
- **Verifica Recipients**: Verifica che almeno 1 recipient esista
- **Timeout Dinamico**: Calcola timeout basato su numero recipients (1 min/100 recipients, min 2 min, max 10 min)
- **Invio Multi-Tipo**: Supporta `push`, `email`, `sms`, o `all` (tutti e 3)
- **Gestione Timeout**: Race tra invio e timeout, aggiorna status a `failed` se timeout
- **Aggiornamento Status**: Aggiorna status comunicazione a `failed` se invio fallisce completamente

---

## 🔄 Flusso Logico

1. **Autenticazione e Autorizzazione**:
   - Verifica user
   - Verifica ruolo staff

2. **Validazione**:
   - Verifica `communicationId` presente
   - Fetch comunicazione
   - Verifica stato valido (`draft`, `scheduled`, `sending`, `failed`)

3. **Reset Failed**:
   - Se stato `failed`, resetta a `draft`

4. **Creazione Recipients**:
   - Chiama `ensureRecipientsCreated()` con `type` e `recipient_filter`
   - Verifica che almeno 1 recipient esista
   - Se nessun recipient, aggiorna status a `failed` e ritorna errore 400

5. **Calcolo Timeout**:
   - Formula: `Math.max(totalRecipients / 100, 2) * 60 * 1000` (min 2 min, max 10 min)

6. **Invio con Timeout**:
   - Race tra `sendWithTimeout()` e timeout promise
   - `sendWithTimeout()` chiama funzione invio in base a `type`:
     - `push`: `sendCommunicationPush()`
     - `email`: `sendCommunicationEmail()`
     - `sms`: `sendCommunicationSMS()`
     - `all`: invia tutti e 3, aggrega risultati

7. **Gestione Risultato**:
   - Se timeout: aggiorna status a `failed`, ritorna 408
   - Se fallito completamente: aggiorna status a `failed`
   - Ritorna risultato con `sent`, `failed`, `total`

8. **Error Handling**:
   - Catch errori, aggiorna status a `failed` con metadata errore

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Supabase Server Client (`createClient`), Scheduler (`ensureRecipientsCreated`), Push Service (`sendCommunicationPush`), Email Service (`sendCommunicationEmail`), SMS Service (`sendCommunicationSMS`)

**Utilizzato da**: Componenti invio comunicazioni

---

## ⚠️ Note Tecniche

- **Timeout Dinamico**: Timeout basato su numero recipients per evitare timeout troppo lunghi/corti
- **Race Condition**: Usa `Promise.race()` per timeout
- **Multi-Type**: Tipo `all` invia tutti e 3 i tipi e aggrega risultati
- **Status Management**: Aggiorna status a `failed` in caso di errori/timeout
- **Metadata Error**: Salva messaggio errore in `metadata.error` della comunicazione

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
