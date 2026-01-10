# 📚 Documentazione Tecnica: API Communications Count Recipients

**Percorso**: `src/app/api/communications/count-recipients/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per contare i destinatari in base al filtro. Fornisce POST per calcolare count di destinatari che corrispondono ai criteri del filtro prima di creare la comunicazione.

---

## 🔧 Endpoints

### 1. `POST /api/communications/count-recipients`

**Classificazione**: API Route, POST Handler, Staff Only  
**Autenticazione**: Richiesta (user)  
**Autorizzazione**: Solo ruoli `admin`, `pt`, `trainer`, `staff`

**Request Body**:

```typescript
{
  filter: RecipientFilter // filtro destinatari
}
```

**Response Success** (200):

```typescript
{
  count: number // numero destinatari che corrispondono al filtro
}
```

**Response Error**:

- `400`: `filter` mancante
- `401`: Non autenticato
- `403`: Non autorizzato (non staff)
- `500`: Errore server

**Descrizione**: Endpoint conta destinatari con:

- **Service Layer**: Usa `countRecipientsByFilter()` da `@/lib/communications/recipients`
- **Validazione**: Verifica `filter` presente
- **Response**: Ritorna solo `count` (numero intero)

---

## 🔄 Flusso Logico

1. **Autenticazione e Autorizzazione**:
   - Verifica user
   - Verifica ruolo staff

2. **Parse Body**:
   - Legge `filter` come `RecipientFilter`

3. **Validazione**:
   - Verifica `filter` presente

4. **Service Call**:
   - Chiama `countRecipientsByFilter(filter)`

5. **Response**:
   - Ritorna `count`

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Supabase Server Client (`createClient`), Recipients Service (`countRecipientsByFilter`), tipo `RecipientFilter`

**Utilizzato da**: Componenti creazione comunicazione (preview count destinatari)

---

## ⚠️ Note Tecniche

- **Service Layer**: Delega logica a `countRecipientsByFilter()` per riusabilità
- **Type Safety**: Usa tipo `RecipientFilter` per type safety

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
