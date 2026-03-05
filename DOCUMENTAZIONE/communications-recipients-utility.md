# Utility: Communications Recipients

## 📋 Descrizione

Utility per selezione destinatari comunicazioni. Gestisce logica filtri destinatari (role, athlete_ids, all_users), verifica token push attivi.

## 📁 Percorso File

`src/lib/communications/recipients.ts`

## 📦 Dipendenze

- `@supabase/supabase-js` (`createClient`)
- `@/types/supabase` (Database)
- `./service` (RecipientFilter)

## ⚙️ Funzionalità

### Funzioni Principali

1. **`getRecipientsByFilter(filter)`**: Ottiene destinatari in base ai filtri
   - Filtra per ruolo (gestisce atleta/athlete come sinonimi)
   - Filtra per atleti specifici (athlete_ids)
   - Supporta all_users (tutti gli utenti attivi)
   - Verifica token push attivi per filtrare destinatari push

### Interfacce Esportate

- `Recipient`: Destinatario (user_id, email, phone, role, has_push_token)

## 🔍 Note Tecniche

- Filtra solo utenti attivi (stato = 'attivo')
- Gestisce sinonimi ruolo: atleta/athlete
- Verifica token push per filtrare destinatari push

## ✅ Stato Utility

- ✅ **Completato**: Utility funzionante e utilizzata in produzione
