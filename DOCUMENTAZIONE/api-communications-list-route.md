# 📚 Documentazione Tecnica: API Communications List

**Percorso**: `src/app/api/communications/list/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per recuperare lista comunicazioni con paginazione e filtri. Fornisce GET con supporto per status, type, limit, offset usando il service layer.

---

## 🔧 Endpoints

### 1. `GET /api/communications/list`

**Classificazione**: API Route, GET Handler, Staff Only  
**Autenticazione**: Richiesta (user)  
**Autorizzazione**: Solo ruoli `admin`, `pt`, `trainer`, `staff`

**Query Parameters**:

- `status?`: `string` - Filtro status (`draft`, `scheduled`, `sending`, `sent`, `failed`, `cancelled`)
- `type?`: `string` - Filtro tipo (`push`, `email`, `sms`, `all`)
- `limit?`: `number` - Limite risultati (1-100, default: undefined)
- `offset?`: `number` - Offset paginazione (>= 0, default: undefined)

**Response Success** (200):

```typescript
{
  data: Array<Communication> // comunicazioni
  count: number // conteggio totale (per paginazione)
}
```

**Response Error**:

- `400`: Parametri non validi (limit/offset fuori range)
- `401`: Non autenticato
- `403`: Non autorizzato (non staff)
- `500`: Errore server

**Descrizione**: Endpoint lista comunicazioni con:

- **Validazione Parametri**: Verifica `limit` (1-100) e `offset` (>= 0)
- **Service Layer**: Usa `getCommunications()` da `@/lib/communications/service`
- **Filtri**: Supporta filtro per `status` e `type`
- **Paginazione**: Supporta `limit` e `offset`
- **Count**: Ritorna conteggio totale per paginazione

---

## 🔄 Flusso Logico

1. **Autenticazione e Autorizzazione**:
   - Verifica user
   - Verifica ruolo staff

2. **Parse Query Parameters**:
   - Legge `status`, `type`, `limit`, `offset`
   - Converte `limit` e `offset` a number

3. **Validazione**:
   - Verifica `limit` (1-100) o undefined
   - Verifica `offset` (>= 0) o undefined

4. **Service Call**:
   - Chiama `getCommunications()` con filtri e paginazione

5. **Response**:
   - Ritorna `data` e `count`

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Supabase Server Client (`createClient`), Service Layer (`getCommunications`)

**Utilizzato da**: Componente `CommunicationsTable`, hook `useCommunicationsPage`

---

## ⚠️ Note Tecniche

- **Service Layer**: Delega logica a `getCommunications()` per riusabilità
- **Type Filter**: `type === 'all'` viene convertito a `undefined` (nessun filtro)
- **Validation**: Limit massimo 100 per prevenire query troppo pesanti

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
