# Utility: Supabase Server Client

## 📋 Descrizione

Utility per creazione client Supabase server-side. Gestisce cookies per SSR, crea server client con gestione cookies Next.js.

## 📁 Percorso File

`src/lib/supabase/server.ts`

## 📦 Dipendenze

- `@supabase/ssr` (`createServerClient`, `CookieOptions`)
- `next/headers` (`cookies`)
- `@/types/supabase` (`Database`)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`createClient()`**: Crea client Supabase server-side
   - Usa cookies() di Next.js per gestione session
   - Configura get/set/remove cookies
   - Gestisce errori cookie (non bloccanti)

### Gestione Cookies

- **get**: Legge cookie da cookieStore
- **set**: Imposta cookie in cookieStore e response
- **remove**: Rimuove cookie (con fallback a maxAge: 0)

## 🔍 Note Tecniche

- Async function (usa await cookies())
- Gestione errori cookie: try/catch con warning
- Supporta CookieOptions per configurazione avanzata

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
