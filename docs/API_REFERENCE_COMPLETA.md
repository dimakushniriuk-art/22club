# 📚 API Reference Completa - 22Club

**Ultimo Aggiornamento**: 2025-02-02  
**Versione**: 1.0.0

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Autenticazione](#autenticazione)
3. [API Admin](#api-admin)
4. [API Communications](#api-communications)
5. [API Track](#api-track)
6. [API Webhooks](#api-webhooks)
7. [API Push](#api-push)
8. [API Altri](#api-altri)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## Panoramica

22Club espone 24 API routes organizzate per funzionalità. Tutte le routes richiedono autenticazione tranne quelle esplicitamente marcate come "Public".

### Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://your-domain.vercel.app`

### Formato Response

**Success**:

```json
{
  "data": {...},
  "message": "Success message"
}
```

**Error**:

```json
{
  "error": "Error message",
  "details": {...}
}
```

---

## Autenticazione

### Headers Richiesti

```http
Authorization: Bearer <token>
```

Token ottenuto da Supabase Auth:

```typescript
const {
  data: { session },
} = await supabase.auth.getSession()
const token = session?.access_token
```

---

## API Admin

### GET `/api/admin/statistics`

**Autenticazione**: Richiesta (admin only)  
**Documentazione**: [api-admin-statistics-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-admin-statistics-route.md)

Statistiche avanzate admin (utenti, pagamenti, appuntamenti, documenti, comunicazioni).

### GET `/api/admin/roles`

**Autenticazione**: Richiesta (admin only)  
**Documentazione**: [api-admin-roles-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-admin-roles-route.md)

Lista ruoli con conteggio utenti.

### PUT `/api/admin/roles`

**Autenticazione**: Richiesta (admin only)  
**Documentazione**: [api-admin-roles-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-admin-roles-route.md)

Aggiorna ruolo (descrizione, permessi).

### GET `/api/admin/users`

**Autenticazione**: Richiesta (admin only)  
**Documentazione**: [api-admin-users-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-admin-users-route.md)

Lista utenti.

### POST `/api/admin/users`

**Autenticazione**: Richiesta (admin only)  
**Documentazione**: [api-admin-users-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-admin-users-route.md)

Crea nuovo utente.

### PUT `/api/admin/users`

**Autenticazione**: Richiesta (admin only)  
**Documentazione**: [api-admin-users-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-admin-users-route.md)

Aggiorna utente.

### DELETE `/api/admin/users`

**Autenticazione**: Richiesta (admin only)  
**Documentazione**: [api-admin-users-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-admin-users-route.md)

Elimina utente.

---

## API Communications

### GET `/api/communications/list`

**Autenticazione**: Richiesta (staff only)  
**Documentazione**: [api-communications-list-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-communications-list-route.md)

Lista comunicazioni con paginazione e filtri.

### GET `/api/communications/recipients`

**Autenticazione**: Richiesta (staff only)  
**Documentazione**: [api-communications-recipients-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-communications-recipients-route.md)

Lista recipients di una comunicazione.

### GET `/api/communications/list-athletes`

**Autenticazione**: Richiesta (staff only)  
**Documentazione**: [api-communications-list-athletes-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-communications-list-athletes-route.md)

Lista atleti attivi per selezione destinatari.

### POST `/api/communications/send`

**Autenticazione**: Richiesta (staff only)  
**Documentazione**: [api-communications-send-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-communications-send-route.md)

Invia comunicazione (push/email/sms/all).

### POST `/api/communications/check-stuck`

**Autenticazione**: Richiesta (staff only)  
**Documentazione**: [api-communications-check-stuck-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-communications-check-stuck-route.md)

Verifica e reset comunicazioni bloccate.

### POST `/api/communications/count-recipients`

**Autenticazione**: Richiesta (staff only)  
**Documentazione**: [api-communications-count-recipients-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-communications-count-recipients-route.md)

Conta destinatari in base al filtro.

---

## API Track

### GET `/api/track/email-open/[id]`

**Autenticazione**: Non richiesta (pixel tracking)  
**Documentazione**: [api-track-email-open-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-track-email-open-route.md)

Pixel tracking apertura email (PNG 1x1).

---

## API Webhooks

### POST `/api/webhooks/email`

**Autenticazione**: Non richiesta (webhook Resend)  
**Documentazione**: [api-webhooks-email-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-webhooks-email-route.md)

Webhook Resend per delivery status email.

### POST `/api/webhooks/sms`

**Autenticazione**: Non richiesta (webhook Twilio)  
**Documentazione**: [api-webhooks-sms-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-webhooks-sms-route.md)

Webhook Twilio per delivery status SMS.

---

## API Push

### GET `/api/push/vapid-key`

**Autenticazione**: Non richiesta  
**Documentazione**: [api-push-vapid-key-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-push-vapid-key-route.md)

VAPID public key per push notifications.

### POST `/api/push/subscribe`

**Autenticazione**: Richiesta (implicita tramite userId)  
**Documentazione**: [api-push-subscribe-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-push-subscribe-route.md)

Registra subscription push.

### POST `/api/push/unsubscribe`

**Autenticazione**: Richiesta (implicita tramite userId)  
**Documentazione**: [api-push-unsubscribe-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-push-unsubscribe-route.md)

Rimuove subscription push.

---

## API Altri

### GET `/api/cron/notifications`

**Autenticazione**: Bearer token (`CRON_SECRET`)  
**Documentazione**: [api-cron-notifications-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-cron-notifications-route.md)

Cronjob notifiche giornaliere.

### POST `/api/cron/notifications`

**Autenticazione**: Bearer token (`CRON_SECRET`)  
**Documentazione**: [api-cron-notifications-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-cron-notifications-route.md)

Notifiche manuali e test.

### GET `/api/dashboard/appointments`

**Autenticazione**: Non richiesta (rate limited)  
**Documentazione**: [api-dashboard-appointments-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-dashboard-appointments-route.md)

Appuntamenti in arrivo per dashboard.

### GET `/api/auth/context`

**Autenticazione**: Richiesta  
**Documentazione**: [api-auth-context-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-auth-context-route.md)

Recupera profilo utente.

### POST `/api/auth/context`

**Autenticazione**: Richiesta  
**Documentazione**: [api-auth-context-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-auth-context-route.md)

Aggiorna ruolo e organizzazione.

### GET `/api/health`

**Autenticazione**: Non richiesta  
**Documentazione**: [api-health-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-health-route.md)

Health check endpoint.

### GET `/api/web-vitals`

**Autenticazione**: Non richiesta  
**Documentazione**: [api-web-vitals-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-web-vitals-route.md)

Web vitals endpoint.

### GET `/api/icon-144x144`

**Autenticazione**: Non richiesta  
**Documentazione**: [api-icon-144x144-route.md](../ai_memory/Documentazione%20tecnica%20delle%20funzioni/api-icon-144x144-route.md)

Icona 144x144 placeholder.

---

## Error Handling

### Status Codes

- `200`: Success
- `400`: Bad Request (validation error)
- `401`: Unauthorized (non autenticato)
- `403`: Forbidden (non autorizzato)
- `404`: Not Found
- `408`: Request Timeout
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error

### Error Response Format

```json
{
  "error": "Error message",
  "details": {
    "field": "validation error"
  }
}
```

---

## Rate Limiting

### Limiti Standard

- **API Routes**: 30 richieste/minuto per IP
- **Cron Endpoints**: Bearer token required
- **Webhooks**: No rate limit (signature verification)

---

## Documentazione Dettagliata

Per documentazione completa di ogni endpoint, consulta i file in:
`ai_memory/Documentazione tecnica delle funzioni/api-*.md`

---

**Ultimo aggiornamento**: 2025-02-02
