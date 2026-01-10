# 📚 Documentazione Tecnica: API Communications List Athletes

**Percorso**: `src/app/api/communications/list-athletes/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per recuperare lista atleti attivi per selezione destinatari. Fornisce GET con dati formattati (id, name, email) ordinati per cognome/nome.

---

## 🔧 Endpoints

### 1. `GET /api/communications/list-athletes`

**Classificazione**: API Route, GET Handler, Staff Only  
**Autenticazione**: Richiesta (user)  
**Autorizzazione**: Solo ruoli `admin`, `pt`, `trainer`, `staff`

**Query Parameters**: Nessuno

**Response Success** (200):

```typescript
{
  athletes: Array<{
    id: string // user_id
    name: string // nome completo o email o "Nome non disponibile"
    email: string | null
  }>
}
```

**Response Error**:

- `401`: Non autenticato
- `403`: Non autorizzato (non staff)
- `500`: Errore server

**Descrizione**: Endpoint lista atleti con:

- **Fetch Atleti**: Query `profiles` con ruolo `atleta` o `athlete`
- **Filtro Attivi**: Solo utenti con `stato === 'attivo'`
- **Ordinamento**: Per `cognome` ASC, poi `nome` ASC
- **Formattazione**: `name` = `nome + cognome` o `email` o "Nome non disponibile"
- **Campi**: Solo `user_id`, `nome`, `cognome`, `email`

---

## 🔄 Flusso Logico

1. **Autenticazione e Autorizzazione**:
   - Verifica user
   - Verifica ruolo staff

2. **Fetch Atleti**:
   - Query `profiles` con `.or('role.eq.atleta,role.eq.athlete')`
   - Filtra `stato === 'attivo'`
   - Ordina per `cognome` ASC, `nome` ASC

3. **Formattazione**:
   - Mappa atleti a formato `{ id, name, email }`
   - Calcola `name`: `nome + cognome` o `email` o fallback

4. **Response**:
   - Ritorna array atleti formattati

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Supabase Server Client (`createClient`)

**Utilizzato da**: Componenti selezione destinatari comunicazioni

---

## ⚠️ Note Tecniche

- **Role Filter**: Supporta sia `atleta` che `athlete` (compatibilità)
- **Active Only**: Solo atleti attivi (esclude inattivi/sospesi)
- **Name Fallback**: Se nome/cognome mancanti, usa email o "Nome non disponibile"

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
