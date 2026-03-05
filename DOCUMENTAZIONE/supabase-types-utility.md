# Utility: Supabase Types

## 📋 Descrizione

Utility per tipi TypeScript Supabase. Definisce tipi Database generati da Supabase CLI, include tutte le tabelle con Row/Insert/Update types.

## 📁 Percorso File

`src/lib/supabase/types.ts`

## 📦 Dipendenze

- Nessuna dipendenza esterna (solo tipi TypeScript)

## ⚙️ Funzionalità

### Tipi Esportati

1. **`Json`**: Tipo JSON generico
2. **`Database`**: Tipo database completo con:
   - `__InternalSupabase`: Versione PostgREST
   - `public.Tables`: Tutte le tabelle con Row/Insert/Update/Relationships

### Tabelle Incluse

- `appointments`, `chat_messages`, `communications`, `communication_recipients`, `profiles`, `user_push_tokens`, e molte altre

## 🔍 Note Tecniche

- Tipi generati automaticamente da Supabase CLI
- Versione PostgREST: 13.0.5
- Include Relationships per foreign keys

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
