# 📚 Documentazione Tecnica: API Communications Check Stuck

**Percorso**: `src/app/api/communications/check-stuck/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per rilevare e resettare comunicazioni bloccate in stato "sending". Una comunicazione è considerata "bloccata" se è in stato "sending" da più di 10 minuti.

---

## 🔧 Endpoints

### 1. `POST /api/communications/check-stuck`

**Classificazione**: API Route, POST Handler, Staff Only  
**Autenticazione**: Richiesta (user)  
**Autorizzazione**: Solo ruoli `admin`, `pt`, `trainer`, `staff`

**Request Body** (opzionale):

```typescript
{
  communicationId?: string // ID comunicazione specifica (opzionale, se non fornito controlla tutte)
}
```

**Response Success** (200):

```typescript
{
  found: number // numero comunicazioni bloccate trovate
  reset: number // numero comunicazioni resettate
  communications: Array<{
    id: string
    title: string
    was_stuck_since: string // updated_at quando era bloccata
  }>
  message: string
}
```

**Response Error**:

- `401`: Non autenticato
- `403`: Non autorizzato (non staff)
- `500`: Errore server

**Descrizione**: Endpoint verifica stuck con:

- **Threshold**: 10 minuti (`STUCK_THRESHOLD_MS = 10 * 60 * 1000`)
- **Query**: Trova comunicazioni con `status === 'sending'` e `updated_at < thresholdTime`
- **Filtro Opzionale**: Se `communicationId` fornito, controlla solo quella comunicazione
- **Reset**: Resetta comunicazioni bloccate a `failed` con metadata errore
- **Metadata**: Salva `stuck_detected_at` in metadata

---

## 🔄 Flusso Logico

1. **Autenticazione e Autorizzazione**:
   - Verifica user
   - Verifica ruolo staff

2. **Parse Body**:
   - Legge `communicationId` (opzionale)
   - Gestisce errore JSON (body vuoto)

3. **Calcolo Threshold**:
   - `thresholdTime = now - STUCK_THRESHOLD_MS` (10 minuti fa)

4. **Query Comunicazioni Bloccate**:
   - Query `communications` con:
     - `status === 'sending'`
     - `updated_at < thresholdTime`
     - Se `communicationId` fornito, filtra anche per ID

5. **Reset**:
   - Se trovati, aggiorna status a `failed`
   - Salva metadata: `error`, `stuck_detected_at`

6. **Response**:
   - Ritorna `found`, `reset`, lista comunicazioni, messaggio

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Supabase Server Client (`createClient`)

**Utilizzato da**: Job scheduler, componenti admin per verifica manuale

---

## ⚠️ Note Tecniche

- **Threshold**: 10 minuti hardcoded (`STUCK_THRESHOLD_MS`)
- **Optional ID**: Supporta verifica singola comunicazione o tutte
- **Error Handling**: Gestisce body vuoto con `.catch(() => ({}))`
- **Metadata**: Salva timestamp rilevamento in `metadata.stuck_detected_at`

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
