# Utility: Rate Limit

## 📋 Descrizione

Utility per rate limiting in middleware Next.js. Limita numero richieste per client in finestra temporale, gestisce headers rate limit.

## 📁 Percorso File

`src/lib/rate-limit.ts`

## 📦 Dipendenze

- `next/server` (`NextRequest`, `NextResponse`)

## ⚙️ Funzionalità

### Interfacce Esportate

- `RateLimitConfig`: Configurazione (windowMs, maxRequests)
- `RateLimitResult`: Risultato (response, headers)

### Funzioni Principali

1. **`rateLimit(config?)`**: Crea middleware rate limit
   - Default: 60 richieste per 60 secondi
   - Identifica client: x-forwarded-for, x-real-ip, user-agent
   - Usa Map in-memory per contatori
   - Ritorna NextResponse 429 se limite superato
   - Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

## 🔍 Note Tecniche

- Store in-memory (Map): non persistente tra riavvii
- Identificazione client: IP o user-agent come fallback
- Headers standard rate limit

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
