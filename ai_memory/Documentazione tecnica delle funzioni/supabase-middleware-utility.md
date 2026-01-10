# Utility: Supabase Middleware Client

## 📋 Descrizione

Utility per creazione client Supabase in middleware Next.js. Gestisce cookies in middleware context, crea server client con gestione cookies request/response.

## 📁 Percorso File

`src/lib/supabase/middleware.ts`

## 📦 Dipendenze

- `@supabase/ssr` (`createServerClient`, `CookieOptions`)
- `next/server` (`NextResponse`, `NextRequest`)
- `./types` (`Database`)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`createClient(request)`**: Crea client Supabase per middleware
   - Usa cookies da NextRequest
   - Configura get/set/remove cookies su request e response
   - Ritorna { supabase, response }

### Gestione Cookies

- **get**: Legge cookie da request.cookies
- **set**: Imposta cookie in request.cookies e response.cookies
- **remove**: Rimuove cookie da request e response

## 🔍 Note Tecniche

- Funzione sincrona (non async)
- Gestisce sia request che response cookies
- Ritorna response modificata per middleware chain

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
