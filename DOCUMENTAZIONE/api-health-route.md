# 📚 Documentazione Tecnica: API Health Check

**Percorso**: `src/app/api/health/route.ts`  
**Tipo Modulo**: Next.js API Route (Server Route)  
**Stato Completamento**: ✅ 100%  
**Ultimo Aggiornamento**: 2025-02-02T00:00:00Z

---

## 📋 Panoramica

API route per health check monitoring. Fornisce GET con informazioni sistema, memoria, database, e uptime.

---

## 🔧 Endpoints

### 1. `GET /api/health`

**Classificazione**: API Route, GET Handler, Public (no auth required)  
**Autenticazione**: Non richiesta  
**Autorizzazione**: Nessuna

**Query Parameters**: Nessuno

**Response Success** (200):

```typescript
{
  status: 'healthy'
  timestamp: string // ISO timestamp
  uptime: number // secondi
  environment: string // NODE_ENV
  version: string // __NEXT_VERSION o 'unknown'
  checks: {
    memory: {
      status: 'ok'
      used: {
        rss: number
        heapTotal: number
        heapUsed: number
        external: number
        arrayBuffers: number
      }
    }
    database: {
      status: 'ok' // TODO: Add actual DB health check
      connected: true
    }
    api: {
      status: 'ok'
      responseTime: number // ms
    }
  }
}
```

**Response Error** (500):

```typescript
{
  status: 'unhealthy'
  timestamp: string
  error: string
}
```

**Descrizione**: Endpoint health check con:

- **Status**: `healthy` o `unhealthy`
- **System Info**: Uptime, environment, version
- **Memory Check**: `process.memoryUsage()` (rss, heapTotal, heapUsed, external, arrayBuffers)
- **Database Check**: Placeholder (TODO: implementare check reale)
- **API Check**: Response time calcolato
- **Error Handling**: In caso di errore, ritorna `unhealthy` con 500

---

## 🔄 Flusso Logico

1. **Start Time**:
   - Registra `startTime` per calcolare response time

2. **Health Checks**:
   - Memory: `process.memoryUsage()`
   - Database: Placeholder (TODO)
   - API: Calcola `Date.now() - startTime`

3. **Response**:
   - Ritorna oggetto health con tutti i checks

4. **Error Handling**:
   - Catch errori, ritorna `unhealthy` con 500

---

## 📊 Dipendenze

**Dipende da**: Next.js (`NextResponse`), Node.js (`process`)

**Utilizzato da**: Monitoring services (es. Uptime Robot, Pingdom), load balancers

---

## ⚠️ Note Tecniche

- **No Auth**: Endpoint pubblico (necessario per monitoring esterno)
- **TODO**: Database check non implementato (sempre `ok`)
- **Response Time**: Calcolato in millisecondi
- **Memory Usage**: Include tutti i campi di `process.memoryUsage()`

---

**Ultimo aggiornamento**: 2025-02-02T00:00:00Z
