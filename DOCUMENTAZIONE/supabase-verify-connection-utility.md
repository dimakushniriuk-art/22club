# Utility: Supabase Verify Connection

## 📋 Descrizione

Utility per verifica connessione Supabase e stato database. Utile per debugging e diagnostica, verifica sessione, profilo utente.

## 📁 Percorso File

`src/lib/supabase/verify-connection.ts`

## 📦 Dipendenze

- `./client` (`supabase`)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`verifySupabaseConnection()`**: Verifica stato connessione
   - Verifica sessione attiva
   - Verifica esistenza profilo per user_id
   - Ritorna ConnectionStatus con dettagli

2. **`logConnectionStatus()`**: Log stato connessione
   - Chiama verifySupabaseConnection
   - Log dettagliato in console con console.group

### Interfacce Esportate

- `ConnectionStatus`: Stato connessione (connected, hasSession, userId, profileExists, error, details)

## 🔍 Note Tecniche

- Verifica sessione: supabase.auth.getSession()
- Verifica profilo: query profiles table
- Gestione errori specifici (PGRST116 = profilo non trovato)

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
