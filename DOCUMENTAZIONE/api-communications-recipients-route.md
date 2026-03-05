# 📚 Documentazione Tecnica: API Communications Recipients

**Percorso**: `src/app/api/communications/recipients/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per recuperare lista recipients di una comunicazione. Fornisce GET con dati formattati inclusi profili utenti (nome, email, telefono).

---

## 🔧 Endpoints

### 1. `GET /api/communications/recipients`

**Classificazione**: API Route, GET Handler, Staff Only  
**Autenticazione**: Richiesta (user)  
**Autorizzazione**: Solo ruoli `admin`, `pt`, `trainer`, `staff`

**Query Parameters**:

- `communication_id`: `string` - ID comunicazione (obbligatorio)

**Response Success** (200):

```typescript
{
  recipients: Array<{
    id: string
    user_id: string
    name: string // nome completo o email o "Nome non disponibile"
    email: string | null
    phone: string | null
    recipient_type: string
    status: string
    sent_at: string | null
    delivered_at: string | null
    opened_at: string | null
    failed_at: string | null
    error_message: string | null
    created_at: string
  }>
}
```

**Response Error**:

- `400`: `communication_id` mancante
- `401`: Non autenticato
- `403`: Non autorizzato (non staff)
- `500`: Errore server

**Descrizione**: Endpoint lista recipients con:

- **Fetch Recipients**: Query `communication_recipients` per `communication_id`
- **Fetch Profili**: Query `profiles` per tutti i `user_id` unici
- **Formattazione**: Merge recipients con profili per includere nome, email, telefono
- **Nome Completo**: `name` = `nome + cognome` o `email` o "Nome non disponibile"
- **Ordinamento**: Recipients ordinati per `created_at` DESC

---

## 🔄 Flusso Logico

1. **Autenticazione e Autorizzazione**:
   - Verifica user
   - Verifica ruolo staff (`admin`, `pt`, `trainer`, `staff`)

2. **Validazione**:
   - Verifica `communication_id` presente

3. **Fetch Recipients**:
   - Query `communication_recipients` con tutti i campi
   - Filtra per `communication_id`
   - Ordina per `created_at` DESC

4. **Fetch Profili**:
   - Estrae `user_id` unici da recipients
   - Query `profiles` per tutti i `user_id`
   - Crea Map per lookup veloce

5. **Formattazione**:
   - Merge recipients con profili
   - Calcola `name`: `nome + cognome` o `email` o fallback
   - Include `email` e `phone` da profilo

6. **Response**:
   - Ritorna array recipients formattati

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Supabase Server Client (`createClient`)

**Utilizzato da**: Componenti comunicazioni (drawer dettaglio, lista recipients)

---

## ⚠️ Note Tecniche

- **Error Handling**: Se fetch profili fallisce, continua comunque (recipients senza profilo)
- **Nome Fallback**: Se profilo non disponibile, usa "Nome non disponibile"
- **Map Lookup**: Usa `Map` per lookup veloce profili per `user_id`

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
