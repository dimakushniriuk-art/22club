# Utility: Supabase Client

## 📋 Descrizione

Utility per creazione client Supabase browser-side. Supporta mock client per sviluppo quando Supabase non è configurato, gestisce context con ruolo e organizzazione.

## 📁 Percorso File

`src/lib/supabase/client.ts`

## 📦 Dipendenze

- `@supabase/ssr` (`createBrowserClient`)
- `@supabase/supabase-js` (`SupabaseClient`)
- `@/types/user` (`UserRole`)
- `@/types/supabase` (`Database`)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`createClient()`**: Crea client Supabase browser-side
   - Verifica configurazione env vars
   - Se non configurato o valori mock: usa mock client
   - Altrimenti: usa createBrowserClient con URL e ANON_KEY

2. **`setSupabaseContext(role, org_id)`**: Imposta context Supabase
   - Chiama API `/api/auth/context` con headers personalizzati
   - Headers: x-user-role, x-org-id

### Export

- **`supabase`**: Client Supabase singleton (creato automaticamente)

## 🔍 Note Tecniche

- Mock client: ritorna mock object con metodi Supabase per sviluppo
- Verifica valori mock: 'mock-project.supabase.co', 'bypass.supabase.co', ecc.
- Context: sincronizza ruolo e org_id con server

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
