# 📚 Documentazione Tecnica: API Track Email Open

**Percorso**: `src/app/api/track/email-open/[id]/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route, Dynamic Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per tracciare apertura email tramite pixel tracking. Restituisce un'immagine PNG trasparente 1x1 pixel e aggiorna lo status del recipient a "opened".

---

## 🔧 Endpoints

### 1. `GET /api/track/email-open/[id]`

**Classificazione**: API Route, GET Handler, Public (no auth required)  
**Autenticazione**: Non richiesta (pixel tracking)  
**Autorizzazione**: Nessuna

**Route Parameters**:

- `id`: `string` - ID recipient (obbligatorio)

**Response Success** (200):

- Content-Type: `image/png`
- Body: PNG trasparente 1x1 pixel (base64)
- Headers:
  - `Cache-Control: no-cache, no-store, must-revalidate`
  - `Pragma: no-cache`
  - `Expires: 0`

**Response Error**:

- `400`: ID recipient mancante (restituisce comunque pixel)

**Descrizione**: Endpoint pixel tracking con:

- **Pixel Tracking**: Restituisce sempre PNG trasparente 1x1 (anche in caso di errore)
- **Fetch Recipient**: Query `communication_recipients` per ID e `recipient_type === 'email'`
- **Doppio Tracking**: Verifica `opened_at`, se già presente non aggiorna (evita doppi tracking)
- **Update Status**: Aggiorna recipient a `opened` con `opened_at` timestamp
- **Update Stats**: Aggiorna statistiche comunicazione (`updateCommunicationStats`)
- **Error Handling**: Anche in caso di errore, restituisce pixel (per non rompere l'email)

---

## 🔄 Flusso Logico

1. **Parse Route Parameter**:
   - Estrae `id` da `params` (dynamic route)

2. **Validazione**:
   - Verifica `recipientId` presente
   - Se mancante, restituisce pixel (400 ma con pixel)

3. **Fetch Recipient**:
   - Query `communication_recipients` con join `communications`
   - Filtra per `id` e `recipient_type === 'email'`

4. **Check Already Opened**:
   - Se `recipient.opened_at` presente, restituisce pixel (evita doppi tracking)

5. **Update Status**:
   - Chiama `updateRecipientStatus(recipientId, 'opened', { opened_at })`

6. **Update Stats**:
   - Chiama `updateCommunicationStats(communication.id)`

7. **Return Pixel**:
   - Restituisce PNG trasparente 1x1 con headers no-cache

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Supabase Client (`createClient`), Service Layer (`updateRecipientStatus`, `updateCommunicationStats`), tipo `Database`

**Utilizzato da**: Email HTML con tag `<img src="/api/track/email-open/[id]">`

---

## ⚠️ Note Tecniche

- **No Auth**: Endpoint pubblico (non richiede autenticazione) per funzionare in email
- **Service Role**: Usa `SUPABASE_SERVICE_ROLE_KEY` per accesso diretto al database
- **Privacy**: Anche se recipient non trovato, restituisce pixel (per privacy)
- **No Cache**: Headers no-cache per evitare caching del pixel
- **Base64 Pixel**: PNG trasparente 1x1 hardcoded in base64

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
