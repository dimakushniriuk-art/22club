# 📚 Documentazione Tecnica: API Push VAPID Key

**Percorso**: `src/app/api/push/vapid-key/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per ottenere VAPID public key per push notifications. Fornisce GET per esporre la chiave pubblica VAPID necessaria per la subscription push nel browser.

---

## 🔧 Endpoints

### 1. `GET /api/push/vapid-key`

**Classificazione**: API Route, GET Handler, Public (no auth required)  
**Autenticazione**: Non richiesta  
**Autorizzazione**: Nessuna

**Query Parameters**: Nessuno

**Response Success** (200):

```typescript
{
  publicKey: string // VAPID public key
  timestamp: string // ISO timestamp
}
```

**Response Error**:

- `500`: VAPID public key non configurata o errore server

**Descrizione**: Endpoint VAPID key con:

- **Environment Variable**: Legge `NEXT_PUBLIC_VAPID_KEY` da env
- **Public Key**: Espone solo public key (non private key)
- **Timestamp**: Include timestamp per debugging
- **Error Handling**: Ritorna errore 500 se key non configurata

---

## 🔄 Flusso Logico

1. **Read Environment**:
   - Legge `NEXT_PUBLIC_VAPID_KEY` da `process.env`

2. **Validazione**:
   - Verifica key presente
   - Se mancante, ritorna errore 500

3. **Response**:
   - Ritorna `publicKey` e `timestamp` ISO

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextResponse`)

**Utilizzato da**: Client-side push subscription (`navigator.serviceWorker.pushManager.subscribe()`)

---

## ⚠️ Note Tecniche

- **Public Key Only**: Espone solo public key (private key rimane server-side)
- **No Auth**: Endpoint pubblico (necessario per subscription push nel browser)
- **Environment Variable**: Usa `NEXT_PUBLIC_` prefix (esposto al client)

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
