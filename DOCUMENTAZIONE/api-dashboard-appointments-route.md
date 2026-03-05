# 📚 Documentazione Tecnica: API Dashboard Appointments

**Percorso**: `src/app/api/dashboard/appointments/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per recuperare appuntamenti in arrivo per dashboard. Fornisce GET con rate limiting, caching, e validazione Zod.

---

## 🔧 Endpoints

### 1. `GET /api/dashboard/appointments`

**Classificazione**: API Route, GET Handler, Public (rate limited)  
**Autenticazione**: Non richiesta  
**Autorizzazione**: Nessuna

**Query Parameters**: Nessuno

**Response Success** (200):

```typescript
// Validato con AppointmentsResponseSchema
{
  appointments: Array<Appointment>
  // ... altri campi definiti nello schema
}
```

**Response Headers**:

- `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`

**Response Error**:

- `400`: Validation error (Zod schema)
- `429`: Rate limit exceeded (max 30 richieste/minuto per IP)
- `500`: Errore server

**Descrizione**: Endpoint appuntamenti dashboard con:

- **Rate Limiting**: Max 30 richieste/minuto per IP
- **Caching**: Cache pubblica con `s-maxage=60` (60 secondi) e `stale-while-revalidate=120`
- **Revalidation**: `revalidate = 60` (ISR ogni 60 secondi)
- **Validation**: Valida response con Zod schema `AppointmentsResponseSchema`
- **Service Layer**: Usa `getUpcomingAppointments()` per fetch dati

---

## 🔄 Flusso Logico

1. **Rate Limiting**:
   - Verifica rate limit (30 req/min per IP)
   - Se superato, ritorna 429

2. **Fetch Appointments**:
   - Chiama `getUpcomingAppointments()`

3. **Validation**:
   - Valida response con `AppointmentsResponseSchema.parse()`
   - Se validation fallisce, ritorna 400 con dettagli

4. **Response**:
   - Ritorna JSON con headers cache

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextRequest`, `NextResponse`), Service Layer (`getUpcomingAppointments`), Zod Schema (`AppointmentsResponseSchema`), Rate Limiter (`rateLimit`)

**Utilizzato da**: Dashboard componenti (upcoming appointments)

---

## ⚠️ Note Tecniche

- **Rate Limiting**: Usa `rateLimit` utility con window 60s e max 30 requests
- **ISR**: `revalidate = 60` per Incremental Static Regeneration
- **Zod Validation**: Valida response per type safety
- **Cache Headers**: Cache pubblica con stale-while-revalidate per performance

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
