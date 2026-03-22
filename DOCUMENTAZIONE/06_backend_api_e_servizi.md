# ⚙️ 06 - Backend: API e Servizi

> **Analisi API Routes Next.js e servizi backend**

---

## 📡 API ROUTES

### Struttura Directory

```
src/app/api/
├── admin/
│   ├── roles/route.ts
│   ├── statistics/route.ts
│   └── users/
│       ├── route.ts
│       ├── import/route.ts
│       ├── reset-password/route.ts
│       ├── trainer/route.ts
│       └── verify-login/route.ts
│
├── athletes/
│   ├── [id]/route.ts
│   └── create/route.ts
│
├── auth/
│   └── context/route.ts
│
├── communications/
│   ├── check-stuck/route.ts
│   ├── count-recipients/route.ts
│   ├── list/route.ts
│   ├── list-athletes/route.ts
│   ├── recipients/route.ts
│   └── send/route.ts
│
├── cron/
│   └── notifications/route.ts
│
├── dashboard/
│   └── appointments/route.ts
│
├── exercises/route.ts
│
├── health/route.ts
│
├── push/
│   ├── subscribe/route.ts
│   ├── unsubscribe/route.ts
│   └── vapid-key/route.ts
│
├── settings/route.ts
│
├── track/
│   └── email-open/[id]/route.ts
│
├── web-vitals/route.ts
│
└── webhooks/
    ├── email/route.ts
    └── sms/route.ts
```

---

## 🔍 API PRINCIPALI ANALIZZATE

### Health Check

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      memory: { status: 'ok', used: process.memoryUsage() },
      database: { status: 'ok', connected: true },  // TODO: real check
      api: { status: 'ok', responseTime: ... },
    },
  })
}
```

**Nota**: Database health check è placeholder

### Auth Context

```typescript
// src/app/api/auth/context/route.ts
// Sincronizza ruolo/org_id tra client e server
// Usato da setSupabaseContext() in client.ts
```

---

## 🔧 SERVIZI BACKEND

### Supabase Client

```
src/lib/supabase/
├── client.ts      # Browser client (singleton)
├── server.ts      # Server client (per request)
├── middleware.ts  # Middleware client
└── types.ts       # Database types
```

### Logger

```
src/lib/logger/
├── index.ts              # createLogger factory
├── console-replacement.ts # Override console
└── README.md             # Documentazione
```

### Cache

```
src/lib/cache/
├── cache-strategies.ts    # statsCache, frequentQueryCache
├── local-storage-cache.ts # Cache persistente browser
└── use-cached-query.ts    # Hook per React Query
```

### Communications

```
src/lib/communications/
├── service.ts           # Servizio principale
├── email.ts             # Invio email
├── sms.ts               # Invio SMS
├── push.ts              # Push notifications
├── scheduler.ts         # Scheduling
├── recipients.ts        # Gestione destinatari
└── email-template.ts    # Template email
```

### Notifications

```
src/lib/notifications/
├── push.ts              # Web push
├── scheduler.ts         # Scheduling
└── athlete-registration.ts # Notifica registrazione
```

### Validations

```
src/lib/validations/
├── allenamento.ts
├── appointment.ts
├── cliente.ts
├── dashboard.ts
├── invito.ts
├── video-url.ts
└── workout-target.ts
```

---

## 🔄 PATTERN API

### Struttura Standard

```typescript
// route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Logica
    const { data, error } = await supabase.from('table').select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // Simile con body parsing
  const body = await request.json()
  // Validazione
  // Insert/Update
}
```

---

## 📊 STATISTICHE API

| Categoria      | Endpoints | Metodi                 |
| -------------- | --------- | ---------------------- |
| Admin          | 7         | GET, POST, PUT, DELETE |
| Athletes       | 2         | GET, POST, PATCH       |
| Communications | 6         | GET, POST              |
| Push           | 3         | GET, POST, DELETE      |
| Webhooks       | 2         | POST                   |
| Altri          | 9         | Vari                   |
| **Totale**     | **29**    | -                      |

---

## ⚠️ PROBLEMI RILEVATI

### SEG-008: Health Check Incompleto

```
🧠 IMPROVE
File: src/app/api/health/route.ts
Area: API
Motivo: TODO: Add actual DB health check (riga 23)
Impatto: BASSO - Health check base funziona
Urgenza: BASSA
Azione: Aggiungere ping a Supabase
```

### Pattern Mancanti

```
Non trovati:
├── Rate limiting globale
├── Request validation centralizzata
├── Error handling standardizzato
└── API versioning
```

---

## 📊 VALUTAZIONE

| Aspetto             | Rating    | Note                     |
| ------------------- | --------- | ------------------------ |
| Chiarezza logica    | ★★★★☆     | Struttura RESTful ok     |
| Robustezza          | ★★★☆☆     | Error handling variabile |
| Debito tecnico      | **MEDIO** | Manca standardizzazione  |
| Rischio regressioni | **BASSO** | API isolate              |

---

## 🔗 DIPENDENZE

```
API dipendono da:
├── Supabase server client
├── RLS policies (autorizzazione)
├── Validations (input)
└── Logger (logging)
```
