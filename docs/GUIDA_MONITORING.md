# 📊 Guida Monitoring - 22Club

**Ultimo Aggiornamento**: 2025-02-02  
**Versione**: 1.0.0

---

## 📋 Indice

1. [Panoramica](#panoramica)
2. [Health Check](#health-check)
3. [Error Tracking (Sentry)](#error-tracking-sentry)
4. [Performance Monitoring](#performance-monitoring)
5. [Database Monitoring](#database-monitoring)
6. [Logging](#logging)
7. [Alerting](#alerting)

---

## Panoramica

22Club implementa monitoring multi-livello:

- **Health Check**: `/api/health` endpoint
- **Error Tracking**: Sentry (opzionale)
- **Performance**: Web Vitals, Lighthouse
- **Database**: Supabase Dashboard

---

## Health Check

### Endpoint

**GET `/api/health`**:

```json
{
  "status": "healthy",
  "timestamp": "2025-02-02T00:00:00Z",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "memory": { "status": "ok", "used": {...} },
    "database": { "status": "ok", "connected": true },
    "api": { "status": "ok", "responseTime": 5 }
  }
}
```

### Monitoring Services

**Uptime Robot**:

- URL: `https://your-domain.vercel.app/api/health`
- Interval: 5 minuti
- Alert: Email/SMS se down

**Vercel Health Check**:

- Automatico su Vercel
- Dashboard > Analytics > Health

---

## Error Tracking (Sentry)

### Setup

**Installazione**:

```bash
npm install @sentry/nextjs
```

**Configurazione**:

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

**Environment Variables**:

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/22club
SENTRY_DSN=https://xxx@sentry.io/22club
```

### Error Boundaries

```typescript
// app/error.tsx
'use client'

export default function Error({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return <div>Error: {error.message}</div>
}
```

---

## Performance Monitoring

### Web Vitals

**Automatic Tracking**:

```typescript
// next.config.ts
export default {
  experimental: {
    instrumentationHook: true,
  },
}
```

**Custom Tracking**:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Invia a analytics service
  console.log(metric)
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getLCP(sendToAnalytics)
```

### Lighthouse CI

**GitHub Actions**:

```yaml
# .github/workflows/performance.yml
- name: Run Lighthouse CI
  run: npm run lighthouse:ci
```

---

## Database Monitoring

### Supabase Dashboard

**Metrics Disponibili**:

- Query performance
- Connection pool
- Database size
- API requests

**Accesso**:

- Supabase Dashboard > Project > Database > Performance

### Custom Queries

**Slow Queries**:

```sql
SELECT * FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

**Connection Pool**:

```sql
SELECT count(*) FROM pg_stat_activity;
```

---

## Logging

### Structured Logging

**Logger Utility**:

```typescript
// src/lib/logger
import { logger } from '@/lib/logger'

logger.info('User logged in', { userId })
logger.error('Database error', { error })
```

### Log Levels

- **Error**: Errori critici
- **Warn**: Warning
- **Info**: Informazioni generali
- **Debug**: Debug (solo development)

---

## Alerting

### GitHub Actions

**Workflow Failures**:

- Email automatica su failure
- Slack notification (opzionale)

### Sentry Alerts

**Configurazione**:

- Sentry Dashboard > Alerts
- Threshold: >10 errors/minuto
- Notification: Email/Slack

---

## Best Practices

1. **Monitor Health**: Check `/api/health` regolarmente
2. **Track Errors**: Sentry per error tracking
3. **Performance**: Web Vitals monitoring
4. **Database**: Monitor Supabase dashboard
5. **Logging**: Structured logging per debugging

---

**Ultimo aggiornamento**: 2025-02-02
